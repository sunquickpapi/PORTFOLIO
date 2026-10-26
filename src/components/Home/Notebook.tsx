"use client";

import { useRouter } from "next/navigation";
import { Courier_Prime } from "next/font/google";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

/**
 * Linen notebook resting left of the résumé file, seen from above, with two divider
 * sheets peeking out: Snippets and Blogs. Hovering a divider slides a paper slip out
 * from behind it naming the section; clicking opens that page.
 */
const DIVIDERS = [
    { key: "snippets", label: "Snippets", href: "/snippets", no: "03", tab: 14, dx: 5, dy: -8 },
    { key: "blogs", label: "Blogs", href: "/blog", no: "04", tab: 76, dx: 10, dy: -16 },
];

export default function Notebook() {
    const router = useRouter();
    return (
        <div className="nb">
            <span className="nb-shadow" aria-hidden="true" />
            {/* back to front: Blogs divider, Snippets divider, then the cover */}
            {[...DIVIDERS].reverse().map((d) => (
                <a
                    key={d.key}
                    href={d.href}
                    className={`nb-div nb-${d.key}`}
                    style={{ "--dx": `${d.dx}px`, "--dy": `${d.dy}px`, "--tab": `${d.tab}px` } as React.CSSProperties}
                    aria-label={`Open ${d.label}`}
                    onMouseEnter={() => router.prefetch(d.href)}
                    onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                        e.preventDefault();
                        router.push(d.href);
                    }}
                >
                    {/* the slip that slides out from behind this divider */}
                    <span className="nb-slip" aria-hidden="true">
                        <span className="nb-slip-row">
                            <span className={`nb-slip-kicker ${courier.className}`}>FILE:: N°{d.no}</span>
                            <span className={`nb-slip-chip ${courier.className}`}>
                                OPEN <span className="nb-slip-arrow">→</span>
                            </span>
                        </span>
                        <span className="nb-slip-title">{d.label}</span>
                    </span>
                    <span className="nb-sheet" aria-hidden="true">
                        <span className={`nb-tab ${courier.className}`}>{d.label}</span>
                    </span>
                </a>
            ))}
            <span className="nb-cover" aria-hidden="true">
                <span className="nb-holes">
                    <span />
                    <span />
                    <span />
                </span>
                <span className={`nb-label ${courier.className}`}>
                    <span className="nb-label-k">NOTES</span>
                    <span className="nb-label-l" />
                    <span className="nb-label-l" />
                </span>
            </span>

            <style jsx>{`
                .nb {
                    --nw: 176px;
                    --nh: 128px;
                    --ease: cubic-bezier(0.22, 1, 0.36, 1);
                    position: relative;
                    width: var(--nw);
                    height: var(--nh);
                }
                .nb-shadow {
                    position: absolute;
                    left: 6px;
                    right: -4px;
                    top: 8px;
                    bottom: -10px;
                    border-radius: 10px;
                    background: rgba(13, 42, 66, 0.28);
                    filter: blur(12px);
                    transition: transform 0.5s var(--ease), opacity 0.5s ease;
                }
                .nb:hover .nb-shadow {
                    transform: translateY(4px) scale(1.02);
                    opacity: 0.8;
                }

                /* ---- divider sheets ---- */
                .nb-div {
                    position: absolute;
                    inset: 0;
                    transform: translate(var(--dx), var(--dy));
                    pointer-events: none; /* only the tab (and an out slip) is clickable */
                    opacity: 1 !important; /* global a:hover dims links */
                    text-decoration: none;
                }
                .nb-sheet {
                    position: absolute;
                    inset: 0;
                    border-radius: 3px 8px 8px 8px;
                    background: var(--c);
                    background-image: repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.06) 0 1px, transparent 1px 3px),
                        repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.05) 0 1px, transparent 1px 3px);
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 1px 2px rgba(13, 42, 66, 0.25);
                }
                .nb-snippets {
                    --c: #3a99c9;
                    --ink: #0d2a42;
                }
                .nb-blogs {
                    --c: #1b4f72;
                    --ink: #e9f4fa;
                }
                .nb-tab {
                    position: absolute;
                    top: -15px;
                    left: var(--tab);
                    width: 60px;
                    height: 17px;
                    padding-top: 3px;
                    pointer-events: auto;
                    cursor: pointer;
                    /* sloped sides, like a cut divider tab */
                    clip-path: polygon(10% 0, 90% 0, 100% 100%, 0 100%);
                    border-radius: 4px 4px 0 0;
                    background: inherit;
                    background-color: var(--c);
                    font-size: 7.5px;
                    font-weight: 700;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    text-align: center;
                    color: var(--ink);
                    transition: transform 0.35s var(--ease), filter 0.25s ease;
                }
                .nb-div:hover .nb-tab {
                    transform: translateY(-3px);
                    filter: brightness(1.08);
                }

                /* ---- paper slip ---- */
                .nb-slip {
                    position: absolute;
                    left: calc(var(--tab) - 22px);
                    top: 6px;
                    width: 134px;
                    height: 62px;
                    display: flex;
                    flex-direction: column;
                    padding: 9px 11px 8px;
                    border-radius: 3px;
                    background: linear-gradient(180deg, #fbfcfd 0%, #eef3f6 100%);
                    background-image: repeating-linear-gradient(180deg, transparent 0 15px, rgba(58, 124, 165, 0.13) 15px 16px),
                        linear-gradient(180deg, #fbfcfd 0%, #eef3f6 100%);
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 10px 18px -10px rgba(13, 42, 66, 0.45);
                    color: #0d2a42;
                    transform: translateY(0) rotate(0deg);
                    pointer-events: none;
                    transition: transform 0.5s var(--ease);
                }
                .nb-div:hover .nb-slip {
                    transform: translateY(-90px) rotate(-3deg);
                    pointer-events: auto;
                    cursor: pointer;
                    transition: transform 0.55s cubic-bezier(0.34, 1.3, 0.64, 1);
                }
                .nb-blogs:hover .nb-slip {
                    transform: translateY(-90px) rotate(3deg);
                }
                .nb-slip-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 6px;
                }
                .nb-slip-kicker,
                .nb-slip-chip {
                    white-space: nowrap;
                    flex: none;
                }
                .nb-slip-kicker {
                    font-size: 7.5px;
                    font-weight: 700;
                    letter-spacing: 0.2em;
                    color: #3a7ca5;
                }
                .nb-slip-title {
                    margin-top: 4px;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 24px;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    line-height: 1.05;
                    color: #0d2a42;
                }
                .nb-slip-chip {
                    padding: 1px 6px;
                    border: 1.5px solid #1b4f72;
                    border-radius: 999px;
                    font-size: 7.5px;
                    font-weight: 700;
                    letter-spacing: 0.14em;
                    color: #1b4f72;
                }
                .nb-slip-arrow {
                    display: inline-block;
                    transition: transform 0.3s ease;
                }
                .nb-div:hover .nb-slip-arrow {
                    transform: translateX(2px);
                }

                /* ---- cover ---- */
                .nb-cover {
                    position: absolute;
                    inset: 0;
                    border-radius: 3px 9px 9px 3px;
                    background-color: #e8eff3;
                    background-image: repeating-linear-gradient(0deg, rgba(13, 42, 66, 0.035) 0 1px, transparent 1px 3px),
                        repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.5) 0 1px, transparent 1px 3px),
                        linear-gradient(160deg, #f6f9fb 0%, #e6edf1 70%, #dbe5eb 100%);
                    box-shadow: inset 0 1px 0 #fff, inset 0 0 0 1px rgba(13, 42, 66, 0.08), 0 2px 4px rgba(13, 42, 66, 0.18);
                    pointer-events: none;
                }
                .nb-holes {
                    position: absolute;
                    left: 11px;
                    top: 0;
                    bottom: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 20px;
                }
                .nb-holes span {
                    width: 9px;
                    height: 9px;
                    border-radius: 50%;
                    background: #2a3f4f;
                    box-shadow: inset 0 2px 2px rgba(0, 0, 0, 0.55), 0 1px 0 rgba(255, 255, 255, 0.9);
                }
                .nb-label {
                    position: absolute;
                    right: 16px;
                    bottom: 16px;
                    width: 66px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .nb-label-k {
                    font-size: 8px;
                    font-weight: 700;
                    letter-spacing: 0.28em;
                    color: #3a7ca5;
                }
                .nb-label-l {
                    height: 0;
                    border-top: 1.5px dashed rgba(27, 79, 114, 0.35);
                }
            `}</style>
        </div>
    );
}
