"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Courier_Prime } from "next/font/google";
import FileLink from "./FileLink";
import SnippetPrint from "./SnippetPrint";
import { preloadPrints } from "@/app/snippets/snippetCode";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

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
    created_at: string;
}

function getPlaygroundUrl(snippet: Snippet): string {
    if (snippet.playground_url) return snippet.playground_url;
    const t = snippet.title.toLowerCase();
    if (t.includes("scroll") || t.includes("reveal")) return "/snippet-playground/preview-scroll.html";
    if (t.includes("magnetic") || t.includes("hover")) return "/snippet-playground/preview-magnetic.html";
    if (t.includes("clipboard") || t.includes("copy")) return "/snippet-playground/preview-clipboard.html";
    if (t.includes("debounce") || t.includes("cancel")) return "/snippet-playground/preview-debounce.html";
    if (t.includes("glass") || t.includes("morphism")) return "/snippet-playground/preview-glass.html";
    return "/snippet-playground/preview-scroll.html";
}

function ScaledPreviewIframe({ src, title, containerWidth, baseWidth = 1200, baseHeight = 630, visibleHeight }: {
    src: string; title: string; containerWidth: number; baseWidth?: number; baseHeight?: number; visibleHeight?: number;
}) {
    const scale = containerWidth > 0 ? containerWidth / baseWidth : 0;
    const cropHeight = visibleHeight ?? baseHeight;
    return (
        <div style={{ position: "relative", width: "100%", aspectRatio: `${baseWidth} / ${cropHeight}`, overflow: "hidden", background: "#f8fafc" }}>
            <iframe
                src={src}
                title={title}
                style={{
                    position: "absolute", top: 0, left: 0,
                    width: `${baseWidth}px`, height: `${baseHeight}px`,
                    transform: scale > 0 ? `scale(${scale})` : "none",
                    transformOrigin: "top left",
                    pointerEvents: "none", border: "none",
                    opacity: scale > 0 ? 1 : 0,
                }}
            />
        </div>
    );
}

/** Steel paperclip holding the preview print onto the sheet. */
function Paperclip() {
    return (
        <svg className="snip-clip" viewBox="0 0 24 64" aria-hidden="true">
            <path
                d="M8 22 V10 a5 5 0 0 1 10 0 V48 a8 8 0 0 1 -16 0 V16 a3 3 0 0 1 6 0 V44"
                fill="none"
                stroke="url(#snipClipSteel)"
                strokeWidth="2.6"
                strokeLinecap="round"
            />
            <defs>
                <linearGradient id="snipClipSteel" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#c9d5de" />
                    <stop offset=".45" stopColor="#7d93a4" />
                    <stop offset="1" stopColor="#4f6577" />
                </linearGradient>
            </defs>
        </svg>
    );
}

/** A page turn: mounted hidden first ("ready" false) until its prints are drawn, then it runs. */
type Turn = { dir: 1 | -1; t0: number; base: number; ready: boolean; settling?: boolean } | null;
const FLIP_MS = 1100;
const AUTO_MS = 5200;
const BOOK_H = 470;

const formatDate = (dateStr?: string) => {
    if (!dateStr) return "JUNE 2026";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
};

/** One ruled notebook page: the preview print clipped on, then the snippet's details. */
function Page({ snippet, side, blank }: { snippet?: Snippet; side: "left" | "right"; blank?: boolean }) {
    return (
        <div className={`nbp nbp-${side}`}>
            <span className="nbp-holes" aria-hidden="true" />
            {snippet ? (
                <div className="nbp-body">
                    <div className="nbp-print">
                        <SnippetPrint
                            snippet={snippet}
                            fallback={<ScaledPreviewIframe src={getPlaygroundUrl(snippet)} title={`${snippet.title} Preview`} containerWidth={256} />}
                        />
                        <Paperclip />
                    </div>
                    <div className="snippet-badges">
                        <span className="snippet-lang-badge">{snippet.language}</span>
                        <span className="snippet-cat-badge">{snippet.category || "utility"}</span>
                    </div>
                    <h3 className="nbp-title">{snippet.title}</h3>
                    <p className="nbp-date">{formatDate(snippet.created_at)}</p>
                    <div className="nbp-tags">
                        {snippet.tags?.split(",").slice(0, 3).map((t: string) => (
                            <span key={t} className="nbp-tag">
                                #{t.trim()}
                            </span>
                        ))}
                    </div>
                </div>
            ) : blank ? (
                <div className="nbp-body nbp-end">
                    <span className="nbp-end-k">END OF NOTES</span>
                    <Link href="/snippets" className="nbp-end-link">
                        Browse the full vault →
                    </Link>
                </div>
            ) : null}
        </div>
    );
}

