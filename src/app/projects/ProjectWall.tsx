"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Courier_Prime } from "next/font/google";
import { Project } from "@/types/project";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

const thisYear = String(new Date().getFullYear());
const yearOf = (d?: string) => (d || "").match(/\d{4}/)?.[0] || "";
const previewsOf = (p: Project): string[] => {
    const raw = p.preview_images;
    const list = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.replace(/^[{[]|[}\]]$/g, "").split(",") : [];
    return list.map((s) => String(s).trim().replace(/^"|"$/g, "")).filter(Boolean);
};

// card geometry (px)
const CW = 330;
const CH = 206;
const LABEL = 44;
const GX = 30;
const GY = 34;
const SX = CW + GX; // column step
const SY = CH + LABEL + GY; // row step
const ROW_TILT = [-1.8, 1.1, -0.6, 2.0, -1.3, 0.7]; // each row leans a little differently, like the reference

/** Cycles through a project's uploaded preview pictures while hovered. */
function HoverPreviews({ images }: { images: string[] }) {
    const [k, setK] = useState(0);
    useEffect(() => {
        if (images.length < 2) return;
        const id = window.setInterval(() => setK((v) => (v + 1) % images.length), 900);
        return () => window.clearInterval(id);
    }, [images.length]);
    return (
        <span className="pw-previews" aria-hidden="true">
            {images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src + i} src={src} alt="" draggable={false} className={i === k ? "is-on" : ""} />
            ))}
            {images.length > 1 && (
                <span className="pw-dots">
                    {images.map((_, i) => (
                        <span key={i} className={i === k ? "is-on" : ""} />
                    ))}
                </span>
            )}
        </span>
    );
}

/**
 * Endless wall of project prints. Drag (or scroll / swipe) in any direction and it glides on
 * with momentum, wrapping seamlessly; the whole wall leans toward the cursor; hovering a card
 * plays that project's preview pictures. Click (without dragging) opens the project.
 */
