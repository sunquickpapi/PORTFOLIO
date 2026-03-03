"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Home as HomeIcon, Github, Linkedin, FileText, User, Code, Layout, MessageSquare, BookOpen, Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

/**
 * ============================================================================
 * INTERNAL COMPONENTS (Private to LoginView)
 * ============================================================================
 */

export default function LoginView() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                const errorMap: Record<string, string> = {
                    "invalid-email": "Email address not recognized.",
                    "invalid-password": "Incorrect password.",
                };
                setError(errorMap[res.error] || "Authentication failed.");
                setLoading(false);
            } else {
                router.push("/admin");
                router.refresh();
            }
        } catch (err) {
            setError("An unexpected error occurred.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[var(--portfolio-bg)] text-[var(--color-text-primary)] flex items-center justify-center p-6 sm:p-12 font-sans relative overflow-hidden transition-colors duration-500">
            {/* Moving Background Layer */}
            <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none">
                <style>{`
                    @keyframes drift-diag {
                        0% { transform: translate(0, 0) skewX(-20deg); }
                        50% { transform: translate(40px, -20px) skewX(-20deg); }
                        100% { transform: translate(0, 0) skewX(-20deg); }
                    }
                    .geo-bar {
                        position: absolute;
                        background: linear-gradient(135deg, var(--geo-bar-color-1) 0%, var(--geo-bar-color-2) 100%);
                        transform: skewX(-20deg);
                        animation: drift-diag 12s infinite linear;
                        border-left: 2px solid var(--card-border);
                    }
                `}</style>
                <div className="geo-bar w-[400px] h-[40px] top-[10%] left-[-50px]" style={{ animationDelay: '0s' }}></div>
                <div className="geo-bar w-[300px] h-[30px] top-[30%] right-[10%] animation-reverse" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
                <div className="geo-bar w-[500px] h-[60px] bottom-[20%] left-[10%]" style={{ animationDuration: '11s' }}></div>
                <div className="geo-bar w-[250px] h-[25px] top-[50%] left-[30%]" style={{ animationDuration: '16s' }}></div>
                <div className="geo-bar w-[450px] h-[45px] bottom-[-20px] right-[20%]" style={{ animationDuration: '14s' }}></div>
            </div>

            <main className="w-full max-w-[520px] flex flex-col items-center relative z-10" style={{ gap: '48px' }}>
                {/* Brand Identity - Refined Scale */}
                <div className="flex flex-col items-center gap-[24px]">
                    <div className="w-[80px] h-[80px] rounded-[1.75rem] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-200 dark:shadow-none">
                        <Shield className="w-10 h-10 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="text-[48px] font-extrabold tracking-tighter text-[var(--color-text-primary)] leading-tight">Admin Portal</h1>
                        <p className="text-[var(--color-text-muted)] text-[13px] font-bold uppercase tracking-[0.4em]">Secure Signature Required</p>
                    </div>
                </div>

                {/* Login Card - Interactive Refinement */}
                <div className="w-full bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-[4rem] shadow-[0_64px_128px_-32px_var(--glass-shadow-color)] transition-all duration-500" style={{ padding: '48px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
                    <h2 className="text-center font-bold text-[32px] tracking-tighter text-[var(--color-text-primary)]">Sign In to Dashboard</h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {/* Field: Identity */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <label className="text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.3em] pl-6">
                                Digital Identity
                            </label>
                            <div className="group relative">
                                <div className="absolute top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-text-primary)] transition-colors z-10" style={{ left: '32px' }}>
                                    <Mail size={20} strokeWidth={2} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-[var(--portfolio-bg)] border border-[var(--card-border)] rounded-[2rem] pr-12 text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-blue)] focus:border-[var(--color-accent-blue)] transition-all text-[18px] font-medium placeholder:text-[var(--color-text-muted)]/50"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ paddingTop: '24px', paddingBottom: '24px', paddingLeft: '84px' }}
                                />
                            </div>
                        </div>

                        {/* Field: Security Key */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <label className="text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.3em] pl-6">
                                Encryption Key
                            </label>
                            <div className="group relative">
                                <div className="absolute top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-text-primary)] transition-colors z-10" style={{ left: '32px' }}>
                                    <Lock size={20} strokeWidth={2} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-[var(--portfolio-bg)] border border-[var(--card-border)] rounded-[2rem] pr-28 text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-blue)] focus:border-[var(--color-accent-blue)] transition-all text-[18px] font-medium placeholder:text-[var(--color-text-muted)]/50"
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ paddingTop: '24px', paddingBottom: '24px', paddingLeft: '84px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-8 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-3 z-10"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-4 bg-red-50/30 border border-red-100/50 p-6 rounded-[1.5rem] text-red-600 text-base font-semibold">
                                <AlertCircle size={20} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-black text-white font-bold rounded-[2rem] flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-xl shadow-slate-100 dark:shadow-none"
                            style={{ height: '72px', marginTop: '32px' }}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Shield size={20} strokeWidth={2} className="opacity-70" />
                                    <span className="text-[20px]">Authorize Access</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-[var(--color-text-muted)] text-[11px] font-bold uppercase tracking-[0.6em] opacity-80 pt-4">
                    © 2024 Naufal OS • Build 2.8
                </p>
            </main>

            {/* Menu Bar (Dock) - Sync with Navigation.tsx classes */}
            <div className="dock-wrapper">
                <div className="dock">
                    {/* Main Navigation Group */}
                    <div className="dock-group">
                        <a href="/" className="dock-item" data-label="Home">
                            <HomeIcon size={20} />
                            <span className="dock-tooltip">Home</span>
                        </a>
                        <a href="/#about" className="dock-item" data-label="About">
                            <User size={20} />
                            <span className="dock-tooltip">About</span>
                        </a>
                        <a href="/#tech-stack" className="dock-item" data-label="Stack">
                            <Code size={20} />
                            <span className="dock-tooltip">Stack</span>
                        </a>
                        <a href="/#projects" className="dock-item" data-label="Project">
                            <Layout size={20} />
                            <span className="dock-tooltip">Project</span>
                        </a>
                        <a href="/#testimonials" className="dock-item" data-label="Feedback">
                            <MessageSquare size={20} />
                            <span className="dock-tooltip">Feedback</span>
                        </a>
                        <a href="/#blog-latest" className="dock-item" data-label="Blog">
                            <BookOpen size={20} />
                            <span className="dock-tooltip">Blog</span>
                        </a>
                        <a href="/#contact" className="dock-item" data-label="Contact">
                            <Mail size={20} />
                            <span className="dock-tooltip">Contact</span>
                        </a>
                    </div>

                    <div className="dock-separator"></div>

                    {/* Socials Group */}
                    <div className="dock-group">
                        <a href="https://github.com/sunquickpapi" target="_blank" rel="noreferrer" className="dock-item" data-label="Code">
                            <Github size={20} />
                            <span className="dock-tooltip">Code</span>
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="dock-item" data-label="Social">
                            <Linkedin size={20} />
                            <span className="dock-tooltip">Social</span>
                        </a>
                        <a href="mailto:admin@example.com" className="dock-item" data-label="Email">
                            <Mail size={20} />
                            <span className="dock-tooltip">Email</span>
                        </a>
                        <a href="#" className="dock-item" data-label="Resume">
                            <FileText size={20} />
                            <span className="dock-tooltip">Resume</span>
                        </a>
                    </div>

                    <div className="dock-separator"></div>

                    {/* Utility Group */}
                    <div className="dock-group">
                        {mounted && (
                            <button
                                onClick={toggleTheme}
                                className="dock-item theme-toggle"
                                data-label={theme === 'dark' ? "Light Mode" : "Dark Mode"}
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                                <span className="dock-tooltip">{theme === 'dark' ? "Light Mode" : "Dark Mode"}</span>
                            </button>
                        )}
                        <div className="px-3 py-1 flex items-center gap-0.5 select-none">
                            <span className="text-[17px] font-black tracking-[-0.05em] text-slate-950">FV</span>
                            <span className="text-[17px] font-black tracking-[-0.05em] text-cyan-500">L</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
