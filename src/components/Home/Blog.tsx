"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Blog {
    id: string;
    title: string;
    date: string;
    header_image_url: string;
    view_count: number;
    like_count: number;
    tags: string;
    read_minute: number;
    content: string;
}

export default function Blog() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await fetch("/api/blogs");
                const data = await res.json();
                setBlogs(data.slice(0, 3)); // Only show latest 3 on home
            } catch (error) {
                console.error("Error fetching blogs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    if (loading) return (
        <section id="blog-latest">
            <div className="container container-wide">
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-800"></div>
                </div>
            </div>
        </section>
    );

    if (blogs.length === 0) return null;

    return (
        <section id="blog-latest">
            <div className="bg-animation-container">
                <div className="geo-bar geo-1"></div>
                <div className="geo-bar geo-2"></div>
                <div className="geo-bar geo-4"></div>
                <div className="geo-bar geo-6"></div>
                <div className="geo-bar geo-8"></div>
            </div>
            <div className="container container-wide">
                <div className="section-header">
                    <h2>Latest Blog Posts</h2>
                    <p className="section-subtitle text-lg max-w-3xl mx-auto italic text-center leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                        Stay updated with my latest thoughts, tutorials, and insights about web development and technology.
                    </p>

                    <div className="header-actions" style={{ marginTop: "2rem" }}>
                        <Link href="/blog" className="btn btn-view-all">
                            <span>View All Posts</span>
                        </Link>
                    </div>
                </div>

                <div className="blog-grid">
                    {blogs.map((b) => (
                        <div key={b.id} className="blog-card">
                            <div className="blog-card-image">
                                {b.header_image_url ? (
                                    <img
                                        src={b.header_image_url}
                                        alt={b.title}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).parentElement?.classList.add('placeholder-image');
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="placeholder-image"></div>
                                )}
                                <div className="placeholder-fallback">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                        <circle cx="9" cy="9" r="2" />
                                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                    </svg>
                                </div>
                            </div>
                            <div className="blog-card-content">
                                <div className="blog-meta">
                                    <span className="blog-date">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M8 2v4" />
                                            <path d="M16 2v4" />
                                            <rect width="18" height="18" x="3" y="4" rx="2" />
                                            <path d="M3 10h18" />
                                        </svg>
                                        {b.date}
                                    </span>
                                    <div className="blog-stats">
                                        <span className="flex items-center gap-1.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                                fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                            {b.view_count || 0}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                                fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                            </svg>
                                            {b.like_count || 0}
                                        </span>
                                    </div>
                                </div>
                                <h3 className="blog-title">{b.title}</h3>
                                <div className="blog-tags-mini">
                                    {b.tags?.split(',').map((tag, i) => (
                                        <span key={i} className="tag-mini">
                                            #{tag.trim()}
                                        </span>
                                    ))}
                                </div>
                                <Link href={`/blog/${b.id}`} className="btn btn-read-more-blog">
                                    Read More <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14" />
                                        <path d="m12 5 7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
