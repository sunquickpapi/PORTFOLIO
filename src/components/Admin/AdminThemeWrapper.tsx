"use client";

import { useTheme } from "@/context/ThemeContext";
import React from "react";

export default function AdminThemeWrapper({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // During SSR and first mount, use a neutral state or light mode
    // to match the server-rendered HTML and avoid hydration warnings.
    const activeTheme = mounted ? theme : 'light';

    return (
        <div className={activeTheme === 'dark' ? 'admin-dark-mode' : 'admin-light-mode'}>
            <style jsx global>{`
                .admin-light-mode {
                    --admin-bg: #F8FAFC;
                    --admin-card-bg: #ffffff;
                    --admin-text: #1a202c;
                    --admin-text-muted: #64748b;
                    --admin-border: #e2e8f0;
                    --admin-sidebar-bg: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
                    --admin-accent: #1B4F72;
                }

                .admin-dark-mode {
                    --admin-bg: #0f172a;
                    --admin-card-bg: #1e293b;
                    --admin-text: #f8fafc;
                    --admin-text-muted: #94a3b8;
                    --admin-border: #334155;
                    --admin-sidebar-bg: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                    --admin-accent: #38bdf8;
                }

                .admin-light-mode, .admin-dark-mode {
                    background: var(--admin-bg);
                    min-height: 100vh;
                    /* Hide scrollbar for Chrome, Safari and Opera */
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                    color: var(--admin-text);
                }

                .admin-light-mode::-webkit-scrollbar,
                .admin-dark-mode::-webkit-scrollbar {
                    display: none;
                }
                
                /* Global overrides for admin elements when in dark mode */
                .admin-dark-mode .dashboard-card,
                .admin-dark-mode .glass-section,
                .admin-dark-mode .premium-card {
                    background: rgba(30, 41, 59, 0.7) !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                    color: #f8fafc !important;
                }

                .admin-dark-mode .dashboard-title,
                .admin-dark-mode .page-title,
                .admin-dark-mode .section-title,
                .admin-dark-mode .profile-title {
                    color: #f8fafc !important;
                }

                .admin-dark-mode .dashboard-subtitle,
                .admin-dark-mode .page-subtitle {
                    color: #94a3b8 !important;
                }

                .admin-dark-mode .gradient-text {
                    background: linear-gradient(135deg, #38bdf8 0%, #60a5fa 50%, #93c5fd 100%) !important;
                    -webkit-background-clip: text !important;
                    -webkit-text-fill-color: transparent !important;
                }

                /* About Page Specific Overrides */
                .admin-dark-mode .glass-section {
                    background: rgba(30, 41, 59, 0.7) !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3) !important;
                }

                .admin-dark-mode .section-header {
                    background: rgba(15, 23, 42, 0.5) !important;
                    border-bottom-color: rgba(255, 255, 255, 0.05) !important;
                }

                .admin-dark-mode .stats-card,
                .admin-dark-mode .item-card,
                .admin-dark-mode .cert-card,
                .admin-dark-mode .hobby-item,
                .admin-dark-mode .skill-card {
                    background: rgba(15, 23, 42, 0.6) !important;
                    border-color: rgba(255, 255, 255, 0.05) !important;
                }

                .admin-dark-mode .stats-card:hover,
                .admin-dark-mode .item-card:hover,
                .admin-dark-mode .cert-card:hover,
                .admin-dark-mode .hobby-item:hover,
                .admin-dark-mode .skill-card:hover {
                    background: rgba(30, 41, 59, 0.9) !important;
                    border-color: rgba(56, 189, 248, 0.4) !important;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
                }

                .admin-dark-mode .stats-card label,
                .admin-dark-mode .data-group label {
                    color: #64748b !important;
                }

                .admin-dark-mode .cell-primary,
                .admin-dark-mode .cell-title,
                .admin-dark-mode .card-name,
                .admin-dark-mode .hobby-name,
                .admin-dark-mode .role-text,
                .admin-dark-mode .number,
                .admin-dark-mode .skill-name {
                    color: #f1f5f9 !important;
                }

                .admin-dark-mode .cell-secondary,
                .admin-dark-mode .cell-subtitle,
                .admin-dark-mode .bio-text,
                .admin-dark-mode .unit,
                .admin-dark-mode .cell-sub,
                .admin-dark-mode .card-sub {
                    color: #94a3b8 !important;
                }

                .admin-dark-mode .icon-btn,
                .admin-dark-mode .mini-btn,
                .admin-dark-mode .hobby-icon {
                    background: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                    color: #38bdf8 !important;
                }

                .admin-dark-mode .icon-btn:hover,
                .admin-dark-mode .mini-btn:hover {
                    background: #334155 !important;
                    border-color: #38bdf8 !important;
                }

                .admin-dark-mode .premium-table th {
                    background: rgba(15, 23, 42, 0.3) !important;
                    color: #64748b !important;
                }

                .admin-dark-mode .premium-table tr {
                    background: transparent !important;
                }

                .admin-dark-mode .premium-table td {
                    border-bottom-color: rgba(255, 255, 255, 0.05) !important;
                    background: transparent !important;
                }

                .admin-dark-mode .premium-table tr:hover td {
                    background: rgba(30, 41, 59, 0.9) !important;
                    border-color: rgba(56, 189, 248, 0.4) !important;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
                }

                .admin-dark-mode .cell-subtitle {
                    color: #94a3b8 !important;
                }

                .admin-dark-mode .cell-date,
                .admin-dark-mode .cell-quote {
                    background: rgba(56, 189, 248, 0.05) !important;
                    color: #e2e8f0 !important;
                }

                .admin-dark-mode .cell-role {
                    color: #94a3b8 !important;
                }

                .admin-dark-mode .header-badge,
                .admin-dark-mode .item-count,
                .admin-dark-mode .premium-tag {
                    background: rgba(56, 189, 248, 0.1) !important;
                    color: #38bdf8 !important;
                    border: 1px solid rgba(56, 189, 248, 0.2) !important;
                }

                .admin-dark-mode .stat-pill {
                    background: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.05) !important;
                }

                .admin-dark-mode .date-badge {
                    color: #94a3b8 !important;
                }

                .admin-dark-mode .date-badge svg {
                    color: #38bdf8 !important;
                }
                
                .admin-dark-mode .card-outer {
                    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%) !important;
                }

                .admin-dark-mode .card-inner {
                    background: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.05) !important;
                }

                .admin-dark-mode .card-title {
                    color: #f8fafc !important;
                }

                .admin-dark-mode .card-description {
                    color: #94a3b8 !important;
                }

                .admin-dark-mode .card-btn {
                    background: #0f172a !important;
                    border-color: #1e293b !important;
                    color: #94a3b8 !important;
                }

                /* Tables & Forms */
                .admin-dark-mode .premium-table {
                    background: #1e293b !important;
                    border-color: #334155 !important;
                }

                .admin-dark-mode table thead tr {
                    background: #0f172a !important;
                    border-bottom-color: #334155 !important;
                }

                .admin-dark-mode th {
                    color: #94a3b8 !important;
                }

                .admin-dark-mode td {
                    color: #e2e8f0 !important;
                    border-bottom-color: #334155 !important;
                }

                .admin-dark-mode .premium-input,
                .admin-dark-mode .form-input,
                .admin-dark-mode input,
                .admin-dark-mode textarea,
                .admin-dark-mode select {
                    background: #0f172a !important;
                    border-color: #334155 !important;
                    color: #f8fafc !important;
                }

                .admin-dark-mode .form-label {
                    color: #94a3b8 !important;
                }

                .admin-dark-mode .form-section-title {
                    color: #38bdf8 !important;
                }

                .admin-dark-mode .form-outer {
                    background: rgba(30, 41, 59, 0.8) !important;
                    border-color: rgba(255, 255, 255, 0.05) !important;
                }

                .admin-dark-mode .form-inner {
                    background: transparent !important;
                }

                .admin-dark-mode .icon-btn {
                    background: #334155 !important;
                    color: #f8fafc !important;
                    border-color: #475569 !important;
                }

                .admin-dark-mode .btn-secondary {
                    background: #334155 !important;
                    color: #f8fafc !important;
                    border-color: #475569 !important;
                }

                .admin-dark-mode .btn-secondary:hover {
                    background: #475569 !important;
                }
            `}</style>
            {children}
        </div>
    );
}
