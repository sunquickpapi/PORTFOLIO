"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Heart, Share2, User, ChevronRight, MessageSquare, ArrowRight, Eye, Check } from "lucide-react";
import Footer from "@/components/Home/Footer";

interface Blog {
    id: string;
    title: string;
    date: string;
    header_image_url: string;
    view_count: number;
    like_count: number;
    reading_time_minutes: number;
    tags: string[];
    content: string;
}

interface BlogDetailProps {
    blog: Blog;
}

export default function BlogDetail({ blog }: BlogDetailProps) {
    const [likesCount, setLikesCount] = useState(blog?.like_count || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [isShared, setIsShared] = useState(false);

    useEffect(() => {
        // Sync likes if blog changes
        if (blog) setLikesCount(blog.like_count);
    }, [blog]);

    const handleLike = () => {
        if (!isLiked) {
            setLikesCount(prev => prev + 1);
            setIsLiked(true);
        } else {
            setLikesCount(prev => prev - 1);
            setIsLiked(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: blog.title,
                    text: `Check out this article: ${blog.title}`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log("Share failed:", err);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                setIsShared(true);
                setTimeout(() => setIsShared(false), 2000);
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        }
    };

    if (!blog) return null;

    return (
        <div className="bd-parallax-wrapper">
            {/* Drifting Geometric Background - Unified Identity */}
            <div className="bd-bg-canvas">
                <div className="bd-geo-bar bd-geo-1"></div>
                <div className="bd-geo-bar bd-geo-2"></div>
                <div className="bd-geo-bar bd-geo-4"></div>
                <div className="bd-geo-bar bd-geo-6"></div>
                <div className="bd-geo-bar bd-geo-8"></div>
            </div>

            <main className="bd-container">
                {/* Back to Journal Navigation - Horizontal Row Layout */}
                <div className="bd-nav-wrapper">
                    <Link href="/blog" className="bd-back-btn">
                        <div className="bd-btn-circle">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="bd-btn-text">BACK TO JOURNAL</span>
                    </Link>
                </div>

                {/* Hero Image Section */}
                <div className="bd-hero-frame">
                    <img
                        src={blog.header_image_url}
                        alt={blog.title}
                        className="bd-hero-img"
                    />
                </div>

                {/* Article Header */}
                <header className="bd-header">
                    <h1 className="bd-title">{blog.title}</h1>

                    <div className="bd-meta-strip">
                        <div className="bd-meta-pill">
                            <Calendar size={14} className="bd-meta-icon" />
                            <span>Published on {(() => {
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
                            })()}</span>
                        </div>
                        <span className="bd-meta-dot">·</span>
                        <div className="bd-meta-pill">
                            <Eye size={14} className="bd-meta-icon" />
                            <span>{blog.view_count || 0} views</span>
                        </div>
                        <span className="bd-meta-dot">·</span>
                        <div className="bd-meta-pill">
                            <Heart size={14} className="bd-meta-icon" />
                            <span>{blog.like_count || 0}</span>
                        </div>
                    </div>

                    <div className="bd-tag-cloud">
                        {(Array.isArray(blog.tags) ? blog.tags : (typeof blog.tags === 'string' ? (blog.tags as string).split(',').map(t => t.trim()) : [])).map((tag, idx) => (
                            <span key={idx} className="bd-tag">#{tag}</span>
                        ))}
                    </div>
                </header>

                {/* Main Content Area - Refined for fidelity */}
                <div className="bd-article-body">
                    <div
                        className="bd-prose"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                </div>

                {/* New Footer Engagement Card */}
                <div className="bd-engagement-zone">
                    <div className="bd-enjoy-card">
                        <h3 className="bd-enjoy-title">Enjoyed this article?</h3>
                        <p className="bd-enjoy-desc">Share it with your network and help others discover valuable insights!</p>

                        <div className="bd-enjoy-actions">
                            <button
                                className={`bd-enjoy-btn bd-btn-share ${isShared ? 'shared' : ''}`}
                                onClick={handleShare}
                            >
                                {isShared ? <Check size={16} /> : <Share2 size={16} />}
                                <span>{isShared ? 'Copied!' : 'Share'}</span>
                            </button>
                            <button
                                className={`bd-enjoy-btn bd-btn-like ${isLiked ? 'active' : ''}`}
                                onClick={handleLike}
                            >
                                <Heart size={16} fill={isLiked ? "currentColor" : "none"} className={isLiked ? 'bd-heart-pop' : ''} />
                                <span>{likesCount}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Navigation Row - Aesthetic Refined */}
                <div className="bd-footer-row">
                    <div className="bd-last-updated">
                        Last updated: {(() => {
                            try {
                                const d = new Date(blog.date);
                                return isNaN(d.getTime()) ? blog.date : d.toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                });
                            } catch (e) {
                                return blog.date;
                            }
                        })()}
                    </div>
                    <Link href="/blog" className="bd-pill-nav-btn">
                        <span>Read More Posts</span>
                    </Link>
                </div>
            </main>

            <div className="bd-footer-wrapper">
                <Footer />
            </div>

            <style jsx>{`
                .bd-parallax-wrapper {
                    min-height: 100vh;
                    background: var(--portfolio-bg);
                    color: var(--color-text-primary);
                    position: relative;
                    overflow-x: hidden;
                    font-family: 'Inter', sans-serif;
                }

                .bd-bg-canvas {
                    position: fixed;
                    inset: 0;
                    z-index: 0;
                    pointer-events: none;
                    opacity: 0.35;
                }

                .bd-geo-bar {
                    position: absolute;
                    background: linear-gradient(135deg, rgba(58, 153, 201, 0.4) 0%, rgba(27, 79, 114, 0.2) 100%);
                    transform: skewX(-20deg);
                    border-left: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 0 15px rgba(58, 153, 201, 0.2);
                    z-index: 0;
                }

                .bd-geo-1 { width: 400px; height: 40px; top: 10%; left: -50px; animation: bd-drift-diag 12s infinite linear; }
                .bd-geo-2 { width: 300px; height: 30px; top: 30%; right: 10%; animation: bd-drift-diag 15s infinite linear reverse; }
                .bd-geo-4 { width: 500px; height: 60px; bottom: 20%; left: 10%; animation: bd-drift-diag 11s infinite linear; }
                .bd-geo-6 { width: 250px; height: 25px; top: 50%; left: 30%; animation: bd-drift-diag 16s infinite linear; }
                .bd-geo-8 { width: 450px; height: 45px; bottom: -20px; right: 20%; animation: bd-drift-diag 14s infinite linear alternate; }

                @keyframes bd-drift-diag {
                    0% { transform: translate(0, 0) skewX(-20deg); }
                    50% { transform: translate(40px, -20px) skewX(-20deg); }
                    100% { transform: translate(0, 0) skewX(-20deg); }
                }

                .bd-container {
                    width: 100%;
                    max-width: 1200px;
                    padding: 4rem 1.5rem 8rem;
                    position: relative;
                    z-index: 10;
                    margin: 0 auto;
                }

                .bd-nav-wrapper {
                    margin-bottom: 3rem;
                    display: flex;
                    justify-content: flex-start;
                }

                :global(.bd-back-btn) {
                    display: flex !important;
                    align-items: center !important;
                    gap: 1.25rem !important;
                    text-decoration: none !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    width: fit-content !important;
                }

                .bd-btn-circle {
                    width: 2.25rem;
                    height: 2.25rem;
                    border-radius: 50%;
                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-text-primary);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .bd-back-btn:hover .bd-btn-circle {
                    background: white;
                    color: black;
                    transform: scale(1.1);
                }

                .bd-btn-text {
                    color: var(--color-text-muted);
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 0.2em;
                    transition: color 0.3s;
                }

                .bd-back-btn:hover .bd-btn-text {
                    color: var(--color-text-primary);
                }

                .bd-hero-frame {
                    width: 100%;
                    border-radius: 1.5rem;
                    overflow: hidden;
                    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.1);
                    margin-bottom: 4rem;
                    border: 1px solid var(--card-border);
                }

                .bd-hero-img {
                    width: 100%;
                    height: auto;
                    display: block;
                    transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .bd-header {
                    margin-bottom: 3rem;
                }

                .bd-title {
                    font-size: 3.5rem;
                    font-weight: 800;
                    line-height: 1.1;
                    letter-spacing: -0.04em;
                    color: var(--color-text-primary);
                    margin-bottom: 1.5rem;
                }

                .bd-meta-strip {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .bd-meta-pill {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    color: var(--color-text-secondary);
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .bd-meta-dot {
                    color: rgba(255, 255, 255, 0.2);
                    font-size: 1.2rem;
                }

                .bd-meta-icon {
                    color: var(--color-text-muted);
                }

                .bd-tag-cloud {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .bd-tag {
                    padding: 0.35rem 0.85rem;
                    background: rgba(58, 153, 201, 0.05);
                    border: 1px solid rgba(117, 194, 230, 0.2);
                    border-radius: 2rem;
                    color: #75C2E6;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: default;
                }

                .bd-tag:hover {
                    background: rgba(58, 153, 201, 0.12);
                    border-color: rgba(117, 194, 230, 0.4);
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(58, 153, 201, 0.2);
                }

                .bd-article-body {
                    margin-bottom: 6rem;
                }

                .bd-prose {
                    color: var(--color-text-secondary);
                    font-size: 1.125rem;
                    line-height: 1.8;
                    font-weight: 400;
                    white-space: pre-wrap;
                    word-break: break-word;
                }

                .bd-prose :global(span.bd-accent-header) {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--color-text-primary);
                    margin: 3.5rem 0 1.25rem;
                    letter-spacing: -0.02em;
                    line-height: 1.2;
                }

                .bd-engagement-zone {
                    margin-top: 6rem;
                    display: flex;
                    justify-content: center;
                }

                .bd-enjoy-card {
                    width: 100%;
                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
                    border-radius: 1.5rem;
                    padding: 2.5rem 2rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.25rem;
                }

                .bd-enjoy-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: var(--color-text-primary);
                    letter-spacing: -0.02em;
                }

                .bd-enjoy-desc {
                    color: var(--color-text-secondary);
                    font-size: 1rem;
                    max-width: 500px;
                    line-height: 1.6;
                }

                .bd-enjoy-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-top: 0.5rem;
                }

                .bd-enjoy-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.75rem;
                    font-weight: 700;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .bd-btn-share {
                    background: var(--portfolio-bg);
                    border: 1px solid var(--card-border);
                    color: var(--color-text-primary);
                }

                .bd-btn-share:hover {
                    background: var(--color-text-primary);
                    color: var(--portfolio-bg);
                    border-color: var(--color-text-primary);
                    transform: translateY(-2px);
                }

                .bd-btn-like {
                    background: transparent;
                    border: 1px solid var(--card-border);
                    color: var(--color-text-secondary);
                }

                .bd-btn-like:hover {
                    border-color: var(--color-text-primary);
                    color: var(--color-text-primary);
                }

                .bd-footer-row {
                    margin-top: 4rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-top: 2rem;
                    border-top: 1px solid var(--card-border);
                }

                .bd-last-updated {
                    color: var(--color-text-muted);
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                /* 
                   ==========================================================================
                   INDEPENDENT BUTTON: Read More Posts
                   Highly specific, isolated styling to prevent inheritance conflicts.
                   ==========================================================================
                */
                :global(.bd-pill-nav-btn) {
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    padding: 0.8rem 2.5rem !important;
                    background-color: var(--color-text-primary) !important;
                    background: var(--color-text-primary) !important;
                    border-radius: 100px !important;
                    color: var(--portfolio-bg) !important;
                    text-decoration: none !important;
                    font-weight: 700 !important;
                    font-size: 0.95rem !important;
                    cursor: pointer !important;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    white-space: nowrap !important;
                    border: none !important;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2) !important;
                    margin: 0 !important;
                    line-height: 1 !important;
                }

                :global(.bd-pill-nav-btn:hover) {
                    background-color: var(--color-accent-secondary) !important;
                    background: var(--color-accent-secondary) !important;
                    transform: translateY(-3px) !important;
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3) !important;
                    color: var(--portfolio-bg) !important;
                    text-decoration: none !important;
                }

                .bd-pill-nav-btn:active {
                    transform: translateY(-1px) !important;
                }

                .bd-footer-wrapper {
                    width: 100%;
                    background: var(--portfolio-bg);
                    border-top: 1px solid var(--card-border);
                    position: relative;
                    z-index: 10;
                    margin-top: 10rem !important; /* Massive separation for new dimension feel */
                    padding-bottom: 4rem;
                }

                /* Keyframe for premium Heart Pop */
                @keyframes heartPop {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.4); }
                    100% { transform: scale(1); }
                }

                .bd-heart-pop {
                    animation: heartPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    color: #ff4d4d;
                }

                .bd-btn-like.active {
                    background: rgba(255, 77, 77, 0.1) !important;
                    border-color: rgba(255, 77, 77, 0.2) !important;
                    color: #ff4d4d !important;
                }

                .bd-btn-share.shared {
                    background: rgba(58, 153, 201, 0.1) !important;
                    border-color: rgba(58, 153, 201, 0.2) !important;
                    color: #75C2E6 !important;
                }

                @media (max-width: 768px) {
                    .bd-title { font-size: 2.25rem; }
                    .bd-container { padding: 2rem 1rem 4rem; }
                    .bd-meta-strip { flex-wrap: wrap; }
                    .bd-footer-row { flex-direction: column; gap: 1.5rem; align-items: flex-start; text-align: left; }
                }
            `}</style>
        </div>
    );
}
