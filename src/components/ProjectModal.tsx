import React, { useState, useEffect } from 'react';
import { X, FolderOpen, Plus, Trash2, ChevronUp, ChevronDown, Check, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DeployConfig, ServerConfig, ProjectType, CommandItem } from '../types';
import { storageService } from '../services/storage';

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: Omit<DeployConfig, 'id'>) => Promise<void>;
    initialData?: DeployConfig;
}

// 生成唯一ID
const generateId = () => crypto.randomUUID();

// 创建新命令项
const createCommandItem = (command = ''): CommandItem => ({
    id: generateId(),
    command,
    enabled: true
});

export function ProjectModal({ isOpen, onClose, onSave, initialData }: ProjectModalProps) {
    const { t } = useTranslation();
    const [servers, setServers] = useState<ServerConfig[]>([]);

    const [formData, setFormData] = useState<Omit<DeployConfig, 'id'>>({
        serverId: '',
        projectName: '',
        projectType: 'java',
        localPath: '',
        remotePath: '',
        buildCommand: '',
        artifactPath: '',
        preDeployCommands: [],
        postDeployCommands: [],
        startCommand: '',
        logCommand: '',
        autoViewLog: false,
        enableUpload: true
    });

    useEffect(() => {
        storageService.getServers().then(data => setServers(Array.isArray(data) ? data : [])).catch(() => setServers([]));
    }, [isOpen]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                preDeployCommands: initialData.preDeployCommands || [],
                postDeployCommands: initialData.postDeployCommands || [],
                enableUpload: initialData.enableUpload !== false // 默认为 true
            });
        } else {
            setFormData({
                serverId: servers[0]?.id || '',
                projectName: '',
                projectType: 'java',
                localPath: '',
                remotePath: '',
                buildCommand: '',
                artifactPath: '',
                preDeployCommands: [],
                postDeployCommands: [],
                startCommand: '',
                logCommand: '',
                autoViewLog: false,
                enableUpload: true
            });
        }
    }, [initialData, isOpen, servers]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
        onClose();
    };

    // 命令列表操作函数
    const addCommand = (field: 'preDeployCommands' | 'postDeployCommands') => {
        const commands = [...(formData[field] || []), createCommandItem()];
        setFormData({ ...formData, [field]: commands });
    };

    const removeCommand = (field: 'preDeployCommands' | 'postDeployCommands', id: string) => {
        const commands = (formData[field] || []).filter(cmd => cmd.id !== id);
        setFormData({ ...formData, [field]: commands });
    };

    const updateCommand = (field: 'preDeployCommands' | 'postDeployCommands', id: string, value: string) => {
        const commands = (formData[field] || []).map(cmd =>
            cmd.id === id ? { ...cmd, command: value } : cmd
        );
        setFormData({ ...formData, [field]: commands });
    };

    const toggleCommandEnabled = (field: 'preDeployCommands' | 'postDeployCommands', id: string) => {
        const commands = (formData[field] || []).map(cmd =>
            cmd.id === id ? { ...cmd, enabled: !cmd.enabled } : cmd
        );
        setFormData({ ...formData, [field]: commands });
    };

    const moveCommand = (field: 'preDeployCommands' | 'postDeployCommands', id: string, direction: 'up' | 'down') => {
        const commands = [...(formData[field] || [])];
        const index = commands.findIndex(cmd => cmd.id === id);
        if (direction === 'up' && index > 0) {
            [commands[index - 1], commands[index]] = [commands[index], commands[index - 1]];
        } else if (direction === 'down' && index < commands.length - 1) {
            [commands[index], commands[index + 1]] = [commands[index + 1], commands[index]];
        }
        setFormData({ ...formData, [field]: commands });
    };

    // 命令列表渲染组件
    const CommandList = ({ field, label }: { field: 'preDeployCommands' | 'postDeployCommands', label: string }) => {
        const commands = formData[field] || [];
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-500">{label}</label>
                    <button
                        type="button"
                        onClick={() => addCommand(field)}
                        className="flex items-center gap-1 text-xs text-primary hover:text-blue-600 transition-colors"
                    >
                        <Plus className="size-3" />
                        {t('form.addCommand')}
                    </button>
                </div>
                {commands.length === 0 ? (
                    <div className="text-xs text-slate-400 italic py-2 text-center border border-dashed border-slate-200 dark:border-white/10 rounded">
                        {t('form.noCommands')}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {commands.map((cmd, index) => (
                            <div
                                key={cmd.id}
                                className={`flex items-center gap-2 p-2 rounded-lg border ${cmd.enabled
                                    ? 'bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10'
                                    : 'bg-slate-100 dark:bg-black/40 border-slate-300 dark:border-white/5 opacity-60'
                                    }`}
                            >
                                {/* 序号 */}
                                <span className="text-xs font-bold text-slate-400 w-5 text-center shrink-0">
                                    {index + 1}
                                </span>
                                {/* 启用/禁用复选框 */}
                                <button
                                    type="button"
                                    onClick={() => toggleCommandEnabled(field, cmd.id)}
                                    className={`size-5 rounded border flex items-center justify-center shrink-0 transition-colors ${cmd.enabled
                                        ? 'bg-primary border-primary text-white'
                                        : 'border-slate-300 dark:border-white/20'
                                        }`}
                                >
                                    {cmd.enabled && <Check className="size-3" />}
                                </button>
                                {/* 命令输入框 */}
                                <input
                                    type="text"
                                    placeholder="e.g., npm install"
                                    className="flex-1 bg-transparent border-none text-sm dark:text-white focus:outline-none font-mono"
                                    value={cmd.command}
                                    onChange={e => updateCommand(field, cmd.id, e.target.value)}
                                />
                                {/* 排序按钮 */}
                                <div className="flex flex-col shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => moveCommand(field, cmd.id, 'up')}
                                        disabled={index === 0}
                                        className="p-0.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronUp className="size-3 text-slate-500" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveCommand(field, cmd.id, 'down')}
                                        disabled={index === commands.length - 1}
                                        className="p-0.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronDown className="size-3 text-slate-500" />
                                    </button>
                                </div>
                                {/* 删除按钮 */}
                                <button
                                    type="button"
                                    onClick={() => removeCommand(field, cmd.id)}
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-500/20 rounded text-slate-400 hover:text-red-500 transition-colors shrink-0"
                                >
                                    <Trash2 className="size-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-10">
            <div className="w-full max-w-2xl bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-slate-200 dark:border-glass-border flex flex-col max-h-full">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 shrink-0">
                    <h3 className="font-bold text-lg dark:text-white">
                        {initialData ? t('modal.editProject') : t('modal.addProject')}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded">
                        <X className="size-5 dark:text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">{t('form.projectName')}</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={formData.projectName}
                                onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">{t('form.targetServer')}</label>
                            <select
                                required
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={formData.serverId}
                                onChange={e => setFormData({ ...formData, serverId: e.target.value })}
                            >
                                <option value="" disabled>Select Server</option>
                                {servers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.host})</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">{t('form.projectType')}</label>
                        <select
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={formData.projectType}
                            onChange={e => setFormData({ ...formData, projectType: e.target.value as ProjectType })}
                        >
                            <option value="java">Java (Jar)</option>
                            <option value="frontend">Frontend (Static)</option>
                            <option value="python">Python</option>
                            <option value="other">Custom</option>
                        </select>
                    </div>

                    {/* Paths */}
                    <div className="space-y-4 border-t border-slate-100 dark:border-white/5 pt-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paths</h4>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">{t('form.localPath')}</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    required
                                    placeholder="C:/Projects/MyApp"
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                                    value={formData.localPath}
                                    onChange={e => setFormData({ ...formData, localPath: e.target.value })}
                                />
                                <button type="button" className="p-2 bg-slate-100 dark:bg-white/5 rounded hover:bg-slate-200 dark:hover:bg-white/10"><FolderOpen className="size-4 text-slate-500" /></button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">{t('form.remotePath')}</label>
                            <input
                                type="text"
                                required
                                placeholder="/opt/myapp"
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                                value={formData.remotePath}
                                onChange={e => setFormData({ ...formData, remotePath: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Upload Settings */}
                    <div className="space-y-4 border-t border-slate-100 dark:border-white/5 pt-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Upload className="size-3" />
                            {t('form.uploadSettings')}
                        </h4>
                        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.enableUpload !== false}
                                onChange={e => setFormData({ ...formData, enableUpload: e.target.checked })}
                                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary/50"
                            />
                            <div>
                                <span className="text-sm font-medium text-slate-700 dark:text-white block">{t('form.enableUpload')}</span>
                                <span className="text-xs text-slate-500 mt-0.5 block">{t('form.enableUploadDesc')}</span>
                            </div>
                        </label>

                        {/* 只在启用上传时显示构建和产物路径配置 */}
                        {formData.enableUpload !== false && (
                            <>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">{t('form.artifactPath')} (Relative to Local Path)</label>
                                    <input
                                        type="text"
                                        placeholder="dist/ or target/app.jar"
                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                                        value={formData.artifactPath}
                                        onChange={e => setFormData({ ...formData, artifactPath: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">{t('form.buildCommand')} (Local)</label>
                                    <input
                                        type="text"
                                        placeholder="npm run build"
                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                                        value={formData.buildCommand}
                                        onChange={e => setFormData({ ...formData, buildCommand: e.target.value })}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Pre-Deploy Commands */}
                    <div className="space-y-4 border-t border-slate-100 dark:border-white/5 pt-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('form.preDeployCommands')} (Local)</h4>
                        <CommandList field="preDeployCommands" label={t('form.preDeployCommandsDesc')} />
                    </div>

                    {/* Post-Deploy Commands */}
                    <div className="space-y-4 border-t border-slate-100 dark:border-white/5 pt-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('form.postDeployCommands')} (Remote)</h4>
                        <CommandList field="postDeployCommands" label={t('form.postDeployCommandsDesc')} />

                        {/* Start Command (single) */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">{t('form.startCommand')} (Remote)</label>
                            <input
                                type="text"
                                placeholder="pm2 restart all"
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                                value={formData.startCommand}
                                onChange={e => setFormData({ ...formData, startCommand: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Log Settings */}
                    <div className="space-y-4 border-t border-slate-100 dark:border-white/5 pt-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('form.logSettings')}</h4>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">{t('form.logCommand')} (Remote)</label>
                            <input
                                type="text"
                                placeholder="tail -f /var/log/app.log"
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                                value={formData.logCommand}
                                onChange={e => setFormData({ ...formData, logCommand: e.target.value })}
                            />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.autoViewLog || false}
                                onChange={e => setFormData({ ...formData, autoViewLog: e.target.checked })}
                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/50"
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-300">{t('form.autoViewLog')}</span>
                        </label>
                    </div>


                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 rounded transition-colors">
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded transition-colors shadow-lg shadow-blue-500/20">
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
