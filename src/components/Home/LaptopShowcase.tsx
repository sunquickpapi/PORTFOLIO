"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Courier_Prime } from "next/font/google";
import { X } from "lucide-react";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

type Project = { id: string; title: string; image_url?: string | null; tech_stack?: string[] | null };

let cache: Project[] | null = null;
let loading: Promise<Project[]> | null = null;

/** Fetch the projects once (called on hover, so the showcase opens instantly). */
export function prefetchProjects(): Promise<Project[]> {
    if (cache) return Promise.resolve(cache);
    if (!loading) {
        loading = fetch("/api/projects")
            .then((r) => r.json())
            .then((d) => {
                cache = Array.isArray(d) ? d.filter((p: Project) => p.image_url || p.tech_stack?.length) : [];
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
    clip: "openai",
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
    java: "openjdk",
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

/** Folder colours: soft paper-blues in the site's palette. */
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

/**
 * Stacks & Projects, opened from the hero laptop. Left: a 3D row of tech cases (logo +
 * name). Right: a pile of project folders (name on the tab, main image inside). Pick a
 * folder and it is pulled up out of the pile while its tech cases slide out of the row.
 */
export default function LaptopShowcase({ onClose }: { from?: DOMRect; onClose: () => void }) {
    const [projects, setProjects] = useState<Project[] | null>(cache);
    const [sel, setSel] = useState(0);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        if (!cache) prefetchProjects().then(setProjects);
        const f = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
        return () => cancelAnimationFrame(f);
    }, []);

    const close = useCallback(() => {
        setShown(false);
        window.setTimeout(onClose, 450);
    }, [onClose]);

    const list = projects || [];
    const n = list.length;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
            if (e.key === "ArrowDown" || e.key === "ArrowRight") setSel((i) => (n ? (i + 1) % n : 0));
            if (e.key === "ArrowUp" || e.key === "ArrowLeft") setSel((i) => (n ? (i - 1 + n) % n : 0));
        };
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [close, n]);

    // every technology once, in the order projects list them
    const techs = useMemo(() => {
        const seen = new Map<string, string>();
        list.forEach((p) => (p.tech_stack || []).forEach((t) => t && !seen.has(t.toLowerCase()) && seen.set(t.toLowerCase(), t)));
        return [...seen.values()];
    }, [list]);
    const active = useMemo(
        () => new Set((list[sel]?.tech_stack || []).map((t) => t.toLowerCase())),
        [list, sel]
    );
    const activeOrder = useMemo(() => (list[sel]?.tech_stack || []).map((t) => t.toLowerCase()), [list, sel]);
    const project = list[sel];

    // row geometry: cases recede up and to the right
    const STEP_X = 24;
    const STEP_Y = -13;
    const STEP_Z = -38;
    // pile geometry: the picked folder sits in front, the others peek out above it as tabs
    const PEEK = 22;
    const FRONT_GAP = 18;

    return createPortal(
        <div className={`scs ${shown ? "is-in" : ""}`} role="dialog" aria-modal="true" aria-label="Stacks and projects">
            <div className="scs-backdrop" onClick={close} />

            <header className="scs-head">
                <span className={`scs-kicker ${courier.className}`}>STACKS &amp; PROJECTS</span>
                <span className="scs-title">{project ? project.title : "Loading…"}</span>
                {project && (
                    <span className={`scs-count ${courier.className}`}>
                        N°{String(sel + 1).padStart(2, "0")} / {String(n).padStart(2, "0")} · {project.tech_stack?.length || 0} in the stack
                    </span>
                )}
            </header>

            {/* LEFT: tech cases in a row */}
            <section className="scs-stack" aria-label="Tech stack">
                <div className="scs-rail">
                    {techs.map((t, i) => {
                        const on = active.has(t.toLowerCase());
                        // where this case lands when it pops out: a tidy 4-column grid beside the row
                        const k = on ? activeOrder.indexOf(t.toLowerCase()) : 0;
                        const gc = k % 4;
                        const gr = Math.floor(k / 4);
                        return (
                            <div
                                key={t}
                                className={`tc ${on ? "is-on" : ""}`}
                                style={
                                    {
                                        "--x": `${i * STEP_X}px`,
                                        "--y": `${i * STEP_Y}px`,
                                        "--z": `${i * STEP_Z}px`,
                                        "--d": `${i * 25}ms`,
                                        "--gx": `${300 + gc * 128 + (gr % 2) * 30}px`,
                                        "--gy": `${-gr * 132}px`,
                                        "--pd": `${k * 45}ms`,
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
            </section>

            {/* RIGHT: pile of project folders */}
            <section className="scs-pile" aria-label="Projects">
                <div className="scs-files" style={{ height: Math.max(0, n - 2) * PEEK + FRONT_GAP + 300 }}>
                    {list.map((p, i) => {
                        const [c1, c2] = FOLDERS[i % FOLDERS.length];
                        const on = i === sel;
                        const rank = i < sel ? i : i - 1; // order among the folders left in the pile
                        const top = on ? Math.max(0, n - 2) * PEEK + FRONT_GAP : rank * PEEK;
                        return (
                            <button
                                key={p.id}
                                type="button"
                                className={`fd ${on ? "is-on" : ""}`}
                                style={
                                    {
                                        top,
                                        zIndex: on ? 100 : rank + 1,
                                        "--c1": c1,
                                        "--c2": c2,
                                        "--tab": `${[4, 36, 66][i % 3]}%`,
                                        "--d": `${120 + i * 40}ms`,
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
            </section>

            <button type="button" className="scs-close" onClick={close} aria-label="Close">
                <X size={22} strokeWidth={2.4} />
            </button>

            <style jsx>{`
                .scs {
                    position: fixed;
                    inset: 0;
                    z-index: 5000;
                    --ease: cubic-bezier(0.22, 1, 0.36, 1);
                    --ink: #0d2a42;
                    overflow: hidden;
                }
                .scs-backdrop {
                    position: absolute;
                    inset: 0;
                    background: rgba(233, 238, 241, 0.8);
                    backdrop-filter: blur(12px) saturate(0.9);
                    -webkit-backdrop-filter: blur(12px) saturate(0.9);
                    opacity: 0;
                    transition: opacity 0.45s ease;
                }
                .scs.is-in .scs-backdrop {
                    opacity: 1;
                }

                .scs-head {
                    position: absolute;
                    top: 30px;
                    left: 50%;
                    width: min(640px, 60vw);
                    transform: translate(-50%, -10px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    text-align: center;
                    opacity: 0;
                    transition: opacity 0.4s ease 0.1s, transform 0.5s var(--ease) 0.1s;
                    pointer-events: none;
                }
                .scs.is-in .scs-head {
                    opacity: 1;
                    transform: translate(-50%, 0);
                }
                .scs-kicker {
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.3em;
                    color: #3a7ca5;
                }
                .scs-title {
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 26px;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    color: var(--ink);
                }
                .scs-count {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    color: #5b6b7a;
                }

                /* ---------- LEFT: the row of tech cases ---------- */
                .scs-stack {
                    position: absolute;
                    left: 4vw;
                    top: 150px;
                    bottom: 40px;
                    width: 46vw;
                    perspective: 1300px;
                    perspective-origin: 20% 10%;
                }
                .scs-rail {
                    position: absolute;
                    left: 4%;
                    bottom: 12%;
                    transform-style: preserve-3d;
                }
                .tc {
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 132px;
                    height: 132px;
                    transform-style: preserve-3d;
                    transform: translate3d(calc(var(--x) - 120px), var(--y), var(--z)) rotateY(38deg);
                    opacity: 0;
                    transition: transform 0.6s var(--ease), opacity 0.4s ease, filter 0.4s ease;
                    filter: saturate(0.55) brightness(1.02);
                }
                .scs.is-in .tc {
                    opacity: 1;
                    transform: translate3d(var(--x), var(--y), var(--z)) rotateY(38deg);
                    transition-delay: var(--d), var(--d), 0s;
                }
                /* the project's tech pops out of the row and lands in front, facing you */
                .scs.is-in .tc.is-on {
                    transform: translate3d(var(--gx), var(--gy), 180px) rotateY(14deg) scale(0.86);
                    filter: none;
                    transition: transform 0.65s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.4s ease, filter 0.4s ease;
                    transition-delay: var(--pd);
                }
                .tc :global(.tc-face) {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 12px;
                    border-radius: 6px;
                    background: linear-gradient(160deg, #ffffff 0%, #f1f5f8 60%, #e2eaef 100%);
                    box-shadow: inset 0 0 0 1px rgba(13, 42, 66, 0.12), inset 0 1px 0 #fff, 0 10px 22px -12px rgba(13, 42, 66, 0.45);
                    backface-visibility: hidden;
                }
                /* jewel-case hinge strip */
                .tc :global(.tc-face)::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 7px;
                    width: 1.5px;
                    background: rgba(13, 42, 66, 0.12);
                    box-shadow: 1px 0 0 #fff;
                }
                .tc :global(.tc-spine) {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    width: 14px;
                    background: linear-gradient(90deg, #c9d4db, #e6ecf0);
                    transform-origin: 0 50%;
                    transform: rotateY(90deg);
                    border-radius: 2px;
                }
                .tc :global(.tc-logo) {
                    width: 54px;
                    height: 54px;
                    object-fit: contain;
                    user-select: none;
                }
                .tc :global(.tc-mono) {
                    width: 54px;
                    height: 54px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    border: 2.5px solid #1b4f72;
                    outline: 1px solid #1b4f72;
                    outline-offset: -7px;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 17px;
                    font-weight: 800;
                    color: #1b4f72;
                }
                .tc :global(.tc-name) {
                    max-width: 100%;
                    font-size: 10.5px;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    color: var(--ink);
                    text-align: center;
                    line-height: 1.15;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                /* ---------- RIGHT: the pile of project folders ---------- */
                .scs-pile {
                    position: absolute;
                    right: 5vw;
                    top: 140px;
                    bottom: 36px;
                    width: min(470px, 38vw);
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                }
                .scs-files {
                    position: relative;
                    width: 100%;
                    max-height: 100%;
                }
                .fd {
                    position: absolute;
                    left: 0;
                    right: 0;
                    height: 300px;
                    padding: 0;
                    border: none;
                    background: none;
                    cursor: pointer;
                    text-align: left;
                    opacity: 0;
                    transform: translateY(60px);
                    transition: top 0.6s var(--ease), transform 0.55s var(--ease), opacity 0.4s ease;
                    -webkit-tap-highlight-color: transparent;
                }
                .scs.is-in .fd {
                    opacity: 1;
                    transform: translateY(0);
                    transition-delay: var(--d), var(--d);
                }
                .scs.is-in .fd:hover {
                    transform: translateY(-10px);
                    transition-delay: 0s;
                }
                /* picked: pulled out of the pile and laid in front, image showing */
                .scs.is-in .fd.is-on {
                    animation: fd-pull 0.6s var(--ease);
                    transition-delay: 0s;
                }
                .scs.is-in .fd.is-on:hover {
                    transform: none;
                }
                @keyframes fd-pull {
                    0% {
                        transform: translateY(-70px) rotate(-1.5deg);
                    }
                    100% {
                        transform: none;
                    }
                }
                .fd-tab {
                    position: absolute;
                    top: -22px;
                    left: var(--tab);
                    max-width: 44%;
                    height: 24px;
                    padding: 5px 14px 0;
                    border-radius: 9px 9px 0 0;
                    background: var(--c1);
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 0 0 1px rgba(13, 42, 66, 0.1);
                    font-size: 10.5px;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    color: var(--ink);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .fd-body {
                    position: absolute;
                    inset: 0;
                    border-radius: 4px 12px 12px 12px;
                    background: linear-gradient(180deg, var(--c1) 0%, var(--c2) 100%);
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 0 0 1px rgba(13, 42, 66, 0.1),
                        0 -6px 14px -8px rgba(13, 42, 66, 0.3);
                    padding: 14px;
                }
                .fd.is-on .fd-tab {
                    color: #fff;
                    background: #1b4f72;
                }
                .fd-img {
                    display: block;
                    width: 100%;
                    height: 228px;
                    border-radius: 6px;
                    object-fit: cover;
                    object-position: top center;
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.12), 0 8px 18px -10px rgba(13, 42, 66, 0.5);
                    user-select: none;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.35s ease;
                }
                /* only the folder in front shows its picture; the pile stays clean */
                .fd.is-on .fd-img {
                    opacity: 1;
                    transition-delay: 0.15s;
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

                .scs-close {
                    position: absolute;
                    top: 28px;
                    right: 32px;
                    width: 52px;
                    height: 52px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    border: 2px solid var(--ink);
                    background: rgba(255, 255, 255, 0.7);
                    color: var(--ink);
                    cursor: pointer;
                    opacity: 0;
                    transform: scale(0.7) rotate(-90deg);
                    transition: opacity 0.3s ease, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease,
                        color 0.2s ease;
                }
                .scs.is-in .scs-close {
                    opacity: 1;
                    transform: none;
                }
                .scs.is-in .scs-close:hover,
                .scs-close:focus-visible {
                    background: var(--ink);
                    color: #e9eef0;
                    transform: rotate(90deg);
                    outline: none;
                }
                @media (prefers-reduced-motion: reduce) {
                    .tc,
                    .fd {
                        transition-duration: 0.01ms !important;
                        transition-delay: 0s !important;
                    }
                }
            `}</style>
        </div>,
        document.body
    );
}
