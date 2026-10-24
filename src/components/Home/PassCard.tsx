"use client";

import { useEffect, useRef, useState } from "react";
import { Courier_Prime, Black_Ops_One, JetBrains_Mono } from "next/font/google";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const blackOps = Black_Ops_One({ subsets: ["latin"], weight: "400", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: "700", display: "swap" });

/** Native design size from Claude design; the card is scaled to fit its column. */
const W = 900;
const H = 440;

/**
 * "Pixel Pass" ID card for the hero. Floats gently, tilts toward the cursor with a
 * glare highlight on hover, and flips to the back on click / Enter / Space.
 */
export default function PassCard() {
    const stageRef = useRef<HTMLDivElement>(null);
    const tiltRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.6);
    const [back, setBack] = useState(false);

    // Scale the 900×440 design to the available width
    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;
        const update = () => setScale(Math.min(1, el.clientWidth / W));
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // Cursor-follow tilt (written straight to CSS variables: no re-render per mouse move)
    const onMove = (e: React.PointerEvent) => {
        const el = tiltRef.current;
        if (!el || e.pointerType === "touch") return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width; // 0..1
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty("--ry", `${(px - 0.5) * 24}deg`);
        el.style.setProperty("--rx", `${(0.5 - py) * 18}deg`);
        el.style.setProperty("--gx", `${px * 100}%`);
        el.style.setProperty("--gy", `${py * 100}%`);
    };
    const onLeave = () => {
        const el = tiltRef.current;
        if (!el) return;
        el.style.setProperty("--ry", "0deg");
        el.style.setProperty("--rx", "0deg");
    };

    const flip = () => setBack((b) => !b);

    return (
        <div className={`pass ${courier.className}`}>
            <div ref={stageRef} className="pass-stage" style={{ height: H * scale }}>
                <div className="pass-float">
                    <div
                        ref={tiltRef}
                        className="pass-tilt"
                        role="button"
                        tabIndex={0}
                        aria-pressed={back}
                        aria-label={back ? "Pass card, back side. Press to flip to the front." : "Pass card, front side. Press to flip to the back."}
                        onPointerMove={onMove}
                        onPointerLeave={onLeave}
                        onClick={flip}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === "Space" || e.key === " ") {
                                e.preventDefault();
                                flip();
                            }
                        }}
                        style={{ width: W * scale, height: H * scale }}
                    >
                        <div className="pass-canvas" style={{ transform: `scale(${scale})` }}>
                            <div className={`pass-flip ${back ? "is-back" : ""}`}>
                                {/* FRONT */}
                                <div className="pass-face pass-front" aria-hidden={back}>
                                    <div className="pf-left">
                                        <div className="pf-stamp-shadow">
                                            <div className="pf-stamp">
                                                <div className="pf-stamp-inner">
                                                    <div className="pf-photo">
                                                        <div className="pf-photo-img" />
                                                    </div>
                                                    <div className="pf-name-row">
                                                        <div className={`pf-name ${jetbrains.className}`}>NAUFAL NIZAM</div>
                                                        <div className="pf-lines">
                                                            <span />
                                                            <span />
                                                            <span />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pf-mid">
                                        <div>
                                            <div className="pf-title">PASS CARD</div>
                                            <div className="pf-code">CARD CODE: PX2026-08/FW &nbsp;CODE · FOCUS · CRAFT</div>
                                        </div>
                                        <div className="pf-badges">
                                            <div className="pf-square" />
                                            <div className="pf-px">PX</div>
                                            <div className="pf-dots">
                                                <span>8</span>
                                                <span>B</span>
                                                <span>IT</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pf-right">
                                        <div className="pf-sprite" />
                                        {/* Covers the edge of the sitting scene that sits next to the sprite in the artwork */}
                                        <div className="pf-sprite-cover" />
                                    </div>

                                    <div className="pass-glare" />
                                </div>

                                {/* BACK */}
                                <div className="pass-face pass-back" aria-hidden={!back}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/assets/passcard/pass-flourish.webp" alt="" className="pb-flourish" />
                                    <div className="pb-strip" />
                                    <div className="pb-body">
                                        <div className="pb-terms">
                                            <div className="pb-head">
                                                <div className="pb-title">TERMS OF PASS</div>
                                                <div className="pb-code">PX2026-08/FW</div>
                                            </div>
                                            <ol className="pb-list">
                                                <li><span>01</span><span>This card admits the holder to all focus sessions, late-night builds and quiet study rooms.</span></li>
                                                <li><span>02</span><span>Headphones on means do not disturb. Coffee is permitted at the desk.</span></li>
                                                <li><span>03</span><span>If found, return to the nearest desk with a charged laptop.</span></li>
                                            </ol>
                                        </div>
                                        <div className="pb-side">
                                            <div className="pb-dates">
                                                <div><div className="pb-label">ISSUED</div><div className="pb-date">10/2026</div></div>
                                                <div><div className="pb-label">VALID THRU</div><div className="pb-date">10/2027</div></div>
                                            </div>
                                            <div className="pb-stamps">
                                                <div className={`pb-stamp-label ${blackOps.className}`}>STAMPS</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pass-glare" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pass-shadow" style={{ width: W * scale * 0.8 }} />
            </div>
            <div className="pass-hint">{back ? "Click to flip back" : "Click the card to flip it"}</div>

            <style jsx>{`
                .pass {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.1rem;
                    color: #0d2a42;
                }
                .pass-stage {
                    position: relative;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    perspective: 1600px;
                }

                /* Gentle idle float */
                .pass-float {
                    animation: pass-float 6s ease-in-out infinite;
                    transform-style: preserve-3d;
                }
                @keyframes pass-float {
                    0%,
                    100% {
                        transform: translateY(0) rotate(-1.2deg);
                    }
                    50% {
                        transform: translateY(-14px) rotate(0.4deg);
                    }
                }

                /* Shadow on the "floor" breathes with the float */
                .pass-shadow {
                    position: absolute;
                    left: 50%;
                    bottom: -34px;
                    height: 28px;
                    transform: translateX(-50%);
                    border-radius: 50%;
                    background: radial-gradient(ellipse at center, rgba(13, 42, 66, 0.28), transparent 70%);
                    filter: blur(6px);
                    animation: pass-shadow 6s ease-in-out infinite;
                    pointer-events: none;
                }
                @keyframes pass-shadow {
                    0%,
                    100% {
                        opacity: 0.9;
                        transform: translateX(-50%) scaleX(1);
                    }
                    50% {
                        opacity: 0.55;
                        transform: translateX(-50%) scaleX(0.88);
                    }
                }

                /* Hover: tilt toward cursor + lift */
                .pass-tilt {
                    --rx: 0deg;
                    --ry: 0deg;
                    --gx: 50%;
                    --gy: 30%;
                    position: relative;
                    cursor: pointer;
                    outline: none;
                    border-radius: 18px;
                    transform-style: preserve-3d;
                    transform: rotateX(var(--rx)) rotateY(var(--ry)) translateZ(0) scale(1);
                    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .pass-tilt:hover {
                    transform: translateY(-10px) rotateX(var(--rx)) rotateY(var(--ry)) scale(1.05);
                    transition: transform 0.2s ease-out;
                }
                .pass-tilt:focus-visible {
                    box-shadow: 0 0 0 3px #46c1e6;
                }

                .pass-canvas {
                    width: ${W}px;
                    height: ${H}px;
                    transform-origin: top left;
                    transform-style: preserve-3d;
                }
                .pass-flip {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transform-style: preserve-3d;
                    transition: transform 0.9s cubic-bezier(0.2, 0.7, 0.2, 1);
                }
                .pass-flip.is-back {
                    transform: rotateY(180deg);
                }

                .pass-face {
                    position: absolute;
                    inset: 0;
                    border-radius: 30px;
                    box-sizing: border-box;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                    overflow: hidden;
                    transition: opacity 0s linear 0.4s, box-shadow 0.3s ease;
                }
                .pass-back {
                    transform: rotateY(180deg);
                    opacity: 0;
                }
                .pass-flip.is-back .pass-front {
                    opacity: 0;
                }
                .pass-flip.is-back .pass-back {
                    opacity: 1;
                }

                /* Glare that follows the cursor */
                .pass-glare {
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    pointer-events: none;
                    background: radial-gradient(circle at var(--gx) var(--gy), rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0) 40%),
                        linear-gradient(115deg, transparent 30%, rgba(255, 255, 255, 0.18) 45%, transparent 60%);
                    mix-blend-mode: normal;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .pass-tilt:hover .pass-glare {
                    opacity: 1;
                }

                /* ---------- FRONT ---------- */
                .pass-front {
                    background: #e9eef0;
                    box-shadow: 0 30px 60px rgba(13, 42, 66, 0.28), inset 0 0 0 10px #dce4e8, inset 0 0 80px rgba(27, 79, 114, 0.12);
                    padding: 34px;
                    display: grid;
                    grid-template-columns: 290px 1fr 170px;
                    gap: 26px;
                }
                .pass-tilt:hover .pass-front {
                    box-shadow: 0 60px 100px rgba(13, 42, 66, 0.4), 0 0 0 2px rgba(70, 193, 230, 0.55), inset 0 0 0 10px #dce4e8, inset 0 0 80px rgba(27, 79, 114, 0.12);
                }
                .pf-left {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .pf-stamp-shadow {
                    width: 280px;
                    filter: drop-shadow(0 4px 8px rgba(13, 42, 66, 0.28));
                }
                .pf-stamp {
                    width: 279px;
                    height: 358px;
                    box-sizing: border-box;
                    padding: 10px;
                    background: #f7f9fa;
                    -webkit-mask: radial-gradient(circle at center, transparent 6px, #000 6.5px) -10px -10px / 20px 20px,
                        linear-gradient(#000 0 0) content-box;
                    mask: radial-gradient(circle at center, transparent 6px, #000 6.5px) -10px -10px / 20px 20px,
                        linear-gradient(#000 0 0) content-box;
                }
                .pf-stamp-inner {
                    height: 100%;
                    padding: 14px 14px 0;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                }
                .pf-photo {
                    position: relative;
                    flex: 1;
                    background: #c9d4da;
                    overflow: hidden;
                }
                .pf-photo-img,
                .pf-sprite {
                    position: absolute;
                    background-image: url(/assets/passcard/pass-pixel.webp);
                    background-repeat: no-repeat;
                    image-rendering: pixelated;
                    mix-blend-mode: multiply;
                    filter: brightness(1.12) contrast(1.12);
                }
                .pf-photo-img {
                    inset: 0;
                    background-size: 880px auto;
                    background-position: -150px -208px;
                }
                .pf-name-row {
                    height: 46px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .pf-name {
                    font-size: 16px;
                    font-weight: 700;
                    color: #0d2a42;
                    letter-spacing: 1px;
                }
                .pf-lines {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }
                .pf-lines span {
                    width: 26px;
                    height: 2px;
                    background: #1b4f72;
                    border-radius: 2px;
                }
                .pf-mid {
                    border-left: 2px dashed #1b4f72;
                    padding-left: 22px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .pf-title {
                    font-size: 42px;
                    font-weight: 700;
                    letter-spacing: 3px;
                    line-height: 1;
                }
                .pf-code {
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    margin-top: 4px;
                }
                .pf-badges {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .pf-square {
                    width: 22px;
                    height: 22px;
                    background: #46c1e6;
                }
                .pf-px {
                    font-size: 24px;
                    font-weight: 700;
                    font-style: italic;
                    letter-spacing: -1px;
                }
                .pf-dots {
                    display: flex;
                    gap: 6px;
                }
                .pf-dots span {
                    width: 22px;
                    height: 22px;
                    border: 2px solid #0d2a42;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: 700;
                    box-sizing: border-box;
                }
                .pf-right {
                    position: relative;
                    overflow: hidden;
                }
                .pf-sprite {
                    width: 157px;
                    height: 369px;
                    left: -1px;
                    top: 6px;
                    background-size: 455px auto;
                    background-position: -286px 4px;
                    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .pf-sprite-cover {
                    position: absolute;
                    left: 0;
                    top: 225px;
                    width: 16px;
                    bottom: 0;
                    background: #e9eef0;
                }
                /* Little life on hover: the standing sprite leans in */
                .pass-tilt:hover .pf-sprite {
                    transform: translateY(-8px) rotate(-3deg);
                }
                .pass-tilt:hover .pass-back {
                    box-shadow: 0 60px 100px rgba(0, 0, 0, 0.55), 0 0 0 2px rgba(70, 193, 230, 0.55), inset 0 0 0 10px #1b4f72;
                }
                /* Floor shadow tightens while the card is lifted */
                .pass-stage:hover .pass-shadow {
                    opacity: 0.4;
                }

                /* ---------- BACK ---------- */
                .pass-back {
                    background: #0d2a42;
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45), inset 0 0 0 10px #1b4f72;
                    color: #e9eef0;
                    display: flex;
                    flex-direction: column;
                }
                .pb-flourish {
                    position: absolute;
                    left: -40px;
                    bottom: -90px;
                    width: 380px;
                    height: auto;
                    opacity: 0.12;
                    transform: rotate(-12deg);
                    pointer-events: none;
                }
                .pb-strip {
                    height: 56px;
                    background: #081b2b;
                    margin-top: 30px;
                }
                .pb-body {
                    flex: 1;
                    display: grid;
                    grid-template-columns: 1fr 250px;
                    gap: 34px;
                    padding: 20px 44px 26px;
                }
                .pb-terms {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }
                .pb-head {
                    display: flex;
                    align-items: baseline;
                    gap: 14px;
                }
                .pb-title {
                    font-size: 30px;
                    font-weight: 700;
                    letter-spacing: 3px;
                }
                .pb-code {
                    font-size: 11px;
                    color: #46c1e6;
                    letter-spacing: 1px;
                }
                .pb-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 9px;
                    font-size: 13px;
                    line-height: 1.45;
                }
                .pb-list li {
                    display: flex;
                    gap: 10px;
                }
                .pb-list li span:first-child {
                    color: #46c1e6;
                }
                .pb-side {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }
                .pb-dates {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    font-size: 10px;
                    letter-spacing: 1px;
                }
                .pb-dates > div {
                    border: 1px solid #1b4f72;
                    padding: 8px;
                }
                .pb-label {
                    color: #46c1e6;
                }
                .pb-date {
                    font-size: 15px;
                    margin-top: 2px;
                }
                .pb-stamps {
                    flex: 1;
                    border: 2px dashed #46c1e6;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 14px;
                }
                .pb-stamp-label {
                    font-size: 22px;
                    letter-spacing: 4px;
                    color: #46c1e6;
                    border: 3px solid #46c1e6;
                    padding: 2px 12px;
                    transform: rotate(-4deg);
                }

                .pass-hint {
                    font-family: var(--font-display);
                    font-size: 0.75rem;
                    font-weight: 600;
                    letter-spacing: 0.02em;
                    color: var(--color-text-primary);
                    opacity: 0.45;
                    margin-top: 1.4rem;
                }

                :global(:root.dark) .pass-shadow {
                    background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.6), transparent 70%);
                }

                @media (prefers-reduced-motion: reduce) {
                    .pass-float,
                    .pass-shadow {
                        animation: none;
                    }
                    .pass-tilt,
                    .pass-tilt:hover {
                        transform: none;
                    }
                    .pass-flip {
                        transition-duration: 0.01ms;
                    }
                }
            `}</style>
        </div>
    );
}
