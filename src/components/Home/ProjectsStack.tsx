"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Courier_Prime } from "next/font/google";
import { FolderKanban } from "lucide-react";
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

/** letters flicker through random glyphs before landing, like the reference's title swap */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/_-|";
function Scramble({ text, ms = 520 }: { text: string; ms?: number }) {
    const [out, setOut] = useState(text);
    useEffect(() => {
        if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setOut(text);
            return;
        }
        let raf = 0;
        const t0 = performance.now();
        const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / ms);
            const fixed = Math.floor(p * text.length);
            setOut(
                [...text]
                    .map((c, i) => (i < fixed || c === " " ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
                    .join("")
            );
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [text, ms]);
    return <>{out}</>;
}

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

/** small seeded RNG so each project's mosaic is random but the same every visit */
function rng(seed: number) {
    let t = seed >>> 0;
    return () => {
        t = (t + 0x6d2b79f5) >>> 0;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}
const hash = (str: string) => [...str].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

/**
 * Square mosaic around the logo, like tiles on a wall. The grid is 8×8 cells with the
 * logo filling the middle 4×4; the ring around it is twelve 2×2 blocks. Each tech takes a
 * block, as one big square or a small square tucked into one of the block's corners.
 * Returns cell positions relative to the grid centre, in cell units.
 */
type Slot = { cx: number; cy: number; size: 1 | 2 };
function mosaic(n: number, seed: number): Slot[] {
    const r = rng(seed);
    const blocks = [
        [0, 0], [2, 0], [4, 0], [6, 0],
        [0, 2], [6, 2], [0, 4], [6, 4],
        [0, 6], [2, 6], [4, 6], [6, 6],
    ].map(([c, rr]) => ({ c, r: rr, corner: (c === 0 || c === 6) && (rr === 0 || rr === 6), k: r() }));
    // edge blocks first (they hug the logo), corners last, shuffled within each group
    blocks.sort((a, b) => Number(a.corner) - Number(b.corner) || a.k - b.k);
    const out: Slot[] = [];
    const per = Math.max(1, Math.ceil(n / blocks.length)); // more than 12 techs: split blocks into small squares
    for (const b of blocks) {
        if (out.length >= n) break;
        const left = n - out.length;
        const many = Math.min(per, left, 4);
        if (many === 1) {
            const big = !b.corner && r() < 0.55;
            if (big) out.push({ cx: b.c + 1 - 4, cy: b.r + 1 - 4, size: 2 });
            else {
                // a small square in the block corner nearest the logo, or a random one for corner blocks
                const nx = b.corner ? (r() < 0.5 ? 0 : 1) : b.c < 2 ? 1 : b.c > 4 ? 0 : r() < 0.5 ? 0 : 1;
                const ny = b.corner ? (r() < 0.5 ? 0 : 1) : b.r < 2 ? 1 : b.r > 4 ? 0 : r() < 0.5 ? 0 : 1;
                out.push({ cx: b.c + nx + 0.5 - 4, cy: b.r + ny + 0.5 - 4, size: 1 });
            }
        } else {
            [[0, 0], [1, 1], [1, 0], [0, 1]].slice(0, many).forEach(([x, y]) => out.push({ cx: b.c + x + 0.5 - 4, cy: b.r + y + 0.5 - 4, size: 1 }));
        }
    }
    return out;
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** piecewise blend between the value at d=-1, d=0 and d=+1 */
const tri = (d: number, prev: number, mid: number, next: number) => (d < 0 ? lerp(mid, prev, clamp(-d, 0, 1)) : lerp(mid, next, clamp(d, 0, 1)));

/**
 * Projects + tech stack in one place. Drag (or swipe / arrows / trackpad sideways) to move
 * between projects. Left: main image. Middle: number, name, category and date. Right: the
 * project's logo (set in Admin, or a default project icon) with its tech stack as a mosaic of
 * squares around it (full name on hover). The mosaic gathers once a project settles and tucks
 * away while you drag. Neighbouring
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

    // ---- motion ----
    // Settling uses a fixed tempo: an eased glide whose length depends only on the distance,
    // so every move feels the same. While dragging, the cards follow the pointer once per
    // frame with light smoothing (no re-render per mouse event).
    const TEMPO = 420; // ms to glide one project
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const settle = useCallback(() => {
        if (n) setSettledIdx((((Math.round(posRef.current) % n) + n) % n));
    }, [n]);
    const glideTo = useCallback(
        (target: number) => {
            cancelAnimationFrame(rafRef.current);
            const from = posRef.current;
            const dist = target - from;
            targetRef.current = target;
            if (Math.abs(dist) < 0.002) {
                posRef.current = target;
                setPos(target);
                settle();
                return;
            }
            const dur = clamp(TEMPO * (0.55 + 0.45 * Math.min(Math.abs(dist), 2)), 240, TEMPO * 1.5);
            const t0 = performance.now();
            const step = (now: number) => {
                const t = clamp((now - t0) / dur, 0, 1);
                posRef.current = from + dist * easeOut(t);
                setPos(posRef.current);
                if (t < 1) rafRef.current = requestAnimationFrame(step);
                else settle();
            };
            rafRef.current = requestAnimationFrame(step);
        },
        [settle]
    );
    useEffect(() => {
        if (n) setSettledIdx(0);
        return () => cancelAnimationFrame(rafRef.current);
    }, [n]);

    const go = useCallback(
        (t: number) => {
            setSettledIdx(null);
            glideTo(Math.round(t));
        },
        [glideTo]
    );

    // drag
    // Drag up / down (like the reference): up brings the next project in from the bottom, the
    // current one tilts away to the top. Sideways drags work too (left = next), e.g. on touch.
    const drag = useRef<{
        x: number;
        y: number;
        axis: "x" | "y" | null;
        start: number;
        want: number;
        moved: boolean;
        samples: { v: number; t: number }[];
    } | null>(null);
    const PX = clamp(size.w * 0.3, 240, 420); // sideways px per project (lower = more sensitive)
    const PY = clamp(size.h * 0.5, 200, 340); // vertical px per project
    const follow = () => {
        // one update per frame: ease the cards toward where the pointer wants them
        const g = drag.current;
        if (!g) return;
        const d = g.want - posRef.current;
        posRef.current += Math.abs(d) < 0.0008 ? d : d * 0.45;
        setPos(posRef.current);
        rafRef.current = requestAnimationFrame(follow);
    };
    const onDown = (e: React.PointerEvent) => {
        if (e.button !== 0 || !n) return;
        if ((e.target as HTMLElement).closest("a,button")) return;
        cancelAnimationFrame(rafRef.current);
        const now = performance.now();
        drag.current = { x: e.clientX, y: e.clientY, axis: null, start: posRef.current, want: posRef.current, moved: false, samples: [{ v: 0, t: now }] };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };
    const onMove = (e: React.PointerEvent) => {
        const g = drag.current;
        if (!g) return;
        const dx = e.clientX - g.x;
        const dy = e.clientY - g.y;
        if (!g.moved && Math.hypot(dx, dy) > 3) {
            g.moved = true;
            g.axis = Math.abs(dy) >= Math.abs(dx) ? "y" : "x";
            g.x = e.clientX; // no jump from the dead zone
            g.y = e.clientY;
            setDragging(true);
            setSettledIdx(null);
            rafRef.current = requestAnimationFrame(follow);
        }
        if (!g.moved) return;
        const now = performance.now();
        const along = g.axis === "y" ? (e.clientY - g.y) / PY : (e.clientX - g.x) / PX; // in projects
        g.samples.push({ v: along, t: now });
        while (g.samples.length > 2 && now - g.samples[0].t > 90) g.samples.shift();
        g.want = g.start - along;
    };
    const onUp = () => {
        const g = drag.current;
        drag.current = null;
        cancelAnimationFrame(rafRef.current);
        setDragging(false);
        if (!g) return;
        if (!g.moved) return go(posRef.current);
        posRef.current = g.want;
        // pointer speed over the last ~90ms, in projects per ms
        const a = g.samples[0];
        const b = g.samples[g.samples.length - 1];
        const still = performance.now() - b.t > 70; // paused before letting go: no flick
        const v = !still && b.t > a.t ? -(b.v - a.v) / (b.t - a.t) : 0;
        const p = posRef.current;
        const projected = p + v * 160; // where a flick would carry it
        // a flick moves to the neighbour in its direction; a slow drag snaps to the nearest
        let target = Math.round(projected);
        if (Math.abs(v) > 0.0009) target = v > 0 ? Math.ceil(p + 0.02) : Math.floor(p - 0.02);
        target = clamp(target, Math.floor(p - 0.02), Math.ceil(p + 0.02)); // never skips a project
        go(target);
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
            cancelAnimationFrame(rafRef.current);
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
    // three columns: image centred in the space left of the text, logo centred in the space right of it
    const textW = narrow ? Math.min(W - 40, 420) : Math.min(290, W * 0.2);
    const colGap = 40;
    const leftSpan = W / 2 - textW / 2 - colGap;
    const rightStart = W / 2 + textW / 2 + colGap;
    const imgW = narrow ? Math.min(W - 40, 440) : clamp(leftSpan - 170, 300, 540);
    const imgH = imgW * 0.6;
    const leftX = narrow ? W / 2 : leftSpan / 2;
    const rightX = narrow ? W / 2 : (rightStart + W) / 2;
    // mosaic grid: logo = 4×4 cells in the middle of an 8×8 grid, cells `cell` px with `gap` gutters
    const gap = narrow ? 8 : 10;
    const room = narrow ? 999 : (W - rightStart) / 2 - 20; // half the right column
    const cell = narrow ? 30 : clamp(Math.min((210 - 3 * gap) / 4, (room - 3.5 * gap) / 4), 26, 45);
    const tile = 4 * cell + 3 * gap;
    const midX = W / 2;
    const cy = H / 2;
    const imgY = narrow ? 150 : cy;
    const textY = narrow ? 150 + imgH / 2 + 90 : cy;
    const tileY = narrow ? H - tile / 2 - 70 : cy;
    // neighbours sit fully above / below the current one with a clear gap, tilted toward the screen edge
    const NI = 0.5; // neighbour image scale
    const NT = 0.62; // neighbour logo scale
    const s34 = Math.sin((34 * Math.PI) / 180);
    const c34 = Math.cos((34 * Math.PI) / 180);
    const imgOffY = imgH / 2 + 56 + (NI * (imgW * s34 + imgH * c34)) / 2;
    const imgOffX = Math.min(imgW * 0.3, leftX - 40);
    const ringOuter = 4 * cell + 3.5 * gap; // half the mosaic
    const tileOffY = Math.max(tile / 2, ringOuter) + 40 + (NT * tile * (s34 + c34)) / 2;
    const tileOffX = (W - rightX) * 0.42;
    // orbit shows the last settled project; it tucks back into the logo while you drag
    if (settledIdx !== null) lastSettled.current = settledIdx;
    const orbitIdx = lastSettled.current;
    const orbitOut = settledIdx === null || dragging || orbitIdx !== idx;
    const techs = (projects[orbitIdx]?.tech_stack || []).filter(Boolean);

    return (
        <section id="projects" className="pst-section" style={{ scrollMarginTop: 0, padding: "96px 0 40px", boxSizing: "border-box" }} aria-roledescription="carousel" aria-label="Projects and tech stack">
            {/* old #tech-stack links land here; inline so the old section's global styles can't size it */}
            <span id="tech-stack" aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, padding: 0, margin: 0, overflow: "hidden" }} />

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
                    const x = tri(d, leftX - imgOffX, leftX, leftX - imgOffX);
                    const y = tri(d, imgY - imgOffY, imgY, imgY + imgOffY) + (a > 1 ? Math.sign(d) * (a - 1) * 120 : 0);
                    const rot = tri(d, -34, -1.5, 34);
                    const sc = tri(d, NI, 1, NI) * (a > 1 ? 1 - (a - 1) * 0.5 : 1);
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
                            <span className="pst-bub">
                                <span className="pst-clip">
                                    {p.image_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={p.image_url} alt={a < 0.5 ? p.title : ""} draggable={false} />
                                    ) : (
                                        <span className="pst-noimg" />
                                    )}
                                </span>
                            </span>
                        </div>
                    );
                })}

                {/* logos: current on the right, neighbours in the right corners */}
                {projects.map((p, i) => {
                    const d = wrapD(i);
                    if (Math.abs(d) > 1.9) return null;
                    const a = Math.abs(d);
                    if (narrow && a > 0.6) return null;
                    const x = tri(d, rightX + tileOffX, rightX, rightX + tileOffX);
                    const y = tri(d, tileY - tileOffY, tileY, tileY + tileOffY) + (a > 1 ? Math.sign(d) * (a - 1) * 120 : 0);
                    const rot = tri(d, 32, 0, -32); // straight in the middle so it lines up with the mosaic
                    const sc = tri(d, NT, 1, NT) * (a > 1 ? 1 - (a - 1) * 0.5 : 1);
                    const op = a > 1 ? clamp(1 - (a - 1) / 0.8, 0, 1) : 1;
                    return (
                        <div
                            key={`logo-${p.id}`}
                            className="pst-tile"
                            style={{
                                width: tile,
                                height: tile,
                                left: x - tile / 2,
                                top: y - tile / 2,
                                opacity: narrow ? clamp(1 - a * 1.8, 0, 1) : op,
                                zIndex: 40 - Math.round(a * 10),
                                transform: `rotate(${rot}deg) scale(${sc})`,
                            }}
                            onClick={() => Math.round(pos) !== Math.round(pos + d) && go(targetRef.current + Math.round(d))}
                        >
                            <span className="pst-bub pst-tile-face" style={{ padding: Math.round(tile * 0.17) }}>
                                {p.logo_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={p.logo_url} alt={a < 0.5 ? `${p.title} logo` : ""} draggable={false} />
                                ) : (
                                    <FolderKanban className="pst-fallback" strokeWidth={1.6} aria-hidden="true" />
                                )}
                            </span>
                        </div>
                    );
                })}

                {/* tech stack mosaic around the current logo */}
                <div className={`pst-orbit ${orbitOut ? "is-out" : ""}`} style={{ left: rightX, top: tileY }} key={`orbit-${orbitIdx}`}>
                    {mosaic(techs.length, hash(projects[orbitIdx]?.id || String(orbitIdx))).map((sl, k) => {
                        const t = techs[k];
                        const px = sl.size * cell + (sl.size - 1) * gap;
                        const step = cell + gap;
                        return (
                            <div
                                key={t}
                                className={`pst-chip ${sl.size === 2 ? "is-big" : ""} ${sl.cy < 0 ? "tip-above" : "tip-below"}`}
                                aria-label={t}
                                style={
                                    {
                                        width: px,
                                        height: px,
                                        marginLeft: -px / 2,
                                        marginTop: -px / 2,
                                        "--tx": `${sl.cx * step}px`,
                                        "--ty": `${sl.cy * step}px`,
                                        "--d": `${k * 45}ms`,
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
                    if (a > 0.75) return null;
                    const year = (p.date || "").match(/\d{4}/)?.[0];
                    return (
                        <div
                            key={`txt-${p.id}`}
                            className="pst-text"
                            style={{
                                left: midX,
                                top: textY,
                                opacity: clamp(1 - a * 1.4, 0, 1),
                                transform: `translate(-50%, -50%) translateY(${d * 46}px)`,
                                pointerEvents: a < 0.2 ? "auto" : "none",
                            }}
                            aria-hidden={a >= 0.2}
                        >
                            <span className={`pst-no ${courier.className}`}>
                                <Scramble text={`N°${String(i + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`} ms={380} />
                            </span>
                            <h3 className="pst-title" aria-label={p.title}>
                                <Scramble text={p.title} />
                            </h3>
                            <span className="pst-tags">
                                {p.category && (
                                    <span className="pst-tag">
                                        <Scramble text={p.category} ms={420} />
                                    </span>
                                )}
                                {(p.date || year) && (
                                    <span className="pst-tag">
                                        <Scramble text={p.date || year || ""} ms={460} />
                                    </span>
                                )}
                            </span>
                            <Link href={`/projects/${p.slug}`} className="pst-view" tabIndex={a < 0.2 ? 0 : -1}>
                                View project
                            </Link>
                        </div>
                    );
                })}

            </div>

            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                <Link href="/projects" className="btn-view-all">
                    View All Projects
                </Link>
            </div>

            <style jsx>{`
                /* fills the screen; the showcase sits in the middle (top padding clears the nav bar) */
                .pst-section {
                    position: relative;
                    min-height: 100vh;
                    min-height: 100svh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 96px 0 40px;
                    overflow: hidden;
                }
                .pst-stage {
                    position: relative;
                    height: ${narrow ? 860 : 640}px;
                    width: 100%;
                    max-width: 1920px;
                    margin: 0 auto;
                    cursor: grab;
                    touch-action: pan-y;
                    user-select: none;
                    outline: none;
                }
                .pst-stage.is-dragging {
                    cursor: grabbing;
                }
                .pst-img,
                .pst-tile {
                    position: absolute;
                    will-change: transform;
                }
                /* the bubble: swells with a springy overshoot, corners round off, a glassy rim appears */
                .pst-bub {
                    position: absolute;
                    inset: 0;
                    display: block;
                    border-radius: 14px 18px 16px 12px / 20px 26px 14px 18px; /* a slightly bowed print */
                    transition: transform 0.6s cubic-bezier(0.34, 1.7, 0.5, 1), border-radius 0.6s cubic-bezier(0.34, 1.4, 0.5, 1);
                }
                .pst-bub::before {
                    content: "";
                    position: absolute;
                    inset: -13px;
                    border-radius: 28px 34px 30px 26px / 36px 42px 30px 34px;
                    border: 2.5px solid rgba(255, 255, 255, 0.95);
                    background: rgba(255, 255, 255, 0.28);
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.06), 0 18px 34px -18px rgba(13, 42, 66, 0.35),
                        inset 0 1px 0 rgba(255, 255, 255, 0.9);
                    opacity: 0;
                    transform: scale(0.94);
                    transition: opacity 0.3s ease, transform 0.6s cubic-bezier(0.34, 1.7, 0.5, 1);
                    pointer-events: none;
                    z-index: -1;
                }
                .pst-clip {
                    position: absolute;
                    inset: 0;
                    overflow: hidden;
                    border-radius: inherit;
                    background: #dfe9f0;
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 26px 40px -22px rgba(13, 42, 66, 0.5);
                    transition: box-shadow 0.4s ease;
                }
                .pst-stage:not(.is-dragging) .pst-img:hover .pst-bub,
                .pst-stage:not(.is-dragging) .pst-tile:hover .pst-bub {
                    transform: scale(1.04);
                    border-radius: 26px 32px 28px 22px / 34px 40px 26px 30px;
                }
                .pst-stage:not(.is-dragging) .pst-img:hover .pst-bub::before,
                .pst-stage:not(.is-dragging) .pst-tile:hover .pst-bub::before {
                    opacity: 1;
                    transform: none;
                }
                .pst-stage:not(.is-dragging) .pst-img:hover .pst-clip {
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.06), 0 30px 46px -20px rgba(13, 42, 66, 0.55);
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
                .pst-tile-face {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 16px;
                    background: linear-gradient(160deg, #fbfcfd 0%, #eef3f6 100%);
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.07), 0 5px 0 #dfe6eb, 0 6px 0 rgba(13, 42, 66, 0.1),
                        0 24px 36px -18px rgba(13, 42, 66, 0.45);
                }
                .pst-stage:not(.is-dragging) .pst-tile:hover .pst-tile-face {
                    border-radius: 30px;
                }
                .pst-tile-face::before {
                    border-radius: 40px;
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

                /* tech mosaic around the logo (positions come from mosaic()) */
                .pst-orbit {
                    position: absolute;
                    width: 0;
                    height: 0;
                    z-index: 60;
                    pointer-events: none;
                }
                .pst-chip {
                    position: absolute;
                    left: 0;
                    top: 0;
                    pointer-events: auto;
                    animation: pst-in 0.55s cubic-bezier(0.34, 1.4, 0.64, 1) var(--d) both;
                }
                .pst-chip:hover {
                    z-index: 5;
                }
                .pst-orbit.is-out .pst-chip {
                    animation: pst-out 0.3s ease-in both;
                    pointer-events: none;
                }
                @keyframes pst-in {
                    from {
                        opacity: 0;
                        transform: translate(calc(var(--tx) * 0.35), calc(var(--ty) * 0.35)) scale(0.4);
                    }
                    to {
                        opacity: 1;
                        transform: translate(var(--tx), var(--ty)) scale(1);
                    }
                }
                @keyframes pst-out {
                    from {
                        opacity: 1;
                        transform: translate(var(--tx), var(--ty)) scale(1);
                    }
                    to {
                        opacity: 0;
                        transform: translate(calc(var(--tx) * 0.35), calc(var(--ty) * 0.35)) scale(0.4);
                    }
                }
                .pst-chip :global(.pst-chip-face) {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    background: linear-gradient(160deg, #ffffff 0%, #f1f5f8 100%);
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.07), 0 3px 0 #e2e8ed, 0 12px 18px -10px rgba(13, 42, 66, 0.45);
                    transition: transform 0.45s cubic-bezier(0.34, 1.7, 0.5, 1), box-shadow 0.3s ease;
                }
                .pst-chip:hover :global(.pst-chip-face) {
                    transform: translateY(-3px) scale(1.06);
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.07), 0 4px 0 #e2e8ed, 0 18px 24px -12px rgba(13, 42, 66, 0.5);
                }
                .pst-chip :global(.pst-chip-face img) {
                    width: 52%;
                    height: 52%;
                    object-fit: contain;
                    pointer-events: none;
                }
                .pst-chip :global(.pst-mono) {
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: ${Math.round(cell * 0.3)}px;
                    font-weight: 800;
                    color: #1b4f72;
                }
                .pst-chip.is-big :global(.pst-mono) {
                    font-size: ${Math.round(cell * 0.5)}px;
                }
                /* full name on hover, as a small navy tag */
                .pst-chip :global(.pst-chip-name) {
                    position: absolute;
                    left: 50%;
                    padding: 5px 9px;
                    border-radius: 6px;
                    background: #0d2a42;
                    box-shadow: 0 8px 16px -8px rgba(13, 42, 66, 0.6);
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    color: #fff;
                    white-space: nowrap;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.2s ease, transform 0.3s cubic-bezier(0.34, 1.6, 0.5, 1);
                }
                .pst-chip.tip-above :global(.pst-chip-name) {
                    bottom: calc(100% + 10px);
                    transform: translate(-50%, 6px) scale(0.9);
                }
                .pst-chip.tip-below :global(.pst-chip-name) {
                    top: calc(100% + 10px);
                    transform: translate(-50%, -6px) scale(0.9);
                }
                .pst-chip:hover :global(.pst-chip-name) {
                    opacity: 1;
                    transform: translate(-50%, 0) scale(1);
                }

                .pst-text {
                    position: absolute;
                    z-index: 70;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    width: ${textW}px;
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

                @media (prefers-reduced-motion: reduce) {
                    .pst-chip {
                        animation-duration: 0.01ms !important;
                    }
                }
            `}</style>
        </section>
    );
}
