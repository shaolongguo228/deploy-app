import { BrowserWindow } from 'electron';
import path from 'path';
import { DeployConfig, ServerConfig } from '../../types';
import { SSHService } from './ssh';
import { LocalExecutor } from './local';

export class DeploymentOrchestrator {
    constructor(private window: BrowserWindow) { }

    private log(message: string, type: 'info' | 'error' | 'success' = 'info') {
        this.window.webContents.send('deploy-log', { message, type, timestamp: new Date().toISOString() });
    }

    async deploy(project: DeployConfig, server: ServerConfig) {
        const ssh = new SSHService();
        const shouldUpload = project.enableUpload !== false; // 默认为 true

        try {
            this.log(`Starting deployment for ${project.projectName}...`);

            // 1. Pre-deploy commands (Local) - 按顺序执行
            if (project.preDeployCommands?.length) {
                for (let i = 0; i < project.preDeployCommands.length; i++) {
                    const cmd = project.preDeployCommands[i];
                    if (cmd.enabled && cmd.command?.trim()) {
                        this.log(`Executing pre-deploy command #${i + 1}: ${cmd.command}`);
                        await LocalExecutor.execute(cmd.command, project.localPath, (msg) => this.log(msg));
                    }
                }
            }

            // 只有在需要上传文件时才执行构建和上传
            if (shouldUpload) {
                // 2. Build (Local) - 必须在上传前完成
                if (project.buildCommand?.trim()) {
                    this.log(`Executing build command: ${project.buildCommand}`);
                    await LocalExecutor.execute(project.buildCommand, project.localPath, (msg) => this.log(msg));
                    this.log('Build completed successfully', 'success');
                }

                // 3. Connect to Server
                this.log(`Connecting to server ${server.host}:${server.port}...`);
                await ssh.connect(server);
                this.log(`Connected to ${server.host}`, 'success');

                // 4. Upload
                if (project.artifactPath?.trim()) {
                    const localArtifact = path.join(project.localPath, project.artifactPath);
                    // 使用 posix 路径构建远程路径（Linux 服务器）
                    const remoteArtifact = path.posix.join(project.remotePath, path.basename(project.artifactPath));

                    // 验证本地路径存在
                    const fs = await import('fs-extra');
                    if (!fs.default.existsSync(localArtifact)) {
                        throw new Error(`Artifact not found: ${localArtifact}`);
                    }

                    this.log(`📤 Starting upload: ${localArtifact} → ${remoteArtifact}`);
                    await ssh.uploadPath(localArtifact, remoteArtifact, (msg) => this.log(msg));
                    this.log('✅ Upload complete', 'success');
                }
            } else {
                // 不上传文件模式，直接连接服务器执行远程命令
                this.log('Skipping build and upload (enableUpload is disabled)');
                this.log(`Connecting to server ${server.host}...`);
                await ssh.connect(server);
                this.log(`Connected to ${server.host}`);
            }

            // 5. Post-deploy commands (Remote) - 按顺序执行
            if (project.postDeployCommands?.length) {
                for (let i = 0; i < project.postDeployCommands.length; i++) {
                    const cmd = project.postDeployCommands[i];
                    if (cmd.enabled && cmd.command?.trim()) {
                        this.log(`Executing post-deploy command #${i + 1}: ${cmd.command}`);
                        await ssh.executeCommand(cmd.command, (msg) => this.log(msg));
                    }
                }
            }

            // 6. Start command (Remote)
            if (project.startCommand?.trim()) {
                this.log(`Executing remote start command: ${project.startCommand}`);
                await ssh.executeCommand(project.startCommand, (msg) => this.log(msg));
            }

            this.log('Deployment finished successfully!', 'success');

            // 7. Auto view log if enabled - 不阻塞部署完成
            if (project.autoViewLog && project.logCommand?.trim()) {
                this.log('Auto-viewing logs...');
                // 使用非阻塞方式执行，设置超时
                try {
                    await Promise.race([
                        ssh.executeCommand(project.logCommand, (msg) => this.log(msg)),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Log viewing timeout')), 5000))
                    ]);
                } catch (e: any) {
                    this.log(`Log viewing ended: ${e.message}`, 'info');
                }
            }

        } catch (error: any) {
            this.log(`Deployment failed: ${error.message}`, 'error');
            throw error;
        } finally {
            ssh.disconnect();
        }
    }

    async viewLog(project: DeployConfig, server: ServerConfig) {
        if (!project.logCommand?.trim()) {
            this.log('No log command configured', 'error');
            return;
        }

        const ssh = new SSHService();
        try {
            this.log(`Connecting to server ${server.host} for log viewing...`);
            await ssh.connect(server);
            this.log(`Executing log command: ${project.logCommand}`);

            // 设置超时避免永久阻塞 (5分钟)
            await Promise.race([
                ssh.executeCommand(project.logCommand, (msg) => this.log(msg)),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Log viewing timeout (5min)')), 300000))
            ]);
        } catch (error: any) {
            if (error.message.includes('timeout')) {
                this.log('Log viewing session ended', 'info');
            } else {
                this.log(`Failed to view logs: ${error.message}`, 'error');
                throw error;
            }
        } finally {
            ssh.disconnect();
        }
    }
}
