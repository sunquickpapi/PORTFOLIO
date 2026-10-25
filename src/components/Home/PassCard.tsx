"use client";

import { useEffect, useRef, useState } from "react";
import { Courier_Prime, Black_Ops_One, JetBrains_Mono } from "next/font/google";
import { Coffee, Github, Instagram, Linkedin, Trophy, X, Zap } from "lucide-react";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const blackOps = Black_Ops_One({ subsets: ["latin"], weight: "400", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: "700", display: "swap" });

/** Native design size from Claude design; the card is scaled to fit its column. */
const W = 900;
const H = 440;
/** Flip duration. The easing is symmetric, so the card is exactly edge-on at FLIP_MS / 2. */
const FLIP_MS = 800;

/**
 * Empty spots in the middle panel where the stat stamps can land (centre x/y in px,
 * measured from the panel's top-left). Three are picked at random on every load and
 * every time the card turns back to the front, so the stamps never sit the same way twice.
 */
const STAMP_SLOTS = [
    { x: 272, y: 34 }, // beside the "Who is he ?" stamp
    { x: 80, y: 150 },
    { x: 196, y: 128 },
    { x: 128, y: 236 },
    { x: 252, y: 222 },
];
type StampPos = { slot: number; x: number; y: number; rot: number; size: number; shown: boolean; tagBelow: boolean; tagAlign: "left" | "center" | "right" };
const rand = (a: number, b: number) => a + Math.random() * (b - a);
/** Slow fade, and how long a stamp stays on the card before drifting off to a new spot. */
const STAMP_FADE_MS = 1800;
function placeStamp(taken: number[]): StampPos {
    const free = STAMP_SLOTS.map((_, i) => i).filter((i) => !taken.includes(i));
    const slot = free[Math.floor(Math.random() * free.length)];
    const x = STAMP_SLOTS[slot].x + rand(-8, 8);
    const y = STAMP_SLOTS[slot].y + rand(-6, 6);
    return {
        slot,
        x,
        y,
        rot: rand(-18, 18),
        size: Math.round(rand(76, 92)),
        shown: false,
        tagBelow: y < 110, // no room above near the top edge
        tagAlign: x < 120 ? "left" : x > 228 ? "right" : "center",
    };
}

/**
 * "Pixel Pass" ID card for the hero. Floats gently, tilts toward the cursor with a
 * glare highlight on hover, and flips to the back on click / Enter / Space.
 */
type Socials = { linkedin?: string | null; github?: string | null; instagram?: string | null };
type Stats = { projects?: string | number | null; years?: string | number | null; coffee?: string | number | null };
type Route = { from?: string | null; to?: string | null };

