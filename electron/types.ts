export type AuthType = 'password' | 'key';

// 环境分组
export interface EnvironmentGroup {
    id: string;
    name: string;
    color?: string;  // 可选的颜色标识
}

export interface ServerConfig {
    id: string;
    name: string;
    host: string;
    port: number;
    username: string;
    authType: AuthType;
    password?: string;
    privateKeyPath?: string;
    groupId?: string;  // 所属环境分组ID
}

export type ProjectType = 'java' | 'frontend' | 'python' | 'other';

// 命令项接口 - 用于有序命令列表
export interface CommandItem {
    id: string;
    command: string;
    enabled: boolean;
}

export interface DeployConfig {
    id: string;
    serverId: string;
    projectName: string;
    projectType: ProjectType;

    // Local
    localPath: string;
    buildCommand?: string;
    artifactPath?: string;

    // Pre-deploy commands (Local) - 有序列表
    preDeployCommands?: CommandItem[];

    // Remote
    remotePath: string;

    // Post-deploy commands (Remote) - 有序列表
    postDeployCommands?: CommandItem[];
    startCommand?: string;

    // Upload settings
    enableUpload?: boolean;  // 是否上传文件，false则跳过构建和上传

    // Log related
    logCommand?: string;
    autoViewLog?: boolean;
}
