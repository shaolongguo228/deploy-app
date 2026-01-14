import { DeployConfig, ServerConfig } from '../types';

// 存储当前的日志监听器
let currentLogListener: ((event: any, log: any) => void) | null = null;

export const deploymentService = {
    async deploy(project: DeployConfig, server: ServerConfig): Promise<void> {
        if (!window.ipcRenderer) {
            console.warn('IPC not available - running in browser mode');
            return;
        }
        return window.ipcRenderer.invoke('deploy-project', { project, server });
    },

    async viewLog(project: DeployConfig, server: ServerConfig): Promise<void> {
        if (!window.ipcRenderer) {
            console.warn('IPC not available - running in browser mode');
            return;
        }
        return window.ipcRenderer.invoke('view-log', { project, server });
    },

    onLog(callback: (log: { message: string, type: string, timestamp: string }) => void) {
        if (!window.ipcRenderer) {
            console.warn('IPC not available - running in browser mode');
            return () => { };
        }

        // 如果已有监听器，先移除 (使用 off 而不是 removeListener)
        if (currentLogListener) {
            window.ipcRenderer.off('deploy-log', currentLogListener);
        }

        // 创建新的监听器
        currentLogListener = (_: any, log: any) => callback(log);
        window.ipcRenderer.on('deploy-log', currentLogListener);

        // 返回清理函数
        return () => {
            if (currentLogListener && window.ipcRenderer) {
                window.ipcRenderer.off('deploy-log', currentLogListener);
                currentLogListener = null;
            }
        };
    },

    removeAllLogListeners() {
        if (!window.ipcRenderer) return;
        if (currentLogListener) {
            window.ipcRenderer.off('deploy-log', currentLogListener);
            currentLogListener = null;
        }
    }
};
