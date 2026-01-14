import { Server, ChevronDown, Plus, Trash2, FolderPlus, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { storageService } from '../services/storage';
import { ServerConfig, EnvironmentGroup } from '../types';
import { ServerModal } from './ServerModal';

export function Sidebar() {
    const { t } = useTranslation();
    const [servers, setServers] = useState<ServerConfig[]>([]);
    const [groups, setGroups] = useState<EnvironmentGroup[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingServer, setEditingServer] = useState<ServerConfig | null>(null);

    // 新建分组
    const [isAddingGroup, setIsAddingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    const loadData = async () => {
        try {
            const [serverData, groupData] = await Promise.all([
                storageService.getServers(),
                storageService.getGroups()
            ]);
            setServers(Array.isArray(serverData) ? serverData : []);
            setGroups(Array.isArray(groupData) ? groupData : []);
        } catch (error) {
            console.error('Failed to load data:', error);
            setServers([]);
            setGroups([]);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSaveServer = async (serverData: Omit<ServerConfig, 'id'>) => {
        if (editingServer) {
            // 编辑现有服务器
            const updatedServer: ServerConfig = {
                ...serverData,
                id: editingServer.id
            };
            await storageService.saveServer(updatedServer);
        } else {
            // 新建服务器
            const newServer: ServerConfig = {
                ...serverData,
                id: crypto.randomUUID()
            };
            await storageService.saveServer(newServer);
        }
        setEditingServer(null);
        loadData();
    };

    const handleEditServer = (server: ServerConfig, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingServer(server);
        setIsModalOpen(true);
    };

    const handleDeleteServer = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(t('common.confirmDelete'))) {
            await storageService.deleteServer(id);
            loadData();
        }
    };

    const handleAddGroup = async () => {
        if (!newGroupName.trim()) return;
        const newGroup: EnvironmentGroup = {
            id: crypto.randomUUID(),
            name: newGroupName.trim(),
            color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
        };
        await storageService.saveGroup(newGroup);
        setNewGroupName('');
        setIsAddingGroup(false);
        loadData();
    };

    const handleDeleteGroup = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(t('common.confirmDelete'))) {
            await storageService.deleteGroup(id);
            loadData();
        }
    };

    // 按分组组织服务器
    const getServersByGroup = (groupId: string) => {
        return servers.filter(s => s.groupId === groupId);
    };

    // 未分组的服务器
    const ungroupedServers = servers.filter(s => !s.groupId || !groups.find(g => g.id === s.groupId));

    return (
        <aside className="w-72 flex flex-col border-r border-glass-border bg-slate-50 dark:bg-surface-dark/50 backdrop-blur-sm overflow-y-auto shrink-0 transition-colors duration-300 dark:border-white/10 border-slate-200">
            <div className="p-4 flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">{t('sidebar.environments')}</h3>
                    <button
                        onClick={() => setIsAddingGroup(true)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-500 hover:text-primary transition-colors"
                        title="添加分组"
                    >
                        <FolderPlus className="size-4" />
                    </button>
                </div>

                {/* 新建分组输入框 */}
                {isAddingGroup && (
                    <div className="mb-3 flex gap-2">
                        <input
                            type="text"
                            placeholder="分组名称"
                            className="flex-1 px-2 py-1.5 rounded text-sm bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddGroup()}
                            autoFocus
                        />
                        <button
                            onClick={handleAddGroup}
                            className="px-2 py-1 bg-primary text-white rounded text-xs font-bold hover:bg-blue-600"
                        >
                            确定
                        </button>
                        <button
                            onClick={() => { setIsAddingGroup(false); setNewGroupName(''); }}
                            className="px-2 py-1 text-slate-500 hover:text-slate-700 text-xs"
                        >
                            取消
                        </button>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    {/* 动态渲染分组 */}
                    {groups.map(group => (
                        <details key={group.id} className="group" open>
                            <summary className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-200 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 transition-colors select-none">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="size-2 rounded-full"
                                        style={{ backgroundColor: group.color || '#22c55e' }}
                                    />
                                    <Server className="size-5 text-slate-500 group-open:text-primary transition-colors" />
                                    <span className="font-medium text-sm">{group.name}</span>
                                    <span className="text-xs text-slate-400">({getServersByGroup(group.id).length})</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => handleDeleteGroup(group.id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-error transition-opacity"
                                    >
                                        <Trash2 className="size-3" />
                                    </button>
                                    <ChevronDown className="size-4 text-slate-600 group-open:rotate-180 transition-transform" />
                                </div>
                            </summary>
                            <div className="pl-10 pr-2 pt-1 pb-3 flex flex-col gap-1">
                                {getServersByGroup(group.id).map(server => (
                                    <div key={server.id} className="flex items-center justify-between w-full px-2 py-1.5 rounded hover:bg-slate-200 dark:hover:bg-white/5 text-left group/item transition-colors cursor-pointer">
                                        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover/item:text-slate-900 dark:group-hover/item:text-white truncate">
                                            {server.name} ({server.host})
                                        </span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => handleEditServer(server, e)}
                                                className="p-1 hover:text-primary transition-colors"
                                            >
                                                <Pencil className="size-3" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteServer(server.id, e)}
                                                className="p-1 hover:text-error transition-colors"
                                            >
                                                <Trash2 className="size-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {getServersByGroup(group.id).length === 0 && (
                                    <div className="text-xs text-slate-400 italic px-2 py-1">暂无服务器</div>
                                )}
                            </div>
                        </details>
                    ))}

                    {/* 未分组的服务器 */}
                    {ungroupedServers.length > 0 && (
                        <details className="group" open>
                            <summary className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-200 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 transition-colors select-none">
                                <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-slate-400" />
                                    <Server className="size-5 text-slate-500 group-open:text-primary transition-colors" />
                                    <span className="font-medium text-sm">未分组</span>
                                    <span className="text-xs text-slate-400">({ungroupedServers.length})</span>
                                </div>
                                <ChevronDown className="size-4 text-slate-600 group-open:rotate-180 transition-transform" />
                            </summary>
                            <div className="pl-10 pr-2 pt-1 pb-3 flex flex-col gap-1">
                                {ungroupedServers.map(server => (
                                    <div key={server.id} className="flex items-center justify-between w-full px-2 py-1.5 rounded hover:bg-slate-200 dark:hover:bg-white/5 text-left group/item transition-colors cursor-pointer">
                                        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover/item:text-slate-900 dark:group-hover/item:text-white truncate">
                                            {server.name} ({server.host})
                                        </span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => handleEditServer(server, e)}
                                                className="p-1 hover:text-primary transition-colors"
                                            >
                                                <Pencil className="size-3" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteServer(server.id, e)}
                                                className="p-1 hover:text-error transition-colors"
                                            >
                                                <Trash2 className="size-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </details>
                    )}

                    {/* 无任何数据时的提示 */}
                    {groups.length === 0 && ungroupedServers.length === 0 && (
                        <div className="text-xs text-slate-400 italic px-2 py-4 text-center">
                            点击右上角按钮创建分组
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-glass-border dark:border-white/10 border-slate-200">
                <button
                    onClick={() => { setEditingServer(null); setIsModalOpen(true); }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg py-2 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-white transition-colors border border-slate-300 dark:border-white/5"
                >
                    <Plus className="size-4" />
                    {t('app.addServer')}
                </button>
            </div>

            <ServerModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingServer(null); }}
                onSave={handleSaveServer}
                initialData={editingServer || undefined}
                groups={groups}
            />
        </aside>
    );
}
