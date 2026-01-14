import { Search, Bell, Settings, Command } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';

export function Header() {
    const { t, i18n } = useTranslation();
    const { theme, setTheme } = useTheme();

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="flex items-center justify-between border-b border-glass-border bg-surface-dark/80 px-6 py-3 shrink-0 backdrop-blur-md z-20 transition-colors duration-300 dark:bg-surface-dark/80 bg-white/80 dark:border-white/10 border-slate-200">
            <div className="flex items-center gap-4">
                <div className="size-8 flex items-center justify-center rounded-lg bg-primary/20 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>
                </div>
                <div>
                    <h1 className="text-slate-800 dark:text-white text-lg font-bold leading-tight tracking-tight">{t('app.name')}</h1>
                    <p className="text-xs text-slate-500 font-mono tracking-wider">v2.4.0-stable</p>
                </div>
            </div>

            <div className="flex flex-1 justify-center max-w-2xl px-8">
                <div className="flex w-full items-center gap-2 rounded-lg bg-slate-100 dark:bg-black/20 px-3 py-1.5 border border-transparent dark:border-glass-border focus-within:ring-2 ring-primary/50 transition-all">
                    <Search className="text-slate-500 text-lg size-4" />
                    <input
                        className="bg-transparent border-none text-sm text-slate-800 dark:text-white w-full focus:outline-none placeholder-slate-500 dark:placeholder-slate-600 font-normal ml-1"
                        placeholder={t('app.searchPlaceholder')}
                        type="text"
                    />
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-600 font-mono border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5">
                        <Command className="size-3" /> <span>K</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 mr-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-green-500/10 border border-green-500/20">
                        <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">{t('status.systemNormal')}</span>
                    </div>
                </div>

                {/* Theme Toggle */}
                <button onClick={toggleTheme} className="flex items-center justify-center size-9 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" title="Toggle Theme">
                    {theme === 'dark' ? '🌙' : '☀️'}
                </button>

                {/* Language Toggle */}
                <button onClick={toggleLanguage} className="flex items-center justify-center size-9 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-mono text-xs font-bold" title="Switch Language">
                    {i18n.language === 'en' ? 'EN' : '中'}
                </button>

                <button className="flex items-center justify-center size-9 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Bell className="size-5" />
                </button>
                <button className="flex items-center justify-center size-9 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Settings className="size-5" />
                </button>
                <div className="size-9 rounded-full bg-slate-300 dark:bg-slate-700 border border-slate-200 dark:border-glass-border ml-2 overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                </div>
            </div>
        </header>
    );
}
