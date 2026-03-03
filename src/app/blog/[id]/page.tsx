"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BlogDetail from "@/components/Blog/BlogDetail";

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

    if (loading) {
        return (
            <div className="blog-page min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-current opacity-20"></div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="blog-page min-h-screen flex flex-col items-center justify-center gap-4">
                <h1 className="text-4xl font-bold">Article Not Found</h1>
                <Link href="/blog" className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all">
                    <ArrowLeft size={18} />
                    Back to Blog
                </Link>
            </div>
        );
    }

    return <BlogDetail blog={blog} />;
}
