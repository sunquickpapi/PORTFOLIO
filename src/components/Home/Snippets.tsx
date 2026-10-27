"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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

/** A ripped bottom edge, different for every sheet (seeded from the snippet id so it never changes). */
function tornEdge(seed: string) {
    let h = [...seed].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) | 0, 9);
    const rnd = () => {
        h = (Math.imul(h ^ (h >>> 15), 2246822507) + 0x9e3779b9) | 0;
        return ((h >>> 0) % 1000) / 1000;
    };
    const pts: string[] = ["0 0", "100% 0"];
    const steps = 26;
    for (let i = 0; i <= steps; i++) {
        const x = 100 - (i / steps) * 100;
        const y = 2 + rnd() * 9 + (i % 2 ? rnd() * 3 : 0);
        pts.push(`${x.toFixed(2)}% calc(100% - ${y.toFixed(1)}px)`);
    }
    return `polygon(${pts.join(", ")})`;
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

export default function Snippets() {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIdx, setActiveIdx] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        fetch("/api/snippets")
            .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
            .then((data) => { if (Array.isArray(data)) setSnippets(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);


    const advance = useCallback(() => {
        if (snippets.length <= 1) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setActiveIdx((prev) => (prev + 1) % snippets.length);
            setIsTransitioning(false);
        }, 600);
    }, [snippets.length]);

    useEffect(() => {
        if (snippets.length <= 1) return;
        timerRef.current = setInterval(advance, 3500);
        return () => clearInterval(timerRef.current);
    }, [snippets.length, advance]);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "JUNE 2026";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
    };

    const goTo = (idx: number) => {
        if (idx === activeIdx || isTransitioning) return;
        setIsTransitioning(true);
        clearInterval(timerRef.current);
        setTimeout(() => {
            setActiveIdx(idx);
            setIsTransitioning(false);
        }, 400);
    };

    if (loading) return (
        <section id="snippets" className="py-20 flex items-center justify-center">
            <div className="animate-pulse text-[var(--color-text-muted)] text-xl font-bold">Loading Snippets...</div>
        </section>
    );

    if (snippets.length === 0) return null;

    const getCardPosition = (idx: number) => {
        const total = snippets.length;
        const diff = ((idx - activeIdx) % total + total) % total;
        if (diff === 0) return "center";
        if (diff === 1 || (diff === total - 1 && total === 2)) return "right";
        if (diff === total - 1) return "left";
        if (diff === 2) return "far-right";
        if (diff === total - 2) return "far-left";
        return "hidden";
    };

    return (
        <section id="snippets">
            <div className="bg-animation-container">
                <div className="geo-bar geo-1"></div>
                <div className="geo-bar geo-2"></div>
                <div className="geo-bar geo-4"></div>
                <div className="geo-bar geo-6"></div>
                <div className="geo-bar geo-8"></div>
            </div>

            <div className="snippets-main-container">
                <div className="section-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <h2>Snippets</h2>
                    <p className="section-subtitle">A curated vault of reusable code fragments and helper utilities</p>
                </div>

                {/* Spotlight Carousel */}
                <div className="carousel-stage">
                    {snippets.map((snippet, idx) => {
                        const pos = getCardPosition(idx);
                        return (
                            <div
                                key={snippet.id}
                                className={`carousel-card pos-${pos} ${isTransitioning ? "transitioning" : ""}`}
                                onClick={() => {
                                    if (pos !== "center") goTo(idx);
                                }}
                            >
                                {/* a torn sheet of ruled notebook paper, preview print clipped on */}
                                <div className="snip-sheet">
                                    <div className="snip-paper" style={{ clipPath: tornEdge(snippet.id) }}>
                                        <div className="snip-print">
                                            <ScaledPreviewIframe
                                                src={getPlaygroundUrl(snippet)}
                                                title={`${snippet.title} Preview`}
                                                containerWidth={268}
                                            />
                                        </div>
                                        <div className="snip-info">
                                            <div className="snippet-badges">
                                                <span className="snippet-lang-badge">{snippet.language}</span>
                                                <span className="snippet-cat-badge">{snippet.category || "utility"}</span>
                                            </div>
                                            <h3 className="snip-title">{snippet.title}</h3>
                                            <p className="snip-date">{formatDate(snippet.created_at)}</p>
                                            <div className="snip-tags">
                                                {snippet.tags?.split(",").slice(0, 3).map((t: string) => (
                                                    <span key={t} className="snip-tag">#{t.trim()}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <Paperclip />
                                </div>
                            </div>
                        );
                    })}
                </div>


                <div className="flex justify-center mt-20 mb-4 relative z-10">
                    <Link href="/snippets" className="btn-view-all">View All Snippets</Link>
                </div>
            </div>


            <style jsx>{`
                #snippets {
                    position: relative;
                    padding: 8rem 0 4rem;
                    overflow: hidden;
                }
                .snippets-main-container {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }

                .carousel-stage {
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 480px;
                    margin-top: 2.5rem;
                    perspective: 1000px;
                }

                .carousel-card {
                    position: absolute;
                    width: 320px;
                    cursor: pointer;
                    /* only the slide properties: hover never touches these, so it can't restart the slide */
                    transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1),
                        filter 0.7s cubic-bezier(0.4, 0, 0.2, 1);
                    will-change: transform, opacity;
                }

                .pos-center {
                    transform: translateX(0) scale(1.08);
                    z-index: 10;
                    opacity: 1;
                    filter: blur(0);
                }
                .pos-left {
                    transform: translateX(-340px) scale(0.85) rotateY(6deg);
                    z-index: 5;
                    opacity: 0.7;
                    filter: blur(1px);
                }
                .pos-right {
                    transform: translateX(340px) scale(0.85) rotateY(-6deg);
                    z-index: 5;
                    opacity: 0.7;
                    filter: blur(1px);
                }
                .pos-far-left {
                    transform: translateX(-600px) scale(0.65) rotateY(10deg);
                    z-index: 2;
                    opacity: 0.35;
                    filter: blur(3px);
                }
                .pos-far-right {
                    transform: translateX(600px) scale(0.65) rotateY(-10deg);
                    z-index: 2;
                    opacity: 0.35;
                    filter: blur(3px);
                }
                .pos-hidden {
                    transform: translateX(0) scale(0.4);
                    z-index: 0;
                    opacity: 0;
                    pointer-events: none;
                    filter: blur(6px);
                }

                /* ── torn notebook sheet ── */
                .snip-sheet {
                    position: relative;
                    filter: drop-shadow(0 1px 1px rgba(13, 42, 66, 0.12)) drop-shadow(0 14px 18px rgba(13, 42, 66, 0.16));
                    /* hover lives here, never on the outer card (that one carries the slide) */
                    transition: transform 0.4s cubic-bezier(0.34, 1.4, 0.64, 1), filter 0.4s ease;
                }
                .carousel-card.pos-center:not(.transitioning) .snip-sheet:hover {
                    transform: translateY(-6px) rotate(-0.6deg);
                    filter: drop-shadow(0 1px 1px rgba(13, 42, 66, 0.12)) drop-shadow(0 22px 26px rgba(13, 42, 66, 0.2));
                }
                .snip-paper {
                    position: relative;
                    padding: 22px 20px 34px 40px;
                    /* ruled lines every 28px on cool white paper */
                    background-color: #fbfcfd;
                    background-image: repeating-linear-gradient(
                            180deg,
                            transparent 0,
                            transparent 27px,
                            rgba(58, 153, 201, 0.2) 27px,
                            rgba(58, 153, 201, 0.2) 28px
                        ),
                        linear-gradient(180deg, #fdfefe 0%, #f3f7f9 100%);
                    background-position: 0 14px, 0 0;
                    /* ripped-out binder holes down the left edge */
                    -webkit-mask: radial-gradient(circle at 15px 14px, transparent 5px, #000 5.6px) 0 0 / 100% 28px repeat-y;
                    mask: radial-gradient(circle at 15px 14px, transparent 5px, #000 5.6px) 0 0 / 100% 28px repeat-y;
                }
                /* paper fibres left around the ripped holes */
                .snip-paper::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 26px;
                    background: repeating-linear-gradient(180deg, transparent 0 9px, rgba(13, 42, 66, 0.05) 9px 19px, transparent 19px 28px);
                    pointer-events: none;
                }
                .snip-print {
                    position: relative;
                    padding: 6px;
                    background: #fff;
                    border-radius: 3px;
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 6px 12px -6px rgba(13, 42, 66, 0.35);
                    transform: rotate(-1.4deg);
                }
                .snip-print :global(> div) {
                    border-radius: 2px;
                }
                .snip-sheet :global(.snip-clip) {
                    position: absolute;
                    top: -14px;
                    left: 62px;
                    width: 15px;
                    height: 44px;
                    z-index: 3;
                    transform: rotate(-6deg);
                    filter: drop-shadow(1px 1px 0.5px rgba(13, 42, 66, 0.25));
                }
                .snip-info {
                    padding-top: 16px;
                }
                .snip-title {
                    margin: 2px 0 0;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif !important;
                    font-size: 19px;
                    font-weight: 800;
                    line-height: 28px; /* sits on the ruled lines */
                    letter-spacing: -0.01em;
                    color: #0d2a42;
                }
                .snip-date {
                    margin: 0;
                    font-family: "Courier New", Courier, monospace;
                    font-size: 12px;
                    font-weight: 700;
                    line-height: 28px;
                    letter-spacing: 0.14em;
                    color: #3a7ca5;
                }
                .snip-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px 8px;
                    margin-top: 4px;
                }
                .snip-tag {
                    padding: 3px 9px;
                    border: 1.5px solid rgba(27, 79, 114, 0.35);
                    border-radius: 999px;
                    font-size: 11.5px;
                    font-weight: 600;
                    color: #1b4f72;
                    background: rgba(255, 255, 255, 0.6);
                    transform: rotate(-1deg);
                }
                .snip-tag:nth-child(2) {
                    transform: rotate(1deg);
                }

                /* ── Snippet badges ── */
                .snippet-badges {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                .snippet-lang-badge {
                    font-size: 10px;
                    text-transform: uppercase;
                    background: rgba(58, 153, 201, 0.12);
                    color: #3A99C9;
                    font-weight: 800;
                    padding: 0.2rem 0.6rem;
                    border-radius: 5px;
                    letter-spacing: 0.05em;
                }
                .snippet-cat-badge {
                    font-size: 9px;
                    text-transform: uppercase;
                    font-weight: 800;
                    color: rgba(13, 42, 66, 0.4); /* the paper stays light in both themes */
                    letter-spacing: 0.06em;
                }

                @media (max-width: 900px) {
                    .carousel-stage { height: 400px; }
                    .carousel-card { width: 240px; }
                    .pos-left { transform: translateX(-220px) scale(0.8) rotateY(6deg); }
                    .pos-right { transform: translateX(220px) scale(0.8) rotateY(-6deg); }
                    .pos-far-left, .pos-far-right { opacity: 0; pointer-events: none; }
                }
                @media (max-width: 600px) {
                    .carousel-stage { height: 380px; }
                    .carousel-card { width: 260px; }
                    .pos-center { transform: translateX(0) scale(1); }
                    .pos-left { transform: translateX(-160px) scale(0.75) rotateY(8deg); opacity: 0.4; }
                    .pos-right { transform: translateX(160px) scale(0.75) rotateY(-8deg); opacity: 0.4; }
                }
            `}</style>
        </section>
    );
}
