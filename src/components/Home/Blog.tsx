"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Courier_Prime } from "next/font/google";
import FileLink from "./FileLink";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

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

const firstTag = (tags?: string) =>
    (tags || "")
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean)[0] || "";

function Cover({ b, big }: { b: Blog; big?: boolean }) {
    const [broken, setBroken] = useState(false);
    return (
        <span className={`bl-cover ${big ? "is-big" : ""}`}>
            {b.header_image_url && !broken ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.header_image_url} alt="" draggable={false} onError={() => setBroken(true)} />
            ) : (
                <span className="bl-noimg" />
            )}
        </span>
    );
}

function Meta({ b }: { b: Blog }) {
    const tag = firstTag(b.tags);
    return (
        <span className={`bl-meta ${courier.className}`}>
            <span>{(b.date || "").toUpperCase()}</span>
            {tag && (
                <>
                    <span className="bl-slash">/</span>
                    <span className="bl-pill">{tag.toUpperCase()}</span>
                </>
            )}
        </span>
    );
}

/**
 * Latest posts, editorial style: the featured post large on the left, the other two
 * stacked on the right. Click one on the right to bring it to the front; the featured
 * one opens the post.
 */
export default function Blog() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<number[]>([0, 1, 2]);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await fetch("/api/blogs");
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                const data = await res.json();
                if (!Array.isArray(data)) throw new Error("Invalid response");
                setBlogs(data.slice(0, 3)); // exactly the 3 latest
            } catch (error) {
                console.error("Error fetching blogs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    if (loading)
        return (
            <section id="blog-latest">
                <div className="container container-wide">
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-800"></div>
                    </div>
                </div>
            </section>
        );
    if (blogs.length === 0) return null;

    const ord = order.filter((i) => i < blogs.length);
    const lead = blogs[ord[0]];
    const side = ord.slice(1).map((i) => ({ i, b: blogs[i] }));
    // the clicked post swaps places with the featured one
    const feature = (i: number) => setOrder((o) => o.map((x) => (x === i ? o[0] : x === o[0] ? i : x)));

    return (
        <section
            id="blog-latest"
            /* one full screen like the other sections, content centred below the nav bar */
            style={{ minHeight: "100svh", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", padding: "110px 0 50px", scrollMarginTop: 0 }}
        >
            <div className="bl-wrap">
                <div className={`bl-grid ${side.length ? "" : "is-solo"}`}>
                    {/* featured, left */}
                    <Link href={`/blog/${lead.id}`} className="bl-lead" key={`lead-${lead.id}`}>
                        <Cover b={lead} big />
                        <Meta b={lead} />
                        <h3 className="bl-lead-title">{lead.title}</h3>
                        <span className={`bl-read ${courier.className}`}>
                            READ · {lead.read_minute || 1} MIN <span className="bl-arrow">→</span>
                        </span>
                    </Link>

                    {/* the other two, right */}
                    {side.length > 0 && (
                        <div className="bl-side">
                            {side.map(({ i, b }) => (
                                <button type="button" key={`side-${b.id}`} className="bl-item" onClick={() => feature(i)} aria-label={`Show ${b.title}`}>
                                    <Cover b={b} />
                                    <Meta b={b} />
                                    <span className="bl-item-title">{b.title}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="file-link-row" style={{ marginTop: 44 }}>
                    <FileLink href="/blog" no="05" title="View All Posts" />
                </div>
            </div>

            <style jsx>{`
                .bl-wrap {
                    width: 100%;
                    max-width: 1180px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }
                .bl-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1.85fr) minmax(0, 1fr);
                    gap: 44px;
                    align-items: start;
                }
                .bl-grid.is-solo {
                    grid-template-columns: minmax(0, 1fr);
                    max-width: 760px;
                    margin: 0 auto;
                }
                .bl-grid :global(.bl-lead),
                .bl-item {
                    display: flex;
                    flex-direction: column;
                    text-align: left;
                    text-decoration: none;
                    color: inherit;
                    opacity: 1 !important; /* the site-wide link hover dims links */
                }
                .bl-grid :global(.bl-lead) {
                    animation: bl-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
                .bl-item {
                    padding: 0;
                    border: 0;
                    background: none;
                    cursor: pointer;
                    animation: bl-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
                .bl-item + .bl-item {
                    margin-top: 34px;
                }
                @keyframes bl-in {
                    from {
                        opacity: 0;
                        transform: translateY(14px);
                    }
                    to {
                        opacity: 1;
                        transform: none;
                    }
                }

                /* photo: a print with a thin paper border, like the other cards on the site */
                .bl-grid :global(.bl-cover) {
                    position: relative;
                    display: block;
                    overflow: hidden;
                    aspect-ratio: 16 / 9;
                    border-radius: 8px;
                    background: #dfe9f0;
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 18px 30px -18px rgba(13, 42, 66, 0.45);
                }
                .bl-grid :global(.bl-cover.is-big) {
                    aspect-ratio: 4 / 2.6;
                    border-radius: 10px;
                }
                .bl-grid :global(.bl-cover img) {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .bl-grid :global(.bl-noimg) {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #1b4f72, #0d2a42);
                }
                .bl-grid :global(.bl-lead:hover .bl-cover img),
                .bl-item:hover :global(.bl-cover img) {
                    transform: scale(1.04);
                }

                /* DATE / (TAG) */
                .bl-grid :global(.bl-meta) {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 22px;
                    font-size: 11.5px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    color: #1b4f72;
                }
                .bl-grid :global(.bl-slash) {
                    color: #3a7ca5;
                }
                .bl-grid :global(.bl-pill) {
                    padding: 2px 10px;
                    border: 1.5px solid rgba(13, 42, 66, 0.45);
                    border-radius: 999px;
                    max-width: 220px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .bl-grid :global(.bl-lead-title),
                .bl-item-title {
                    margin: 14px 0 0;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif !important;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: -0.01em;
                    color: #0d2a42;
                    transition: color 0.25s ease;
                }
                .bl-grid :global(.bl-lead-title) {
                    font-size: clamp(26px, 2.9vw, 40px);
                    line-height: 1.08;
                }
                .bl-item-title {
                    display: block;
                    font-size: 19px;
                    line-height: 1.2;
                }
                .bl-item:hover .bl-item-title,
                .bl-grid :global(.bl-lead:hover .bl-lead-title) {
                    color: #1b4f72;
                }
                .bl-grid :global(.bl-read) {
                    margin-top: 16px;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.16em;
                    color: #3a7ca5;
                }
                .bl-grid :global(.bl-arrow) {
                    display: inline-block;
                    transition: transform 0.3s ease;
                }
                .bl-grid :global(.bl-lead:hover .bl-arrow) {
                    transform: translateX(4px);
                }
                :global(:root.dark) .bl-grid :global(.bl-lead-title),
                :global(:root.dark) .bl-item-title {
                    color: #e9f4fa;
                }
                :global(:root.dark) .bl-grid :global(.bl-meta),
                :global(:root.dark) .bl-grid :global(.bl-pill) {
                    color: #9fd8f2;
                    border-color: rgba(159, 216, 242, 0.5);
                }
                @media (max-width: 860px) {
                    .bl-grid {
                        grid-template-columns: minmax(0, 1fr);
                    }
                }
            `}</style>
        </section>
    );
}
