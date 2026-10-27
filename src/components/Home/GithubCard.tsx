"use client";

import { useEffect, useState } from "react";
import { JetBrains_Mono } from "next/font/google";

const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

type Data = { login: string; total: number; streak: number; weeks: number[][]; firstDate?: string };

const WEEKS = 26; // last ~6 months fit the card
const level = (n: number, max: number) => (n <= 0 ? 0 : n >= max * 0.75 ? 4 : n >= max * 0.45 ? 3 : n >= max * 0.2 ? 2 : 1);

/**
 * "TELEMETRY::LIVE": my GitHub contributions as a dark navy card tucked behind the pass card.
 * Only its top edge peeks out; hovering slides it up and out so it shows in full.
 * Clicking opens my GitHub profile.
 */
export default function GithubCard({ href }: { href?: string | null }) {
    const [data, setData] = useState<Data | null>(null);
    const [failed, setFailed] = useState(false);
    const [time, setTime] = useState("");

    useEffect(() => {
        fetch("/api/github/contributions")
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((d) => (d?.weeks ? setData(d) : setFailed(true)))
            .catch(() => setFailed(true));
        const tick = () =>
            setTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kuala_Lumpur" }));
        tick();
        const id = window.setInterval(tick, 30000);
        return () => window.clearInterval(id);
    }, []);

    if (failed) return null;
    const weeks = data ? data.weeks.slice(-WEEKS) : Array.from({ length: WEEKS }, () => Array(7).fill(0));
    const max = Math.max(1, ...weeks.flat());
    const url = href || (data ? `https://github.com/${data.login}` : "https://github.com/sunquickpapi");

    return (
        <a className={`ghc ${mono.className} ${data ? "is-ready" : ""}`} href={url} target="_blank" rel="noopener noreferrer" aria-label="GitHub contributions">
            <span className="ghc-head">
                <span>TELEMETRY::LIVE</span>
                <span className="ghc-dot" aria-hidden="true" />
            </span>
            <span className="ghc-rows">
                <span>
                    <i>LOCAL::</i> {time || "--:--"}MYT
                </span>
                <span>
                    <i>POS::</i> N 2°16′ / E 102°17′
                </span>
                <span>
                    <i>COMMITS::</i> {data ? data.total.toLocaleString() : "…"}/YR
                </span>
                <span>
                    <i>STREAK::</i> {data ? `${data.streak} DAY${data.streak === 1 ? "" : "S"}` : "…"}
                </span>
            </span>
            <span className="ghc-grid" aria-hidden="true">
                {weeks.map((w, x) => (
                    <span key={x} className="ghc-col">
                        {w.map((n, y) => (
                            <span key={y} className={`ghc-sq l${level(n, max)}`} title={`${n} contribution${n === 1 ? "" : "s"}`} />
                        ))}
                    </span>
                ))}
            </span>

            <style jsx>{`
                .ghc {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    width: 400px;
                    padding: 20px 22px 22px;
                    border-radius: 14px;
                    background: radial-gradient(120% 90% at 10% 0%, #17405f 0%, #0d2a42 55%, #0a2135 100%);
                    box-shadow: 0 0 0 1px rgba(159, 216, 242, 0.12), 0 24px 40px -22px rgba(13, 42, 66, 0.7);
                    color: #e9f4fa;
                    text-decoration: none;
                    opacity: 1 !important;
                }
                .ghc-head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 13px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    color: #cfe6f3;
                }
                .ghc-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #3a99c9;
                    animation: ghc-pulse 2s ease-out infinite;
                }
                @keyframes ghc-pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(58, 153, 201, 0.6);
                    }
                    100% {
                        box-shadow: 0 0 0 9px rgba(58, 153, 201, 0);
                    }
                }
                .ghc-rows {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    font-size: 12.5px;
                    color: #e9f4fa;
                }
                .ghc-rows i {
                    font-style: normal;
                    color: rgba(207, 230, 243, 0.5);
                }
                .ghc-grid {
                    display: flex;
                    gap: 3px;
                    margin-top: 2px;
                }
                .ghc-col {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }
                .ghc-sq {
                    width: 11px;
                    height: 11px;
                    border-radius: 2.5px;
                    background: rgba(207, 230, 243, 0.08);
                    transition: background 0.4s ease;
                }
                .ghc-sq.l1 {
                    background: #1d5a83;
                }
                .ghc-sq.l2 {
                    background: #2a76a6;
                }
                .ghc-sq.l3 {
                    background: #3a99c9;
                }
                .ghc-sq.l4 {
                    background: #9fd8f2;
                }
                @media (prefers-reduced-motion: reduce) {
                    .ghc-dot {
                        animation: none;
                    }
                }
            `}</style>
        </a>
    );
}
