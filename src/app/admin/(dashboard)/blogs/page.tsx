"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, FileText, Calendar, Eye, Heart, Sparkles } from "lucide-react";

interface Blog {
    id: string;
    title: string;
    date: string;
    view_count: number;
    like_count: number;
    tags: string;
}

export default function BlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await fetch("/api/blogs");
            const data = await res.json();
            setBlogs(data);
        } catch (error) {
            console.error("Error fetching blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteBlog = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog post?")) return;
        try {
            const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
            if (res.ok) {
                setBlogs(blogs.filter((b) => b.id !== id));
            } else {
                const errorData = await res.json();
                alert(`Failed to delete: ${errorData.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error deleting blog:", error);
            alert("Network error while deleting blog");
        }
    };

    if (loading) return <div className="loading-state">Loading blog posts...</div>;

    return (
        <div className="blog-hub-wrapper">
            {/* Background Blobs for Depth */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            <header className="page-header">
                <div className="header-top">
                    <div className="header-badge">
                        <Sparkles size={15} style={{ marginRight: '6px' }} />
                        Articles Management
                    </div>
                </div>
                <div className="title-row">
                    <h1 className="page-title">
                        Blog <span className="gradient-text">Posts</span>
                    </h1>
                </div>
                <p className="page-subtitle">Manage your intellectual property, tutorials, and industry insights with precision.</p>
            </header>

            <div className="content-container">
                <section className="glass-section table-section">
                    <div className="section-header">
                        <div className="section-title-box">
                            <FileText size={24} color="#1B4F72" />
                            <h2 className="section-title">Article Inventory</h2>
                        </div>
                        <Link
                            href="/admin/blogs/new"
                            id="btn-write-post"
                            className="btn-premium-add"
                        >
                            <Plus size={22} />
                            <span>Write New Post</span>
                        </Link>
                    </div>

                    <div className="table-wrapper">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Post Details</th>
                                    <th>Engagement Stats</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="empty-cell">
                                            <div className="empty-content">
                                                <FileText size={60} className="empty-icon" />
                                                <p>No blog posts found. Start sharing your knowledge!</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    blogs.map((b) => (
                                        <tr key={b.id}>
                                            <td>
                                                <div className="cell-primary post-title">{b.title}</div>
                                                <div className="post-meta">
                                                    <span className="date-badge">
                                                        <Calendar size={14} />
                                                        {b.date}
                                                    </span>
                                                    <div className="tags-container">
                                                        {b.tags?.split(',').map((tag, i) => (
                                                            <span key={i} className="premium-tag">
                                                                #{tag.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="stats-row">
                                                    <div className="stat-pill views">
                                                        <Eye size={18} />
                                                        <span>{b.view_count || 0}</span>
                                                    </div>
                                                    <div className="stat-pill likes">
                                                        <Heart size={18} />
                                                        <span>{b.like_count || 0}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <Link href={`/admin/blogs/${b.id}`} className="icon-btn edit">
                                                        <Edit size={20} />
                                                    </Link>
                                                    <button onClick={() => deleteBlog(b.id)} className="icon-btn delete">
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
                .blog-hub-wrapper {
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

                /* Table Styling */
                .table-wrapper { padding: 1.5rem; }
                .premium-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0 0.65rem;
                    table-layout: fixed;
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

                .premium-table th:nth-child(1) { width: 55%; }
                .premium-table th:nth-child(2) { width: 25%; }
                .premium-table th:nth-child(3) { width: 20%; text-align: right; }

                .premium-table tr td {
                    padding: 1.5rem 1.5rem;
                    background: #f8fafc;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 1px solid transparent;
                }

                .premium-table tr td:first-child { border-radius: 1.5rem 0 0 1.5rem; }
                .premium-table tr td:last-child { border-radius: 0 1.5rem 1.5rem 0; }

                .premium-table tr:hover td {
                    background: white;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.04);
                    transform: scale(1.005);
                    border-color: rgba(58, 153, 201, 0.1);
                    z-index: 10;
                    position: relative;
                }

                .cell-primary {
                    font-size: 1.15rem;
                    font-weight: 850;
                    color: #1e293b;
                    line-height: 1.3;
                }

                .post-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    margin-top: 0.75rem;
                }

                .date-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #94a3b8;
                }

                .tags-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .premium-tag {
                    font-size: 0.65rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #1B4F72;
                    background: rgba(27, 79, 114, 0.05);
                    padding: 0.2rem 0.6rem;
                    border-radius: 0.5rem;
                }

                /* Stats Row */
                .stats-row {
                    display: flex;
                    gap: 1rem;
                }

                .stat-pill {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0.8rem;
                    background: white;
                    border-radius: 1rem;
                    font-size: 0.85rem;
                    font-weight: 700;
                    border: 1px solid #f1f5f9;
                }

                .stat-pill.views { color: #3A99C9; }
                .stat-pill.likes { color: #ec4899; }

                /* Buttons & Actions */
                .action-btns {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    align-items: center;
                }

                .icon-btn {
                    width: 42px;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border-radius: 1rem;
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
                    padding: 0.75rem 1.6rem;
                    background: linear-gradient(135deg, #1B4F72 0%, #3A99C9 100%);
                    color: white !important;
                    border-radius: 1.5rem;
                    font-size: 0.9rem;
                    font-weight: 850;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-decoration: none !important;
                    box-shadow: 0 4px 15px rgba(27, 79, 114, 0.15);
                    border: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
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
                    .premium-table th:nth-child(1) { width: 50%; }
                    .premium-table th:nth-child(2) { width: 30%; }
                }

                @media (max-width: 768px) {
                    .blog-hub-wrapper { padding: 1.5rem; }
                    .glass-section { border-radius: 1.5rem; }
                    .section-header { padding: 1.5rem; flex-direction: column; gap: 1rem; align-items: flex-start; }
                    .btn-premium-add { width: 100%; justify-content: center; }
                    .premium-table th:nth-child(2), .premium-table td:nth-child(2) { display: none; }
                    .premium-table th:nth-child(1) { width: auto; }
                }
            `}</style>
        </div>
    );
}
