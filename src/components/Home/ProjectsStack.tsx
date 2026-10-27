"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Courier_Prime } from "next/font/google";
import { ChevronLeft, ChevronRight, FolderKanban } from "lucide-react";
import type { Project } from "@/types/project";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

/** Simple Icons slugs for the technologies we know; anything else gets a lettered badge. */
const LOGOS: Record<string, string> = {
    "react native": "react",
    react: "react",
    expo: "expo",
    "expo router": "expo",
    python: "python",
    flask: "flask",
    sqlite: "sqlite",
    "hugging face": "huggingface",
    leaflet: "leaflet",
    openstreetmap: "openstreetmap",
    swiftui: "swift",
    swift: "swift",
    firebase: "firebase",
    appstore: "appstore",
    "app store": "appstore",
    "html5": "html5",
    canva: "canva",
    java: "openjdk",
    scss: "sass",
    sass: "sass",
    photoshop: "adobephotoshop",
    illustrator: "adobeillustrator",
    "hugging face transformers": "huggingface",
    ios: "apple",
    php: "php",
    sql: "mysql",
    mysql: "mysql",
    javascript: "javascript",
    typescript: "typescript",
    "next.js": "nextdotjs",
    nextjs: "nextdotjs",
    supabase: "supabase",
    figma: "figma",
    html: "html5",
    css: "css",
    tailwind: "tailwindcss",
    "tailwind css": "tailwindcss",
    "node.js": "nodedotjs",
    laravel: "laravel",
    flutter: "flutter",
    kotlin: "kotlin",
    git: "git",
    github: "github",
    vercel: "vercel",
    tensorflow: "tensorflow",
    pytorch: "pytorch",
};

