"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Code, Camera, Image as ImageIcon, Phone, Mail, MapPin, Send, Linkedin, Github, Instagram, X, Copy, Check, MousePointer, ExternalLink, RotateCcw, Play, Info } from "lucide-react";
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
    playground_url?: string;
    integration_vanilla?: string;
    integration_react?: string;
    created_at: string;
}

interface Note {
    id: string;
    title: string;
    content: string;
    type: string;
    color: string;
    pinned: boolean;
    created_at: string;
}

const NOTE_TYPE_ICONS: Record<string, string> = {
    idea: "💡",
    bug: "🐛",
    todo: "✅",
    learning: "📚",
    reminder: "🔔",
    general: "📝",
};

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

// Reusable component to render a responsive, non-interactive iframe preview of the live demo
function ScaledPreviewIframe({
    src,
    title,
    baseWidth = 1200,
    baseHeight = 630,
    containerWidth,
}: {
    src: string;
    title: string;
    baseWidth?: number;
    baseHeight?: number;
    /** Pass the known layout width (px) to avoid measuring — safe for 3D-rotated cards */
    containerWidth?: number;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    // If containerWidth is known up front, compute scale immediately (no measurement needed)
    const [scale, setScale] = useState(() =>
        containerWidth && containerWidth > 0 ? containerWidth / baseWidth : 0
    );

    useEffect(() => {
        // If caller already knows the width, no ResizeObserver needed
        if (containerWidth && containerWidth > 0) {
            setScale(containerWidth / baseWidth);
            return;
        }
        if (!containerRef.current) return;
        const el = containerRef.current;

        const observer = new ResizeObserver((entries) => {
            // entry.contentRect.width is the LAYOUT width — unaffected by CSS 3D transforms
            // getBoundingClientRect().width would return the 2D projected width (≈0 for rotated cards)
            const w = entries[0]?.contentRect.width;
            if (w && w > 0) setScale(w / baseWidth);
        });
        observer.observe(el);

        // Fallback immediate read: offsetWidth also gives layout width, not projected width
        if (el.offsetWidth > 0) setScale(el.offsetWidth / baseWidth);

        return () => observer.disconnect();
    }, [baseWidth, containerWidth]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                aspectRatio: `${baseWidth} / ${baseHeight}`,
                overflow: 'hidden',
                background: '#f8fafc',
            }}
        >
            {/* Always rendered — opacity hides it until scale is ready to avoid a size-flash */}
            <iframe
                src={src}
                title={title}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${baseWidth}px`,
                    height: `${baseHeight}px`,
                    transform: scale > 0 ? `scale(${scale})` : 'none',
                    transformOrigin: 'top left',
                    pointerEvents: 'none',
                    border: 'none',
                    opacity: scale > 0 ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                }}
            />
        </div>
    );
}

export default function SnippetsGalleryDetails() {
    const router = useRouter();
    const { theme } = useTheme();
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
    const [draggedNoteData, setDraggedNoteData] = useState<Note | null>(null);
    const [noteFloatPos, setNoteFloatPos] = useState({ x: 0, y: 0 });
    const [isNoteExpanded, setIsNoteExpanded] = useState(false);
    const notesDimRef = useRef<HTMLDivElement>(null);
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

    // Playground popup states
    const [selectedPlaygroundSnippet, setSelectedPlaygroundSnippet] = useState<Snippet | null>(null);
    const [containerWidth, setContainerWidth] = useState(1200);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const [activePlaygroundTab, setActivePlaygroundTab] = useState<"demo" | "code">("demo");
    const [activeCodeType, setActiveCodeType] = useState<"raw" | "integrate">("integrate");
    const [liveEditorCode, setLiveEditorCode] = useState("");
    const [showEditor, setShowEditor] = useState(false);
    const liveIframeRef = useRef<HTMLIFrameElement>(null);
    const [activeIntegrationTab, setActiveIntegrationTab] = useState<"vanilla" | "react">("vanilla");
    const [playgroundConfig, setPlaygroundConfig] = useState<Record<string, any>>({});
    const [isCodeCopied, setIsCodeCopied] = useState(false);

    // Draggable states for Playground
    const [playgroundOffset, setPlaygroundOffset] = useState({ x: 0, y: 0 });
    const [isPlaygroundDragging, setIsPlaygroundDragging] = useState(false);
    const [playgroundDragStart, setPlaygroundDragStart] = useState({ x: 0, y: 0 });

    // Listen for parameters updates from iframe playgrounds
    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            if (e.data && e.data.type === "playground-config") {
                setPlaygroundConfig(e.data.params);
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    const handleCopyConfiguredCode = async (codeText: string) => {
        if (!navigator.clipboard) return;
        try {
            await navigator.clipboard.writeText(codeText);
            setIsCodeCopied(true);
            setTimeout(() => setIsCodeCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy code: ", err);
        }
    };

    // Canvas panning states
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const galleryRef = useRef<HTMLElement>(null);
    // Only rotation is React state — used for recenter button visibility + inertia readback
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    // isDragging React state only for cursor-grabbing CSS class
    const [isDragging, setIsDragging] = useState(false);
    const [isRecentering, setIsRecentering] = useState(false);
    // All drag tracking in refs — zero React re-renders during drag
    const isDraggingRef = useRef(false);
    const hasDraggedRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const velRef = useRef({ x: 0, y: 0 });
    const posRef = useRef({ x: 0, y: 0 });
    const animFrameRef = useRef<number | null>(null);
    const dynamicPerspectiveRef = useRef(1200);

    // Fetch data
    useEffect(() => {
        const fetchAllData = async () => {
            const startTime = Date.now();
            try {
                const [snipRes, profRes, setRes, notesRes] = await Promise.all([
                    fetch("/api/snippets"),
                    fetch("/api/profile"),
                    fetch("/api/snippets-settings"),
                    fetch("/api/notes")
                ]);

                const snipData = snipRes.ok ? await snipRes.json() : [];
                const profData = profRes.ok ? await profRes.json() : null;
                const setData = setRes.ok ? await setRes.json() : null;
                const notesData = notesRes.ok ? await notesRes.json() : [];

                if (Array.isArray(snipData)) setSnippets(snipData);
                if (profData && !profData.error) setProfile(profData);
                if (setData && !setData.error) setSettings(setData);
                if (Array.isArray(notesData)) setNotes(notesData);

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

    // Helper: apply transform directly to DOM — skips React reconciler entirely
    const applyCanvasTransform = useCallback((x: number, y: number) => {
        if (!canvasRef.current) return;
        canvasRef.current.style.transform = `translateZ(${dynamicPerspectiveRef.current}px) rotateX(${x}deg) rotateY(${y}deg)`;
    }, []);

    // Track width of the playground container for dynamic scale adjustments
    useEffect(() => {
        if (!selectedPlaygroundSnippet || !wrapperRef.current) return;
        const updateWidth = () => {
            if (wrapperRef.current) {
                setContainerWidth(wrapperRef.current.getBoundingClientRect().width);
            }
        };
        
        updateWidth();
        
        const observer = new ResizeObserver(updateWidth);
        observer.observe(wrapperRef.current);
        return () => observer.disconnect();
    }, [selectedPlaygroundSnippet]);

    const playgroundScale = containerWidth / 1200;

    // Handle Drag & Pan Events
    // All handlers are stable refs — no stale-closure issues, no re-renders during drag
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button !== 0) return;
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a') || target.closest('.copy-btn-panel') || target.closest('.copy-target')) return;

        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        isDraggingRef.current = true;
        hasDraggedRef.current = false;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        dragOffsetRef.current = { x: posRef.current.x, y: posRef.current.y };
        velRef.current = { x: 0, y: 0 };
        setIsDragging(true);
        setIsRecentering(false);
        // Remove transition during drag
        if (canvasRef.current) canvasRef.current.style.transition = 'none';
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDraggingRef.current) return;

        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;

        if (!hasDraggedRef.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
            hasDraggedRef.current = true;
        }

        // Yaw (Y-rotation) from dx, Pitch (X-rotation) from dy
        const nextRotY = dragOffsetRef.current.y + dx * 0.15;
        let nextRotX = dragOffsetRef.current.x - dy * 0.15;

        // Clamp Pitch to prevent turning upside down
        nextRotX = Math.max(-30, Math.min(30, nextRotX));

        velRef.current = {
            x: nextRotX - posRef.current.x,
            y: nextRotY - posRef.current.y
        };
        posRef.current = { x: nextRotX, y: nextRotY };

        // Apply directly to DOM — zero React re-renders
        applyCanvasTransform(nextRotX, nextRotY);
    }, [applyCanvasTransform]);

    const handleMouseUp = useCallback(() => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        setIsDragging(false);

        // Brief delay so click handlers can still read hasDraggedRef
        setTimeout(() => { hasDraggedRef.current = false; }, 50);

        // Restore smooth transition for inertia decay
        if (canvasRef.current) {
            canvasRef.current.style.transition = 'none';
        }

        const decay = () => {
            velRef.current.x *= 0.93;
            velRef.current.y *= 0.93;

            let nextRotX = posRef.current.x + velRef.current.x;
            let nextRotY = posRef.current.y + velRef.current.y;
            nextRotX = Math.max(-30, Math.min(30, nextRotX));

            posRef.current = { x: nextRotX, y: nextRotY };
            applyCanvasTransform(nextRotX, nextRotY);

            if (Math.abs(velRef.current.x) > 0.02 || Math.abs(velRef.current.y) > 0.02) {
                animFrameRef.current = requestAnimationFrame(decay);
            } else {
                animFrameRef.current = null;
                // Sync React state once at end of inertia
                setRotation({ x: posRef.current.x, y: posRef.current.y });
            }
        };

        animFrameRef.current = requestAnimationFrame(decay);
    }, [applyCanvasTransform]);

    const handleRecenter = useCallback(() => {
        setIsRecentering(true);
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        velRef.current = { x: 0, y: 0 };
        posRef.current = { x: 0, y: 0 };
        setRotation({ x: 0, y: 0 });
        if (canvasRef.current) {
            canvasRef.current.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
            canvasRef.current.style.transform = `translateZ(${dynamicPerspectiveRef.current}px) rotateX(0deg) rotateY(0deg)`;
        }
        setTimeout(() => {
            setIsRecentering(false);
            if (canvasRef.current) canvasRef.current.style.transition = 'none';
        }, 650);
    }, []);

    // Register global drag listeners once on mount — stable, never re-added
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    // Touch Support for Mobile Dragging
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a') || target.closest('.copy-btn-panel') || target.closest('.copy-target')) return;

        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        const touch = e.touches[0];
        isDraggingRef.current = true;
        hasDraggedRef.current = false;
        dragStartRef.current = { x: touch.clientX, y: touch.clientY };
        dragOffsetRef.current = { x: posRef.current.x, y: posRef.current.y };
        velRef.current = { x: 0, y: 0 };
        setIsDragging(true);
        setIsRecentering(false);
        if (canvasRef.current) canvasRef.current.style.transition = 'none';
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDraggingRef.current) return;
        const touch = e.touches[0];

        const dx = touch.clientX - dragStartRef.current.x;
        const dy = touch.clientY - dragStartRef.current.y;

        if (!hasDraggedRef.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
            hasDraggedRef.current = true;
        }

        const nextRotY = dragOffsetRef.current.y + dx * 0.2;
        let nextRotX = dragOffsetRef.current.x - dy * 0.2;
        nextRotX = Math.max(-30, Math.min(30, nextRotX));

        velRef.current = {
            x: nextRotX - posRef.current.x,
            y: nextRotY - posRef.current.y
        };
        posRef.current = { x: nextRotX, y: nextRotY };
        applyCanvasTransform(nextRotX, nextRotY);
    }, [applyCanvasTransform]);

    const handleTouchEnd = useCallback(() => {
        handleMouseUp();
    }, [handleMouseUp]);

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

    // ── Note drag-out / drag-in handlers ──
    const noteDragRef = useRef({ active: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 });

    const handleNoteDragStart = (note: Note, e: React.MouseEvent | React.TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        e.preventDefault();
        noteDragRef.current = { active: true, startX: clientX, startY: clientY, offsetX: 0, offsetY: 0 };
        setDraggedNoteId(note.id);
        setDraggedNoteData(note);
        setNoteFloatPos({ x: clientX - 180, y: clientY - 30 });
    };

    const handleGlobalNoteMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!noteDragRef.current.active) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
        setNoteFloatPos({ x: clientX - 180, y: clientY - 30 });

        if (notesDimRef.current) {
            const rect = notesDimRef.current.getBoundingClientRect();
            const inside = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
            setIsNoteExpanded(!inside);
        }
    }, []);

    const handleGlobalNoteUp = useCallback(() => {
        if (!noteDragRef.current.active) return;
        noteDragRef.current.active = false;
        if (!isNoteExpanded) {
            setDraggedNoteId(null);
            setDraggedNoteData(null);
        }
    }, [isNoteExpanded]);

    useEffect(() => {
        window.addEventListener("mousemove", handleGlobalNoteMove);
        window.addEventListener("mouseup", handleGlobalNoteUp);
        window.addEventListener("touchmove", handleGlobalNoteMove as any);
        window.addEventListener("touchend", handleGlobalNoteUp);
        return () => {
            window.removeEventListener("mousemove", handleGlobalNoteMove);
            window.removeEventListener("mouseup", handleGlobalNoteUp);
            window.removeEventListener("touchmove", handleGlobalNoteMove as any);
            window.removeEventListener("touchend", handleGlobalNoteUp);
        };
    }, [handleGlobalNoteMove, handleGlobalNoteUp]);

    // Playground popup dragging handlers
    const handlePlaygroundMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (
            target.closest('button') || 
            target.closest('input') || 
            target.closest('select') || 
            target.closest('textarea') || 
            target.closest('pre') || 
            target.closest('code') || 
            target.closest('a') || 
            target.closest('iframe') || 
            target.closest('.code-tabs-header') ||
            target.closest('.pg-header-tab')
        ) return;

        setIsPlaygroundDragging(true);
        setPlaygroundDragStart({
            x: e.clientX,
            y: e.clientY
        });
    };

    const handlePlaygroundMouseMove = (e: MouseEvent) => {
        if (!isPlaygroundDragging) return;
        const dx = e.clientX - playgroundDragStart.x;
        const dy = e.clientY - playgroundDragStart.y;

        setPlaygroundDragStart({
            x: e.clientX,
            y: e.clientY
        });

        setPlaygroundOffset(prev => ({
            x: prev.x + dx,
            y: prev.y + dy
        }));
    };

    const handlePlaygroundMouseUp = () => {
        setIsPlaygroundDragging(false);
    };

    const handlePlaygroundTouchStart = (e: React.TouchEvent) => {
        const target = e.target as HTMLElement;
        if (
            target.closest('button') || 
            target.closest('input') || 
            target.closest('select') || 
            target.closest('textarea') || 
            target.closest('pre') || 
            target.closest('code') || 
            target.closest('a') || 
            target.closest('iframe') || 
            target.closest('.code-tabs-header') ||
            target.closest('.pg-header-tab')
        ) return;

        const touch = e.touches[0];
        setIsPlaygroundDragging(true);
        setPlaygroundDragStart({
            x: touch.clientX,
            y: touch.clientY
        });
    };

    const handlePlaygroundTouchMove = (e: React.TouchEvent) => {
        if (!isPlaygroundDragging) return;
        const touch = e.touches[0];
        const dx = touch.clientX - playgroundDragStart.x;
        const dy = touch.clientY - playgroundDragStart.y;

        setPlaygroundDragStart({
            x: touch.clientX,
            y: touch.clientY
        });

        setPlaygroundOffset(prev => ({
            x: prev.x + dx,
            y: prev.y + dy
        }));
    };

    const handlePlaygroundTouchEnd = () => {
        setIsPlaygroundDragging(false);
    };

    useEffect(() => {
        if (isPlaygroundDragging) {
            window.addEventListener("mousemove", handlePlaygroundMouseMove);
            window.addEventListener("mouseup", handlePlaygroundMouseUp);
        } else {
            window.removeEventListener("mousemove", handlePlaygroundMouseMove);
            window.removeEventListener("mouseup", handlePlaygroundMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handlePlaygroundMouseMove);
            window.removeEventListener("mouseup", handlePlaygroundMouseUp);
        };
    }, [isPlaygroundDragging, playgroundDragStart]);

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
    // Keep ref in sync with computed value so applyCanvasTransform always uses the right perspective
    dynamicPerspectiveRef.current = dynamicPerspective;

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

    const getPlaygroundUrl = (snippet: Snippet) => {
        if (snippet.playground_url) {
            return snippet.playground_url;
        }
        const title = snippet.title;
        const t = title.toLowerCase();
        if (t.includes("scroll") || t.includes("reveal")) {
            return "/snippet-playground/preview-scroll.html";
        }
        if (t.includes("magnetic") || t.includes("hover")) {
            return "/snippet-playground/preview-magnetic.html";
        }
        if (t.includes("clipboard") || t.includes("copy")) {
            return "/snippet-playground/preview-clipboard.html";
        }
        if (t.includes("debounce") || t.includes("cancel")) {
            return "/snippet-playground/preview-debounce.html";
        }
        if (t.includes("glass") || t.includes("morphism")) {
            return "/snippet-playground/preview-glass.html";
        }
        return "/snippet-playground/preview-scroll.html"; // Default fallback
    };

    const getCustomIntegrationCode = (snippet: Snippet, config: Record<string, any>, tab: "vanilla" | "react") => {
        if (tab === "vanilla" && snippet.integration_vanilla) return snippet.integration_vanilla;
        if (tab === "react" && snippet.integration_react) return snippet.integration_react;

        const titleLower = snippet.title.toLowerCase();

        if (titleLower.includes("glass") || titleLower.includes("morphism")) {
            const bgOpacity = config.bgOpacity ?? "0.65";
            const blurValue = config.blurValue ?? "20px";
            const borderOpacity = config.borderOpacity ?? "0.80";
            const shadowOpacity = config.shadowOpacity ?? "0.06";

            if (tab === "vanilla") {
                return `<!-- Glassmorphism Card HTML -->
<div class="glass-card">
  <h3>Card Title</h3>
  <p>Native GPU-accelerated frosted glass card component.</p>
</div>

<!-- Glassmorphism CSS -->
<style>
.glass-card {
  background: rgba(255, 255, 255, ${bgOpacity});
  backdrop-filter: blur(${blurValue});
  -webkit-backdrop-filter: blur(${blurValue});
  border: 1px solid rgba(255, 255, 255, ${borderOpacity});
  border-radius: 1.5rem;
  padding: 1.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, ${shadowOpacity});
  color: #0f172a;
}
</style>`;
            } else {
                return `import React from 'react';

