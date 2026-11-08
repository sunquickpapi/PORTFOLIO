"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Courier_Prime } from "next/font/google";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

interface Testimonial {
    id: string;
    author: string;
    role: string;
    quote: string;
    feedback: string;
}

/* ───────────── pixel speech bubbles ─────────────
 * Each bubble is drawn on a grid of CELL-px squares, sized to its text. A variant decides
 * the body's corner steps, its edge (straight or spiky) and where the tail goes. The frame
 * is navy pixels with a sky-blue drop shadow and a soft inner shade, like a game dialogue box.
 */
const CELL = 8;

type Variant = {
    name: string;
    corners: number[]; // inset per row from each corner (pixel rounding)
    margin: { t: number; r: number; b: number; l: number }; // room for the tail (cells)
    spiky?: boolean;
    tail: (b: Body) => [number, number][]; // extra cells outside the body
};
type Body = { x0: number; x1: number; y0: number; y1: number };

/**
 * All bubbles share the classic look (small stepped corners); only the pointer moves.
 * A pointer is a 5-cell wedge: one straight side flush with the bubble, the other slanted.
 */
const wedge = (x: number, y: number, dir: "down" | "up" | "left" | "right", flip = false): [number, number][] => {
    const out: [number, number][] = [];
    for (let k = 1; k <= 5; k++)
        for (let i = 0; i <= 5 - k; i++) {
            const along = flip ? -i : i;
            if (dir === "down") out.push([x + along, y + k]);
            if (dir === "up") out.push([x + along, y - k]);
            if (dir === "left") out.push([x - k, y + along]);
            if (dir === "right") out.push([x + k, y + along]);
        }
    return out;
};
const CORNERS = [2, 1];
const VARIANTS: Variant[] = [
    { name: "bl", corners: CORNERS, margin: { t: 0, r: 1, b: 5, l: 0 }, tail: (b) => wedge(b.x0 + 5, b.y1, "down") },
    { name: "tr", corners: CORNERS, margin: { t: 5, r: 1, b: 1, l: 0 }, tail: (b) => wedge(b.x1 - 5, b.y0, "up", true) },
    { name: "br", corners: CORNERS, margin: { t: 0, r: 1, b: 5, l: 0 }, tail: (b) => wedge(b.x1 - 5, b.y1, "down", true) },
    { name: "l", corners: CORNERS, margin: { t: 0, r: 1, b: 1, l: 5 }, tail: (b) => wedge(b.x0, Math.round(b.y0 + (b.y1 - b.y0) * 0.6), "left") },
    { name: "tl", corners: CORNERS, margin: { t: 5, r: 1, b: 1, l: 0 }, tail: (b) => wedge(b.x0 + 5, b.y0, "up") },
    { name: "r", corners: CORNERS, margin: { t: 0, r: 6, b: 1, l: 0 }, tail: (b) => wedge(b.x1, Math.round(b.y0 + (b.y1 - b.y0) * 0.35), "right") },
    { name: "bc", corners: CORNERS, margin: { t: 0, r: 1, b: 5, l: 0 }, tail: (b) => wedge(Math.round((b.x0 + b.x1) / 2), b.y1, "down") },
];

