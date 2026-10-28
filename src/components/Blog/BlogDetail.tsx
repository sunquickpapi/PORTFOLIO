"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Courier_Prime } from "next/font/google";
import { ArrowLeft, Check, Eye, Heart, Link2, Share2 } from "lucide-react";
import PixelField from "@/components/Home/PixelField";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

interface Blog {
    id: string;
    title: string;
    date: string;
    created_at?: string;
    header_image_url: string;
    view_count: number;
    like_count: number;
    reading_time_minutes: number;
    read_minute?: number;
    tags: string[] | string;
    content: string;
}

interface BlogDetailProps {
    blog: Blog;
}

/* ───────────── helpers ───────────── */

const tagsOf = (b: Pick<Blog, "tags">) =>
    (Array.isArray(b.tags) ? b.tags : (b.tags || "").split(","))
        .map((t) => t.trim().replace(/^#+/, ""))
        .filter(Boolean);

const timeOf = (b: Pick<Blog, "date" | "created_at">) => {
    const raw = b.date || "";
    let first = raw.split(" - ")[0];
    if (!/\d{4}/.test(first)) first += `, ${raw.match(/\d{4}/)?.[0] || ""}`;
    const t = new Date(first.replace(/(\d+)(st|nd|rd|th)/gi, "$1").replace("Sept", "Sep")).getTime();
    if (!isNaN(t)) return t;
    return b.created_at ? new Date(b.created_at).getTime() : 0;
};

const slug = (s: string) =>
    s
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60) || "section";

type Block =
    | { kind: "h"; text: string; id: string }
    | { kind: "p"; lines: string[] }
    | { kind: "ul"; items: string[] }
    | { kind: "ol"; items: string[] };

const BULLET = /^\s*(?:[-•*▪︎◦]|•)\s+/;
const NUMBER = /^\s*\d+[.)]\s+/;
/** A short line with no full stop at the end, followed by more text, reads as a sub-heading. */
const isHeading = (line: string, next?: string) => {
    const l = line.trim();
    return !!next && l.length > 2 && l.length <= 90 && !/[.!?,;:]["”’)]?$/.test(l) && !BULLET.test(l) && !NUMBER.test(l);
};

/** Turns the post's plain text into headings, paragraphs and lists. */
function parse(content: string): Block[] {
    const text = (content || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/\r/g, "");
    const out: Block[] = [];
    const used = new Map<string, number>();
    for (const chunk of text.split(/\n\s*\n/)) {
        const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
        let i = 0;
        while (i < lines.length) {
            const line = lines[i];
            if (BULLET.test(line) || NUMBER.test(line)) {
                const ordered = NUMBER.test(line);
                const re = ordered ? NUMBER : BULLET;
                const items: string[] = [];
                while (i < lines.length && re.test(lines[i])) items.push(lines[i++].replace(re, ""));
                out.push(ordered ? { kind: "ol", items } : { kind: "ul", items });
                continue;
            }
            if (i === 0 && isHeading(line, lines[i + 1])) {
                const base = slug(line);
                const n = used.get(base) || 0;
                used.set(base, n + 1);
                out.push({ kind: "h", text: line, id: n ? `${base}-${n}` : base });
                i++;
                continue;
            }
            const para: string[] = [];
            while (i < lines.length && !BULLET.test(lines[i]) && !NUMBER.test(lines[i])) para.push(lines[i++]);
            out.push({ kind: "p", lines: para });
        }
    }
    return out;
}

const likedKey = (id: string) => `blog-liked:${id}`;

/* ───────────── page ───────────── */

/**
 * One post, as a page of the same online blog as /blog: browser bar with the post's
 * address, header (date, topic, title, stats, byline), the cover, then the article
 * beside a sticky rail (contents + like / share). Ends with tags, a like/share card and
 * the previous / next post.
 */
export default function BlogDetail({ blog }: BlogDetailProps) {
    // a like is remembered on this device (the post only renders client-side, after its fetch)
    const [liked, setLiked] = useState(() => {
        try {
            return localStorage.getItem(likedKey(blog.id)) === "1";
        } catch {
            return false;
        }
    });
    const [likes, setLikes] = useState(() => (blog?.like_count || 0) + (liked ? 1 : 0));
    const [copied, setCopied] = useState(false);
    const [progress, setProgress] = useState(0);
    const [active, setActive] = useState("");
    const [all, setAll] = useState<Blog[]>([]);
    const [imgBroken, setImgBroken] = useState(false);
    const articleRef = useRef<HTMLElement>(null);

    const blocks = useMemo(() => parse(blog?.content || ""), [blog?.content]);
    const heads = blocks.filter((b): b is Extract<Block, { kind: "h" }> => b.kind === "h");
    const tags = tagsOf(blog);
    const minutes = blog.reading_time_minutes || blog.read_minute || Math.max(1, Math.round((blog.content || "").split(/\s+/).length / 220));

    // the other posts, for previous / next
    useEffect(() => {
        fetch("/api/blogs")
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => Array.isArray(d) && setAll(d))
            .catch(() => {});
    }, []);

    // reading progress + the section in view
    useEffect(() => {
        const onScroll = () => {
            const el = articleRef.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            const total = r.height - window.innerHeight * 0.6;
            setProgress(Math.min(1, Math.max(0, (window.innerHeight * 0.4 - r.top) / Math.max(1, total))));
            let cur = "";
            for (const h of heads) {
                const t = document.getElementById(h.id);
                if (t && t.getBoundingClientRect().top < 140) cur = h.id;
            }
            setActive(cur);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, [heads]);

    const toggleLike = () => {
        const next = !liked;
        setLiked(next);
        setLikes((n) => n + (next ? 1 : -1));
        try {
            if (next) localStorage.setItem(likedKey(blog.id), "1");
            else localStorage.removeItem(likedKey(blog.id));
        } catch {}
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {}
    };
    const share = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: blog.title, text: `Check out this post: ${blog.title}`, url: window.location.href });
                return;
            } catch {
                return;
            }
        }
        copyLink();
    };

    const sorted = useMemo(() => [...all].sort((a, b) => timeOf(b) - timeOf(a)), [all]);
    const idx = sorted.findIndex((b) => b.id === blog.id);
    const newer = idx > 0 ? sorted[idx - 1] : undefined;
    const older = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : undefined;

    if (!blog) return null;

    return (
        <div className="bd-page">
            <PixelField />

            {/* top bar: back, title, progress, share */}
            <div className="bd-bar">
                <Link href="/blog" className="bd-back" aria-label="Back to all posts">
                    <ArrowLeft size={16} strokeWidth={2.4} />
                    <span className={courier.className}>ALL POSTS</span>
                </Link>
                <span className="bd-bar-title">{blog.title}</span>
                <span className={`bd-bar-pct ${courier.className}`}>{Math.round(progress * 100)}%</span>
                <button type="button" className="bd-bar-btn" onClick={share} aria-label="Share this post">
                    {copied ? <Check size={16} strokeWidth={2.6} /> : <Share2 size={16} strokeWidth={2.4} />}
                </button>
                <span className="bd-bar-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
            </div>

            <main className="bd-main">
                <div className="bd-frame" data-no-ripple>
                    <div className="bd-chrome" aria-hidden="true">
                        <span className="bd-dots">
                            <i />
                            <i />
                            <i />
                        </span>
                        <span className={`bd-url ${courier.className}`}>fvlnzm.my/blog/{slug(blog.title)}</span>
                        <span className={`bd-min ${courier.className}`}>{minutes} MIN READ</span>
                    </div>

                    {/* header */}
                    <header className="bd-head">
                        <span className={`bd-meta ${courier.className}`}>
                            <span>{(blog.date || "").toUpperCase()}</span>
                            {tags[0] && (
                                <>
                                    <span className="bd-slash">/</span>
                                    <span className="bd-pill">{tags[0].toUpperCase()}</span>
                                </>
                            )}
                        </span>
                        <h1 className="bd-title">{blog.title}</h1>
                        <div className="bd-byline">
                            <span className="bd-avatar">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/assets/passcard/pass-photo.webp" alt="" draggable={false} />
                            </span>
                            <span className="bd-by">
                                <strong>Naufal</strong>
                                <span className={courier.className}>PUBLISHED {(blog.date || "").toUpperCase()}</span>
                            </span>
                            <span className={`bd-stats ${courier.className}`}>
                                <span>
                                    <Eye size={14} strokeWidth={2.4} /> {blog.view_count || 0} VIEWS
                                </span>
                                <span>
                                    <Heart size={14} strokeWidth={2.4} fill={liked ? "currentColor" : "none"} /> {likes}
                                </span>
                                <span>{minutes} MIN</span>
                            </span>
                        </div>
                    </header>

                    {/* cover */}
                    {blog.header_image_url && !imgBroken && (
                        <figure className="bd-cover">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={blog.header_image_url} alt={blog.title} onError={() => setImgBroken(true)} />
                        </figure>
                    )}

                    {/* body: rail + article */}
                    <div className="bd-body">
                        <aside className="bd-rail">
                            <div className="bd-rail-in">
                                {heads.length > 1 && (
                                    <nav className="bd-toc" aria-label="On this page">
                                        <span className={`bd-kicker ${courier.className}`}>ON THIS PAGE</span>
                                        <ol>
                                            {heads.map((h, i) => (
                                                <li key={h.id}>
                                                    <a href={`#${h.id}`} className={active === h.id ? "is-on" : ""}>
                                                        <span className={courier.className}>{String(i + 1).padStart(2, "0")}</span>
                                                        {h.text}
                                                    </a>
                                                </li>
                                            ))}
                                        </ol>
                                    </nav>
                                )}
                                <div className="bd-rail-actions">
                                    <button type="button" className={`bd-round ${liked ? "is-liked" : ""}`} onClick={toggleLike} aria-pressed={liked} aria-label="Like this post">
                                        <Heart size={17} strokeWidth={2.4} fill={liked ? "currentColor" : "none"} />
                                    </button>
                                    <span className={`bd-round-n ${courier.className}`}>{likes}</span>
                                    <button type="button" className="bd-round" onClick={copyLink} aria-label="Copy link">
                                        {copied ? <Check size={17} strokeWidth={2.6} /> : <Link2 size={17} strokeWidth={2.4} />}
                                    </button>
                                </div>
                            </div>
                        </aside>

                        <article className="bd-article" ref={articleRef}>
                            {blocks.map((b, i) => {
                                if (b.kind === "h")
                                    return (
                                        <h2 key={i} id={b.id} className="bd-h">
                                            {b.text}
                                        </h2>
                                    );
                                if (b.kind === "ul")
                                    return (
                                        <ul key={i} className="bd-list">
                                            {b.items.map((t, j) => (
                                                <li key={j}>{t}</li>
                                            ))}
                                        </ul>
                                    );
                                if (b.kind === "ol")
                                    return (
                                        <ol key={i} className="bd-list">
                                            {b.items.map((t, j) => (
                                                <li key={j}>{t}</li>
                                            ))}
                                        </ol>
                                    );
                                return (
                                    <p key={i} className={`bd-p ${i === 0 ? "is-first" : ""}`}>
                                        {b.lines.map((l, j) => (
                                            <Fragment key={j}>
                                                {j > 0 && <br />}
                                                {l}
                                            </Fragment>
                                        ))}
                                    </p>
                                );
                            })}

                            {tags.length > 0 && (
                                <div className="bd-tags">
                                    {tags.map((t) => (
                                        <span key={t} className={`bd-tag ${courier.className}`}>
                                            #{t}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* enjoyed it? */}
                            <div className="bd-enjoy">
                                <div>
                                    <span className={`bd-kicker ${courier.className}`}>END OF POST</span>
                                    <h3>Enjoyed this post?</h3>
                                    <p>Share it with your network and help others discover it.</p>
                                </div>
                                <div className="bd-enjoy-actions">
                                    <button type="button" className={`bd-btn ${liked ? "is-liked" : ""}`} onClick={toggleLike} aria-pressed={liked}>
                                        <Heart size={16} strokeWidth={2.4} fill={liked ? "currentColor" : "none"} className={liked ? "bd-pop" : ""} /> {likes}
                                    </button>
                                    <button type="button" className="bd-btn is-dark" onClick={share}>
                                        {copied ? <Check size={16} strokeWidth={2.6} /> : <Share2 size={16} strokeWidth={2.4} />}
                                        {copied ? "Link copied" : "Share"}
                                    </button>
                                </div>
                            </div>
                            <p className={`bd-updated ${courier.className}`}>LAST UPDATED · {(blog.date || "").toUpperCase()}</p>
                        </article>
                    </div>

                    {/* previous / next */}
                    <nav className="bd-next" aria-label="More posts">
                        {older ? (
                            <Link href={`/blog/${older.id}`} className="bd-next-card">
                                <span className={`bd-kicker ${courier.className}`}>← OLDER POST</span>
                                <span className="bd-next-row">
                                    {older.header_image_url && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={older.header_image_url} alt="" loading="lazy" />
                                    )}
                                    <strong>{older.title}</strong>
                                </span>
                            </Link>
                        ) : (
                            <span />
                        )}
                        <Link href="/blog" className={`bd-all ${courier.className}`}>
                            READ MORE POSTS
                        </Link>
                        {newer ? (
                            <Link href={`/blog/${newer.id}`} className="bd-next-card is-right">
                                <span className={`bd-kicker ${courier.className}`}>NEWER POST →</span>
                                <span className="bd-next-row">
                                    <strong>{newer.title}</strong>
                                    {newer.header_image_url && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={newer.header_image_url} alt="" loading="lazy" />
                                    )}
                                </span>
                            </Link>
                        ) : (
                            <span />
                        )}
                    </nav>
                </div>
            </main>

            <style jsx global>{STYLES}</style>
        </div>
    );
}

const STYLES = `
.bd-page {
    position: relative;
    min-height: 100vh;
    background: transparent;
    --ink: #0d2a42;
    --navy: #1b4f72;
    --sky: #3a99c9;
    --muted: #3a7ca5;
    --paper: #fbfcfd;
}
.bd-page a { opacity: 1 !important; }

/* ---- floating top bar ---- */
.bd-bar {
    position: sticky;
    top: 18px;
    z-index: 50;
    width: min(760px, calc(100% - 32px));
    margin: 18px auto 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px;
    border-radius: 16px;
    overflow: hidden;
    background: rgba(251, 252, 253, 0.88);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 16px 30px -18px rgba(13, 42, 66, 0.45);
}
.bd-back {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 38px;
    padding: 0 12px;
    border-radius: 11px;
    color: var(--ink);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-decoration: none;
    transition: background 0.2s ease;
}
.bd-back:hover { background: rgba(27, 79, 114, 0.08); }
.bd-bar-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; font-weight: 700; color: var(--ink); }
.bd-bar-pct { flex: none; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; color: var(--muted); min-width: 40px; text-align: right; }
.bd-bar-btn {
    flex: none;
    display: inline-grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border: 0;
    border-radius: 11px;
    background: var(--ink);
    color: #e9f4fa;
    cursor: pointer;
}
.bd-bar-progress { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: var(--sky); transform-origin: 0 50%; transition: transform 0.15s linear; }

/* ---- frame ---- */
.bd-main { position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; padding: 34px 20px 80px; }
.bd-frame {
    position: relative;
    border-radius: 20px;
    background: linear-gradient(160deg, #fbfcfd 0%, #f1f5f8 100%);
    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.1), 0 40px 60px -36px rgba(13, 42, 66, 0.5);
    animation: bd-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes bd-in { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
.bd-frame::before { content: ""; position: absolute; inset: 10px; border: 1.5px solid rgba(27, 79, 114, 0.18); border-radius: 13px; pointer-events: none; }
.bd-chrome { display: flex; align-items: center; gap: 14px; margin: 10px 10px 0; padding: 12px 18px; border-bottom: 1.5px solid rgba(27, 79, 114, 0.16); }
.bd-dots { display: inline-flex; gap: 7px; }
.bd-dots i { width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid rgba(27, 79, 114, 0.45); }
.bd-dots i:first-child { background: var(--navy); border-color: var(--navy); }
.bd-url { flex: 1; max-width: 520px; margin: 0 auto; padding: 5px 14px; border-radius: 999px; background: rgba(27, 79, 114, 0.07); font-size: 12px; font-weight: 700; letter-spacing: 0.04em; color: var(--navy); text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bd-min { font-size: 11px; font-weight: 700; letter-spacing: 0.2em; color: var(--muted); }
.bd-kicker { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.24em; color: var(--muted); }

/* ---- header ---- */
.bd-head { max-width: 860px; margin: 0 auto; padding: 46px 40px 30px; text-align: center; }
.bd-meta { display: inline-flex; align-items: center; flex-wrap: wrap; justify-content: center; gap: 8px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.12em; color: var(--navy); }
.bd-slash { color: var(--muted); }
.bd-pill { padding: 2px 10px; border: 1.5px solid rgba(13, 42, 66, 0.4); border-radius: 999px; }
.bd-title {
    margin: 16px 0 0;
    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif !important;
    font-size: clamp(34px, 5vw, 62px);
    line-height: 1.04;
    font-weight: 900;
    letter-spacing: -0.035em;
    color: var(--ink);
    text-wrap: balance;
}
.bd-byline {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    gap: 14px 18px;
    margin-top: 26px;
    padding: 10px 18px 10px 10px;
    border-radius: 999px;
    background: #fff;
    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 12px 22px -16px rgba(13, 42, 66, 0.5);
    text-align: left;
}
.bd-avatar { flex: none; width: 44px; height: 44px; border-radius: 50%; overflow: hidden; background: #c9d4da; box-shadow: 0 0 0 2px #fff, 0 0 0 3.5px rgba(27, 79, 114, 0.25); }
.bd-avatar img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 18%; image-rendering: pixelated; }
.bd-by { display: flex; flex-direction: column; gap: 2px; }
.bd-by strong { font-size: 15px; font-weight: 800; color: var(--ink); }
.bd-by span { font-size: 10.5px; font-weight: 700; letter-spacing: 0.12em; color: var(--muted); }
.bd-stats { display: inline-flex; align-items: center; gap: 14px; padding-left: 18px; border-left: 2px dashed rgba(27, 79, 114, 0.2); font-size: 11.5px; font-weight: 700; letter-spacing: 0.1em; color: var(--navy); }
.bd-stats > span { display: inline-flex; align-items: center; gap: 5px; }

/* ---- cover ---- */
.bd-cover { margin: 0 40px; padding: 8px; border-radius: 16px; background: #fff; box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 26px 40px -26px rgba(13, 42, 66, 0.55); }
.bd-cover img { display: block; width: 100%; max-height: 72vh; object-fit: cover; border-radius: 10px; background: #dfe9f0; }

/* ---- body ---- */
.bd-body { display: grid; grid-template-columns: 220px minmax(0, 720px); justify-content: center; gap: 56px; padding: 50px 40px 20px; }
.bd-rail-in { position: sticky; top: 100px; display: flex; flex-direction: column; gap: 28px; }
.bd-toc ol { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; gap: 2px; border-left: 2px solid rgba(27, 79, 114, 0.12); }
.bd-toc a {
    display: flex;
    gap: 10px;
    margin-left: -2px;
    padding: 7px 0 7px 14px;
    border-left: 2px solid transparent;
    color: #4a6479;
    font-size: 13.5px;
    font-weight: 600;
    line-height: 1.35;
    text-decoration: none;
    transition: color 0.2s ease, border-color 0.25s ease;
}
.bd-toc a span { flex: none; font-size: 11px; font-weight: 700; color: rgba(27, 79, 114, 0.4); padding-top: 1px; }
.bd-toc a:hover { color: var(--ink); }
.bd-toc a.is-on { color: var(--ink); font-weight: 800; border-left-color: var(--ink); }
.bd-toc a.is-on span { color: var(--sky); }
.bd-rail-actions { display: flex; align-items: center; gap: 10px; }
.bd-round {
    display: inline-grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border: 0;
    border-radius: 50%;
    background: #fff;
    color: var(--ink);
    box-shadow: 0 0 0 1.5px rgba(27, 79, 114, 0.2);
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease, color 0.25s ease;
}
.bd-round:hover { transform: translateY(-2px); box-shadow: 0 0 0 1.5px var(--ink); }
.bd-round.is-liked { color: #d6455d; box-shadow: 0 0 0 1.5px rgba(214, 69, 93, 0.5); }
.bd-round-n { font-size: 13px; font-weight: 700; color: var(--navy); margin-right: 6px; }

.bd-article { min-width: 0; color: #2d4a60; }
.bd-p { margin: 0 0 1.35em; font-size: 18px; line-height: 1.8; overflow-wrap: anywhere; }
.bd-p.is-first::first-letter {
    float: left;
    margin: 6px 12px 0 0;
    font-size: 64px;
    line-height: 0.85;
    font-weight: 900;
    color: var(--ink);
}
.bd-h {
    position: relative;
    margin: 2em 0 0.6em;
    padding-top: 0.9em;
    font-size: clamp(22px, 2.2vw, 27px);
    line-height: 1.25;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--ink);
    scroll-margin-top: 100px;
}
.bd-h::before { content: ""; position: absolute; top: 0; left: 0; width: 44px; height: 3px; border-radius: 3px; background: var(--sky); }
.bd-article > .bd-h:first-child { margin-top: 0; }
.bd-list { margin: 0 0 1.35em; padding-left: 1.3em; font-size: 18px; line-height: 1.75; }
.bd-list li { margin: 0.25em 0; padding-left: 0.3em; }
.bd-list li::marker { color: var(--sky); font-weight: 800; }
.bd-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 34px; padding-top: 24px; border-top: 2px dashed rgba(27, 79, 114, 0.18); }
.bd-tag { padding: 5px 11px; border-radius: 7px; background: rgba(27, 79, 114, 0.08); color: var(--navy); font-size: 12px; font-weight: 700; }

.bd-enjoy {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
    margin-top: 34px;
    padding: 24px 26px;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 18px 30px -22px rgba(13, 42, 66, 0.5);
}
.bd-enjoy h3 { margin: 6px 0 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: var(--ink); }
.bd-enjoy p { margin: 4px 0 0; font-size: 14.5px; color: #4a6479; }
.bd-enjoy-actions { display: flex; gap: 10px; }
.bd-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 44px;
    padding: 0 18px;
    border: 2px solid var(--ink);
    border-radius: 999px;
    background: #fff;
    color: var(--ink);
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    transition: transform 0.2s ease, background 0.25s ease, color 0.25s ease;
}
.bd-btn:hover { transform: translateY(-1px); }
.bd-btn.is-dark { background: var(--ink); color: #e9f4fa; }
.bd-btn.is-liked { border-color: #d6455d; color: #d6455d; }
.bd-pop { animation: bd-pop 0.45s cubic-bezier(0.3, 1.6, 0.5, 1); }
@keyframes bd-pop { 0% { transform: scale(0.6); } 100% { transform: scale(1); } }
.bd-updated { margin: 18px 0 0; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; color: var(--muted); }

/* ---- previous / next ---- */
.bd-next {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    gap: 18px;
    margin: 30px 10px 10px;
    padding: 26px 30px 30px;
    border-top: 1.5px solid rgba(27, 79, 114, 0.16);
}
.bd-next-card { display: flex; flex-direction: column; gap: 10px; padding: 14px; border-radius: 14px; color: var(--ink); text-decoration: none; transition: background 0.25s ease; }
.bd-next-card:hover { background: rgba(27, 79, 114, 0.06); }
.bd-next-card.is-right { text-align: right; }
.bd-next-row { display: flex; align-items: center; gap: 14px; }
.bd-next-card.is-right .bd-next-row { justify-content: flex-end; }
.bd-next-row img { flex: none; width: 84px; height: 56px; object-fit: cover; border-radius: 8px; box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.1); }
.bd-next-row strong { font-size: 15.5px; font-weight: 800; line-height: 1.3; }
.bd-all {
    display: inline-flex;
    align-items: center;
    height: 44px;
    padding: 0 20px;
    border-radius: 999px;
    background: var(--ink);
    color: #e9f4fa;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-decoration: none;
    white-space: nowrap;
    transition: transform 0.25s ease;
}
.bd-all:hover { transform: translateY(-2px); }

/* ---- smaller screens ---- */
@media (max-width: 980px) {
    .bd-body { grid-template-columns: minmax(0, 1fr); gap: 0; padding: 40px 30px 10px; }
    .bd-rail { order: 2; }
    .bd-rail-in { position: static; margin-top: 30px; }
    .bd-toc { display: none; }
    .bd-next { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
    .bd-all { grid-column: 1 / -1; grid-row: 2; justify-self: center; }
}
@media (max-width: 640px) {
    .bd-main { padding: 22px 10px 60px; }
    .bd-head { padding: 34px 18px 22px; }
    .bd-cover { margin: 0 16px; padding: 5px; }
    .bd-body { padding: 30px 20px 10px; }
    .bd-p, .bd-list { font-size: 16.5px; }
    .bd-stats { padding-left: 0; border-left: 0; }
    .bd-byline { border-radius: 18px; }
    .bd-chrome .bd-min { display: none; }
    .bd-next { grid-template-columns: minmax(0, 1fr); padding: 20px 16px 24px; }
    .bd-next-card.is-right { text-align: left; }
    .bd-next-card.is-right .bd-next-row { justify-content: flex-start; flex-direction: row-reverse; }
    .bd-bar-pct { display: none; }
}
`;
