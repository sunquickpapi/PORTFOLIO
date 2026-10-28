"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Courier_Prime } from "next/font/google";
import BlogDetail from "@/components/Blog/BlogDetail";
import PixelField from "@/components/Home/PixelField";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

interface Blog {
    id: string;
    title: string;
    date: string;
    header_image_url: string;
    view_count: number;
    like_count: number;
    tags: string[];
    reading_time_minutes: number;
    content: string;
}

export default function BlogArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await fetch(`/api/blogs/${resolvedParams.id}`);
                if (res.ok) {
                    const data = await res.json();
                    // Map generic API data to strict Blog interface for BlogDetail
                    const mappedBlog: Blog = {
                        ...data,
                        reading_time_minutes: data.reading_time_minutes || data.read_minute || 5,
                        tags: Array.isArray(data.tags)
                            ? data.tags
                            : (typeof data.tags === 'string'
                                ? data.tags.split(',').map((t: string) => t.trim())
                                : [])
                    };
                    setBlog(mappedBlog);
                }
            } catch (error) {
                console.error("Error fetching blog:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [resolvedParams.id]);

    if (loading || !blog) {
        return (
            <div style={{ position: "relative", minHeight: "100vh", display: "grid", placeItems: "center" }}>
                <PixelField />
                <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center", padding: 20 }}>
                    <span className={courier.className} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.24em", color: "#3a7ca5" }}>
                        {loading ? "LOADING POST…" : "404 · POST NOT FOUND"}
                    </span>
                    {!loading && (
                        <Link
                            href="/blog"
                            className={courier.className}
                            style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 20px", borderRadius: 999, background: "#0d2a42", color: "#e9f4fa", fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textDecoration: "none", opacity: 1 }}
                        >
                            <ArrowLeft size={16} /> ALL POSTS
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    return <BlogDetail blog={blog} />;
}
