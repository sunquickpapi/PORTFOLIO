"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Check, X } from "lucide-react";
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
    created_at: string;
}

export default function Snippets() {
    const { theme } = useTheme();
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<"code" | "preview">("code");

    useEffect(() => {
        fetch("/api/snippets")
            .then((res) => {
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) setSnippets(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching snippets:", err);
                setLoading(false);
            });
    }, []);

    // Reset tab to code when switching snippets
    useEffect(() => {
        setActiveTab("code");
    }, [selectedSnippet]);

    // Scroll block for body when modal is open
    useEffect(() => {
        if (selectedSnippet) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [selectedSnippet]);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "JUNE 2026";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
    };

    if (loading) return (
        <section id="snippets" className="py-20 flex items-center justify-center">
            <div className="animate-pulse text-[var(--color-text-muted)] text-xl font-bold">Loading Snippets...</div>
        </section>
    );

    // Ensure the track has at least 8 elements, and the duplication factor is even to loop seamlessly
    const minCardsNeeded = 8;
    const rawRepeatCount = Math.ceil(minCardsNeeded / Math.max(1, snippets.length));
    const repeatCount = rawRepeatCount % 2 === 0 ? rawRepeatCount : rawRepeatCount + 1;
    const duplicatedSnippets = Array(repeatCount).fill(snippets).flat();

    return (
        <section id="snippets">
            <div className="bg-animation-container">
                <div className="geo-bar geo-1"></div>
                <div className="geo-bar geo-2"></div>
                <div className="geo-bar geo-4"></div>
                <div className="geo-bar geo-6"></div>
                <div className="geo-bar geo-8"></div>
            </div>

            <div className="snippets-main-container" style={{ margin: "0 auto", paddingLeft: "1.5rem", paddingRight: "1.5rem", overflow: "hidden" }}>
                <div className="section-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <h2>Snippets</h2>
                    <p className="section-subtitle">A curated vault of reusable code fragments and helper utilities</p>
                </div>

                {/* Infinite Horizontal Scrolling Track (Loops seamlessly with duplicated items) */}
                <div className="snippets-marquee-container mt-8 w-full">
                    <div className="snippets-marquee-track">
                        {duplicatedSnippets.map((snippet, idx) => (
                            <div key={`${snippet.id}-${idx}`} className="snippet-marquee-card">
                                <div className="project-new-card h-full">
                                    <div className="project-info">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="lang-badge-inline">{snippet.language}</span>
                                            <span className="category-badge-text">{(snippet.category || "utility")}</span>
                                        </div>

                                        {/* Preview Frame */}
                                        <div className="card-preview-frame">
                                            <div className="card-preview-header">
                                                <div className="flex gap-1">
                                                    <span className="dot dot-red"></span>
                                                    <span className="dot dot-yellow"></span>
                                                    <span className="dot dot-green"></span>
                                                </div>
                                            </div>
                                            <div className="card-preview-content">
                                                {snippet.preview_image_url ? (
                                                    snippet.preview_image_url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                                        <video
                                                            src={snippet.preview_image_url}
                                                            className="w-full h-full object-cover"
                                                            autoPlay
                                                            muted
                                                            loop
                                                            playsInline
                                                        />
                                                    ) : (
                                                        <img
                                                            src={snippet.preview_image_url}
                                                            alt={snippet.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )
                                                ) : (
                                                    <div className="card-preview-fallback">
                                                        <svg className="w-5 h-5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <h3>{snippet.title}</h3>
                                        <p className="project-date">{formatDate(snippet.created_at)}</p>
                                        
                                        {snippet.tags && (
                                            <div className="project-tags">
                                                {snippet.tags.split(",").map((tag: string) => (
                                                    <span key={tag} className="tag">#{tag.trim()}</span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="project-actions mt-auto">
                                            <button
                                                onClick={() => setSelectedSnippet(snippet)}
                                                className="btn-action btn-preview w-full"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* View All Snippets Button */}
                <div className="flex justify-center mt-12 mb-4 relative z-10">
                    <Link href="/snippets" className="btn-view-all">
                        View All Snippets
                    </Link>
                </div>
            </div>

            {/* Snippet Details Modal */}
            {selectedSnippet && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div
                        className={`absolute inset-0 backdrop-blur-sm transition-opacity ${theme === 'light' ? 'bg-white/70' : 'bg-black/90'}`}
                        onClick={() => setSelectedSnippet(null)}
                    />

                    <div className="relative w-full max-w-[800px] border overflow-hidden flex flex-col project-details-content shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                        <button onClick={() => setSelectedSnippet(null)} className="modal-close">
                            <X size={20} />
                        </button>

                        <div className="details-body" style={{ padding: "3rem" }}>
                            <div className="details-info w-full" style={{ padding: 0 }}>
                                <div className="snippet-detail-header flex justify-between items-start w-full flex-wrap gap-4 mb-6">
                                    <div>
                                        <h2 className="text-3xl font-black mb-2 text-white snippet-detail-title">{selectedSnippet.title}</h2>
                                        <p className="project-date">{formatDate(selectedSnippet.created_at)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="lang-badge-inline uppercase font-bold tracking-wider">{selectedSnippet.language}</span>
                                        <button
                                            onClick={() => handleCopy(selectedSnippet.code)}
                                            className="btn-action btn-live py-2.5 px-5 flex items-center gap-2 rounded-xl text-xs"
                                            title="Copy Code"
                                        >
                                            {copied ? (
                                                <span className="flex items-center gap-1.5">
                                                    <Check size={16} />
                                                    Copied!
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5">
                                                    <Copy size={16} />
                                                    Copy Code
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {selectedSnippet.description && (
                                    <div className="snippet-full-desc mb-8">
                                        <h3 className="text-lg font-bold snippet-detail-desc-title mb-2">Description</h3>
                                        <p className="snippet-detail-desc-text leading-relaxed">{selectedSnippet.description}</p>
                                    </div>
                                )}

                                {/* Tab Selector */}
                                <div className="snippet-tabs-container mb-6">
                                    <button
                                        onClick={() => setActiveTab("code")}
                                        className={`snippet-tab-btn ${activeTab === "code" ? "active" : ""}`}
                                    >
                                        Code
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("preview")}
                                        className={`snippet-tab-btn ${activeTab === "preview" ? "active" : ""}`}
                                    >
                                        Preview Outcome
                                    </button>
                                </div>

                                {/* Active Tab Area */}
                                {activeTab === "code" ? (
                                    /* Code Block */
                                    <div className="code-block-wrapper relative rounded-2xl overflow-hidden border border-white/5 bg-black/40 w-full mb-6">
                                        <div className="code-header-bar flex items-center gap-1.5 px-4 py-2.5 bg-black/30 border-b border-white/5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70"></span>
                                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"></span>
                                            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70"></span>
                                            <span className="ml-auto text-[10px] uppercase font-bold tracking-widest opacity-40">{selectedSnippet.language}</span>
                                        </div>
                                        <pre className="p-5 overflow-x-auto custom-scrollbar" style={{ maxHeight: "350px", margin: 0 }}>
                                            <code className="text-sm font-mono leading-relaxed select-all block text-white/90" style={{ fontFamily: "'Geist Mono', monospace", whiteSpace: "pre", tabSize: 2 }}>
                                                {selectedSnippet.code}
                                            </code>
                                        </pre>
                                    </div>
                                ) : (
                                    /* Preview Frame (Mock Browser Container) */
                                    <div className="browser-mockup relative rounded-2xl overflow-hidden w-full flex flex-col mb-6">
                                        {/* Browser Header Bar */}
                                        <div className="browser-header flex items-center gap-2 px-4 py-3 select-none">
                                            {/* Window Controls */}
                                            <div className="flex gap-1.5">
                                                <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/30"></span>
                                                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/30"></span>
                                                <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/30"></span>
                                            </div>
                                            {/* Address Bar */}
                                            <div className="browser-address flex-1 max-w-[400px] mx-auto rounded-lg py-1 px-3 text-[11px] font-mono text-center truncate">
                                                portfolio.dev/snippets/{selectedSnippet.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                                            </div>
                                            {/* Spacer */}
                                            <div className="w-[52px]" />
                                        </div>
                                        {/* Browser Content */}
                                        <div className="browser-content relative w-full aspect-video min-h-[300px] flex items-center justify-center p-4">
                                            {selectedSnippet.preview_image_url ? (
                                                /* Visual Outcome (Image or Video) */
                                                <div className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
                                                    {selectedSnippet.preview_image_url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                                        <video
                                                            src={selectedSnippet.preview_image_url}
                                                            className="max-w-full max-h-full rounded-lg shadow-lg border border-white/10"
                                                            controls
                                                            autoPlay
                                                            muted
                                                            loop
                                                            playsInline
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                const fallbackEl = document.getElementById('preview-image-fallback');
                                                                if (fallbackEl) fallbackEl.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : (
                                                        <img
                                                            src={selectedSnippet.preview_image_url}
                                                            alt={`${selectedSnippet.title} Outcome`}
                                                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg border border-white/10 transition-transform duration-300 hover:scale-102"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                const fallbackEl = document.getElementById('preview-image-fallback');
                                                                if (fallbackEl) fallbackEl.style.display = 'flex';
                                                            }}
                                                        />
                                                    )}
                                                    {/* Fallback container if load fails */}
                                                    <div id="preview-image-fallback" style={{ display: 'none' }} className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-8 bg-black/40 backdrop-blur-md">
                                                        <svg className="w-16 h-16 text-white/20 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-white font-bold text-sm">Failed to Load Media</p>
                                                            <p className="text-white/40 text-xs mt-1">Please verify the media path in the admin settings.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Fallback State */
                                                <div className="flex flex-col items-center justify-center text-center p-8 gap-4 w-full h-full">
                                                    <div className="fallback-icon-box w-16 h-16 rounded-2xl flex items-center justify-center">
                                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="fallback-title font-bold text-sm mb-1">Visual Preview Available</h4>
                                                        <p className="fallback-desc text-xs max-w-sm">No preview image has been set for this snippet. You can add one in the Admin Dashboard to show the outcome visual.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedSnippet.tags && (
                                    <div className="project-tags">
                                        {selectedSnippet.tags.split(",").map((tag: string) => (
                                            <span key={tag} className="tag">#{tag.trim()}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                #snippets {
                    position: relative;
                    padding: 8rem 0;
                    overflow: hidden;
                }

                .snippets-main-container {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                /* Category Tabs styling */
                .category-tabs {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    margin-top: 2.5rem;
                    margin-bottom: 2rem;
                    padding: 0 1.5rem;
                    z-index: 10;
                    position: relative;
                }
                
                .category-tab-btn {
                    padding: 0.6rem 1.4rem;
                    border-radius: 9999px;
                    font-size: 0.825rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 1px solid ${theme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'};
                    background: ${theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'};
                    color: ${theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'};
                }
                
                .category-tab-btn:hover {
                    background: ${theme === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)'};
                    color: ${theme === 'light' ? '#000' : '#fff'};
                    transform: translateY(-2px);
                }
                
                .category-tab-btn.active {
                    background: linear-gradient(135deg, #1B4F72 0%, #3A99C9 100%);
                    color: #fff;
                    border-color: transparent;
                    box-shadow: 0 4px 15px rgba(58, 153, 201, 0.25);
                }
                
                /* Horizontal Marquee Styling */
                .snippets-marquee-container {
                    overflow: hidden;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    position: relative;
                    border-radius: 20px;
                    padding: 2rem 0 3rem;
                    mask-image: linear-gradient(to right, transparent, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 88%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 88%, transparent);
                }
                
                .snippets-marquee-track {
                    display: flex;
                    width: max-content;
                    animation: scroll-marquee 40s linear infinite;
                    padding: 0;
                }
                
                .snippets-marquee-track:hover {
                    animation-play-state: paused;
                }
                
                .snippets-marquee-track .snippet-marquee-card {
                    width: 352px; /* 320px + 32px padding-right */
                    padding-right: 2rem;
                    flex-shrink: 0;
                }

                .snippets-static-grid {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 2rem;
                }
                
                .snippets-static-grid .snippet-marquee-card {
                    width: 320px;
                    flex-shrink: 0;
                }
                
                @keyframes scroll-marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }

                .lang-badge-inline {
                    font-size: 11px;
                    text-transform: uppercase;
                    background: rgba(58, 153, 201, 0.15);
                    color: #3A99C9;
                    font-weight: 800;
                    padding: 0.3rem 0.8rem;
                    border-radius: 6px;
                    letter-spacing: 0.05em;
                    display: inline-block;
                }

                .category-badge-text {
                    font-size: 10px;
                    text-transform: uppercase;
                    font-weight: 800;
                    color: ${theme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)'};
                    letter-spacing: 0.05em;
                }
                
                .snippet-marquee-card h3 {
                    margin-top: 0.75rem !important;
                    margin-bottom: 0.5rem !important;
                }
                
                .custom-scrollbar::-webkit-scrollbar {
                    height: 6px;
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 9999px;
                }

                /* Tab Selector inside Modal */
                .snippet-tabs-container {
                    display: flex;
                    align-items: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                :global(.light) .snippet-tabs-container {
                    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
                }
                
                .snippet-tab-btn {
                    padding-bottom: 0.75rem;
                    font-size: 0.85rem;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    cursor: pointer;
                    background: none;
                    border: none;
                    transition: all 0.3s ease;
                    color: rgba(255, 255, 255, 0.4);
                    position: relative;
                }
                :global(.light) .snippet-tab-btn {
                    color: rgba(0, 0, 0, 0.4);
                }
                
                .snippet-tab-btn:hover {
                    color: rgba(255, 255, 255, 0.7);
                }
                :global(.light) .snippet-tab-btn:hover {
                    color: rgba(0, 0, 0, 0.7);
                }
                
                .snippet-tab-btn.active {
                    color: #fff;
                }
                :global(.light) .snippet-tab-btn.active {
                    color: #000;
                }
                
                .snippet-tab-btn.active::after {
                    content: '';
                    position: absolute;
                    bottom: -1px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: #3A99C9;
                    border-radius: 9999px;
                }

                /* Light mode headings overrides */
                .snippet-detail-title {
                    color: #fff !important;
                }
                :global(.light) .snippet-detail-title {
                    color: #1a202c !important;
                }
                .snippet-detail-desc-title {
                    color: #fff !important;
                }
                :global(.light) .snippet-detail-desc-title {
                    color: #2d3748 !important;
                }
                .snippet-detail-desc-text {
                    color: rgba(255, 255, 255, 0.7) !important;
                }
                :global(.light) .snippet-detail-desc-text {
                    color: #4a5568 !important;
                }
                
                .snippet-detail-header {
                    margin-bottom: 2rem !important;
                }
                
                .snippet-full-desc {
                    margin-bottom: 2rem !important;
                }

                /* Browser Frame Mockup */
                .browser-mockup {
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: #0B0F19;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    margin-bottom: 2rem !important; /* Spacing between preview frame and tags */
                }
                :global(.light) .browser-mockup {
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    background: #f8fafc;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
                }
                
                /* Code Block Wrapper & internal code block padding */
                .code-block-wrapper {
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: #0B0F19;
                    margin-bottom: 2rem !important; /* Spacing between code block frame and tags */
                }
                :global(.light) .code-block-wrapper {
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    background: #f8fafc;
                }
                
                .code-block-wrapper pre {
                    padding: 1.5rem !important; /* Inset padding between code block text and frame */
                    margin: 0 !important;
                    background: transparent !important;
                }
                
                .code-block-wrapper code {
                    background: transparent !important;
                    padding: 0 !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                    font-family: 'Geist Mono', 'Courier New', Courier, monospace !important;
                    font-size: 0.875rem !important;
                    line-height: 1.75 !important;
                    display: block !important;
                }
                :global(.light) .code-block-wrapper code {
                    color: #1a202c !important;
                }
                
                .browser-header {
                    background: rgba(0, 0, 0, 0.4);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                :global(.light) .browser-header {
                    background: rgba(0, 0, 0, 0.03);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
                }
                
                .browser-address {
                    background: rgba(0, 0, 0, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.5);
                }
                :global(.light) .browser-address {
                    background: #ffffff;
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    color: rgba(0, 0, 0, 0.5);
                }
                
                .browser-content {
                    background: rgba(0, 0, 0, 0.2);
                }
                :global(.light) .browser-content {
                    background: rgba(0, 0, 0, 0.02);
                }
                
                .fallback-title {
                    color: #fff;
                }
                :global(.light) .fallback-title {
                    color: #1f2937;
                }
                
                .fallback-desc {
                    color: rgba(255, 255, 255, 0.4);
                }
                :global(.light) .fallback-desc {
                    color: rgba(0, 0, 0, 0.4);
                }
                
                .fallback-icon-box {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.3);
                }
                :global(.light) .fallback-icon-box {
                    background: rgba(0, 0, 0, 0.03);
                    border: 1px solid rgba(0, 0, 0, 0.06);
                    color: rgba(0, 0, 0, 0.3);
                }

                /* Mini Preview Frame inside Slider Cards */
                .card-preview-frame {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    aspect-ratio: 16/10;
                    border-radius: 12px;
                    overflow: hidden;
                    background: ${theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'};
                    border: 1px solid ${theme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'};
                    margin: 0.75rem 0 1rem 0;
                }
                
                .card-preview-header {
                    display: flex;
                    align-items: center;
                    padding: 0.35rem 0.6rem;
                    background: ${theme === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(0, 0, 0, 0.4)'};
                    border-bottom: 1px solid ${theme === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)'};
                }
                
                .card-preview-header .dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 555px;
                    display: inline-block;
                }
                
                .dot-red {
                    background: #FF5F56;
                }
                
                .dot-yellow {
                    background: #FFBD2E;
                }
                
                .dot-green {
                    background: #27C93F;
                }
                
                .card-preview-content {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .card-preview-fallback {
                    color: ${theme === 'light' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.25)'};
                }

            `}</style>
        </section>
    );
}
