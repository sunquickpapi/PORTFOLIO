"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

function Bubble({ t, i }: { t: Testimonial; i: number }) {
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
    const pad = 3; // cells of padding inside the frame
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
            className={`tm-b tm-${v.name}`}
            style={
                {
                    "--rot": `${[-1.6, 1.2, -0.6, 1.8, -1.2, 0.8][i % 6]}deg`,
                    "--dy": `${[0, 34, 12, 46, 6, 28][i % 6]}px`,
                } as React.CSSProperties
            }
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
        <section id="testimonials" className="section-high-fidelity py-24 relative overflow-hidden">
            <div className="container relative z-10" style={{ maxWidth: "1300px" }}>
                <div className="section-header mb-16 flex flex-col items-center">
                    <h2>Testimonials</h2>
                    <p
                        className="section-subtitle text-center text-lg md:text-xl max-w-3xl mx-auto italic leading-relaxed"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        What my clients and colleagues say about working with me
                    </p>
                </div>

                <div className="tm-wall">
                    {testimonials.map((t, i) => (
                        <Bubble key={t.id} t={t} i={i} />
                    ))}
                </div>
            </div>

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
