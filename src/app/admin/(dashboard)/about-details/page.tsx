"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Plus,
    Edit,
    Trash2,
    Briefcase,
    GraduationCap,
    Award,
    Heart,
    User,
    BarChart,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    Sparkles
} from "lucide-react";
import * as LucideIcons from "lucide-react";

// Types derived from existing implementations
interface Profile {
    id: string;
    name: string;
    role: string;
    tagline: string;
    bio: string;
    email: string;
    phone: string;
    location: string;
    github_url: string;
    linkedin_url: string;
    projects_count: number;
    experience_years: number;
    coffee_consumed: number;
    tech_learned_count: number;
    dumbells_lifted_count: number;
}

interface Experience {
    id: string;
    company: string;
    role: string;
    duration: string;
}

interface Education {
    id: string;
    institution: string;
    degree: string;
    years: string;
}

interface Certification {
    id: string;
    title: string;
    issuer: string;
    date: string;
}

interface Hobby {
    id: string;
    name: string;
    description: string;
    icon_name: string;
}

const DynamicIcon = ({ name, size = 20 }: { name: string, size?: number }) => {
    const IconComponent = (LucideIcons as any)[name];
    if (!IconComponent) return <Heart size={size} />;
    return <IconComponent size={size} />;
};

export default function AboutDetailsPage() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [experience, setExperience] = useState<Experience[]>([]);
    const [education, setEducation] = useState<Education[]>([]);
    const [certs, setCerts] = useState<Certification[]>([]);
    const [hobbies, setHobbies] = useState<Hobby[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pRes, exRes, edRes, cRes, hRes] = await Promise.all([
                fetch("/api/profile"),
                fetch("/api/experience"),
                fetch("/api/education"),
                fetch("/api/certifications"),
                fetch("/api/hobbies")
            ]);

            if (pRes.ok) setProfile(await pRes.json());
            if (exRes.ok) setExperience(await exRes.json());

            if (edRes.ok) {
                const edData = await edRes.json();
                setEducation(Array.isArray(edData) ? edData : []);
            } else {
                console.error("Failed to fetch education:", await edRes.text());
                setEducation([]);
            }

            if (cRes.ok) setCerts(await cRes.json());
            if (hRes.ok) setHobbies(await hRes.json());
        } catch (error) {
            console.error("Error fetching data:", error);
            // Ensure we don't leave arrays as undefined/null on fatal error
            if (experience.length === 0) setExperience([]);
            if (education.length === 0) setEducation([]);
            if (certs.length === 0) setCerts([]);
            if (hobbies.length === 0) setHobbies([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (type: string, id: string) => {
        if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
        try {
            const res = await fetch(`/api/${type === 'certifications' ? 'certifications' : type}/${id}`, { method: "DELETE" });
            if (res.ok) {
                if (type === 'experience') setExperience(experience.filter(i => i.id !== id));
                if (type === 'education') setEducation(education.filter(i => i.id !== id));
                if (type === 'certifications') setCerts(certs.filter(i => i.id !== id));
                if (type === 'hobbies') setHobbies(hobbies.filter(i => i.id !== id));
            }
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading About Details...</p>
            <style jsx>{`
                .loading-container {
                    height: 80vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #1B4F72;
                    font-weight: 600;
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(58, 153, 201, 0.1);
                    border-top-color: #3A99C9;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );

    return (
        <div className="about-wrapper">
            {/* Decorative Background Elements */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            <header className="page-header">
                <div className="header-top">
                    <div className="header-badge">
                        <Sparkles size={15} style={{ marginRight: '6px' }} />
                        About Customization
                    </div>
                </div>
                <div className="title-row">
                    <h1 className="page-title">
                        About <span className="gradient-text">Page Details</span>
                    </h1>
                </div>
                <p className="page-subtitle">Manage all content and professional metrics that appear on your About page.</p>
            </header>

            <div className="content-container">
                {/* Profile & Stats Section */}
                <section className="glass-section main-info-section">
                    <div className="section-header">
                        <div className="section-title-box">
                            <User size={24} color="#1B4F72" />
                            <h2 className="section-title">General Info & Bio</h2>
                        </div>
                        <Link href="/admin/profile"
                            id="btn-edit-profile-details"
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexDirection: 'row', whiteSpace: 'nowrap' }}
                            className="btn-edit-profile premium-glow">
                            <LucideIcons.Settings size={20} />
                            <span>Edit Profile Details</span>
                        </Link>
                    </div>

                    <div className="info-grid">
                        <div className="bio-side">
                            <div className="data-group">
                                <label>Current Role</label>
                                <p className="data-value role-text">{profile?.role || "Not set"}</p>
                            </div>
                            <div className="data-group">
                                <label>Bio Preview</label>
                                <p className="data-value bio-text">{profile?.bio || "No bio added yet."}</p>
                            </div>
                        </div>
                        <div className="stats-side">
                            <div className="stats-card">
                                <label>Experience</label>
                                <div className="stat-value">
                                    <span className="number">{profile?.experience_years || 0}</span>
                                    <span className="unit">Years</span>
                                </div>
                            </div>
                            <div className="stats-card">
                                <label>Projects</label>
                                <div className="stat-value">
                                    <span className="number">{profile?.projects_count || 0}</span>
                                </div>
                            </div>
                            <div className="stats-card">
                                <label>Coffee</label>
                                <div className="stat-value">
                                    <span className="number">{profile?.coffee_consumed || 0}</span>
                                </div>
                            </div>
                            <div className="stats-card">
                                <label>Techs</label>
                                <div className="stat-value">
                                    <span className="number">{profile?.tech_learned_count || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="dual-grid">
                    {/* Work Experience */}
                    <section className="glass-section table-section">
                        <div className="section-header">
                            <div className="section-title-box">
                                <Briefcase size={24} color="#3A99C9" />
                                <h2 className="section-title">Work Experience</h2>
                            </div>
                            <Link href="/admin/experience/new"
                                id="btn-add-experience"
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexDirection: 'row', whiteSpace: 'nowrap' }}
                                className="btn-add-item btn-exp">
                                <Plus size={20} />
                                <span>Add Experience</span>
                            </Link>
                        </div>
                        <div className="table-wrapper">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Company & Role</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {experience.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="empty-cell">No experience records found.</td>
                                        </tr>
                                    ) : (
                                        experience.map((exp) => (
                                            <tr key={exp.id}>
                                                <td>
                                                    <div className="cell-title">{exp.company}</div>
                                                    <div className="cell-sub">{exp.role}</div>
                                                </td>
                                                <td>
                                                    <div className="action-btns">
                                                        <Link href={`/admin/experience/${exp.id}`} className="icon-btn edit">
                                                            <Edit size={20} />
                                                        </Link>
                                                        <button onClick={() => handleDelete('experience', exp.id)} className="icon-btn delete">
                                                            <Trash2 size={20} />
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

                    {/* Education */}
                    <section className="glass-section table-section">
                        <div className="section-header">
                            <div className="section-title-box">
                                <GraduationCap size={24} color="#75C2E6" />
                                <h2 className="section-title">Education</h2>
                            </div>
                            <Link href="/admin/education/new"
                                id="btn-add-education"
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexDirection: 'row', whiteSpace: 'nowrap' }}
                                className="btn-add-item btn-edu">
                                <Plus size={20} />
                                <span>Add Education</span>
                            </Link>
                        </div>
                        <div className="table-wrapper">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Institution</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!Array.isArray(education) || education.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="empty-cell">No education records found.</td>
                                        </tr>
                                    ) : (
                                        education.map((edu) => (
                                            <tr key={edu.id}>
                                                <td>
                                                    <div className="cell-title">{edu.institution}</div>
                                                    <div className="cell-sub">{edu.degree}</div>
                                                </td>
                                                <td>
                                                    <div className="action-btns">
                                                        <Link href={`/admin/education/${edu.id}`} className="icon-btn edit">
                                                            <Edit size={20} />
                                                        </Link>
                                                        <button onClick={() => handleDelete('education', edu.id)} className="icon-btn delete">
                                                            <Trash2 size={20} />
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
                </div>

                <div className="dual-grid grid-thirds">
                    {/* Certifications */}
                    <section className="glass-section list-section col-span-2">
                        <div className="section-header">
                            <div className="section-title-box">
                                <Award size={24} color="#f59e0b" />
                                <h2 className="section-title">Certifications</h2>
                            </div>
                            <Link href="/admin/certifications/new"
                                id="btn-add-certification"
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexDirection: 'row', whiteSpace: 'nowrap' }}
                                className="btn-add-item btn-cert">
                                <Plus size={20} />
                                <span>Add Certification</span>
                            </Link>
                        </div>
                        <div className="items-grid cert-grid">
                            {certs.length === 0 ? (
                                <p className="empty-text">No certifications found.</p>
                            ) : (
                                certs.map((cert) => (
                                    <div key={cert.id} className="item-card cert-card">
                                        <div className="card-info">
                                            <h3 className="card-name">{cert.title}</h3>
                                            <p className="card-sub">{cert.issuer}</p>
                                        </div>
                                        <div className="card-actions">
                                            <Link href={`/admin/certifications/${cert.id}`} className="mini-btn edit">
                                                <Edit size={18} />
                                            </Link>
                                            <button onClick={() => handleDelete('certifications', cert.id)} className="mini-btn delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Hobbies */}
                    <section className="glass-section list-section col-span-2">
                        <div className="section-header">
                            <div className="section-title-box">
                                <Heart size={24} color="#ec4899" />
                                <h2 className="section-title">Hobbies</h2>
                            </div>
                            <Link href="/admin/hobbies/new"
                                id="btn-add-hobby"
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexDirection: 'row', whiteSpace: 'nowrap' }}
                                className="btn-add-item btn-hobby">
                                <Plus size={20} />
                                <span>Add Hobby</span>
                            </Link>
                        </div>
                        <div className="hobbies-list">
                            {hobbies.length === 0 ? (
                                <p className="empty-text">No hobbies found.</p>
                            ) : (
                                hobbies.map((hobby) => (
                                    <div key={hobby.id} className="hobby-item">
                                        <div className="hobby-icon">
                                            <DynamicIcon name={hobby.icon_name} size={20} />
                                        </div>
                                        <div className="hobby-info">
                                            <h4 className="hobby-name">{hobby.name}</h4>
                                        </div>
                                        <div className="item-actions">
                                            <Link href={`/admin/hobbies/${hobby.id}`} className="mini-btn">
                                                <Edit size={18} />
                                            </Link>
                                            <button onClick={() => handleDelete('hobbies', hobby.id)} className="mini-btn delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <style jsx>{`
                .about-wrapper {
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

                .bg-blob {
                    position: absolute;
                    width: 500px;
                    height: 500px;
                    border-radius: 50%;
                    filter: blur(100px);
                    z-index: -1;
                    opacity: 0.12;
                    pointer-events: none;
                }

                .blob-1 { top: -100px; right: -50px; background: radial-gradient(circle, #75C2E6 0%, transparent 70%); }
                .blob-2 { bottom: 0; left: -50px; background: radial-gradient(circle, #3A99C9 0%, transparent 70%); }

                .page-header {
                    margin-bottom: 4rem;
                    text-align: center;
                    width: 100%;
                    max-width: 1400px;
                }

                .header-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.4rem 1.2rem;
                    background: white;
                    color: #3A99C9;
                    border-radius: 100px;
                    font-size: 0.72rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    box-shadow: 0 4px 20px rgba(58, 153, 201, 0.12);
                    border: 1px solid rgba(58, 153, 201, 0.1);
                    margin-bottom: 1.5rem;
                }

                .title-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1.5rem;
                    margin-bottom: 1rem;
                }

                .page-title {
                    font-size: 3rem;
                    font-weight: 950;
                    color: #1B4F72;
                    letter-spacing: -0.05em;
                    margin: 0;
                    line-height: 1.1;
                }

                .gradient-text {
                    background: linear-gradient(135deg, #1B4F72 0%, #3A99C9 50%, #75C2E6 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .live-preview-link {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 0.6rem 1.2rem;
                    background: white;
                    color: #64748b;
                    border-radius: 0.85rem;
                    font-size: 0.85rem;
                    font-weight: 700;
                    border: 1px solid #e2e8f0;
                    transition: all 0.3s ease;
                    text-decoration: none;
                }

                .live-preview-link:hover {
                    color: #1B4F72;
                    border-color: #3A99C9;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    transform: translateY(-2px);
                }

                .page-subtitle {
                    color: #64748b;
                    font-size: 1.15rem;
                    font-weight: 500;
                    letter-spacing: -0.01em;
                }

                .content-container {
                    width: 100%;
                    max-width: 1400px;
                    display: flex;
                    flex-direction: column;
                    gap: 2.5rem;
                }

                .glass-section {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px);
                    border-radius: 2rem;
                    border: 1px solid rgba(255, 255, 255, 1);
                    box-shadow: 0 20px 40px -10px rgba(27, 79, 114, 0.05);
                    overflow: hidden;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .glass-section:hover {
                    box-shadow: 0 25px 50px -12px rgba(27, 79, 114, 0.08);
                }

                .section-header {
                    padding: 1.75rem 2.25rem;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(248, 250, 252, 0.5);
                }

                .section-title-box {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .section-title {
                    font-size: 1.35rem;
                    font-weight: 800;
                    color: #1B4F72;
                    letter-spacing: -0.02em;
                    margin: 0;
                }

                :global(.btn-edit-profile) {
                    padding: 0.6rem 1.25rem;
                    background: #f8fafc;
                    color: #1B4F72;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.85rem;
                    font-size: 0.85rem;
                    font-weight: 800;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-decoration: none !important;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                }

                :global(.btn-edit-profile:hover) {
                    color: #3A99C9 !important;
                    border-color: #3A99C9 !important;
                    background: white !important;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(58, 153, 201, 0.12) !important;
                }

                :global(.premium-glow:hover) {
                    box-shadow: 0 0 20px rgba(58, 153, 201, 0.2);
                }

                :global(.btn-add-item) {
                    padding: 0.6rem 1.4rem;
                    background: linear-gradient(135deg, #1B4F72 0%, #3A99C9 100%);
                    color: white !important;
                    border-radius: 0.85rem;
                    font-size: 0.85rem;
                    font-weight: 850;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-decoration: none !important;
                    box-shadow: 0 4px 15px rgba(27, 79, 114, 0.15);
                    border: none;
                }

                :global(.btn-add-item:hover) {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 12px 25px rgba(27, 79, 114, 0.25) !important;
                    filter: brightness(1.1);
                }

                /* Independent Section Buttons Override Placeholders */
                :global(.btn-exp) { /* Experience specific control */ }
                :global(.btn-edu) { /* Education specific control */ }
                :global(.btn-cert) { /* Certifications specific control */ }
                :global(.btn-hobby) { /* Hobbies specific control */ }

                /* Info Grid Layout */
                .info-grid {
                    padding: 2.5rem;
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 3rem;
                }

                .data-group {
                    margin-bottom: 1.5rem;
                }

                .data-group label {
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    display: block;
                    margin-bottom: 0.4rem;
                }

                .role-text {
                    font-size: 1.25rem;
                    font-weight: 750;
                    color: #1e293b;
                }

                .bio-text {
                    font-size: 0.95rem;
                    color: #64748b;
                    line-height: 1.7;
                    display: -webkit-box;
                    -webkit-line-clamp: 4;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .stats-side {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.25rem;
                }

                .stats-card {
                    background: #f8fafc;
                    padding: 1.25rem;
                    border-radius: 1.5rem;
                    border: 1px solid #f1f5f9;
                    transition: all 0.3s ease;
                }

                .stats-card:hover {
                    transform: translateY(-4px);
                    background: white;
                    border-color: #3A99C9;
                    box-shadow: 0 10px 20px rgba(58, 153, 201, 0.05);
                }

                .stats-card label {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    display: block;
                    margin-bottom: 0.5rem;
                }

                .stat-value {
                    display: flex;
                    align-items: baseline;
                    gap: 0.3rem;
                }

                .stat-value .number {
                    font-size: 1.75rem;
                    font-weight: 900;
                    color: #1B4F72;
                    letter-spacing: -0.02em;
                }

                .stat-value .unit {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #64748b;
                }

                /* Tables & Dual Grids */
                .dual-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 2.5rem;
                }

                .grid-thirds {
                    grid-template-columns: 1fr 0.5fr;
                }

                .table-wrapper {
                    padding: 0;
                }

                .premium-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .premium-table th {
                    text-align: left;
                    padding: 1rem 2rem;
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    background: rgba(248, 250, 252, 0.3);
                }

                .premium-table td {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid #f8fafc;
                }

                .cell-title {
                    font-weight: 800;
                    color: #334155;
                    font-size: 0.95rem;
                    margin-bottom: 0.2rem;
                }

                .cell-sub {
                    font-size: 0.8rem;
                    color: #64748b;
                    font-weight: 500;
                }

                .action-btns {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 0.75rem;
                }

                .icon-btn {
                    width: 38px;
                    height: 38px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border-radius: 0.85rem;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-decoration: none;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                }

                .icon-btn:hover {
                    color: #3A99C9;
                    border-color: #3A99C9;
                    transform: translateY(-3px);
                    box-shadow: 0 6px 15px rgba(58, 153, 201, 0.15);
                }

                .icon-btn.edit:hover {
                    background: rgba(58, 153, 201, 0.05);
                }

                .icon-btn.delete { color: #ef4444; }
                .icon-btn.delete:hover { 
                    color: #ef4444;
                    border-color: #ef4444;
                    background: rgba(239, 68, 68, 0.05);
                    box-shadow: 0 6px 15px rgba(239, 68, 68, 0.15);
                }

                /* List & Items Grid */
                .items-grid {
                    padding: 2rem;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.25rem;
                }

                .item-card {
                    padding: 1.25rem;
                    background: #f8fafc;
                    border-radius: 1.25rem;
                    border: 1px solid #f1f5f9;
                    transition: all 0.3s ease;
                }

                .item-card:hover {
                    background: white;
                    border-color: #e2e8f0;
                    transform: translateY(-3px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.03);
                }

                .cert-card {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.5rem !important;
                    background: #f8fafc !important;
                    border: 1px solid #f1f5f9 !important;
                    border-radius: 1.25rem;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .cert-card:hover {
                    background: white !important;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.03);
                    border-color: rgba(58, 153, 201, 0.2) !important;
                }

                .card-info {
                    flex: 1;
                    min-width: 0;
                    text-align: left;
                }

                .card-name {
                    font-size: 0.95rem;
                    font-weight: 800;
                    color: #1e293b;
                    margin-bottom: 0.15rem;
                    line-height: 1.3;
                }

                .cert-grid {
                    grid-template-columns: 1fr !important;
                }

                .card-sub {
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: #64748b;
                }

                .cert-card .card-actions {
                    display: flex;
                    align-items: center;
                    gap: 1.15rem;
                    margin-left: auto;
                }

                .cert-card .card-actions .edit {
                    color: #3A99C9;
                    background: transparent;
                    border: none;
                    box-shadow: none;
                    width: auto;
                    height: auto;
                }

                .cert-card .card-actions .edit:hover {
                    transform: scale(1.1);
                    background: transparent;
                }



                /* Hobbies List */
                .hobbies-list {
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .hobby-item {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    padding: 1rem 1.25rem;
                    background: #f8fafc;
                    border-radius: 1.25rem;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 1px solid transparent;
                }

                .hobby-item:hover {
                    background: white;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.03);
                    transform: translateY(-3px) scale(1.01);
                    border-color: rgba(58, 153, 201, 0.1);
                }

                .hobby-icon {
                    width: 34px;
                    height: 34px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    color: #ec4899;
                    border-radius: 0.75rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                }

                .hobby-name {
                    font-size: 0.95rem;
                    font-weight: 800;
                    color: #334155;
                }

                .item-actions {
                    margin-left: auto;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }

                .card-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding-left: 0.5rem;
                }

                .mini-btn {
                    width: 34px;
                    height: 34px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border-radius: 0.75rem;
                    border: 1px solid #e2e8f0;
                    color: #3A99C9;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-decoration: none;
                    cursor: pointer;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
                }

                .mini-btn:hover {
                    transform: translateY(-2px);
                    border-color: #3A99C9;
                    box-shadow: 0 5px 12px rgba(58, 153, 201, 0.12);
                }

                .mini-btn.delete { color: #ef4444; }
                .mini-btn.delete:hover {
                    border-color: #ef4444;
                    background: rgba(239, 68, 68, 0.05);
                    box-shadow: 0 5px 12px rgba(239, 68, 68, 0.12);
                }

                .empty-text {
                    padding: 3rem;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 0.85rem;
                    font-style: italic;
                }

                .empty-cell {
                    padding: 4rem 2rem;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 0.85rem;
                }

                @media (max-width: 1200px) {
                    .info-grid, .dual-grid { grid-template-columns: 1fr; }
                    .stats-side { grid-template-columns: repeat(4, 1fr); }
                    .page-title { font-size: 2.5rem; }
                }

                @media (max-width: 768px) {
                    .stats-side { grid-template-columns: repeat(2, 1fr); }
                    .about-wrapper { padding: 1.5rem; }
                    .section-header { padding: 1.5rem; }
                    .page-title { font-size: 2rem; }
                }
            `}</style>
        </div>
    );
}