/**
 * Snippets as an open spiral notebook: two snippets per spread, one per ruled page.
 * Every few seconds the right page lifts and turns over the spiral, one page at a time
 * (click the right page to turn forward, the left page to turn back).
 */
export default function Snippets() {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [loading, setLoading] = useState(true);
    const [spread, setSpread] = useState(0);
    const [turn, setTurn] = useState<Turn>(null);
    const [scale, setScale] = useState(1);
    const [single, setSingle] = useState(false); // phones: one page at a time, spiral on the left
    const singleRef = useRef(false);
    const wrapRef = useRef<HTMLDivElement>(null);
    const hoverRef = useRef(false);
    // desktop: the book waits closed at the left, then slides to the middle and opens when the
    // section scrolls into view (once). "closed" → "opening" → "open"
    const [intro, setIntro] = useState<"closed" | "opening" | "open">("closed");
    const [shift, setShift] = useState(0);
    const fileRowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch("/api/snippets")
            .then((res) => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setSnippets(data);
                    preloadPrints(data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // fit the book to the screen: the open 760px spread (as big as the screen allows, with the
    // View All slip under it on the same screen), or on phones a single 390px page
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const fit = () => {
            const w = el.clientWidth;
            const one = w < 600;
            // phones: the book (and its cover) stays inside the container's side padding
            const cs = getComputedStyle(el);
            const inner = w - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
            if (singleRef.current !== one) {
                singleRef.current = one;
                setSingle(one);
                setSpread(0); // spreads and single pages count differently
            }
            if (one) {
                setScale(Math.min(1, inner / 412));
                return;
            }
            const fileH = fileRowRef.current?.offsetHeight ?? 70;
            // the section's padding (124 top, clear of the nav bar; 40 bottom) and the 36px gap above the slip
            const room = window.innerHeight - 124 - 40 - 36 - fileH - 24;
            const s = Math.max(0.5, Math.min(1.6, (w - 8) / 780, room / (BOOK_H + 12)));
            setScale(s);
            // closed, only the right half (the front cover) shows; it waits towards the left side
            const closedCentre = w / 2 + 205 * s;
            const target = Math.max(w * 0.22, 205 * s + 16);
            setShift(Math.round(target - closedCentre));
        };
        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(el);
        window.addEventListener("resize", fit);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", fit);
        };
    }, [loading]);

    // play the opening once, when most of the section is on screen
    useEffect(() => {
        if (loading || intro !== "closed") return;
        const el = wrapRef.current;
        if (!el) return;
        if (single || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setIntro("open");
            return;
        }
        const io = new IntersectionObserver(
            ([en]) => {
                if (!en.isIntersecting) return;
                io.disconnect();
                setIntro("opening");
                window.setTimeout(() => setIntro("open"), 2300);
            },
            { threshold: 0.45 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [loading, single, intro]);

    const n = snippets.length;
    const spreads = Math.max(1, single ? n : Math.ceil(n / 2));
    const at = (i: number) => (i >= 0 && i < n ? snippets[i] : undefined);
    const mod = (v: number) => ((v % spreads) + spreads) % spreads;

    const flip = useCallback(
        (dir: 1 | -1) => {
            if (turn || spreads < 2) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setSpread((s) => mod(s + dir));
            setTurn({ dir, t0: performance.now(), base: spread, ready: false });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [turn, spreads, spread]
    );

    // 1) the leaf mounts invisible; once its prints are decoded, start the turn on the next frame
    const leafRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!turn || turn.ready) return;
        let live = true;
        const imgs = Array.from(leafRef.current?.querySelectorAll("img") || []);
        const decoded = Promise.all(imgs.map((i) => (i.decode ? i.decode().catch(() => {}) : Promise.resolve())));
        const cap = new Promise((r) => window.setTimeout(r, 250)); // never hold a turn longer than this
        Promise.race([decoded, cap]).then(() => requestAnimationFrame(() => live && setTurn((t) => (t && !t.ready ? { ...t, ready: true } : t))));
        return () => {
            live = false;
        };
    }, [turn]);

    // 2) when the turn has played, move to the new spread but keep the landed leaf on top
    const turnDir = turn?.ready && !turn.settling ? turn.dir : 0;
    useEffect(() => {
        if (!turnDir) return;
        const id = window.setTimeout(() => {
            setSpread((s) => mod(s + turnDir));
            setTurn((t) => (t ? { ...t, settling: true } : t));
        }, FLIP_MS);
        return () => window.clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [turnDir]);

    // 3) lift the leaf away only once the pages underneath have drawn their new prints
    const bookRef = useRef<HTMLDivElement>(null);
    const settling = !!turn?.settling;
    useEffect(() => {
        if (!settling) return;
        let live = true;
        const imgs = Array.from(bookRef.current?.querySelectorAll(".nb-side img") || []) as HTMLImageElement[];
        const decoded = Promise.all(imgs.map((i) => (i.decode ? i.decode().catch(() => {}) : Promise.resolve())));
        const cap = new Promise((r) => window.setTimeout(r, 250));
        Promise.race([decoded, cap]).then(() => requestAnimationFrame(() => live && setTurn(null)));
        return () => {
            live = false;
        };
    }, [settling]);

    const introRef = useRef(intro);
    introRef.current = intro;
    // turn a page every few seconds (not while the pointer rests on the book)
    useEffect(() => {
        if (spreads < 2) return;
        const id = window.setInterval(() => {
            if (!hoverRef.current && introRef.current === "open" && document.visibilityState === "visible") flip(1);
        }, AUTO_MS);
        return () => window.clearInterval(id);
    }, [flip, spreads]);

    if (loading)
        return (
            <section id="snippets" className="py-20 flex items-center justify-center">
                <div className="animate-pulse text-[var(--color-text-muted)] text-xl font-bold">Loading Snippets...</div>
            </section>
        );
    if (n === 0) return null;

    // what each surface shows
    const cur = spread;
    const next = mod(spread + 1);
    const prev = mod(spread - 1);
    const L = (sp: number) => at(sp * 2);
    const R = (sp: number) => (single ? at(sp) : at(sp * 2 + 1));
    const blankR = (sp: number) => !single && sp * 2 + 1 >= n; // odd count: last right page is the "end" page
    // forward: the current right page turns over; its back is the next left page
    // back: the current left page turns back; its front is the previous right page
    // the pages under the leaf only change once the leaf is visible and covering them
    const live = turn?.ready && !turn.settling ? turn : null;
    const leftStatic = live?.dir === -1 ? prev : cur;
    const rightStatic = live?.dir === 1 ? next : cur;
    // the leaf's faces belong to the spread the turn started from (the book may already have moved on while it settles)
    // between turns the leaf stays mounted, almost transparent, already showing the next forward
    // turn's pages, so iOS Safari has its layer and prints drawn before the page starts to move
    // (creating them mid-turn made the page blink)
    const base = turn ? turn.base : cur;
    const leafDir = turn ? turn.dir : 1;
    const leafFront = leafDir === 1 ? base : mod(base - 1); // right-hand face
    const leafBack = leafDir === 1 ? mod(base + 1) : base; // left-hand face

    return (
        <section id="snippets" style={{ scrollMarginTop: 0 }}>
            <div className="snippets-main-container" ref={wrapRef}>
                <div
                    className={`nb-fit ${!single && intro !== "open" ? `nb-intro is-${intro}` : ""}`}
                    style={{ height: (BOOK_H + 12) * scale, ["--nb-shift" as string]: `${shift}px`, ["--nb-mid" as string]: `${Math.round(-205 * scale)}px` }}
                >
                    <div
                        className={`nb-book ${single ? "is-single" : ""}`}
                        ref={bookRef}
                        style={{ transform: `translateX(-50%) scale(${scale})` }}
                        onPointerEnter={() => (hoverRef.current = true)}
                        onPointerLeave={() => (hoverRef.current = false)}
                    >
                        <div className="nb-cover" aria-hidden="true" />
                        {!single && intro !== "open" && (
                            // the front cover: shut over the right-hand page, it swings open over the spine
                            <div className="nb-front" aria-hidden="true">
                                <div className="nb-front-face">
                                    <span className={`nb-front-k ${courier.className}`}>FILE:: N°04</span>
                                    <span className="nb-front-t">Snippets</span>
                                    <span className={`nb-front-s ${courier.className}`}>CODE · NOTES · EXPERIMENTS</span>
                                    <span className="nb-front-logo">FVL</span>
                                </div>
                                <div className="nb-front-back" />
                            </div>
                        )}
                        {!single && (
                            <div className="nb-side nb-left" onClick={() => flip(-1)} title="Previous page">
                                <Page snippet={L(leftStatic)} side="left" />
                            </div>
                        )}
                        <div
                            className="nb-side nb-right"
                            onClick={(e) => {
                                // one-page notebook: tap the left third to go back, anywhere else to go on
                                const r = e.currentTarget.getBoundingClientRect();
                                const tappedLeft = e.detail > 0 && e.clientX - r.left < r.width / 3; // keyboard "clicks" have no position
                                flip(single && tappedLeft ? -1 : 1);
                            }}
                            title="Next page"
                        >
                            <Page snippet={R(rightStatic)} side="right" blank={blankR(rightStatic)} />
                        </div>

                        {/* the turning page */}
                        {spreads > 1 && (
                            <div
                                ref={leafRef}
                                className={`nb-leaf ${leafDir === 1 ? "is-fwd" : "is-back"} ${!turn ? "is-idle" : turn.ready ? "" : "is-prep"}`}
                                aria-hidden="true"
                            >
                                <div className="nb-face nb-face-front">
                                    <Page snippet={R(leafFront)} side="right" blank={blankR(leafFront)} />
                                    <span className="nb-shade" />
                                </div>
                                <div className="nb-face nb-face-back">
                                    {/* one-page notebook: the back of a turned page is blank paper */}
                                    <Page snippet={single ? undefined : L(leafBack)} side="left" />
                                    <span className="nb-shade" />
                                </div>
                            </div>
                        )}

                        {/* spiral wire binding */}
                        <div className="nb-spiral" aria-hidden="true">
                            {Array.from({ length: 21 }).map((_, i) => (
                                <span key={i} className="nb-coil" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="file-link-row" ref={fileRowRef} style={{ marginTop: 36 }}>

                    <FileLink href="/snippets" no="04" title="View All Snippets" />

                </div>
            </div>

            <style jsx>{`
                /* one full screen: the notebook sits in the middle (top padding clears the nav bar) */
                #snippets {
                    position: relative;
                    min-height: 100vh;
                    min-height: 100svh;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 96px 0 40px;
                    overflow: hidden;
                }
                @media (min-width: 600px) {
                    #snippets {
                        padding-top: 124px;
                    }
                }
                .snippets-main-container {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }
                .nb-fit {
                    position: relative;
                }
                /* ---- desktop opening: closed at the left → slides to the middle → cover swings open ---- */
                .nb-intro.is-closed .nb-book {
                    translate: var(--nb-shift) 0;
                }
                /* the closed book slides to the middle of the page, then eases left as it opens so the
                   open spread ends up centred */
                .nb-intro.is-opening .nb-book {
                    animation: nb-arrive 2.05s both;
                }
                @keyframes nb-arrive {
                    0% {
                        translate: var(--nb-shift) 0;
                        animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
                    }
                    44% {
                        translate: var(--nb-mid) 0;
                        animation-timing-function: cubic-bezier(0.55, 0.05, 0.3, 1);
                    }
                    100% {
                        translate: 0 0;
                    }
                }
                .nb-front {
                    position: absolute;
                    top: -9px;
                    bottom: -11px;
                    left: 380px;
                    width: 390px;
                    z-index: 20;
                    transform-origin: 0 50%;
                    transform-style: preserve-3d;
                    transition: transform 1.15s cubic-bezier(0.55, 0.05, 0.3, 1) 0.9s;
                }
                .nb-intro.is-opening .nb-front {
                    transform: rotateY(-180deg);
                }
                /* (fading the faces, not .nb-front: opacity on a 3D parent would flatten it and show
                   the front's text mirrored through the back) */
                .nb-intro.is-opening .nb-front-back {
                    opacity: 0;
                    transition: opacity 0.3s ease 1.9s;
                }
                .nb-front-face,
                .nb-front-back {
                    position: absolute;
                    inset: 0;
                    border-radius: 4px 10px 10px 4px;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
                .nb-front-face {
                    display: flex;
                    flex-direction: column;
                    padding: 44px 40px 36px 48px;
                    color: #e9f4fa;
                    background: radial-gradient(120% 70% at 85% 10%, rgba(70, 193, 230, 0.18), transparent 60%),
                        linear-gradient(160deg, #1f4663 0%, #0d2a42 60%, #0a2135 100%);
                    box-shadow: inset 6px 0 10px -6px rgba(0, 0, 0, 0.5), 0 30px 50px -26px rgba(13, 42, 66, 0.6);
                }
                .nb-front-face::before {
                    content: "";
                    position: absolute;
                    inset: 16px 16px 16px 22px;
                    border: 1.5px dashed rgba(233, 244, 250, 0.28);
                    border-radius: 8px;
                    pointer-events: none;
                }
                .nb-front-k {
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.24em;
                    color: #8fc3dc;
                }
                .nb-front-t {
                    margin-top: 14px;
                    font-size: 46px;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    line-height: 1;
                }
                .nb-front-s {
                    margin-top: 12px;
                    font-size: 11px;
                    letter-spacing: 0.2em;
                    color: rgba(233, 244, 250, 0.65);
                }
                .nb-front-logo {
                    margin-top: auto;
                    align-self: flex-end;
                    font-size: 30px;
                    font-weight: 900;
                    letter-spacing: 0.06em;
                    color: rgba(233, 244, 250, 0.22);
                    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.08), 0 -1px 0 rgba(0, 0, 0, 0.35);
                }
                .nb-front-back {
                    transform: rotateY(180deg);
                    border-radius: 10px 4px 4px 10px;
                    background: linear-gradient(200deg, #1b3d57 0%, #0d2a42 70%);
                }
                /* while closed only the right half of the book exists: the back cover's left half and
                   the left-hand page appear as the front cover swings across */
                .nb-intro .nb-cover {
                    transition: clip-path 1.15s cubic-bezier(0.55, 0.05, 0.3, 1) 0.9s;
                }
                .nb-intro.is-closed .nb-cover {
                    clip-path: inset(-40px -40px -40px 50%);
                }
                .nb-intro.is-opening .nb-cover {
                    clip-path: inset(-40px -40px -40px 0);
                }
                .nb-intro .nb-left {
                    transition: opacity 0.5s ease 1.45s;
                }
                .nb-intro.is-closed .nb-left {
                    opacity: 0;
                }
                .nb-book {
                    position: absolute;
                    left: 50%;
                    top: 0;
                    width: 760px;
                    height: ${BOOK_H}px;
                    transform-origin: top center;
                    perspective: 2200px;
                }
                /* phones: a single page with the spiral down its left edge */
                .nb-book.is-single {
                    width: 390px;
                }
                .nb-book.is-single .nb-leaf {
                    left: 20px;
                }
                .nb-book.is-single .nb-spiral {
                    left: 10px;
                }
                /* the back of a page turned off the book fades away (forward) or in (back) */
                .nb-book.is-single .nb-face-back {
                    animation: nb-away ${FLIP_MS}ms linear both;
                }
                .nb-book.is-single .nb-leaf.is-back .nb-face-back {
                    animation-name: nb-back-in;
                }
                @keyframes nb-away {
                    0%,
                    55% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                    }
                }
                @keyframes nb-back-in {
                    0% {
                        opacity: 0;
                    }
                    45%,
                    100% {
                        opacity: 1;
                    }
                }
                /* hard cover peeking out around the pages, in the site's navy */
                .nb-cover {
                    position: absolute;
                    inset: -9px -10px -11px;
                    border-radius: 10px;
                    background: linear-gradient(160deg, #1b3d57 0%, #0d2a42 60%, #0a2135 100%);
                    box-shadow: 0 30px 50px -26px rgba(13, 42, 66, 0.55), 0 0 0 1px rgba(13, 42, 66, 0.2);
                }
                .nb-side,
                .nb-leaf {
                    position: absolute;
                    top: 0;
                    width: 370px;
                    height: ${BOOK_H}px;
                }
                .nb-left {
                    left: 0;
                    cursor: w-resize;
                }
                .nb-right {
                    right: 0;
                    cursor: e-resize;
                }
                /* the leaf hinges on the spine */
                .nb-leaf {
                    left: 390px;
                    z-index: 5;
                    pointer-events: none; /* it lies over the right page between turns */
                    will-change: transform;
                    transform-style: preserve-3d;
                    transform-origin: -10px 50%;
                    animation: nb-turn ${FLIP_MS}ms cubic-bezier(0.45, 0.05, 0.25, 1) both;
                }
                .nb-leaf.is-back {
                    animation-name: nb-turn-back;
                }
                /* between turns, or waiting for its prints: not moving and practically invisible.
                   (not opacity 0 / hidden: Safari would then skip drawing it until the turn starts) */
                .nb-leaf.is-idle,
                .nb-leaf.is-prep,
                .nb-leaf.is-idle :global(.nb-shade),
                .nb-leaf.is-prep :global(.nb-shade),
                .nb-book.is-single .nb-leaf.is-idle .nb-face-back,
                .nb-book.is-single .nb-leaf.is-prep .nb-face-back {
                    animation: none;
                }
                .nb-leaf.is-idle,
                .nb-leaf.is-prep {
                    opacity: 0.001;
                }
                @keyframes nb-turn {
                    0% {
                        transform: rotateY(0deg);
                    }
                    100% {
                        transform: rotateY(-180deg);
                    }
                }
                @keyframes nb-turn-back {
                    0% {
                        transform: rotateY(-180deg);
                    }
                    100% {
                        transform: rotateY(0deg);
                    }
                }
                .nb-face {
                    position: absolute;
                    inset: 0;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                    /* the two faces a hair apart, so Safari never draws one through the other */
                    transform: translateZ(0.5px);
                }
                .nb-face-back {
                    transform: rotateY(180deg) translateZ(0.5px);
                }
                /* light and shadow sweeping across the page as it turns */
                .nb-shade {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    border-radius: inherit;
                    animation: nb-shade ${FLIP_MS}ms ease-in-out both;
                }
                .nb-face-front .nb-shade {
                    background: linear-gradient(90deg, rgba(13, 42, 66, 0.28), rgba(13, 42, 66, 0) 55%);
                }
                .nb-face-back .nb-shade {
                    background: linear-gradient(270deg, rgba(13, 42, 66, 0.28), rgba(13, 42, 66, 0) 55%);
                }
                @keyframes nb-shade {
                    0%,
                    100% {
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                }

                /* ── a ruled page ── */
                .nb-book :global(.nbp) {
                    position: absolute;
                    inset: 0;
                    overflow: hidden;
                    background-color: #fbfcfd;
                    background-image: linear-gradient(
                            90deg,
                            transparent 0,
                            transparent var(--margin),
                            rgba(58, 153, 201, 0.35) var(--margin),
                            rgba(58, 153, 201, 0.35) calc(var(--margin) + 1px),
                            transparent calc(var(--margin) + 1px)
                        ),
                        repeating-linear-gradient(180deg, transparent 0 27px, rgba(58, 153, 201, 0.18) 27px 28px),
                        linear-gradient(180deg, #fdfefe 0%, #f2f6f9 100%);
                    background-position: 0 0, 0 18px, 0 0;
                }
                .nb-book :global(.nbp-left) {
                    --margin: 58px;
                    border-radius: 4px 2px 2px 4px;
                    box-shadow: inset -18px 0 22px -18px rgba(13, 42, 66, 0.35);
                }
                .nb-book :global(.nbp-right) {
                    --margin: 58px;
                    border-radius: 2px 4px 4px 2px;
                    box-shadow: inset 18px 0 22px -18px rgba(13, 42, 66, 0.35);
                }
                /* punched holes beside the spiral */
                .nb-book :global(.nbp-holes) {
                    position: absolute;
                    top: 12px;
                    bottom: 12px;
                    width: 8px;
                    background: radial-gradient(circle, #c9d6df 0 3px, transparent 3.5px) 0 0 / 8px 21.9px repeat-y;
                }
                .nb-book :global(.nbp-left .nbp-holes) {
                    right: 8px;
                }
                .nb-book :global(.nbp-right .nbp-holes) {
                    left: 8px;
                }
                .nb-book :global(.nbp-body) {
                    position: absolute;
                    inset: 30px 30px 26px 72px;
                    display: flex;
                    flex-direction: column;
                }
                .nb-book :global(.nbp-right .nbp-body) {
                    inset: 30px 26px 26px 78px;
                }
                .nb-book :global(.nbp-print) {
                    position: relative;
                    padding: 6px;
                    margin-bottom: 18px;
                    background: #fff;
                    border-radius: 3px;
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 6px 12px -6px rgba(13, 42, 66, 0.35);
                    transform: rotate(-1.4deg);
                }
                .nb-book :global(.nbp-right .nbp-print) {
                    transform: rotate(1.2deg);
                }
                .nb-book :global(.snip-clip) {
                    position: absolute;
                    top: -18px;
                    left: 34px;
                    width: 15px;
                    height: 44px;
                    z-index: 3;
                    transform: rotate(-6deg);
                    filter: drop-shadow(1px 1px 0.5px rgba(13, 42, 66, 0.25));
                }
                .nb-book :global(.nbp-title) {
                    margin: 2px 0 0;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif !important;
                    font-size: 20px;
                    font-weight: 800;
                    line-height: 28px;
                    letter-spacing: -0.01em;
                    color: #0d2a42;
                }
                .nb-book :global(.nbp-date) {
                    margin: 0;
                    font-family: "Courier New", Courier, monospace;
                    font-size: 12px;
                    font-weight: 700;
                    line-height: 28px;
                    letter-spacing: 0.14em;
                    color: #3a7ca5;
                }
                .nb-book :global(.nbp-tags) {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px 8px;
                    margin-top: 4px;
                }
                .nb-book :global(.nbp-tag) {
                    padding: 3px 9px;
                    border: 1.5px solid rgba(27, 79, 114, 0.35);
                    border-radius: 999px;
                    font-size: 11.5px;
                    font-weight: 600;
                    color: #1b4f72;
                    background: rgba(255, 255, 255, 0.6);
                }
                .nb-book :global(.nbp-end) {
                    align-items: center;
                    justify-content: center;
                    gap: 14px;
                    text-align: center;
                }
                .nb-book :global(.nbp-end-k) {
                    font-family: "Courier New", Courier, monospace;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.3em;
                    color: #3a7ca5;
                }
                .nb-book :global(.nbp-end-link) {
                    font-size: 18px;
                    font-weight: 800;
                    color: #0d2a42;
                    text-decoration: none;
                    border-bottom: 2px dashed rgba(27, 79, 114, 0.35);
                    opacity: 1 !important;
                }

                /* ── spiral wire ── */
                .nb-spiral {
                    position: absolute;
                    left: 50%;
                    top: 14px;
                    bottom: 14px;
                    width: 44px;
                    margin-left: -22px;
                    z-index: 8;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    pointer-events: none;
                }
                .nb-coil {
                    display: block;
                    height: 9px;
                    border-radius: 6px;
                    border: 2.5px solid #2c4356;
                    border-left-color: #5d7487;
                    border-right-color: #5d7487;
                    background: transparent;
                    box-shadow: 0 2px 2px rgba(13, 42, 66, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25);
                    transform: rotate(-8deg);
                }

                /* ── badges ── */
                .snippet-badges {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.25rem;
                }
                .nb-book :global(.snippet-lang-badge) {
                    font-size: 10px;
                    text-transform: uppercase;
                    background: rgba(58, 153, 201, 0.12);
                    color: #3a99c9;
                    font-weight: 800;
                    padding: 0.2rem 0.6rem;
                    border-radius: 5px;
                    letter-spacing: 0.05em;
                }
                .nb-book :global(.snippet-cat-badge) {
                    font-size: 9px;
                    text-transform: uppercase;
                    font-weight: 800;
                    color: rgba(13, 42, 66, 0.4);
                    letter-spacing: 0.06em;
                }
                .nb-book :global(.snippet-badges) {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.25rem;
                }
                @media (prefers-reduced-motion: reduce) {
                    .nb-leaf,
                    .nb-shade {
                        animation-duration: 0.01ms !important;
                    }
                }
            `}</style>
        </section>
    );
}
