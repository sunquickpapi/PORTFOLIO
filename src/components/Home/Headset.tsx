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

function ago(iso?: string) {
    if (!iso) return "";
    const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (m < 60) return `${m}m ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.round(h / 24)}d ago`;
}

/**
 * Black over-ear headset by the pass card. Hover (or focus) shows a paper "now playing"
 * ticket with what's on Spotify right now, or the last track played.
 */
export default function Headset() {
    const [np, setNp] = useState<NowPlaying | null>(null);
    const fetchedAt = useRef(0);

    const load = useCallback(async () => {
        fetchedAt.current = Date.now();
        try {
            const res = await fetch("/api/spotify/now-playing", { cache: "no-store" });
            if (res.ok) setNp(await res.json());
        } catch {
            /* keep the last result */
        }
    }, []);

    // poll gently while the tab is visible
    useEffect(() => {
        load();
        const id = window.setInterval(() => {
            if (document.visibilityState === "visible") load();
        }, POLL_MS);
        return () => window.clearInterval(id);
    }, [load]);

    const refreshIfStale = () => {
        if (Date.now() - fetchedAt.current > 12_000) load();
    };

    const hasTrack = !!np?.title;
    const playing = !!np?.isPlaying && hasTrack;
    const href = np?.url;
    const label = playing ? "Now playing" : hasTrack ? `Last played · ${ago(np?.playedAt)}` : "Spotify";

    const Tag = href ? "a" : "div";
    return (
        <Tag
            className={`headset ${courier.className} ${playing ? "is-playing" : ""}`}
            {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : { tabIndex: 0 })}
            aria-label={hasTrack ? `${label}: ${np?.title} by ${np?.artist}. Open on Spotify.` : "What I'm listening to on Spotify"}
            onMouseEnter={refreshIfStale}
            onFocus={refreshIfStale}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="hs-img" src="/assets/passcard/headset.svg" alt="" draggable={false} />

            {/* little notes drifting up while music is playing */}
            {playing && (
                <span className="hs-notes" aria-hidden="true">
                    <i>♪</i>
                    <i>♫</i>
                    <i>♪</i>
                </span>
            )}

            <span className="hs-ticket" aria-hidden="true">
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
                {hasTrack && <span className="hs-cta">Listen on Spotify ↗</span>}
            </span>

            <style jsx>{`
                .headset {
                    --ink: #0d2a42;
                    --ink-2: #1b4f72;
                    --accent: #3a99c9;
                    position: relative;
                    display: block;
                    width: 192px;
                    height: 209px;
                    text-decoration: none;
                    color: var(--ink);
                    cursor: pointer;
                    outline: none;
                    -webkit-tap-highlight-color: transparent;
                }
                .hs-img {
                    display: block;
                    width: 100%;
                    height: 100%;
                    user-select: none;
                    transform-origin: 50% 85%;
                    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .headset:hover .hs-img,
                /* the site-wide link hover dims links; this one keeps its full ink */
                .headset:hover {
                    opacity: 1;
                }
                .headset:focus-visible .hs-img {
                    transform: translateY(-6px) rotate(-4deg) scale(1.03);
                }
                .headset.is-playing .hs-img {
                    animation: hs-bob 1.6s ease-in-out infinite;
                }
                .headset.is-playing:hover .hs-img {
                    animation: none;
                }
                @keyframes hs-bob {
                    0%,
                    100% {
                        transform: translateY(0) rotate(0);
                    }
                    50% {
                        transform: translateY(-3px) rotate(-1.2deg);
                    }
                }
                .headset:focus-visible {
                    outline: 2px dashed var(--accent);
                    outline-offset: 4px;
                    border-radius: 14px;
                }

                /* music notes */
                .hs-notes i {
                    position: absolute;
                    top: 34%;
                    left: 18%;
                    font-style: normal;
                    font-size: 15px;
                    color: var(--ink-2);
                    opacity: 0;
                    animation: hs-note 3.6s ease-out infinite;
                }
                .hs-notes i:nth-child(2) {
                    left: 6%;
                    font-size: 12px;
                    animation-delay: 1.2s;
                }
                .hs-notes i:nth-child(3) {
                    left: 28%;
                    animation-delay: 2.4s;
                }
                @keyframes hs-note {
                    0% {
                        opacity: 0;
                        transform: translate(0, 0) rotate(-8deg);
                    }
                    20% {
                        opacity: 0.8;
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-22px, -58px) rotate(10deg);
                    }
                }

                /* paper ticket */
                .hs-ticket {
                    position: absolute;
                    left: -224px;
                    bottom: 58%;
                    width: 236px;
                    padding: 11px 12px 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 9px;
                    background: linear-gradient(180deg, #fbfcfd, #eef3f6);
                    border-radius: 6px;
                    box-shadow: 0 1px 0 #fff inset, 0 0 0 1px rgba(13, 42, 66, 0.07), 0 22px 34px -16px rgba(13, 42, 66, 0.5),
                        0 3px 8px -3px rgba(13, 42, 66, 0.22);
                    opacity: 0;
                    transform: translate(18px, 10px) rotate(-3deg) scale(0.96);
                    transform-origin: 90% 100%;
                    pointer-events: none;
                    transition: opacity 0.3s ease, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
                    z-index: 4;
                }
                /* perforated tear line along the top, like a ticket stub */
                .hs-ticket::before {
                    content: "";
                    position: absolute;
                    left: 10px;
                    right: 10px;
                    top: 31px;
                    border-top: 1.5px dashed rgba(13, 42, 66, 0.18);
                }
                .headset:hover .hs-ticket,
                .headset:focus-visible .hs-ticket {
                    opacity: 1;
                    transform: translate(0, 0) rotate(-2deg) scale(1);
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
                    color: var(--ink);
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
                .hs-cta {
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 1.4px;
                    text-transform: uppercase;
                    color: var(--accent);
                }

                @media (prefers-reduced-motion: reduce) {
                    .headset.is-playing .hs-img,
                    .hs-eq i,
                    .hs-notes i {
                        animation: none;
                    }
                    .hs-notes {
                        display: none;
                    }
                    .hs-img,
                    .hs-ticket {
                        transition-duration: 0.01ms;
                    }
                }
            `}</style>
        </Tag>
    );
}
