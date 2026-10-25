"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Courier_Prime } from "next/font/google";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

type NowPlaying = {
    configured: boolean;
    isPlaying: boolean;
    title?: string;
    artist?: string;
    album?: string;
    albumArt?: string;
    url?: string;
    playedAt?: string;
};

const POLL_MS = 30_000;
const A = "/assets/passcard/earbuds-";

function ago(iso?: string) {
    if (!iso) return "";
    const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (m < 60) return `${m}m ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.round(h / 24)}d ago`;
}

/**
 * White earbud case by the pass card. Click: the lid flips open, both buds pop out and
 * float, and a paper ticket shows what's on Spotify (or the last track). Click again to close.
 */
export default function Earbuds() {
    const [open, setOpen] = useState(false);
    const [np, setNp] = useState<NowPlaying | null>(null);
    const fetchedAt = useRef(0);
    const rootRef = useRef<HTMLDivElement>(null);

    const load = useCallback(async () => {
        fetchedAt.current = Date.now();
        try {
            const res = await fetch("/api/spotify/now-playing", { cache: "no-store" });
            if (res.ok) setNp(await res.json());
        } catch {
            /* keep the last result */
        }
    }, []);

    useEffect(() => {
        load();
        const id = window.setInterval(() => {
            if (document.visibilityState === "visible") load();
        }, POLL_MS);
        return () => window.clearInterval(id);
    }, [load]);

    // close on Escape or a click elsewhere on the page
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        const onDown = (e: PointerEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        window.addEventListener("pointerdown", onDown);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("pointerdown", onDown);
        };
    }, [open]);

    const toggle = () => {
        setOpen((o) => {
            if (!o && Date.now() - fetchedAt.current > 12_000) load();
            return !o;
        });
    };

    const hasTrack = !!np?.title;
    const playing = !!np?.isPlaying && hasTrack;
    const label = playing ? "Now playing" : hasTrack ? `Last played · ${ago(np?.playedAt)}` : "Spotify";

    return (
        <div ref={rootRef} className={`earbuds ${courier.className} ${open ? "is-open" : ""} ${playing ? "is-playing" : ""}`}>
            <button
                type="button"
                className="ap-case"
                aria-expanded={open}
                aria-label={open ? "Close the earbud case" : "Open the earbud case to see what I'm listening to"}
                onClick={toggle}
            >
                <span className="ap-shadow" aria-hidden="true" />
                {/* eslint-disable @next/next/no-img-element */}
                <img className="ap-lid-open" src={`${A}lid-open.svg`} alt="" draggable={false} />
                <img className="ap-base-back" src={`${A}base-back.svg`} alt="" draggable={false} />
                <span className="ap-bud ap-bud-l" aria-hidden="true">
                    <img src={`${A}bud.svg`} alt="" draggable={false} />
                </span>
                <span className="ap-bud ap-bud-r" aria-hidden="true">
                    <img src={`${A}bud.svg`} alt="" draggable={false} />
                </span>
                <img className="ap-base-front" src={`${A}base-front.svg`} alt="" draggable={false} />
                <img className="ap-closed" src={`${A}closed.svg`} alt="" draggable={false} />
                {/* eslint-enable @next/next/no-img-element */}
            </button>

            <a
                className="ap-ticket"
                href={np?.url || "https://open.spotify.com"}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={open && hasTrack ? 0 : -1}
                aria-hidden={!open}
                onClick={(e) => !hasTrack && e.preventDefault()}
            >
                <span className="hs-head">
                    {playing ? (
                        <span className="hs-eq">
                            <i />
                            <i />
                            <i />
                            <i />
                        </span>
                    ) : (
                        <span className="hs-dot" />
                    )}
                    <span className="hs-label">{label}</span>
                </span>
                {hasTrack ? (
                    <span className="hs-body">
                        {np?.albumArt ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img className="hs-art" src={np.albumArt} alt="" draggable={false} />
                        ) : (
                            <span className="hs-art hs-art-empty" />
                        )}
                        <span className="hs-meta">
                            <span className="hs-title">{np?.title}</span>
                            <span className="hs-artist">{np?.artist}</span>
                        </span>
                    </span>
                ) : (
                    <span className="hs-empty">{np === null ? "Tuning in…" : "Nothing playing right now."}</span>
                )}
            </a>

            <style jsx>{`
                .earbuds {
                    --ink: #0d2a42;
                    --ink-2: #1b4f72;
                    --accent: #3a99c9;
                    --spring: cubic-bezier(0.34, 1.56, 0.64, 1);
                    position: relative;
                    width: 176px;
                    height: 176px;
                    color: var(--ink);
                }
                .ap-case {
                    position: absolute;
                    inset: 0;
                    padding: 0;
                    border: 0;
                    background: none;
                    cursor: pointer;
                    outline: none;
                    -webkit-tap-highlight-color: transparent;
                    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .ap-case:hover {
                    transform: translateY(-4px) rotate(-2deg);
                }
                .ap-case:focus-visible {
                    outline: 2px dashed var(--accent);
                    outline-offset: 2px;
                    border-radius: 24px;
                }
                .ap-case img,
                .ap-bud {
                    position: absolute;
                    user-select: none;
                    pointer-events: none;
                }
                .ap-case > img {
                    inset: 0;
                    width: 100%;
                    height: 100%;
                }
                .ap-shadow {
                    position: absolute;
                    left: 14%;
                    right: 14%;
                    bottom: 4%;
                    height: 14%;
                    border-radius: 50%;
                    background: radial-gradient(closest-side, rgba(13, 42, 66, 0.42), rgba(13, 42, 66, 0));
                    filter: blur(5px);
                    transition: transform 0.5s ease, opacity 0.5s ease;
                }
                .ap-case:hover .ap-shadow {
                    transform: scale(0.94);
                    opacity: 0.8;
                }

                /* lid: the closed shell squashes up toward the hinge, then the open lid unfolds behind */
                .ap-closed {
                    transform-origin: 50% 46%;
                    transition: transform 0.25s ease-out 0.42s, opacity 0.06s linear 0.42s;
                }
                .ap-lid-open {
                    opacity: 0;
                    transform: scaleY(0.15);
                    transform-origin: 50% 47%;
                    transition: transform 0.26s ease-in 0.2s, opacity 0.06s linear 0.44s;
                }
                .ap-base-back,
                .ap-base-front {
                    opacity: 0;
                    transition: opacity 0.01s linear 0.46s;
                }
                .is-open .ap-closed {
                    opacity: 0;
                    transform: scaleY(0.7) translateY(-6px);
                    transition: transform 0.2s ease-in, opacity 0.08s linear 0.1s;
                }
                .is-open .ap-lid-open {
                    opacity: 1;
                    transform: scaleY(1);
                    transition: opacity 0.05s linear 0.12s, transform 0.42s var(--spring) 0.12s;
                }
                .is-open .ap-base-back,
                .is-open .ap-base-front {
                    opacity: 1;
                    transition-delay: 0.1s;
                }

                /* buds sit hidden in the case, then pop out and hover */
                .ap-bud {
                    top: 30%;
                    width: 37%;
                    opacity: 0;
                    transition: transform 0.35s ease-in, opacity 0.2s linear 0.15s;
                }
                .ap-bud img {
                    position: static;
                    display: block;
                    width: 100%;
                    filter: drop-shadow(0 8px 8px rgba(13, 42, 66, 0.22));
                }
                .ap-bud-l {
                    left: 18%;
                    transform: translateY(18%) rotate(-6deg);
                }
                .ap-bud-r {
                    left: 47%;
                    transform: translateY(18%) rotate(6deg);
                }
                .ap-bud-r img {
                    transform: scaleX(-1);
                }
                .is-open .ap-bud {
                    opacity: 1;
                    transition: transform 0.75s var(--spring), opacity 0.15s linear;
                }
                .is-open .ap-bud-l {
                    transform: translate(-30%, -68%) rotate(-24deg);
                    transition-delay: 0.38s;
                }
                .is-open .ap-bud-r {
                    transform: translate(32%, -80%) rotate(18deg);
                    transition-delay: 0.5s;
                }
                .is-open .ap-bud img {
                    animation: ap-float 3.2s ease-in-out 1.3s infinite;
                }
                .is-open .ap-bud-r img {
                    animation-name: ap-float-r;
                    animation-delay: 1.6s;
                }
                @keyframes ap-float {
                    0%,
                    100% {
                        transform: translateY(0) rotate(0);
                    }
                    50% {
                        transform: translateY(-5px) rotate(-3deg);
                    }
                }
                @keyframes ap-float-r {
                    0%,
                    100% {
                        transform: scaleX(-1) translateY(0) rotate(0);
                    }
                    50% {
                        transform: scaleX(-1) translateY(-6px) rotate(-3deg);
                    }
                }

                /* paper ticket */
                .ap-ticket {
                    position: absolute;
                    left: -232px;
                    bottom: 46%;
                    width: 236px;
                    padding: 11px 12px 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 9px;
                    text-decoration: none;
                    color: var(--ink);
                    background: linear-gradient(180deg, #fbfcfd, #eef3f6);
                    border-radius: 6px;
                    box-shadow: 0 1px 0 #fff inset, 0 0 0 1px rgba(13, 42, 66, 0.07), 0 22px 34px -16px rgba(13, 42, 66, 0.5),
                        0 3px 8px -3px rgba(13, 42, 66, 0.22);
                    opacity: 0;
                    transform: translate(18px, 10px) rotate(-3deg) scale(0.96);
                    transform-origin: 90% 100%;
                    pointer-events: none;
                    transition: opacity 0.25s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
                    z-index: 4;
                }
                .ap-ticket:hover {
                    opacity: 1;
                }
                .ap-ticket::before {
                    content: "";
                    position: absolute;
                    left: 10px;
                    right: 10px;
                    top: 31px;
                    border-top: 1.5px dashed rgba(13, 42, 66, 0.18);
                }
                .is-open .ap-ticket {
                    opacity: 1;
                    transform: translate(0, 0) rotate(-2deg) scale(1);
                    pointer-events: auto;
                    transition-delay: 0.55s;
                }
                .hs-head {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    height: 14px;
                }
                .hs-label {
                    font-size: 9.5px;
                    font-weight: 700;
                    letter-spacing: 1.4px;
                    text-transform: uppercase;
                    color: var(--ink-2);
                }
                .hs-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: rgba(13, 42, 66, 0.3);
                }
                .hs-eq {
                    display: inline-flex;
                    align-items: flex-end;
                    gap: 2px;
                    height: 12px;
                }
                .hs-eq i {
                    width: 3px;
                    height: 100%;
                    border-radius: 1px;
                    background: var(--accent);
                    transform-origin: bottom;
                    animation: hs-eq 0.9s ease-in-out infinite;
                }
                .hs-eq i:nth-child(2) {
                    animation-delay: -0.3s;
                }
                .hs-eq i:nth-child(3) {
                    animation-delay: -0.6s;
                }
                .hs-eq i:nth-child(4) {
                    animation-delay: -0.15s;
                }
                @keyframes hs-eq {
                    0%,
                    100% {
                        transform: scaleY(0.3);
                    }
                    50% {
                        transform: scaleY(1);
                    }
                }
                .hs-body {
                    display: flex;
                    align-items: center;
                    gap: 11px;
                    padding-top: 4px;
                }
                .hs-art {
                    flex: none;
                    width: 54px;
                    height: 54px;
                    border-radius: 4px;
                    object-fit: cover;
                    box-shadow: 0 6px 12px -6px rgba(13, 42, 66, 0.55), 0 0 0 1px rgba(13, 42, 66, 0.08);
                }
                .hs-art-empty {
                    display: block;
                    background: linear-gradient(135deg, #1b4f72, #0d2a42);
                }
                .hs-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    min-width: 0;
                }
                .hs-title {
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 14px;
                    font-weight: 700;
                    letter-spacing: -0.2px;
                    line-height: 1.2;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .hs-artist {
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 12px;
                    color: #5b6b7a;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .hs-empty {
                    padding-top: 4px;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 13px;
                    color: #5b6b7a;
                }

                @media (prefers-reduced-motion: reduce) {
                    .ap-case,
                    .ap-case img,
                    .ap-bud,
                    .ap-ticket {
                        transition-duration: 0.01ms !important;
                        transition-delay: 0s !important;
                    }
                    .is-open .ap-bud img,
                    .hs-eq i {
                        animation: none;
                    }
                }
            `}</style>
        </div>
    );
}
