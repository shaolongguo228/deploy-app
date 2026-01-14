import { ServerConfig, DeployConfig, EnvironmentGroup } from '../types';

// Mock data for browser dev mode (when ipcRenderer is not available)
const mockServers: ServerConfig[] = [];
const mockProjects: DeployConfig[] = [];
const mockGroups: EnvironmentGroup[] = [{ id: 'default', name: '生产环境', color: '#22c55e' }];

export const storageService = {
    // ===== Environment Groups =====
    async getGroups(): Promise<EnvironmentGroup[]> {
        if (!window.ipcRenderer) {
            return mockGroups;
        }
        return window.ipcRenderer.invoke('get-groups');
    },

    async saveGroup(group: EnvironmentGroup): Promise<EnvironmentGroup[]> {
        if (!window.ipcRenderer) {
            const idx = mockGroups.findIndex(g => g.id === group.id);
            if (idx > -1) mockGroups[idx] = group;
            else mockGroups.push(group);
            return mockGroups;
        }
        return window.ipcRenderer.invoke('save-group', group);
    },

    async deleteGroup(id: string): Promise<EnvironmentGroup[]> {
        if (!window.ipcRenderer) {
            const idx = mockGroups.findIndex(g => g.id === id);
            if (idx > -1) mockGroups.splice(idx, 1);
            return mockGroups;
        }
        return window.ipcRenderer.invoke('delete-group', id);
    },

    // ===== Servers =====
    async getServers(): Promise<ServerConfig[]> {
        if (!window.ipcRenderer) {
            console.warn('IPC not available - using mock data');
            return mockServers;
        }
        return window.ipcRenderer.invoke('get-servers');
    },

    async saveServer(server: ServerConfig): Promise<ServerConfig[]> {
        if (!window.ipcRenderer) {
            const idx = mockServers.findIndex(s => s.id === server.id);
            if (idx > -1) mockServers[idx] = server;
            else mockServers.push(server);
            return mockServers;
        }
        return window.ipcRenderer.invoke('save-server', server);
    },

    async deleteServer(id: string): Promise<ServerConfig[]> {
        if (!window.ipcRenderer) {
            const idx = mockServers.findIndex(s => s.id === id);
            if (idx > -1) mockServers.splice(idx, 1);
            return mockServers;
        }
        return window.ipcRenderer.invoke('delete-server', id);
    },

    // ===== Projects =====
    async getProjects(): Promise<DeployConfig[]> {
        if (!window.ipcRenderer) {
            return mockProjects;
        }
        return window.ipcRenderer.invoke('get-projects');
    },

    async saveProject(project: DeployConfig): Promise<DeployConfig[]> {
        if (!window.ipcRenderer) {
            const idx = mockProjects.findIndex(p => p.id === project.id);
            if (idx > -1) mockProjects[idx] = project;
            else mockProjects.push(project);
            return mockProjects;
        }
        return window.ipcRenderer.invoke('save-project', project);
    },

    async deleteProject(id: string): Promise<DeployConfig[]> {
        if (!window.ipcRenderer) {
            const idx = mockProjects.findIndex(p => p.id === id);
            if (idx > -1) mockProjects.splice(idx, 1);
            return mockProjects;
        }
        return window.ipcRenderer.invoke('delete-project', id);
    }
};
