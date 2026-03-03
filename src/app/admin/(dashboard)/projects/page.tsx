"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Layout, Code, Camera, Save, Sparkles } from "lucide-react";
import { Project } from "@/types/project";
import * as LucideIcons from "lucide-react";

export default function ProjectsDashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"hero" | "dev" | "photo">("hero");

    // Project Settings State
    const [settings, setSettings] = useState({
        hero_title: "",
        hero_subtitle: "",
        hero_value_prop: "",
        projects_completed_count: "",
        photography_shoots_count: "",
        years_coding_count: ""
    });
    const [savingSettings, setSavingSettings] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [projRes, setRes] = await Promise.all([
                fetch("/api/projects"),
                fetch("/api/project-settings")
            ]);

            const projData = await projRes.json();
            const setData = await setRes.json();

            setProjects(projData);
            setSettings(setData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            const res = await fetch("/api/project-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                alert("Settings saved successfully!");
                setIsEditing(false); // Disable editing after save
            } else {
                alert("Failed to save settings");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
        } finally {
            setSavingSettings(false);
        }
    };

    const deleteProject = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;

        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setProjects(projects.filter((p) => p.id !== id));
            } else {
                alert("Failed to delete project");
            }
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };

    if (loading) return <div className="p-8">Loading dashboard...</div>;

    const devProjects = projects.filter(p => p.category !== "Photography");
    const photoProjects = projects.filter(p => p.category === "Photography");

    return (
        <div className="projects-wrapper">
            {/* Background Blobs for Depth */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            <header className="page-header">
                <div className="header-top">
                    <div className="header-badge">
                        <Sparkles size={15} style={{ marginRight: '6px' }} />
                        Projects Management
                    </div>
                </div>
                <div className="title-row">
                    <h1 className="page-title">
                        All <span className="gradient-text">Project Hub</span>
                    </h1>
                </div>
                <p className="page-subtitle">Centralized control for your portfolio's development projects and photographic shoots.</p>
            </header>

            <div className="content-container">
                {/* Tabs Navigation */}
                <div className="tabs-container">
                    <div className="tabs-nav">
                        <button
                            onClick={() => setActiveTab("hero")}
                            className={`tab-item ${activeTab === "hero" ? "active" : ""}`}
                        >
                            <Layout size={24} />
                            <span>Hero Banner</span>
                            {activeTab === "hero" && <div className="tab-indicator" />}
                        </button>
                        <button
                            onClick={() => setActiveTab("dev")}
                            className={`tab-item ${activeTab === "dev" ? "active" : ""}`}
                        >
                            <Code size={24} />
                            <span>Development</span>
                            {activeTab === "dev" && <div className="tab-indicator" />}
                        </button>
                        <button
                            onClick={() => setActiveTab("photo")}
                            className={`tab-item ${activeTab === "photo" ? "active" : ""}`}
                        >
                            <Camera size={24} />
                            <span>Photography</span>
                            {activeTab === "photo" && <div className="tab-indicator" />}
                        </button>
                    </div>
                </div>

                {/* Tab: Hero Banner Settings */}
                {activeTab === "hero" && (
                    <div className="glass-section settings-section">
                        <div className="section-header">
                            <div className="section-title-box">
                                <Layout size={24} color="#1B4F72" />
                                <h2 className="section-title">Gallery Hero Settings</h2>
                            </div>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`btn-edit-toggle ${isEditing ? 'active' : ''}`}
                            >
                                {isEditing ? <LucideIcons.X size={20} /> : <Edit size={20} />}
                                <span>{isEditing ? "Cancel" : "Edit Settings"}</span>
                            </button>
                        </div>

                        <form onSubmit={handleSaveSettings} className="premium-form">
                            <div className="form-grid">
                                <div className="input-group">
                                    <label>Hero Main Title</label>
                                    <input
                                        value={settings.hero_title || ""}
                                        onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                                        placeholder="e.g., Full Portfolio"
                                        readOnly={!isEditing}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Hero Subtitle</label>
                                    <input
                                        value={settings.hero_subtitle || ""}
                                        onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                                        placeholder="e.g., Complete Project History"
                                        readOnly={!isEditing}
                                    />
                                </div>
                                <div className="input-group full-width">
                                    <label>Value Proposition (Bio)</label>
                                    <textarea
                                        rows={3}
                                        value={settings.hero_value_prop || ""}
                                        onChange={(e) => setSettings({ ...settings, hero_value_prop: e.target.value })}
                                        placeholder="A comprehensive showcase of my journey..."
                                        readOnly={!isEditing}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Projects Completed Count</label>
                                    <input
                                        value={settings.projects_completed_count || ""}
                                        onChange={(e) => setSettings({ ...settings, projects_completed_count: e.target.value })}
                                        placeholder="e.g., 3+"
                                        readOnly={!isEditing}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Photographic Shoot Count</label>
                                    <input
                                        value={settings.photography_shoots_count || ""}
                                        onChange={(e) => setSettings({ ...settings, photography_shoots_count: e.target.value })}
                                        placeholder="e.g., 900+"
                                        readOnly={!isEditing}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Years in Coding</label>
                                    <input
                                        value={settings.years_coding_count || ""}
                                        onChange={(e) => setSettings({ ...settings, years_coding_count: e.target.value })}
                                        placeholder="e.g., 4+"
                                        readOnly={!isEditing}
                                    />
                                </div>
                            </div>
                            {isEditing && (
                                <div className="form-footer">
                                    <button
                                        type="submit"
                                        disabled={savingSettings}
                                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexDirection: 'row', whiteSpace: 'nowrap' }}
                                        className="btn-premium-save"
                                    >
                                        <Save size={22} />
                                        <span>{savingSettings ? "Saving..." : "Save Settings"}</span>
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                )}

                {/* Tab: Development Projects */}
                {activeTab === "dev" && (
                    <section className="glass-section table-section">
                        <div className="section-header">
                            <div className="section-title-box">
                                <Code size={24} color="#3A99C9" />
                                <h2 className="section-title">Development Projects</h2>
                            </div>
                            <Link
                                href="/admin/projects/new"
                                id="btn-add-project"
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexDirection: 'row', whiteSpace: 'nowrap' }}
                                className="btn-premium-add btn-project-add"
                            >
                                <Plus size={18} />
                                <span>Add Project</span>
                            </Link>
                        </div>

                        <div className="table-wrapper">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Project Title</th>
                                        <th>Completion Date</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {devProjects.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="empty-cell">No development projects found.</td>
                                        </tr>
                                    ) : (
                                        devProjects.map((project) => (
                                            <tr key={project.id}>
                                                <td>
                                                    <div className="cell-title">{project.title}</div>
                                                </td>
                                                <td>
                                                    <div className="cell-date">{project.date}</div>
                                                </td>
                                                <td>
                                                    <div className="action-btns">
                                                        <Link href={`/admin/projects/${project.id}`} className="icon-btn edit">
                                                            <Edit size={16} />
                                                        </Link>
                                                        <button onClick={() => deleteProject(project.id)} className="icon-btn delete">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* Tab: Photography Feed */}
                {activeTab === "photo" && (
                    <section className="glass-section table-section">
                        <div className="section-header">
                            <div className="section-title-box">
                                <Camera size={24} color="#059669" />
                                <h2 className="section-title">Photographic Shoots</h2>
                            </div>
                            <Link
                                href="/admin/projects/new?category=Photography"
                                id="btn-add-shoot"
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexDirection: 'row', whiteSpace: 'nowrap' }}
                                className="btn-premium-add btn-shoot-add"
                            >
                                <Plus size={18} />
                                <span>Add Shoot</span>
                            </Link>
                        </div>

                        <div className="table-wrapper">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Shoot Preview & Title</th>
                                        <th>Tag</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {photoProjects.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="empty-cell">No photography projects found.</td>
                                        </tr>
                                    ) : (
                                        photoProjects.map((project) => (
                                            <tr key={project.id}>
                                                <td>
                                                    <div className="project-preview-cell">
                                                        <img src={project.image_url} alt="" className="preview-img" />
                                                        <div className="cell-title">{project.title}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="premium-badge">Photography</span>
                                                </td>
                                                <td>
                                                    <div className="action-btns">
                                                        <Link href={`/admin/projects/${project.id}`} className="icon-btn edit">
                                                            <Edit size={16} />
                                                        </Link>
                                                        <button onClick={() => deleteProject(project.id)} className="icon-btn delete">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>

            <style jsx>{`
                .projects-wrapper {
                    animation: fadeIn 0.8s ease-out;
                    padding: 2.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    width: 100%;
                    min-height: calc(100vh - 80px);
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Background Blobs */
                .bg-blob {
                    position: fixed;
                    width: 600px;
                    height: 600px;
                    border-radius: 50%;
                    filter: blur(80px);
                    z-index: -1;
                    opacity: 0.15;
                    animation: blobFloat 20s infinite alternate;
                }

                .blob-1 {
                    background: #1B4F72;
                    top: -100px;
                    right: -100px;
                }

                .blob-2 {
                    background: #3A99C9;
                    bottom: -150px;
                    left: -100px;
                    animation-delay: -5s;
                }

                @keyframes blobFloat {
                    from { transform: translate(0, 0) scale(1); }
                    to { transform: translate(40px, 40px) scale(1.1); }
                }

                .content-container {
                    width: 100%;
                    max-width: 1400px;
                    display: flex;
                    flex-direction: column;
                    gap: 2.5rem;
                    z-index: 1;
                }

                /* Header Styling */
                .page-header {
                    text-align: center;
                    margin-bottom: 3.5rem;
                }

                .header-top {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                }

                .header-badge {
                    display: inline-flex;
                    align-items: center;
                    background: rgba(27, 79, 114, 0.05);
                    color: #1B4F72;
                    padding: 0.5rem 1rem;
                    border-radius: 2rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    border: 1px solid rgba(27, 79, 114, 0.1);
                }

                .page-title {
                    font-size: 3.5rem;
                    font-weight: 900;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                    margin-bottom: 1rem;
                }

                .gradient-text {
                    background: linear-gradient(135deg, #1B4F72 0%, #3A99C9 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .page-subtitle {
                    font-size: 1.15rem;
                    color: #64748b;
                    max-width: 600px;
                    margin: 0 auto;
                    line-height: 1.6;
                }

                /* Tabs System */
                .tabs-container {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 1rem;
                }

                .tabs-nav {
                    display: flex;
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    padding: 0.4rem;
                    border-radius: 1.25rem;
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    gap: 0.5rem;
                }

                .tab-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1.5rem;
                    border-radius: 1rem;
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #64748b;
                    transition: all 0.3s ease;
                    position: relative;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                }

                .tab-item:hover {
                    color: #1B4F72;
                    background: rgba(255, 255, 255, 0.5);
                }

                .tab-item.active {
                    color: #1B4F72;
                    background: white;
                    box-shadow: 0 4px 12px rgba(27, 79, 114, 0.08);
                }

                .tab-indicator {
                    position: absolute;
                    bottom: -1px;
                    left: 20%;
                    right: 20%;
                    height: 2px;
                    background: #1B4F72;
                    border-radius: 2px;
                }

                /* Glass Sections */
                .glass-section {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    border-radius: 2rem;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.03);
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .glass-section:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 45px rgba(0,0,0,0.05);
                }

                .section-header {
                    padding: 2rem 2.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(0,0,0,0.03);
                }

                .section-title-box {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .section-title {
                    font-size: 1.35rem;
                    font-weight: 850;
                    color: #1B4F72;
                    margin: 0;
                }

                /* Premium Form */
                .premium-form { padding: 2.5rem; }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .input-group.full-width { grid-column: span 2; }

                .input-group label {
                    font-size: 0.85rem;
                    font-weight: 800;
                    color: #334155;
                    margin-left: 0.2rem;
                }

                .premium-form input, .premium-form textarea {
                    padding: 1rem 1.25rem;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    font-size: 0.95rem;
                    color: #1e293b;
                    transition: all 0.3s ease;
                }

                .premium-form input:focus, .premium-form textarea:focus {
                    background: white;
                    border-color: #3A99C9;
                    box-shadow: 0 0 0 4px rgba(58, 153, 201, 0.1);
                    outline: none;
                }

                .premium-form input[readonly], .premium-form textarea[readonly] {
                    background: rgba(248, 250, 252, 0.5);
                    cursor: default;
                    border-color: transparent;
                }

                .premium-form input[readonly]:focus, .premium-form textarea[readonly]:focus {
                    box-shadow: none;
                    border-color: transparent;
                }

                .btn-edit-toggle {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 0.6rem 1.2rem;
                    background: white;
                    color: #1B4F72;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.85rem;
                    font-size: 0.85rem;
                    font-weight: 800;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                }

                .btn-edit-toggle:hover {
                    transform: translateY(-2px);
                    border-color: #3A99C9;
                    color: #3A99C9;
                    box-shadow: 0 4px 12px rgba(58, 153, 201, 0.1);
                }

                .btn-edit-toggle.active {
                    background: #f1f5f9;
                    color: #64748b;
                    border-color: #cbd5e1;
                }

                .form-footer {
                    margin-top: 2.5rem;
                    display: flex;
                    justify-content: flex-end;
                }

                /* Table Styling */
                .table-wrapper { padding: 1rem; }
                .premium-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0 0.5rem;
                }

                .premium-table th {
                    padding: 1rem 1.5rem;
                    text-align: left;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #64748b;
                }

                .premium-table tr td {
                    padding: 1.25rem 1.5rem;
                    background: #f8fafc;
                    transition: all 0.2s ease;
                }

                .premium-table tr td:first-child { border-radius: 1.25rem 0 0 1.25rem; }
                .premium-table tr td:last-child { border-radius: 0 1.25rem 1.25rem 0; }

                .premium-table tr:hover td {
                    background: white;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                }

                .cell-title {
                    font-size: 0.95rem;
                    font-weight: 800;
                    color: #334155;
                }

                .cell-date {
                    font-size: 0.85rem;
                    color: #64748b;
                    font-weight: 500;
                }

                .project-preview-cell {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }

                .preview-img {
                    width: 50px;
                    height: 50px;
                    border-radius: 0.85rem;
                    object-fit: cover;
                    border: 2px solid white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }

                .premium-badge {
                    padding: 0.35rem 0.85rem;
                    background: rgba(5, 150, 105, 0.08);
                    color: #059669;
                    border-radius: 2rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                /* Buttons & Actions */
                .action-btns {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 0.75rem;
                }

                .icon-btn {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border-radius: 0.75rem;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                }

                .icon-btn:hover {
                    color: #3A99C9;
                    background: rgba(58, 153, 201, 0.05);
                    border-color: #3A99C9;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(58, 153, 201, 0.15);
                }

                .icon-btn.delete:hover {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.05);
                    border-color: #ef4444;
                    box-shadow: 0 5px 15px rgba(239, 68, 68, 0.15);
                }

                :global(.btn-premium-save) {
                    padding: 0.8rem 2rem;
                    background: #1B4F72;
                    color: white !important;
                    border-radius: 1.25rem;
                    font-size: 1rem;
                    font-weight: 800;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-decoration: none !important;
                    box-shadow: 0 4px 15px rgba(27, 79, 114, 0.15);
                    border: none;
                }

                :global(.btn-premium-save:hover) {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 10px 25px rgba(27, 79, 114, 0.25) !important;
                    background: #3A99C9 !important;
                }

                :global(.btn-premium-add) {
                    padding: 0.6rem 1.4rem;
                    background: linear-gradient(135deg, #1B4F72 0%, #3A99C9 100%);
                    color: white !important;
                    border-radius: 1.25rem;
                    font-size: 0.85rem;
                    font-weight: 850;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-decoration: none !important;
                    box-shadow: 0 4px 15px rgba(27, 79, 114, 0.15);
                    border: none;
                }

                :global(.btn-premium-add:hover) {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 12px 25px rgba(27, 79, 114, 0.25) !important;
                    filter: brightness(1.1);
                }

                .empty-cell {
                    padding: 4rem 2rem;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 0.85rem;
                }

                @media (max-width: 1024px) {
                    .form-grid { grid-template-columns: 1fr; }
                    .page-title { font-size: 2.5rem; }
                }

                @media (max-width: 768px) {
                    .projects-wrapper { padding: 1.5rem; }
                    .section-header { padding: 1.5rem; }
                    .tab-item span { display: none; }
                }
            `}</style>
        </div>
    );
}
