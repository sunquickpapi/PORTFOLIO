"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Courier_Prime } from "next/font/google";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

type Project = { id: string; title: string; image_url?: string | null; tech_stack?: string[] | null; slug?: string | null };

const MAX_MARKS = 10; // keeps the ring neat; the rest show as "+N"
const INK = ["#1b4f72", "#0d2a42", "#2a7aa8"];
const MARK = 104; // postmark size (px)

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

/** One vintage postmark for a technology: double ring, ring text, name in the middle. */
function Postmark({ name, seed }: { name: string; seed: string }) {
    const words = name.trim().split(/\s+/);
    // balance into one or two lines
    let lines = [name];
    if (name.length > 9 && words.length > 1) {
        let best = 1;
        let bestDiff = Infinity;
        for (let k = 1; k < words.length; k++) {
            const a = words.slice(0, k).join(" ").length;
            const b = words.slice(k).join(" ").length;
            if (Math.abs(a - b) < bestDiff) {
                bestDiff = Math.abs(a - b);
                best = k;
            }
        }
        lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
    }
    const longest = Math.max(...lines.map((l) => l.length));
    const size = Math.min(15, 66 / (longest * 0.6));
    const lh = size * 1.05;
    const y0 = 60 - ((lines.length - 1) * lh) / 2 + size * 0.34;
    const id = `pm-${seed}`;
    return (
        <svg viewBox="0 0 120 120" width={MARK} height={MARK}>
            <defs>
                <path id={id} d="M60 60 m-45 0 a45 45 0 1 1 90 0 a45 45 0 1 1 -90 0" />
            </defs>
            <circle cx="60" cy="60" r="56" fill="rgba(255,255,255,0.35)" stroke="currentColor" strokeWidth="3.2" />
            <circle cx="60" cy="60" r="36.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <text fill="currentColor" fontSize="8" fontWeight="700" className={courier.className}>
                <textPath href={`#${id}`} startOffset="0" textLength="276" lengthAdjust="spacing">
                    {"TECH STACK • FVL • 2026 • TECH STACK • FVL • 2026 •"}
                </textPath>
            </text>
            <g fill="currentColor" fontWeight="700" textAnchor="middle" className={courier.className}>
                {lines.map((l, i) => (
                    <text key={i} x="60" y={y0 + i * lh} fontSize={size}>
                        {l.toUpperCase()}
                    </text>
                ))}
            </g>
        </svg>
    );
}

/**
 * Full-screen showcase opened from the hero laptop: the page dims and blurs, the laptop
 * grows to the centre, its screen zooms into each project's main image, and that
 * project's tech stack floats around it as postmarks.
 */
