"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Code, Camera, Image as ImageIcon, Phone, Mail, MapPin, Send, Linkedin, Github, Instagram, X, Copy, Check, MousePointer, ExternalLink, RotateCcw, Play } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Footer from "@/components/Home/Footer";
import CopyButton from "@/components/Home/CopyButton";

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

const PRESETS = [
    { width: 280, yOffset: -220, rotateZ: -2, rotateY: 5 },
    { width: 300, yOffset: 150, rotateZ: 3, rotateY: -4 },
    { width: 270, yOffset: -80, rotateZ: -1, rotateY: 3 },
    { width: 320, yOffset: 240, rotateZ: 2, rotateY: -5 },
    { width: 280, yOffset: -180, rotateZ: -3, rotateY: 4 },
    { width: 290, yOffset: 80, rotateZ: 1, rotateY: -3 },
    { width: 310, yOffset: -250, rotateZ: 3, rotateY: 5 },
    { width: 280, yOffset: 190, rotateZ: -2, rotateY: -4 },
    { width: 300, yOffset: -50, rotateZ: 2, rotateY: 3 },
    { width: 280, yOffset: 120, rotateZ: -1, rotateY: -3 },
    { width: 270, yOffset: -160, rotateZ: -2, rotateY: 4 },
    { width: 320, yOffset: 210, rotateZ: 3, rotateY: -5 },
    { width: 260, yOffset: -120, rotateZ: -3, rotateY: 3 },
    { width: 300, yOffset: 60, rotateZ: 1, rotateY: -4 },
    { width: 280, yOffset: -200, rotateZ: 2, rotateY: 5 }
];

