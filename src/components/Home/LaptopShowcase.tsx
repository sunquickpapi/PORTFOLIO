"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Courier_Prime } from "next/font/google";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

type Project = { id: string; title: string; slug?: string | null; image_url?: string | null; tech_stack?: string[] | null; category?: string | null };

let cache: Project[] | null = null;
let loading: Promise<Project[]> | null = null;

/** Projects only (photography left out for now). Fetched once, on hover. */
export function prefetchProjects(): Promise<Project[]> {
    if (cache) return Promise.resolve(cache);
    if (!loading) {
        loading = fetch("/api/projects")
            .then((r) => r.json())
            .then((d) => {
                cache = Array.isArray(d)
                    ? d.filter((p: Project) => (p.category || "").toLowerCase() !== "photography" && (p.image_url || p.tech_stack?.length))
                    : [];
                return cache;
            })
            .catch(() => {
                loading = null;
                return [];
            });
    }
    return loading;
}

/** Simple Icons slugs for the technologies we know; anything else gets a monogram case. */
const LOGOS: Record<string, string> = {
    "react native": "react",
    react: "react",
    expo: "expo",
    "expo router": "expo",
    python: "python",
    flask: "flask",
    sqlite: "sqlite",
    "hugging face transformers": "huggingface",
    "hugging face": "huggingface",
    leaflet: "leaflet",
    openstreetmap: "openstreetmap",
    swiftui: "swift",
    swift: "swift",
    firebase: "firebase",
    appstore: "appstore",
    "app store": "appstore",
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
const logoFor = (t: string) => {
    const slug = LOGOS[t.trim().toLowerCase()];
    return slug ? `https://cdn.simpleicons.org/${slug}` : null;
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

function TechCase({ name }: { name: string }) {
    const [broken, setBroken] = useState(false);
    const src = logoFor(name);
    return (
        <>
            <span className="tc-face">
                {src && !broken ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="tc-logo" src={src} alt="" draggable={false} onError={() => setBroken(true)} />
                ) : (
                    <span className="tc-mono">{monogram(name)}</span>
                )}
                <span className={`tc-name ${courier.className}`}>{name}</span>
            </span>
        </>
    );
}


const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** where a card sits on the rolodex, `d` = distance from the front card */
function place(d: number, H: number) {
    const a = Math.abs(d);
    const sgn = Math.sign(d);
    const y = sgn * H * (0.5 * clamp(a, 0, 1) + 0.34 * clamp(a - 1, 0, 1) + 0.2 * clamp(a - 2, 0, 1));
    const scale = 1 - 0.13 * clamp(a, 0, 3);
    const rot = clamp(-d * 11, -32, 32);
    const opacity = a > 2.7 ? 0 : 1 - clamp(a - 1.9, 0, 1) * 1.25;
    const shade = clamp(a * 0.16, 0, 0.45);
    return { y, scale, rot, opacity, shade, z: 100 - Math.round(a * 10) };
}

/**
 * Stacks & Projects, laid out around the hero laptop (no zoom, no overlay).
 * Right of the laptop: a vertical rolodex of project images, as wide as the laptop,
 * that you scroll / drag through. Left: the current project's tech cards, which swap
 * out and pop back in as you move between projects.
 */
export default function LaptopShowcase({
    from,
    anchor,
    onClose,
}: {
    from: DOMRect;
    anchor: React.RefObject<HTMLElement | null>;
    onClose: () => void;
}) {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[] | null>(cache);
    const [shown, setShown] = useState(false);
    const [rect, setRect] = useState(from);
    const [pos, setPos] = useState(0);
    const [target, setTarget] = useState(0);
    const [techSel, setTechSel] = useState(0);
    const [leaving, setLeaving] = useState(false);
    const colRef = useRef<HTMLDivElement>(null);
    const techRef = useRef<HTMLDivElement>(null);
    const posRef = useRef(0);
    const targetRef = useRef(0);

    const list = projects || [];
    const n = list.length;

    useEffect(() => {
        if (!cache) prefetchProjects().then(setProjects);
        if (anchor.current) setRect(anchor.current.getBoundingClientRect());
        const f = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
        return () => cancelAnimationFrame(f);
    }, [anchor]);

    const close = useCallback(() => {
        setShown(false);
        window.setTimeout(onClose, 380);
    }, [onClose]);

    const go = useCallback(
        (t: number, snap = true) => {
            const v = clamp(t, 0, Math.max(0, n - 1));
            targetRef.current = snap ? Math.round(v) : v;
            setTarget(targetRef.current);
        },
        [n]
    );

    // ease the rolodex toward its target
    useEffect(() => {
        let raf = 0;
        const tick = () => {
            const d = targetRef.current - posRef.current;
            if (Math.abs(d) < 0.001) {
                posRef.current = targetRef.current;
                setPos(posRef.current);
                return;
            }
            posRef.current += d * 0.16;
            setPos(posRef.current);
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target]);

    // scroll wheel / trackpad over the rolodex rolls it (and doesn't scroll the page)
    useEffect(() => {
        const el = colRef.current;
        if (!el) return;
        let idle = 0;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const dy = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
            go(targetRef.current + dy / 160, false);
            window.clearTimeout(idle);
            idle = window.setTimeout(() => go(targetRef.current), 130);
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => {
            el.removeEventListener("wheel", onWheel);
            window.clearTimeout(idle);
        };
    }, [go]);

    // Esc / arrows, click elsewhere or page scroll closes, follow the laptop on resize
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
            if (e.key === "ArrowDown" || e.key === "ArrowRight") (e.preventDefault(), go(Math.round(targetRef.current) + 1));
            if (e.key === "ArrowUp" || e.key === "ArrowLeft") (e.preventDefault(), go(Math.round(targetRef.current) - 1));
        };
        const onDown = (e: PointerEvent) => {
            const t = e.target as Node;
            if (colRef.current?.contains(t) || techRef.current?.contains(t) || anchor.current?.contains(t)) return;
            close();
        };
        const onScroll = () => close();
        const onResize = () => anchor.current && setRect(anchor.current.getBoundingClientRect());
        window.addEventListener("keydown", onKey);
        window.addEventListener("pointerdown", onDown);
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("pointerdown", onDown);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
        };
    }, [close, go, anchor]);

    // drag to roll; a tap on a back card brings it forward, a tap on the front card opens it
    const drag = useRef<{ y: number; t: number; moved: boolean; i: number } | null>(null);
    const onPointerDown = (e: React.PointerEvent) => {
        const card = (e.target as HTMLElement).closest<HTMLElement>("[data-i]");
        drag.current = { y: e.clientY, t: targetRef.current, moved: false, i: card ? Number(card.dataset.i) : -1 };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: React.PointerEvent) => {
        const g = drag.current;
        if (!g) return;
        const dy = e.clientY - g.y;
        if (Math.abs(dy) > 5) g.moved = true;
        if (g.moved) go(g.t - dy / (H * 0.5), false);
    };
    const onPointerUp = () => {
        const g = drag.current;
        drag.current = null;
        if (!g) return;
        if (g.moved) return go(targetRef.current);
        if (g.i < 0) return;
        if (g.i === Math.round(targetRef.current)) {
            const p = list[g.i];
            if (p?.slug) router.push(`/projects/${p.slug}`);
        } else go(g.i);
    };

    // tech cards: the old set flies out, then the new project's set pops in
    const sel = clamp(Math.round(target), 0, Math.max(0, n - 1));
    useEffect(() => {
        if (sel === techSel) return;
        setLeaving(true);
        const t = window.setTimeout(() => {
            setTechSel(sel);
            setLeaving(false);
        }, 190);
        return () => window.clearTimeout(t);
    }, [sel, techSel]);
    const techs = useMemo(() => list[techSel]?.tech_stack?.filter(Boolean) || [], [list, techSel]);

    // ----- placement around the laptop -----
    const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
    const gap = 26;
    const W = Math.round(clamp(Math.min(rect.width, vw - rect.right - gap - 20), 150, 260));
    const H = Math.round(W * 0.64);
    const colW = W + 24;
    const colH = Math.round(H * 2.75);
    const colLeft = Math.min(rect.right + gap, vw - colW - 12);
    const colTop = Math.max(40, rect.top + rect.height / 2 - colH / 2);

    const card = anchor.current?.closest(".hero-pass-move")?.getBoundingClientRect();
    const buds = anchor.current?.closest(".hero-pass-move")?.querySelector(".hero-earbuds")?.getBoundingClientRect();
    const leftEdge = Math.min(card ? card.left : rect.left, buds && buds.width ? buds.left : Infinity);
    const TC = 74;
    const TGAP = 10;
    const cols = techs.length > 9 ? 4 : 3;
    const techW = cols * TC + (cols - 1) * TGAP;
    const techLeft = Math.max(14, leftEdge - 30 - techW);
    const rowsT = Math.max(1, Math.ceil(techs.length / cols));
    const techH = 24 + rowsT * TC + (rowsT - 1) * TGAP;
    const techTop = card ? card.top + card.height / 2 - techH / 2 : colTop;
    const project = list[sel];

    return createPortal(
        <div className={`scs ${shown ? "is-in" : ""}`}>
            {/* LEFT: the current project's tech cards */}
            <div ref={techRef} className="scs-tech" style={{ left: techLeft, top: techTop, width: techW }}>
                <span className={`scs-kicker ${courier.className}`}>TECH STACK</span>
                <div key={techSel} className={`scs-grid ${leaving ? "is-leaving" : ""}`}>
                    {techs.map((t, i) => (
                        <div
                            key={t}
                            className="tc"
                            title={t}
                            style={{ "--d": `${i * 45}ms`, "--r": `${((i * 37) % 7) - 3}deg` } as React.CSSProperties}
                        >
                            <TechCase name={t} />
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: rolodex of projects */}
            <div
                ref={colRef}
                className="scs-col"
                style={{ left: colLeft, top: colTop, width: colW, height: colH }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={() => (drag.current = null)}
            >
                <div className="scs-roll">
                    {list.map((p, i) => {
                        const d = i - pos;
                        const k = place(d, H);
                        if (k.opacity <= 0) return null;
                        return (
                            <div
                                key={p.id}
                                data-i={i}
                                className={`pc ${Math.round(pos) === i ? "is-front" : ""}`}
                                style={{
                                    width: W,
                                    height: H,
                                    marginLeft: -W / 2,
                                    marginTop: -H / 2,
                                    zIndex: k.z,
                                    opacity: k.opacity,
                                    transform: `perspective(900px) translate3d(0, ${k.y}px, 0) rotateX(${k.rot}deg) scale(${k.scale})`,
                                    ["--shade" as string]: k.shade,
                                }}
                                aria-label={p.title}
                            >
                                {p.image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={p.image_url} alt="" draggable={false} loading="eager" />
                                ) : (
                                    <span className="pc-noimg" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="scs-cap" style={{ left: colLeft, top: colTop + colH + 6, width: colW }}>
                <span className="scs-cap-title">{project ? project.title : "Loading…"}</span>
                <span className={`scs-cap-count ${courier.className}`}>
                    {String(sel + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                </span>
            </div>

            <style jsx>{`
                .scs {
                    position: fixed;
                    inset: 0;
                    z-index: 1500;
                    pointer-events: none;
                    --ease: cubic-bezier(0.22, 1, 0.36, 1);
                    --ink: #0d2a42;
                }
                .scs-kicker {
                    display: block;
                    font-size: 10.5px;
                    font-weight: 700;
                    letter-spacing: 0.24em;
                    color: #3a7ca5;
                    text-align: right;
                    margin-bottom: 10px;
                    opacity: 0;
                    transition: opacity 0.4s ease;
                }
                .scs.is-in .scs-kicker {
                    opacity: 1;
                }

                /* ---- tech cards (left) ---- */
                .scs-tech {
                    position: absolute;
                    pointer-events: auto;
                    transition: top 0.35s var(--ease);
                }
                .scs-grid {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: flex-end;
                    gap: ${TGAP}px;
                }
                .tc {
                    position: relative;
                    width: ${TC}px;
                    height: ${TC}px;
                    opacity: 0;
                }
                .scs.is-in .tc {
                    animation: tc-in 0.5s cubic-bezier(0.34, 1.35, 0.64, 1) var(--d) both;
                }
                .scs.is-in .scs-grid.is-leaving .tc {
                    animation: tc-out 0.19s ease-in both;
                }
                .scs:not(.is-in) .tc {
                    animation: tc-out 0.25s ease-in both;
                }
                @keyframes tc-in {
                    from {
                        opacity: 0;
                        transform: translate(18px, 12px) scale(0.6) rotate(calc(var(--r) * 3));
                    }
                    to {
                        opacity: 1;
                        transform: rotate(var(--r));
                    }
                }
                @keyframes tc-out {
                    from {
                        opacity: 1;
                        transform: rotate(var(--r));
                    }
                    to {
                        opacity: 0;
                        transform: translateY(-10px) scale(0.8);
                    }
                }
                .tc :global(.tc-face) {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 8px 6px;
                    border-radius: 8px;
                    background: linear-gradient(160deg, #ffffff 0%, #f3f7fa 60%, #e6edf2 100%);
                    box-shadow: inset 0 0 0 1px rgba(13, 42, 66, 0.1), inset 0 1px 0 #fff, 0 10px 18px -12px rgba(13, 42, 66, 0.5);
                }
                .tc :global(.tc-logo) {
                    width: 28px;
                    height: 28px;
                    object-fit: contain;
                    user-select: none;
                }
                .tc :global(.tc-mono) {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    border: 2px solid #1b4f72;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 10.5px;
                    font-weight: 800;
                    color: #1b4f72;
                }
                .tc :global(.tc-name) {
                    max-width: 100%;
                    font-size: 7.5px;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    color: var(--ink);
                    text-align: center;
                    line-height: 1.15;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                /* ---- project rolodex (right) ---- */
                .scs-col {
                    position: absolute;
                    pointer-events: auto;
                    cursor: grab;
                    touch-action: none;
                    user-select: none;
                    opacity: 0;
                    transform: translateX(-18px);
                    transition: opacity 0.4s ease, transform 0.55s var(--ease);
                }
                .scs.is-in .scs-col {
                    opacity: 1;
                    transform: none;
                }
                .scs-col:active {
                    cursor: grabbing;
                }
                .scs-roll {
                    position: absolute;
                    inset: 0;
                }
                .pc {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    border-radius: 6px;
                    overflow: hidden;
                    background: #dfe9f0;
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.1), 0 16px 26px -16px rgba(13, 42, 66, 0.55);
                    will-change: transform;
                }
                .pc::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: #0d2a42;
                    opacity: var(--shade);
                    pointer-events: none;
                }
                .pc.is-front {
                    cursor: pointer;
                }
                .pc img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: top center;
                    pointer-events: none;
                    display: block;
                }
                .pc-noimg {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #1b4f72, #0d2a42);
                }
                .scs-cap {
                    position: absolute;
                    display: flex;
                    align-items: baseline;
                    justify-content: space-between;
                    gap: 10px;
                    padding: 0 12px;
                    opacity: 0;
                    transition: opacity 0.4s ease 0.1s;
                }
                .scs.is-in .scs-cap {
                    opacity: 1;
                }
                .scs-cap-title {
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 13px;
                    font-weight: 800;
                    color: var(--ink);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .scs-cap-count {
                    flex: none;
                    font-size: 10.5px;
                    font-weight: 700;
                    letter-spacing: 0.14em;
                    color: #3a7ca5;
                }
                @media (prefers-reduced-motion: reduce) {
                    .tc,
                    .scs-col {
                        animation: none !important;
                        transition-duration: 0.01ms !important;
                        opacity: 1;
                    }
                }
            `}</style>
        </div>,
        document.body
    );
}
