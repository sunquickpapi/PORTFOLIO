"use client";

import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

import { Project } from "@/types/project";

interface PreviewModalProps {
    project: Project;
    isOpen: boolean;
    onClose: () => void;
}

export default function PreviewModal({ project, isOpen, onClose }: PreviewModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const images = Array.isArray(project.preview_images)
        ? project.preview_images
        : (typeof project.preview_images === 'string' ? (project.preview_images as string).split(',').map(s => s.trim()).filter(Boolean) : []);

    const handleNext = useCallback(() => {
        if (images.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }
    }, [images]);

    const handlePrev = useCallback(() => {
        if (images.length > 0) {
            setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    }, [images]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
        };
        window.addEventListener("keydown", handleKeyDown);

        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose, handleNext, handlePrev]);

    if (!isOpen) return null;

    const isMobile = project.category === "Mobile";

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 lg:p-8 text-white">
            <div
                className="absolute inset-0 bg-black/95 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            <button
                onClick={onClose}
                className="absolute top-8 right-8 p-3 text-white/50 hover:text-white transition-colors z-[120]"
            >
                <X size={32} />
            </button>

            <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                {/* Navigation Controls */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            className="absolute left-4 sm:left-12 p-3 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 transition-all pointer-events-auto"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            className="absolute right-4 sm:right-12 p-3 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 transition-all pointer-events-auto"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                <div className="w-full flex flex-col items-center justify-center max-h-full">
                    {/* Device Frame */}
                    <div className={`relative transition-all duration-500 pointer-events-auto ${isMobile ? 'h-[75vh] w-auto aspect-[9/19.5]' : 'w-[80vw] max-w-5xl aspect-[16/10]'}`}>

                        {isMobile ? (
                            /* iPhone Frame */
                            <div className="w-full h-full rounded-[3.5rem] border-[12px] border-zinc-800 bg-zinc-800 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-7 bg-zinc-800 rounded-b-2xl z-20" /> {/* Speaker/Notch */}
                                <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-black flex items-center justify-center">
                                    {images[currentIndex] ? (
                                        <img
                                            src={images[currentIndex]}
                                            className="w-full h-full object-cover transition-opacity duration-500"
                                            alt="Mobile Preview"
                                        />
                                    ) : (
                                        <div className="text-zinc-500 text-xs">Image not found</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Laptop Frame */
                            <div className="w-full h-full flex flex-col items-center">
                                <div className="w-full h-[95%] rounded-3xl border-[8px] border-zinc-800 bg-zinc-800 shadow-2xl overflow-hidden relative">
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-600 rounded-full z-20" /> {/* Camera */}
                                    <div className="w-full h-full rounded-2xl overflow-hidden bg-black">
                                        {images[currentIndex] ? (
                                            <img
                                                src={images[currentIndex]}
                                                className="w-full h-full object-cover transition-opacity duration-500"
                                                alt="Web Preview"
                                            />
                                        ) : (
                                            <div className="text-zinc-500 text-sm">Image not found</div>
                                        )}
                                    </div>
                                </div>
                                <div className="w-[110%] h-[3%] bg-zinc-700/50 rounded-b-3xl -mt-0.5 border-t border-white/5" />
                                <div className="w-[15%] h-[1.5%] bg-zinc-800 rounded-b-xl" />
                            </div>
                        )}
                    </div>

                    {/* Indicators & Info */}
                    <div className="mt-12 flex flex-col items-center gap-6 pointer-events-auto">
                        <div className="flex gap-2.5">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/20 hover:bg-white/40'}`}
                                />
                            ))}
                        </div>
                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-[0.3em] animate-pulse">Swipe or use arrow keys</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
