"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Courier_Prime } from "next/font/google";
import { AppWindow, ArrowUpRight, Github, Images, X } from "lucide-react";
import { Project } from "@/types/project";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

interface ProjectModalProps {
    project: Project;
    isOpen: boolean;
    onClose: () => void;
    onPreview: (project: Project) => void;
}

const previewsOf = (p: Project): string[] => {
    const raw = p.preview_images;
    const list = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.replace(/^[{[]|[}\]]$/g, "").split(",") : [];
    return list.map((s) => String(s).trim().replace(/^"|"$/g, "")).filter(Boolean);
};

/**
 * Project details as a two-panel file. Left: the main image as a matted print, with the
 * uploaded previews as thumbnails (click to view). Right: kicker, title, date / category,
 * tech stack, then the challenge and solution as numbered notes; links pinned at the bottom.
 */
export default function ProjectModal({ project, isOpen, onClose, onPreview }: ProjectModalProps) {
    const shots = [project.image_url, ...previewsOf(project)].filter(Boolean) as string[];
    const [shot, setShot] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [closing, setClosing] = useState(false);

    useEffect(() => setMounted(true), []);
    useEffect(() => {
        setShot(0);
        setClosing(false);
    }, [project.id]);

    const close = () => {
        setClosing(true);
        window.setTimeout(onClose, 260);
    };

    useEffect(() => {
        if (!isOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
            if (e.key === "ArrowRight") setShot((s) => (s + 1) % Math.max(1, shots.length));
            if (e.key === "ArrowLeft") setShot((s) => (s - 1 + shots.length) % Math.max(1, shots.length));
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, shots.length]);

    if (!isOpen || !mounted) return null;

    const appStore = project.app_store_url;
    const sections = [
        project.challenge && { k: "THE CHALLENGE", text: project.challenge },
        project.solution && { k: "THE SOLUTION", text: project.solution },
    ].filter(Boolean) as { k: string; text: string }[];
    if (!sections.length && project.description) sections.push({ k: "OVERVIEW", text: project.description });

    return createPortal(
        <div className={`pm ${closing ? "is-closing" : ""}`} role="dialog" aria-modal="true" aria-label={project.title}>
            <div className="pm-backdrop" onClick={close} />

            <div className="pm-panel">
                <button type="button" className="pm-close" onClick={close} aria-label="Close">
                    <X size={18} strokeWidth={2.4} />
                </button>

                {/* LEFT: gallery */}
                <div className="pm-gallery">
                    <div className="pm-print">
                        {shots.length ? (
                            shots.map((src, i) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img key={src + i} src={src} alt={i === 0 ? project.title : ""} className={i === shot ? "is-on" : ""} draggable={false} />
                            ))
                        ) : (
                            <span className="pm-noimg" />
                        )}
                        {shots.length > 1 && (
                            <span className={`pm-count ${courier.className}`}>
                                {String(shot + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}
                            </span>
                        )}
                    </div>
                    {shots.length > 1 && (
                        <div className="pm-thumbs">
                            {shots.map((src, i) => (
                                <button type="button" key={src + i} className={`pm-thumb ${i === shot ? "is-on" : ""}`} onClick={() => setShot(i)} aria-label={`Show image ${i + 1}`}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={src} alt="" draggable={false} loading="lazy" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: details */}
                <div className="pm-info">
                    <div className="pm-scroll">
                        <span className={`pm-k ${courier.className}`}>
                            FILE:: {(project.category || "PROJECT").toUpperCase()}
                        </span>
                        <h2 className="pm-title">{project.title}</h2>
                        <div className={`pm-meta ${courier.className}`}>
                            {project.date && <span>{project.date.toUpperCase()}</span>}
                            {project.category && (
                                <>
                                    <span className="pm-slash">/</span>
                                    <span className="pm-pill">{project.category.toUpperCase()}</span>
                                </>
                            )}
                        </div>

                        {project.tech_stack?.length ? (
                            <div className="pm-block">
                                <span className={`pm-label ${courier.className}`}>STACK</span>
                                <div className="pm-stack">
                                    {project.tech_stack.map((t) => (
                                        <span key={t} className="pm-chip">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {sections.map((s, i) => (
                            <div className="pm-block pm-note" key={s.k}>
                                <span className={`pm-label ${courier.className}`}>
                                    {String(i + 1).padStart(2, "0")} · {s.k}
                                </span>
                                <p>{s.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="pm-actions">
                        {shots.length > 1 && (
                            <button
                                type="button"
                                className="pm-btn"
                                onClick={() => {
                                    onClose();
                                    onPreview(project);
                                }}
                            >
                                <Images size={16} strokeWidth={2.2} /> Close Up
                            </button>
                        )}
                        {project.live_demo_url && (
                            <a href={project.live_demo_url} target="_blank" rel="noopener noreferrer" className="pm-btn is-primary">
                                Live demo <ArrowUpRight size={16} strokeWidth={2.4} />
                            </a>
                        )}
                        {appStore && (
                            <a href={appStore} target="_blank" rel="noopener noreferrer" className="pm-btn is-primary">
                                <AppWindow size={16} strokeWidth={2.2} /> App Store
                            </a>
                        )}
                        {project.repo_url && (
                            <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="pm-btn">
                                <Github size={16} strokeWidth={2.2} /> Repository
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .pm {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 28px;
                    --ink: #0d2a42;
                    --navy: #1b4f72;
                    --sky: #3a99c9;
                }
                .pm-backdrop {
                    position: absolute;
                    inset: 0;
                    background: rgba(13, 42, 66, 0.32);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    animation: pm-fade 0.3s ease both;
                }
                .pm-panel {
                    position: relative;
                    display: grid;
                    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
                    width: min(1120px, 100%);
                    height: min(680px, calc(100vh - 56px));
                    border-radius: 22px;
                    overflow: hidden;
                    background: linear-gradient(160deg, #fbfcfd 0%, #f1f5f8 100%);
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 40px 80px -30px rgba(13, 42, 66, 0.6);
                    animation: pm-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
                .pm.is-closing .pm-panel {
                    animation: pm-out 0.26s ease-in both;
                }
                .pm.is-closing .pm-backdrop {
                    animation: pm-fade 0.26s ease reverse both;
                }
                @keyframes pm-in {
                    from {
                        opacity: 0;
                        transform: translateY(18px) scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: none;
                    }
                }
                @keyframes pm-out {
                    to {
                        opacity: 0;
                        transform: translateY(12px) scale(0.98);
                    }
                }
                @keyframes pm-fade {
                    from {
                        opacity: 0;
                    }
                }
                .pm-close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    z-index: 3;
                    width: 38px;
                    height: 38px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border: 1.5px solid rgba(13, 42, 66, 0.2);
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.85);
                    color: var(--ink);
                    cursor: pointer;
                    transition: background 0.2s ease, color 0.2s ease, transform 0.3s ease;
                }
                .pm-close:hover {
                    background: var(--ink);
                    color: #e9f4fa;
                    transform: rotate(90deg);
                }

                /* ---- gallery ---- */
                .pm-gallery {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    min-height: 0;
                    padding: 26px;
                    background: rgba(27, 79, 114, 0.05);
                    border-right: 2px dashed rgba(27, 79, 114, 0.16);
                }
                .pm-print {
                    position: relative;
                    flex: 1;
                    min-height: 0;
                    padding: 9px;
                    border-radius: 16px;
                    background: #fff;
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 24px 40px -26px rgba(13, 42, 66, 0.55);
                }
                .pm-print img,
                .pm-noimg {
                    position: absolute;
                    inset: 9px;
                    width: calc(100% - 18px);
                    height: calc(100% - 18px);
                    object-fit: contain; /* show the whole picture, never crop it */
                    object-position: center;
                    border-radius: 10px;
                    background: #eef3f6;
                    opacity: 0;
                    transition: opacity 0.6s ease;
                }
                .pm-print img.is-on {
                    opacity: 1;
                }
                .pm-noimg {
                    opacity: 1;
                    background: linear-gradient(135deg, var(--navy), var(--ink));
                }
                .pm-count {
                    position: absolute;
                    left: 20px;
                    bottom: 20px;
                    padding: 4px 9px;
                    border-radius: 7px;
                    background: rgba(13, 42, 66, 0.7);
                    color: #fff;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.14em;
                }
                .pm-thumbs {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    padding: 2px 2px 4px;
                    scrollbar-width: none;
                }
                .pm-thumbs::-webkit-scrollbar {
                    display: none;
                }
                .pm-thumb {
                    flex: none;
                    width: 70px;
                    height: 50px;
                    padding: 3px;
                    border: 0;
                    border-radius: 9px;
                    background: #fff;
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.1);
                    cursor: pointer;
                    opacity: 0.6;
                    transition: opacity 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
                }
                .pm-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 6px;
                    display: block;
                }
                .pm-thumb:hover {
                    opacity: 1;
                    transform: translateY(-2px);
                }
                .pm-thumb.is-on {
                    opacity: 1;
                    box-shadow: 0 0 0 2px var(--sky);
                }

                /* ---- details ---- */
                .pm-info {
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                }
                .pm-scroll {
                    flex: 1;
                    min-height: 0;
                    overflow-y: auto;
                    padding: 34px 34px 20px 32px;
                }
                .pm-k {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.24em;
                    color: #3a7ca5;
                }
                .pm-title {
                    margin: 10px 46px 0 0;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif !important;
                    font-size: clamp(26px, 2.6vw, 36px);
                    font-weight: 800;
                    line-height: 1.08;
                    letter-spacing: -0.02em;
                    color: var(--ink);
                }
                .pm-meta {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 14px;
                    font-size: 11.5px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    color: var(--navy);
                }
                .pm-slash {
                    color: #3a7ca5;
                }
                .pm-pill {
                    padding: 2px 10px;
                    border: 1.5px solid rgba(13, 42, 66, 0.4);
                    border-radius: 999px;
                }
                .pm-block {
                    margin-top: 22px;
                    padding-top: 18px;
                    border-top: 1.5px dashed rgba(27, 79, 114, 0.18);
                }
                .pm-label {
                    display: block;
                    margin-bottom: 10px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.2em;
                    color: #3a7ca5;
                }
                .pm-stack {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }
                .pm-chip {
                    padding: 5px 10px;
                    border-radius: 8px;
                    background: #fff;
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.1);
                    font-size: 12.5px;
                    font-weight: 700;
                    color: var(--navy);
                }
                .pm-note p {
                    margin: 0;
                    font-size: 14.5px;
                    line-height: 1.75;
                    color: #3d5568;
                }
                .pm-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    padding: 16px 32px 22px;
                    border-top: 1.5px solid rgba(27, 79, 114, 0.1);
                    background: rgba(251, 252, 253, 0.9);
                }
                .pm-actions:empty {
                    display: none;
                }
                .pm-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    height: 40px;
                    padding: 0 16px;
                    border: 1.5px solid rgba(13, 42, 66, 0.25);
                    border-radius: 999px;
                    background: #fff;
                    color: var(--ink);
                    font-size: 14px;
                    font-weight: 700;
                    text-decoration: none;
                    cursor: pointer;
                    opacity: 1 !important;
                    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
                }
                .pm-btn:hover {
                    border-color: var(--ink);
                    transform: translateY(-1px);
                }
                .pm-btn.is-primary {
                    background: var(--ink);
                    border-color: var(--ink);
                    color: #e9f4fa;
                }
                .pm-btn.is-primary:hover {
                    background: var(--navy);
                    border-color: var(--navy);
                }

                @media (max-width: 860px) {
                    .pm {
                        padding: 12px;
                    }
                    .pm-panel {
                        grid-template-columns: minmax(0, 1fr);
                        grid-template-rows: auto minmax(0, 1fr);
                        height: calc(100vh - 24px);
                    }
                    .pm-gallery {
                        border-right: 0;
                        border-bottom: 2px dashed rgba(27, 79, 114, 0.16);
                        padding: 16px;
                    }
                    .pm-print {
                        flex: none;
                        aspect-ratio: 16 / 10;
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    .pm-panel,
                    .pm-backdrop {
                        animation: none !important;
                    }
                }
            `}</style>
        </div>,
        document.body
    );
}