export default function PassCard({
    socials = {},
    stats = {},
    route = {},
    onAbout,
}: {
    socials?: Socials;
    stats?: Stats;
    route?: Route;
    onAbout?: () => void;
}) {
    const routeFrom = (route.from ?? "MLK").trim();
    const routeTo = (route.to ?? "KDH").trim();
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
    // Stat zoom: the clicked stamp grows into a panel over the whole front face
    const frontRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const [zoomIdx, setZoomIdx] = useState(0); // last opened stat (kept while zooming out)
    const [zoomOrigin, setZoomOrigin] = useState({ x: 450, y: 220 });
    const [closeHover, setCloseHover] = useState(false);

    // Same position-based hit test as the stamps (reliable inside the tilted card)
    const aboutAt = (x: number, y: number) => {
        const el = aboutRef.current;
        if (back || !el || openStat !== null) return false;
        const r = el.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };
    const goToAbout = () => {
        if (onAbout) return onAbout();
        window.location.assign("/about");
    };
    const stickerRefs = useRef<(HTMLButtonElement | null)[]>([]);
    // Each stamp loops on its own: fade in slowly at a random free spot, stay a while,
    // fade out slowly, then come back somewhere else. A stamp being hovered or read stays put.
    const [stamps, setStamps] = useState<(StampPos | null)[]>([null, null, null]);
    const stampsRef = useRef(stamps);
    stampsRef.current = stamps;
    const pinRef = useRef({ open: null as number | null, hover: -1 });
    pinRef.current = { open: openStat, hover: hoverStat };
    useEffect(() => {
        if (back) return;
        let alive = true;
        const timers: number[] = [];
        const later = (fn: () => void, ms: number) => {
            timers.push(window.setTimeout(() => alive && fn(), ms));
        };
        const update = (i: number, fn: (s: StampPos | null) => StampPos | null) =>
            setStamps((all) => {
                const next = [...all];
                next[i] = fn(all[i]);
                stampsRef.current = next;
                return next;
            });
        const place = (i: number) => {
            const taken = stampsRef.current.flatMap((st, j) => (j !== i && st ? [st.slot] : []));
            update(i, () => placeStamp(taken));
            later(() => show(i), 80); // let the hidden position land before fading in
        };
        const show = (i: number) => {
            update(i, (st) => st && { ...st, shown: true });
            later(() => hide(i), STAMP_FADE_MS + rand(3800, 6500));
        };
        const hide = (i: number) => {
            const pin = pinRef.current;
            if (pin.open === i || pin.hover === i) return later(() => hide(i), 900);
            update(i, (st) => st && { ...st, shown: false });
            later(() => place(i), STAMP_FADE_MS + rand(400, 1400));
        };
        // first appearance: random order, staggered (after a flip, wait for the front to face us)
        const start = stampsRef.current.some(Boolean) ? FLIP_MS / 2 + 100 : 400;
        [0, 1, 2]
            .sort(() => Math.random() - 0.5)
            .forEach((i, k) => later(() => place(i), start + k * 700 + rand(0, 400)));
        return () => {
            alive = false;
            timers.forEach(clearTimeout);
            setStamps((all) => all.map((st) => st && { ...st, shown: false }));
        };
    }, [back]);

    const stickerAt = (x: number, y: number) => {
        if (back || openStat !== null) return -1;
        return stickerRefs.current.findIndex((el, i) => {
            if (!el || !stampsRef.current[i]?.shown) return false; // faded-out stamps can't be hit
            const r = el.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const rad = Math.min(r.width, r.height) / 2;
            return (x - cx) ** 2 + (y - cy) ** 2 <= rad * rad;
        });
    };

    const closeAt = (x: number, y: number) => {
        const el = closeRef.current;
        if (openStat === null || !el) return false;
        const r = el.getBoundingClientRect();
        return x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 6 && y <= r.bottom + 6;
    };
    // Open the zoom from the stamp's own position on the face (offsets ignore the 3D tilt)
    const openZoom = (i: number) => {
        let el: HTMLElement | null = stickerRefs.current[i];
        const face = frontRef.current;
        if (el && face) {
            let x = el.offsetWidth / 2;
            let y = el.offsetHeight / 2;
            while (el && el !== face) {
                x += el.offsetLeft;
                y += el.offsetTop;
                el = el.offsetParent as HTMLElement | null;
            }
            setZoomOrigin({ x, y });
        }
        setZoomIdx(i);
        setOpenStat(i);
    };
    const closeZoom = () => {
        setOpenStat(null);
        setCloseHover(false);
    };

    // Escape zooms back out
    useEffect(() => {
        if (openStat === null) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeZoom();
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
        const overClose = closeAt(e.clientX, e.clientY);
        if (overClose !== closeHover) setCloseHover(overClose);
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
        setCloseHover(false);
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
                    // While a stat is zoomed in, only the ✕ does anything (no flipping underneath)
                    if (openStat !== null) {
                        if (closeAt(e.clientX, e.clientY)) closeZoom();
                        return;
                    }
                    // A click inside a stamp zooms into it, even if Chrome reports the card as the target
                    if (aboutAt(e.clientX, e.clientY)) {
                        e.preventDefault();
                        goToAbout();
                        return;
                    }
                    const hit = stickerAt(e.clientX, e.clientY);
                    if (hit >= 0) {
                        openZoom(hit);
                        return;
                    }
                    flip();
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (openStat !== null) closeZoom();
                        else flip();
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
                                <div ref={frontRef} className="pass-face pass-front" aria-hidden={back}>
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
                                                <span>Who is he ?</span>
                                            </a>
                                        </div>
                                        <div className="pf-stickers">
                                            {statItems.map(({ label, value, stamp }, i) => {
                                                const open = openStat === i;
                                                const pos = stamps[i];
                                                if (!pos) return null;
                                                return (
                                                    <div
                                                        key={label}
                                                        className={`pf-sticker-wrap pf-sticker-${i} tag-${pos.tagAlign} ${pos.shown ? "is-shown" : ""} ${pos.tagBelow ? "tag-below" : ""} ${open ? "is-open" : ""} ${hoverStat === i ? "is-hover" : ""}`}
                                                        style={
                                                            {
                                                                left: pos.x - pos.size / 2,
                                                                top: pos.y - pos.size / 2,
                                                                "--size": `${pos.size}px`,
                                                                "--rot": `${pos.rot.toFixed(1)}deg`,
                                                            } as React.CSSProperties
                                                        }
                                                    >
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
                                                                if (open) closeZoom();
                                                                else openZoom(i);
                                                            }}
                                                            onKeyDown={(e) => e.stopPropagation()}
                                                        >
                                                            {/* Postmark ink stamp, pre-rendered as an image so it stays crisp and stable while the card moves */}
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img className="pf-stamp-img" src={`/assets/passcard/pass-stamp-${stamp}.png`} alt="" draggable={false} />
                                                        </button>
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
                                            {/* where from, where to (editable in Admin → Profile) */}
                                            {(routeFrom || routeTo) && (
                                                <span
                                                    className="pf-route"
                                                    role="img"
                                                    aria-label={`From ${routeFrom} to ${routeTo}`}
                                                    // longer place names shrink so they never reach the character
                                                    style={{ fontSize: Math.max(12, Math.min(19, 152 / Math.max(1, routeFrom.length + routeTo.length + 2))) }}
                                                >
                                                    {routeFrom && <span>{routeFrom}</span>}
                                                    {routeFrom && routeTo && <span className="pf-route-arrow">→</span>}
                                                    {routeTo && <span>{routeTo}</span>}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pf-right">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img className="pf-sprite" src="/assets/passcard/pass-sprite.webp" alt="" draggable={false} />
                                    </div>

                                    {/* Stat zoom: icon on the left, number and label on the right */}
                                    <div
                                        className={`pf-zoom ${openStat !== null ? "is-open" : ""}`}
                                        style={{ transformOrigin: `${zoomOrigin.x}px ${zoomOrigin.y}px` }}
                                        role="dialog"
                                        aria-modal="false"
                                        aria-hidden={openStat === null}
                                        aria-label={`${statItems[zoomIdx].label}: ${statItems[zoomIdx].value}+`}
                                    >
                                        <div className="pf-zoom-icon">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={`/assets/passcard/pass-stamp-${statItems[zoomIdx].stamp}.png`} alt="" draggable={false} />
                                        </div>
                                        <div className="pf-zoom-text">
                                            <span className="pf-zoom-kicker">STAT N°0{zoomIdx + 1}</span>
                                            <span className="pf-zoom-value">{statItems[zoomIdx].value}+</span>
                                            <span className="pf-zoom-rule" />
                                            <span className="pf-zoom-label">{statItems[zoomIdx].label}</span>
                                        </div>
                                        <button
                                            ref={closeRef}
                                            type="button"
                                            className={`pf-zoom-close ${closeHover ? "is-hover" : ""}`}
                                            aria-label="Close"
                                            tabIndex={openStat !== null ? 0 : -1}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                closeZoom();
                                            }}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        >
                                            <X size={24} strokeWidth={2.4} />
                                        </button>
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
                    position: relative;
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
                /* Stats as ink stamps scattered over the empty space; tap one to reveal its tag */
                .pf-stickers {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }
                .pf-sticker-wrap {
                    position: absolute;
                    opacity: 0;
                    transform: scale(0.94);
                    pointer-events: none;
                    transition: opacity 1.8s ease-in-out, transform 2.4s cubic-bezier(0.2, 0.7, 0.2, 1);
                }
                /* Slow-motion fade in, and the same slow fade back out */
                .pf-sticker-wrap.is-shown {
                    opacity: 1;
                    transform: scale(1);
                    pointer-events: auto;
                }
                .pf-sticker-wrap.is-hover,
                .pf-sticker-wrap.is-open {
                    z-index: 2;
                }
                .pf-sticker {
                    display: block;
                    width: var(--size, 86px);
                    height: var(--size, 86px);
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
                    transform: rotate(var(--rot, 0deg));
                    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
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

                /* Stat zoom panel: grows out of the clicked stamp to fill the front face */
                .pf-zoom {
                    position: absolute;
                    inset: 0;
                    z-index: 5;
                    display: flex;
                    align-items: center;
                    gap: 64px;
                    padding: 0 110px 0 96px;
                    border-radius: inherit;
                    background: radial-gradient(120% 90% at 22% 50%, #f4f7f8 0%, #e9eef0 55%, #e1e8eb 100%);
                    opacity: 0;
                    transform: scale(0.1);
                    pointer-events: none;
                    /* zooming out: shrink back into the stamp, fading only at the very end */
                    transition: transform 0.55s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.18s ease 0.4s;
                }
                .pf-zoom.is-open {
                    opacity: 1;
                    transform: scale(1);
                    pointer-events: auto;
                    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.16s ease;
                }
                /* faint dashed frame, like the card's postmark lines */
                .pf-zoom::before {
                    content: "";
                    position: absolute;
                    inset: 22px;
                    border: 2px dashed rgba(27, 79, 114, 0.22);
                    border-radius: 20px;
                    pointer-events: none;
                }
                .pf-zoom-icon {
                    flex: none;
                    width: 250px;
                    height: 250px;
                    transform: scale(0.8) rotate(-14deg);
                    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .pf-zoom.is-open .pf-zoom-icon {
                    transform: scale(1) rotate(-6deg);
                    transition-delay: 0.08s;
                }
                .pf-zoom-icon img {
                    display: block;
                    width: 100%;
                    height: 100%;
                    user-select: none;
                    pointer-events: none;
                }
                .pf-zoom-text {
                    display: flex;
                    flex-direction: column;
                    color: #0d2a42;
                    opacity: 0;
                    transform: translateX(-18px);
                    transition: opacity 0.2s ease, transform 0.4s ease;
                }
                .pf-zoom.is-open .pf-zoom-text {
                    opacity: 1;
                    transform: none;
                    transition: opacity 0.4s ease 0.28s, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.26s;
                }
                .pf-zoom-kicker {
                    font-size: 15px;
                    font-weight: 700;
                    letter-spacing: 4px;
                    color: #3a7ca5;
                }
                .pf-zoom-value {
                    margin-top: 6px;
                    font-size: 112px;
                    font-weight: 700;
                    line-height: 0.95;
                    letter-spacing: -2px;
                    color: #0d2a42;
                }
                .pf-zoom-rule {
                    width: 72px;
                    height: 0;
                    margin: 18px 0 16px;
                    border-top: 3px dashed #1b4f72;
                    opacity: 0.6;
                }
                .pf-zoom-label {
                    font-size: 24px;
                    font-weight: 700;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                    color: #1b4f72;
                    max-width: 340px;
                    line-height: 1.25;
                }
                .pf-zoom-close {
                    position: absolute;
                    top: 40px;
                    right: 44px;
                    width: 56px;
                    height: 56px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    border-radius: 50%;
                    border: 2.5px solid #0d2a42;
                    background: transparent;
                    color: #0d2a42;
                    cursor: pointer;
                    opacity: 0;
                    transform: scale(0.7) rotate(-90deg);
                    transition: transform 0.35s ease, opacity 0.15s ease, background 0.2s ease, color 0.2s ease;
                }
                .pf-zoom.is-open .pf-zoom-close {
                    opacity: 1;
                    transform: none;
                    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.35s, opacity 0.3s ease 0.35s, background 0.2s ease,
                        color 0.2s ease;
                }
                .pf-zoom.is-open .pf-zoom-close.is-hover,
                .pf-zoom.is-open .pf-zoom-close:focus-visible {
                    background: #0d2a42;
                    color: #e9eef0;
                    transform: rotate(90deg);
                    transition-delay: 0s;
                }
                .pf-zoom-close:focus-visible {
                    outline: 2px dashed #46c1e6;
                    outline-offset: 3px;
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
                /* Keep the lettering clear: the worn-ink texture only scuffs the frame */
                .pf-about > span {
                    position: relative;
                    z-index: 1;
                }
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
                /* Route line, e.g. "MLK → KDH": bold sans, set apart from the icons */
                .pf-route {
                    margin-left: 26px;
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 19px;
                    font-weight: 600;
                    letter-spacing: 0.4px;
                    line-height: 1;
                    text-transform: uppercase;
                    white-space: nowrap;
                    color: #0d2a42;
                    opacity: 0.88;
                    pointer-events: none;
                    user-select: none;
                }
                .pf-route-arrow {
                    font-weight: 500;
                    color: #1b4f72;
                    transform: translateY(-1px);
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
                    .pf-sticker-wrap {
                        transform: none;
                        transition: opacity 0.6s ease;
                    }
                    .pf-zoom,
                    .pf-zoom.is-open,
                    .pf-zoom-icon,
                    .pf-zoom-text,
                    .pf-zoom-close {
                        transition-duration: 0.01ms !important;
                        transition-delay: 0s !important;
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
