"use client";

import { X, Share2, Calendar, Clock, Eye, Heart, MessageSquare, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

interface Blog {
    id: string;
    title: string;
    date: string;
    header_image_url: string;
    view_count: number;
    like_count: number;
    tags: string | string[];
    read_minute?: number;
    reading_time_minutes: number;
    content: string;
}

interface BlogPreviewModalProps {
    blog: Blog;
    isOpen: boolean;
    onClose: () => void;
}

export default function BlogPreviewModal({ blog, isOpen, onClose }: BlogPreviewModalProps) {
    const { theme } = useTheme();
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    // Split content by paragraphs or just take first few sentences
    const contentPreview = blog.content ? blog.content.split('\n').slice(0, 10).join('\n') : "";

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className={`absolute inset-0 backdrop-blur-sm transition-opacity ${theme === 'light' ? 'bg-white/70' : 'bg-black/90'}`}
                onClick={onClose}
            />

            <div className={`relative w-full max-w-[900px] border overflow-hidden flex flex-col max-h-[90vh] ${theme === 'light' ? 'bg-white border-gray-200 shadow-[0_0_80px_rgba(0,0,0,0.1)]' : 'bg-[#0a0a0a] border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]'}`}>
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 z-50 p-2 rounded-full border transition-all ${theme === 'light' ? 'bg-black/5 hover:bg-black/10 border-black/10 text-black' : 'bg-black/50 hover:bg-black/80 border-white/10 text-white'}`}
                >
                    <X size={20} />
                </button>

                <div className="overflow-y-auto w-full custom-scrollbar">
                    {/* Header Image */}
                    <div className="preview-header-img">
                        <img
                            src={blog.header_image_url || "/assets/placeholder.jpg"}
                            alt={blog.title}
                        />
                    </div>

                    <div className="preview-modal-info">
                        {/* Title */}
                        <h1 className="preview-title">
                            {blog.title}
                        </h1>

                        {/* Meta & Stats Grouped */}
                        <div className="preview-meta-container">
                            <div className="preview-meta">
                                <div className="published-date">
                                    <Calendar size={18} className="icon-zinc" />
                                    <span>
                                        {(() => {
                                            try {
                                                const d = new Date(blog.date);
                                                return isNaN(d.getTime()) ? blog.date : d.toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                });
                                            } catch (e) {
                                                return blog.date;
                                            }
                                        })()}
                                    </span>
                                </div>

                                <div className="stats-group">
                                    <div className="stat-pill">
                                        <Eye size={16} />
                                        <span>{blog.view_count || 0} views</span>
                                    </div>
                                    <div className="stat-pill">
                                        <Heart size={16} />
                                        <span>{blog.like_count || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="preview-tags-container">
                                {(Array.isArray(blog.tags) ? blog.tags : (typeof blog.tags === 'string' ? blog.tags.split(',').map((t: string) => t.trim()) : [])).map((tag: string, i: number) => (
                                    <span key={i} className="preview-tag">
                                        {tag.replace(/^#+/, '#')}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Content Preview */}
                        <div className="preview-content">
                            {contentPreview}
                            <div className="content-fade" />
                        </div>

                        {/* Actions */}
                        <div className="aesthetic-btn-group">
                            <Link
                                href={`/blog/${blog.id}`}
                                className="aesthetic-btn-primary"
                                onClick={onClose}
                            >
                                <span className="btn-text">Read Full Article</span>
                                <span className="btn-icon">
                                    <ArrowRight size={20} />
                                </span>
                            </Link>
                            <button className="aesthetic-btn-secondary">
                                <Share2 size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .preview-header-img {
                    width: 100%;
                    aspect-ratio: 16/9;
                    overflow: hidden;
                    border-bottom: 1px solid var(--card-border);
                }

                .preview-header-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .preview-modal-info {
                    padding: 5rem 4rem;
                    text-align: left;
                    display: flex;
                    flex-direction: column;
                }

                .preview-title {
                    font-size: 3.2rem;
                    font-weight: 900;
                    color: var(--color-text-primary);
                    margin-bottom: 2.5rem;
                    line-height: 1.15;
                    letter-spacing: -0.04em;
                }

                .preview-meta-container {
                    margin-bottom: 3.5rem;
                    padding-bottom: 2.5rem;
                    border-bottom: 1px solid var(--card-border);
                }

                .preview-meta {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1.5rem;
                    margin-bottom: 1.75rem;
                }

                .published-date {
                    color: var(--color-text-secondary);
                    font-size: 1rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }

                .icon-zinc { color: var(--color-text-muted); }

                .stats-group {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .stat-pill {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    background: var(--card-bg);
                    padding: 0.5rem 1rem;
                    border-radius: 99px;
                    border: 1px solid var(--card-border);
                    color: var(--color-text-secondary);
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .preview-tags-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }

                .preview-tag {
                    padding: 0.4rem 0.9rem;
                    background: rgba(58, 153, 201, 0.1);
                    border: 1px solid rgba(117, 194, 230, 0.3);
                    border-radius: 2rem;
                    color: #75C2E6;
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .preview-content {
                    color: var(--color-text-secondary);
                    font-size: 1.25rem;
                    line-height: 1.9;
                    margin-bottom: 5rem;
                    position: relative;
                    white-space: pre-line;
                }

                .content-fade {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 8rem;
                    background: linear-gradient(transparent, var(--portfolio-bg));
                    pointer-events: none;
                }

                @media (max-width: 768px) {
                    .preview-modal-info { padding: 2.5rem 1.5rem; }
                    .preview-title { font-size: 1.9rem; margin-bottom: 1.5rem; }
                    .preview-meta-container { margin-bottom: 2.5rem; padding-bottom: 2rem; }
                    .preview-meta { gap: 1rem; margin-bottom: 1.25rem; }
                    .published-date { font-size: 0.85rem; width: 100%; }
                    .stats-group { width: 100%; justify-content: flex-start; gap: 0.75rem; }
                    .preview-content { font-size: 1.1rem; line-height: 1.75; margin-bottom: 4rem; }
                    .stat-pill { padding: 0.4rem 0.75rem; font-size: 0.75rem; }
                    .preview-tag { padding: 0.35rem 0.8rem; font-size: 0.65rem; }
                    .aesthetic-btn-group { gap: 1rem !important; margin-top: 2rem !important; }
                    .aesthetic-btn-primary { padding: 1rem 1.5rem !important; font-size: 0.8rem !important; letter-spacing: 0.15em !important; }
                    .aesthetic-btn-secondary { width: 50px !important; height: 50px !important; }
                }

                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            `}</style>
        </div>
    );
}
