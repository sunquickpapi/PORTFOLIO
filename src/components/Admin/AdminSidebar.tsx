"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";
import {
    LayoutDashboard,
    User,
    FileText,
    Briefcase,
    GraduationCap,
    Award,
    Heart,
    MessageSquare,
    BookOpen,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Sun,
    Moon
} from "lucide-react";

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Profile", href: "/admin/profile", icon: User },
    { name: "About Page", href: "/admin/about-details", icon: FileText },
    { name: "Projects", href: "/admin/projects", icon: Briefcase },
    { name: "Education", href: "/admin/education", icon: GraduationCap },
    { name: "Experience", href: "/admin/experience", icon: Award },
    { name: "Certifications", href: "/admin/certifications", icon: Award },
    { name: "Skills", href: "/admin/skills", icon: Briefcase },
    { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
    { name: "Blog", href: "/admin/blogs", icon: BookOpen },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { theme, toggleTheme } = useTheme();

    return (
        <aside className={`sidebar-container ${isCollapsed ? 'collapsed' : ''} ${theme === 'dark' ? 'dark-theme' : ''}`}>
            {/* Header */}
            <div className="sidebar-header">
                <div className="logo-group">
                    <div className="logo-box">
                        <img src="/assets/circleLogo.png" alt="Logo" className="logo-img" />
                    </div>
                    {!isCollapsed && (
                        <div className="title-group">
                            <h1 className="admin-title">Admin</h1>
                            <p className="admin-subtitle">Portfolio 2.0</p>
                        </div>
                    )}
                </div>

                <button
                    className="collapse-toggle"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="nav-area custom-scrollbar">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link key={item.href} href={item.href} className="nav-link">
                            <div className={`nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed-item' : ''}`} title={isCollapsed ? item.name : undefined}>
                                <div className="icon-wrapper">
                                    <Icon size={24} />
                                </div>
                                {!isCollapsed && <span className="nav-label">{item.name}</span>}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <button
                    onClick={toggleTheme}
                    className={`theme-toggle-btn ${isCollapsed ? 'collapsed-btn' : ''}`}
                    title={isCollapsed ? (theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode") : undefined}
                >
                    {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
                    {!isCollapsed && <span>{theme === 'light' ? "Dark Mode" : "Light Mode"}</span>}
                </button>

                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className={`signout-btn ${isCollapsed ? 'collapsed-btn' : ''}`}
                    title={isCollapsed ? "Sign Out" : undefined}
                >
                    <LogOut size={24} />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>

            <style jsx>{`
                .sidebar-container {
                    width: 20rem;
                    background: var(--admin-sidebar-bg, linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%));
                    color: var(--admin-text, #1a202c);
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    position: sticky;
                    top: 0;
                    box-shadow: 20px 0 60px -15px rgba(27, 79, 114, 0.08);
                    z-index: 50;
                    font-family: 'Inter', -apple-system, sans-serif;
                    border-right: 1px solid var(--admin-border, #e2e8f0);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    flex-shrink: 0;
                }

                .sidebar-container.dark-theme {
                    box-shadow: 20px 0 60px -15px rgba(0, 0, 0, 0.5);
                }

                .sidebar-container.collapsed {
                    width: 5.5rem;
                }

                .sidebar-header {
                    padding: 2.5rem 2rem;
                    background: var(--admin-card-bg, rgba(255, 255, 255, 0.8));
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid var(--admin-border, #f1f5f9);
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-height: 100px;
                }

                .collapsed .sidebar-header {
                    padding: 2rem 0;
                    justify-content: center;
                }

                .collapse-toggle {
                    position: absolute;
                    right: -12px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: var(--admin-card-bg, white);
                    border: 1px solid var(--admin-border, #e2e8f0);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #1B4F72;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    transition: all 0.3s ease;
                    z-index: 60;
                }

                .dark-theme .collapse-toggle {
                    color: #38bdf8;
                }

                .collapse-toggle:hover {
                    background: #1B4F72;
                    color: white;
                    border-color: #1B4F72;
                    transform: translateY(-50%) scale(1.1);
                }

                .dark-theme .collapse-toggle:hover {
                    background: #38bdf8;
                    border-color: #38bdf8;
                    color: #0f172a;
                }

                .logo-group {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: all 0.3s ease;
                }

                .logo-box {
                    width: 3.25rem;
                    height: 3.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .logo-img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .title-group {
                    display: flex;
                    flex-direction: column;
                    white-space: nowrap;
                    animation: fadeIn 0.4s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                .admin-title {
                    font-size: 1.25rem;
                    font-weight: 800;
                    line-height: 1.1;
                    letter-spacing: -0.02em;
                    color: var(--admin-accent, #1B4F72);
                    margin: 0;
                }

                .admin-subtitle {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    font-weight: 700;
                    color: #3A99C9;
                    margin: 0.2rem 0 0 0;
                }

                .nav-area {
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 1.5rem 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    background: transparent;
                }

                .collapsed .nav-area {
                    padding: 1.5rem 0.75rem;
                    align-items: center;
                }

                .nav-link {
                    text-decoration: none;
                    display: block;
                    width: 100%;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.875rem 1.25rem;
                    border-radius: 1.25rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    color: var(--admin-text-muted, #64748b);
                    background-color: transparent;
                    width: 100%;
                }

                .collapsed-item {
                    padding: 0.875rem;
                    justify-content: center;
                    border-radius: 1rem;
                    gap: 0;
                }

                .nav-item:hover {
                    background-color: var(--admin-card-bg, #ffffff);
                    color: var(--admin-accent, #1B4F72);
                    transform: translateX(4px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
                }

                .dark-theme .nav-item:hover {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .collapsed .nav-item:hover {
                    transform: scale(1.05);
                }

                .nav-item.active {
                    background: linear-gradient(135deg, #1B4F72 0%, #3A99C9 100%);
                    color: white;
                    box-shadow: 0 12px 24px -8px rgba(27, 79, 114, 0.4);
                    transform: translateX(6px);
                }

                .dark-theme .nav-item.active {
                    background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
                    color: #0f172a;
                    box-shadow: 0 12px 24px -8px rgba(56, 189, 248, 0.4);
                }

                .icon-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                }

                .nav-item:hover .icon-wrapper {
                    transform: scale(1.1);
                }

                .nav-item.active .icon-wrapper {
                    color: inherit;
                }

                .nav-item:not(.active) .icon-wrapper {
                    color: #3A99C9;
                }

                .nav-label {
                    font-weight: 700;
                    font-size: 0.9rem;
                    letter-spacing: -0.01em;
                    white-space: nowrap;
                    animation: fadeIn 0.4s ease-out;
                }

                .sidebar-footer {
                    padding: 1.5rem 1.25rem;
                    background-color: var(--admin-card-bg, rgba(255, 255, 255, 0.8));
                    border-top: 1px solid var(--admin-border, #f1f5f9);
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .collapsed .sidebar-footer {
                    padding: 1.5rem 0.75rem;
                    align-items: center;
                }

                .theme-toggle-btn, .signout-btn {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    width: 100%;
                    padding: 0.875rem 1.25rem;
                    border-radius: 1.25rem;
                    background: var(--admin-bg, white);
                    border: 1px solid var(--admin-border, #e2e8f0);
                    color: var(--admin-text-muted, #64748b);
                    font-weight: 700;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }

                .theme-toggle-btn:hover {
                    background-color: var(--admin-card-bg);
                    color: var(--admin-accent);
                    border-color: var(--admin-accent);
                }

                .theme-toggle-btn span, .signout-btn span {
                    animation: fadeIn 0.4s ease-out;
                }

                .collapsed-btn {
                    padding: 0.875rem;
                    justify-content: center;
                    width: auto;
                    border-radius: 1rem;
                }

                .signout-btn:hover {
                    background-color: #fef2f2;
                    color: #ef4444;
                    border-color: #fee2e2;
                    box-shadow: 0 4px 6px rgba(239, 68, 68, 0.1);
                }

                .dark-theme .signout-btn:hover {
                    background-color: rgba(239, 68, 68, 0.1);
                    border-color: rgba(239, 68, 68, 0.2);
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--admin-border, #e2e8f0);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e0;
                }
            `}</style>
        </aside>
    );
}
