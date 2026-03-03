"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Cpu, Sparkles } from "lucide-react";

interface Skill {
    id: string;
    name: string;
    category: string;
}

export default function SkillsPage() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const res = await fetch("/api/skills");
            const data = await res.json();
            setSkills(data);
        } catch (error) {
            console.error("Error fetching skills:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteSkill = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
        if (res.ok) setSkills(skills.filter((s) => s.id !== id));
    };

    // Group skills by category
    const categories = Array.from(new Set(skills.map((s) => s.category)));

    if (loading) return <div className="loading-state">Loading skills...</div>;

    return (
        <div className="skills-hub-wrapper">
            {/* Background Blobs for Depth */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            <header className="page-header">
                <div className="header-top">
                    <div className="header-badge">
                        <Sparkles size={15} style={{ marginRight: '6px' }} />
                        Skills Management
                    </div>
                </div>
                <div className="title-row">
                    <h1 className="page-title">
                        Manage <span className="gradient-text">Skills</span>
                    </h1>
                </div>
                <p className="page-subtitle">Organize and refine your technical stack and creative competencies.</p>
            </header>

            <div className="content-container">
                <div className="top-actions">
                    <Link
                        href="/admin/skills/new"
                        id="btn-add-skill"
                        className="btn-premium-add"
                    >
                        <Plus size={22} />
                        <span>Add New Skill</span>
                    </Link>
                </div>

                <div className="categories-stack">
                    {categories.map((cat) => (
                        <section key={cat} className="glass-section category-section">
                            <div className="section-header">
                                <div className="section-title-box">
                                    <Cpu size={24} color="#1B4F72" />
                                    <h2 className="section-title">{cat}</h2>
                                </div>
                                <span className="item-count">
                                    {skills.filter((s) => s.category === cat).length} Skills
                                </span>
                            </div>

                            <div className="skills-grid">
                                {skills
                                    .filter((s) => s.category === cat)
                                    .map((skill) => (
                                        <div key={skill.id} className="skill-card">
                                            <span className="skill-name">{skill.name}</span>
                                            <div className="action-btns">
                                                <Link href={`/admin/skills/${skill.id}`} className="icon-btn edit">
                                                    <Edit size={18} />
                                                </Link>
                                                <button onClick={() => deleteSkill(skill.id)} className="icon-btn delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </section>
                    ))}

                    {skills.length === 0 && (
                        <div className="glass-section empty-state">
                            <Cpu size={64} className="empty-icon" />
                            <p>No skills added yet. Start by adding your first technology!</p>
                            <Link href="/admin/skills/new" className="btn-premium-add mt-4">
                                <Plus size={22} />
                                <span>Add Skill</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .skills-hub-wrapper {
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

                .loading-state {
                    padding: 4rem;
                    text-align: center;
                    color: #64748b;
                    font-weight: 600;
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

                /* Top Actions */
                .top-actions {
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 2rem;
                }

                /* Categories Stack */
                .categories-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 2.5rem;
                }

                /* Glass Sections */
                .glass-section {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    border-radius: 2.5rem;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.03);
                    overflow: hidden;
                    transition: all 0.3s ease;
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

                .item-count {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #94a3b8;
                    background: #f1f5f9;
                    padding: 0.4rem 0.8rem;
                    border-radius: 1rem;
                }

                /* Skills Grid */
                .skills-grid {
                    padding: 2rem 2.5rem;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.25rem;
                }

                .skill-card {
                    background: #f8fafc;
                    padding: 1.25rem 1.5rem;
                    border-radius: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 1px solid transparent;
                }

                .skill-card:hover {
                    background: white;
                    transform: scale(1.05) translateY(-5px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.06);
                    border-color: rgba(58, 153, 201, 0.1);
                    z-index: 10;
                }

                .skill-name {
                    font-size: 1rem;
                    font-weight: 750;
                    color: #1e293b;
                }

                /* Buttons & Actions */
                .action-btns {
                    display: flex;
                    gap: 0.6rem;
                    align-items: center;
                }

                .icon-btn {
                    width: 34px;
                    height: 34px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border-radius: 0.75rem;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .icon-btn:hover {
                    color: #3A99C9;
                    background: rgba(58, 153, 201, 0.05);
                    border-color: #3A99C9;
                    transform: scale(1.1);
                }

                .icon-btn.delete:hover {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.05);
                    border-color: #ef4444;
                }

                :global(.btn-premium-add) {
                    padding: 0.8rem 1.8rem;
                    background: linear-gradient(135deg, #1B4F72 0%, #3A99C9 100%);
                    color: white !important;
                    border-radius: 1.5rem;
                    font-size: 0.9rem;
                    font-weight: 850;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-decoration: none !important;
                    box-shadow: 0 4px 15px rgba(27, 79, 114, 0.15);
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
                    border: none;
                }

                :global(.btn-premium-add:hover) {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 12px 25px rgba(27, 79, 114, 0.25) !important;
                    filter: brightness(1.1);
                }

                .empty-state {
                    padding: 5rem 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                    text-align: center;
                }

                .empty-icon {
                    color: #cbd5e1;
                    opacity: 0.5;
                }

                @media (max-width: 1024px) {
                    .page-title { font-size: 2.5rem; }
                }

                @media (max-width: 768px) {
                    .skills-hub-wrapper { padding: 1.5rem; }
                    .glass-section { border-radius: 1.5rem; }
                    .section-header { padding: 1.5rem; }
                    .skills-grid { padding: 1.5rem; grid-template-columns: 1fr; }
                    .btn-premium-add { width: 100%; justify-content: center; }
                }
            `}</style>
        </div>
    );
}
