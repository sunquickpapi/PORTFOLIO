"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Courier_Prime } from "next/font/google";
import { ArrowLeft, Check, ChevronDown, Eye, Heart, Search, X } from "lucide-react";
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
    tags: string | string[];
    read_minute?: number;
    content: string;
}
interface Profile {
    name?: string;
    role?: string;
    tagline?: string;
    hero_photo_url?: string;
    logo_url?: string;
}

type Sort = "newest" | "oldest" | "liked" | "read";
const SORTS: [Sort, string][] = [
    ["newest", "Newest first"],
    ["oldest", "Oldest first"],
    ["liked", "Most liked"],
    ["read", "Most read"],
];
const PAGE = 8;

const tagsOf = (b: Blog) =>
    (Array.isArray(b.tags) ? b.tags : (b.tags || "").split(","))
        .map((t) => t.trim().replace(/^#+/, ""))
        .filter(Boolean);
const timeOf = (b: Blog) => {
    // "April 21th - April 22th, 2026" → the first day, with the year carried over
    const raw = b.date || "";
    let first = raw.split(" - ")[0];
    if (!/\d{4}/.test(first)) first += `, ${raw.match(/\d{4}/)?.[0] || ""}`;
    const t = new Date(first.replace(/(\d+)(st|nd|rd|th)/gi, "$1").replace("Sept", "Sep")).getTime();
    if (!isNaN(t)) return t;
    return b.created_at ? new Date(b.created_at).getTime() : 0;
};
const yearOf = (b: Blog) => (b.date || "").match(/\d{4}(?!.*\d{4})/)?.[0] || (b.created_at ? String(new Date(b.created_at).getFullYear()) : "");
/** Plain-text excerpt; the first line is usually a heading, so it is skipped when there is more. */
const excerpt = (text: string, n: number) => {
    const lines = (text || "").replace(/<[^>]+>/g, " ").split("\n").map((l) => l.trim()).filter(Boolean);
    const body = (lines.length > 1 && lines[0].length < 90 ? lines.slice(1) : lines).join(" ");
    const t = body.replace(/[#*_>`\[\]]+/g, " ").replace(/\s+/g, " ").trim();
    return t.length > n ? t.slice(0, n).replace(/\s\S*$/, "") + "…" : t;
};

function Cover({ b, big }: { b: Blog; big?: boolean }) {
    const [broken, setBroken] = useState(false);
    return (
        <span className={`bp-cover ${big ? "is-big" : ""}`}>
            {b.header_image_url && !broken ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.header_image_url} alt="" loading="lazy" draggable={false} onError={() => setBroken(true)} />
            ) : (
                <span className="bp-noimg" />
            )}
        </span>
    );
}

function Meta({ b }: { b: Blog }) {
    const tag = tagsOf(b)[0];
    return (
        <span className={`bp-meta ${courier.className}`}>
            <span>{(b.date || "").toUpperCase()}</span>
            {tag && (
                <>
                    <span className="bp-slash">/</span>
                    <span className="bp-pill">{tag.toUpperCase()}</span>
                </>
            )}
        </span>
    );
}

function Stats({ b }: { b: Blog }) {
    return (
        <span className={`bp-stats ${courier.className}`}>
            <span>
                <Heart size={13} strokeWidth={2.4} /> {b.like_count || 0}
            </span>
            <span>
                <Eye size={13} strokeWidth={2.4} /> {b.view_count || 0}
            </span>
            <span className="bp-min">{b.read_minute || 1} MIN READ</span>
        </span>
    );
}

/**
 * All posts as an online blog, in the same framed paper panel as the homepage Blog
 * section: a browser bar, the masthead with topic tabs, then the feed (featured post +
 * post cards) beside a sidebar (writer, most read, archive, topics).
 */
export default function BlogAllPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [tag, setTag] = useState("all");
    const [year, setYear] = useState("all");
    const [sort, setSort] = useState<Sort>("newest");
    const [menu, setMenu] = useState(false);
    const [allTopics, setAllTopics] = useState(false);
    const [more, setMore] = useState({ sig: "", n: PAGE });
    const menuRef = useRef<HTMLDivElement>(null);
    const feedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        Promise.all([
            fetch("/api/blogs").then((r) => (r.ok ? r.json() : [])),
            fetch("/api/profile").then((r) => (r.ok ? r.json() : null)),
        ])
            .then(([b, p]) => {
                if (Array.isArray(b)) setBlogs(b);
                if (p && !p.error) setProfile(p);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!menu) return;
        const down = (e: PointerEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
        const key = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
        window.addEventListener("pointerdown", down);
        window.addEventListener("keydown", key);
        return () => {
            window.removeEventListener("pointerdown", down);
            window.removeEventListener("keydown", key);
        };
    }, [menu]);

    // topics, most used first
    const topics = useMemo(() => {
        const count = new Map<string, { name: string; n: number }>();
        blogs.forEach((b) =>
            tagsOf(b).forEach((t) => {
                const k = t.toLowerCase();
                const c = count.get(k);
                if (c) c.n++;
                else count.set(k, { name: t, n: 1 });
            })
        );
        return Array.from(count.values()).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
    }, [blogs]);
    const years = useMemo(() => {
        const m = new Map<string, number>();
        blogs.forEach((b) => {
            const y = yearOf(b);
            if (y) m.set(y, (m.get(y) || 0) + 1);
        });
        return Array.from(m.entries()).sort((a, b) => b[0].localeCompare(a[0]));
    }, [blogs]);
    const mostRead = useMemo(() => [...blogs].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5), [blogs]);

    const shown = useMemo(() => {
        const q = search.trim().toLowerCase();
        const list = blogs.filter((b) => {
            const tg = tagsOf(b).map((t) => t.toLowerCase());
            return (
                (tag === "all" || tg.includes(tag)) &&
                (year === "all" || yearOf(b) === year) &&
                (!q || b.title.toLowerCase().includes(q) || tg.some((t) => t.includes(q)) || (b.content || "").toLowerCase().includes(q))
            );
        });
        const by: Record<Sort, (a: Blog, b: Blog) => number> = {
            newest: (a, b) => timeOf(b) - timeOf(a),
            oldest: (a, b) => timeOf(a) - timeOf(b),
            liked: (a, b) => (b.like_count || 0) - (a.like_count || 0),
            read: (a, b) => (b.view_count || 0) - (a.view_count || 0),
        };
        return list.sort(by[sort]);
    }, [blogs, search, tag, year, sort]);

    // "older posts" paging resets whenever the filters change
    const sig = [search, tag, year, sort].join("|");
    const limit = more.sig === sig ? more.n : PAGE;

    const pickTag = (t: string) => {
        setTag((cur) => (cur === t ? "all" : t));
        feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const pickYear = (y: string) => {
        setYear((cur) => (cur === y ? "all" : y));
        feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const [lead, ...rest] = shown;
    const filtered = tag !== "all" || year !== "all" || !!search.trim();
    const address = `fvlnzm.my/blog${tag !== "all" ? `?topic=${tag}` : ""}${year !== "all" ? `${tag !== "all" ? "&" : "?"}year=${year}` : ""}`;

    return (
        <div className="bp-page">
            <PixelField />

            {/* top bar: back, search, sort */}
            <div className="bp-bar">
                <Link href="/#blog-latest" className="bp-back" aria-label="Back to home">
                    <ArrowLeft size={16} strokeWidth={2.4} />
                    <span className={courier.className}>HOME</span>
                </Link>
                <div className="bp-search">
                    <Search size={16} strokeWidth={2.4} />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts…" aria-label="Search posts" />
                    {search && (
                        <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="bp-filter" ref={menuRef}>
                    <button type="button" className="bp-filter-btn" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
                        <span>{SORTS.find(([k]) => k === sort)?.[1]}</span>
                        <ChevronDown size={15} strokeWidth={2.4} />
                    </button>
                    {menu && (
                        <div className="bp-menu" role="listbox">
                            {SORTS.map(([k, label]) => (
                                <button
                                    type="button"
                                    key={k}
                                    role="option"
                                    aria-selected={sort === k}
                                    className={sort === k ? "is-on" : ""}
                                    onClick={() => {
                                        setSort(k);
                                        setMenu(false);
                                    }}
                                >
                                    {label}
                                    {sort === k && <Check size={14} strokeWidth={2.6} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <span className={`bp-count ${courier.className}`}>
                    {String(shown.length).padStart(2, "0")} / {String(blogs.length).padStart(2, "0")}
                </span>
            </div>

            <main className="bp-main">
                <div className="bp-frame" data-no-ripple>
                    {/* the browser bar of the blog */}
                    <div className="bp-chrome" aria-hidden="true">
                        <span className="bp-dots">
                            <i />
                            <i />
                            <i />
                        </span>
                        <span className={`bp-url ${courier.className}`}>{address}</span>
                        <span className={`bp-live ${courier.className}`}>
                            <b /> LIVE
                        </span>
                    </div>

                    {/* masthead + topic tabs */}
                    <header className="bp-mast">
                        <span className={`bp-kicker ${courier.className}`}>
                            FVLNZM.MY · THE JOURNAL · {String(blogs.length).padStart(2, "0")} POSTS
                        </span>
                        <h1 className="bp-title">Blog</h1>
                        <p className="bp-sub">Competitions, classes I taught, apps I shipped and everything learned along the way.</p>
                        <nav className={`bp-tabs ${courier.className}`} aria-label="Topics">
                            <button type="button" className={tag === "all" ? "is-on" : ""} onClick={() => setTag("all")}>
                                ALL POSTS
                            </button>
                            {topics.slice(0, 8).map((t) => (
                                <button type="button" key={t.name} className={tag === t.name.toLowerCase() ? "is-on" : ""} onClick={() => pickTag(t.name.toLowerCase())}>
                                    #{t.name.toUpperCase()}
                                </button>
                            ))}
                        </nav>
                    </header>

                    <div className="bp-body">
                        {/* FEED */}
                        <div className="bp-feed" ref={feedRef}>
                            {filtered && (
                                <div className={`bp-filters ${courier.className}`}>
                                    <span>SHOWING {shown.length} OF {blogs.length}</span>
                                    {tag !== "all" && (
                                        <button type="button" onClick={() => setTag("all")}>
                                            #{tag.toUpperCase()} <X size={12} strokeWidth={2.6} />
                                        </button>
                                    )}
                                    {year !== "all" && (
                                        <button type="button" onClick={() => setYear("all")}>
                                            {year} <X size={12} strokeWidth={2.6} />
                                        </button>
                                    )}
                                    {search.trim() && (
                                        <button type="button" onClick={() => setSearch("")}>
                                            “{search.trim()}” <X size={12} strokeWidth={2.6} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {loading ? (
                                <div className="bp-skel-lead" />
                            ) : !lead ? (
                                <p className={`bp-empty ${courier.className}`}>NO POSTS MATCH. TRY ANOTHER WORD OR TOPIC.</p>
                            ) : (
                                <>
                                    <article className="bp-lead" key={`${lead.id}-${sort}-${tag}-${year}`}>
                                        <Link href={`/blog/${lead.id}`} className="bp-lead-img" aria-label={lead.title}>
                                            <Cover b={lead} big />
                                            <span className={`bp-flag ${courier.className}`}>{sort === "newest" && !filtered ? "LATEST POST" : "TOP RESULT"}</span>
                                        </Link>
                                        <div className="bp-lead-body">
                                            <Meta b={lead} />
                                            <h2 className="bp-lead-title">
                                                <Link href={`/blog/${lead.id}`}>{lead.title}</Link>
                                            </h2>
                                            <p className="bp-excerpt">{excerpt(lead.content, 260)}</p>
                                            <div className="bp-tags">
                                                {tagsOf(lead).map((t) => (
                                                    <button type="button" key={t} className={`bp-tag ${courier.className}`} onClick={() => pickTag(t.toLowerCase())}>
                                                        #{t}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="bp-lead-foot">
                                                <Stats b={lead} />
                                                <Link href={`/blog/${lead.id}`} className={`bp-read ${courier.className}`}>
                                                    READ POST <span className="bp-arrow">→</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </article>

                                    {rest.length > 0 && (
                                        <span className={`bp-kicker bp-rule ${courier.className}`}>{filtered ? "MORE RESULTS" : "EARLIER POSTS"}</span>
                                    )}
                                    <div className="bp-grid">
                                        {rest.slice(0, limit).map((b, i) => (
                                            <article className="bp-card" key={b.id} style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
                                                <Link href={`/blog/${b.id}`} className="bp-card-link" aria-label={b.title}>
                                                    <Cover b={b} />
                                                    <Meta b={b} />
                                                    <h3 className="bp-card-title">{b.title}</h3>
                                                    <p className="bp-card-ex">{excerpt(b.content, 130)}</p>
                                                    <Stats b={b} />
                                                </Link>
                                            </article>
                                        ))}
                                    </div>
                                    {rest.length > limit && (
                                        <button type="button" className={`bp-more ${courier.className}`} onClick={() => setMore({ sig, n: limit + PAGE })}>
                                            OLDER POSTS ({rest.length - limit}) ↓
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* SIDEBAR */}
                        <aside className="bp-side">
                            <div className="bp-writer">
                                <span className="bp-avatar">
                                    {/* same pixel portrait as the pass card on the homepage */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/assets/passcard/pass-photo.webp" alt="" draggable={false} />
                                </span>
                                <div>
                                    <span className={`bp-kicker ${courier.className}`}>WRITTEN BY</span>
                                    <strong>{profile?.name || "Muhammad Naufal"}</strong>
                                    {profile?.role && <em>{profile.role}</em>}
                                </div>
                            </div>

                            {mostRead.length > 0 && (
                                <div className="bp-block">
                                    <span className={`bp-kicker bp-rule ${courier.className}`}>MOST READ</span>
                                    <ol className="bp-top">
                                        {mostRead.map((b, i) => (
                                            <li key={b.id}>
                                                <Link href={`/blog/${b.id}`}>
                                                    <span className={`bp-top-no ${courier.className}`}>{String(i + 1).padStart(2, "0")}</span>
                                                    <span className="bp-top-text">
                                                        <span className="bp-top-title">{b.title}</span>
                                                        <span className={`bp-top-meta ${courier.className}`}>
                                                            <Eye size={11} strokeWidth={2.6} /> {b.view_count || 0} · {(b.date || "").toUpperCase()}
                                                        </span>
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                            {years.length > 0 && (
                                <div className="bp-block">
                                    <span className={`bp-kicker bp-rule ${courier.className}`}>ARCHIVE</span>
                                    <ul className={`bp-archive ${courier.className}`}>
                                        {years.map(([y, n]) => (
                                            <li key={y}>
                                                <button type="button" className={year === y ? "is-on" : ""} onClick={() => pickYear(y)}>
                                                    <span>{y}</span>
                                                    <span className="bp-archive-dots" />
                                                    <span>{String(n).padStart(2, "0")} POSTS</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {topics.length > 0 && (
                                <div className="bp-block">
                                    <span className={`bp-kicker bp-rule ${courier.className}`}>TOPICS</span>
                                    <div className="bp-cloud">
                                        {(allTopics ? topics : topics.slice(0, 14)).map((t) => (
                                            <button
                                                type="button"
                                                key={t.name}
                                                className={`bp-tag ${courier.className} ${tag === t.name.toLowerCase() ? "is-on" : ""}`}
                                                onClick={() => pickTag(t.name.toLowerCase())}
                                            >
                                                #{t.name}
                                                {t.n > 1 && <sup>{t.n}</sup>}
                                            </button>
                                        ))}
                                        {topics.length > 14 && (
                                            <button type="button" className={`bp-tag bp-tag-more ${courier.className}`} onClick={() => setAllTopics((v) => !v)}>
                                                {allTopics ? "SHOW LESS" : `+${topics.length - 14} MORE`}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </main>

            <style jsx global>{STYLES}</style>
        </div>
    );
}

const STYLES = `
.bp-page {
    position: relative;
    min-height: 100vh;
    background: transparent;
    --ink: #0d2a42;
    --navy: #1b4f72;
    --sky: #3a99c9;
    --muted: #3a7ca5;
    --paper: #fbfcfd;
}
.bp-page a { opacity: 1 !important; }

/* ---- floating top bar (same as Projects / Snippets) ---- */
.bp-bar {
    position: sticky;
    top: 18px;
    z-index: 50;
    width: fit-content;
    max-width: calc(100% - 32px);
    margin: 18px auto 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px;
    border-radius: 16px;
    background: rgba(251, 252, 253, 0.86);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 16px 30px -18px rgba(13, 42, 66, 0.45);
}
.bp-back {
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
.bp-back:hover { background: rgba(27, 79, 114, 0.08); }
.bp-search {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 38px;
    width: 300px;
    max-width: 40vw;
    padding: 0 10px 0 12px;
    border-radius: 11px;
    background: rgba(27, 79, 114, 0.07);
    color: var(--navy);
}
.bp-search input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font-size: 14px; font-weight: 600; color: var(--ink); }
.bp-search input::placeholder { color: rgba(13, 42, 66, 0.45); }
.bp-search button { display: inline-flex; border: 0; background: none; color: var(--navy); cursor: pointer; }
.bp-filter { position: relative; }
.bp-filter-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 38px;
    padding: 0 12px;
    border: 0;
    border-radius: 11px;
    background: rgba(27, 79, 114, 0.07);
    color: var(--ink);
    font-size: 13.5px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
}
.bp-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 200px;
    padding: 6px;
    border-radius: 12px;
    background: var(--paper);
    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 20px 34px -16px rgba(13, 42, 66, 0.5);
}
.bp-menu button {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    border: 0;
    border-radius: 8px;
    background: none;
    color: var(--ink);
    font-size: 13.5px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
}
.bp-menu button:hover { background: rgba(27, 79, 114, 0.07); }
.bp-menu button.is-on { color: var(--navy); font-weight: 800; }
.bp-count { padding: 0 10px 0 4px; font-size: 12px; font-weight: 700; letter-spacing: 0.14em; color: var(--muted); white-space: nowrap; }

/* ---- the framed blog ---- */
.bp-main { position: relative; z-index: 1; max-width: 1240px; margin: 0 auto; padding: 34px 20px 80px; }
.bp-frame {
    position: relative;
    border-radius: 20px;
    background: linear-gradient(160deg, #fbfcfd 0%, #f1f5f8 100%);
    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.1), 0 40px 60px -36px rgba(13, 42, 66, 0.5);
    animation: bp-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes bp-in { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
.bp-frame::before {
    content: "";
    position: absolute;
    inset: 10px;
    border: 1.5px solid rgba(27, 79, 114, 0.18);
    border-radius: 13px;
    pointer-events: none;
}
.bp-chrome {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 10px 10px 0;
    padding: 12px 18px;
    border-bottom: 1.5px solid rgba(27, 79, 114, 0.16);
}
.bp-dots { display: inline-flex; gap: 7px; }
.bp-dots i { width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid rgba(27, 79, 114, 0.45); }
.bp-dots i:first-child { background: var(--navy); border-color: var(--navy); }
.bp-url {
    flex: 1;
    max-width: 460px;
    margin: 0 auto;
    padding: 5px 14px;
    border-radius: 999px;
    background: rgba(27, 79, 114, 0.07);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--navy);
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.bp-live { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; color: var(--muted); }
.bp-live b { width: 7px; height: 7px; border-radius: 50%; background: #3fb27f; box-shadow: 0 0 0 3px rgba(63, 178, 127, 0.2); animation: bp-pulse 2s ease-in-out infinite; }
@keyframes bp-pulse { 50% { box-shadow: 0 0 0 6px rgba(63, 178, 127, 0); } }

.bp-kicker { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.24em; color: var(--muted); }
.bp-rule { padding-bottom: 10px; margin-bottom: 16px; border-bottom: 1.5px solid rgba(27, 79, 114, 0.16); }

.bp-mast { padding: 34px 44px 0; text-align: center; }
.bp-title {
    margin: 8px 0 0;
    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif !important;
    font-size: clamp(54px, 7vw, 96px);
    line-height: 0.95;
    font-weight: 900;
    letter-spacing: -0.045em;
    color: var(--ink);
}
.bp-sub { margin: 14px auto 0; max-width: 560px; font-size: 16px; line-height: 1.55; color: #3d5a70; }
.bp-tabs {
    display: flex;
    gap: 4px;
    margin: 26px -44px 0;
    padding: 0 44px;
    overflow-x: auto;
    scrollbar-width: none;
    border-top: 1.5px solid rgba(27, 79, 114, 0.16);
    border-bottom: 1.5px solid rgba(27, 79, 114, 0.16);
    justify-content: safe center;
}
.bp-tabs::-webkit-scrollbar { display: none; }
.bp-tabs button {
    position: relative;
    flex: none;
    padding: 14px 12px;
    border: 0;
    background: none;
    color: var(--navy);
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.14em;
    cursor: pointer;
    transition: color 0.2s ease;
}
.bp-tabs button::after {
    content: "";
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: -1.5px;
    height: 3px;
    border-radius: 3px 3px 0 0;
    background: var(--ink);
    transform: scaleX(0);
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.bp-tabs button:hover { color: var(--ink); }
.bp-tabs button.is-on { color: var(--ink); }
.bp-tabs button.is-on::after { transform: scaleX(1); }

.bp-body { display: grid; grid-template-columns: minmax(0, 1fr) 320px; }
.bp-feed { padding: 30px 34px 40px 44px; scroll-margin-top: 90px; min-width: 0; }
.bp-side { padding: 30px 40px 40px 30px; border-left: 2px dashed rgba(27, 79, 114, 0.2); }

.bp-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 18px; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; color: var(--muted); }
.bp-filters button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border: 0;
    border-radius: 999px;
    background: var(--ink);
    color: #e9f4fa;
    font: inherit;
    letter-spacing: 0.1em;
    cursor: pointer;
}
.bp-empty { padding: 60px 0; text-align: center; font-size: 12px; font-weight: 700; letter-spacing: 0.2em; color: var(--muted); }
.bp-skel-lead { height: 520px; border-radius: 12px; background: linear-gradient(100deg, #eef3f6 30%, #f8fafb 50%, #eef3f6 70%) 0 0 / 200% 100%; animation: bp-shimmer 1.4s linear infinite; }
@keyframes bp-shimmer { to { background-position: -200% 0; } }

/* covers + meta */
.bp-cover { position: relative; display: block; overflow: hidden; aspect-ratio: 16 / 10; border-radius: 9px; background: #dfe9f0; }
.bp-cover.is-big { aspect-ratio: 16 / 8; border-radius: 12px; box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 20px 34px -20px rgba(13, 42, 66, 0.5); }
.bp-cover img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
.bp-noimg { position: absolute; inset: 0; background: linear-gradient(135deg, var(--navy), var(--ink)); }
.bp-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: var(--navy); }
.bp-slash { color: var(--muted); }
.bp-pill { padding: 2px 9px; border: 1.5px solid rgba(13, 42, 66, 0.4); border-radius: 999px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bp-stats { display: flex; align-items: center; gap: 14px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.08em; color: var(--navy); }
.bp-stats > span { display: inline-flex; align-items: center; gap: 5px; }
.bp-min { color: var(--muted); letter-spacing: 0.14em; }

/* featured */
.bp-lead { display: flex; flex-direction: column; animation: bp-swap 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes bp-swap { from { opacity: 0; transform: translateY(12px); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }
.bp-lead-img { position: relative; display: block; }
.bp-lead-img:hover .bp-cover img, .bp-card-link:hover .bp-cover img { transform: scale(1.05); }
.bp-flag {
    position: absolute;
    top: 14px;
    left: 14px;
    padding: 5px 11px;
    border-radius: 999px;
    background: rgba(251, 252, 253, 0.92);
    color: var(--ink);
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.2em;
    box-shadow: 0 6px 14px -8px rgba(13, 42, 66, 0.5);
}
.bp-lead-body { display: flex; flex-direction: column; padding-top: 22px; }
.bp-lead-title { margin: 12px 0 0; font-size: clamp(26px, 2.8vw, 38px); line-height: 1.12; font-weight: 800; letter-spacing: -0.025em; }
.bp-lead-title a { color: var(--ink); text-decoration: none; background: linear-gradient(var(--sky), var(--sky)) 0 100% / 0 2px no-repeat; transition: background-size 0.45s ease; }
.bp-lead-title a:hover { background-size: 100% 2px; }
.bp-excerpt { margin: 14px 0 0; font-size: 16px; line-height: 1.7; color: #3d5a70; }
.bp-tags, .bp-cloud { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 16px; }
.bp-tag {
    padding: 4px 10px;
    border: 0;
    border-radius: 7px;
    background: rgba(27, 79, 114, 0.08);
    color: var(--navy);
    font-size: 11.5px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
}
.bp-tag:hover { background: rgba(27, 79, 114, 0.16); }
.bp-tag.is-on { background: var(--ink); color: #e9f4fa; }
.bp-tag-more { background: transparent; box-shadow: inset 0 0 0 1.5px rgba(27, 79, 114, 0.3); letter-spacing: 0.1em; }
.bp-tag sup { margin-left: 3px; font-size: 9px; opacity: 0.7; }
.bp-lead-foot { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-top: 20px; padding-top: 16px; border-top: 2px dashed rgba(27, 79, 114, 0.18); }
.bp-read {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 0 18px;
    border: 2px solid var(--ink);
    border-radius: 999px;
    color: var(--ink);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-decoration: none;
    transition: background 0.25s ease, color 0.25s ease;
}
.bp-read:hover { background: var(--ink); color: #e9f4fa; }
.bp-arrow { display: inline-block; transition: transform 0.3s ease; }
.bp-read:hover .bp-arrow { transform: translateX(4px); }

/* the feed */
.bp-feed > .bp-rule { margin-top: 40px; }
.bp-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 30px 26px; }
.bp-card { animation: bp-swap 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
.bp-card-link { display: flex; flex-direction: column; gap: 12px; color: var(--ink); text-decoration: none; }
.bp-card-link .bp-cover { padding: 0; box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 14px 22px -16px rgba(13, 42, 66, 0.5); }
.bp-card-link .bp-meta { margin-top: 2px; }
.bp-card-title { margin: 0; font-size: 19px; line-height: 1.25; font-weight: 800; letter-spacing: -0.015em; color: var(--ink); transition: color 0.2s ease; }
.bp-card-link:hover .bp-card-title { color: var(--navy); }
.bp-card-ex { margin: 0; font-size: 14px; line-height: 1.6; color: #4a6479; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.bp-more {
    display: block;
    margin: 36px auto 0;
    height: 42px;
    padding: 0 22px;
    border: 2px dashed rgba(27, 79, 114, 0.4);
    border-radius: 999px;
    background: transparent;
    color: var(--ink);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.18em;
    cursor: pointer;
    transition: background 0.25s ease, border-color 0.25s ease;
}
.bp-more:hover { background: rgba(27, 79, 114, 0.07); border-color: var(--navy); }

/* sidebar */
.bp-side > * + * { margin-top: 32px; }
.bp-side { position: relative; }
.bp-writer { display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: 14px; background: #fff; box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 14px 22px -18px rgba(13, 42, 66, 0.5); }
.bp-avatar { flex: none; width: 56px; height: 56px; border-radius: 50%; overflow: hidden; display: grid; place-items: center; background: #c9d4da; color: #e9f4fa; font-weight: 800; font-size: 22px; box-shadow: 0 0 0 3px #fff, 0 0 0 4.5px rgba(27, 79, 114, 0.25); }
.bp-avatar img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 18%; image-rendering: pixelated; }
.bp-writer strong { display: block; margin-top: 4px; font-size: 15.5px; font-weight: 800; color: var(--ink); line-height: 1.25; }
.bp-writer em { display: block; margin-top: 2px; font-style: normal; font-size: 12.5px; color: #4a6479; }
.bp-top { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.bp-top a { display: flex; gap: 12px; padding: 8px 6px; margin: 0 -6px; border-radius: 9px; color: var(--ink); text-decoration: none; transition: background 0.2s ease; }
.bp-top a:hover { background: rgba(27, 79, 114, 0.06); }
.bp-top-no { flex: none; font-size: 20px; font-weight: 700; line-height: 1.1; color: rgba(27, 79, 114, 0.35); }
.bp-top-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.bp-top-title { font-size: 14px; font-weight: 700; line-height: 1.35; }
.bp-top-meta { display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; color: var(--muted); }
.bp-archive { list-style: none; margin: 0; padding: 0; }
.bp-archive button {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 6px;
    margin: 0 -6px;
    width: calc(100% + 12px);
    border: 0;
    border-radius: 8px;
    background: none;
    color: var(--ink);
    font: inherit;
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    cursor: pointer;
}
.bp-archive button:hover { background: rgba(27, 79, 114, 0.06); }
.bp-archive button.is-on { background: var(--ink); color: #e9f4fa; }
.bp-archive-dots { flex: 1; height: 2px; background: radial-gradient(circle, rgba(27, 79, 114, 0.35) 1px, transparent 1.4px) 0 0 / 7px 2px repeat-x; }
.bp-archive button.is-on .bp-archive-dots { opacity: 0.4; }
.bp-cloud { margin-top: 0; }

/* ---- smaller screens ---- */
@media (max-width: 1020px) {
    .bp-body { grid-template-columns: minmax(0, 1fr); }
    .bp-side { border-left: 0; border-top: 2px dashed rgba(27, 79, 114, 0.2); padding: 30px 34px 40px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 30px; }
    .bp-side > * + * { margin-top: 0; }
}
@media (max-width: 680px) {
    .bp-main { padding: 22px 10px 60px; }
    .bp-mast { padding: 26px 20px 0; }
    .bp-tabs { margin: 22px -20px 0; padding: 0 20px; justify-content: flex-start; }
    .bp-feed { padding: 24px 20px 30px; }
    .bp-grid { grid-template-columns: minmax(0, 1fr); }
    .bp-side { grid-template-columns: minmax(0, 1fr); padding: 26px 20px 34px; }
    .bp-chrome .bp-live { display: none; }
    .bp-bar { flex-wrap: wrap; justify-content: center; }
    .bp-search { order: 3; width: 100%; max-width: none; }
}
`;
