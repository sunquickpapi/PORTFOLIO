"use client";

import { useRef, useState } from "react";
import LaptopShowcase, { prefetchProjects } from "./LaptopShowcase";

/**
 * Sky-blue laptop by the pass card's top-right corner, built from real 3D planes.
 * At rest: closed, seen from above (embossed FVL on the lid).
 * On hover / focus: the lid swings open on its hinge, then the laptop tilts back so the
 * screen faces you ("Stacks & Projects"). Leaving reverses it. Click opens the
 * Stacks & Projects showcase (LaptopShowcase). No brand marks.
 *
 * Geometry: base and lid are W×D planes hinged on their top edge. Opening the lid by
 * LID° and tilting the whole laptop by (180 − LID)° puts the screen flat toward the viewer.
 */
const W = 200;
const D = 132;
const LID = 98; // how far the lid opens
const TILT = 180 - LID; // tilt that brings the screen face-on

const RIBBONS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 110" preserveAspectRatio="none">
<defs>
<linearGradient id="lpR1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1b4f72" stop-opacity="0"/><stop offset=".5" stop-color="#3a99c9"/><stop offset="1" stop-color="#9fd8f2"/></linearGradient>
<linearGradient id="lpR2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fd8f2" stop-opacity=".9"/><stop offset="1" stop-color="#1b4f72" stop-opacity="0"/></linearGradient>
</defs>
<path d="M-10 80 C35 50 80 105 130 62 S175 30 190 22 L190 -5 L-10 -5 Z" fill="url(#lpR2)" opacity=".5"/>
<path d="M25 120 C55 72 95 80 125 50 C145 30 162 24 190 26 L190 48 C165 46 150 54 132 72 C102 104 68 98 48 120 Z" fill="url(#lpR1)" opacity=".9"/>
<path d="M70 120 C95 92 130 96 152 70 C164 56 178 52 190 52 L190 64 C178 64 168 70 158 84 C136 110 104 108 88 120 Z" fill="#9fd8f2" opacity=".35"/>
</svg>`;

export default function Laptop() {
    const ref = useRef<HTMLAnchorElement>(null);
    const [from, setFrom] = useState<DOMRect | null>(null);
    return (
        <>
        <a
            ref={ref}
            className={`laptop ${from ? "is-away" : ""}`}
            href="#projects"
            aria-label="Stacks & Projects: open the project showcase"
            aria-haspopup="dialog"
            onMouseEnter={() => prefetchProjects()}
            onFocus={() => prefetchProjects()}
            onClick={(e) => {
                e.preventDefault();
                const r = ref.current?.querySelector(".lp-lid")?.getBoundingClientRect() || ref.current?.getBoundingClientRect();
                if (r) setFrom(r);
            }}
        >
            <span className="lp-shadow" aria-hidden="true" />
            <span className="lp-float" aria-hidden="true">
                <span className="lp-obj">
                    {/* base: keyboard deck on top, front edge for thickness */}
                    <span className="lp-base">
                        <span className="lp-deck">
                            <span className="lp-keys" />
                            <span className="lp-pad" />
                        </span>
                        <span className="lp-base-edge" />
                    </span>
                    {/* lid: shell outside, screen inside */}
                    <span className="lp-lid">
                        <span className="lp-shell">
                            <span className="lp-mark">FVL</span>
                        </span>
                        <span className="lp-screen">
                            <span className="lp-display">
                                <span className="lp-ribbons" dangerouslySetInnerHTML={{ __html: RIBBONS }} />
                                <span className="lp-title">
                                    Stacks &amp;
                                    <br />
                                    Projects
                                </span>
                                <span className="lp-underline" />
                            </span>
                            <span className="lp-cam" />
                        </span>
                    </span>
                </span>
            </span>
            <style jsx>{`
                .laptop {
                    --w: ${W}px;
                    --d: ${D}px;
                    --ease: cubic-bezier(0.65, 0, 0.35, 1);
                    position: relative;
                    display: block;
                    width: 220px;
                    height: 200px;
                    text-decoration: none;
                    cursor: pointer;
                    outline: none;
                    perspective: 1400px;
                    perspective-origin: 50% 78%; /* eye level with the base, so it reads as a slim strip when open */
                    -webkit-tap-highlight-color: transparent;
                }
                .laptop:hover {
                    opacity: 1; /* the site-wide link hover dims links */
                }
                .laptop > span,
                .laptop span {
                    display: block;
                }

                /* gentle hover-independent float */
                .lp-float {
                    position: absolute;
                    inset: 0;
                    transform-style: preserve-3d;
                    animation: lp-float 6s ease-in-out infinite;
                }
                @keyframes lp-float {
                    0%,
                    100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-6px);
                    }
                }

                /* the laptop: hinge = top edge of the base */
                .lp-obj {
                    position: absolute;
                    left: calc(50% - var(--w) / 2);
                    top: 30px;
                    width: var(--w);
                    height: var(--d);
                    transform-style: preserve-3d;
                    transform-origin: 50% 0;
                    /* closing: tilt back down first, then the lid shuts */
                    transition: transform 0.6s var(--ease) 0s;
                }
                .laptop:hover .lp-obj,
                .laptop:focus-visible .lp-obj {
                    /* move the hinge down so the open laptop stays centred, then tilt */
                    transform: translateY(${D - 18}px) rotateX(${TILT}deg);
                    transition: transform 0.65s var(--ease) 0.32s;
                }

                .lp-base,
                .lp-lid {
                    position: absolute;
                    inset: 0;
                    transform-style: preserve-3d;
                }
                .lp-deck {
                    position: absolute;
                    inset: 0;
                    border-radius: 12px;
                    background: linear-gradient(180deg, #cfe9f8 0%, #b9ddf2 55%, #a6d1ec 100%);
                    box-shadow: inset 0 0 0 1px rgba(27, 79, 114, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.8);
                }
                .lp-keys {
                    position: absolute;
                    left: 18px;
                    right: 18px;
                    top: 12px;
                    height: 58px;
                    border-radius: 6px;
                    background: repeating-linear-gradient(90deg, #345a7a 0 11px, transparent 11px 13.6px),
                        #1f3d57;
                    -webkit-mask: repeating-linear-gradient(180deg, #000 0 9px, transparent 9px 11.5px);
                    mask: repeating-linear-gradient(180deg, #000 0 9px, transparent 9px 11.5px);
                }
                .lp-pad {
                    position: absolute;
                    left: 58px;
                    right: 58px;
                    top: 80px;
                    height: 40px;
                    border-radius: 7px;
                    background: linear-gradient(180deg, #c3e2f4, #d8eefa);
                    box-shadow: inset 0 0 0 1px rgba(27, 79, 114, 0.22);
                }
                /* front edge of the base, standing down from its near side */
                .lp-base-edge {
                    position: absolute;
                    left: 4px;
                    right: 4px;
                    top: 100%;
                    height: 6px;
                    border-radius: 0 0 8px 8px;
                    background: linear-gradient(90deg, #6fa7cd, #94c6e6 50%, #6aa2c9);
                    transform-origin: 50% 0;
                    transform: rotateX(-90deg);
                }

                /* lid hinged on the top edge; sits on the base when closed */
                .lp-lid {
                    transform-origin: 50% 0;
                    transform: translateZ(3px) rotateX(0deg);
                    /* closing waits for the tilt-back to finish */
                    transition: transform 0.55s var(--ease) 0.5s;
                }
                .laptop:hover .lp-lid,
                .laptop:focus-visible .lp-lid {
                    transform: translateZ(3px) rotateX(${LID}deg);
                    transition: transform 0.6s var(--ease) 0s;
                }
                .lp-shell,
                .lp-screen {
                    position: absolute;
                    inset: 0;
                    border-radius: 12px;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
                /* outside of the lid: sky-blue shell lit from the top */
                .lp-shell {
                    background: radial-gradient(120% 90% at 30% 0%, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0) 55%),
                        linear-gradient(180deg, #b7e0f6 0%, #8fc8ea 45%, #6cb0dc 100%);
                    box-shadow: inset 0 1.5px 0 rgba(255, 255, 255, 0.85), inset 0 -2px 4px rgba(27, 79, 114, 0.25),
                        inset 0 0 0 1px rgba(27, 79, 114, 0.22);
                }
                .lp-mark {
                    position: absolute;
                    left: 0;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    text-align: center;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 24px;
                    font-weight: 800;
                    letter-spacing: 1px;
                    color: rgba(27, 79, 114, 0.32);
                    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.55), 0 -1px 0 rgba(27, 79, 114, 0.18);
                }
                /* inside of the lid: bezel + display (upside down until the lid is open) */
                .lp-screen {
                    transform: rotateX(180deg);
                    background: #0b1118;
                    box-shadow: inset 0 0 0 1.5px #7fb6dc;
                }
                .lp-display {
                    position: absolute;
                    inset: 7px 7px 9px 7px;
                    border-radius: 4px;
                    overflow: hidden;
                    background: linear-gradient(135deg, #0b1f33 0%, #0d2a42 60%, #14395a 100%);
                }
                .lp-ribbons {
                    position: absolute;
                    inset: 0;
                }
                .lp-ribbons :global(svg) {
                    display: block;
                    width: 100%;
                    height: 100%;
                }
                .lp-display::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0) 45%);
                }
                .lp-title {
                    position: absolute;
                    left: 14px;
                    top: 30px;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 19px;
                    font-weight: 800;
                    line-height: 1.12;
                    letter-spacing: -0.4px;
                    color: #fff;
                }
                .lp-underline {
                    position: absolute;
                    left: 14px;
                    top: 84px;
                    width: 26px;
                    height: 3px;
                    border-radius: 2px;
                    background: #9fd8f2;
                }
                .lp-cam {
                    position: absolute;
                    top: 2.5px;
                    left: calc(50% - 1.5px);
                    width: 3px;
                    height: 3px;
                    border-radius: 50%;
                    background: #2a3440;
                }

                /* soft shadow on the "desk", like the earbud case and the file */
                .lp-shadow {
                    position: absolute;
                    left: 10%;
                    right: 10%;
                    bottom: 2px;
                    height: 26px;
                    border-radius: 50%;
                    background: radial-gradient(closest-side, rgba(13, 42, 66, 0.34), rgba(13, 42, 66, 0));
                    filter: blur(6px);
                    transition: transform 0.65s var(--ease) 0.2s, opacity 0.65s ease 0.2s;
                }
                .laptop:hover .lp-shadow {
                    transform: scaleX(0.9);
                    opacity: 0.85;
                }

                .laptop:focus-visible {
                    outline: 2px dashed #3a99c9;
                    outline-offset: 4px;
                    border-radius: 14px;
                }
                @media (prefers-reduced-motion: reduce) {
                    .lp-float {
                        animation: none;
                    }
                    .lp-obj,
                    .lp-lid,
                    .laptop:hover .lp-obj,
                    .laptop:hover .lp-lid {
                        transition-duration: 0.01ms;
                        transition-delay: 0s;
                    }
                }
                /* hidden while its enlarged copy is on screen */
                .laptop.is-away {
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.15s ease;
                }
            `}</style>
        </a>
        {from && <LaptopShowcase from={from} onClose={() => setFrom(null)} />}
        </>
    );
}