function PixelFrame({ w, h, v }: { w: number; h: number; v: Variant }) {
    const cols = Math.max(10, Math.floor(w / CELL));
    const rows = Math.max(10, Math.floor(h / CELL));
    const m = v.margin;
    const b: Body = { x0: m.l, x1: cols - 1 - m.r - 1, y0: m.t, y1: rows - 1 - m.b - 1 };
    const inBody = (c: number, r: number) => {
        if (c < b.x0 || c > b.x1 || r < b.y0 || r > b.y1) return false;
        const dy = Math.min(r - b.y0, b.y1 - r);
        const dx = Math.min(c - b.x0, b.x1 - c);
        if (dy < v.corners.length && dx < v.corners[dy]) return false;
        if (v.spiky) {
            // jagged teeth along every edge
            const p = 4;
            if (r === b.y0 && c % p >= 2) return false;
            if (r === b.y1 && (c + 2) % p >= 2) return false;
            if (c === b.x0 && (r + 2) % p >= 2) return false;
            if (c === b.x1 && r % p >= 2) return false;
        }
        return true;
    };
    const tail = new Set(v.tail(b).map(([c, r]) => `${c},${r}`));
    const inside = (c: number, r: number) => inBody(c, r) || tail.has(`${c},${r}`);
    const border = (c: number, r: number) =>
        inside(c, r) && (!inside(c - 1, r) || !inside(c + 1, r) || !inside(c, r - 1) || !inside(c, r + 1));

    // run-length rects per row for each layer
    const runs = (test: (c: number, r: number) => boolean, dx = 0, dy = 0) => {
        const out: string[] = [];
        for (let r = -1; r <= rows; r++) {
            let start = -1;
            for (let c = -1; c <= cols + 1; c++) {
                const on = test(c, r);
                if (on && start < 0) start = c;
                if (!on && start >= 0) {
                    out.push(`M${start + dx} ${r + dy}h${c - start}v1h-${c - start}z`);
                    start = -1;
                }
            }
        }
        return out.join("");
    };
    const fill = runs((c, r) => inside(c, r) && !border(c, r));
    const shade = runs((c, r) => inside(c, r) && !border(c, r) && (border(c + 1, r) || border(c, r + 1)));
    const edge = runs(border);
    const shadow = runs(inside, 1, 1);

    return (
        <svg className="tm-frame" width={cols * CELL} height={rows * CELL} viewBox={`0 0 ${cols} ${rows}`} shapeRendering="crispEdges" aria-hidden="true">
            <path className="tm-shadow" d={shadow} />
            <path className="tm-fill" d={fill} />
            <path className="tm-shade" d={shade} />
            <path className="tm-edge" d={edge} />
        </svg>
    );
}

