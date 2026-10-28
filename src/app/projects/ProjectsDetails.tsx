"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Courier_Prime } from "next/font/google";
import { ArrowLeft, Check, ChevronDown, Grid3x3, List, Search, X } from "lucide-react";
import { Project } from "@/types/project";
import ProjectModal from "@/components/Home/ProjectModal";
import PreviewModal from "@/components/Home/PreviewModal";
import PixelField from "@/components/Home/PixelField";
import ProjectWall from "./ProjectWall";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

const thisYear = String(new Date().getFullYear());
const yearOf = (d?: string) => (d || "").match(/\d{4}/)?.[0] || "";

/**
 * All projects as a curved wall of prints: cards near the middle of the screen sit flat,
 * cards toward the edges bend away (like the reference's warped grid). Same pixel
 * background as the homepage. Search + tech filter in a floating bar; List / Grid switch
 * at the bottom. Click a card for its details.
 */
export default function ProjectsDetails() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [menu, setMenu] = useState(false);
    const [view, setView] = useState<"grid" | "list">("grid");
    const [selected, setSelected] = useState<Project | null>(null);
    const [preview, setPreview] = useState<Project | null>(null);
    const wallRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch("/api/projects")
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => Array.isArray(d) && setProjects(d.filter((p: Project) => (p.category || "").toLowerCase() !== "photography")))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // close the filter menu on outside click / Esc
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

    const techs = useMemo(() => Array.from(new Set(projects.flatMap((p) => p.tech_stack || []))).sort(), [projects]);
    const shown = projects.filter((p) => {
        const q = search.trim().toLowerCase();
        const okQ = !q || p.title.toLowerCase().includes(q) || p.tech_stack?.some((t) => t.toLowerCase().includes(q)) || (p.category || "").toLowerCase().includes(q);
        const okF = filter === "all" || p.tech_stack?.includes(filter);
        return okQ && okF;
    });

    return (
        <div className="pw-page">
            <PixelField />

            {/* top bar: back, search, filter */}
            <div className="pw-bar">
                <Link href="/#projects" className="pw-back" aria-label="Back to home">
                    <ArrowLeft size={16} strokeWidth={2.4} />
                    <span className={courier.className}>HOME</span>
                </Link>
                <div className="pw-search">
                    <Search size={16} strokeWidth={2.4} />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects…" aria-label="Search projects" />
                    {search && (
                        <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="pw-filter" ref={menuRef}>
                    <button type="button" className={`pw-filter-btn ${filter !== "all" ? "is-on" : ""}`} onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
                        <span>{filter === "all" ? "All stacks" : filter}</span>
                        <ChevronDown size={15} strokeWidth={2.4} />
                    </button>
                    {menu && (
                        <div className="pw-menu" role="listbox">
                            {["all", ...techs].map((t) => (
                                <button
                                    type="button"
                                    key={t}
                                    role="option"
                                    aria-selected={filter === t}
                                    className={filter === t ? "is-on" : ""}
                                    onClick={() => {
                                        setFilter(t);
                                        setMenu(false);
                                    }}
                                >
                                    {t === "all" ? "All stacks" : t}
                                    {filter === t && <Check size={14} strokeWidth={2.6} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <span className={`pw-count ${courier.className}`}>
                    {String(shown.length).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
                </span>
            </div>

            {/* grid: the endless wall */}
            {view === "grid" && !loading && shown.length > 0 && <ProjectWall projects={shown} onOpen={setSelected} />}

            {/* list (and loading / empty states) */}
            <main className={`pw-wall is-${view === "grid" && !loading && shown.length > 0 ? "hidden" : view}`} ref={wallRef}>
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                          <div className="pw-cell" key={i}>
                              <div className="pw-card pw-skel" />
                          </div>
                      ))
                    : shown.map((p, i) => {
                          const y = yearOf(p.date);
                          return (
                              <div className="pw-cell" key={p.id} style={{ animationDelay: `${Math.min(i, 12) * 50}ms` }}>
                                  <button type="button" className="pw-card" onClick={() => setSelected(p)} aria-label={`Open ${p.title}`}>
                                      <span className="pw-img">
                                          {p.image_url ? (
                                              // eslint-disable-next-line @next/next/no-img-element
                                              <img src={p.image_url} alt="" draggable={false} loading="lazy" />
                                          ) : (
                                              <span className="pw-noimg" />
                                          )}
                                      </span>
                                  </button>
                                  <div className="pw-label">
                                      <span className="pw-title">{p.title}</span>
                                      <span className={`pw-tags ${courier.className}`}>
                                          {p.category && <span className="pw-tag">{p.category.toUpperCase()}</span>}
                                          {y === thisYear ? <span className="pw-tag is-new">NEW</span> : y && <span className="pw-tag">{y}</span>}
                                      </span>
                                      {view === "list" && (
                                          <span className={`pw-stack ${courier.className}`}>{(p.tech_stack || []).slice(0, 5).join(" · ")}</span>
                                      )}
                                  </div>
                              </div>
                          );
                      })}
                {!loading && shown.length === 0 && <p className={`pw-empty ${courier.className}`}>NO PROJECTS MATCH. TRY ANOTHER SEARCH.</p>}
            </main>

            {/* view switch */}
            <div className={`pw-views ${courier.className}`} role="tablist" aria-label="Layout">
                <button type="button" role="tab" aria-selected={view === "list"} className={view === "list" ? "is-on" : ""} onClick={() => setView("list")}>
                    <List size={14} strokeWidth={2.4} /> LIST
                </button>
                <button type="button" role="tab" aria-selected={view === "grid"} className={view === "grid" ? "is-on" : ""} onClick={() => setView("grid")}>
                    <Grid3x3 size={14} strokeWidth={2.4} /> GRID
                </button>
            </div>


            {selected && <ProjectModal project={selected} isOpen={!!selected} onClose={() => setSelected(null)} onPreview={(p) => setPreview(p)} />}
            {preview && <PreviewModal project={preview} isOpen={!!preview} onClose={() => setPreview(null)} />}

            <style jsx>{`
                .pw-page {
                    position: relative;
                    min-height: 100vh;
                    background: transparent;
                    --ink: #0d2a42;
                    --navy: #1b4f72;
                    --sky: #3a99c9;
                    --paper: #fbfcfd;
                }

                /* ---- floating top bar ---- */
                .pw-bar {
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
                .pw-page :global(.pw-back) {
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
                    opacity: 1 !important;
                    transition: background 0.2s ease;
                }
                .pw-page :global(.pw-back:hover) {
                    background: rgba(27, 79, 114, 0.08);
                }
                .pw-search {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    height: 38px;
                    width: 300px;
                    max-width: 42vw;
                    padding: 0 10px 0 12px;
                    border-radius: 11px;
                    background: rgba(27, 79, 114, 0.07);
                    color: var(--navy);
                }
                .pw-search input {
                    flex: 1;
                    min-width: 0;
                    border: 0;
                    outline: 0;
                    background: transparent;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--ink);
                }
                .pw-search input::placeholder {
                    color: rgba(13, 42, 66, 0.45);
                }
                .pw-search button {
                    display: inline-flex;
                    border: 0;
                    background: none;
                    color: var(--navy);
                    cursor: pointer;
                }
                .pw-filter {
                    position: relative;
                }
                .pw-filter-btn {
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
                    max-width: 200px;
                }
                .pw-filter-btn span {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .pw-filter-btn.is-on {
                    background: var(--navy);
                    color: #e9f4fa;
                }
                .pw-menu {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0;
                    width: 230px;
                    max-height: 320px;
                    overflow: auto;
                    padding: 6px;
                    border-radius: 12px;
                    background: var(--paper);
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 20px 34px -16px rgba(13, 42, 66, 0.5);
                }
                .pw-menu button {
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
                .pw-menu button:hover {
                    background: rgba(27, 79, 114, 0.07);
                }
                .pw-menu button.is-on {
                    color: var(--navy);
                    font-weight: 800;
                }
                .pw-count {
                    padding: 0 10px 0 4px;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.14em;
                    color: #3a7ca5;
                    white-space: nowrap;
                }

                /* ---- the wall ---- */
                .pw-wall {
                    position: relative;
                    max-width: 1720px;
                    margin: 0 auto;
                    padding: 70px 24px 140px;
                }
                .pw-wall.is-hidden {
                    display: none;
                }
                .pw-wall.is-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                    gap: 56px 34px;
                }
                .pw-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    animation: pw-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
                @keyframes pw-in {
                    from {
                        opacity: 0;
                        transform: translateY(24px);
                    }
                    to {
                        opacity: 1;
                        transform: none;
                    }
                }
                .pw-card {
                    position: relative;
                    display: block;
                    width: 100%;
                    padding: 8px;
                    border: 0;
                    border-radius: 18px;
                    background: #fff;
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 28px 40px -26px rgba(13, 42, 66, 0.55);
                    cursor: pointer;
                    transform-origin: 50% 50%;
                    will-change: transform;
                    transition: box-shadow 0.35s ease;
                }
                .pw-img {
                    position: relative;
                    display: block;
                    aspect-ratio: 16 / 10;
                    overflow: hidden;
                    border-radius: 12px;
                    background: #dfe9f0;
                }
                .pw-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: top center;
                    display: block;
                    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .pw-noimg {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, var(--navy), var(--ink));
                }
                .pw-card:hover,
                .pw-card:focus-visible {
                    outline: none;
                    box-shadow: 0 0 0 2px var(--sky), 0 34px 46px -24px rgba(13, 42, 66, 0.6);
                }
                .pw-card:hover .pw-img img {
                    transform: scale(1.05);
                }
                .pw-skel {
                    aspect-ratio: 16 / 10.8;
                    background: linear-gradient(100deg, #eef3f6 30%, #f8fafb 50%, #eef3f6 70%) 0 0 / 200% 100%;
                    animation: pw-shimmer 1.4s linear infinite;
                }
                @keyframes pw-shimmer {
                    to {
                        background-position: -200% 0;
                    }
                }
                .pw-label {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 14px;
                    padding: 0 6px;
                }
                .pw-title {
                    min-width: 0;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 15px;
                    font-weight: 800;
                    letter-spacing: 0.02em;
                    text-transform: uppercase;
                    color: var(--ink);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .pw-tags {
                    display: flex;
                    flex: none;
                    gap: 6px;
                }
                .pw-tag {
                    padding: 3px 8px;
                    border-radius: 6px;
                    background: rgba(27, 79, 114, 0.08);
                    font-size: 11.5px;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    color: var(--navy);
                }
                .pw-tag.is-new {
                    background: var(--sky);
                    color: #fff;
                }

                /* list view: flat rows */
                .pw-wall.is-list {
                    max-width: 1280px;
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr)); /* two columns */
                    gap: 14px 18px;
                    align-items: start;
                }
                .pw-wall.is-list .pw-cell {
                    flex-direction: row;
                    align-items: center;
                    gap: 22px;
                    padding: 10px;
                    border-radius: 16px;
                    background: rgba(251, 252, 253, 0.8);
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.07);
                }
                .pw-wall.is-list .pw-card {
                    width: 180px;
                    flex: none;
                    padding: 5px;
                    border-radius: 12px;
                    transform: none !important;
                }
                .pw-wall.is-list .pw-img {
                    border-radius: 8px;
                }
                .pw-wall.is-list .pw-label {
                    flex: 1;
                    flex-wrap: wrap;
                    row-gap: 6px;
                }
                .pw-stack {
                    flex-basis: 100%;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    color: rgba(13, 42, 66, 0.5);
                }
                .pw-empty {
                    grid-column: 1 / -1;
                    padding: 80px 0;
                    text-align: center;
                    font-size: 13px;
                    letter-spacing: 0.2em;
                    color: #3a7ca5;
                }

                /* ---- bottom view switch ---- */
                .pw-views {
                    position: fixed;
                    left: 50%;
                    bottom: 22px;
                    z-index: 50;
                    display: flex;
                    gap: 4px;
                    padding: 5px;
                    border-radius: 13px;
                    background: rgba(251, 252, 253, 0.9);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 14px 26px -14px rgba(13, 42, 66, 0.45);
                    transform: translateX(-50%);
                }
                .pw-views button {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    height: 32px;
                    padding: 0 13px;
                    border: 0;
                    border-radius: 9px;
                    background: none;
                    color: var(--navy);
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.14em;
                    cursor: pointer;
                    transition: background 0.2s ease, color 0.2s ease;
                }
                .pw-views button.is-on {
                    background: var(--ink);
                    color: #e9f4fa;
                }

                :global(:root.dark) .pw-title {
                    color: #e9f4fa;
                }
                :global(:root.dark) .pw-tag {
                    color: #9fd8f2;
                    background: rgba(159, 216, 242, 0.12);
                }
                @media (max-width: 720px) {
                    .pw-wall {
                        padding: 40px 16px 120px;
                    }
                    .pw-wall.is-grid {
                        grid-template-columns: minmax(0, 1fr);
                    }
                    .pw-count {
                        display: none;
                    }
                    .pw-wall.is-list {
                        grid-template-columns: minmax(0, 1fr);
                    }
                    .pw-wall.is-list .pw-card {
                        width: 120px;
                    }
                }
            `}</style>
        </div>
    );
}
