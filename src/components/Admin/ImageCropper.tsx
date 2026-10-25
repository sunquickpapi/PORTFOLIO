"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Crop, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";

export type CropAspect = { label: string; value: number | null }; // null = keep original

export const DEFAULT_ASPECTS: CropAspect[] = [
    { label: "Original", value: null },
    { label: "1:1", value: 1 },
    { label: "4:3", value: 4 / 3 },
    { label: "16:9", value: 16 / 9 },
    { label: "3:4", value: 3 / 4 },
    { label: "4:5", value: 4 / 5 },
];

type Props = {
    file: File;
    /** Initial aspect ratio (width / height). null = Original. */
    aspect?: number | null;
    aspects?: CropAspect[];
    /** "2 of 3" style progress when cropping several images */
    progress?: string;
    onCancel: () => void;
    /** Use the image exactly as picked (no crop) */
    onSkip: () => void;
    onConfirm: (file: File) => void;
};

const STAGE_H = 360;
const MAX_ZOOM = 4;
const MAX_OUTPUT = 2400; // px on the long edge

export default function ImageCropper({
    file,
    aspect = null,
    aspects = DEFAULT_ASPECTS,
    progress,
    onCancel,
    onSkip,
    onConfirm,
}: Props) {
    // Create the preview URL inside the effect (not useMemo) so React's dev double-run
    // can't revoke it before the image has loaded.
    const [src, setSrc] = useState<string | null>(null);
    useEffect(() => {
        const url = URL.createObjectURL(file);
        setSrc(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const stageRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
    const [stageW, setStageW] = useState(520);
    const [ratio, setRatio] = useState<number | null>(aspect);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [saving, setSaving] = useState(false);
    const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
    // The modal is portalled to <body>, outside the admin theme wrapper, so read the theme here
    const [dark] = useState(() => typeof document !== "undefined" && !!document.querySelector(".admin-dark-mode"));

    // Measure the stage so the crop frame fits it
    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => setStageW(el.clientWidth));
        ro.observe(el);
        setStageW(el.clientWidth);
        return () => ro.disconnect();
    }, []);

    const effectiveRatio = ratio ?? (natural ? natural.w / natural.h : 1);

    // Crop frame size: as large as possible inside the stage (with padding)
    const frame = useMemo(() => {
        const maxW = stageW - 48;
        const maxH = STAGE_H - 48;
        let w = maxW;
        let h = w / effectiveRatio;
        if (h > maxH) {
            h = maxH;
            w = h * effectiveRatio;
        }
        return { w, h };
    }, [stageW, effectiveRatio]);

    // Scale at zoom 1 = image just covers the frame
    const baseScale = natural ? Math.max(frame.w / natural.w, frame.h / natural.h) : 1;
    const scale = baseScale * zoom;

    const clamp = useCallback(
        (o: { x: number; y: number }, s = scale) => {
            if (!natural) return o;
            const maxX = Math.max(0, (natural.w * s - frame.w) / 2);
            const maxY = Math.max(0, (natural.h * s - frame.h) / 2);
            return {
                x: Math.min(maxX, Math.max(-maxX, o.x)),
                y: Math.min(maxY, Math.max(-maxY, o.y)),
            };
        },
        [natural, frame.w, frame.h, scale]
    );

    // Keep the image covering the frame when ratio / zoom / size change
    useEffect(() => {
        setOffset((o) => clamp(o));
    }, [clamp]);

    const reset = () => {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
    };

    const changeRatio = (value: number | null) => {
        setRatio(value);
        reset();
    };

    const onPointerDown = (e: React.PointerEvent) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    };
    const onPointerMove = (e: React.PointerEvent) => {
        if (!drag.current) return;
        const d = drag.current;
        setOffset(clamp({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) }));
    };
    const onPointerUp = () => {
        drag.current = null;
    };

    // Wheel zoom (non-passive so the page doesn't scroll)
    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            setZoom((z) => Math.min(MAX_ZOOM, Math.max(1, z * (e.deltaY < 0 ? 1.08 : 1 / 1.08))));
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, []);

    // Keyboard: Escape cancels, Enter confirms
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onCancel]);

    const confirm = async () => {
        if (!natural || !imgRef.current) return;
        setSaving(true);
        try {
            const cropW = frame.w / scale;
            const cropH = frame.h / scale;
            const sx = natural.w / 2 - offset.x / scale - cropW / 2;
            const sy = natural.h / 2 - offset.y / scale - cropH / 2;
            const k = Math.min(1, MAX_OUTPUT / Math.max(cropW, cropH));
            const outW = Math.round(cropW * k);
            const outH = Math.round(cropH * k);

            const canvas = document.createElement("canvas");
            canvas.width = outW;
            canvas.height = outH;
            const ctx = canvas.getContext("2d")!;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(imgRef.current, sx, sy, cropW, cropH, 0, 0, outW, outH);

            const keepPng = file.type === "image/png" || file.type === "image/webp";
            const type = keepPng ? "image/png" : "image/jpeg";
            const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.9));
            if (!blob) throw new Error("Could not crop this image");
            const base = file.name.replace(/\.[^.]+$/, "");
            onConfirm(new File([blob], `${base}-cropped.${keepPng ? "png" : "jpg"}`, { type }));
        } finally {
            setSaving(false);
        }
    };

    const outputSize = natural
        ? (() => {
              const cropW = frame.w / scale;
              const cropH = frame.h / scale;
              const k = Math.min(1, MAX_OUTPUT / Math.max(cropW, cropH));
              return `${Math.round(cropW * k)} × ${Math.round(cropH * k)} px`;
          })()
        : "";

    const modal = (
        <div className={`crop-overlay ${dark ? "is-dark" : ""}`} role="dialog" aria-modal="true" aria-label="Crop image" onPointerDown={(e) => e.target === e.currentTarget && onCancel()}>
            <div className="crop-modal">
                <div className="crop-head">
                    <div className="crop-title">
                        <Crop size={18} />
                        <span>Crop image</span>
                        {progress && <span className="crop-progress">{progress}</span>}
                    </div>
                    <button type="button" className="crop-icon-btn" onClick={onCancel} aria-label="Cancel">
                        <X size={18} />
                    </button>
                </div>

                <div
                    ref={stageRef}
                    className="crop-stage"
                    style={{ height: STAGE_H }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {src && <img
                        ref={imgRef}
                        src={src}
                        alt=""
                        draggable={false}
                        onLoad={(e) => {
                            const im = e.currentTarget;
                            setNatural({ w: im.naturalWidth, h: im.naturalHeight });
                        }}
                        className="crop-img"
                        style={
                            natural
                                ? {
                                      width: natural.w * scale,
                                      height: natural.h * scale,
                                      transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                                  }
                                : { opacity: 0 }
                        }
                    />}
                    <div className="crop-frame" style={{ width: frame.w, height: frame.h }}>
                        <span className="crop-grid crop-grid-v" />
                        <span className="crop-grid crop-grid-h" />
                    </div>
                    <div className="crop-hint">Drag to move · Scroll to zoom</div>
                </div>

                <div className="crop-controls">
                    <div className="crop-ratios" role="radiogroup" aria-label="Aspect ratio">
                        {aspects.map((a) => (
                            <button
                                key={a.label}
                                type="button"
                                role="radio"
                                aria-checked={ratio === a.value}
                                className={`crop-chip ${ratio === a.value ? "is-active" : ""}`}
                                onClick={() => changeRatio(a.value)}
                            >
                                {a.label}
                            </button>
                        ))}
                    </div>

                    <div className="crop-zoom">
                        <button type="button" className="crop-icon-btn" onClick={() => setZoom((z) => Math.max(1, z / 1.2))} aria-label="Zoom out">
                            <ZoomOut size={16} />
                        </button>
                        <input
                            type="range"
                            min={1}
                            max={MAX_ZOOM}
                            step={0.01}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            aria-label="Zoom"
                        />
                        <button type="button" className="crop-icon-btn" onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z * 1.2))} aria-label="Zoom in">
                            <ZoomIn size={16} />
                        </button>
                        <button type="button" className="crop-icon-btn" onClick={reset} aria-label="Reset" title="Reset">
                            <RotateCcw size={15} />
                        </button>
                    </div>
                </div>

                <div className="crop-foot">
                    <span className="crop-size">{outputSize}</span>
                    <div className="crop-actions">
                        <button type="button" className="crop-btn crop-btn-ghost" onClick={onSkip}>
                            Use original
                        </button>
                        <button type="button" className="crop-btn crop-btn-primary" onClick={confirm} disabled={!natural || saving}>
                            <Check size={16} />
                            {saving ? "Cropping..." : "Crop & upload"}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .crop-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 5000;
                    display: grid;
                    place-items: center;
                    padding: 1rem;
                    background: rgba(8, 20, 32, 0.55);
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    animation: crop-fade 0.2s ease;
                }
                .crop-modal {
                    width: min(600px, 100%);
                    background: #fff;
                    border-radius: 24px;
                    border: 1px solid rgba(27, 79, 114, 0.1);
                    box-shadow: 0 30px 80px -20px rgba(8, 20, 32, 0.45);
                    overflow: hidden;
                    animation: crop-pop 0.28s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .crop-overlay.is-dark .crop-modal {
                    background: #0f172a;
                    border-color: rgba(255, 255, 255, 0.08);
                    color: #e2e8f0;
                }
                .crop-head,
                .crop-foot {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.25rem;
                }
                .crop-title {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 800;
                    color: #1b4f72;
                }
                .crop-overlay.is-dark .crop-title {
                    color: #38bdf8;
                }
                .crop-progress {
                    font-size: 0.72rem;
                    font-weight: 700;
                    padding: 0.15rem 0.5rem;
                    border-radius: 999px;
                    background: rgba(58, 153, 201, 0.12);
                    color: #3a99c9;
                }
                .crop-stage {
                    position: relative;
                    overflow: hidden;
                    cursor: grab;
                    touch-action: none;
                    user-select: none;
                    background-color: #0b1220;
                    background-image: linear-gradient(45deg, #111a2c 25%, transparent 25%),
                        linear-gradient(-45deg, #111a2c 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #111a2c 75%),
                        linear-gradient(-45deg, transparent 75%, #111a2c 75%);
                    background-size: 20px 20px;
                    background-position: 0 0, 0 10px, 10px -10px, -10px 0;
                }
                .crop-stage:active {
                    cursor: grabbing;
                }
                .crop-img {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    max-width: none;
                    pointer-events: none;
                }
                .crop-frame {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    border: 2px solid #fff;
                    border-radius: 4px;
                    box-shadow: 0 0 0 9999px rgba(8, 20, 32, 0.6);
                    pointer-events: none;
                    transition: width 0.25s ease, height 0.25s ease;
                }
                .crop-grid {
                    position: absolute;
                    border-color: rgba(255, 255, 255, 0.35);
                    border-style: solid;
                    border-width: 0;
                }
                .crop-grid-v {
                    top: 0;
                    bottom: 0;
                    left: 33.333%;
                    right: 33.333%;
                    border-left-width: 1px;
                    border-right-width: 1px;
                }
                .crop-grid-h {
                    left: 0;
                    right: 0;
                    top: 33.333%;
                    bottom: 33.333%;
                    border-top-width: 1px;
                    border-bottom-width: 1px;
                }
                .crop-hint {
                    position: absolute;
                    left: 50%;
                    bottom: 10px;
                    transform: translateX(-50%);
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.75);
                    background: rgba(0, 0, 0, 0.35);
                    padding: 0.25rem 0.6rem;
                    border-radius: 999px;
                    pointer-events: none;
                }
                .crop-controls {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.75rem;
                    padding: 1rem 1.25rem 0;
                }
                .crop-ratios {
                    display: flex;
                    gap: 0.35rem;
                    flex-wrap: wrap;
                }
                .crop-chip {
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 0.4rem 0.75rem;
                    border-radius: 10px;
                    border: 1px solid rgba(27, 79, 114, 0.15);
                    background: transparent;
                    color: inherit;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .crop-chip:hover {
                    border-color: #3a99c9;
                }
                .crop-chip.is-active {
                    background: #1b4f72;
                    border-color: #1b4f72;
                    color: #fff;
                }
                .crop-zoom {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                }
                .crop-zoom input {
                    width: 120px;
                    accent-color: #3a99c9;
                }
                .crop-icon-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 10px;
                    border: none;
                    background: rgba(27, 79, 114, 0.06);
                    color: inherit;
                    cursor: pointer;
                }
                .crop-icon-btn:hover {
                    background: rgba(27, 79, 114, 0.12);
                }
                .crop-size {
                    font-size: 0.75rem;
                    font-weight: 600;
                    opacity: 0.55;
                }
                .crop-actions {
                    display: flex;
                    gap: 0.5rem;
                }
                .crop-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.85rem;
                    font-weight: 700;
                    padding: 0.6rem 1rem;
                    border-radius: 12px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .crop-btn-ghost {
                    background: transparent;
                    color: inherit;
                    border: 1px solid rgba(27, 79, 114, 0.15);
                }
                .crop-btn-ghost:hover {
                    border-color: #3a99c9;
                }
                .crop-btn-primary {
                    background: linear-gradient(135deg, #1b4f72, #2a7aa8);
                    color: #fff;
                    box-shadow: 0 6px 16px -6px rgba(27, 79, 114, 0.6);
                }
                .crop-btn-primary:disabled {
                    opacity: 0.6;
                    cursor: progress;
                }
                @keyframes crop-fade {
                    from {
                        opacity: 0;
                    }
                }
                @keyframes crop-pop {
                    from {
                        opacity: 0;
                        transform: translateY(12px) scale(0.98);
                    }
                }
                @media (max-width: 560px) {
                    .crop-zoom input {
                        width: 90px;
                    }
                    .crop-foot {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 0.6rem;
                    }
                    .crop-actions {
                        justify-content: flex-end;
                    }
                }
            `}</style>
        </div>
    );

    return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}
