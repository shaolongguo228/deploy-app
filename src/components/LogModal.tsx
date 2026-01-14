import { X, Terminal, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

interface LogModalProps {
    isOpen: boolean;
    onClose: () => void;
    logs: string[];
    onClear?: () => void;
}

export function LogModal({ isOpen, onClose, logs, onClear }: LogModalProps) {
    const endRef = useRef<HTMLDivElement>(null);
    const [isMaximized, setIsMaximized] = useState(false);
    const [size, setSize] = useState({ width: 900, height: 600 });
    const [isResizing, setIsResizing] = useState(false);
    const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

    useEffect(() => {
        if (isOpen) {
            endRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isOpen, logs]);

    // 拖动调整大小
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !resizeRef.current) return;

            const deltaX = e.clientX - resizeRef.current.startX;
            const deltaY = e.clientY - resizeRef.current.startY;

            setSize({
                width: Math.max(400, Math.min(window.innerWidth - 100, resizeRef.current.startWidth + deltaX)),
                height: Math.max(300, Math.min(window.innerHeight - 100, resizeRef.current.startHeight + deltaY))
            });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            resizeRef.current = null;
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        resizeRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startWidth: size.width,
            startHeight: size.height
        };
    };

    if (!isOpen) return null;

    // XTerminal 风格的日志解析和着色
    const renderLogLine = (log: string, index: number) => {
        // 检测日志类型
        const isError = log.includes('ERROR:') || log.includes('[STDERR]') || log.includes('failed') || log.includes('Failed');
        const isSuccess = log.includes('SUCCESS:') || log.includes('successfully') || log.includes('complete') || log.includes('Complete');
        const isWarning = log.includes('WARNING:') || log.includes('warn');
        const isConnecting = log.includes('Connecting') || log.includes('Connected');
        const isExecuting = log.includes('Executing') || log.includes('command');
        const isUploading = log.includes('Upload') || log.includes('upload');

        // 解析日志内容，提取不同部分并着色
        const parts: JSX.Element[] = [];
        let remaining = log;

        // 1. 提取时间戳 [2026-01-13T08:48:35.803Z]
        const timestampMatch = remaining.match(/^\[([^\]]+)\]/);
        if (timestampMatch) {
            parts.push(
                <span key={`ts-${index}`} className="text-cyan-400">[{timestampMatch[1]}]</span>
            );
            remaining = remaining.slice(timestampMatch[0].length);
        }

        // 2. 提取日志级别 INFO: / ERROR: / SUCCESS:
        const levelMatch = remaining.match(/^\s*(INFO|ERROR|SUCCESS|WARNING|DEBUG):\s*/);
        if (levelMatch) {
            const level = levelMatch[1];
            let levelColor = 'text-blue-400';
            if (level === 'ERROR') levelColor = 'text-red-400';
            else if (level === 'SUCCESS') levelColor = 'text-green-400';
            else if (level === 'WARNING') levelColor = 'text-yellow-400';
            else if (level === 'DEBUG') levelColor = 'text-gray-400';

            parts.push(
                <span key={`lvl-${index}`} className={levelColor}> {level}:</span>
            );
            remaining = remaining.slice(levelMatch[0].length);
        }

        // 3. 对剩余内容进行语义着色
        if (remaining.trim()) {
            const colorizedContent = colorizeContent(remaining, index, {
                isError,
                isSuccess,
                isWarning,
                isConnecting,
                isExecuting,
                isUploading
            });
            parts.push(...colorizedContent);
        }

        // 根据日志类型决定行背景和前缀符号
        let bgClass = 'hover:bg-white/5';
        let prefixSymbol = '❯';
        let prefixColor = 'text-emerald-400';

        if (isError) {
            bgClass = 'bg-red-500/10 hover:bg-red-500/15';
            prefixSymbol = '✗';
            prefixColor = 'text-red-400';
        } else if (isSuccess) {
            bgClass = 'bg-green-500/10 hover:bg-green-500/15';
            prefixSymbol = '✓';
            prefixColor = 'text-green-400';
        } else if (isWarning) {
            bgClass = 'bg-yellow-500/10 hover:bg-yellow-500/15';
            prefixSymbol = '⚠';
            prefixColor = 'text-yellow-400';
        } else if (isConnecting) {
            prefixSymbol = '⟳';
            prefixColor = 'text-cyan-400';
        } else if (isExecuting) {
            prefixSymbol = '$';
            prefixColor = 'text-purple-400';
        } else if (isUploading) {
            prefixSymbol = '↑';
            prefixColor = 'text-blue-400';
        }

        return (
            <div
                key={index}
                className={`flex items-start gap-2 px-3 py-1 rounded ${bgClass} transition-colors group`}
            >
                <span className={`${prefixColor} font-bold shrink-0 w-4 text-center`}>{prefixSymbol}</span>
                <pre className="whitespace-pre-wrap break-all flex-1 leading-relaxed">{parts}</pre>
            </div>
        );
    };

    // 内容语义着色
    const colorizeContent = (
        content: string,
        index: number,
        _context: { isError: boolean; isSuccess: boolean; isWarning: boolean; isConnecting: boolean; isExecuting: boolean; isUploading: boolean }
    ): JSX.Element[] => {
        const parts: JSX.Element[] = [];
        let remaining = content;
        let partIndex = 0;

        // 定义要匹配的模式
        const patterns = [
            // IP地址/主机名
            { regex: /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\w+\.\w+\.\w+)/, className: 'text-yellow-300' },
            // 文件路径
            { regex: /(\/[\w\-\.\/]+\.\w+|[A-Z]:\\[\w\-\.\\]+)/, className: 'text-yellow-400' },
            // 命令 (反引号或常见命令)
            { regex: /(`[^`]+`|tail|ls|head|npm|mvn|java|python|git|ssh|sftp|cd|mkdir|rm|cp|mv|chmod|chown)/, className: 'text-purple-400' },
            // 数字
            { regex: /(\b\d+\b)/, className: 'text-orange-300' },
            // 引号内容
            { regex: /("[^"]*"|'[^']*')/, className: 'text-green-300' },
        ];

        // 逐步处理内容
        while (remaining.length > 0) {
            let earliestMatch: { match: RegExpMatchArray; pattern: typeof patterns[0] } | null = null;
            let earliestIndex = remaining.length;

            // 找到最早出现的模式
            for (const pattern of patterns) {
                const match = remaining.match(pattern.regex);
                if (match && match.index !== undefined && match.index < earliestIndex) {
                    earliestIndex = match.index;
                    earliestMatch = { match, pattern };
                }
            }

            if (earliestMatch && earliestMatch.match.index !== undefined) {
                // 添加匹配前的普通文本
                if (earliestMatch.match.index > 0) {
                    const plainText = remaining.slice(0, earliestMatch.match.index);
                    parts.push(
                        <span key={`plain-${index}-${partIndex++}`} className="text-gray-300">{plainText}</span>
                    );
                }

                // 添加着色的匹配内容
                parts.push(
                    <span key={`colored-${index}-${partIndex++}`} className={earliestMatch.pattern.className}>
                        {earliestMatch.match[0]}
                    </span>
                );

                remaining = remaining.slice(earliestMatch.match.index + earliestMatch.match[0].length);
            } else {
                // 没有更多匹配，添加剩余文本
                parts.push(
                    <span key={`remain-${index}-${partIndex++}`} className="text-gray-300">{remaining}</span>
                );
                break;
            }
        }

        return parts;
    };

    const modalStyle = isMaximized
        ? { width: '100vw', height: '100vh' }
        : { width: `${size.width}px`, height: `${size.height}px`, maxWidth: '95vw', maxHeight: '95vh' };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div
                style={modalStyle}
                className={`bg-[#1a1b26] shadow-2xl border border-[#414868] flex flex-col overflow-hidden ${isMaximized ? '' : 'rounded-xl'} relative`}
            >
                {/* Header - 仿 macOS 终端标题栏 */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#414868] bg-[#24283b] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="size-3 rounded-full bg-[#f7768e] cursor-pointer hover:brightness-110 transition-all shadow-[0_0_6px_rgba(247,118,142,0.5)]" onClick={onClose}></span>
                            <span className="size-3 rounded-full bg-[#e0af68] cursor-pointer hover:brightness-110 transition-all shadow-[0_0_6px_rgba(224,175,104,0.5)]" onClick={() => setIsMaximized(false)}></span>
                            <span className="size-3 rounded-full bg-[#9ece6a] cursor-pointer hover:brightness-110 transition-all shadow-[0_0_6px_rgba(158,206,106,0.5)]" onClick={() => setIsMaximized(true)}></span>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                            <Terminal className="text-[#7aa2f7] size-4" />
                            <span className="text-sm font-medium text-[#c0caf5]">DeployMaster Terminal</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {onClear && (
                            <button
                                onClick={onClear}
                                className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#565f89] hover:text-[#c0caf5] hover:bg-[#414868] rounded transition-colors"
                            >
                                <Trash2 className="size-3" />
                                Clear
                            </button>
                        )}
                        <button
                            onClick={() => setIsMaximized(!isMaximized)}
                            className="p-1.5 hover:bg-[#414868] rounded text-[#565f89] hover:text-[#c0caf5] transition-colors"
                        >
                            {isMaximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-[#414868] rounded text-[#565f89] hover:text-[#c0caf5] transition-colors"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </div>

                {/* Log Content - 仿 XTerminal 样式 */}
                <div className="flex-1 overflow-y-auto p-3 font-mono text-[13px] leading-relaxed space-y-0.5 bg-[#1a1b26] scrollbar-thin scrollbar-thumb-[#414868] scrollbar-track-transparent">
                    {logs.map((log, i) => renderLogLine(log, i))}
                    {logs.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-[#565f89]">
                            <div className="relative">
                                <Terminal className="size-16 mb-4 opacity-30" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#7aa2f7]/20 to-transparent rounded-full blur-xl" />
                            </div>
                            <p className="text-sm text-[#7aa2f7]">Waiting for output...</p>
                            <p className="text-xs opacity-60 mt-1">Start a deployment or view logs</p>
                        </div>
                    )}
                    <div ref={endRef} />
                </div>

                {/* Footer - 状态栏 */}
                <div className="px-4 py-1.5 border-t border-[#414868] bg-[#24283b] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-[#565f89]">{logs.length} lines</span>
                        <span className="text-xs text-[#565f89]">•</span>
                        <span className="text-xs text-[#9ece6a]">zsh</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[#7aa2f7] text-sm">❯</span>
                        <span className="w-2 h-4 bg-[#c0caf5] animate-pulse" />
                    </div>
                </div>

                {/* Resize Handle (bottom-right corner) */}
                {!isMaximized && (
                    <div
                        onMouseDown={handleResizeStart}
                        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize hover:bg-[#414868]/50 transition-colors"
                        style={{
                            background: 'linear-gradient(135deg, transparent 50%, rgba(65,72,104,0.5) 50%)'
                        }}
                    />
                )}
            </div>
        </div>
    );
}

