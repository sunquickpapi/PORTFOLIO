"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Full-screen intro shown on every full page load (reload / first visit).
 * The FVL mark is drawn as vector shapes traced from /assets/NameLogo.png
 * so each letter can animate on its own: ring draws, F → V → L are "written",
 * a light sweep crosses the mark, then we zoom through the ring into the page.
 */
const MIN_VISIBLE_MS = 2000; // let the intro play through once
const MAX_VISIBLE_MS = 5000; // never block the page longer than this
const EXIT_MS = 1000;

export default function PageLoader() {
    const pathname = usePathname();
    const skip = pathname?.startsWith("/admin");
    const [phase, setPhase] = useState<"intro" | "leaving" | "done">("intro");

    useEffect(() => {
        if (skip) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const minMs = reduce ? 300 : MIN_VISIBLE_MS;
        const started = performance.now();
        const root = document.documentElement;
        root.classList.add("fvl-loading");

        let leaveTimer: ReturnType<typeof setTimeout>;
        let doneTimer: ReturnType<typeof setTimeout>;
        let finished = false;

        const finish = () => {
            if (finished) return;
            finished = true;
            const wait = Math.max(0, minMs - (performance.now() - started));
            leaveTimer = setTimeout(() => {
                setPhase("leaving");
                root.classList.remove("fvl-loading");
                doneTimer = setTimeout(() => setPhase("done"), reduce ? 250 : EXIT_MS);
            }, wait);
        };

        if (document.readyState === "complete") finish();
        else window.addEventListener("load", finish, { once: true });
        const safety = setTimeout(finish, MAX_VISIBLE_MS);

        return () => {
            window.removeEventListener("load", finish);
            clearTimeout(safety);
            clearTimeout(leaveTimer);
            clearTimeout(doneTimer);
            root.classList.remove("fvl-loading");
        };
    }, [skip]);

    if (skip || phase === "done") return null;

    return (
        <div className={`fvl-loader ${phase === "leaving" ? "is-leaving" : ""}`} aria-hidden="true">
            <div className="fvl-loader-stage">
                <svg className="fvl-mark" viewBox="-92 -182 540 540" role="img">
                    <defs>
                        <linearGradient id="fvlV" x1="0.15" y1="1" x2="0.95" y2="0">
                            <stop offset="0" stopColor="#0d2a42" />
                            <stop offset="0.45" stopColor="#1B4F72" />
                            <stop offset="1" stopColor="#46C1E6" />
                        </linearGradient>
                        <linearGradient id="fvlRing" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="currentColor" />
                            <stop offset="0.6" stopColor="currentColor" />
                            <stop offset="1" stopColor="#3A99C9" />
                        </linearGradient>
                        <radialGradient id="fvlGlow">
                            <stop offset="0" stopColor="#3A99C9" stopOpacity="0.18" />
                            <stop offset="1" stopColor="#3A99C9" stopOpacity="0" />
                        </radialGradient>
                        <linearGradient id="fvlShine" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0" stopColor="#fff" stopOpacity="0" />
                            <stop offset="0.5" stopColor="#fff" stopOpacity="0.75" />
                            <stop offset="1" stopColor="#fff" stopOpacity="0" />
                        </linearGradient>

                        {/* Pen strokes that "write" each letter */}
                        <mask id="fvlMaskF" maskUnits="userSpaceOnUse">
                            <path className="fvl-pen fvl-pen-f1" pathLength={1} d="M26 162V40Q26 30 36 30H110" />
                            <path className="fvl-pen fvl-pen-f2" pathLength={1} d="M24 92H100" />
                        </mask>
                        <mask id="fvlMaskV" maskUnits="userSpaceOnUse">
                            <path className="fvl-pen fvl-pen-v" pathLength={1} d="M130 10L184 154L234 10" />
                        </mask>
                        <mask id="fvlMaskL" maskUnits="userSpaceOnUse">
                            <path className="fvl-pen fvl-pen-l" pathLength={1} d="M274 12V140Q274 145 280 145H345" />
                        </mask>
                        <mask id="fvlMaskAll" maskUnits="userSpaceOnUse">
                            <path fill="#fff" d="M12 158V40Q12 16 36 16H107V44H40V80H96V104H40V158Z" />
                            <path fill="#fff" d="M116 16H144L183 114L220 16H248L184 160Z" />
                            <path fill="#fff" d="M260 16H288V132H341V158H284Q260 158 260 134Z" />
                        </mask>
                    </defs>

                    {/* The "portal": a huge background-coloured band around the ring and a disc inside it.
                        On exit the disc fades (revealing the site inside the ring) and the band zooms
                        with the ring, so it feels like flying through the logo into the page. */}
                    <circle className="fvl-portal-surround" cx="178" cy="88" r="3248" />
                    <circle className="fvl-portal-fill" cx="178" cy="88" r="252" />
                    <circle className="fvl-glow" cx="178" cy="88" r="470" fill="url(#fvlGlow)" />

                    <circle className="fvl-ring" cx="178" cy="88" r="248" pathLength={1} stroke="url(#fvlRing)" />

                    <g className="fvl-letters">
                        <path className="fvl-ink" mask="url(#fvlMaskF)" d="M12 158V40Q12 16 36 16H107V44H40V80H96V104H40V158Z" />
                        <path fill="url(#fvlV)" mask="url(#fvlMaskV)" d="M116 16H144L183 114L220 16H248L184 160Z" />
                        <path className="fvl-ink" mask="url(#fvlMaskL)" d="M260 16H288V132H341V158H284Q260 158 260 134Z" />
                        <g mask="url(#fvlMaskAll)">
                            <rect className="fvl-shine" x="-120" y="0" width="90" height="177" fill="url(#fvlShine)" />
                        </g>
                    </g>
                </svg>

                <div className="fvl-loader-bar"><span /></div>
            </div>
        </div>
    );
}
