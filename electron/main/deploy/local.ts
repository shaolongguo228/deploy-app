import { spawn } from 'child_process';
import * as iconv from 'iconv-lite';

export class LocalExecutor {
    static execute(command: string, cwd: string, onLog: (data: string) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            const isWindows = process.platform === 'win32';

            // 使用 shell 执行命令
            const child = spawn(command, {
                cwd,
                shell: true,
                env: { ...process.env }
            });

            let stderrOutput = '';

            child.stdout.on('data', (data: Buffer) => {
                // Windows 使用 GBK/CP936 编码，其他系统使用 UTF-8
                const text = isWindows ? iconv.decode(data, 'cp936') : data.toString('utf-8');
                onLog(text);
            });

            child.stderr.on('data', (data: Buffer) => {
                const text = isWindows ? iconv.decode(data, 'cp936') : data.toString('utf-8');
                stderrOutput += text;
                onLog(`[STDERR] ${text}`);
            });

            child.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Local command failed with code ${code}.\nDetails:\n${stderrOutput}`));
            });

            child.on('error', (err) => {
                reject(err);
            });
        });
    }
}
