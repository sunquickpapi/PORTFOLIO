"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

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

export default function Snippets() {
    const { theme } = useTheme();
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
                                <div className="project-new-card" style={{ margin: 0 }}>
                                    <div className="project-image-container" style={{ aspectRatio: '1200 / 630' }}>
                                        <ScaledPreviewIframe
                                            src={getPlaygroundUrl(snippet)}
                                            title={`${snippet.title} Preview`}
                                            containerWidth={320}
                                        />
                                    </div>
                                    <div className="project-info">
                                        <div className="snippet-badges">
                                            <span className="snippet-lang-badge">{snippet.language}</span>
                                            <span className="snippet-cat-badge">{snippet.category || "utility"}</span>
                                        </div>
                                        <h3>{snippet.title}</h3>
                                        <p className="project-date">{formatDate(snippet.created_at)}</p>
                                        <div className="project-tags">
                                            {snippet.tags?.split(",").slice(0, 3).map((t: string) => (
                                                <span key={t} className="tag">#{t.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
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
                    transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
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

                .pos-center:hover {
                    transform: translateX(0) scale(1.12);
                }
                .pos-left:hover, .pos-right:hover {
                    opacity: 0.9;
                    filter: blur(0);
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
                    color: ${theme === 'light' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)'};
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
