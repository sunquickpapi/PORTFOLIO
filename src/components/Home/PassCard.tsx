"use client";

import { useEffect, useRef, useState } from "react";
import { Courier_Prime, Black_Ops_One, JetBrains_Mono } from "next/font/google";
import { Coffee, Github, Instagram, Linkedin, Trophy, Zap } from "lucide-react";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const blackOps = Black_Ops_One({ subsets: ["latin"], weight: "400", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: "700", display: "swap" });

/** Native design size from Claude design; the card is scaled to fit its column. */
const W = 900;
const H = 440;
/** Flip duration. The easing is symmetric, so the card is exactly edge-on at FLIP_MS / 2. */
const FLIP_MS = 800;

/**
 * "Pixel Pass" ID card for the hero. Floats gently, tilts toward the cursor with a
 * glare highlight on hover, and flips to the back on click / Enter / Space.
 */
type Socials = { linkedin?: string | null; github?: string | null; instagram?: string | null };
type Stats = { projects?: string | number | null; years?: string | number | null; coffee?: string | number | null };

export default function PassCard({ socials = {}, stats = {}, onAbout }: { socials?: Socials; stats?: Stats; onAbout?: () => void }) {
    const statItems = [
        { label: "Projects Completed", value: stats.projects || "15", Icon: Trophy, stamp: "trophy" },
        { label: "Years in Coding", value: stats.years || "2", Icon: Zap, stamp: "zap" },
        { label: "Coffee Consumed", value: stats.coffee || "900", Icon: Coffee, stamp: "coffee" },
    ];
    const links = [
        { label: "LinkedIn", href: socials.linkedin || "https://www.linkedin.com/in/muhammad-naufal-bin-mohd-nizam-0603b2279", Icon: Linkedin },
        { label: "GitHub", href: socials.github || "https://github.com/sunquickpapi", Icon: Github },
        { label: "Instagram", href: socials.instagram, Icon: Instagram },
    ].filter((l): l is { label: string; href: string; Icon: typeof Github } => !!l.href);

    const stageRef = useRef<HTMLDivElement>(null);
    const tiltRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.6);
    const [back, setBack] = useState(false);
    const [bounce, setBounce] = useState<"" | "a" | "b">("");
    const [openStat, setOpenStat] = useState<number | null>(null);
    const [hoverStat, setHoverStat] = useState(-1);
    const [aboutHover, setAboutHover] = useState(false);
    const aboutRef = useRef<HTMLAnchorElement>(null);

    // Same position-based hit test as the stamps (reliable inside the tilted card)
    const aboutAt = (x: number, y: number) => {
        const el = aboutRef.current;
        if (back || !el) return false;
        const r = el.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };
    const goToAbout = () => {
        if (onAbout) return onAbout();
        const target = document.getElementById("about");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.location.hash = "about";
    };
    const stickerRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Chrome's own hover/click hit-testing flickers on elements inside the tilted 3D card,
    // so stamps are hit-tested by position: is the pointer inside a stamp's circle?
    const stickerAt = (x: number, y: number) => {
        if (back) return -1;
        return stickerRefs.current.findIndex((el) => {
            if (!el) return false;
            const r = el.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const rad = Math.min(r.width, r.height) / 2;
            return (x - cx) ** 2 + (y - cy) ** 2 <= rad * rad;
        });
    };

    // Escape closes an open sticker tag
    useEffect(() => {
        if (openStat === null) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenStat(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [openStat]);
    const flipping = useRef(false);

    // Tilt is eased every frame toward a target, so it never jumps or stutters
    const target = useRef({ rx: 0, ry: 0, gx: 50, gy: 30 });
    const current = useRef({ rx: 0, ry: 0, gx: 50, gy: 30 });
    const raf = useRef<number | null>(null);

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

    useEffect(() => () => {
        if (raf.current) cancelAnimationFrame(raf.current);
    }, []);

    const tick = () => {
        const el = tiltRef.current;
        const c = current.current;
        const t = target.current;
        const k = 0.14;
        c.rx += (t.rx - c.rx) * k;
        c.ry += (t.ry - c.ry) * k;
        c.gx += (t.gx - c.gx) * k;
        c.gy += (t.gy - c.gy) * k;
        if (el) {
            el.style.transform = `rotateX(${c.rx.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg)`;
            el.style.setProperty("--gx", `${c.gx.toFixed(1)}%`);
            el.style.setProperty("--gy", `${c.gy.toFixed(1)}%`);
        }
        const settled = Math.abs(t.rx - c.rx) < 0.02 && Math.abs(t.ry - c.ry) < 0.02;
        raf.current = settled ? null : requestAnimationFrame(tick);
    };
    const kick = () => {
        if (raf.current == null) raf.current = requestAnimationFrame(tick);
    };

    // Pointer is tracked on the stage, which never moves, so hover can't flicker
    const onMove = (e: React.PointerEvent) => {
        const hit = stickerAt(e.clientX, e.clientY);
        if (hit !== hoverStat) setHoverStat(hit);
        const overAbout = aboutAt(e.clientX, e.clientY);
        if (overAbout !== aboutHover) setAboutHover(overAbout);
        if (e.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
        target.current = { rx: (0.5 - py) * 16, ry: (px - 0.5) * 22, gx: px * 100, gy: py * 100 };
        kick();
    };
    const onLeave = () => {
        setHoverStat(-1);
        setAboutHover(false);
        target.current = { rx: 0, ry: 0, gx: 50, gy: 30 };
        kick();
    };

    // One flip at a time: a click mid-flip would desync the face swap from the rotation
    const flip = () => {
        if (flipping.current) return;
        flipping.current = true;
        setBack((b) => !b);
        setOpenStat(null);
        setBounce((b) => (b === "a" ? "b" : "a")); // alternate class names to restart the depth animation
        window.setTimeout(() => {
            flipping.current = false;
        }, FLIP_MS);
    };

    return (
        <div className={`pass ${courier.className}`}>
            <div
                ref={stageRef}
                className="pass-stage"
                style={{ height: H * scale }}
                role="button"
                tabIndex={0}
                aria-pressed={back}
                aria-label={back ? "Pass card, back side. Press to flip to the front." : "Pass card, front side. Press to flip to the back."}
                onPointerMove={onMove}
                onPointerLeave={onLeave}
                onClick={(e) => {
                    // A click inside a stamp opens its tag, even if Chrome reports the card as the target
                    if (aboutAt(e.clientX, e.clientY)) {
                        e.preventDefault();
                        goToAbout();
                        return;
                    }
                    const hit = stickerAt(e.clientX, e.clientY);
                    if (hit >= 0) {
                        setOpenStat((o) => (o === hit ? null : hit));
                        return;
                    }
                    flip();
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        flip();
                    }
                }}
            >
                <div className="pass-float">
                    <div className="pass-lift">
                    <div ref={tiltRef} className="pass-tilt" style={{ width: W * scale, height: H * scale }}>
                        <div className="pass-canvas" style={{ transform: `scale(${scale})` }}>
                            <div className={`pass-depth ${bounce ? `depth-${bounce}` : ""}`}>
                            <div className={`pass-flip ${back ? "is-back" : ""}`}>
                                {/* FRONT */}
                                <div className="pass-face pass-front" aria-hidden={back}>
                                    <div className="pf-left">
                                        <div className="pf-stamp-shadow">
                                            <div className="pf-stamp">
                                                <div className="pf-stamp-inner">
                                                    <div className="pf-photo">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img className="pf-photo-img" src="/assets/passcard/pass-photo.webp" alt="" draggable={false} />
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
                                        <div className="pf-about-row">
                                            <a
                                                ref={aboutRef}
                                                href="#about"
                                                className={`pf-about ${aboutHover ? "is-hover" : ""}`}
                                                tabIndex={back ? -1 : 0}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation(); // don't flip the card
                                                    goToAbout();
                                                }}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            >
                                                <span>About Me</span>
                                            </a>
                                        </div>
                                        <div className="pf-stickers">
                                            {statItems.map(({ label, value, stamp }, i) => {
                                                const open = openStat === i;
                                                return (
                                                    <div key={label} className={`pf-sticker-wrap pf-sticker-${i} ${open ? "is-open" : ""} ${hoverStat === i ? "is-hover" : ""}`}>
                                                        <button
                                                            type="button"
                                                            ref={(el) => {
                                                                stickerRefs.current[i] = el;
                                                            }}
                                                            className="pf-sticker"
                                                            aria-expanded={open}
                                                            aria-label={`${label}: ${value}+`}
                                                            tabIndex={back ? -1 : 0}
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // don't flip the card
                                                                setOpenStat(open ? null : i);
                                                            }}
                                                            onKeyDown={(e) => e.stopPropagation()}
                                                        >
                                                            {/* Postmark ink stamp, pre-rendered as an image so it stays crisp and stable while the card moves */}
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img className="pf-stamp-img" src={`/assets/passcard/pass-stamp-${stamp}.png`} alt="" draggable={false} />
                                                        </button>
                                                        <div className="pf-tag" role="status" aria-hidden={!open}>
                                                            <span className="pf-tag-value">{value}+</span>
                                                            <span className="pf-tag-label">{label}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="pf-socials">
                                            {links.map(({ label, href, Icon }, i) => (
                                                <a
                                                    key={label}
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="pf-social"
                                                    style={{ transitionDelay: `${i * 70}ms` }}
                                                    aria-label={label}
                                                    title={label}
                                                    tabIndex={back ? -1 : 0}
                                                    // Open the link without flipping the card
                                                    onClick={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                >
                                                    <Icon size={18} strokeWidth={2.25} />
                                                </a>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pf-right">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img className="pf-sprite" src="/assets/passcard/pass-sprite.webp" alt="" draggable={false} />
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
                    </div>
                </div>
            </div>

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
                    animation: pass-float 10s ease-in-out infinite;
                    transform-style: preserve-3d;
                }
                @keyframes pass-float {
                    0%,
                    100% {
                        transform: translateY(0) rotate(-0.8deg);
                    }
                    50% {
                        transform: translateY(-12px) rotate(0.3deg);
                    }
                }


                /* The stage is the hover/click target and never moves */
                .pass-stage {
                    cursor: pointer;
                    outline: none;
                    border-radius: 24px;
                    -webkit-tap-highlight-color: transparent;
                }
                .pass-stage:focus-visible .pass-tilt {
                    box-shadow: 0 0 0 3px #46c1e6;
                    border-radius: 18px;
                }

                /* Lift + scale on hover (eased by CSS; tilt is eased in JS) */
                .pass-lift {
                    transform-style: preserve-3d;
                    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
                    will-change: transform;
                }
                .pass-stage:hover .pass-lift {
                    transform: translateY(-10px) scale(1.04);
                }

                .pass-tilt {
                    --gx: 50%;
                    --gy: 30%;
                    position: relative;
                    transform-style: preserve-3d;
                    will-change: transform;
                }

                .pass-canvas {
                    width: ${W}px;
                    height: ${H}px;
                    transform-origin: top left;
                    transform-style: preserve-3d;
                }
                /* Depth: the card dips back slightly while it turns, then settles */
                .pass-depth {
                    width: 100%;
                    height: 100%;
                    transform-style: preserve-3d;
                }
                .pass-depth.depth-a {
                    animation: pass-depth-a ${FLIP_MS}ms cubic-bezier(0.45, 0, 0.55, 1);
                }
                .pass-depth.depth-b {
                    animation: pass-depth-b ${FLIP_MS}ms cubic-bezier(0.45, 0, 0.55, 1);
                }
                @keyframes pass-depth-a {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(0.9); }
                }
                @keyframes pass-depth-b {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(0.9); }
                }
                .pass-flip {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transform-style: preserve-3d;
                    /* Symmetric ease-in-out: edge-on exactly at the halfway point */
                    transition: transform ${FLIP_MS}ms cubic-bezier(0.45, 0, 0.55, 1);
                    will-change: transform;
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
                    /* Swap faces exactly when the card is edge-on (invisible), so there is never a gap */
                    transition: opacity 0s linear ${FLIP_MS / 2}ms, box-shadow 0.3s ease;
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
                /* Only the face you're looking at can receive clicks
                   (the hidden face sits in the same spot and could otherwise catch them) */
                .pass-back,
                .pass-flip.is-back .pass-front {
                    pointer-events: none;
                }
                .pass-flip.is-back .pass-back {
                    pointer-events: auto;
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
                .pass-stage:hover .pass-glare {
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
                .pass-stage:hover .pass-front {
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
                .pf-photo-img {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    image-rendering: pixelated;
                    user-select: none;
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
                /* Stats as postmark ink stamps; tap one to reveal its tag */
                .pf-stickers {
                    display: flex;
                    align-items: center;
                    padding: 44px 0 4px 0; /* room above for the tags */
                }
                .pf-sticker-wrap {
                    position: relative;
                }
                .pf-sticker-wrap + .pf-sticker-wrap {
                    margin-left: -8px; /* stamps overlap a little, like a postcard */
                }
                .pf-sticker-wrap.is-hover,
                .pf-sticker-wrap.is-open {
                    z-index: 2;
                }
                .pf-sticker {
                    display: block;
                    width: 86px;
                    height: 86px;
                    padding: 0;
                    border: none;
                    border-radius: 50%;
                    background: none;
                    cursor: pointer;
                    outline: none;
                    -webkit-tap-highlight-color: transparent;
                }
                /* The button never moves (stable hover); only the stamp picture inside does */
                .pf-stamp-img {
                    display: block;
                    width: 100%;
                    height: 100%;
                    opacity: 0.85;
                    user-select: none;
                    pointer-events: none;
                    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
                }
                /* Each stamp: its own ink shade and angle */
                .pf-sticker-0 .pf-sticker {
                    color: #1b4f72;
                }
                .pf-sticker-0 .pf-stamp-img {
                    transform: rotate(-14deg);
                }
                .pf-sticker-1 .pf-sticker {
                    color: #0d2a42;
                    transform: translateY(10px);
                }
                .pf-sticker-1 .pf-stamp-img {
                    transform: rotate(10deg);
                }
                .pf-sticker-2 .pf-sticker {
                    color: #2a7aa8;
                    transform: translateY(-4px);
                }
                .pf-sticker-2 .pf-stamp-img {
                    transform: rotate(-5deg);
                }
                .is-hover .pf-sticker .pf-stamp-img,
                .pf-sticker:focus-visible .pf-stamp-img,
                .is-open .pf-sticker .pf-stamp-img {
                    opacity: 1;
                    transform: rotate(0deg) scale(1.07);
                }
                .pf-sticker:focus-visible {
                    outline: 2px dashed #46c1e6;
                    outline-offset: 2px;
                }

                /* Tag that pops out above a sticker */
                .pf-tag {
                    position: absolute;
                    bottom: calc(100% + 12px);
                    left: 50%;
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    padding: 9px 13px 10px;
                    background: #0d2a42;
                    color: #e9eef0;
                    border-radius: 10px;
                    white-space: nowrap;
                    box-shadow: 0 10px 22px -8px rgba(13, 42, 66, 0.55);
                    pointer-events: none;
                    opacity: 0;
                    transform: translate(-50%, 8px) scale(0.85);
                    transform-origin: bottom center;
                    transition: opacity 0.18s ease, transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
                    z-index: 2;
                }
                .pf-tag::after {
                    content: "";
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border: 7px solid transparent;
                    border-top-color: #0d2a42;
                }
                /* Keep the outer tags inside the card */
                .pf-sticker-0 .pf-tag {
                    left: -4px;
                    transform: translate(0, 8px) scale(0.85);
                    transform-origin: bottom left;
                }
                .pf-sticker-0 .pf-tag::after {
                    left: 43px;
                }
                .is-open .pf-tag {
                    opacity: 1;
                    transform: translate(-50%, 0) scale(1);
                }
                .pf-sticker-0.is-open .pf-tag {
                    transform: translate(0, 0) scale(1);
                }
                .pf-tag-value {
                    font-size: 26px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    line-height: 1;
                    color: #46c1e6;
                }
                .pf-tag-label {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }
                /* About Me button, styled as an inked rubber stamp (matches the postmarks) */
                .pf-about-row {
                    display: flex;
                    align-items: flex-start;
                    padding: 4px 0 0 4px;
                }
                .pf-about {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    padding: 13px 24px 13px 27px; /* extra left offsets the trailing letter-spacing */
                    color: #1b4f72;
                    background: transparent;
                    /* double ring like the postmarks */
                    border: 3px solid currentColor;
                    border-radius: 10px;
                    outline: 1.5px solid currentColor;
                    outline-offset: -8px;
                    font-size: 17px;
                    font-weight: 700;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    text-decoration: none;
                    cursor: pointer;
                    opacity: 0.88;
                    transform: rotate(-2.5deg);
                    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease, background 0.2s ease,
                        opacity 0.2s ease;
                }
                /* Worn ink: paper-coloured speckles from a fixed texture (no live filters) */
                .pf-about::after {
                    content: "";
                    position: absolute;
                    inset: -4px;
                    background: url(/assets/passcard/pass-ink-gaps.png) -40px -70px / 160px 160px;
                    pointer-events: none;
                }
                /* Hover: "pressed harder" - darker ink, straightened, faint ink wash */
                .pf-about.is-hover,
                .pf-about:focus-visible {
                    color: #0d2a42;
                    opacity: 1;
                    background: rgba(27, 79, 114, 0.08);
                    transform: rotate(0deg) scale(1.04);
                }
                .pf-socials {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .pf-social {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    border: 2px solid #0d2a42;
                    color: #0d2a42;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    text-decoration: none;
                    background: transparent;
                    transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease, color 0.2s ease,
                        border-color 0.2s ease, box-shadow 0.25s ease;
                }
                /* Card hover: the icons slide up one after another */
                .pass-stage:hover .pf-social {
                    transform: translateY(-6px);
                }
                /* Icon hover: lifts further and fills with cyan */
                .pass-stage .pf-social:hover,
                .pass-stage .pf-social:focus-visible {
                    transform: translateY(-12px);
                    transition-delay: 0ms !important;
                    background: #46c1e6;
                    border-color: #46c1e6;
                    color: #0d2a42;
                    box-shadow: 0 10px 18px -6px rgba(70, 193, 230, 0.7);
                    outline: none;
                }
                .pf-right {
                    position: relative;
                    overflow: hidden;
                }
                .pf-sprite {
                    position: absolute;
                    left: -1px;
                    top: 10px;
                    width: 157px;
                    height: 364px;
                    image-rendering: pixelated;
                    user-select: none;
                }
                /* Little life on hover: the standing sprite leans in */
                .pass-stage:hover .pass-back {
                    box-shadow: 0 60px 100px rgba(0, 0, 0, 0.55), 0 0 0 2px rgba(70, 193, 230, 0.55), inset 0 0 0 10px #1b4f72;
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



                @media (prefers-reduced-motion: reduce) {
                    .pass-float {
                        animation: none;
                    }
                    .pass-lift,
                    .pass-stage:hover .pass-lift {
                        transform: none;
                    }
                    .pass-flip {
                        transition-duration: 0.01ms;
                    }
                    .pass-face {
                        transition-delay: 0ms;
                    }
                    .pass-depth.depth-a,
                    .pass-depth.depth-b {
                        animation: none;
                    }
                }
            `}</style>
        </div>
    );
}
