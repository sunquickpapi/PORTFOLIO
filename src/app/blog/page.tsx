"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Calendar, Eye, Heart, MessageSquare, ArrowRight, Share2, Bookmark, User, Clock, ChevronRight, Layout, Code, Mail, Filter } from "lucide-react";
import BlogPreviewModal from "@/components/Blog/BlogPreviewModal";
import Footer from "@/components/Home/Footer";

interface Blog {
    id: string;
    title: string;
    date: string;
    created_at?: string; // Add fallback timestamp
    header_image_url: string;
    view_count: number;
    like_count: number;
    tags: string | string[];
    read_minute?: number;
    reading_time_minutes: number;
    content: string;
}

export default function BlogAllPage() {
    const router = useRouter();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">("newest");
    const [activeTag, setActiveTag] = useState("all");
    const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await fetch("/api/blogs");
                if (res.ok) {
                    const data = await res.json();
                    const mappedBlogs = data.map((b: any) => ({
                        ...b,
                        reading_time_minutes: b.reading_time_minutes || b.read_minute || 5,
                        tags: b.tags || ""
                    }));
                    setBlogs(mappedBlogs);
                    setFilteredBlogs(mappedBlogs);
                }
            } catch (error) {
                console.error("Error fetching blogs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    useEffect(() => {
        let result = [...blogs];

        // Search
        if (searchQuery) {
            result = result.filter(b => {
                const titleMatch = b.title.toLowerCase().includes(searchQuery.toLowerCase());
                const tagStr = Array.isArray(b.tags) ? b.tags.join(',') : (b.tags || "");
                const tagMatch = tagStr.toLowerCase().includes(searchQuery.toLowerCase());
                return titleMatch || tagMatch;
            });
        }

        // Tag Filter
        if (activeTag !== "all") {
            result = result.filter(b => {
                const tagStr = Array.isArray(b.tags) ? b.tags.join(',') : (b.tags || "");
                return tagStr.split(',').map(t => t.trim().toLowerCase()).includes(activeTag.toLowerCase());
            });
        }

        // Helper to parse dates like "Jan 22nd, 2026"
        const parseRobustDate = (blog: Blog) => {
            if (!blog.date) return blog.created_at ? new Date(blog.created_at).getTime() : 0;

            // Remove ordinal suffixes (st, nd, rd, th) from numbers
            // e.g., "Jan 22nd, 2026" -> "Jan 22, 2026"
            const cleanDateStr = blog.date.replace(/(\d+)(st|nd|rd|th)/i, '$1');
            const parsed = new Date(cleanDateStr).getTime();

            // Fallback to created_at if manual date is still unparseable
            if (isNaN(parsed) && blog.created_at) {
                return new Date(blog.created_at).getTime();
            }
            return isNaN(parsed) ? 0 : parsed;
        };

        // Sorting
        if (sortBy === "newest") {
            result.sort((a, b) => parseRobustDate(b) - parseRobustDate(a));
        } else if (sortBy === "oldest") {
            result.sort((a, b) => parseRobustDate(a) - parseRobustDate(b));
        } else if (sortBy === "popular") {
            result.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
        }

        setFilteredBlogs(result);
    }, [searchQuery, activeTag, sortBy, blogs]);

    const allTags = Array.from(new Set(blogs.flatMap(b => {
        const tagStr = Array.isArray(b.tags) ? b.tags.join(',') : (b.tags || "");
        return tagStr.split(',').map(t => t.trim()) || [];
    }))).sort();

    return (
        <div className="blog-page min-h-screen selection:bg-blue-500/30 text-white relative">
            {/* Background Layers */}
            <div className="bg-animation-container">
                <div className="geo-bar geo-1"></div>
                <div className="geo-bar geo-2"></div>
                <div className="geo-bar geo-4"></div>
                <div className="geo-bar geo-6"></div>
                <div className="geo-bar geo-8"></div>
            </div>

            <Link
                href="/#blog-latest"
                className="unq-portal-link unq-portal-fixed"
                onClick={(e) => {
                    e.preventDefault();
                    router.push('/#blog-latest');
                }}
            >
                <div className="unq-portal-icon-wrapper">
                    <ArrowLeft size={18} />
                </div>
                <span className="unq-portal-text">
                    BACK TO HOME
                </span>
            </Link>

            {loading ? (
                <div className="container container-wide">
                    <div className="flex justify-center py-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/20"></div>
                    </div>
                </div>
            ) : (
                <div className="container container-wide" style={{ maxWidth: "1400px", position: "relative", zIndex: 10 }}>
                    {/* Hero Section */}
                    <header className="blog-hero" style={{ position: "relative", padding: "60px 0 40px" }}>
                        <span className="blog-badge mb-4">Latest Blog Posts</span>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">Blog Posts</h1>
                        <p className="text-white/50 text-xl max-w-2xl mx-auto">Discover insights, tutorials, and thoughts on development, design, and technology</p>
                    </header>

                    {/* Search & Filter */}
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search blog posts, topics, or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="filter-actions">
                        <div className="flex gap-4 items-center filter-inner">
                            <div className="relative group filter-btn-wrapper">
                                <button className="btn-filter flex items-center gap-2 w-full justify-center">
                                    <Filter className="w-4 h-4" />
                                    Tags: {activeTag === "all" ? "All" : activeTag}
                                </button>
                                <div className="tf-dropdown">
                                    <div className="tf-header">
                                        <h4 className="tf-title">Filter by Tags</h4>
                                        <button
                                            onClick={() => setActiveTag("all")}
                                            className={`tf-reset-btn ${activeTag === "all" ? "active" : ""}`}
                                        >
                                            Reset
                                        </button>
                                    </div>
                                    <div className="tf-scroll-area custom-scrollbar">
                                        <div className="tf-pill-container">
                                            <button
                                                onClick={() => setActiveTag("all")}
                                                className={`tf-pill ${activeTag === "all" ? "active" : ""}`}
                                            >
                                                All Tags
                                            </button>
                                            {allTags.map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={() => setActiveTag(tag)}
                                                    className={`tf-pill ${activeTag === tag ? "active" : ""}`}
                                                >
                                                    #{tag.replace(/^#+/, '')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative group filter-btn-wrapper">
                                <button className="btn-filter flex items-center gap-2 w-full justify-center">
                                    <Share2 className="w-4 h-4" />
                                    Sort: {sortBy === "newest" ? "Newest First" : sortBy === "oldest" ? "Oldest First" : "Most Popular"}
                                </button>
                                <div className="sf-dropdown">
                                    <button
                                        onClick={() => setSortBy("newest")}
                                        className={`sf-option ${sortBy === "newest" ? "active" : ""}`}
                                    >
                                        Newest First
                                    </button>
                                    <button
                                        onClick={() => setSortBy("oldest")}
                                        className={`sf-option ${sortBy === "oldest" ? "active" : ""}`}
                                    >
                                        Oldest First
                                    </button>
                                    <button
                                        onClick={() => setSortBy("popular")}
                                        className={`sf-option ${sortBy === "popular" ? "active" : ""}`}
                                    >
                                        Most Popular
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="blog-stats-line">
                        <span>{filteredBlogs.length} posts found</span>
                        <span>Page 1 of 1</span>
                    </div>

                    <div className="blog-grid">
                        {filteredBlogs.map((b) => (
                            <div key={b.id} className="blog-card blog-card-detailed">
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
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                            <circle cx="9" cy="9" r="2" />
                                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="blog-card-content">
                                    <h3 className="blog-title">{b.title}</h3>
                                    <div className="blog-tags-mini">
                                        {(Array.isArray(b.tags) ? b.tags : (typeof b.tags === 'string' ? b.tags.split(',').map((t: string) => t.trim()) : [])).map((tag: string, i: number) => (
                                            <span key={i} className="tag-mini">#{tag}</span>
                                        ))}
                                    </div>
                                    <p className="blog-excerpt text-white/50 leading-relaxed text-sm line-clamp-3">
                                        {b.content?.substring(0, 160)}...
                                    </p>

                                    <div className="blog-footer-meta">
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <div className="blog-stats">
                                                <span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                                        fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg> {b.view_count || 0}
                                                </span>
                                                <span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                                        fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path
                                                            d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                                    </svg> {b.like_count || 0}
                                                </span>
                                            </div>
                                            <span className="blog-date">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {b.date}
                                            </span>
                                        </div>
                                        <div className="read-time">
                                            <Clock className="w-3.5 h-3.5" />
                                            {b.read_minute} min read
                                        </div>
                                    </div>

                                    <div className="blog-detailed-actions">
                                        <Link href={`/blog/${b.id}`} className="btn btn-blog-action btn-blog-primary">Read More</Link>
                                        <button
                                            onClick={() => setSelectedBlog(b)}
                                            className="btn btn-blog-action btn-blog-secondary"
                                        >
                                            Preview
                                        </button>
                                        <button className="btn-blog-share">
                                            <Share2 className="w-4.5 h-4.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {selectedBlog && (
                <BlogPreviewModal
                    blog={selectedBlog}
                    isOpen={!!selectedBlog}
                    onClose={() => setSelectedBlog(null)}
                />
            )}

            {/* Separated Footer Section */}
            <div className="sf-footer-section">
                <Footer />
            </div>

        </div>
    );
}
