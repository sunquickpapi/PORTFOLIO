"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Snippet {
    id: string;
    title: string;
    description: string;
    code: string;
    language: string;
    category: string;
    tags: string;
    preview_image_url?: string;
    playground_url?: string;
    created_at: string;
}

function getPlaygroundUrl(snippet: Snippet): string {
    if (snippet.playground_url) return snippet.playground_url;
    const t = snippet.title.toLowerCase();
    if (t.includes("scroll") || t.includes("reveal")) return "/snippet-playground/preview-scroll.html";
    if (t.includes("magnetic") || t.includes("hover")) return "/snippet-playground/preview-magnetic.html";
    if (t.includes("clipboard") || t.includes("copy")) return "/snippet-playground/preview-clipboard.html";
    if (t.includes("debounce") || t.includes("cancel")) return "/snippet-playground/preview-debounce.html";
    if (t.includes("glass") || t.includes("morphism")) return "/snippet-playground/preview-glass.html";
    return "/snippet-playground/preview-scroll.html";
}

function ScaledPreviewIframe({ src, title, containerWidth, baseWidth = 1200, baseHeight = 630, visibleHeight }: {
    src: string; title: string; containerWidth: number; baseWidth?: number; baseHeight?: number; visibleHeight?: number;
}) {
    const scale = containerWidth > 0 ? containerWidth / baseWidth : 0;
    const cropHeight = visibleHeight ?? baseHeight;
    return (
        <div style={{ position: "relative", width: "100%", aspectRatio: `${baseWidth} / ${cropHeight}`, overflow: "hidden", background: "#f8fafc" }}>
            <iframe
                src={src}
                title={title}
                style={{
                    position: "absolute", top: 0, left: 0,
                    width: `${baseWidth}px`, height: `${baseHeight}px`,
                    transform: scale > 0 ? `scale(${scale})` : "none",
                    transformOrigin: "top left",
                    pointerEvents: "none", border: "none",
                    opacity: scale > 0 ? 1 : 0,
                }}
            />
        </div>
    );
}

/** Steel paperclip holding the preview print onto the sheet. */
function Paperclip() {
    return (
        <svg className="snip-clip" viewBox="0 0 24 64" aria-hidden="true">
            <path
                d="M8 22 V10 a5 5 0 0 1 10 0 V48 a8 8 0 0 1 -16 0 V16 a3 3 0 0 1 6 0 V44"
                fill="none"
                stroke="url(#snipClipSteel)"
                strokeWidth="2.6"
                strokeLinecap="round"
            />
            <defs>
                <linearGradient id="snipClipSteel" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#c9d5de" />
                    <stop offset=".45" stopColor="#7d93a4" />
                    <stop offset="1" stopColor="#4f6577" />
                </linearGradient>
            </defs>
        </svg>
    );
}

type Turn = { dir: 1 | -1; t0: number } | null;
const FLIP_MS = 1100;
const AUTO_MS = 5200;
const BOOK_H = 470;

const formatDate = (dateStr?: string) => {
    if (!dateStr) return "JUNE 2026";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
};

/** One ruled notebook page: the preview print clipped on, then the snippet's details. */
function Page({ snippet, side, blank }: { snippet?: Snippet; side: "left" | "right"; blank?: boolean }) {
    return (
        <div className={`nbp nbp-${side}`}>
            <span className="nbp-holes" aria-hidden="true" />
            {snippet ? (
                <div className="nbp-body">
                    <div className="nbp-print">
                        <ScaledPreviewIframe src={getPlaygroundUrl(snippet)} title={`${snippet.title} Preview`} containerWidth={256} />
                        <Paperclip />
                    </div>
                    <div className="snippet-badges">
                        <span className="snippet-lang-badge">{snippet.language}</span>
                        <span className="snippet-cat-badge">{snippet.category || "utility"}</span>
                    </div>
                    <h3 className="nbp-title">{snippet.title}</h3>
                    <p className="nbp-date">{formatDate(snippet.created_at)}</p>
                    <div className="nbp-tags">
                        {snippet.tags?.split(",").slice(0, 3).map((t: string) => (
                            <span key={t} className="nbp-tag">
                                #{t.trim()}
                            </span>
                        ))}
                    </div>
                </div>
            ) : blank ? (
                <div className="nbp-body nbp-end">
                    <span className="nbp-end-k">END OF NOTES</span>
                    <Link href="/snippets" className="nbp-end-link">
                        Browse the full vault →
                    </Link>
                </div>
            ) : null}
        </div>
    );
}

