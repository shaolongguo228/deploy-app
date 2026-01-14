import { Client } from 'ssh2';
import fs from 'fs-extra';
import path from 'path';
import { ServerConfig } from '../../types';

export class SSHService {
    private client: Client;

    constructor() {
        this.client = new Client();
    }

    connect(server: ServerConfig): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.on('ready', () => {
                resolve();
            }).on('error', (err) => {
                reject(err);
            }).connect({
                host: server.host,
                port: server.port,
                username: server.username,
                password: server.password,
                privateKey: server.privateKeyPath ? fs.readFileSync(server.privateKeyPath) : undefined
            });
        });
    }

    executeCommand(command: string, onLog: (data: string) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.exec(command, (err, stream) => {
                if (err) return reject(err);

                stream.on('close', (code: number, _signal: any) => {
                    if (code === 0) resolve();
                    else reject(new Error(`Command failed with code ${code}`));
                }).on('data', (data: any) => {
                    onLog(data.toString());
                }).stderr.on('data', (data: any) => {
                    onLog(`[STDERR] ${data.toString()}`);
                });
            });
        });
    }

    /**
     * 上传单个文件
     */
    uploadFile(localPath: string, remotePath: string, onLog?: (data: string) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.sftp((err, sftp) => {
                if (err) return reject(err);

                onLog?.(`Uploading file: ${path.basename(localPath)}`);

                sftp.fastPut(localPath, remotePath, (err) => {
                    if (err) reject(err);
                    else {
                        onLog?.(`✓ Uploaded: ${path.basename(localPath)}`);
                        resolve();
                    }
                });
            });
        });
    }

    /**
     * 递归上传整个文件夹
     */
    uploadDirectory(localDir: string, remoteDir: string, onLog?: (data: string) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.sftp((err, sftp) => {
                if (err) return reject(err);

                // 先统计文件数量
                const fileList = this.scanDirectory(localDir);
                const totalFiles = fileList.length;
                let uploadedFiles = 0;

                onLog?.(`📊 Found ${totalFiles} files to upload`);

                // 确保远程目录存在，然后开始上传
                this.ensureRemoteDir(sftp, remoteDir)
                    .then(() => {
                        return this.uploadDirectoryRecursive(
                            sftp,
                            localDir,
                            remoteDir,
                            (msg) => {
                                // 如果是文件上传完成的消息，更新进度
                                if (msg.includes('✓')) {
                                    uploadedFiles++;
                                    const percent = Math.round((uploadedFiles / totalFiles) * 100);
                                    onLog?.(`[${uploadedFiles}/${totalFiles}] ${percent}% - ${msg}`);
                                } else {
                                    onLog?.(msg);
                                }
                            }
                        );
                    })
                    .then(() => {
                        onLog?.(`✅ All ${totalFiles} files uploaded successfully`);
                        resolve();
                    })
                    .catch(reject);
            });
        });
    }

    /**
     * 智能上传：自动判断是文件还是文件夹
     */
    uploadPath(localPath: string, remotePath: string, onLog?: (data: string) => void): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                // 检查本地路径是否存在
                if (!fs.existsSync(localPath)) {
                    throw new Error(`Local path does not exist: ${localPath}`);
                }

                const stats = fs.statSync(localPath);

                if (stats.isDirectory()) {
                    onLog?.(`📁 Uploading directory: ${path.basename(localPath)}`);
                    await this.uploadDirectory(localPath, remotePath, onLog);
                } else {
                    const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
                    onLog?.(`📄 Uploading file: ${path.basename(localPath)} (${fileSizeMB} MB)`);
                    await this.uploadFile(localPath, remotePath, onLog);
                }

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 扫描目录，获取所有文件列表（用于统计）
     */
    private scanDirectory(dir: string): string[] {
        const files: string[] = [];
        const items = fs.readdirSync(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stats = fs.statSync(fullPath);

            if (stats.isDirectory()) {
                files.push(...this.scanDirectory(fullPath));
            } else {
                files.push(fullPath);
            }
        }

        return files;
    }

    /**
     * 递归上传文件夹内容
     */
    private uploadDirectoryRecursive(
        sftp: any,
        localDir: string,
        remoteDir: string,
        onLog?: (data: string) => void
    ): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const items = fs.readdirSync(localDir);

                for (const item of items) {
                    const localPath = path.join(localDir, item);
                    const remotePath = path.posix.join(remoteDir, item); // 使用 posix 路径
                    const stats = fs.statSync(localPath);

                    if (stats.isDirectory()) {
                        // 创建远程子目录
                        await this.ensureRemoteDir(sftp, remotePath);
                        // 递归上传子目录
                        await this.uploadDirectoryRecursive(sftp, localPath, remotePath, onLog);
                    } else {
                        // 上传文件
                        await new Promise<void>((res, rej) => {
                            const fileName = item;
                            const fileSize = (stats.size / 1024).toFixed(1); // KB

                            sftp.fastPut(localPath, remotePath, (err: any) => {
                                if (err) {
                                    onLog?.(`❌ Failed: ${fileName} - ${err.message}`);
                                    rej(err);
                                } else {
                                    onLog?.(`✓ ${fileName} (${fileSize} KB)`);
                                    res();
                                }
                            });
                        });
                    }
                }

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 确保远程目录存在，不存在则创建
     */
    private ensureRemoteDir(sftp: any, remoteDir: string): Promise<void> {
        return new Promise((resolve, reject) => {
            sftp.stat(remoteDir, (err: any) => {
                if (err) {
                    // 目录不存在，创建它
                    sftp.mkdir(remoteDir, { mode: 0o755 }, (mkdirErr: any) => {
                        if (mkdirErr) {
                            // 可能是父目录不存在，递归创建
                            const parentDir = path.posix.dirname(remoteDir);
                            if (parentDir !== remoteDir) {
                                this.ensureRemoteDir(sftp, parentDir)
                                    .then(() => this.ensureRemoteDir(sftp, remoteDir))
                                    .then(resolve)
                                    .catch(reject);
                            } else {
                                reject(mkdirErr);
                            }
                        } else {
                            resolve();
                        }
                    });
                } else {
                    // 目录已存在
                    resolve();
                }
            });
        });
    }

    disconnect() {
        this.client.end();
    }
}