export default function ProjectWall({ projects, onOpen }: { projects: Project[]; onOpen: (p: Project) => void }) {
    const stageRef = useRef<HTMLDivElement>(null);
    const tiltRef = useRef<HTMLDivElement>(null);
    const planeRef = useRef<HTMLDivElement>(null);
    const off = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
    const tilt = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
    const drag = useRef<{ x: number; y: number; ox: number; oy: number; moved: boolean; t: number; lx: number; ly: number } | null>(null);
    const raf = useRef(0);
    const [size, setSize] = useState({ w: 1400, h: 800 });
    const [range, setRange] = useState({ i0: -3, i1: 6, j0: -2, j1: 4 });
    const [hover, setHover] = useState<string | null>(null);
    const [grabbing, setGrabbing] = useState(false);
    const n = projects.length;

    useLayoutEffect(() => {
        const el = stageRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
        ro.observe(el);
        // start with the first card a little left of centre
        off.current.x = el.clientWidth / 2 - SX * 1.5;
        off.current.y = el.clientHeight / 2 - SY / 2 - 20;
        return () => ro.disconnect();
    }, []);

    // which cells cover the screen (plus a margin), recomputed only when crossing a cell
    const syncRange = useCallback(() => {
        const { x, y } = off.current;
        const i0 = Math.floor(-x / SX) - 2;
        const j0 = Math.floor(-y / SY) - 2;
        const i1 = i0 + Math.ceil(size.w / SX) + 4;
        const j1 = j0 + Math.ceil(size.h / SY) + 4;
        setRange((r) => (r.i0 === i0 && r.j0 === j0 && r.i1 === i1 && r.j1 === j1 ? r : { i0, i1, j0, j1 }));
    }, [size.w, size.h]);

    // one animation loop: momentum, pan, cursor tilt
    useEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const loop = () => {
            const o = off.current;
            if (!drag.current) {
                o.x += o.vx;
                o.y += o.vy;
                o.vx *= 0.94;
                o.vy *= 0.94;
                if (Math.abs(o.vx) < 0.02) o.vx = 0;
                if (Math.abs(o.vy) < 0.02) o.vy = 0;
            }
            const t = tilt.current;
            t.x += (t.tx - t.x) * 0.08;
            t.y += (t.ty - t.y) * 0.08;
            if (planeRef.current) planeRef.current.style.transform = `translate3d(${o.x}px, ${o.y}px, 0)`;
            if (tiltRef.current && !reduce)
                tiltRef.current.style.transform = `rotateX(${(-t.y * 7).toFixed(3)}deg) rotateY(${(t.x * 9).toFixed(3)}deg) translate3d(${(-t.x * 14).toFixed(2)}px, ${(-t.y * 10).toFixed(2)}px, 0)`;
            syncRange();
            raf.current = requestAnimationFrame(loop);
        };
        raf.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf.current);
    }, [syncRange]);

    // wheel / trackpad pans the wall
    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const o = off.current;
            o.vx = 0;
            o.vy = 0;
            o.x -= e.deltaX;
            o.y -= e.deltaY;
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, []);

    const onMove = (e: React.PointerEvent) => {
        const r = stageRef.current!.getBoundingClientRect();
        tilt.current.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        tilt.current.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        const g = drag.current;
        if (!g) return;
        const dx = e.clientX - g.x;
        const dy = e.clientY - g.y;
        if (!g.moved && Math.hypot(dx, dy) > 5) {
            g.moved = true;
            setGrabbing(true);
            setHover(null);
        }
        if (!g.moved) return;
        const now = performance.now();
        const dt = Math.max(1, now - g.t);
        off.current.vx = ((e.clientX - g.lx) / dt) * 16; // px per frame for the glide after release
        off.current.vy = ((e.clientY - g.ly) / dt) * 16;
        g.t = now;
        g.lx = e.clientX;
        g.ly = e.clientY;
        off.current.x = g.ox + dx;
        off.current.y = g.oy + dy;
    };
    const onDown = (e: React.PointerEvent) => {
        if (e.button !== 0) return;
        off.current.vx = 0;
        off.current.vy = 0;
        drag.current = { x: e.clientX, y: e.clientY, ox: off.current.x, oy: off.current.y, moved: false, t: performance.now(), lx: e.clientX, ly: e.clientY };
        try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
            /* synthetic or already-released pointer */
        }
    };
    const dragged = useRef(false);
    const onUp = () => {
        const g = drag.current;
        drag.current = null;
        setGrabbing(false);
        if (!g) return;
        dragged.current = g.moved;
        if (performance.now() - g.t > 90) {
            off.current.vx = 0; // held still before letting go: no glide
            off.current.vy = 0;
        }
    };
    // a plain click (not the end of a drag) opens the card under the pointer
    const onClick = (e: React.MouseEvent) => {
        if (dragged.current) {
            dragged.current = false;
            return;
        }
        const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-pid]");
        const p = el && projects.find((x) => x.id === el.dataset.pid);
        if (p) onOpen(p);
    };
    const onLeave = () => {
        tilt.current.tx = 0;
        tilt.current.ty = 0;
    };

    if (!n) return null;

    const cells: { i: number; j: number }[] = [];
    for (let j = range.j0; j <= range.j1; j++) for (let i = range.i0; i <= range.i1; i++) cells.push({ i, j });
    const mod = (a: number, m: number) => ((a % m) + m) % m;

    return (
        <div
            ref={stageRef}
            className={`pw-stage ${grabbing ? "is-grabbing" : ""}`}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onPointerLeave={onLeave}
            onClick={onClick}
            data-no-ripple=""
        >
            <div className="pw-tilt" ref={tiltRef}>
                <div className="pw-plane" ref={planeRef}>
                    {cells.map(({ i, j }) => {
                        // brick rows; neighbours always show different projects
                        const p = projects[mod(i + j * 3, n)];
                        const x = i * SX + mod(j, 2) * (SX / 2);
                        const y = j * SY;
                        const key = `${i},${j}`;
                        const y4 = yearOf(p.date);
                        const pv = previewsOf(p);
                        const on = hover === key;
                        return (
                            <div
                                key={key}
                                className={`pw-tile ${on ? "is-hover" : ""}`}
                                data-pid={p.id}
                                style={{ transform: `translate3d(${x}px, ${y}px, 0) rotate(${ROW_TILT[mod(j, ROW_TILT.length)]}deg)` }}
                                onPointerEnter={() => !drag.current && setHover(key)}
                                onPointerLeave={() => setHover((h) => (h === key ? null : h))}
                            >
                                <span className="pw-tile-img">
                                    {p.image_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={p.image_url} alt="" draggable={false} />
                                    ) : (
                                        <span className="pw-tile-noimg" />
                                    )}
                                    {on && pv.length > 0 && <HoverPreviews images={pv} />}
                                </span>
                                <span className="pw-tile-label">
                                    <span className="pw-tile-title">{p.title}</span>
                                    <span className={`pw-tile-tags ${courier.className}`}>
                                        {p.category && <span>{p.category.toUpperCase()}</span>}
                                        {y4 === thisYear ? <span className="is-new">NEW</span> : y4 && <span>{y4}</span>}
                                    </span>
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
                .pw-stage {
                    position: fixed;
                    inset: 0;
                    z-index: 1;
                    overflow: hidden;
                    cursor: grab;
                    touch-action: none;
                    user-select: none;
                    perspective: 1500px;
                }
                .pw-stage.is-grabbing {
                    cursor: grabbing;
                }
                .pw-tilt {
                    position: absolute;
                    inset: 0;
                    transform-style: preserve-3d;
                    will-change: transform;
                }
                .pw-plane {
                    position: absolute;
                    left: 0;
                    top: 0;
                    will-change: transform;
                }
                .pw-tile {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: ${CW}px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .pw-tile-img {
                    position: relative;
                    display: block;
                    height: ${CH}px;
                    padding: 7px;
                    border-radius: 16px;
                    background: #fff;
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 26px 38px -26px rgba(13, 42, 66, 0.55);
                    transition: transform 0.5s cubic-bezier(0.34, 1.5, 0.5, 1), box-shadow 0.3s ease;
                }
                .pw-tile-img > img,
                .pw-tile-noimg {
                    width: 100%;
                    height: 100%;
                    display: block;
                    object-fit: cover;
                    object-position: top center;
                    border-radius: 10px;
                    background: #dfe9f0;
                    pointer-events: none;
                }
                .pw-tile-noimg {
                    background: linear-gradient(135deg, #1b4f72, #0d2a42);
                }
                .pw-tile.is-hover .pw-tile-img {
                    transform: translateY(-6px) scale(1.03);
                    box-shadow: 0 0 0 2px #3a99c9, 0 34px 46px -24px rgba(13, 42, 66, 0.6);
                }
                /* uploaded preview pictures, cross-fading while hovered */
                .pw-tile-img :global(.pw-previews) {
                    position: absolute;
                    inset: 7px;
                    overflow: hidden;
                    border-radius: 10px;
                    background: #0d2a42;
                    animation: pw-fade 0.3s ease both;
                }
                @keyframes pw-fade {
                    from {
                        opacity: 0;
                    }
                }
                .pw-tile-img :global(.pw-previews img) {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    opacity: 0;
                    transform: scale(1.04);
                    transition: opacity 0.45s ease, transform 1.2s ease;
                    pointer-events: none;
                }
                .pw-tile-img :global(.pw-previews img.is-on) {
                    opacity: 1;
                    transform: none;
                }
                .pw-tile-img :global(.pw-dots) {
                    position: absolute;
                    left: 50%;
                    bottom: 8px;
                    display: flex;
                    gap: 4px;
                    padding: 4px 6px;
                    border-radius: 999px;
                    background: rgba(13, 42, 66, 0.55);
                    transform: translateX(-50%);
                }
                .pw-tile-img :global(.pw-dots span) {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.45);
                }
                .pw-tile-img :global(.pw-dots span.is-on) {
                    background: #fff;
                }
                .pw-tile-label {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    padding: 0 6px;
                }
                .pw-tile-title {
                    min-width: 0;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 14px;
                    font-weight: 800;
                    letter-spacing: 0.02em;
                    text-transform: uppercase;
                    color: #0d2a42;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .pw-tile-tags {
                    display: flex;
                    flex: none;
                    gap: 5px;
                }
                .pw-tile-tags span {
                    padding: 3px 7px;
                    border-radius: 6px;
                    background: rgba(27, 79, 114, 0.09);
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    color: #1b4f72;
                }
                .pw-tile-tags span.is-new {
                    background: #3a99c9;
                    color: #fff;
                }
                :global(:root.dark) .pw-tile-title {
                    color: #e9f4fa;
                }
            `}</style>
        </div>
    );
}