function Bubble({ t, i, mini, onOpen, style }: { t: Testimonial; i: number; mini?: boolean; onOpen?: () => void; style?: React.CSSProperties }) {
    const v = VARIANTS[i % VARIANTS.length];
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ w: 0, h: 0 });
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    const m = v.margin;
    const pad = mini ? 2 : 3; // cells of padding inside the frame
    const initials = t.author
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
    return (
        <article
            ref={ref}
            className={`tm-b tm-${v.name} ${mini ? "is-mini" : ""}`}
            style={
                {
                    "--rot": `${[-1.6, 1.2, -0.6, 1.8, -1.2, 0.8][i % 6]}deg`,
                    "--dy": `${[0, 34, 12, 46, 6, 28][i % 6]}px`,
                    ...style,
                } as React.CSSProperties
            }
            {...(onOpen
                ? {
                      role: "button",
                      tabIndex: 0,
                      "aria-label": `Open message from ${t.author}`,
                      onClick: onOpen,
                      onKeyDown: (e: React.KeyboardEvent) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen()),
                  }
                : {})}
        >
            <div
                className="tm-float"
                style={{
                    paddingTop: (m.t + pad) * CELL,
                    paddingRight: (m.r + pad + 1) * CELL,
                    paddingBottom: (m.b + pad + 1) * CELL,
                    paddingLeft: (m.l + pad) * CELL,
                    animationDelay: `${-i * 2.7}s`,
                    animationDuration: `${9 + (i % 3)}s`,
                }}
            >
            {size.w > 0 && <PixelFrame w={size.w} h={size.h} v={v} />}
            <div className="tm-content">
                <span className={`tm-k ${courier.className}`}>MSG N°{String(i + 1).padStart(2, "0")}</span>
                <h3 className="tm-quote">&ldquo;{t.quote}&rdquo;</h3>
                <p className="tm-text">{t.feedback}</p>
                <div className="tm-author">
                    <span className="tm-av" aria-hidden="true">
                        {initials}
                    </span>
                    <span className="tm-who">
                        <span className="tm-name">{t.author}</span>
                        <span className={`tm-role ${courier.className}`}>{t.role}</span>
                    </span>
                </div>
            </div>
            </div>
        </article>
    );
}

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    // phones (≤640px): every message shrunk onto one screen, a little overlapped; tap one to open it
    const [phone, setPhone] = useState(false);
    const [open, setOpen] = useState<number | null>(null);
    const [spots, setSpots] = useState<{ x: number; y: number }[]>([]);
    const stageRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 640px)");
        const update = () => setPhone(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);
    // lay the minis out down the stage, alternating sides, sharing the height (overlapping when tight)
    const layout = useCallback(() => {
        const st = stageRef.current;
        if (!st) return;
        const kids = Array.from(st.children) as HTMLElement[];
        if (!kids.length) return;
        const W = st.clientWidth;
        const H = st.clientHeight;
        const hs = kids.map((k) => k.offsetHeight);
        const ws = kids.map((k) => k.offsetWidth);
        const n = kids.length;
        const total = hs.reduce((a, b) => a + b, 0);
        // spacing between tops: spread evenly; negative gap = overlap
        const gap = n > 1 ? Math.min(18, (H - total) / (n - 1)) : 0;
        const used = total + gap * (n - 1);
        let y = Math.max(0, (H - used) / 2);
        const out = kids.map((_, k) => {
            const side = k % 2 === 0 ? 0 : 1;
            const jitter = [6, 14, 2, 10, 4, 12][k % 6];
            const x = side === 0 ? jitter : W - ws[k] - jitter;
            const spot = { x, y };
            y += hs[k] + gap;
            return spot;
        });
        setSpots(out);
    }, []);
    useLayoutEffect(() => {
        if (!phone) return;
        layout();
        const st = stageRef.current;
        if (!st) return;
        const ro = new ResizeObserver(() => layout());
        ro.observe(st);
        Array.from(st.children).forEach((c) => ro.observe(c));
        return () => ro.disconnect();
    }, [phone, layout, testimonials.length]);
    // the popup: Esc closes it
    useEffect(() => {
        if (open === null) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const res = await fetch("/api/testimonials");
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                const data = await res.json();
                if (!Array.isArray(data)) throw new Error("Invalid response");
                setTestimonials(data);
            } catch (error) {
                console.error("Error fetching testimonials:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTestimonials();
    }, []);

    if (loading)
        return (
            <section id="testimonials" className="section-high-fidelity py-24">
                <div className="container" style={{ maxWidth: "1400px" }}>
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/20"></div>
                    </div>
                </div>
            </section>
        );

    if (testimonials.length === 0) return null;

    return (
        <section
            id="testimonials"
            className="section-high-fidelity relative overflow-hidden"
            /* one full screen like Projects and Snippets: the bubbles sit in the middle, clear of the nav bar */
            style={
                phone
                    ? { height: "100svh", boxSizing: "border-box", display: "flex", flexDirection: "column", padding: "76px 0 18px", scrollMarginTop: 0 }
                    : { minHeight: "100svh", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", padding: "120px 0 60px", scrollMarginTop: 0 }
            }
        >
            {phone ? (
                <div className="container relative z-10 tm-phone">
                    <div className="tm-wall tm-stage" ref={stageRef}>
                        {testimonials.map((t, i) => (
                            <Bubble
                                key={t.id}
                                t={t}
                                i={i}
                                mini
                                onOpen={() => setOpen(i)}
                                style={{
                                    left: spots[i]?.x ?? 0,
                                    top: spots[i]?.y ?? 0,
                                    zIndex: i + 1,
                                    visibility: spots[i] ? "visible" : "hidden",
                                }}
                            />
                        ))}
                    </div>
                    <span className={`tm-hint ${courier.className}`}>TAP A MESSAGE TO OPEN IT</span>
                </div>
            ) : (
                <div className="container relative z-10" style={{ maxWidth: "1300px" }}>
                    <div className="tm-wall">
                        {testimonials.map((t, i) => (
                            <Bubble key={t.id} t={t} i={i} />
                        ))}
                    </div>
                </div>
            )}

            {open !== null &&
                createPortal(
                    <div className="tm-pop" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={`Message from ${testimonials[open].author}`}>
                        <div className="tm-wall tm-pop-card" onClick={(e) => e.stopPropagation()}>
                            <Bubble t={testimonials[open]} i={open} />
                            <button type="button" className="tm-pop-x" aria-label="Close" onClick={() => setOpen(null)}>
                                <X size={18} strokeWidth={2.4} />
                            </button>
                        </div>
                    </div>,
                    document.body
                )}

            <style jsx>{`
                .tm-wall {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 28px 32px;
                    align-items: start;
                    padding-bottom: 50px;
                }
                .tm-wall :global(.tm-b) {
                    position: relative;
                    transform: translateY(var(--dy)) rotate(var(--rot));
                    transition: transform 0.5s cubic-bezier(0.34, 1.5, 0.5, 1), filter 0.4s ease, opacity 0.4s ease;
                    --edge: #0d2a42;
                    --fill: #fbfcfd;
                    --shade: #dbe7ef;
                    --shadow: #a9cbe1;
                }
                /* the hovered bubble comes forward; the rest fall back */
                .tm-wall :global(.tm-b:hover) {
                    z-index: 5;
                    transform: translateY(calc(var(--dy) - 8px)) rotate(0deg) scale(1.04);
                }
                :global(.tm-wall:has(.tm-b:hover) .tm-b:not(:hover)) {
                    transform: translateY(calc(var(--dy) + 10px)) rotate(var(--rot)) scale(0.93);
                    filter: blur(1.5px) saturate(0.7);
                    opacity: 0.45;
                }
                /* same slow drift as the pass card (and the other floating objects) */
                .tm-wall :global(.tm-float) {
                    position: relative;
                    animation: tm-float 10s ease-in-out infinite;
                }
                @keyframes tm-float {
                    0%,
                    100% {
                        transform: translateY(0) rotate(-0.6deg);
                    }
                    50% {
                        transform: translateY(-12px) rotate(0.4deg);
                    }
                }
                .tm-wall :global(.tm-frame) {
                    position: absolute;
                    left: 0;
                    top: 0;
                    z-index: 0;
                    pointer-events: none;
                }
                .tm-wall :global(.tm-shadow) {
                    fill: var(--shadow);
                }
                .tm-wall :global(.tm-fill) {
                    fill: var(--fill);
                }
                .tm-wall :global(.tm-shade) {
                    fill: var(--shade);
                }
                .tm-wall :global(.tm-edge) {
                    fill: var(--edge);
                }
                .tm-wall :global(.tm-content) {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .tm-wall :global(.tm-k) {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.24em;
                    color: #3a7ca5;
                }
                .tm-wall :global(.tm-quote) {
                    margin: 0;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif !important;
                    font-size: 19px;
                    font-weight: 800;
                    line-height: 1.25;
                    letter-spacing: -0.01em;
                    color: #0d2a42;
                }
                .tm-wall :global(.tm-text) {
                    margin: 0;
                    font-size: 14.5px;
                    line-height: 1.65;
                    color: #3d5568;
                }
                .tm-wall :global(.tm-author) {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-top: 6px;
                    padding-top: 12px;
                    border-top: 2px dashed rgba(27, 79, 114, 0.22);
                }
                /* pixel avatar: a little square badge with the initials */
                .tm-wall :global(.tm-av) {
                    flex: none;
                    width: 34px;
                    height: 34px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #1b4f72;
                    color: #e9f4fa;
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 0.04em;
                    box-shadow: 3px 3px 0 #a9cbe1;
                    clip-path: polygon(3px 0, calc(100% - 3px) 0, calc(100% - 3px) 3px, 100% 3px, 100% calc(100% - 3px), calc(100% - 3px) calc(100% - 3px), calc(100% - 3px) 100%, 3px 100%, 3px calc(100% - 3px), 0 calc(100% - 3px), 0 3px, 3px 3px);
                }
                .tm-wall :global(.tm-who) {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }
                .tm-wall :global(.tm-name) {
                    font-size: 14px;
                    font-weight: 800;
                    color: #0d2a42;
                }
                .tm-wall :global(.tm-role) {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    color: #3a7ca5;
                }
                /* the popup opened from a mini */
                .tm-pop {
                    position: fixed;
                    inset: 0;
                    z-index: 4000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px 18px;
                    background: rgba(8, 20, 32, 0.42);
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    animation: tm-pop-bg 0.3s ease both;
                }
                .tm-pop-card {
                    position: relative;
                    display: block;
                    width: min(100%, 420px);
                    padding: 0;
                    animation: tm-pop-in 0.42s cubic-bezier(0.34, 1.4, 0.5, 1) both;
                }
                .tm-pop-card :global(.tm-b) {
                    transform: none !important;
                }
                .tm-pop-x {
                    position: absolute;
                    top: -14px;
                    right: -6px;
                    z-index: 3;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    border: 2px solid #0d2a42;
                    background: #fbfcfd;
                    color: #0d2a42;
                    box-shadow: 3px 3px 0 #a9cbe1;
                }
                @keyframes tm-pop-bg {
                    from {
                        opacity: 0;
                    }
                }
                @keyframes tm-pop-in {
                    from {
                        opacity: 0;
                        transform: translateY(18px) scale(0.86);
                    }
                }
                /* phones: the stage fills what is left of the screen; minis are placed by layout() */
                .tm-phone {
                    flex: 1;
                    min-height: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .tm-stage {
                    position: relative;
                    display: block;
                    flex: 1;
                    min-height: 0;
                    padding: 0;
                }
                .tm-stage :global(.tm-b) {
                    position: absolute;
                    width: 80%;
                    cursor: pointer;
                    transform: rotate(var(--rot));
                    -webkit-tap-highlight-color: transparent;
                }
                .tm-stage :global(.tm-b:hover),
                .tm-stage :global(.tm-b:active) {
                    transform: rotate(0deg) scale(1.03);
                }
                :global(.tm-stage:has(.tm-b:hover) .tm-b:not(:hover)) {
                    transform: rotate(var(--rot));
                    filter: none;
                    opacity: 1;
                }
                /* a mini shows the headline, the start of the message and who wrote it */
                .tm-wall :global(.tm-b.is-mini .tm-content) {
                    gap: 6px;
                }
                .tm-wall :global(.tm-b.is-mini .tm-k) {
                    font-size: 9.5px;
                }
                .tm-wall :global(.tm-b.is-mini .tm-quote) {
                    font-size: 15px;
                }
                .tm-wall :global(.tm-b.is-mini .tm-text) {
                    font-size: 12.5px;
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .tm-wall :global(.tm-b.is-mini .tm-author) {
                    margin-top: 2px;
                    padding-top: 8px;
                }
                .tm-wall :global(.tm-b.is-mini .tm-av) {
                    width: 28px;
                    height: 28px;
                    font-size: 10.5px;
                }
                .tm-wall :global(.tm-b.is-mini .tm-name) {
                    font-size: 12.5px;
                }
                .tm-wall :global(.tm-b.is-mini .tm-role) {
                    font-size: 9.5px;
                }
                .tm-hint {
                    flex: none;
                    text-align: center;
                    font-size: 10.5px;
                    font-weight: 700;
                    letter-spacing: 0.24em;
                    color: #3a7ca5;
                }
                @media (prefers-reduced-motion: reduce) {
                    .tm-wall :global(.tm-b) {
                        transition: none;
                    }
                    .tm-wall :global(.tm-float) {
                        animation: none;
                    }
                }
            `}</style>
        </section>
    );
}
