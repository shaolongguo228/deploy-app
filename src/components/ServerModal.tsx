import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ServerConfig, EnvironmentGroup } from '../types';

interface ServerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (server: Omit<ServerConfig, 'id'>) => Promise<void>;
    initialData?: ServerConfig;
    groups?: EnvironmentGroup[];
}

export function ServerModal({ isOpen, onClose, onSave, initialData, groups = [] }: ServerModalProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Omit<ServerConfig, 'id'>>({
        name: '',
        host: '',
        port: 22,
        username: '',
        authType: 'password',
        password: '',
        privateKeyPath: '',
        groupId: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                host: initialData.host,
                port: initialData.port,
                username: initialData.username,
                authType: initialData.authType,
                password: initialData.password || '',
                privateKeyPath: initialData.privateKeyPath || '',
                groupId: initialData.groupId || ''
            });
        } else {
            setFormData({
                name: '',
                host: '',
                port: 22,
                username: '',
                authType: 'password',
                password: '',
                privateKeyPath: '',
                groupId: groups[0]?.id || ''
            });
        }
    }, [initialData, isOpen, groups]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-slate-200 dark:border-glass-border">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
                    <h3 className="font-bold text-lg dark:text-white">
                        {initialData ? t('modal.editServer') : t('modal.addServer')}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded">
                        <X className="size-5 dark:text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">{t('form.serverName')}</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* 环境分组选择 */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">{t('form.group')}</label>
                        <select
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={formData.groupId}
                            onChange={e => setFormData({ ...formData, groupId: e.target.value })}
                        >
                            <option value="">-- 不分组 --</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1">{t('form.host')}</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={formData.host}
                                onChange={e => setFormData({ ...formData, host: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">{t('form.port')}</label>
                            <input
                                type="number"
                                required
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={formData.port}
                                onChange={e => setFormData({ ...formData, port: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">{t('form.username')}</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">{t('form.authType')}</label>
                        <select
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={formData.authType}
                            onChange={e => setFormData({ ...formData, authType: e.target.value as any })}
                        >
                            <option value="password">Password</option>
                            <option value="key">Private Key</option>
                        </select>
                    </div>

                    {formData.authType === 'password' ? (
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">{t('form.password')}</label>
                            <input
                                type="password"
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">{t('form.privateKey')}</label>
                            <input
                                type="text"
                                placeholder="/path/to/id_rsa"
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={formData.privateKeyPath}
                                onChange={e => setFormData({ ...formData, privateKeyPath: e.target.value })}
                            />
                        </div>
                    )}

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
