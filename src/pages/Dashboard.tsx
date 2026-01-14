import { Rocket, RefreshCw, GitBranch, Terminal, Plus, Trash2, AlertCircle, FileText, Pencil, ScrollText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storage';
import { deploymentService } from '../services/deploy';
import { DeployConfig, ServerConfig } from '../types';
import { ProjectModal } from '../components/ProjectModal';
import { LogModal } from '../components/LogModal';

export default function Dashboard() {
    const { t } = useTranslation();
    const [projects, setProjects] = useState<DeployConfig[]>([]);
    const [servers, setServers] = useState<ServerConfig[]>([]);

    // Modals & UI State
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<DeployConfig | null>(null);


    // Deployment State
    const [deployingId, setDeployingId] = useState<string | null>(null);
    const [viewingLogId, setViewingLogId] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const listenerSetupRef = useRef(false);  // 防止 StrictMode 重复注册

    const loadData = async () => {
        try {
            const [pData, sData] = await Promise.all([
                storageService.getProjects(),
                storageService.getServers()
            ]);
            setProjects(Array.isArray(pData) ? pData : []);
            setServers(Array.isArray(sData) ? sData : []);
        } catch (error) {
            console.error('Failed to load data:', error);
            setProjects([]);
            setServers([]);
        }
    };

    useEffect(() => {
        loadData();

        // 防止 StrictMode 重复注册监听器
        // 注意: 不要在 cleanup 中重置 listenerSetupRef.current，否则 StrictMode 会导致重复注册
        if (listenerSetupRef.current) return;
        listenerSetupRef.current = true;

        const cleanup = deploymentService.onLog((log) => {
            setLogs(prev => [...prev, `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`]);
        });

        // cleanup 函数只清理监听器，不重置 ref
        // 这样可以确保即使在 StrictMode 下也只注册一次监听器
        return () => {
            if (cleanup) cleanup();
        };
    }, []);

    const handleSaveProject = async (projectData: Omit<DeployConfig, 'id'>) => {
        if (editingProject) {
            const updatedProject: DeployConfig = {
                ...projectData,
                id: editingProject.id
            };
            await storageService.saveProject(updatedProject);
        } else {
            const newProject: DeployConfig = {
                ...projectData,
                id: crypto.randomUUID()
            };
            await storageService.saveProject(newProject);
        }
        setEditingProject(null);
        loadData();
    };

    const handleEditProject = (project: DeployConfig, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setEditingProject(project);
        setIsProjectModalOpen(true);
    };

    const handleDeleteProject = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (confirm(t('common.confirmDelete'))) {
            await storageService.deleteProject(id);
            loadData();
        }
    };

    const handleDeploy = async (project: DeployConfig, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const server = servers.find(s => s.id === project.serverId);
        if (!server) {
            alert("Server not found");
            return;
        }

        setDeployingId(project.id);
        setLogs([]);
        setErrorMsg(null);
        setIsLogModalOpen(true);     // 自动弹出控制台窗口
        try {
            await deploymentService.deploy(project, server);
        } catch (error: any) {
            console.error(error);
            setErrorMsg(error.message || 'Deployment failed');
        } finally {
            setDeployingId(null);
        }
    };

    const handleViewLog = async (project: DeployConfig, e?: React.MouseEvent) => {
        e?.stopPropagation();

        if (!project.logCommand?.trim()) {
            alert(t('form.logCommand') + ' is not configured');
            return;
        }

        const server = servers.find(s => s.id === project.serverId);
        if (!server) {
            alert("Server not found");
            return;
        }

        setViewingLogId(project.id);
        setLogs([]);
        setIsLogModalOpen(true);

        try {
            await deploymentService.viewLog(project, server);
        } catch (error: any) {
            console.error(error);
        } finally {
            // 确保状态被重置
            setViewingLogId(null);
        }
    };

    const handleCloseLogModal = () => {
        setIsLogModalOpen(false);
        // 关闭弹窗时重置日志查看状态
        setViewingLogId(null);
    };

    const handleClearLogs = () => {
        setLogs([]);
    };

    return (
        <main className="flex-1 flex min-w-0 overflow-hidden relative bg-slate-50 dark:bg-background-dark transition-colors duration-300">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">
                {/* Context Header */}
                <div className="flex items-center justify-between px-8 py-6 pb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('app.dashboard')}</h2>
                        <p className="text-slate-500 text-sm mt-1">{projects.length} Projects Configured</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsLogModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-4 h-10 rounded-lg border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <Terminal className="size-4" />
                            <span className="text-sm font-bold">Logs</span>
                        </button>
                        <button
                            onClick={() => setIsProjectModalOpen(true)}
                            className="flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-slate-200 dark:bg-surface-dark border border-slate-300 dark:border-glass-border text-slate-700 dark:text-white text-sm font-bold hover:bg-slate-300 dark:hover:bg-white/5 transition-colors shadow-sm"
                        >
                            <Plus className="size-5" />
                            {t('modal.addProject')}
                        </button>
                        <button className="flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-6 bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-[0_0_15px_rgba(19,127,236,0.4)] transition-all">
                            <Rocket className="size-5" />
                            {t('app.deployAll')}
                        </button>
                    </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="mx-8 mt-4 p-4 rounded-lg bg-error/10 border border-error/20 flex items-start gap-3 text-error animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="size-5 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-bold text-sm">Deployment Failed</h4>
                            <pre className="mt-1 text-xs whitespace-pre-wrap font-mono opacity-90">{errorMsg}</pre>
                        </div>
                        <button onClick={() => setErrorMsg(null)} className="hover:bg-error/10 p-1 rounded"><Plus className="rotate-45 size-4" /></button>
                    </div>
                )}

                {/* Scrollable Card Grid */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">

                        {projects.map(project => {
                            const serverName = servers.find(s => s.id === project.serverId)?.name || 'Unknown Server';
                            const isDeploying = deployingId === project.id;
                            const isViewingLog = viewingLogId === project.id;
                            const hasRecentError = errorMsg && !isDeploying;

                            return (
                                <div key={project.id} className={`glass-panel rounded-xl p-0 flex flex-col relative overflow-hidden group hover:border-slate-400 dark:hover:border-slate-600 transition-colors bg-white dark:bg-surface-dark/50 ${hasRecentError ? 'border-error/30' : ''}`}>
                                    <div className="p-5 flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-slate-200 dark:border-glass-border">
                                                    <img src="/logo.png" alt="DeployMaster Logo" className="size-full object-contain p-1" />
                                                </div>
                                                <div>
                                                    <h3 className="text-slate-900 dark:text-white font-bold text-lg leading-tight">{project.projectName}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                                                        <span className="uppercase">{project.projectType}</span>
                                                        <span className="size-1 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                                                        <span>{serverName}</span>
                                                        {project.enableUpload === false && (
                                                            <>
                                                                <span className="size-1 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                                                                <span className="text-amber-500">No Upload</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {isDeploying && (
                                                <span className="px-2.5 py-1 rounded bg-primary/10 text-primary text-xs font-bold border border-primary/20 flex items-center gap-1.5">
                                                    <RefreshCw className="size-3 animate-spin" />
                                                    {t('status.deploying')}
                                                </span>
                                            )}
                                            {isViewingLog && (
                                                <span className="px-2.5 py-1 rounded bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20 flex items-center gap-1.5">
                                                    <RefreshCw className="size-3 animate-spin" />
                                                    {t('status.loadingLogs')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="bg-slate-100 dark:bg-black/20 rounded p-3 border border-slate-200 dark:border-white/5 font-mono text-xs text-slate-600 dark:text-slate-400 break-all">
                                            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                                                <span className="text-slate-400 uppercase font-bold text-[10px] self-center">Local</span>
                                                <span className="truncate">{project.localPath}</span>

                                                <span className="text-slate-400 uppercase font-bold text-[10px] self-center">Remote</span>
                                                <span className="truncate">{project.remotePath}</span>
                                            </div>
                                        </div>

                                    </div>
                                    {/* Action Footer */}
                                    <div className="bg-slate-50 dark:bg-black/20 px-5 py-3 border-t border-slate-200 dark:border-glass-border flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <GitBranch className="text-slate-500 size-4" />
                                            <span className="text-xs text-slate-500 dark:text-slate-300 font-mono">master</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => handleEditProject(project, e)}
                                                className="text-xs font-bold text-slate-500 dark:text-slate-300 hover:text-primary dark:hover:text-primary px-2 py-1.5 transition-colors"
                                                title="Edit Project"
                                            >
                                                <Pencil className="size-4" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteProject(project.id, e)}
                                                className="text-xs font-bold text-slate-500 dark:text-slate-300 hover:text-error dark:hover:text-error px-2 py-1.5 transition-colors"
                                                title="Delete Project"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => setIsLogModalOpen(true)}
                                                className="text-xs font-bold text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 py-1.5 transition-colors"
                                                title="View Deploy Logs"
                                            >
                                                <FileText className="size-4" />
                                            </button>
                                            {/* View Remote Logs Button */}
                                            <button
                                                onClick={(e) => handleViewLog(project, e)}
                                                disabled={!project.logCommand?.trim() || isDeploying}
                                                className="text-xs font-bold text-slate-500 dark:text-slate-300 hover:text-green-500 dark:hover:text-green-400 px-2 py-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                title={t('common.viewLogs')}
                                            >
                                                <ScrollText className="size-4" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeploy(project, e)}
                                                disabled={isDeploying}
                                                className="text-xs font-bold text-white bg-primary hover:bg-blue-600 px-3 py-1.5 rounded transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isDeploying ? t('status.deploying') : t('common.deploy')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {projects.length === 0 && (
                            <div className="col-span-full py-10 flex flex-col items-center justify-center text-slate-400">
                                <div className="size-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                                    <Plus className="size-8" />
                                </div>
                                <p>No projects yet. Click "Add Project" to get started.</p>
                            </div>
                        )}

                    </div>

                    {/* Bottom decorative fade for scrolling */}
                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-slate-50 dark:from-background-dark to-transparent pointer-events-none"></div>

                </div>
            </div>



            <ProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => {
                    setIsProjectModalOpen(false);
                    setEditingProject(null);
                }}
                onSave={handleSaveProject}
                initialData={editingProject || undefined}
            />

            <LogModal
                isOpen={isLogModalOpen}
                onClose={handleCloseLogModal}
                logs={logs}
                onClear={handleClearLogs}
            />
        </main>
    );
}