export function GlassCard() {
  return (
    <div 
      className="p-7 rounded-[1.5rem] text-slate-900 transition-all duration-300"
      style={{
        background: 'rgba(255, 255, 255, ${bgOpacity})',
        backdropFilter: 'blur(${blurValue})',
        WebkitBackdropFilter: 'blur(${blurValue})',
        border: '1px solid rgba(255, 255, 255, ${borderOpacity})',
        boxShadow: '0 8px 32px rgba(0, 0, 0, ${shadowOpacity})'
      }}
    >
      <h3 className="font-extrabold text-lg mb-2">Card Title</h3>
      <p className="text-slate-600 text-sm">Native GPU-accelerated frosted glass card component.</p>
    </div>
  );
}`;
            }
        }

        if (titleLower.includes("scroll") || titleLower.includes("reveal")) {
            const staggerDelay = config.staggerDelay ?? 120;
            const threshold = config.threshold ?? 0.15;

            if (tab === "vanilla") {
                return `<!-- HTML Element with reveal markers -->
<div class="reveal-container">
  <div class="reveal-card" data-reveal>Card 1</div>
  <div class="reveal-card" data-reveal>Card 2</div>
  <div class="reveal-card" data-reveal>Card 3</div>
</div>

<!-- CSS Transition Styles -->
<style>
.reveal-card {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), 
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal-card.revealed {
  opacity: 1;
  transform: translateY(0);
}
</style>

