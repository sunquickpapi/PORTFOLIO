"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Courier_Prime } from "next/font/google";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

type Project = { id: string; title: string; image_url?: string | null; tech_stack?: string[] | null; category?: string | null };

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

const FOLDERS = [
    ["#e6f2f9", "#c4e2f3"],
    ["#d3eaf6", "#a6d1ec"],
    ["#eef3f6", "#d6e2ea"],
    ["#c8e5f5", "#8fc8ea"],
    ["#e9eef0", "#c9d6de"],
    ["#dbeef8", "#b7dcf2"],
];

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
            <span className="tc-spine" />
        </>
    );
}

// sizes
const CASE = 76;
const CELL = 84;
const PILE_W = 300;
const FOLDER_H = 212;
const PEEK = 18;
const FRONT_GAP = 14;

/**
 * Stacks & Projects, laid out around the hero laptop (no zoom, no overlay).
 * Left of the laptop: a row of tech cases. Right of it (or below, if there's no room):
 * a pile of project folders. Picking a folder lays it in front with its main image and
 * pops that project's tech cases out of the row into a tidy grid.
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
    const [projects, setProjects] = useState<Project[] | null>(cache);
    const [sel, setSel] = useState(0);
    const [shown, setShown] = useState(false);
    const [rect, setRect] = useState(from);
    const casesRef = useRef<HTMLDivElement>(null);
    const pileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!cache) prefetchProjects().then(setProjects);
        const f = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
        return () => cancelAnimationFrame(f);
    }, []);

    const close = useCallback(() => {
        setShown(false);
        window.setTimeout(onClose, 380);
    }, [onClose]);

    const list = projects || [];
    const n = list.length;

    // close on Esc, a click elsewhere or scrolling; follow the laptop on resize
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
            if (e.key === "ArrowDown" || e.key === "ArrowRight") setSel((i) => (n ? (i + 1) % n : 0));
            if (e.key === "ArrowUp" || e.key === "ArrowLeft") setSel((i) => (n ? (i - 1 + n) % n : 0));
        };
        const onDown = (e: PointerEvent) => {
            const t = e.target as Node;
            if (casesRef.current?.contains(t) || pileRef.current?.contains(t) || anchor.current?.contains(t)) return;
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
    }, [close, n, anchor]);

    // keep following the laptop if it moves (e.g. its float or a layout change)
    useLayoutEffect(() => {
        if (anchor.current) setRect(anchor.current.getBoundingClientRect());
    }, [anchor]);

    const techs = useMemo(() => {
        const seen = new Map<string, string>();
        list.forEach((p) => (p.tech_stack || []).forEach((t) => t && !seen.has(t.toLowerCase()) && seen.set(t.toLowerCase(), t)));
        return [...seen.values()];
    }, [list]);
    const maxActive = useMemo(() => list.reduce((m, p) => Math.max(m, p.tech_stack?.length || 0), 0), [list]);
    const activeOrder = useMemo(() => (list[sel]?.tech_stack || []).map((t) => t.toLowerCase()), [list, sel]);
    const project = list[sel];

    // ----- placement around the laptop -----
    const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
    const top = Math.max(92, rect.top - 40);
    // tech panel lives in the empty space left of the pass card, so nothing covers the card
    const card = anchor.current?.closest(".hero-pass-move")?.getBoundingClientRect();
    const buds = anchor.current?.closest(".hero-pass-move")?.querySelector(".hero-earbuds")?.getBoundingClientRect();
    const leftEdge = Math.min(card ? card.left : rect.left, buds && buds.width ? buds.left : Infinity);
    const casesW = Math.max(300, Math.min(460, leftEdge - 24 - 16));
    const casesLeft = Math.max(16, leftEdge - 24 - casesW);
    const cols = Math.max(3, Math.floor((casesW - 36) / CELL));
    const rows = Math.max(1, Math.ceil(maxActive / cols));
    const RAIL = 112; // space for the stacked row at the bottom
    const casesH = 70 + rows * CELL + RAIL;
    const casesTop = card ? Math.max(92, card.top + card.height / 2 - casesH / 2) : top;
    const step = techs.length > 1 ? Math.min(14, (casesW - 44 - CASE - 30) / (techs.length - 1)) : 0;
    const roomRight = vw - rect.right - 18 - 16;
    const pileOnRight = roomRight >= 260;
    const pileW = pileOnRight ? Math.min(PILE_W, roomRight) : PILE_W;
    const pileLeft = pileOnRight ? rect.right + 18 : Math.min(vw - 16 - PILE_W, rect.left + rect.width / 2 - PILE_W / 2);
    const pileTop = pileOnRight ? top : rect.bottom + 14;
    const pileH = Math.max(0, n - 2) * PEEK + FRONT_GAP + FOLDER_H;

    return createPortal(
        <div className={`scs ${shown ? "is-in" : ""}`}>
            {/* LEFT of the laptop: tech cases */}
            <div ref={casesRef} className="scs-panel scs-cases" style={{ left: casesLeft, top: casesTop, width: casesW, height: casesH }}>
                <div className="scs-head">
                    <span className={`scs-kicker ${courier.className}`}>TECH STACK</span>
                    <span className="scs-title">{project ? project.title : "Loading…"}</span>
                </div>
                <div className="scs-stage">
                    <div className="scs-rail">
                        {techs.map((t, i) => {
                            const k = activeOrder.indexOf(t.toLowerCase());
                            const on = k >= 0;
                            const gc = on ? k % cols : 0;
                            const gr = on ? Math.floor(k / cols) : 0;
                            return (
                                <div
                                    key={t}
                                    className={`tc ${on ? "is-on" : ""}`}
                                    style={
                                        {
                                            "--x": `${i * step}px`,
                                            "--y": `${-i * 2}px`,
                                            "--z": `${-i * 24}px`,
                                            "--gx": `${gc * CELL}px`,
                                            "--gy": `${-(casesH - 22 - 66 - CASE - gr * CELL)}px`,
                                            "--d": `${i * 18}ms`,
                                            "--pd": `${Math.max(0, k) * 40}ms`,
                                            zIndex: on ? 200 + k : techs.length - i,
                                        } as React.CSSProperties
                                    }
                                    title={t}
                                >
                                    <TechCase name={t} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* RIGHT of the laptop: project folders */}
            <div
                ref={pileRef}
                className="scs-panel scs-pile"
                style={{ left: pileLeft, top: pileTop, width: pileW, height: pileH + 62 }}
            >
                <span className={`scs-kicker scs-pile-kicker ${courier.className}`}>
                    PROJECTS · {String(sel + 1).padStart(2, "0")}/{String(n).padStart(2, "0")}
                </span>
                <div className="scs-files" style={{ height: pileH }}>
                    {list.map((p, i) => {
                        const [c1, c2] = FOLDERS[i % FOLDERS.length];
                        const on = i === sel;
                        const rank = i < sel ? i : i - 1;
                        const t = on ? Math.max(0, n - 2) * PEEK + FRONT_GAP : rank * PEEK;
                        return (
                            <button
                                key={p.id}
                                type="button"
                                className={`fd ${on ? "is-on" : ""}`}
                                style={
                                    {
                                        top: t,
                                        height: FOLDER_H,
                                        zIndex: on ? 100 : rank + 1,
                                        "--c1": c1,
                                        "--c2": c2,
                                        "--tab": `${[2, 33, 64][i % 3]}%`,
                                        "--d": `${80 + i * 35}ms`,
                                    } as React.CSSProperties
                                }
                                onClick={() => setSel(i)}
                                aria-pressed={on}
                                aria-label={`Show ${p.title}`}
                            >
                                <span className={`fd-tab ${courier.className}`}>{p.title}</span>
                                <span className="fd-body">
                                    {p.image_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img className="fd-img" src={p.image_url} alt="" draggable={false} loading="lazy" />
                                    ) : (
                                        <span className="fd-img fd-noimg" />
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
                .scs {
                    position: fixed;
                    inset: 0;
                    z-index: 1500; /* under the nav bar, over the page */
                    pointer-events: none;
                    --ease: cubic-bezier(0.22, 1, 0.36, 1);
                    --ink: #0d2a42;
                }
                /* frosted paper panels, like a desk mat under each group */
                .scs-panel {
                    position: absolute;
                    pointer-events: auto;
                    border-radius: 18px;
                    background: rgba(246, 249, 251, 0.82);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 24px 44px -22px rgba(13, 42, 66, 0.4);
                    opacity: 0;
                    transition: opacity 0.35s ease, transform 0.5s var(--ease);
                }
                .scs-cases {
                    transform: translateX(16px) scale(0.98);
                    transform-origin: right center;
                    overflow: hidden;
                }
                .scs-pile {
                    transform: translateX(-16px) scale(0.98);
                    transform-origin: left center;
                }
                .scs.is-in .scs-panel {
                    opacity: 1;
                    transform: none;
                }
                .scs-head {
                    position: absolute;
                    top: 14px;
                    left: 18px;
                    right: 18px;
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }
                .scs-kicker {
                    font-size: 10.5px;
                    font-weight: 700;
                    letter-spacing: 0.24em;
                    color: #3a7ca5;
                }
                .scs-title {
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 17px;
                    font-weight: 800;
                    letter-spacing: -0.01em;
                    color: var(--ink);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* ---- tech cases ---- */
                .scs-stage {
                    position: absolute;
                    inset: 0;
                    perspective: 1100px;
                    perspective-origin: 60% 30%;
                }
                .scs-rail {
                    position: absolute;
                    left: 18px;
                    bottom: 22px;
                    transform-style: preserve-3d;
                }
                .tc {
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: ${CASE}px;
                    height: ${CASE}px;
                    transform-style: preserve-3d;
                    opacity: 0;
                    transform: translate3d(calc(var(--x) + 40px), var(--y), var(--z)) rotateY(38deg);
                    filter: saturate(0.5);
                    transition: transform 0.55s var(--ease), opacity 0.35s ease, filter 0.35s ease;
                }
                .scs.is-in .tc {
                    opacity: 1;
                    transform: translate3d(var(--x), var(--y), var(--z)) rotateY(38deg);
                    transition-delay: var(--d), var(--d), 0s;
                }
                /* the project's tech pops out of the row into a neat grid */
                .scs.is-in .tc.is-on {
                    transform: translate3d(var(--gx), var(--gy), 0) rotateY(0deg);
                    filter: none;
                    transition: transform 0.6s cubic-bezier(0.34, 1.25, 0.64, 1), opacity 0.35s ease, filter 0.35s ease;
                    transition-delay: var(--pd);
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
                    border-radius: 5px;
                    background: linear-gradient(160deg, #ffffff 0%, #f1f5f8 60%, #e2eaef 100%);
                    box-shadow: inset 0 0 0 1px rgba(13, 42, 66, 0.12), inset 0 1px 0 #fff, 0 8px 16px -10px rgba(13, 42, 66, 0.45);
                    backface-visibility: hidden;
                }
                .tc :global(.tc-face)::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 5px;
                    width: 1px;
                    background: rgba(13, 42, 66, 0.12);
                }
                .tc :global(.tc-spine) {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    width: 9px;
                    background: linear-gradient(90deg, #c9d4db, #e6ecf0);
                    transform-origin: 0 50%;
                    transform: rotateY(90deg);
                    border-radius: 2px;
                }
                .tc :global(.tc-logo) {
                    width: 30px;
                    height: 30px;
                    object-fit: contain;
                    user-select: none;
                }
                .tc :global(.tc-mono) {
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    border: 2px solid #1b4f72;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 11px;
                    font-weight: 800;
                    color: #1b4f72;
                }
                .tc :global(.tc-name) {
                    max-width: 100%;
                    font-size: 8px;
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

                /* ---- project folders ---- */
                .scs-pile-kicker {
                    position: absolute;
                    top: 12px;
                    left: 16px;
                }
                .scs-files {
                    position: absolute;
                    left: 12px;
                    right: 12px;
                    bottom: 12px;
                }
                .fd {
                    position: absolute;
                    left: 0;
                    right: 0;
                    padding: 0;
                    border: none;
                    background: none;
                    cursor: pointer;
                    text-align: left;
                    opacity: 0;
                    transform: translateY(30px);
                    transition: top 0.55s var(--ease), transform 0.5s var(--ease), opacity 0.35s ease;
                    -webkit-tap-highlight-color: transparent;
                }
                .scs.is-in .fd {
                    opacity: 1;
                    transform: none;
                    transition-delay: 0s, var(--d), var(--d);
                }
                .scs.is-in .fd:not(.is-on):hover {
                    transform: translateY(-6px);
                    transition-delay: 0s;
                }
                .scs.is-in .fd.is-on {
                    animation: fd-pull 0.55s var(--ease);
                }
                @keyframes fd-pull {
                    0% {
                        transform: translateY(-46px) rotate(-1.2deg);
                    }
                    100% {
                        transform: none;
                    }
                }
                .fd-tab {
                    position: absolute;
                    top: -17px;
                    left: var(--tab);
                    max-width: 35%;
                    height: 19px;
                    padding: 4px 10px 0;
                    border-radius: 7px 7px 0 0;
                    background: var(--c1);
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 0 0 1px rgba(13, 42, 66, 0.1);
                    font-size: 8.5px;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    color: var(--ink);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .fd.is-on .fd-tab {
                    color: #fff;
                    background: #1b4f72;
                }
                .fd-body {
                    position: absolute;
                    inset: 0;
                    border-radius: 3px 10px 10px 10px;
                    background: linear-gradient(180deg, var(--c1) 0%, var(--c2) 100%);
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 0 0 1px rgba(13, 42, 66, 0.1),
                        0 -5px 12px -8px rgba(13, 42, 66, 0.3);
                    padding: 10px;
                }
                .fd-img {
                    display: block;
                    width: 100%;
                    height: ${FOLDER_H - 20}px;
                    border-radius: 5px;
                    object-fit: cover;
                    object-position: top center;
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.12);
                    user-select: none;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .fd.is-on .fd-img {
                    opacity: 1;
                    transition-delay: 0.12s;
                }
                .fd-noimg {
                    background: linear-gradient(135deg, #1b4f72, #0d2a42);
                }
                .fd:focus-visible {
                    outline: none;
                }
                .fd:focus-visible .fd-tab {
                    outline: 2px dashed #3a99c9;
                    outline-offset: 2px;
                }
                @media (prefers-reduced-motion: reduce) {
                    .tc,
                    .fd,
                    .scs-panel {
                        transition-duration: 0.01ms !important;
                        transition-delay: 0s !important;
                        animation: none !important;
                    }
                }
            `}</style>
        </div>,
        document.body
    );
}
