"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Award, Sparkles } from "lucide-react";

interface Certification {
    id: string;
    title: string;
    issuer: string;
    date: string;
}

export default function CertificationsPage() {
    const [certs, setCerts] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCerts();
    }, []);

    const fetchCerts = async () => {
        try {
            const res = await fetch("/api/certifications");
            const data = await res.json();
            setCerts(data);
        } catch (error) {
            console.error("Error fetching certifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteCert = async (id: string) => {
        if (!confirm("Are you sure you want to delete this certification?")) return;
        const res = await fetch(`/api/certifications/${id}`, { method: "DELETE" });
        if (res.ok) setCerts(certs.filter((c) => c.id !== id));
    };

    if (loading) return <div className="p-8">Loading certifications...</div>;

    return (
        <div className="cert-hub-wrapper">
            {/* Background Blobs for Depth */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            <header className="page-header">
                <div className="header-top">
                    <div className="header-badge">
                        <Sparkles size={15} style={{ marginRight: '6px' }} />
                        Certifications Management
                    </div>
                </div>
                <div className="title-row">
                    <h1 className="page-title">
                        Certifications <span className="gradient-text">& Credentials</span>
                    </h1>
                </div>
                <p className="page-subtitle">Verify and manage your professional achievements and academic accolades.</p>
            </header>

            <div className="content-container">
                <section className="glass-section table-section">
                    <div className="section-header">
                        <div className="section-title-box">
                            <Award size={24} color="#1B4F72" />
                            <h2 className="section-title">Verified Achievements</h2>
                        </div>
                        <Link
                            href="/admin/certifications/new"
                            id="btn-add-certification"
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexDirection: 'row', whiteSpace: 'nowrap' }}
                            className="btn-premium-add"
                        >
                            <Plus size={22} />
                            <span>Add Certification</span>
                        </Link>
                    </div>

                    <div className="table-wrapper">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Issuer</th>
                                    <th>Date</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {certs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="empty-cell">
                                            <div className="empty-content">
                                                <Award size={60} className="empty-icon" />
                                                <p>No certifications added yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    certs.map((c) => (
                                        <tr key={c.id}>
                                            <td>
                                                <div className="cell-primary">{c.title}</div>
                                            </td>
                                            <td>
                                                <div className="cell-secondary">{c.issuer}</div>
                                            </td>
                                            <td>
                                                <div className="cell-date">{c.date}</div>
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <Link href={`/admin/certifications/${c.id}`} className="icon-btn edit">
                                                        <Edit size={20} />
                                                    </Link>
                                                    <button onClick={() => deleteCert(c.id)} className="icon-btn delete">
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

            <style jsx>{`
                .cert-hub-wrapper {
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
                    border-spacing: 0 0.65rem;
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
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 1px solid transparent;
                }

                .premium-table tr td:first-child { border-radius: 1.25rem 0 0 1.25rem; }
                .premium-table tr td:last-child { border-radius: 0 1.25rem 1.25rem 0; }

                .premium-table tr:hover td {
                    background: white;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.04);
                    transform: scale(1.005);
                    border-color: rgba(58, 153, 201, 0.1);
                    z-index: 10;
                    position: relative;
                }

                .cell-primary {
                    font-size: 1rem;
                    font-weight: 800;
                    color: #1e293b;
                }

                .cell-secondary {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #475569;
                }

                .cell-date {
                    font-size: 0.85rem;
                    color: #64748b;
                    font-weight: 500;
                }

                /* Buttons & Actions */
                .action-btns {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    align-items: center;
                }

                .icon-btn {
                    width: 38px;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border-radius: 0.85rem;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                }

                .icon-btn:hover {
                    color: #3A99C9;
                    background: rgba(58, 153, 201, 0.05);
                    border-color: #3A99C9;
                    transform: translateY(-3px);
                    box-shadow: 0 6px 15px rgba(58, 153, 201, 0.15);
                }

                .icon-btn.delete:hover {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.05);
                    border-color: #ef4444;
                    box-shadow: 0 6px 15px rgba(239, 68, 68, 0.15);
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
                }

                .empty-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    color: #94a3b8;
                    font-size: 0.85rem;
                }

                .empty-icon {
                    opacity: 0.2;
                }

                @media (max-width: 1024px) {
                    .page-title { font-size: 2.5rem; }
                }

                @media (max-width: 768px) {
                    .cert-hub-wrapper { padding: 1.5rem; }
                    .glass-section { border-radius: 1.5rem; }
                    .section-header { padding: 1.5rem; flex-direction: column; gap: 1rem; align-items: flex-start; }
                    .btn-premium-add { width: 100%; justify-content: center; }
                    .action-btns { flex-direction: row; }
                }
            `}</style>
        </div>
    );
}
