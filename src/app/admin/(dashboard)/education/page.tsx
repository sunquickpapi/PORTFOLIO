"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Sparkles, GraduationCap } from "lucide-react";

interface Education {
    id: string;
    institution: string;
    degree: string;
    years: string;
}

export default function EducationPage() {
    const [education, setEducation] = useState<Education[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEducation();
    }, []);

    const fetchEducation = async () => {
        const res = await fetch("/api/education");
        const data = await res.json();
        setEducation(data);
        setLoading(false);
    };

    const deleteEducation = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/education/${id}`, { method: "DELETE" });
        if (res.ok) setEducation(education.filter((e) => e.id !== id));
    };

    if (loading) return <div className="p-8">Loading education history...</div>;

    return (
        <div className="education-wrapper">
            {/* Background Blobs for Depth */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            <header className="page-header">
                <div className="header-top">
                    <div className="header-badge">
                        <Sparkles size={12} style={{ marginRight: '6px' }} />
                        Academic Records
                    </div>
                </div>
                <div className="title-row">
                    <h1 className="page-title">
                        Education <span className="gradient-text">History</span>
                    </h1>
                </div>
                <p className="page-subtitle">Manage your academic journey, degrees, and institutions in one centralized hub.</p>
            </header>

            <div className="content-container">
                <section className="glass-section table-section">
                    <div className="section-header">
                        <div className="section-title-box">
                            <GraduationCap size={18} color="#1B4F72" />
                            <h2 className="section-title">Institutional Management</h2>
                        </div>
                        <Link
                            href="/admin/education/new"
                            id="btn-add-education"
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexDirection: 'row', whiteSpace: 'nowrap' }}
                            className="btn-premium-add"
                        >
                            <Plus size={18} />
                            <span>Add Education</span>
                        </Link>
                    </div>

                    <div className="table-wrapper">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Institution</th>
                                    <th>Degree / Qualification</th>
                                    <th>Period</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {education.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="empty-cell">No education records found.</td>
                                    </tr>
                                ) : (
                                    education.map((e) => (
                                        <tr key={e.id}>
                                            <td>
                                                <div className="cell-title">{e.institution}</div>
                                            </td>
                                            <td>
                                                <div className="cell-subtitle">{e.degree}</div>
                                            </td>
                                            <td>
                                                <div className="cell-date">{e.years}</div>
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <Link href={`/admin/education/${e.id}`} className="icon-btn edit">
                                                        <Edit size={16} />
                                                    </Link>
                                                    <button onClick={() => deleteEducation(e.id)} className="icon-btn delete">
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
            </div>

            <style jsx>{`
                .education-wrapper {
                    animation: fadeIn 0.8s ease-out;
                    padding: 3rem;
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
                    opacity: 0.12;
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
                    max-width: 1300px;
                    display: flex;
                    flex-direction: column;
                    gap: 2.5rem;
                    z-index: 1;
                }

                /* Header Styling */
                .page-header {
                    text-align: center;
                    margin-bottom: 4rem;
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

                /* Table Styling */
                .table-wrapper { padding: 1.5rem; }
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
                    transform: scale(1.002);
                }

                .cell-title {
                    font-size: 1rem;
                    font-weight: 850;
                    color: #1e293b;
                }

                .cell-subtitle {
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #64748b;
                }

                .cell-date {
                    font-size: 0.85rem;
                    color: #1B4F72;
                    font-weight: 700;
                    background: rgba(58, 153, 201, 0.08);
                    padding: 0.4rem 0.8rem;
                    border-radius: 0.75rem;
                    display: inline-block;
                }

                /* Buttons & Actions */
                .action-btns {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 0.75rem;
                }

                .icon-btn {
                    width: 40px;
                    height: 40px;
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

                .icon-btn.delete:hover {
                    color: #ef4444;
                    border-color: #ef4444;
                    box-shadow: 0 6px 15px rgba(239, 68, 68, 0.15);
                }

                :global(.btn-premium-add) {
                    padding: 0.8rem 1.6rem;
                    background: linear-gradient(135deg, #1B4F72 0%, #3A99C9 100%);
                    color: white !important;
                    border-radius: 1.25rem;
                    font-size: 0.9rem;
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
                    .page-title { font-size: 2.5rem; }
                    .education-wrapper { padding: 2rem; }
                }

                @media (max-width: 768px) {
                    .premium-table th:nth-child(3),
                    .premium-table td:nth-child(3) { display: none; }
                }
            `}</style>
        </div>
    );
}