export default function SnippetsGalleryDetails() {
    const router = useRouter();
    const { theme } = useTheme();
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [settings, setSettings] = useState({
        hero_title: "Snippet Gallery",
        hero_subtitle: "Curated Reusable Code Gallery",
        hero_value_prop: "A comprehensive vault of reusable code fragments and helper utilities built to optimize workflow efficiency, speed up development, and maintain high standards of code quality.",
        hero_image_url: "/assets/projectHeader.jpg"
    });
    const [loading, setLoading] = useState(true);
    const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
    const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
    const [isPopupDragging, setIsPopupDragging] = useState(false);
    const [popupDragStart, setPopupDragStart] = useState({ x: 0, y: 0 });
    const [copied, setCopied] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState("");
    const [isAvailable, setIsAvailable] = useState(false);

    // Canvas panning states
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const galleryRef = useRef<HTMLElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 }); // x: rotateX (pitch), y: rotateY (yaw)
    const [isDragging, setIsDragging] = useState(false);
    const [isRecentering, setIsRecentering] = useState(false);
    const [hasDragged, setHasDragged] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const velRef = useRef({ x: 0, y: 0 });
    const posRef = useRef({ x: 0, y: 0 });
    const animFrameRef = useRef<number | null>(null);

    // Fetch data
    useEffect(() => {
        const fetchAllData = async () => {
            const startTime = Date.now();
            try {
                const [snipRes, profRes, setRes] = await Promise.all([
                    fetch("/api/snippets"),
                    fetch("/api/profile"),
                    fetch("/api/snippets-settings")
                ]);

                const snipData = snipRes.ok ? await snipRes.json() : [];
                const profData = profRes.ok ? await profRes.json() : null;
                const setData = setRes.ok ? await setRes.json() : null;

                if (Array.isArray(snipData)) setSnippets(snipData);
                if (profData && !profData.error) setProfile(profData);
                if (setData && !setData.error) setSettings(setData);

                // Enforce minimum 3 second loading delay for smooth transitions
                const elapsed = Date.now() - startTime;
                const remainingDelay = Math.max(0, 3000 - elapsed);
                if (remainingDelay > 0) {
                    await new Promise((resolve) => setTimeout(resolve, remainingDelay));
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();

        // Update KL time
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZoneName: 'short',
                timeZone: 'Asia/Kuala_Lumpur'
            });
            setCurrentTime(timeString);

            const klTime = new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                hour12: false,
                timeZone: 'Asia/Kuala_Lumpur'
            }).format(now);
            const hour = parseInt(klTime);
            setIsAvailable(hour >= 9 && hour < 20);
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    // Center canvas (start looking at angle 0)
    useEffect(() => {
        setRotation({ x: 0, y: 0 });
        posRef.current = { x: 0, y: 0 };
    }, []);

    // Handle Drag & Pan Events
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a') || target.closest('.copy-btn-panel') || target.closest('.copy-target')) return;

        setIsDragging(true);
        setHasDragged(false);
        setIsRecentering(false);
        setDragStart({ x: e.clientX, y: e.clientY });
        setDragOffset({ x: rotation.x, y: rotation.y });

        velRef.current = { x: 0, y: 0 };
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            setHasDragged(true);
        }

        // Yaw (Y-rotation) from dx, Pitch (X-rotation) from dy
        const nextRotY = dragOffset.y + dx * 0.15;
        let nextRotX = dragOffset.x - dy * 0.15;

        // Clamp Pitch to prevent turning upside down
        nextRotX = Math.max(-30, Math.min(30, nextRotX));

        velRef.current = {
            x: nextRotX - posRef.current.x,
            y: nextRotY - posRef.current.y
        };

        posRef.current = { x: nextRotX, y: nextRotY };
        setRotation({ x: nextRotX, y: nextRotY });
    };

    const handleMouseUp = () => {
        if (!isDragging) return;
        setIsDragging(false);

        const decay = () => {
            const friction = 0.95;
            velRef.current.x *= friction;
            velRef.current.y *= friction;

            let nextRotX = posRef.current.x + velRef.current.x;
            let nextRotY = posRef.current.y + velRef.current.y;

            nextRotX = Math.max(-30, Math.min(30, nextRotX));

            posRef.current = { x: nextRotX, y: nextRotY };
            setRotation({ x: nextRotX, y: nextRotY });

            if (Math.abs(velRef.current.x) > 0.05 || Math.abs(velRef.current.y) > 0.05) {
                animFrameRef.current = requestAnimationFrame(decay);
            } else {
                animFrameRef.current = null;
            }
        };

        animFrameRef.current = requestAnimationFrame(decay);
    };

    const handleRecenter = () => {
        setIsRecentering(true);
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        velRef.current = { x: 0, y: 0 };
        posRef.current = { x: 0, y: 0 };
        setRotation({ x: 0, y: 0 });
        setTimeout(() => {
            setIsRecentering(false);
        }, 600);
    };

    // Global Listeners for dragging mouse out of boundaries
    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, dragStart, dragOffset]);

    // Touch Support for Mobile Dragging
    const handleTouchStart = (e: React.TouchEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a') || target.closest('.copy-btn-panel') || target.closest('.copy-target')) return;

        const touch = e.touches[0];
        setIsDragging(true);
        setHasDragged(false);
        setIsRecentering(false);
        setDragStart({ x: touch.clientX, y: touch.clientY });
        setDragOffset({ x: rotation.x, y: rotation.y });

        velRef.current = { x: 0, y: 0 };
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const touch = e.touches[0];

        const dx = touch.clientX - dragStart.x;
        const dy = touch.clientY - dragStart.y;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            setHasDragged(true);
        }

        const nextRotY = dragOffset.y + dx * 0.2;
        let nextRotX = dragOffset.x - dy * 0.2;

        nextRotX = Math.max(-30, Math.min(30, nextRotX));

        velRef.current = {
            x: nextRotX - posRef.current.x,
            y: nextRotY - posRef.current.y
        };

        posRef.current = { x: nextRotX, y: nextRotY };
        setRotation({ x: nextRotX, y: nextRotY });
    };

    const handleTouchEnd = () => {
        handleMouseUp();
    };

    const handlePopupMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('pre') || target.closest('code') || target.closest('a') || target.closest('.tag-pill') || target.closest('video')) return;

        setIsPopupDragging(true);
        setPopupDragStart({
            x: e.clientX,
            y: e.clientY
        });
    };

    const handlePopupMouseMove = (e: MouseEvent) => {
        if (!isPopupDragging) return;
        const dx = e.clientX - popupDragStart.x;
        const dy = e.clientY - popupDragStart.y;

        setPopupDragStart({
            x: e.clientX,
            y: e.clientY
        });

        setPopupStyle(prev => {
            const currentLeft = parseFloat(prev.left as string) || 0;
            const currentTop = parseFloat(prev.top as string) || 0;
            return {
                ...prev,
                left: `${currentLeft + dx}px`,
                top: `${currentTop + dy}px`
            };
        });
    };

    const handlePopupMouseUp = () => {
        setIsPopupDragging(false);
    };

    const handlePopupTouchStart = (e: React.TouchEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('pre') || target.closest('code') || target.closest('a') || target.closest('.tag-pill') || target.closest('video')) return;

        const touch = e.touches[0];
        setIsPopupDragging(true);
        setPopupDragStart({
            x: touch.clientX,
            y: touch.clientY
        });
    };

    const handlePopupTouchMove = (e: React.TouchEvent) => {
        if (!isPopupDragging) return;
        const touch = e.touches[0];
        const dx = touch.clientX - popupDragStart.x;
        const dy = touch.clientY - popupDragStart.y;

        setPopupDragStart({
            x: touch.clientX,
            y: touch.clientY
        });

        setPopupStyle(prev => {
            const currentLeft = parseFloat(prev.left as string) || 0;
            const currentTop = parseFloat(prev.top as string) || 0;
            return {
                ...prev,
                left: `${currentLeft + dx}px`,
                top: `${currentTop + dy}px`
            };
        });
    };

    const handlePopupTouchEnd = () => {
        setIsPopupDragging(false);
    };

    useEffect(() => {
        if (isPopupDragging) {
            window.addEventListener("mousemove", handlePopupMouseMove);
            window.addEventListener("mouseup", handlePopupMouseUp);
        } else {
            window.removeEventListener("mousemove", handlePopupMouseMove);
            window.removeEventListener("mouseup", handlePopupMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handlePopupMouseMove);
            window.removeEventListener("mouseup", handlePopupMouseUp);
        };
    }, [isPopupDragging, popupDragStart]);

    // Copy Code Utility
    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // Format Date
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "JUNE 2026";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
    };

    // Basic Tokenizer for Mini Code Highlight Thumbnails
    const highlightThumbnail = (code: string) => {
        const lines = code.split("\n").slice(0, 7).join("\n");
        let html = lines
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const keywords = /\b(const|let|var|function|return|import|export|from|default|class|extends|if|else|for|while|async|await|try|catch|new|this|typeof|void|public|private)\b/g;
        const strings = /(["'`])(.*?)\1/g;
        const numbers = /\b(\d+)\b/g;
        const comments = /(\/\/.*|\/\*[\s\S]*?\*\/)/g;
        const functions = /\b([a-zA-Z_]\w*)(?=\()/g;

        html = html
            .replace(comments, '<span class="tok-comment">$1</span>')
            .replace(strings, '<span class="tok-string">$1$2$1</span>')
            .replace(keywords, '<span class="tok-keyword">$1</span>')
            .replace(functions, '<span class="tok-function">$1</span>')
            .replace(numbers, '<span class="tok-number">$1</span>');

        return <code dangerouslySetInnerHTML={{ __html: html }} />;
    };

    // Full Highlighter for Slide-in Panel
    const highlightFullCode = (code: string) => {
        let html = code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const keywords = /\b(const|let|var|function|return|import|export|from|default|class|extends|if|else|for|while|async|await|try|catch|new|this|typeof|void|public|private|string|number|boolean|any|unknown|never|null|undefined)\b/g;
        const strings = /(["'`])(.*?)\1/g;
        const numbers = /\b(\d+)\b/g;
        const comments = /(\/\/.*|\/\*[\s\S]*?\*\/)/g;
        const functions = /\b([a-zA-Z_]\w*)(?=\()/g;

        html = html
            .replace(comments, '<span class="tok-comment">$1</span>')
            .replace(strings, '<span class="tok-string">$1$2$1</span>')
            .replace(keywords, '<span class="tok-keyword">$1</span>')
            .replace(functions, '<span class="tok-function">$1</span>')
            .replace(numbers, '<span class="tok-number">$1</span>');

        return html;
    };

    const handleBackToHome = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push("/#snippets");
    };

    const geoBars = (
        <div className="bg-animation-container">
            <div className="geo-bar geo-1"></div>
            <div className="geo-bar geo-2"></div>
            <div className="geo-bar geo-4"></div>
            <div className="geo-bar geo-6"></div>
            <div className="geo-bar geo-8"></div>
        </div>
    );

    // Dynamic math for 3D Cylinder radius and perspective viewport based on snippet card count
    const N = snippets.length || 1;
    const targetArcDistance = 340; // Target distance in px between cards
    const totalSlots = N + 1; // +1 slot for the center header
    const dynamicRadius = Math.max(800, (totalSlots * targetArcDistance) / (2 * Math.PI));
    const dynamicPerspective = Math.max(700, dynamicRadius * 0.8);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7fafc]" style={{ background: 'radial-gradient(circle at center, #ffffff 0%, #f7fafc 70%, #edf2f7 100%)' }}>
                <div className="flex flex-col items-center gap-4">
                    {/* Minimalist modern loader ring with Code icon inside matching portfolio theme */}
                    <div className="relative flex items-center justify-center w-14 h-14 mb-2">
                        <div className="absolute inset-0 rounded-full border-[3px] border-black/5 border-t-black animate-spin"></div>
                        <Code size={20} className="text-black/80" />
                    </div>
                    <div className="animate-pulse text-[#1a202c] text-xs font-semibold tracking-[0.25em] uppercase" style={{ fontFamily: "var(--font-display), sans-serif" }}>
                        Entering Museum Gallery
                    </div>
                </div>
            </div>
        );
    }

    const renderTitle = (title: string) => {
        if (!title) return "Snippet Gallery";
        const words = title.split(" ");
        if (words.length <= 1) return title;
        const lastWord = words[words.length - 1];
        const otherWords = words.slice(0, -1).join(" ");
        return (
            <>
                {otherWords} <span className="name-gradient">{lastWord}</span>
            </>
        );
    };

    const getPlaygroundUrl = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes("clipboard") || t.includes("copy")) {
            return "/snippet-playground/preview-clipboard.html";
        }
        if (t.includes("debounce") || t.includes("cancel")) {
            return "/snippet-playground/preview-debounce.html";
        }
        if (t.includes("glass") || t.includes("morphism")) {
            return "/snippet-playground/preview-glass.html";
        }
        return "/snippet-playground/index.html"; // Default fallback
    };

    const handleOpenCodes = (e: React.MouseEvent, snippet: Snippet) => {
        e.stopPropagation();
        if (isDragging || hasDragged) return; // Prevent selection if dragging canvas

        const cardWrapper = e.currentTarget.closest(".gallery-card");
        if (!cardWrapper) return;
        const cardEl = cardWrapper.querySelector(".gallery-card-inner") || cardWrapper;

        const rect = cardEl.getBoundingClientRect();
        const galleryEl = galleryRef.current;
        if (galleryEl) {
            const galleryRect = galleryEl.getBoundingClientRect();
            const cardTopInGallery = rect.top - galleryRect.top;
            const cardLeftInGallery = rect.left - galleryRect.left;

            let left = cardLeftInGallery + rect.width + 20;
            let top = cardTopInGallery;

            const popupWidth = 480;
            const estimatedHeight = 650;
            const gap = 20;

            const spaceOnRight = galleryRect.width - (cardLeftInGallery + rect.width);
            const spaceOnLeft = cardLeftInGallery;

            if (spaceOnRight >= popupWidth + gap) {
                left = cardLeftInGallery + rect.width + gap;
            } else if (spaceOnLeft >= popupWidth + gap) {
                left = cardLeftInGallery - popupWidth - gap;
            } else {
                left = (galleryRect.width - popupWidth) / 2;
            }

            left = Math.max(gap, Math.min(galleryRect.width - popupWidth - gap, left));

            if (typeof window !== "undefined") {
                if (window.innerWidth < 600) {
                    left = Math.max(gap, (galleryRect.width - popupWidth) / 2);
                }
            }

            const cardCenterY = cardTopInGallery + rect.height / 2;
            top = cardCenterY - estimatedHeight / 2;

            top = Math.max(gap, Math.min(galleryRect.height - estimatedHeight - gap, top));

            setPopupStyle({
                left: `${left}px`,
                top: `${top}px`
            });
        }

        setSelectedSnippet(snippet);
    };

    return (
        <div className="min-h-screen relative overflow-x-hidden bg-black text-white">
            {/* Hero Section */}
            <section 
                id="home" 
                className="hero hero-projects transition-all duration-700"
                style={{
                    backgroundImage: theme === 'dark'
                        ? `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.95)), url(${settings.hero_image_url || '/assets/projectHeader.jpg'})`
                        : `linear-gradient(rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.85)), url(${settings.hero_image_url || '/assets/projectHeader.jpg'})`
                }}
            >
                <Link
                    href="/#snippets"
                    className="unq-portal-link unq-portal-fixed"
                    onClick={handleBackToHome}
                >
                    <div className="unq-portal-icon-wrapper">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="unq-portal-text">BACK TO HOME</span>
                </Link>

                <div className="container">
                    <div className="hero-content">
                        <h1>{renderTitle(settings.hero_title || "Snippet Gallery")}</h1>
                        <p className="subtitle">{settings.hero_subtitle || "Curated Reusable Code Gallery"}</p>
                        <p className="value-prop">
                            {settings.hero_value_prop || "A comprehensive vault of reusable code fragments and helper utilities built to optimize workflow efficiency, speed up development, and maintain high standards of code quality."}
                        </p>

                        <div className="hero-stats">
                            <div className="stat-card">
                                <div className="stat-icon-wrapper">
                                    <Code size={24} className="stat-icon" />
                                </div>
                                <div className="stat-info">
                                    <h3>{snippets.length}+</h3>
                                    <p>Total Snippets</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon-wrapper">
                                    <LucideIcons.Binary size={24} className="stat-icon" />
                                </div>
                                <div className="stat-info">
                                    <h3>{Array.from(new Set(snippets.map(s => s.language.toLowerCase()))).length}</h3>
                                    <p>Languages Used</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon-wrapper">
                                    <LucideIcons.Folders size={24} className="stat-icon" />
                                </div>
                                <div className="stat-info">
                                    <h3>{Array.from(new Set(snippets.map(s => (s.category || "utility").toLowerCase()))).length}</h3>
                                    <p>Categories</p>
                                </div>
                            </div>
                        </div>

                        <div className="cta-buttons">
                            <a href="#gallery" className="btn btn-work group">
                                Explore Gallery
                                <svg className="icon-svg ml-2 group-hover:translate-y-1 transition-transform" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none">
                                    <path d="M7 13l5 5 5-5M12 6v12"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Asymmetric 3D Gallery Wall canvas */}
            <section id="gallery" className="gallery-section" ref={galleryRef}>
                <div 
                    className={`gallery-viewport ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                    ref={containerRef}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{
                        perspective: `${dynamicPerspective}px`
                    }}
                >
                    <div 
                        className="gallery-canvas"
                        ref={canvasRef}
                        style={{
                            transform: `translateZ(${dynamicPerspective}px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                            transition: isDragging 
                                ? "none" 
                                : isRecentering 
                                    ? "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)" 
                                    : "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)"
                        }}
                    >
                        {/* 3D Floor Plane */}
                        <div className="gallery-floor" />

                        {/* 3D Ceiling Plane */}
                        <div className="gallery-ceiling" />

                        {/* 3D Circumference Guiding Rings */}
                        <div className="gallery-ring" style={{ "--yOffset": -350, "--radius": dynamicRadius } as React.CSSProperties} />
                        <div className="gallery-ring" style={{ "--yOffset": 0, "--radius": dynamicRadius } as React.CSSProperties} />
                        <div className="gallery-ring" style={{ "--yOffset": 350, "--radius": dynamicRadius } as React.CSSProperties} />

                        {/* 3D Vertical Wireframe Pillars */}
                        {Array.from({ length: 12 }).map((_, idx) => {
                            const angle = (idx * 360) / 12;
                            return (
                                <div 
                                    key={`pillar-${idx}`} 
                                    className="gallery-pillar" 
                                    style={{ 
                                        "--angle": angle, 
                                        "--radius": dynamicRadius 
                                    } as React.CSSProperties} 
                                />
                            );
                        })}

                        {/* Elegant museum-style title positioned in 3D space at angle = 0 */}
                        <div 
                            className="gallery-center-header-3d"
                            style={{
                                "--angle": 0,
                                "--radius": dynamicRadius,
                                "--yOffset": -50,
                                "--rotZ": 0,
                                "--rotY": 0
                            } as React.CSSProperties}
                        >
                            <h2>Code Snippets</h2>
                            <div className="drag-indicator">
                                <svg className="w-5 h-5 opacity-40 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                </svg>
                                <span>DRAG TO ROTATE 360°</span>
                            </div>
                        </div>

                        {/* Scattered asymmetric 3D cards placed on the cylinder wall */}
                        {snippets.map((snippet, idx) => {
                            const preset = PRESETS[idx % PRESETS.length];
                            const totalSlots = snippets.length + 1;
                            const angleStep = 360 / totalSlots;
                            const angle = (idx + 1) * angleStep;

                            return (
                                <div
                                    key={snippet.id}
                                    className="gallery-card-wrapper gallery-card"
                                    style={{
                                        width: `${preset.width}px`,
                                        "--angle": angle,
                                        "--radius": dynamicRadius,
                                        "--yOffset": preset.yOffset,
                                        "--rotZ": preset.rotateZ,
                                        "--rotY": preset.rotateY
                                    } as React.CSSProperties}
                                >
                                    <div className="gallery-card-inner">
                                        <div className="gallery-card-header">
                                            <span className="lang-tag">{snippet.language}</span>
                                            <span className="cat-tag">{snippet.category || "utility"}</span>
                                        </div>
                                        
                                        {/* Stylized preview outcome thumbnail or default icon */}
                                        <div className="gallery-card-thumbnail">
                                            {snippet.preview_image_url ? (
                                                snippet.preview_image_url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                                    <video
                                                        src={snippet.preview_image_url}
                                                        className="w-full h-full object-cover"
                                                        muted
                                                        autoPlay
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
                                                <div className="default-preview-icon">
                                                    <Code size={32} className="opacity-70 stroke-[1.8]" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="gallery-card-info">
                                            <h3>{snippet.title}</h3>
                                        </div>
                                    </div>

                                    {/* Hover Actions Popout Wrapper (beside card, behind card) */}
                                    <div className={`card-popout-actions side-${(snippet.title.charCodeAt(0) + idx) % 2 === 0 ? "left" : "right"}`}>
                                        <button
                                            className="action-btn btn-codes"
                                            onClick={(e) => handleOpenCodes(e, snippet)}
                                            title="View Codes"
                                        >
                                            <Code size={16} />
                                            <span className="btn-label">Codes</span>
                                        </button>
                                        <a
                                            href={getPlaygroundUrl(snippet.title)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="action-btn btn-playground"
                                            onClick={(e) => e.stopPropagation()}
                                            title="Open Playground"
                                        >
                                            <Play size={16} />
                                            <span className="btn-label">Playground</span>
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Recenter Button (fades in when camera is rotated) */}
                    <button 
                        className={`recenter-btn ${Math.abs(rotation.x) > 0.5 || Math.abs(rotation.y) > 0.5 ? "visible" : ""}`}
                        onClick={handleRecenter}
                        title="Recenter view"
                    >
                        <RotateCcw size={16} />
                        <span>Recenter View</span>
                    </button>
                </div>

                {/* Slide-in details panel */}
                <div className={`slide-panel-backdrop ${selectedSnippet ? "active" : ""}`} onClick={() => setSelectedSnippet(null)} />
                <div 
                    className={`slide-panel ${selectedSnippet ? "active" : ""} ${isPopupDragging ? "dragging" : ""}`} 
                    style={popupStyle}
                    onMouseDown={handlePopupMouseDown}
                    onTouchStart={handlePopupTouchStart}
                    onTouchMove={handlePopupTouchMove}
                    onTouchEnd={handlePopupTouchEnd}
                >
                    {selectedSnippet && (
                        <div className="panel-container">
                            <button className="panel-close" onClick={() => setSelectedSnippet(null)}>
                                <X size={24} />
                            </button>
                            
                            <div className="panel-content custom-scrollbar">
                                <div className="panel-header-badge">
                                    <span className="lang-badge uppercase font-bold tracking-wider">{selectedSnippet.language}</span>
                                    <span className="cat-badge uppercase font-bold tracking-wider">{selectedSnippet.category || "utility"}</span>
                                </div>

                                <h2 className="panel-title">{selectedSnippet.title}</h2>
                                <p className="panel-date">{formatDate(selectedSnippet.created_at)}</p>

                                <div className="panel-section">
                                    <h3 className="section-title">Description</h3>
                                    <p className="panel-desc leading-relaxed">{selectedSnippet.description}</p>
                                </div>

                                {selectedSnippet.tags && (
                                    <div className="panel-section">
                                        <h3 className="section-title">Tags</h3>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedSnippet.tags.split(",").map((tag) => (
                                                <span key={tag} className="tag-pill">#{tag.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Preview File Outcome rendering */}
                                {selectedSnippet.preview_image_url && (
                                    <div className="panel-section">
                                        <h3 className="section-title">Preview Outcome</h3>
                                        <div className="panel-preview-wrapper mt-3 rounded-xl overflow-hidden border border-[#222]">
                                            {selectedSnippet.preview_image_url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                                <video
                                                    src={selectedSnippet.preview_image_url}
                                                    className="w-full object-cover aspect-video"
                                                    controls
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                />
                                            ) : (
                                                <img
                                                    src={selectedSnippet.preview_image_url}
                                                    alt={selectedSnippet.title}
                                                    className="w-full object-contain max-h-[300px] bg-black/40"
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Full Syntax Highlighted Code block with copy button */}
                                <div className="panel-section relative mt-8">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="section-title my-0">Code Snippet</h3>
                                        <button
                                            onClick={() => handleCopy(selectedSnippet.code)}
                                            className="copy-btn-panel flex items-center rounded-full transition-all duration-200"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check size={14} />
                                                    <span>Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={14} />
                                                    <span>Copy Code</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="code-block-panel-wrapper rounded-xl overflow-hidden border border-slate-200 bg-[#f8fafc] mt-4 mb-6">
                                        <div className="code-header-bar flex items-center gap-1.5 px-5 py-2.5 bg-slate-100/80 border-b border-slate-200">
                                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70"></span>
                                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"></span>
                                            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70"></span>
                                            <span className="ml-auto text-[10px] uppercase font-bold tracking-widest opacity-50 text-slate-500">{selectedSnippet.language}</span>
                                        </div>
                                        <pre className="p-5 overflow-x-auto custom-scrollbar" style={{ maxHeight: "400px", margin: 0 }}>
                                            <code 
                                                className="text-xs font-mono leading-relaxed select-all block text-slate-800 mt-2" 
                                                style={{ fontFamily: "'Geist Mono', monospace", whiteSpace: "pre", tabSize: 2 }}
                                                dangerouslySetInnerHTML={{ __html: highlightFullCode(selectedSnippet.code) }}
                                            />
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Let's Work Together & Contact Section */}
            {profile && (
                <div className="milestones-unified-wrapper">
                    <section id="contact" className="section-high-fidelity">
                        {geoBars}
                        <div className="container" style={{ maxWidth: "1200px" }}>
                            <div className="section-header">
                                <h2 className="milestone-main-title">Let's Work Together</h2>
                                <p className="section-subtitle">Ready to bring your ideas to life? Let's discuss your next project and create something amazing together.</p>
                            </div>

                            <div className="contact-grid">
                                <div className="contact-main-card">
                                    <div className="card-header">
                                        <div className="card-title-group">
                                            <h3>Contact Information</h3>
                                            <p>Let's connect and build something amazing together</p>
                                        </div>
                                        <div className="card-status">
                                            <span className="time">{currentTime || "06:40 PM MYT"}</span>
                                            <span className={`status-badge ${!isAvailable ? 'after-hours' : ''}`}>
                                                {isAvailable ? "Available Now" : "After Hours"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="info-grid">
                                        {/* Phone */}
                                        <div className="info-item">
                                            <CopyButton text={profile.phone || "+6019-7952427"} />
                                            <div className="icon-box phone-bg">
                                                <Phone size={24} />
                                            </div>
                                            <div className="info-content">
                                                <h4>Phone Number</h4>
                                                <a href={`tel:${profile.phone || "+60197952427"}`} className="copy-target">{profile.phone || "+6019-7952427"}</a>
                                                <p>Available 9 AM - 8 PM MYT</p>
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="info-item">
                                            <CopyButton text={profile.email || "naufalnizam25@gmail.com"} />
                                            <div className="icon-box email-bg">
                                                <Mail size={24} />
                                            </div>
                                            <div className="info-content">
                                                <h4>Email Address</h4>
                                                <a href={`mailto:${profile.email || "naufalnizam25@gmail.com"}`} className="copy-target text-xs sm:text-base">{profile.email || "naufalnizam25@gmail.com"}</a>
                                                <p>Professional inquiries welcome</p>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="info-item">
                                            <CopyButton text={profile.location || "Ayer Keroh, Melaka, Malaysia"} />
                                            <div className="icon-box location-bg">
                                                <MapPin size={24} />
                                            </div>
                                            <div className="info-content">
                                                <h4>Location</h4>
                                                <p className="copy-target">{profile.location || "Ayer Keroh, Melaka, Malaysia"}</p>
                                                <p>GMT+8 Timezone</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="contact-side-grid">
                                    {/* Socials */}
                                    <div className="contact-card social-card" style={{ paddingBottom: "25px" }}>
                                        <h3>Social Media</h3>
                                        <p>Follow me on social platforms</p>
                                        <div className="social-list-alt">
                                            <a href={profile.linkedin_url || "https://www.linkedin.com/in/muhammad-naufal-bin-mohd-nizam-0603b2279"} target="_blank" className="social-item-alt">
                                                <div className="social-icon-box">
                                                    <Linkedin size={20} />
                                                </div>
                                                <div className="social-text-group">
                                                    <span className="name">LinkedIn</span>
                                                    <span className="sub">Professional network</span>
                                                </div>
                                            </a>
                                            <a href={profile.github_url || "https://github.com/sunquickpapi"} target="_blank" className="social-item-alt">
                                                <div className="social-icon-box">
                                                    <Github size={20} />
                                                </div>
                                                <div className="social-text-group">
                                                    <span className="name">GitHub</span>
                                                    <span className="sub">Code repositories</span>
                                                </div>
                                            </a>
                                            {profile.instagram_url && (
                                                <a href={profile.instagram_url} target="_blank" className="social-item-alt">
                                                    <div className="social-icon-box">
                                                        <Instagram size={20} />
                                                    </div>
                                                    <div className="social-text-group">
                                                        <span className="name">Instagram</span>
                                                        <span className="sub">Follow my journey</span>
                                                    </div>
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="contact-card actions-card" style={{ paddingBottom: "25px" }}>
                                        <h3>Quick Actions</h3>
                                        <p>Get in touch quickly</p>
                                        <div className="social-list-alt">
                                            <a href={`mailto:${profile.email || "naufalnizam25@gmail.com"}`} className="social-item-alt">
                                                <div className="social-icon-box inquiry-icon">
                                                    <Send size={20} />
                                                </div>
                                                <div className="social-text-group">
                                                    <span className="name font-bold">Send Inquiry</span>
                                                    <span className="sub">Start a conversation</span>
                                                </div>
                                            </a>
                                            <a href={`tel:${profile.phone || "+60197952427"}`} className="social-item-alt">
                                                <div className="social-icon-box">
                                                    <Phone size={20} />
                                                </div>
                                                <div className="social-text-group">
                                                    <span className="name font-bold">Quick Chat</span>
                                                    <span className="sub">Call me directly</span>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="availability-card" style={{ marginTop: "2rem" }}>
                                <div className="pulse-dot"></div>
                                <div className="availability-text">
                                    <h5>Currently available for new projects</h5>
                                    <p>Accepting freelance work and collaboration opportunities</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    <Footer />
                </div>
            )}

            <style jsx>{`
                /* Font import for Serif typography */
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');

                .gallery-section {
                    background: radial-gradient(circle at center, #ffffff 0%, #FAF9F6 70%, #E2DFD8 100%);
                    color: #111;
                    height: 100vh;
                    width: 100vw;
                    overflow: visible;
                    position: relative;
                    z-index: 10;
                    border-top: 1px solid rgba(0, 0, 0, 0.15);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.15);
                }

                .gallery-viewport {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    overflow: visible;
                    user-select: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                :global(.hero-projects) {
                    position: relative;
                    z-index: 20;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);
                    background-color: var(--color-bg-primary, #0a0a0a);
                }

                :global(.milestones-unified-wrapper) {
                    position: relative;
                    z-index: 20;
                    box-shadow: 0 -15px 35px rgba(0, 0, 0, 0.35);
                    background-color: var(--portfolio-bg, #0a0a0a);
                }

                .gallery-canvas {
                    width: 0px;
                    height: 0px;
                    position: absolute;
                    transform-style: preserve-3d;
                }

                /* 3D Environment elements style */
                .gallery-floor {
                    position: absolute;
                    width: 4000px;
                    height: 4000px;
                    top: 50%;
                    left: 50%;
                    margin-left: -2000px;
                    margin-top: -2000px;
                    background-image: 
                        linear-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 0, 0, 0.08) 1px, transparent 1px);
                    background-size: 80px 80px;
                    background-position: center;
                    transform: translateY(400px) rotateX(90deg);
                    transform-style: preserve-3d;
                    pointer-events: none;
                }

                .gallery-ceiling {
                    position: absolute;
                    width: 4000px;
                    height: 4000px;
                    top: 50%;
                    left: 50%;
                    margin-left: -2000px;
                    margin-top: -2000px;
                    background-image: 
                        linear-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 0, 0, 0.08) 1px, transparent 1px);
                    background-size: 80px 80px;
                    background-position: center;
                    transform: translateY(-400px) rotateX(90deg);
                    transform-style: preserve-3d;
                    pointer-events: none;
                }

                .gallery-ring {
                    position: absolute;
                    width: calc(var(--radius) * 2 * 1px);
                    height: calc(var(--radius) * 2 * 1px);
                    left: 50%;
                    top: 50%;
                    margin-left: calc(var(--radius) * -1 * 1px);
                    margin-top: calc(var(--radius) * -1 * 1px);
                    border: 1px dashed rgba(0, 0, 0, 0.2);
                    border-radius: 50%;
                    transform-style: preserve-3d;
                    transform: translateY(calc(var(--yOffset) * 1px)) rotateX(90deg);
                    pointer-events: none;
                }

                .gallery-pillar {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 1px;
                    height: 1200px;
                    background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.06) 10%, rgba(0, 0, 0, 0.15) 50%, rgba(0, 0, 0, 0.06) 90%, transparent);
                    transform-style: preserve-3d;
                    transform: translate(-50%, -50%) rotateY(calc(var(--angle) * 1deg)) translateZ(calc(var(--radius) * -1px));
                    pointer-events: none;
                }

                /* Museum heading styling placed in 3D Cylinder */
                .gallery-center-header-3d {
                    position: absolute;
                    left: 0;
                    top: 0;
                    transform-style: preserve-3d;
                    transform: translate(-50%, -50%) rotateY(calc(var(--angle) * 1deg)) translateZ(calc(var(--radius) * -1px)) translateY(calc(var(--yOffset) * 1px));
                    text-align: center;
                    pointer-events: none;
                    z-index: 1;
                    width: 600px;
                }

                .gallery-center-header-3d h2 {
                    font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
                    font-size: 4.5rem;
                    font-weight: 700;
                    color: #000;
                    margin: 0 0 1rem 0;
                    letter-spacing: -0.02em;
                    line-height: 1.1;
                }

                .drag-indicator {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 0.2em;
                    color: rgba(0, 0, 0, 0.4);
                    text-transform: uppercase;
                }

                /* scattered asymmetric cards styling placed in 3D cylinder */
                .gallery-card-wrapper {
                    position: absolute;
                    left: 0;
                    top: 0;
                    transform-style: preserve-3d;
                    transform: translate(-50%, -50%) rotateY(calc(var(--angle) * 1deg)) translateZ(calc(var(--radius) * -1px)) translateY(calc(var(--yOffset) * 1px)) rotateZ(calc(var(--rotZ) * 1deg)) rotateY(calc(var(--rotY) * 1deg));
                    cursor: pointer;
                    z-index: 10;
                    /* Apply 1.2s delay before card pops down when mouse leaves */
                    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 1.2s, z-index 0.4s ease 1.2s;
                }

                .gallery-card-wrapper:hover {
                    transform: translate(-50%, -50%) rotateY(calc(var(--angle) * 1deg)) translateZ(calc((var(--radius) - 100) * -1px)) translateY(calc(var(--yOffset) * 1px)) rotateZ(0deg) rotateY(0deg) scale(1.08);
                    z-index: 50;
                    /* Instant pop up transition with no delay when mouse enters */
                    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0s, z-index 0s ease 0s;
                }

                .gallery-card-inner {
                    background: #ffffff;
                    padding: 1rem;
                    border-radius: 12px;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.07), 0 5px 15px rgba(0, 0, 0, 0.04);
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    position: relative;
                    z-index: 2;
                }

                .gallery-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .lang-tag {
                    font-size: 9px;
                    font-weight: 800;
                    text-transform: uppercase;
                    background: rgba(58, 153, 201, 0.1);
                    color: #3A99C9;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    letter-spacing: 0.05em;
                }

                .cat-tag {
                    font-size: 9px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: rgba(0, 0, 0, 0.4);
                    letter-spacing: 0.05em;
                }

                .gallery-card-thumbnail {
                    background: #0f172a;
                    border-radius: 8px;
                    overflow: hidden;
                    height: 120px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .gallery-card-thumbnail img,
                .gallery-card-thumbnail video,
                .gallery-card-thumbnail .default-preview-icon {
                    pointer-events: none;
                }

                /* Popout actions positioned beside the card, appearing from behind */
                .card-popout-actions {
                    position: absolute;
                    top: 50%;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    opacity: 0;
                    pointer-events: none;
                    /* Apply 1.2s delay before buttons fade/slide back and lose pointer events */
                    transition: opacity 0.3s ease 1.2s, left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s, right 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s, pointer-events 0s ease 1.2s;
                    z-index: 1;
                    transform-style: preserve-3d;
                }

                /* Invisible bridge to prevent mouse-leave events in the 16px gap between card and buttons */
                .card-popout-actions::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 24px;
                    z-index: -1;
                }

                .card-popout-actions.side-left::before {
                    left: 100%;
                }

                .card-popout-actions.side-right::before {
                    right: 100%;
                }

                .card-popout-actions.side-left {
                    right: 40%;
                    transform: translate(50%, -50%) scale(0.6) translateZ(-8px);
                    align-items: flex-end;
                }

                .gallery-card-wrapper:hover .card-popout-actions.side-left {
                    opacity: 1;
                    right: calc(100% + 16px);
                    transform: translate(0, -50%) scale(1) translateZ(-8px);
                    pointer-events: auto;
                    /* Instant pop out with no delay when card is hovered */
                    transition: opacity 0.3s ease 0s, left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0s, right 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0s, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0s, pointer-events 0s ease 0s;
                }

                .card-popout-actions.side-right {
                    left: 40%;
                    transform: translate(-50%, -50%) scale(0.6) translateZ(-8px);
                    align-items: flex-start;
                }

                .gallery-card-wrapper:hover .card-popout-actions.side-right {
                    opacity: 1;
                    left: calc(100% + 16px);
                    transform: translate(0, -50%) scale(1) translateZ(-8px);
                    pointer-events: auto;
                    /* Instant pop out with no delay when card is hovered */
                    transition: opacity 0.3s ease 0s, left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0s, right 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0s, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0s, pointer-events 0s ease 0s;
                }

                .action-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 42px;
                    height: 42px;
                    border-radius: 21px;
                    background: #ffffff;
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    color: #1a202c;
                    cursor: pointer;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
                    text-decoration: none;
                }

                :global(.admin-dark-mode) .action-btn {
                    background: #0f172a;
                    border-color: rgba(255, 255, 255, 0.08);
                    color: #f1f5f9;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }

                .action-btn:hover {
                    background: #3A99C9;
                    border-color: #3A99C9;
                    color: #ffffff;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(58, 153, 201, 0.3);
                }

                /* Explicit SVG styling to fix browser 3D rendering and color inheritance quirks */
                .action-btn :global(svg) {
                    color: #1a202c !important;
                    stroke: #1a202c !important;
                    display: block;
                    flex-shrink: 0;
                    position: relative;
                    z-index: 5;
                }

                .action-btn:hover :global(svg) {
                    color: #ffffff !important;
                    stroke: #ffffff !important;
                }

                :global(.admin-dark-mode) .action-btn :global(svg) {
                    color: #f1f5f9 !important;
                    stroke: #f1f5f9 !important;
                }

                .action-btn .btn-label {
                    opacity: 0;
                    width: 0;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    transition: opacity 0.2s ease, width 0.2s ease, margin-left 0.2s ease, margin-right 0.2s ease;
                    white-space: nowrap;
                    overflow: hidden;
                }

                /* Directional layouts for popping out left vs right */
                .side-right .action-btn {
                    flex-direction: row;
                }
                .side-right .btn-codes:hover {
                    width: 100px;
                    justify-content: flex-start;
                    padding-left: 14px;
                    padding-right: 0;
                }
                .side-right .btn-codes:hover .btn-label {
                    opacity: 1;
                    width: auto;
                    margin-left: 8px;
                    margin-right: 0;
                }
                .side-right .btn-playground:hover {
                    width: 135px;
                    justify-content: flex-start;
                    padding-left: 14px;
                    padding-right: 0;
                }
                .side-right .btn-playground:hover .btn-label {
                    opacity: 1;
                    width: auto;
                    margin-left: 8px;
                    margin-right: 0;
                }

                .side-left .action-btn {
                    flex-direction: row-reverse;
                }
                .side-left .btn-codes:hover {
                    width: 100px;
                    justify-content: flex-start;
                    padding-right: 14px;
                    padding-left: 0;
                }
                .side-left .btn-codes:hover .btn-label {
                    opacity: 1;
                    width: auto;
                    margin-right: 8px;
                    margin-left: 0;
                }
                .side-left .btn-playground:hover {
                    width: 135px;
                    justify-content: flex-start;
                    padding-right: 14px;
                    padding-left: 0;
                }
                .side-left .btn-playground:hover .btn-label {
                    opacity: 1;
                    width: auto;
                    margin-right: 8px;
                    margin-left: 0;
                }

                .default-preview-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    background: rgba(58, 153, 201, 0.05);
                    color: #3A99C9;
                    border-radius: 8px;
                    border: 1px dashed rgba(58, 153, 201, 0.25);
                }

                .gallery-card-thumbnail pre {
                    margin: 0;
                    font-family: 'Geist Mono', monospace;
                    font-size: 9px;
                    line-height: 1.4;
                    color: rgba(255, 255, 255, 0.85);
                    text-align: left;
                    width: 100%;
                    white-space: pre-wrap;
                    overflow: hidden;
                }

                .gallery-card-info h3 {
                    font-size: 0.95rem;
                    font-weight: 700;
                    margin: 0 0 0.25rem 0;
                    color: #111;
                    line-height: 1.3;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .view-link {
                    font-size: 9px;
                    font-weight: 800;
                    text-transform: uppercase;
                    color: #3A99C9;
                    letter-spacing: 0.05em;
                }

                /* Token Highlighting (Museum Style warm syntax for light theme) */
                :global(.tok-comment) { color: #64748b; font-style: italic; }
                :global(.tok-string) { color: #0f766e; }
                :global(.tok-keyword) { color: #7c3aed; font-weight: 700; }
                :global(.tok-function) { color: #2563eb; }
                :global(.tok-number) { color: #ea580c; }

                /* Slide-in details panel styling */
                .slide-panel-backdrop {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.12);
                    backdrop-filter: blur(4px);
                    z-index: 1000;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.4s ease;
                }

                .slide-panel-backdrop.active {
                    opacity: 1;
                    pointer-events: auto;
                }

                .slide-panel {
                    position: absolute;
                    width: 480px;
                    max-width: calc(100vw - 32px);
                    max-height: 80vh;
                    background: #ffffff;
                    color: #111111;
                    z-index: 1001;
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    opacity: 0;
                    transform: scale(0.95);
                    transition: opacity 0.3s cubic-bezier(0.25, 1, 0.5, 1), transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
                    pointer-events: none;
                    cursor: grab;
                }

                .slide-panel.dragging {
                    cursor: grabbing;
                }

                .slide-panel.active {
                    opacity: 1;
                    transform: scale(1);
                    pointer-events: auto;
                }

                .panel-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }

                .panel-close {
                    position: absolute;
                    top: 1.25rem;
                    right: 1.25rem;
                    background: rgba(0, 0, 0, 0.03);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    color: rgba(0, 0, 0, 0.4);
                    border-radius: 50%;
                    width: 2.25rem;
                    height: 2.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    z-index: 20;
                }

                .panel-close:hover {
                    background: rgba(0, 0, 0, 0.08);
                    color: #000;
                    transform: rotate(90deg);
                }

                .panel-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 3rem 2rem 2rem 2rem;
                }

                .panel-header-badge {
                    display: flex;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .lang-badge {
                    font-size: 10px;
                    background: rgba(58, 153, 201, 0.15);
                    color: #3A99C9;
                    padding: 0.35rem 0.8rem;
                    border-radius: 6px;
                    letter-spacing: 0.05em;
                }

                .cat-badge {
                    font-size: 10px;
                    background: rgba(0, 0, 0, 0.05);
                    color: rgba(0, 0, 0, 0.6);
                    padding: 0.35rem 0.8rem;
                    border-radius: 6px;
                    letter-spacing: 0.05em;
                }

                .panel-title {
                    font-size: 2.25rem;
                    font-weight: 900;
                    color: #111111;
                    margin: 0 0 0.5rem 0;
                    line-height: 1.2;
                }

                .panel-date {
                    font-size: 10px;
                    font-weight: 700;
                    color: rgba(0, 0, 0, 0.4);
                    margin: 0 0 2rem 0;
                    letter-spacing: 0.05em;
                }

                .panel-section {
                    margin-bottom: 2rem;
                }

                .panel-section .section-title {
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    color: rgba(0, 0, 0, 0.35);
                    letter-spacing: 0.1em;
                    margin-bottom: 0.75rem;
                    margin-top: 0;
                }

                .panel-desc {
                    color: rgba(0, 0, 0, 0.7);
                    font-size: 0.95rem;
                }

                .tag-pill {
                    font-size: 11px;
                    color: rgba(0, 0, 0, 0.6);
                    background: rgba(0, 0, 0, 0.03);
                    border: 1px solid rgba(0, 0, 0, 0.06);
                    padding: 0.25rem 0.6rem;
                    border-radius: 999px;
                }

                .copy-btn-panel {
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    color: #475569;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    border-radius: 99px;
                    padding: 0.45rem 1.25rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    line-height: 1;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .copy-btn-panel :global(svg) {
                    display: block;
                    flex-shrink: 0;
                }

                .copy-btn-panel:hover {
                    background: #3A99C9;
                    color: #ffffff;
                    border-color: #3A99C9;
                    box-shadow: 0 4px 12px rgba(58, 153, 201, 0.25);
                    transform: translateY(-1px);
                }

                .copy-btn-panel:active {
                    transform: translateY(0.5px);
                }

                .code-block-panel-wrapper {
                    margin-top: 1rem;
                    margin-bottom: 1.5rem;
                }

                .code-block-panel-wrapper code {
                    margin-top: 0.5rem;
                }

                /* custom scrollbar */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 99px;
                }

                .recenter-btn {
                    position: absolute;
                    bottom: 40px;
                    left: 50%;
                    transform: translateX(-50%) translateY(20px);
                    background: rgba(255, 255, 255, 0.9);
                    color: #111;
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    padding: 0.65rem 1.3rem;
                    border-radius: 99px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    z-index: 100;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease, transform 0.3s ease, background 0.2s ease, box-shadow 0.2s ease;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
                }

                .recenter-btn.visible {
                    opacity: 1;
                    pointer-events: auto;
                    transform: translateX(-50%) translateY(0);
                }

                .recenter-btn:hover {
                    background: #ffffff;
                    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12);
                    transform: translateX(-50%) scale(1.05);
                }

                .recenter-btn:active {
                    transform: translateX(-50%) scale(0.98);
                }

                /* Mobile responsiveness */
                @media (max-width: 992px) {
                    .gallery-center-header h2 {
                        font-size: 3rem;
                    }
                }

                @media (max-width: 600px) {
                    .panel-content {
                        padding: 3rem 1.25rem 1.25rem 1.25rem;
                    }
                    .panel-title {
                        font-size: 1.75rem;
                    }
                    .gallery-center-header h2 {
                        font-size: 2.25rem;
                    }
                }
            `}</style>
        </div>
    );
}
