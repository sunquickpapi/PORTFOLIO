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

const allTags = (tags?: string) =>
    (tags || "")
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);
const excerpt = (html?: string, n = 210) => {
    const t = (html || "").replace(/<[^>]+>/g, " ").replace(/[#*_>`\[\]()!-]+/g, " ").replace(/\s+/g, " ").trim();
    return t.length > n ? t.slice(0, n).replace(/\s\S*$/, "") + "…" : t;
};

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
/**
 * Latest posts in a framed panel. Left: the selected post in full (cover, date, title,
 * excerpt, every hashtag, read link). Right: a 2×2 grid of the next posts' cover images only;
 * click one to bring it into the left panel (it cross-fades in).
 */
export default function Blog() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [sel, setSel] = useState(0);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await fetch("/api/blogs");
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                const data = await res.json();
                if (!Array.isArray(data)) throw new Error("Invalid response");
                setBlogs(data.slice(0, 5)); // the selected one + 4 on the right
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

    const lead = blogs[sel];
    const others = blogs.map((b, i) => ({ b, i })).filter(({ i }) => i !== sel);

    return (
        <section
            id="blog-latest"
            style={{ minHeight: "100svh", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", padding: "110px 0 50px", scrollMarginTop: 0 }}
        >
            <div className="bl-wrap">
                <div className={`bl-frame ${others.length ? "" : "is-solo"}`}>
                    {/* LEFT: the selected post, in full */}
                    <article className="bl-lead" key={lead.id}>
                        <Link href={`/blog/${lead.id}`} className="bl-lead-img" aria-label={lead.title}>
                            <Cover b={lead} big />
                        </Link>
                        <div className="bl-lead-body">
                            <Meta b={lead} />
                            <h3 className="bl-lead-title">
                                <Link href={`/blog/${lead.id}`}>{lead.title}</Link>
                            </h3>
                            {excerpt(lead.content) && <p className="bl-excerpt">{excerpt(lead.content)}</p>}
                            <div className="bl-tags">
                                {allTags(lead.tags).map((t) => (
                                    <span key={t} className={`bl-tag ${courier.className}`}>
                                        #{t}
                                    </span>
                                ))}
                            </div>
                            <Link href={`/blog/${lead.id}`} className={`bl-read ${courier.className}`}>
                                READ · {lead.read_minute || 1} MIN <span className="bl-arrow">→</span>
                            </Link>
                        </div>
                    </article>

                    {/* RIGHT: just the covers */}
                    {others.length > 0 && (
                        <div className="bl-side">
                            <span className={`bl-side-k ${courier.className}`}>MORE POSTS</span>
                            <div className="bl-thumbs">
                                {others.map(({ b, i }) => (
                                    <button type="button" key={b.id} className="bl-thumb" onClick={() => setSel(i)} aria-label={`Show ${b.title}`} title={b.title}>
                                        <Cover b={b} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="file-link-row" style={{ marginTop: 40 }}>
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
                /* the frame: a paper panel with a double rule, split by a divider */
                .bl-frame {
                    position: relative;
                    display: grid;
                    grid-template-columns: minmax(0, 1.75fr) minmax(0, 1fr);
                    border-radius: 18px;
                    background: linear-gradient(160deg, #fbfcfd 0%, #f1f5f8 100%);
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.1), 0 30px 50px -30px rgba(13, 42, 66, 0.45);
                }
                .bl-frame::before {
                    content: "";
                    position: absolute;
                    inset: 10px;
                    border: 1.5px solid rgba(27, 79, 114, 0.18);
                    border-radius: 12px;
                    pointer-events: none;
                }
                .bl-frame.is-solo {
                    grid-template-columns: minmax(0, 1fr);
                    max-width: 820px;
                    margin: 0 auto;
                }
                .bl-lead {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr);
                    padding: 30px 32px 30px;
                    animation: bl-swap 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
                @keyframes bl-swap {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                        filter: blur(4px);
                    }
                    to {
                        opacity: 1;
                        transform: none;
                        filter: none;
                    }
                }
                .bl-lead :global(.bl-lead-img) {
                    display: block;
                    opacity: 1 !important;
                }
                .bl-lead-body {
                    display: flex;
                    flex-direction: column;
                }
                .bl-side {
                    display: flex;
                    flex-direction: column;
                    padding: 30px 30px 30px 28px;
                    border-left: 2px dashed rgba(27, 79, 114, 0.2); /* divider */
                }
                .bl-side-k {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.24em;
                    color: #3a7ca5;
                    padding-bottom: 12px;
                    margin-bottom: 16px;
                    border-bottom: 1.5px solid rgba(27, 79, 114, 0.16); /* divider */
                }
                .bl-thumbs {
                    flex: 1;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-auto-rows: 1fr;
                    gap: 16px;
                    min-height: 0;
                }
                .bl-thumb {
                    padding: 5px;
                    border: 0;
                    border-radius: 10px;
                    background: #fff;
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.1), 0 10px 18px -12px rgba(13, 42, 66, 0.45);
                    cursor: pointer;
                    transition: transform 0.45s cubic-bezier(0.34, 1.5, 0.5, 1), box-shadow 0.3s ease;
                }
                .bl-thumb:hover,
                .bl-thumb:focus-visible {
                    transform: translateY(-4px) rotate(-1deg);
                    box-shadow: 0 0 0 2px #3a99c9, 0 16px 24px -14px rgba(13, 42, 66, 0.5);
                    outline: none;
                }
                .bl-thumb {
                    display: flex;
                    min-height: 120px;
                }
                .bl-frame .bl-thumb :global(.bl-cover) {
                    flex: 1;
                    aspect-ratio: auto;
                    height: 100%;
                    border-radius: 6px;
                    box-shadow: none;
                }

                .bl-frame :global(.bl-cover) {
                    position: relative;
                    display: block;
                    overflow: hidden;
                    aspect-ratio: 16 / 9;
                    border-radius: 8px;
                    background: #dfe9f0;
                }
                .bl-frame :global(.bl-cover.is-big) {
                    aspect-ratio: 16 / 8;
                    border-radius: 10px;
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 18px 30px -18px rgba(13, 42, 66, 0.45);
                }
                .bl-frame :global(.bl-cover img) {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .bl-frame :global(.bl-noimg) {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #1b4f72, #0d2a42);
                }
                .bl-lead :global(.bl-lead-img:hover .bl-cover img),
                .bl-thumb:hover :global(.bl-cover img) {
                    transform: scale(1.05);
                }

                .bl-frame :global(.bl-meta) {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 20px;
                    font-size: 11.5px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    color: #1b4f72;
                }
                .bl-frame :global(.bl-slash) {
                    color: #3a7ca5;
                }
                .bl-frame :global(.bl-pill) {
                    padding: 2px 10px;
                    border: 1.5px solid rgba(13, 42, 66, 0.45);
                    border-radius: 999px;
                    max-width: 240px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .bl-lead-title {
                    margin: 12px 0 0;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif !important;
                    font-size: clamp(24px, 2.5vw, 34px);
                    font-weight: 800;
                    line-height: 1.1;
                    text-transform: uppercase;
                    letter-spacing: -0.01em;
                }
                .bl-lead-title :global(a) {
                    color: #0d2a42;
                    text-decoration: none;
                    opacity: 1 !important;
                }
                .bl-lead-title :global(a:hover) {
                    color: #1b4f72;
                }
                .bl-excerpt {
                    margin: 12px 0 0;
                    font-size: 14.5px;
                    line-height: 1.65;
                    color: #3d5568;
                }
                .bl-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px 8px;
                    margin-top: 14px;
                    padding-top: 14px;
                    border-top: 1.5px dashed rgba(27, 79, 114, 0.18); /* divider */
                }
                .bl-tag {
                    padding: 3px 9px;
                    border-radius: 6px;
                    background: rgba(27, 79, 114, 0.08);
                    font-size: 11.5px;
                    font-weight: 700;
                    color: #1b4f72;
                }
                .bl-lead :global(.bl-read) {
                    align-self: flex-start;
                    margin-top: 16px;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.16em;
                    color: #3a7ca5;
                    text-decoration: none;
                    opacity: 1 !important;
                }
                .bl-lead :global(.bl-arrow) {
                    display: inline-block;
                    transition: transform 0.3s ease;
                }
                .bl-lead :global(.bl-read:hover .bl-arrow) {
                    transform: translateX(4px);
                }
                :global(:root.dark) .bl-frame {
                    background: linear-gradient(160deg, #13293a 0%, #0f2232 100%);
                }
                :global(:root.dark) .bl-lead-title :global(a) {
                    color: #e9f4fa;
                }
                :global(:root.dark) .bl-excerpt {
                    color: #b7cad6;
                }
                :global(:root.dark) .bl-frame :global(.bl-meta),
                :global(:root.dark) .bl-frame :global(.bl-pill),
                :global(:root.dark) .bl-tag {
                    color: #9fd8f2;
                    border-color: rgba(159, 216, 242, 0.5);
                }
                @media (max-width: 860px) {
                    .bl-frame {
                        grid-template-columns: minmax(0, 1fr);
                    }
                    .bl-side {
                        border-left: 0;
                        border-top: 2px dashed rgba(27, 79, 114, 0.2);
                    }
                    .bl-thumbs {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    .bl-lead {
                        animation: none;
                    }
                }
            `}</style>
        </section>
    );
}