const monogram = (t: string) =>
    t
        .replace(/[^A-Za-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

type Skill = { name: string; icon_url?: string | null };

function TechChip({ name, src }: { name: string; src: string | null }) {
    const [broken, setBroken] = useState(false);
    return (
        <>
            <span className="pst-chip-face">
                {src && !broken ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" draggable={false} onError={() => setBroken(true)} />
                ) : (
                    <span className="pst-mono">{monogram(name)}</span>
                )}
            </span>
            <span className={`pst-chip-name ${courier.className}`}>{name}</span>
        </>
    );
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** piecewise blend between the value at d=-1, d=0 and d=+1 */
const tri = (d: number, prev: number, mid: number, next: number) => (d < 0 ? lerp(mid, prev, clamp(-d, 0, 1)) : lerp(mid, next, clamp(d, 0, 1)));

/**
 * Projects + tech stack in one place. Drag (or swipe / arrows / trackpad sideways) to move
 * between projects. Left: main image. Middle: number, name, category and date. Right: the
 * project's logo (set in Admin, or a default project icon) with its tech stack orbiting it.
 * The orbit gathers once a project settles and tucks away while you drag. Neighbouring
 * projects wait at the corners: their images on the left, their logos on the right.
 */
export default function ProjectsStack() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [pos, setPos] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [settledIdx, setSettledIdx] = useState<number | null>(null);
    const [size, setSize] = useState({ w: 1200, h: 620 });
    const stageRef = useRef<HTMLDivElement>(null);
    const posRef = useRef(0);
    const targetRef = useRef(0);
    const rafRef = useRef(0);
    const lastSettled = useRef(0);

    useEffect(() => {
        Promise.all([
            fetch("/api/projects").then((r) => (r.ok ? r.json() : [])),
            fetch("/api/skills").then((r) => (r.ok ? r.json() : [])).catch(() => []),
        ])
            .then(([p, s]) => {
                const list = Array.isArray(p) ? p.filter((x: Project) => (x.category || "").toLowerCase() !== "photography") : [];
                setProjects(list);
                setSkills(Array.isArray(s) ? s : []);
            })
            .catch(() => setProjects([]))
            .finally(() => setLoading(false));
    }, []);

    const n = projects.length;

    // tech name → logo url: the skill's own icon (Admin) first, then Simple Icons
    const iconFor = useMemo(() => {
        const own = new Map(skills.filter((s) => s.icon_url).map((s) => [s.name.trim().toLowerCase(), s.icon_url as string]));
        return (t: string) => {
            const k = t.trim().toLowerCase();
            if (own.has(k)) return own.get(k) as string;
            const slug = LOGOS[k];
            return slug ? `https://cdn.simpleicons.org/${slug}` : null;
        };
    }, [skills]);

    // stage size drives the layout
    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
        ro.observe(el);
        return () => ro.disconnect();
    }, [loading]);

    // ease toward the target; the orbit only gathers once we've stopped
    const animate = useCallback(() => {
        cancelAnimationFrame(rafRef.current);
        const step = () => {
            const d = targetRef.current - posRef.current;
            if (Math.abs(d) < 0.0015) {
                posRef.current = targetRef.current;
                setPos(posRef.current);
                if (n) setSettledIdx((((Math.round(posRef.current) % n) + n) % n));
                return;
            }
            posRef.current += d * 0.14;
            setPos(posRef.current);
            rafRef.current = requestAnimationFrame(step);
        };
        rafRef.current = requestAnimationFrame(step);
    }, [n]);
    useEffect(() => {
        if (n) setSettledIdx(0);
        return () => cancelAnimationFrame(rafRef.current);
    }, [n]);

    const go = useCallback(
        (t: number) => {
            setSettledIdx(null);
            targetRef.current = Math.round(t);
            animate();
        },
        [animate]
    );

    // drag
    const drag = useRef<{ x: number; start: number; last: number; lastT: number; v: number; moved: boolean } | null>(null);
    const PX = Math.max(320, Math.min(560, size.w * 0.42)); // px of drag per project
    const onDown = (e: React.PointerEvent) => {
        if (e.button !== 0 || !n) return;
        if ((e.target as HTMLElement).closest("a,button")) return;
        cancelAnimationFrame(rafRef.current);
        drag.current = { x: e.clientX, start: posRef.current, last: e.clientX, lastT: performance.now(), v: 0, moved: false };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };
    const onMove = (e: React.PointerEvent) => {
        const g = drag.current;
        if (!g) return;
        const dx = e.clientX - g.x;
        if (!g.moved && Math.abs(dx) > 4) {
            g.moved = true;
            setDragging(true);
            setSettledIdx(null);
        }
        if (!g.moved) return;
        const now = performance.now();
        g.v = (e.clientX - g.last) / Math.max(1, now - g.lastT);
        g.last = e.clientX;
        g.lastT = now;
        posRef.current = g.start - dx / PX;
        targetRef.current = posRef.current;
        setPos(posRef.current);
    };
    const onUp = () => {
        const g = drag.current;
        drag.current = null;
        setDragging(false);
        if (!g) return;
        if (!g.moved) return go(posRef.current);
        // a quick flick carries on to the neighbouring project (never further)
        const fling = -g.v * 0.35;
        const p = posRef.current;
        go(fling > 0.25 ? Math.ceil(p + 0.001) : fling < -0.25 ? Math.floor(p - 0.001) : Math.round(p));
    };

    // sideways trackpad scroll / keys
    useEffect(() => {
        const el = stageRef.current;
        if (!el || !n) return;
        let acc = 0;
        let idle = 0;
        const onWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical scroll stays the page's
            e.preventDefault();
            acc += e.deltaX;
            setSettledIdx(null);
            posRef.current = targetRef.current + acc / PX;
            setPos(posRef.current);
            window.clearTimeout(idle);
            idle = window.setTimeout(() => {
                acc = 0;
                go(posRef.current);
            }, 140);
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => {
            el.removeEventListener("wheel", onWheel);
            window.clearTimeout(idle);
        };
    }, [n, PX, go]);
    const onKey = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowRight") (e.preventDefault(), go(targetRef.current + 1));
        if (e.key === "ArrowLeft") (e.preventDefault(), go(targetRef.current - 1));
    };

    if (loading) {
        return (
            <section id="projects" className="pst-section">
                <div className="container" style={{ minHeight: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="animate-pulse text-[var(--color-text-muted)] text-xl font-bold">Loading Projects...</div>
                </div>
            </section>
        );
    }
    if (!n) return <section id="projects" className="pst-section" />;

    // ----- layout -----
    const { w: W, h: H } = size;
    const narrow = W < 900;
    const wrapD = (i: number) => {
        let d = (((i - pos) % n) + n) % n;
        if (d > n / 2) d -= n;
        return d;
    };
    const idx = (((Math.round(pos) % n) + n) % n);
    const imgW = narrow ? Math.min(W - 40, 440) : Math.min(520, W * 0.34);
    const imgH = imgW * 0.6;
    const tile = narrow ? 150 : Math.min(210, W * 0.15);
    const leftX = narrow ? W / 2 : W * 0.235;
    const rightX = narrow ? W / 2 : W * 0.775;
    const midX = W / 2;
    const cy = H / 2;
    const imgY = narrow ? 150 : cy;
    const textY = narrow ? 150 + imgH / 2 + 90 : cy;
    const tileY = narrow ? H - tile / 2 - 70 : cy;
    const orbitR = tile * 0.5 + (narrow ? 58 : 86);
    const cornerX = 70;
    const cornerY = narrow ? 0 : 46;
    // orbit shows the last settled project; it tucks back into the logo while you drag
    if (settledIdx !== null) lastSettled.current = settledIdx;
    const orbitIdx = lastSettled.current;
    const orbitOut = settledIdx === null || dragging || orbitIdx !== idx;
    const techs = (projects[orbitIdx]?.tech_stack || []).filter(Boolean);

    return (
        <section id="projects" className="pst-section" aria-roledescription="carousel" aria-label="Projects and tech stack">
            <span id="tech-stack" className="pst-anchor" aria-hidden="true" />
            <div className="container pst-head">
                <div className="section-header">
                    <h2>Projects</h2>
                    <p className="section-subtitle">Drag sideways to browse. Each project&apos;s tech stack gathers around its logo.</p>
                </div>
            </div>

            <div
                ref={stageRef}
                className={`pst-stage ${dragging ? "is-dragging" : ""} ${narrow ? "is-narrow" : ""}`}
                data-no-ripple=""
                tabIndex={0}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                onKeyDown={onKey}
            >
                {/* main images: current in the middle-left, neighbours tucked in the left corners */}
                {projects.map((p, i) => {
                    const d = wrapD(i);
                    if (Math.abs(d) > 1.9) return null;
                    const a = Math.abs(d);
                    const x = tri(d, cornerX + imgW * 0.18, leftX, cornerX + imgW * 0.18);
                    const y = tri(d, cornerY + imgH * 0.12, imgY, H - cornerY - imgH * 0.12);
                    const rot = tri(d, -32, -1.5, 34);
                    const sc = tri(d, 0.46, 1, 0.46) * (a > 1 ? 1 - (a - 1) * 0.5 : 1);
                    const op = a > 1 ? clamp(1 - (a - 1) / 0.8, 0, 1) : 1;
                    if (narrow && a > 0.6) return null;
                    return (
                        <div
                            key={`img-${p.id}`}
                            className="pst-img"
                            style={{
                                width: imgW,
                                height: imgH,
                                left: x - imgW / 2,
                                top: y - imgH / 2,
                                opacity: narrow ? clamp(1 - a * 1.8, 0, 1) : op,
                                zIndex: 50 - Math.round(a * 10),
                                transform: `perspective(1200px) rotate(${rot}deg) rotateY(${a < 0.5 ? 9 - a * 10 : 0}deg) scale(${sc})`,
                            }}
                            onClick={() => Math.round(pos) !== Math.round(pos + d) && go(targetRef.current + Math.round(d))}
                        >
                            {p.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.image_url} alt={a < 0.5 ? p.title : ""} draggable={false} />
                            ) : (
                                <span className="pst-noimg" />
                            )}
                        </div>
                    );
                })}

                {/* logos: current on the right, neighbours in the right corners */}
                {projects.map((p, i) => {
                    const d = wrapD(i);
                    if (Math.abs(d) > 1.9) return null;
                    const a = Math.abs(d);
                    if (narrow && a > 0.6) return null;
                    const x = tri(d, W - cornerX - tile * 0.1, rightX, W - cornerX - tile * 0.1);
                    const y = tri(d, cornerY + tile * 0.25, tileY, H - cornerY - tile * 0.25);
                    const rot = tri(d, 30, 2, -32);
                    const sc = tri(d, 0.62, 1, 0.62) * (a > 1 ? 1 - (a - 1) * 0.5 : 1);
                    const op = a > 1 ? clamp(1 - (a - 1) / 0.8, 0, 1) : 1;
                    return (
                        <div
                            key={`logo-${p.id}`}
                            className="pst-tile"
                            style={{
                                width: tile,
                                height: tile,
                                padding: Math.round(tile * 0.17),
                                left: x - tile / 2,
                                top: y - tile / 2,
                                opacity: narrow ? clamp(1 - a * 1.8, 0, 1) : op,
                                zIndex: 40 - Math.round(a * 10),
                                transform: `rotate(${rot}deg) scale(${sc})`,
                            }}
                        >
                            {p.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.logo_url} alt={a < 0.5 ? `${p.title} logo` : ""} draggable={false} />
                            ) : (
                                <FolderKanban className="pst-fallback" strokeWidth={1.6} aria-hidden="true" />
                            )}
                        </div>
                    );
                })}

                {/* tech stack orbiting the current logo */}
                <div className={`pst-orbit ${orbitOut ? "is-out" : ""}`} style={{ left: rightX, top: tileY }} key={`orbit-${orbitIdx}`}>
                    {techs.map((t, k) => {
                        const ang = -Math.PI / 2 + (k / techs.length) * Math.PI * 2;
                        return (
                            <div
                                key={t}
                                className="pst-chip"
                                title={t}
                                style={
                                    {
                                        "--tx": `${Math.cos(ang) * orbitR}px`,
                                        "--ty": `${Math.sin(ang) * orbitR}px`,
                                        "--d": `${k * 55}ms`,
                                    } as React.CSSProperties
                                }
                            >
                                <TechChip name={t} src={iconFor(t)} />
                            </div>
                        );
                    })}
                </div>

                {/* middle: number, name, category + date */}
                {projects.map((p, i) => {
                    const d = wrapD(i);
                    const a = Math.abs(d);
                    if (a > 0.55) return null;
                    const year = (p.date || "").match(/\d{4}/)?.[0];
                    return (
                        <div
                            key={`txt-${p.id}`}
                            className="pst-text"
                            style={{
                                left: midX,
                                top: textY,
                                opacity: clamp(1 - a * 2.2, 0, 1),
                                transform: `translate(-50%, -50%) translateY(${d * 34}px)`,
                                pointerEvents: a < 0.2 ? "auto" : "none",
                            }}
                            aria-hidden={a >= 0.2}
                        >
                            <span className={`pst-no ${courier.className}`}>
                                N°{String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                            </span>
                            <h3 className="pst-title">{p.title}</h3>
                            <span className="pst-tags">
                                {p.category && <span className="pst-tag">{p.category}</span>}
                                {(p.date || year) && <span className="pst-tag">{p.date || year}</span>}
                            </span>
                            <Link href={`/projects/${p.slug}`} className="pst-view" tabIndex={a < 0.2 ? 0 : -1}>
                                View project
                            </Link>
                        </div>
                    );
                })}

                <div className="pst-nav">
                    <button type="button" className="pst-arrow" aria-label="Previous project" onClick={() => go(targetRef.current - 1)}>
                        <ChevronLeft size={18} />
                    </button>
                    <span className={`pst-hint ${courier.className}`}>DRAG</span>
                    <button type="button" className="pst-arrow" aria-label="Next project" onClick={() => go(targetRef.current + 1)}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                <Link href="/projects" className="btn-view-all">
                    View All Projects
                </Link>
            </div>

            <style jsx>{`
                .pst-section {
                    position: relative;
                    padding: 6rem 0 5rem;
                    overflow: hidden;
                }
                .pst-anchor {
                    position: absolute;
                    top: 0;
                }
                .pst-head :global(.section-header) {
                    margin-bottom: 0.5rem;
                }
                .pst-stage {
                    position: relative;
                    height: ${narrow ? 860 : 640}px;
                    width: 100%;
                    max-width: 1500px;
                    margin: 0 auto;
                    cursor: grab;
                    touch-action: pan-y;
                    user-select: none;
                    outline: none;
                }
                .pst-stage.is-dragging {
                    cursor: grabbing;
                }
                .pst-img {
                    position: absolute;
                    overflow: hidden;
                    /* a slightly bowed print, like the reference */
                    border-radius: 14px 18px 16px 12px / 20px 26px 14px 18px;
                    background: #dfe9f0;
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 26px 40px -22px rgba(13, 42, 66, 0.5);
                    will-change: transform;
                }
                .pst-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: top center;
                    display: block;
                    pointer-events: none;
                }
                .pst-noimg {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #1b4f72, #0d2a42);
                }
                .pst-tile {
                    position: absolute;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 14px;
                    background: linear-gradient(160deg, #fbfcfd 0%, #eef3f6 100%);
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.07), 0 5px 0 #dfe6eb, 0 6px 0 rgba(13, 42, 66, 0.1),
                        0 24px 36px -18px rgba(13, 42, 66, 0.45);
                    will-change: transform;
                }
                .pst-tile img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    pointer-events: none;
                }
                .pst-tile :global(.pst-fallback) {
                    width: 62%;
                    height: 62%;
                    color: #1b4f72;
                }

                .pst-orbit {
                    position: absolute;
                    width: 0;
                    height: 0;
                    z-index: 60;
                    pointer-events: none;
                    animation: pst-spin 90s linear infinite;
                }
                @keyframes pst-spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
                .pst-chip {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: ${narrow ? 40 : 50}px;
                    margin: -${narrow ? 20 : 25}px 0 0 -${narrow ? 20 : 25}px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    animation: pst-in 0.6s cubic-bezier(0.34, 1.4, 0.64, 1) var(--d) both;
                }
                .pst-chip > :global(*) {
                    animation: pst-counter 90s linear infinite;
                }
                @keyframes pst-counter {
                    to {
                        transform: rotate(-360deg);
                    }
                }
                .pst-orbit.is-out .pst-chip {
                    animation: pst-out 0.32s ease-in both;
                }
                @keyframes pst-out {
                    from {
                        opacity: 1;
                        transform: translate(var(--tx), var(--ty)) scale(1);
                    }
                    to {
                        opacity: 0;
                        transform: translate(0, 0) scale(0.3);
                    }
                }
                @keyframes pst-in {
                    from {
                        opacity: 0;
                        transform: translate(0, 0) scale(0.3);
                    }
                    to {
                        opacity: 1;
                        transform: translate(var(--tx), var(--ty)) scale(1);
                    }
                }
                .pst-chip :global(.pst-chip-face) {
                    width: ${narrow ? 40 : 50}px;
                    height: ${narrow ? 40 : 50}px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    background: #fff;
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 3px 0 #e3e9ee, 0 10px 18px -10px rgba(13, 42, 66, 0.45);
                }
                .pst-chip :global(.pst-chip-face img) {
                    width: 56%;
                    height: 56%;
                    object-fit: contain;
                }
                .pst-chip :global(.pst-mono) {
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: ${narrow ? 11 : 13}px;
                    font-weight: 800;
                    color: #1b4f72;
                }
                .pst-chip :global(.pst-chip-name) {
                    max-width: 90px;
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    color: #1b4f72;
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .pst-text {
                    position: absolute;
                    z-index: 70;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    width: ${narrow ? Math.min(W - 40, 420) : Math.min(290, W * 0.2)}px;
                    text-align: center;
                }
                .pst-no {
                    font-size: 13px;
                    font-weight: 700;
                    letter-spacing: 0.16em;
                    color: #3a7ca5;
                }
                .pst-title {
                    margin: 0;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif !important;
                    font-size: clamp(26px, 2.6vw, 40px);
                    font-weight: 800;
                    line-height: 1.05;
                    letter-spacing: -0.02em;
                    color: var(--color-text-primary);
                }
                .pst-tags {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 6px;
                }
                .pst-tag {
                    padding: 4px 11px;
                    border-radius: 7px;
                    background: rgba(27, 79, 114, 0.08);
                    font-size: 12.5px;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    color: #1b4f72;
                }
                .pst-text :global(.pst-view) {
                    margin-top: 6px;
                    padding: 8px 16px;
                    border-radius: 9px;
                    background: rgba(27, 79, 114, 0.1);
                    font-size: 14px;
                    font-weight: 700;
                    color: #0d2a42;
                    text-decoration: none;
                    opacity: 1 !important;
                    transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
                }
                .pst-text :global(.pst-view:hover) {
                    background: #1b4f72;
                    color: #fff;
                    transform: translateY(-1px);
                }
                :global(:root.dark) .pst-tag,
                :global(:root.dark) .pst-chip :global(.pst-chip-name) {
                    color: #9fd8f2;
                }
                :global(:root.dark) .pst-tag {
                    background: rgba(159, 216, 242, 0.12);
                }
                :global(:root.dark) .pst-text :global(.pst-view) {
                    background: rgba(159, 216, 242, 0.14);
                    color: #e9f4fa;
                }

                .pst-nav {
                    position: absolute;
                    left: 50%;
                    bottom: 18px;
                    z-index: 80;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    transform: translateX(-50%);
                }
                .pst-arrow {
                    width: 36px;
                    height: 36px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    border: 1.5px solid rgba(27, 79, 114, 0.35);
                    background: rgba(255, 255, 255, 0.7);
                    color: #1b4f72;
                    cursor: pointer;
                    transition: background 0.2s ease, color 0.2s ease;
                }
                .pst-arrow:hover {
                    background: #1b4f72;
                    color: #fff;
                }
                .pst-hint {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.3em;
                    color: #3a7ca5;
                }
                @media (prefers-reduced-motion: reduce) {
                    .pst-orbit,
                    .pst-chip > :global(*) {
                        animation: none;
                    }
                }
            `}</style>
        </section>
    );
}
