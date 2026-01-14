import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs-extra';

const USER_DATA_PATH = app.getPath('userData');
const SERVERS_FILE = path.join(USER_DATA_PATH, 'servers.json');
const PROJECTS_FILE = path.join(USER_DATA_PATH, 'projects.json');
const GROUPS_FILE = path.join(USER_DATA_PATH, 'groups.json');

export class StorageService {
    constructor() {
        this.init();
    }

    private async init() {
        try {
            await fs.ensureDir(USER_DATA_PATH);
            if (!(await fs.pathExists(SERVERS_FILE))) {
                await fs.writeJson(SERVERS_FILE, []);
            }
            if (!(await fs.pathExists(PROJECTS_FILE))) {
                await fs.writeJson(PROJECTS_FILE, []);
            }
            if (!(await fs.pathExists(GROUPS_FILE))) {
                // 默认创建一个"生产环境"分组
                await fs.writeJson(GROUPS_FILE, [
                    { id: 'default', name: '生产环境', color: '#22c55e' }
                ]);
            }
        } catch (error) {
            console.error('Failed to initialize storage:', error);
        }
    }

    registerHandlers() {
        // ===== Environment Groups =====
        ipcMain.handle('get-groups', async () => {
            try {
                const data = await fs.readJson(GROUPS_FILE);
                return Array.isArray(data) ? data : [];
            } catch {
                return [];
            }
        });

        ipcMain.handle('save-group', async (_, group) => {
            let groups = [];
            try {
                groups = await fs.readJson(GROUPS_FILE);
                if (!Array.isArray(groups)) groups = [];
            } catch {
                groups = [];
            }
            const index = groups.findIndex((g: any) => g.id === group.id);
            if (index > -1) {
                groups[index] = group;
            } else {
                groups.push(group);
            }
            await fs.writeJson(GROUPS_FILE, groups);
            return groups;
        });

        ipcMain.handle('delete-group', async (_, id) => {
            let groups = [];
            try {
                groups = await fs.readJson(GROUPS_FILE);
                if (!Array.isArray(groups)) groups = [];
            } catch {
                groups = [];
            }
            const newGroups = groups.filter((g: any) => g.id !== id);
            await fs.writeJson(GROUPS_FILE, newGroups);
            return newGroups;
        });

        // ===== Servers =====
        ipcMain.handle('get-servers', async () => {
            const data = await fs.readJson(SERVERS_FILE);
            return Array.isArray(data) ? data : [];
        });

        ipcMain.handle('save-server', async (_, server) => {
            let servers = await fs.readJson(SERVERS_FILE);
            if (!Array.isArray(servers)) {
                servers = [];
            }
            const index = servers.findIndex((s: any) => s.id === server.id);
            if (index > -1) {
                servers[index] = server;
            } else {
                servers.push(server);
            }
            await fs.writeJson(SERVERS_FILE, servers);
            return servers;
        });

        ipcMain.handle('delete-server', async (_, id) => {
            let servers = await fs.readJson(SERVERS_FILE);
            if (!Array.isArray(servers)) {
                servers = [];
            }
            const newServers = servers.filter((s: any) => s.id !== id);
            await fs.writeJson(SERVERS_FILE, newServers);
            return newServers;
        });

        // ===== Projects =====
        ipcMain.handle('get-projects', async () => {
            const data = await fs.readJson(PROJECTS_FILE);
            return Array.isArray(data) ? data : [];
        });

        ipcMain.handle('save-project', async (_, project) => {
            let projects = await fs.readJson(PROJECTS_FILE);
            if (!Array.isArray(projects)) {
                projects = [];
            }
            const index = projects.findIndex((p: any) => p.id === project.id);
            if (index > -1) {
                projects[index] = project;
            } else {
                projects.push(project);
            }
            await fs.writeJson(PROJECTS_FILE, projects);
            return projects;
        });

        ipcMain.handle('delete-project', async (_, id) => {
            let projects = await fs.readJson(PROJECTS_FILE);
            if (!Array.isArray(projects)) {
                projects = [];
            }
            const newProjects = projects.filter((p: any) => p.id !== id);
            await fs.writeJson(PROJECTS_FILE, newProjects);
            return newProjects;
        });
    }
}