/**
 * Snippets as an open spiral notebook: two snippets per spread, one per ruled page.
 * Every few seconds the right page lifts and turns over the spiral, one page at a time
 * (click the right page to turn forward, the left page to turn back).
 */
export default function Snippets() {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [loading, setLoading] = useState(true);
    const [spread, setSpread] = useState(0);
    const [turn, setTurn] = useState<Turn>(null);
    const [scale, setScale] = useState(1);
    const wrapRef = useRef<HTMLDivElement>(null);
    const hoverRef = useRef(false);

    useEffect(() => {
        fetch("/api/snippets")
            .then((res) => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) setSnippets(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // fit the 760px-wide book to small screens
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => setScale(Math.min(1, (el.clientWidth - 8) / 760)));
        ro.observe(el);
        return () => ro.disconnect();
    }, [loading]);

    const n = snippets.length;
    const spreads = Math.max(1, Math.ceil(n / 2));
    const at = (i: number) => (i >= 0 && i < n ? snippets[i] : undefined);
    const mod = (v: number) => ((v % spreads) + spreads) % spreads;

    const flip = useCallback(
        (dir: 1 | -1) => {
            if (turn || spreads < 2) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setSpread((s) => mod(s + dir));
            setTurn({ dir, t0: performance.now() });
            window.setTimeout(() => {
                setSpread((s) => mod(s + dir));
                setTurn(null);
            }, FLIP_MS);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [turn, spreads]
    );

    // turn a page every few seconds (not while the pointer rests on the book)
    useEffect(() => {
        if (spreads < 2) return;
        const id = window.setInterval(() => {
            if (!hoverRef.current && document.visibilityState === "visible") flip(1);
        }, AUTO_MS);
        return () => window.clearInterval(id);
    }, [flip, spreads]);

    if (loading)
        return (
            <section id="snippets" className="py-20 flex items-center justify-center">
                <div className="animate-pulse text-[var(--color-text-muted)] text-xl font-bold">Loading Snippets...</div>
            </section>
        );
    if (n === 0) return null;

    // what each surface shows
    const cur = spread;
    const next = mod(spread + 1);
    const prev = mod(spread - 1);
    const L = (sp: number) => at(sp * 2);
    const R = (sp: number) => at(sp * 2 + 1);
    const blankR = (sp: number) => sp * 2 + 1 >= n; // odd count: last right page is the "end" page
    // forward: the current right page turns over; its back is the next left page
    // back: the current left page turns back; its front is the previous right page
    const leftStatic = turn?.dir === -1 ? prev : cur;
    const rightStatic = turn?.dir === 1 ? next : cur;
    const leafFront = turn?.dir === 1 ? cur : prev; // right-hand face
    const leafBack = turn?.dir === 1 ? next : cur; // left-hand face

    return (
        <section id="snippets">
            <div className="snippets-main-container" ref={wrapRef}>
                <div className="nb-fit" style={{ height: (BOOK_H + 12) * scale }}>
                    <div
                        className="nb-book"
                        style={{ transform: `translateX(-50%) scale(${scale})` }}
                        onPointerEnter={() => (hoverRef.current = true)}
                        onPointerLeave={() => (hoverRef.current = false)}
                    >
                        <div className="nb-cover" aria-hidden="true" />
                        <div className="nb-side nb-left" onClick={() => flip(-1)} title="Previous page">
                            <Page snippet={L(leftStatic)} side="left" />
                        </div>
                        <div className="nb-side nb-right" onClick={() => flip(1)} title="Next page">
                            <Page snippet={R(rightStatic)} side="right" blank={blankR(rightStatic)} />
                        </div>

                        {/* the turning page */}
                        {turn && (
                            <div className={`nb-leaf ${turn.dir === 1 ? "is-fwd" : "is-back"}`} aria-hidden="true">
                                <div className="nb-face nb-face-front">
                                    <Page snippet={R(leafFront)} side="right" blank={blankR(leafFront)} />
                                    <span className="nb-shade" />
                                </div>
                                <div className="nb-face nb-face-back">
                                    <Page snippet={L(leafBack)} side="left" />
                                    <span className="nb-shade" />
                                </div>
                            </div>
                        )}

                        {/* spiral wire binding */}
                        <div className="nb-spiral" aria-hidden="true">
                            {Array.from({ length: 21 }).map((_, i) => (
                                <span key={i} className="nb-coil" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center relative z-10" style={{ marginTop: 44, marginBottom: 16 }}>
                    <Link href="/snippets" className="btn-view-all">
                        View All Snippets
                    </Link>
                </div>
            </div>

            <style jsx>{`
                #snippets {
                    position: relative;
                    padding: 7rem 0 4rem;
                    overflow: hidden;
                }
                .snippets-main-container {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }
                .nb-fit {
                    position: relative;
                }
                .nb-book {
                    position: absolute;
                    left: 50%;
                    top: 0;
                    width: 760px;
                    height: ${BOOK_H}px;
                    transform-origin: top center;
                    perspective: 2200px;
                }
                /* hard cover peeking out around the pages, in the site's navy */
                .nb-cover {
                    position: absolute;
                    inset: -9px -10px -11px;
                    border-radius: 10px;
                    background: linear-gradient(160deg, #1b3d57 0%, #0d2a42 60%, #0a2135 100%);
                    box-shadow: 0 30px 50px -26px rgba(13, 42, 66, 0.55), 0 0 0 1px rgba(13, 42, 66, 0.2);
                }
                .nb-side,
                .nb-leaf {
                    position: absolute;
                    top: 0;
                    width: 370px;
                    height: ${BOOK_H}px;
                }
                .nb-left {
                    left: 0;
                    cursor: w-resize;
                }
                .nb-right {
                    right: 0;
                    cursor: e-resize;
                }
                /* the leaf hinges on the spine */
                .nb-leaf {
                    left: 390px;
                    z-index: 5;
                    transform-style: preserve-3d;
                    transform-origin: -10px 50%;
                    animation: nb-turn ${FLIP_MS}ms cubic-bezier(0.45, 0.05, 0.25, 1) both;
                }
                .nb-leaf.is-back {
                    animation-name: nb-turn-back;
                }
                @keyframes nb-turn {
                    0% {
                        transform: rotateY(0deg);
                    }
                    100% {
                        transform: rotateY(-180deg);
                    }
                }
                @keyframes nb-turn-back {
                    0% {
                        transform: rotateY(-180deg);
                    }
                    100% {
                        transform: rotateY(0deg);
                    }
                }
                .nb-face {
                    position: absolute;
                    inset: 0;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
                .nb-face-back {
                    transform: rotateY(180deg);
                }
                /* light and shadow sweeping across the page as it turns */
                .nb-shade {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    border-radius: inherit;
                    animation: nb-shade ${FLIP_MS}ms ease-in-out both;
                }
                .nb-face-front .nb-shade {
                    background: linear-gradient(90deg, rgba(13, 42, 66, 0.28), rgba(13, 42, 66, 0) 55%);
                }
                .nb-face-back .nb-shade {
                    background: linear-gradient(270deg, rgba(13, 42, 66, 0.28), rgba(13, 42, 66, 0) 55%);
                }
                @keyframes nb-shade {
                    0%,
                    100% {
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                }

                /* ── a ruled page ── */
                .nb-book :global(.nbp) {
                    position: absolute;
                    inset: 0;
                    overflow: hidden;
                    background-color: #fbfcfd;
                    background-image: linear-gradient(
                            90deg,
                            transparent 0,
                            transparent var(--margin),
                            rgba(58, 153, 201, 0.35) var(--margin),
                            rgba(58, 153, 201, 0.35) calc(var(--margin) + 1px),
                            transparent calc(var(--margin) + 1px)
                        ),
                        repeating-linear-gradient(180deg, transparent 0 27px, rgba(58, 153, 201, 0.18) 27px 28px),
                        linear-gradient(180deg, #fdfefe 0%, #f2f6f9 100%);
                    background-position: 0 0, 0 18px, 0 0;
                }
                .nb-book :global(.nbp-left) {
                    --margin: 58px;
                    border-radius: 4px 2px 2px 4px;
                    box-shadow: inset -18px 0 22px -18px rgba(13, 42, 66, 0.35);
                }
                .nb-book :global(.nbp-right) {
                    --margin: 58px;
                    border-radius: 2px 4px 4px 2px;
                    box-shadow: inset 18px 0 22px -18px rgba(13, 42, 66, 0.35);
                }
                /* punched holes beside the spiral */
                .nb-book :global(.nbp-holes) {
                    position: absolute;
                    top: 12px;
                    bottom: 12px;
                    width: 8px;
                    background: radial-gradient(circle, #c9d6df 0 3px, transparent 3.5px) 0 0 / 8px 21.9px repeat-y;
                }
                .nb-book :global(.nbp-left .nbp-holes) {
                    right: 8px;
                }
                .nb-book :global(.nbp-right .nbp-holes) {
                    left: 8px;
                }
                .nb-book :global(.nbp-body) {
                    position: absolute;
                    inset: 30px 30px 26px 72px;
                    display: flex;
                    flex-direction: column;
                }
                .nb-book :global(.nbp-right .nbp-body) {
                    inset: 30px 26px 26px 78px;
                }
                .nb-book :global(.nbp-print) {
                    position: relative;
                    padding: 6px;
                    margin-bottom: 18px;
                    background: #fff;
                    border-radius: 3px;
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 6px 12px -6px rgba(13, 42, 66, 0.35);
                    transform: rotate(-1.4deg);
                }
                .nb-book :global(.nbp-right .nbp-print) {
                    transform: rotate(1.2deg);
                }
                .nb-book :global(.snip-clip) {
                    position: absolute;
                    top: -18px;
                    left: 34px;
                    width: 15px;
                    height: 44px;
                    z-index: 3;
                    transform: rotate(-6deg);
                    filter: drop-shadow(1px 1px 0.5px rgba(13, 42, 66, 0.25));
                }
                .nb-book :global(.nbp-title) {
                    margin: 2px 0 0;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif !important;
                    font-size: 20px;
                    font-weight: 800;
                    line-height: 28px;
                    letter-spacing: -0.01em;
                    color: #0d2a42;
                }
                .nb-book :global(.nbp-date) {
                    margin: 0;
                    font-family: "Courier New", Courier, monospace;
                    font-size: 12px;
                    font-weight: 700;
                    line-height: 28px;
                    letter-spacing: 0.14em;
                    color: #3a7ca5;
                }
                .nb-book :global(.nbp-tags) {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px 8px;
                    margin-top: 4px;
                }
                .nb-book :global(.nbp-tag) {
                    padding: 3px 9px;
                    border: 1.5px solid rgba(27, 79, 114, 0.35);
                    border-radius: 999px;
                    font-size: 11.5px;
                    font-weight: 600;
                    color: #1b4f72;
                    background: rgba(255, 255, 255, 0.6);
                }
                .nb-book :global(.nbp-end) {
                    align-items: center;
                    justify-content: center;
                    gap: 14px;
                    text-align: center;
                }
                .nb-book :global(.nbp-end-k) {
                    font-family: "Courier New", Courier, monospace;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.3em;
                    color: #3a7ca5;
                }
                .nb-book :global(.nbp-end-link) {
                    font-size: 18px;
                    font-weight: 800;
                    color: #0d2a42;
                    text-decoration: none;
                    border-bottom: 2px dashed rgba(27, 79, 114, 0.35);
                    opacity: 1 !important;
                }

                /* ── spiral wire ── */
                .nb-spiral {
                    position: absolute;
                    left: 50%;
                    top: 14px;
                    bottom: 14px;
                    width: 44px;
                    margin-left: -22px;
                    z-index: 8;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    pointer-events: none;
                }
                .nb-coil {
                    display: block;
                    height: 9px;
                    border-radius: 6px;
                    border: 2.5px solid #2c4356;
                    border-left-color: #5d7487;
                    border-right-color: #5d7487;
                    background: transparent;
                    box-shadow: 0 2px 2px rgba(13, 42, 66, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25);
                    transform: rotate(-8deg);
                }

                /* ── badges ── */
                .snippet-badges {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.25rem;
                }
                .nb-book :global(.snippet-lang-badge) {
                    font-size: 10px;
                    text-transform: uppercase;
                    background: rgba(58, 153, 201, 0.12);
                    color: #3a99c9;
                    font-weight: 800;
                    padding: 0.2rem 0.6rem;
                    border-radius: 5px;
                    letter-spacing: 0.05em;
                }
                .nb-book :global(.snippet-cat-badge) {
                    font-size: 9px;
                    text-transform: uppercase;
                    font-weight: 800;
                    color: rgba(13, 42, 66, 0.4);
                    letter-spacing: 0.06em;
                }
                .nb-book :global(.snippet-badges) {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.25rem;
                }
                @media (prefers-reduced-motion: reduce) {
                    .nb-leaf,
                    .nb-shade {
                        animation-duration: 0.01ms !important;
                    }
                }
            `}</style>
        </section>
    );
}