<!-- JavaScript Intersection Observer -->
<script>
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".reveal-container");
  const delay = ${staggerDelay};

  const observer = new IntersectionObserver((entries) => {
    let index = 0;
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("revealed");
        }, index * delay);
        index++;
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: ${threshold},
    rootMargin: "0px 0px -50px 0px"
  });

  document.querySelectorAll("[data-reveal]").forEach(el => observer.observe(el));
});
</script>`;
            } else {
                return `import { useEffect, useRef, useState } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  staggerDelay?: number;
}

export function useScrollReveal<T extends HTMLElement>({
  threshold = ${threshold},
  rootMargin = "0px 0px -50px 0px",
  staggerDelay = ${staggerDelay},
}: ScrollRevealOptions = {}) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);

          const children = el.querySelectorAll("[data-reveal]");
          children.forEach((child, i) => {
            (child as HTMLElement).style.transitionDelay = \`\${i * staggerDelay}ms\`;
            child.classList.add("revealed");
          });
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, staggerDelay]);

  return { ref, isVisible };
}

// Usage Example:
// const { ref } = useScrollReveal({ threshold: ${threshold}, staggerDelay: ${staggerDelay} });
// return <div ref={ref}><div data-reveal className="reveal-card">Card</div></div>;`;
            }
        }

        if (titleLower.includes("magnetic") || titleLower.includes("hover")) {
            const strength = config.strength ?? 0.35;
            const ease = config.ease ?? 0.15;

            if (tab === "vanilla") {
                return `<!-- HTML Element -->
<button class="magnetic-btn">Hover Me</button>

<!-- JavaScript Magnetic Hover Animation -->
<script>
document.querySelectorAll(".magnetic-btn").forEach((btn) => {
  const strength = ${strength};
  const ease = ${ease};
  let pos = { x: 0, y: 0 };
  let target = { x: 0, y: 0 };
  let raf = null;

  function animate() {
    pos.x += (target.x - pos.x) * ease;
    pos.y += (target.y - pos.y) * ease;
    btn.style.transform = \`translate(\${pos.x}px, \${pos.y}px)\`;

    if (Math.abs(target.x - pos.x) > 0.1 || Math.abs(target.y - pos.y) > 0.1) {
      raf = requestAnimationFrame(animate);
    } else {
      raf = null;
    }
  }

  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    target = {
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    };
    if (!raf) raf = requestAnimationFrame(animate);
  });

  btn.addEventListener("mouseleave", () => {
    target = { x: 0, y: 0 };
    if (!raf) raf = requestAnimationFrame(animate);
  });
});
</script>`;
            } else {
                return `import { useRef, useCallback } from "react";

interface MagneticOptions {
  strength?: number;
  ease?: number;
}

export function useMagneticHover({ strength = ${strength}, ease = ${ease} }: MagneticOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const raf = useRef<number>();

  const animate = useCallback(() => {
    pos.current.x += (target.current.x - pos.current.x) * ease;
    pos.current.y += (target.current.y - pos.current.y) * ease;

    if (ref.current) {
      ref.current.style.transform = \`translate(\${pos.current.x}px, \${pos.current.y}px)\`;
    }

    if (
      Math.abs(target.current.x - pos.current.x) > 0.1 ||
      Math.abs(target.current.y - pos.current.y) > 0.1
    ) {
      raf.current = requestAnimationFrame(animate);
    }
  }, [ease]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      target.current = {
        x: (e.clientX - centerX) * strength,
        y: (e.clientY - centerY) * strength,
      };

      if (!raf.current) raf.current = requestAnimationFrame(animate);
    },
    [strength, animate]
  );

  const onMouseLeave = useCallback(() => {
    target.current = { x: 0, y: 0 };
    raf.current = requestAnimationFrame(animate);
  }, [animate]);

  return { ref, onMouseMove, onMouseLeave };
}

// Usage Example:
// const magnetic = useMagneticHover({ strength: ${strength}, ease: ${ease} });
// return <button {...magnetic}>Hover Me</button>;`;
            }
        }

        if (titleLower.includes("clipboard") || titleLower.includes("copy")) {
            const defaultCopyText = config.defaultCopyText ? config.defaultCopyText.replace(/"/g, '\\"') : 'ssh-keygen -t ed25519 -C \\"naufal@dev\\"';

            if (tab === "vanilla") {
                return `<!-- HTML Trigger -->
<button onclick="handleCopy('${defaultCopyText}')">Copy Command</button>

<!-- Clipboard JavaScript Utility -->
<script>
async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return fallbackCopy(text);
    }
  }
  return fallbackCopy(text);
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.cssText = "position:fixed;left:-9999px;opacity:0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch {}
  document.body.removeChild(textarea);
  return ok;
}

async function handleCopy(text) {
  const success = await copyToClipboard(text);
  if (success) alert("Copied: " + text);
}
</script>`;
            } else {
                return `import React, { useState } from 'react';

// Copy utility function
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return fallbackCopy(text);
    }
  }
  return fallbackCopy(text);
}

function fallbackCopy(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let success = false;
  try {
    success = document.execCommand("copy");
  } catch {
    success = false;
  }
  document.body.removeChild(textarea);
  return success;
}

// React Component Example
export function CopyButton() {
  const [copied, setCopied] = useState(false);
  const textToCopy = "${defaultCopyText}";

  const handleCopy = async () => {
    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button 
      onClick={handleCopy}
      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-semibold transition"
    >
      {copied ? "✓ Copied!" : "Copy Command"}
    </button>
  );
}`;
            }
        }

        if (titleLower.includes("debounce") || titleLower.includes("cancel")) {
            const delay = config.delay ?? 500;
            const leading = config.leading ?? false;
            const trailing = config.trailing ?? true;

            if (tab === "vanilla") {
                return `<!-- JS Debounce utility function -->
<script>
function debounce(fn, delay, options = {}) {
  const { leading = ${leading}, trailing = ${trailing} } = options;
  let timer = null;
  let lastArgs = null;
  let isLeadingInvoked = false;

  return function(...args) {
    lastArgs = args;

    if (leading && !isLeadingInvoked) {
      fn(...args);
      isLeadingInvoked = true;
    }

    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      if (trailing && lastArgs) {
        fn(...lastArgs);
      }
      timer = null;
      lastArgs = null;
      isLeadingInvoked = false;
    }, delay);
  };
}

// Usage:
// const myInput = document.getElementById("search");
// const handleSearch = debounce((e) => {
//   console.log("Searching for:", e.target.value);
// }, ${delay});
// myInput.addEventListener("input", handleSearch);
</script>`;
            } else {
                return `import { useMemo, useEffect } from "react";

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {}
) {
  const { leading = ${leading}, trailing = ${trailing} } = options;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let isLeadingInvoked = false;

  return (...args: Parameters<T>) => {
    lastArgs = args;

    if (leading && !isLeadingInvoked) {
      fn(...args);
      isLeadingInvoked = true;
    }

    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      if (trailing && lastArgs) {
        fn(...lastArgs);
      }
      timer = null;
      lastArgs = null;
      isLeadingInvoked = false;
    }, delay);
  };
}

// React Search Component Example:
// export function SearchInput() {
//   const debouncedSearch = useMemo(() => {
//     return debounce((query) => apiSearch(query), ${delay});
//   }, []);
//
//   return <input type="text" onChange={(e) => debouncedSearch(e.target.value)} />;
// }`;
            }
        }

        return snippet.code;
    };

    const handleOpenPlayground = (e: React.MouseEvent, snippet: Snippet) => {
        e.stopPropagation();
        if (isDraggingRef.current || hasDraggedRef.current) return; // Prevent selection if dragging canvas
        setSelectedPlaygroundSnippet(snippet);
        setActivePlaygroundTab("demo");
        setActiveCodeType("integrate");
        setActiveIntegrationTab("vanilla");
        setPlaygroundConfig({});
        setIsCodeCopied(false);
        setPlaygroundOffset({ x: 0, y: 0 });
        setShowEditor(false);
        setLiveEditorCode("");
    };

    const handleOpenCodes = (e: React.MouseEvent, snippet: Snippet) => {
        e.stopPropagation();
        if (isDraggingRef.current || hasDraggedRef.current) return; // Prevent selection if dragging canvas

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

                <div className="hero-split-layout">
                    {/* Left — Hero text */}
                    <div className="container hero-left-col">
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

                    {/* Right — Notes Dimension */}
                    <div className="notes-dimension" ref={notesDimRef}>
                            <div className="notes-dim-inner">
                                {/* Grid background */}
                                <div className="notes-grid-bg" />

                                {/* Animated traces */}
                                <div className="notes-trace notes-trace-h notes-trace-h1" />
                                <div className="notes-trace notes-trace-h notes-trace-h2" />
                                <div className="notes-trace notes-trace-v notes-trace-v1" />
                                <div className="notes-trace notes-trace-v notes-trace-v2" />

                                {/* Header */}
                                <div className="notes-dim-header">
                                    <LucideIcons.StickyNote size={16} />
                                    <span>Dev Notes</span>
                                    <span className="notes-count">{notes.length}</span>
                                </div>

                                {/* Notes cards */}
                                <div className="notes-cards-scroll">
                                    {notes.length > 0 ? notes.map((note, idx) => (
                                        <div
                                            key={note.id}
                                            className={`note-card note-card-draggable ${draggedNoteId === note.id ? 'note-dragging-source' : ''}`}
                                            style={{
                                                borderLeftColor: note.color || '#3A99C9',
                                                animationDelay: `${idx * 0.1}s`,
                                            }}
                                            onMouseDown={(e) => handleNoteDragStart(note, e)}
                                            onTouchStart={(e) => handleNoteDragStart(note, e)}
                                        >
                                            <div className="note-card-top">
                                                <span className="note-type-icon">{NOTE_TYPE_ICONS[note.type] || "📝"}</span>
                                                <span className="note-type-label">{note.type}</span>
                                                {note.pinned && <LucideIcons.Pin size={10} className="note-pin" />}
                                            </div>
                                            <h4 className="note-title">{note.title}</h4>
                                            {note.content && <p className="note-content">{note.content}</p>}
                                            <span className="note-date">
                                                {new Date(note.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            </span>
                                        </div>
                                    )) : (
                                        <>
                                            <div className="note-card placeholder" style={{ borderLeftColor: '#3A99C9' }}>
                                                <div className="note-card-top">
                                                    <span className="note-type-icon">💡</span>
                                                    <span className="note-type-label">idea</span>
                                                </div>
                                                <h4 className="note-title">Refactor auth middleware</h4>
                                                <p className="note-content">Move to edge runtime for faster cold starts</p>
                                            </div>
                                            <div className="note-card placeholder" style={{ borderLeftColor: '#22c55e' }}>
                                                <div className="note-card-top">
                                                    <span className="note-type-icon">✅</span>
                                                    <span className="note-type-label">todo</span>
                                                </div>
                                                <h4 className="note-title">Add dark mode to gallery</h4>
                                                <p className="note-content">Theme toggle for 3D space</p>
                                            </div>
                                            <div className="note-card placeholder" style={{ borderLeftColor: '#f97316' }}>
                                                <div className="note-card-top">
                                                    <span className="note-type-icon">📚</span>
                                                    <span className="note-type-label">learning</span>
                                                </div>
                                                <h4 className="note-title">Three.js shader basics</h4>
                                                <p className="note-content">Vertex + fragment shaders for custom effects</p>
                                            </div>
                                            <div className="note-card placeholder" style={{ borderLeftColor: '#7c3aed' }}>
                                                <div className="note-card-top">
                                                    <span className="note-type-icon">🔔</span>
                                                    <span className="note-type-label">reminder</span>
                                                </div>
                                                <h4 className="note-title">Deploy v2.1 by Friday</h4>
                                                <p className="note-content">Include new snippets + gallery fixes</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
            </section>

            {/* Floating dragged note */}
            {draggedNoteData && draggedNoteId && (
                <div
                    className={`floating-note ${isNoteExpanded ? 'expanded' : 'collapsed'}`}
                    style={{
                        left: `${noteFloatPos.x}px`,
                        top: `${noteFloatPos.y}px`,
                        borderTopColor: draggedNoteData.color || '#3A99C9',
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        noteDragRef.current = { active: true, startX: e.clientX, startY: e.clientY, offsetX: 0, offsetY: 0 };
                    }}
                    onTouchStart={(e) => {
                        const t = e.touches[0];
                        noteDragRef.current = { active: true, startX: t.clientX, startY: t.clientY, offsetX: 0, offsetY: 0 };
                    }}
                >
                    <button className="floating-note-close" onClick={() => { setDraggedNoteId(null); setDraggedNoteData(null); setIsNoteExpanded(false); }}>
                        <X size={14} />
                    </button>
                    <div className="fn-type">
                        <span>{NOTE_TYPE_ICONS[draggedNoteData.type] || "📝"}</span>
                        <span className="fn-type-label">{draggedNoteData.type}</span>
                        {draggedNoteData.pinned && <span className="fn-pin">📌</span>}
                    </div>
                    <h3 className="fn-title">{draggedNoteData.title}</h3>
                    <p className="fn-content">{draggedNoteData.content}</p>
                    {isNoteExpanded && (
                        <span className="fn-date">
                            {new Date(draggedNoteData.created_at).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                        </span>
                    )}
                </div>
            )}

            {/* Asymmetric 3D Gallery Wall canvas */}
            <section id="gallery" className="gallery-section" ref={galleryRef}>
                <div 
                    className={`gallery-viewport ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
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
                            willChange: 'transform',
                            transition: 'none'
                        }}
                    >
                        {/* 3D Floor Plane */}
                        <div className="gallery-floor">
                            {/* Animated light traces on floor grid */}
                            <div className="grid-trace trace-h trace-h-1" />
                            <div className="grid-trace trace-h trace-h-2" />
                            <div className="grid-trace trace-h trace-h-3" />
                            <div className="grid-trace trace-h trace-h-4" />
                            <div className="grid-trace trace-v trace-v-1" />
                            <div className="grid-trace trace-v trace-v-2" />
                            <div className="grid-trace trace-v trace-v-3" />
                            <div className="grid-trace trace-v trace-v-4" />
                        </div>

                        {/* 3D Ceiling Plane */}
                        <div className="gallery-ceiling">
                            <div className="grid-trace trace-h trace-h-5" />
                            <div className="grid-trace trace-h trace-h-6" />
                            <div className="grid-trace trace-v trace-v-5" />
                            <div className="grid-trace trace-v trace-v-6" />
                        </div>

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
                                        
                                        {/* Scaled Live Demo Preview */}
                                        <div className="gallery-card-thumbnail">
                                            <ScaledPreviewIframe
                                                src={getPlaygroundUrl(snippet)}
                                                title={`${snippet.title} Preview`}
                                                containerWidth={preset.width}
                                            />
                                        </div>

                                        <div className="gallery-card-info">
                                            <h3>{snippet.title}</h3>
                                        </div>
                                    </div>

                                    {/* Hover Actions Popout Wrapper (beside card, behind card) */}
                                    <div className={`card-popout-actions side-${(snippet.title.charCodeAt(0) + idx) % 2 === 0 ? "left" : "right"}`}>
                                        <button
                                            className="action-btn btn-details"
                                            onClick={(e) => handleOpenCodes(e, snippet)}
                                            title="View Details"
                                        >
                                            <Info size={16} />
                                            <span className="btn-label">Details</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => handleOpenPlayground(e, snippet)}
                                            className="action-btn btn-playground"
                                            title="Open Playground"
                                        >
                                            <Play size={16} />
                                            <span className="btn-label">Playground</span>
                                        </button>
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
                                <div className="panel-section">
                                    <h3 className="section-title">Preview Outcome</h3>
                                    <div className="panel-preview-wrapper mt-3 rounded-xl overflow-hidden border border-[#e2e8f0]">
                                        <ScaledPreviewIframe
                                            src={getPlaygroundUrl(selectedSnippet)}
                                            title={`${selectedSnippet.title} Preview`}
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                </div>

                {/* Playground Popup */}
                {selectedPlaygroundSnippet && (
                    <>
                        <div className="playground-backdrop active" onClick={() => setSelectedPlaygroundSnippet(null)} />
                        <div 
                            className={`playground-popup-container ${isPlaygroundDragging ? "dragging" : ""}`}
                            style={{
                                left: `calc(50% + ${playgroundOffset.x}px)`,
                                top: `calc(50% + ${playgroundOffset.y}px)`
                            }}
                            onMouseDown={handlePlaygroundMouseDown}
                            onTouchStart={handlePlaygroundTouchStart}
                            onTouchMove={handlePlaygroundTouchMove}
                            onTouchEnd={handlePlaygroundTouchEnd}
                        >
                            <div className="playground-popup-header">
                                <div className="header-title flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                    <LucideIcons.Sparkles size={18} color="#3A99C9" />
                                    <span style={{ fontWeight: 'bold', fontSize: '0.875rem', letterSpacing: '0.025em', color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '200px' }}>
                                        {selectedPlaygroundSnippet.title}
                                    </span>
                                </div>
                                
                                <div className="playground-header-tabs" style={{ display: 'flex', gap: '8px', background: 'rgba(0, 0, 0, 0.05)', padding: '4px', borderRadius: '30px', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                                    <button 
                                        className={`pg-header-tab ${activePlaygroundTab === "demo" ? "active" : ""}`}
                                        onClick={() => setActivePlaygroundTab("demo")}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: activePlaygroundTab === "demo" ? '#3A99C9' : 'transparent',
                                            color: activePlaygroundTab === "demo" ? 'white' : '#475569',
                                            border: 'none',
                                            borderRadius: '20px',
                                            padding: '5px 14px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <LucideIcons.Gamepad2 size={14} />
                                        <span>Live Demo</span>
                                    </button>
                                    <button 
                                        className={`pg-header-tab ${activePlaygroundTab === "code" ? "active" : ""}`}
                                        onClick={() => setActivePlaygroundTab("code")}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: activePlaygroundTab === "code" ? '#3A99C9' : 'transparent',
                                            color: activePlaygroundTab === "code" ? 'white' : '#475569',
                                            border: 'none',
                                            borderRadius: '20px',
                                            padding: '5px 14px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <LucideIcons.Code2 size={14} />
                                        <span>Get Integration Code</span>
                                    </button>
                                </div>

                                <button className="playground-close" onClick={() => setSelectedPlaygroundSnippet(null)}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="playground-popup-body" ref={wrapperRef}>
                                {activePlaygroundTab === "demo" ? (
                                    <div className="playground-iframe-wrapper">
                                        <iframe
                                            className="playground-iframe"
                                            src={getPlaygroundUrl(selectedPlaygroundSnippet)}
                                            style={{ transform: `scale(${playgroundScale})` }}
                                            title={`${selectedPlaygroundSnippet.title} Demo`}
                                        />
                                    </div>
                                ) : (
                                    <div className="playground-code-view" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '380px' }}>
                                        {/* Sub tabs */}
                                        <div className="code-tabs-header" style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                                            <button 
                                                onClick={() => setActiveCodeType("integrate")}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: activeCodeType === "integrate" ? '#3A99C9' : '#64748b',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    paddingBottom: '4px',
                                                    borderBottom: activeCodeType === "integrate" ? '2px solid #3A99C9' : 'none'
                                                }}
                                            >
                                                Integration Code Example
                                            </button>
                                            <button 
                                                onClick={() => setActiveCodeType("raw")}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: activeCodeType === "raw" ? '#3A99C9' : '#64748b',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    paddingBottom: '4px',
                                                    borderBottom: activeCodeType === "raw" ? '2px solid #3A99C9' : 'none'
                                                }}
                                            >
                                                Raw Source Code
                                            </button>
                                        </div>

                                        {/* Sub-sub tabs if Integration Code Example is selected */}
                                        {activeCodeType === "integrate" && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button 
                                                    onClick={() => setActiveIntegrationTab("vanilla")}
                                                    style={{
                                                        background: activeIntegrationTab === "vanilla" ? 'rgba(58, 153, 201, 0.08)' : 'transparent',
                                                        color: activeIntegrationTab === "vanilla" ? '#3A99C9' : '#475569',
                                                        border: activeIntegrationTab === "vanilla" ? '1px solid #3A99C9' : '1px solid #cbd5e1',
                                                        borderRadius: '8px',
                                                        padding: '4px 12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    HTML/CSS/JS (Vanilla)
                                                </button>
                                                <button 
                                                    onClick={() => setActiveIntegrationTab("react")}
                                                    style={{
                                                        background: activeIntegrationTab === "react" ? 'rgba(58, 153, 201, 0.08)' : 'transparent',
                                                        color: activeIntegrationTab === "react" ? '#3A99C9' : '#475569',
                                                        border: activeIntegrationTab === "react" ? '1px solid #3A99C9' : '1px solid #cbd5e1',
                                                        borderRadius: '8px',
                                                        padding: '4px 12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    React / TSX Component
                                                </button>
                                            </div>
                                        )}

                                        {/* Code Display block */}
                                        <div className="code-block-wrapper" style={{ position: 'relative', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                            <div className="code-block-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', padding: '8px 16px', borderBottom: '1px solid #e2e8f0' }}>
                                                <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                                                    {activeCodeType === "raw" 
                                                        ? `${selectedPlaygroundSnippet.language.toUpperCase()} Source` 
                                                        : activeIntegrationTab === "vanilla" ? "HTML / CSS / JS" : "JSX / TSX"}
                                                </span>
                                                <button 
                                                    onClick={() => handleCopyConfiguredCode(
                                                        activeCodeType === "raw" 
                                                            ? selectedPlaygroundSnippet.code 
                                                            : getCustomIntegrationCode(selectedPlaygroundSnippet, playgroundConfig, activeIntegrationTab)
                                                    )}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        background: isCodeCopied ? '#22c55e' : 'white',
                                                        color: isCodeCopied ? 'white' : '#475569',
                                                        border: isCodeCopied ? 'none' : '1px solid #cbd5e1',
                                                        borderRadius: '6px',
                                                        padding: '4px 10px',
                                                        fontSize: '0.7rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {isCodeCopied ? <LucideIcons.Check size={12} /> : <LucideIcons.Copy size={12} />}
                                                    <span>{isCodeCopied ? "Copied!" : "Copy Code"}</span>
                                                </button>
                                            </div>
                                            <pre style={{ margin: 0, padding: '16px', maxHeight: '320px', overflowY: 'auto', fontFamily: "'Geist Mono', monospace", fontSize: '0.75rem', lineHeight: '1.6', color: '#334155', whiteSpace: 'pre', textAlign: 'left' }}>
                                                <code>
                                                    {activeCodeType === "raw" 
                                                        ? selectedPlaygroundSnippet.code 
                                                        : getCustomIntegrationCode(selectedPlaygroundSnippet, playgroundConfig, activeIntegrationTab)}
                                                </code>
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
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

                /* ═══════════════════════════════════════
                   HERO SPLIT LAYOUT + NOTES DIMENSION
                   ═══════════════════════════════════════ */
                .hero-split-layout {
                    display: flex;
                    align-items: stretch;
                    width: 100%;
                    gap: 0;
                    padding-right: 2rem;
                }

                .hero-left-col {
                    flex: 1;
                    min-width: 0;
                }

                .notes-dimension {
                    flex: 0 0 380px;
                    position: relative;
                    overflow: hidden;
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    border-radius: 1.25rem;
                    background: radial-gradient(circle at center, #ffffff 0%, #FAF9F6 70%, #E2DFD8 100%);
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
                    margin-top: -12rem;
                    margin-bottom: -12rem;
                    align-self: stretch;
                }

                .notes-dim-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                /* Grid background */
                .notes-grid-bg {
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
                    background-size: 50px 50px;
                    background-position: center;
                    pointer-events: none;
                    z-index: 0;
                }

                /* Animated traces for notes grid */
                .notes-trace {
                    position: absolute;
                    pointer-events: none;
                    z-index: 1;
                }
                .notes-trace-h {
                    width: 100%;
                    height: 1px;
                    left: 0;
                    background: linear-gradient(90deg,
                        transparent 0%, transparent 25%,
                        rgba(58, 153, 201, 0.4) 45%,
                        rgba(27, 79, 114, 0.7) 50%,
                        rgba(58, 153, 201, 0.4) 55%,
                        transparent 75%, transparent 100%
                    );
                    background-size: 300px 1px;
                }
                .notes-trace-v {
                    height: 100%;
                    width: 1px;
                    top: 0;
                    background: linear-gradient(180deg,
                        transparent 0%, transparent 25%,
                        rgba(58, 153, 201, 0.4) 45%,
                        rgba(27, 79, 114, 0.7) 50%,
                        rgba(58, 153, 201, 0.4) 55%,
                        transparent 75%, transparent 100%
                    );
                    background-size: 1px 300px;
                }
                .notes-trace-h1 {
                    top: 120px;
                    animation: ntrace-h 6s linear infinite;
                }
                .notes-trace-h2 {
                    top: 280px;
                    animation: ntrace-h 8s linear infinite reverse;
                    animation-delay: -2s;
                }
                .notes-trace-v1 {
                    left: 160px;
                    animation: ntrace-v 7s linear infinite;
                    animation-delay: -1s;
                }
                .notes-trace-v2 {
                    left: 320px;
                    animation: ntrace-v 9s linear infinite reverse;
                    animation-delay: -4s;
                }
                @keyframes ntrace-h {
                    0%   { background-position: -300px 0; }
                    100% { background-position: 680px 0; }
                }
                @keyframes ntrace-v {
                    0%   { background-position: 0 -300px; }
                    100% { background-position: 0 720px; }
                }

                /* Header bar */
                .notes-dim-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem 1.5rem;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: rgba(0, 0, 0, 0.5);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
                    position: relative;
                    z-index: 2;
                    flex-shrink: 0;
                }
                .notes-count {
                    margin-left: auto;
                    font-size: 0.65rem;
                    background: rgba(58, 153, 201, 0.12);
                    color: #1B4F72;
                    padding: 0.15rem 0.5rem;
                    border-radius: 99px;
                    font-weight: 800;
                }

                /* Scrollable cards area */
                .notes-cards-scroll {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    position: relative;
                    z-index: 2;
                }
                .notes-cards-scroll::-webkit-scrollbar {
                    width: 4px;
                }
                .notes-cards-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .notes-cards-scroll::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.08);
                    border-radius: 99px;
                }

                /* Note card */
                .note-card {
                    background: rgba(255, 255, 255, 0.7);
                    border: 1px solid rgba(0, 0, 0, 0.06);
                    border-left: 3px solid #3A99C9;
                    border-radius: 10px;
                    padding: 0.85rem 1rem;
                    transition: all 0.3s ease;
                    animation: noteSlideIn 0.5s ease-out both;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
                }
                .note-card:hover {
                    background: #ffffff;
                    border-color: rgba(0, 0, 0, 0.1);
                    transform: translateX(3px);
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
                }
                .note-card.placeholder {
                    opacity: 0.6;
                }

                @keyframes noteSlideIn {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                .note-card-top {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    margin-bottom: 0.35rem;
                }
                .note-type-icon {
                    font-size: 0.75rem;
                    line-height: 1;
                }
                .note-type-label {
                    font-size: 0.6rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: rgba(0, 0, 0, 0.35);
                }
                .note-pin {
                    margin-left: auto;
                    color: #3A99C9;
                }

                .note-title {
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: #1a202c;
                    margin: 0 0 0.2rem;
                    line-height: 1.35;
                }
                .note-content {
                    font-size: 0.7rem;
                    color: rgba(0, 0, 0, 0.45);
                    line-height: 1.45;
                    margin: 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .note-date {
                    display: block;
                    margin-top: 0.35rem;
                    font-size: 0.58rem;
                    font-weight: 700;
                    color: rgba(0, 0, 0, 0.25);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .note-card-draggable {
                    cursor: grab;
                    user-select: none;
                    touch-action: none;
                }
                .note-card-draggable:active {
                    cursor: grabbing;
                }
                .note-dragging-source {
                    opacity: 0;
                    height: 0;
                    padding: 0;
                    margin: 0;
                    border: none;
                    overflow: hidden;
                    pointer-events: none;
                    transition: all 0.3s ease;
                }

                /* ── Floating dragged note ── */
                .floating-note {
                    position: fixed;
                    z-index: 9999;
                    background: #ffffff;
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    border-top: 4px solid #3A99C9;
                    border-radius: 1rem;
                    padding: 1.25rem;
                    cursor: grab;
                    user-select: none;
                    pointer-events: auto;
                    transition: width 0.3s ease, padding 0.3s ease, box-shadow 0.3s ease;
                }
                .floating-note:active { cursor: grabbing; }

                .floating-note.collapsed {
                    width: 280px;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                }
                .floating-note.collapsed .fn-content {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .floating-note.expanded {
                    width: 380px;
                    padding: 1.75rem;
                    box-shadow:
                        0 30px 70px rgba(0, 0, 0, 0.15),
                        0 10px 25px rgba(0, 0, 0, 0.08);
                }
                .floating-note.expanded .fn-content {
                    display: block;
                    white-space: pre-wrap;
                }
                .floating-note.expanded .fn-title {
                    font-size: 1.2rem;
                }

                .floating-note-close {
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                    background: rgba(0, 0, 0, 0.04);
                    border: none;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: rgba(0, 0, 0, 0.3);
                    transition: all 0.2s;
                }
                .floating-note-close:hover {
                    background: rgba(0, 0, 0, 0.08);
                    color: #000;
                }

                .fn-type {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    margin-bottom: 0.5rem;
                }
                .fn-type-label {
                    font-size: 0.6rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: rgba(0, 0, 0, 0.35);
                }
                .fn-pin {
                    margin-left: auto;
                    font-size: 0.6rem;
                }

                .fn-title {
                    font-size: 0.9rem;
                    font-weight: 800;
                    color: #1a202c;
                    margin: 0 0 0.4rem;
                    line-height: 1.35;
                    padding-right: 1.5rem;
                    transition: font-size 0.3s ease;
                }

                .fn-content {
                    font-size: 0.8rem;
                    color: rgba(0, 0, 0, 0.55);
                    line-height: 1.6;
                    margin: 0;
                    transition: all 0.3s ease;
                }

                .fn-date {
                    display: block;
                    margin-top: 0.75rem;
                    font-size: 0.6rem;
                    font-weight: 700;
                    color: rgba(0, 0, 0, 0.2);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding-top: 0.6rem;
                    border-top: 1px solid rgba(0, 0, 0, 0.05);
                }

                @media (max-width: 900px) {
                    .hero-split-layout {
                        flex-direction: column;
                    }
                    .notes-dimension {
                        flex: none;
                        width: 100%;
                        min-height: 300px;
                        max-height: 400px;
                    }
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
                    will-change: transform;
                    backface-visibility: hidden;
                }

                /* 3D Environment elements style */
                .gallery-floor,
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
                    transform-style: preserve-3d;
                    pointer-events: none;
                    overflow: hidden;
                }
                .gallery-floor {
                    transform: translateY(400px) rotateX(90deg);
                }
                .gallery-ceiling {
                    transform: translateY(-400px) rotateX(90deg);
                }

                /* ── Animated grid light traces ── */
                .grid-trace {
                    position: absolute;
                    pointer-events: none;
                    will-change: transform;
                }

                /* Horizontal traces — full width, thin height, slide vertically */
                .trace-h {
                    width: 100%;
                    height: 2px;
                    left: 0;
                    background: linear-gradient(90deg,
                        transparent 0%,
                        transparent 30%,
                        rgba(58, 153, 201, 0.5) 45%,
                        rgba(27, 79, 114, 0.8) 50%,
                        rgba(58, 153, 201, 0.5) 55%,
                        transparent 70%,
                        transparent 100%
                    );
                    background-size: 800px 2px;
                }

                /* Vertical traces — full height, thin width, slide horizontally */
                .trace-v {
                    height: 100%;
                    width: 2px;
                    top: 0;
                    background: linear-gradient(180deg,
                        transparent 0%,
                        transparent 30%,
                        rgba(58, 153, 201, 0.5) 45%,
                        rgba(27, 79, 114, 0.8) 50%,
                        rgba(58, 153, 201, 0.5) 55%,
                        transparent 70%,
                        transparent 100%
                    );
                    background-size: 2px 800px;
                }

                /* Floor horizontal traces — each on a different grid line, different speed */
                .trace-h-1 {
                    top: 960px;
                    animation: trace-slide-h 8s linear infinite;
                }
                .trace-h-2 {
                    top: 1600px;
                    animation: trace-slide-h 11s linear infinite reverse;
                    animation-delay: -3s;
                }
                .trace-h-3 {
                    top: 2240px;
                    animation: trace-slide-h 9.5s linear infinite;
                    animation-delay: -6s;
                }
                .trace-h-4 {
                    top: 2880px;
                    animation: trace-slide-h 12s linear infinite reverse;
                    animation-delay: -1.5s;
                }

                /* Floor vertical traces */
                .trace-v-1 {
                    left: 880px;
                    animation: trace-slide-v 10s linear infinite;
                }
                .trace-v-2 {
                    left: 1520px;
                    animation: trace-slide-v 7.5s linear infinite reverse;
                    animation-delay: -4s;
                }
                .trace-v-3 {
                    left: 2400px;
                    animation: trace-slide-v 13s linear infinite;
                    animation-delay: -7s;
                }
                .trace-v-4 {
                    left: 3120px;
                    animation: trace-slide-v 9s linear infinite reverse;
                    animation-delay: -2s;
                }

                /* Ceiling traces */
                .trace-h-5 {
                    top: 1200px;
                    animation: trace-slide-h 14s linear infinite;
                    animation-delay: -5s;
                }
                .trace-h-6 {
                    top: 2640px;
                    animation: trace-slide-h 10s linear infinite reverse;
                    animation-delay: -8s;
                }
                .trace-v-5 {
                    left: 1040px;
                    animation: trace-slide-v 11s linear infinite;
                    animation-delay: -3s;
                }
                .trace-v-6 {
                    left: 2800px;
                    animation: trace-slide-v 8.5s linear infinite reverse;
                    animation-delay: -6s;
                }

                @keyframes trace-slide-h {
                    0%   { background-position: -800px 0; }
                    100% { background-position: 4800px 0; }
                }
                @keyframes trace-slide-v {
                    0%   { background-position: 0 -800px; }
                    100% { background-position: 0 4800px; }
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
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    overflow: hidden;
                    /* Height is driven by the aspect-ratio of the scaled iframe inside */
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
                    padding: 0; /* Override any global button padding */
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), padding 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
                    text-decoration: none;
                    position: relative;
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
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    opacity: 0;
                    visibility: hidden;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    white-space: nowrap;
                    overflow: hidden;
                    transition: opacity 0.2s ease, visibility 0.2s ease, left 0.2s ease, right 0.2s ease;
                }

                /* Directional layouts for popping out left vs right */
                .side-right .btn-label {
                    left: 42px;
                    right: auto;
                }
                .side-right .action-btn {
                    flex-direction: row;
                }
                .side-right .btn-details:hover {
                    width: 112px;
                    justify-content: flex-start;
                    padding-left: 14px;
                    padding-right: 0;
                }
                .side-right .btn-playground:hover {
                    width: 148px;
                    justify-content: flex-start;
                    padding-left: 14px;
                    padding-right: 0;
                }
                .side-right .action-btn:hover .btn-label {
                    opacity: 1;
                    visibility: visible;
                    left: 38px;
                }

                .side-left .btn-label {
                    right: 42px;
                    left: auto;
                }
                .side-left .action-btn {
                    flex-direction: row-reverse;
                }
                .side-left .btn-details:hover {
                    width: 112px;
                    justify-content: flex-start;
                    padding-right: 14px;
                    padding-left: 0;
                }
                .side-left .btn-playground:hover {
                    width: 148px;
                    justify-content: flex-start;
                    padding-right: 14px;
                    padding-left: 0;
                }
                .side-left .action-btn:hover .btn-label {
                    opacity: 1;
                    visibility: visible;
                    right: 38px;
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
                    white-space: normal;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
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

                /* Playground Popup styles */
                .playground-backdrop {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.45);
                    backdrop-filter: blur(10px);
                    z-index: 1040;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.4s ease;
                }

                .playground-backdrop.active {
                    opacity: 1;
                    pointer-events: auto;
                }

                .playground-popup-container {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 960px;
                    background: #ffffff;
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    border-radius: 24px;
                    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.15);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    z-index: 1050;
                    animation: playgroundPopupFadeIn 0.4s cubic-bezier(0.25, 1, 0.5, 1);
                    cursor: grab;
                }

                .playground-popup-container.dragging {
                    cursor: grabbing;
                }

                @keyframes playgroundPopupFadeIn {
                    from { opacity: 0; transform: translate(-50%, -46%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .playground-popup-header {
                    height: 54px;
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 1.75rem;
                }

                .playground-close {
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
                }

                .playground-close:hover {
                    background: rgba(0, 0, 0, 0.08);
                    color: #000;
                    transform: rotate(90deg);
                }

                .playground-popup-body {
                    width: 100%;
                    padding: 1.5rem;
                    background: #ffffff;
                }

                .playground-iframe-wrapper {
                    position: relative;
                    width: 100%;
                    padding-bottom: 52.5%; /* Aspect ratio 1200:630 */
                    height: 0;
                    overflow: hidden;
                    border-radius: 14px;
                    border: 1px solid #e2e8f0;
                    background: #f8fafc;
                }

                .playground-iframe {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 1200px;
                    height: 630px;
                    border: none;
                    transform-origin: 0 0;
                }

                /* Try It button */
                .try-it-btn {
                    position: absolute;
                    bottom: 1.25rem;
                    right: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.6rem 1.25rem;
                    background: linear-gradient(135deg, #1B4F72, #3A99C9);
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 800;
                    cursor: pointer;
                    z-index: 20;
                    box-shadow: 0 4px 16px rgba(27, 79, 114, 0.3);
                    transition: all 0.25s ease;
                }
                .try-it-btn:hover {
                    transform: translateY(-2px) scale(1.03);
                    box-shadow: 0 8px 24px rgba(27, 79, 114, 0.4);
                }

                /* ── Live Editor Split View ── */
                .live-editor-split {
                    display: flex;
                    height: 480px;
                    border-radius: 14px;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                }

                .live-editor-pane {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #1e293b;
                    min-width: 0;
                }

                .live-preview-pane {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #f8fafc;
                    border-left: 1px solid #e2e8f0;
                    min-width: 0;
                }

                .editor-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    background: rgba(0, 0, 0, 0.15);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    flex-shrink: 0;
                }

                .live-preview-pane .editor-toolbar {
                    background: rgba(0, 0, 0, 0.02);
                    border-bottom: 1px solid #e2e8f0;
                }

                .editor-toolbar-label {
                    font-size: 0.65rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: rgba(255, 255, 255, 0.5);
                }

                .live-preview-pane .editor-toolbar-label {
                    color: #94a3b8;
                }

                .editor-run-btn,
                .editor-close-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    padding: 0.3rem 0.7rem;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    cursor: pointer;
                    border: none;
                    margin-left: auto;
                    transition: all 0.2s;
                }

                .editor-run-btn {
                    background: #22c55e;
                    color: #fff;
                }
                .editor-run-btn:hover {
                    background: #16a34a;
                }

                .editor-close-btn {
                    background: rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.6);
                    margin-left: 0.35rem;
                }
                .editor-close-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    color: #fff;
                }

                .live-editor-textarea {
                    flex: 1;
                    width: 100%;
                    resize: none;
                    border: none;
                    outline: none;
                    padding: 1rem;
                    background: #0f172a;
                    color: #e2e8f0;
                    font-family: 'Geist Mono', 'SF Mono', 'Fira Code', monospace;
                    font-size: 0.8rem;
                    line-height: 1.6;
                    tab-size: 2;
                }

                .live-editor-textarea::placeholder {
                    color: rgba(255, 255, 255, 0.2);
                }

                .live-preview-iframe {
                    flex: 1;
                    width: 100%;
                    border: none;
                    background: #fff;
                }

                @media (max-width: 768px) {
                    .live-editor-split {
                        flex-direction: column;
                        height: 600px;
                    }
                    .live-preview-pane {
                        border-left: none;
                        border-top: 1px solid #e2e8f0;
                    }
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