export default function LaptopShowcase({ from, onClose }: { from: DOMRect; onClose: () => void }) {
    const [projects, setProjects] = useState<Project[] | null>(cache);
    const [idx, setIdx] = useState(0);
    const [phase, setPhase] = useState<"enter" | "open" | "zoomed" | "closing">("enter");
    const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
    const lapRef = useRef<HTMLDivElement>(null);
    const closeBtn = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (cache) return;
        prefetchProjects().then((d) => setProjects(d));
    }, []);

    // size everything from the viewport
    useLayoutEffect(() => {
        const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const lw = Math.max(320, Math.min(600, vp.w - 360, (vp.h - 430) / 0.64));
    const lidH = lw * 0.64;
    const baseH = lw * 0.05;
    const lapH = lidH + baseH;
    const cx = vp.w / 2;
    const cy = vp.h / 2 - 24;

    // FLIP: start exactly where the small laptop was, then grow to the centre
    // (worked out before the first paint, so the very first frame is the small laptop)
    const [startT] = useState(
        () =>
            `translate(${from.left + from.width / 2 - cx}px, ${from.top + from.height / 2 - cy}px) scale(${from.width / lw})`
    );
    useLayoutEffect(() => {
        // wait two frames so the starting (small) position is painted before growing
        let f2 = 0;
        const f1 = requestAnimationFrame(() => {
            f2 = requestAnimationFrame(() => setPhase("open"));
        });
        const t1 = window.setTimeout(() => {}, 0);
        const t2 = window.setTimeout(() => setPhase((p) => (p === "open" ? "zoomed" : p)), 900);
        return () => {
            cancelAnimationFrame(f1);
            cancelAnimationFrame(f2);
            window.clearTimeout(t1);
            window.clearTimeout(t2);
        };
        // only on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const close = useCallback(() => {
        setPhase("closing");
        window.setTimeout(onClose, 620);
    }, [onClose]);

    const list = projects || [];
    const n = list.length;
    const go = useCallback((d: number) => n && setIdx((i) => (i + d + n) % n), [n]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
        };
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeBtn.current?.focus({ preventScroll: true });
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [close, go]);

    const project = list[idx];
    const stack = (project?.tech_stack || []).filter(Boolean);
    const shown = stack.slice(0, stack.length > MAX_MARKS ? MAX_MARKS - 1 : MAX_MARKS);
    const extra = stack.length - shown.length;
    const marks = extra > 0 ? [...shown, `+${extra} more`] : shown;

    // place the postmarks on a rounded-rectangle ring around the laptop
    const rx = lw / 2 + 128;
    const ry = Math.min(lapH / 2 + 112, vp.h / 2 - 140);
    const pos = marks.map((_, i) => {
        const a = ((-90 + (360 * (i + 0.5)) / marks.length) * Math.PI) / 180;
        const c = Math.cos(a);
        const s = Math.sin(a);
        const p = 0.72; // between an ellipse and a rounded rectangle: even spacing, clear of the corners
        return {
            x: cx + rx * Math.sign(c) * Math.abs(c) ** p,
            y: cy + ry * Math.sign(s) * Math.abs(s) ** p,
            rot: ((i * 37 + idx * 11) % 26) - 13,
            ink: INK[i % 3],
            delay: 120 + i * 70,
        };
    });

    const visible = phase === "open" || phase === "zoomed";
    const zoomed = phase === "zoomed";

    return createPortal(
        <div className={`lps ${visible ? "is-in" : ""}`} role="dialog" aria-modal="true" aria-label="Stacks and projects">
            <div className="lps-backdrop" onClick={close} />

            <div
                ref={lapRef}
                className="lps-laptop"
                style={{
                    width: lw,
                    left: cx - lw / 2,
                    top: cy - lapH / 2,
                    transform: visible || !startT ? "none" : startT,
                }}
            >
                <div className="lps-lid" style={{ height: lidH }}>
                    <div className="lps-display">
                        {/* intro: the hero laptop's own title, zooming past */}
                        <div className={`lps-intro ${zoomed ? "is-gone" : ""}`}>
                            <span className="lps-intro-title">
                                Stacks &amp;
                                <br />
                                Projects
                            </span>
                        </div>
                        {list.map((p, i) => (
                            <div key={p.id} className={`lps-shot ${zoomed && i === idx ? "is-on" : ""}`} aria-hidden={i !== idx}>
                                {p.image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={p.image_url} alt={i === idx ? p.title : ""} draggable={false} />
                                ) : (
                                    <div className="lps-noimg" />
                                )}
                            </div>
                        ))}
                        {project && (
                            <div className={`lps-caption ${zoomed ? "is-on" : ""}`}>
                                <span className={`lps-no ${courier.className}`}>
                                    N°{String(idx + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                                </span>
                                <span className="lps-name">{project.title}</span>
                            </div>
                        )}
                        <span className="lps-glass" />
                    </div>
                    <span className="lps-cam" />
                </div>
                <div className="lps-base" style={{ height: baseH }}>
                    <span className="lps-notch" />
                </div>
            </div>

            {/* tech stack postmarks floating around the laptop */}
            {zoomed &&
                marks.map((m, i) => (
                    <div
                        key={`${idx}-${m}`}
                        className="lps-mark"
                        style={{
                            left: pos[i].x - MARK / 2,
                            top: pos[i].y - MARK / 2,
                            color: pos[i].ink,
                            animationDelay: `${pos[i].delay}ms, ${pos[i].delay + 600 + i * 230}ms`,
                            ["--rot" as string]: `${pos[i].rot}deg`,
                        }}
                        title={m}
                    >
                        <Postmark name={m} seed={`${idx}-${i}`} />
                    </div>
                ))}

            <div className={`lps-controls ${zoomed && n > 1 ? "is-on" : ""}`}>
                <button type="button" className="lps-arrow" onClick={() => go(-1)} aria-label="Previous project">
                    <ChevronLeft size={20} strokeWidth={2.4} />
                </button>
                <div className="lps-dots">
                    {list.map((p, i) => (
                        <button
                            key={p.id}
                            type="button"
                            className={`lps-dot ${i === idx ? "is-on" : ""}`}
                            onClick={() => setIdx(i)}
                            aria-label={`Show ${p.title}`}
                        />
                    ))}
                </div>
                <button type="button" className="lps-arrow" onClick={() => go(1)} aria-label="Next project">
                    <ChevronRight size={20} strokeWidth={2.4} />
                </button>
            </div>

            <button ref={closeBtn} type="button" className="lps-close" onClick={close} aria-label="Close">
                <X size={22} strokeWidth={2.4} />
            </button>

            <style jsx>{`
                .lps {
                    position: fixed;
                    inset: 0;
                    z-index: 5000;
                    --ease: cubic-bezier(0.65, 0, 0.35, 1);
                }
                .lps-backdrop {
                    position: absolute;
                    inset: 0;
                    background: rgba(233, 238, 241, 0.72);
                    backdrop-filter: blur(10px) saturate(0.9);
                    -webkit-backdrop-filter: blur(10px) saturate(0.9);
                    opacity: 0;
                    transition: opacity 0.5s ease;
                }
                .lps.is-in .lps-backdrop {
                    opacity: 1;
                }

                /* the enlarged laptop, front view */
                .lps-laptop {
                    position: absolute;
                    transform-origin: 50% 50%;
                    transition: transform 0.75s var(--ease);
                    filter: drop-shadow(0 28px 34px rgba(13, 42, 66, 0.28)) drop-shadow(0 4px 8px rgba(13, 42, 66, 0.18));
                }
                .lps-lid {
                    position: relative;
                    border-radius: 18px;
                    padding: 3px;
                    background: linear-gradient(180deg, #b7e0f6 0%, #8fc8ea 55%, #6cb0dc 100%);
                    box-shadow: inset 0 1.5px 0 rgba(255, 255, 255, 0.85), inset 0 0 0 1px rgba(27, 79, 114, 0.25);
                }
                .lps-lid::before {
                    content: "";
                    position: absolute;
                    inset: 3px;
                    border-radius: 15px;
                    background: #0b1118;
                }
                .lps-display {
                    position: absolute;
                    inset: 14px 14px 18px 14px;
                    border-radius: 6px;
                    overflow: hidden;
                    background: linear-gradient(135deg, #0b1f33 0%, #0d2a42 60%, #14395a 100%);
                }
                .lps-cam {
                    position: absolute;
                    top: 7px;
                    left: calc(50% - 2.5px);
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: #2a3440;
                }
                .lps-intro {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    padding-left: 9%;
                    transition: transform 0.7s var(--ease), opacity 0.45s ease 0.15s;
                }
                .lps-intro.is-gone {
                    transform: scale(2.6);
                    opacity: 0;
                }
                .lps-intro-title {
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: clamp(28px, 4.2vw, 52px);
                    font-weight: 800;
                    line-height: 1.08;
                    letter-spacing: -0.02em;
                    color: #fff;
                }
                .lps-shot {
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    transform: scale(1.18);
                    transition: opacity 0.45s ease, transform 0.9s var(--ease);
                }
                .lps-shot.is-on {
                    opacity: 1;
                    transform: scale(1);
                }
                .lps-shot img,
                .lps-noimg {
                    display: block;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: top center;
                    user-select: none;
                }
                .lps-noimg {
                    background: linear-gradient(135deg, #1b4f72, #0d2a42);
                }
                .lps-caption {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    padding: 34px 18px 14px;
                    background: linear-gradient(180deg, rgba(11, 17, 24, 0), rgba(11, 17, 24, 0.78));
                    opacity: 0;
                    transform: translateY(10px);
                    transition: opacity 0.4s ease 0.35s, transform 0.5s var(--ease) 0.35s;
                }
                .lps-caption.is-on {
                    opacity: 1;
                    transform: none;
                }
                .lps-no {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.18em;
                    color: #9fd8f2;
                }
                .lps-name {
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 18px;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    color: #fff;
                }
                .lps-glass {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0) 40%);
                    pointer-events: none;
                }
                .lps-base {
                    position: relative;
                    margin: -2px -5%;
                    border-radius: 3px 3px 14px 14px;
                    background: linear-gradient(180deg, #cfe9f8 0%, #a6d1ec 55%, #7fb6dc 100%);
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -2px 4px rgba(27, 79, 114, 0.25);
                }
                .lps-notch {
                    position: absolute;
                    top: 0;
                    left: calc(50% - 9%);
                    width: 18%;
                    height: 38%;
                    border-radius: 0 0 8px 8px;
                    background: rgba(27, 79, 114, 0.22);
                }

                /* postmarks: stamp in, then drift gently */
                .lps-mark {
                    position: absolute;
                    width: ${MARK}px;
                    height: ${MARK}px;
                    opacity: 0;
                    transform: rotate(var(--rot)) scale(1.6);
                    animation: lps-stamp 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.2) forwards, lps-drift 5s ease-in-out infinite;
                    pointer-events: none;
                }
                .lps-mark::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    background: url(/assets/passcard/pass-ink-gaps.png) center / 160px 160px;
                    opacity: 0.55;
                }
                .lps-mark :global(svg) {
                    display: block;
                    opacity: 0.9;
                }
                @keyframes lps-stamp {
                    0% {
                        opacity: 0;
                        transform: rotate(var(--rot)) scale(1.6);
                    }
                    60% {
                        opacity: 1;
                        transform: rotate(var(--rot)) scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: rotate(var(--rot)) scale(1);
                    }
                }
                @keyframes lps-drift {
                    0%,
                    100% {
                        translate: 0 0;
                    }
                    50% {
                        translate: 0 -6px;
                    }
                }

                .lps-controls {
                    position: absolute;
                    left: 50%;
                    bottom: 34px;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    transform: translate(-50%, 12px);
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.35s ease, transform 0.45s var(--ease);
                }
                .lps-controls.is-on {
                    opacity: 1;
                    transform: translate(-50%, 0);
                    pointer-events: auto;
                }
                .lps-arrow,
                .lps-close {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    border: 2px solid #0d2a42;
                    background: rgba(255, 255, 255, 0.7);
                    color: #0d2a42;
                    cursor: pointer;
                    transition: background 0.2s ease, color 0.2s ease, transform 0.25s ease;
                }
                .lps-arrow {
                    width: 44px;
                    height: 44px;
                }
                .lps-arrow:hover,
                .lps-close:hover,
                .lps-arrow:focus-visible,
                .lps-close:focus-visible {
                    background: #0d2a42;
                    color: #e9eef0;
                    outline: none;
                }
                .lps-dots {
                    display: flex;
                    gap: 8px;
                }
                .lps-dot {
                    width: 8px;
                    height: 8px;
                    padding: 0;
                    border-radius: 999px;
                    border: none;
                    background: rgba(13, 42, 66, 0.25);
                    cursor: pointer;
                    transition: width 0.3s var(--ease), background 0.3s ease;
                }
                .lps-dot.is-on {
                    width: 22px;
                    background: #1b4f72;
                }
                .lps-close {
                    position: absolute;
                    top: 28px;
                    right: 32px;
                    width: 52px;
                    height: 52px;
                    opacity: 0;
                    transform: scale(0.7) rotate(-90deg);
                    transition: opacity 0.3s ease, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease,
                        color 0.2s ease;
                }
                .lps.is-in .lps-close {
                    opacity: 1;
                    transform: none;
                }
                .lps.is-in .lps-close:hover {
                    transform: rotate(90deg);
                }

                @media (prefers-reduced-motion: reduce) {
                    .lps-laptop,
                    .lps-shot,
                    .lps-intro {
                        transition-duration: 0.01ms;
                    }
                    .lps-mark {
                        animation: lps-stamp 0.01ms forwards;
                    }
                }
            `}</style>
        </div>,
        document.body
    );
}
