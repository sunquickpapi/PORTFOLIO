"use client";

import { useRouter } from "next/navigation";
import { Courier_Prime } from "next/font/google";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

/**
 * Two hardcover books stacked beside the résumé file, built from real 3D planes
 * (cover, spine, page edge). Bottom: Snippets (navy). Top: Blog (sky blue) with a
 * die-cut cobweb sticker. Hovering a book slides it partly out of the stack, as if
 * someone's reaching for it, and its spine reads "View Snippets" / "Read Blog".
 */
const BOOKS = [
    { key: "snippets", href: "/snippets", title: "Snippets", hover: "View Snippets", mark: "N°03" },
    { key: "blog", href: "/blog", title: "Blog", hover: "Read Blog", mark: "N°04" },
];

const STICKER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<circle cx="32" cy="32" r="30.5" fill="#fff"/>
<circle cx="32" cy="32" r="30.5" fill="none" stroke="rgba(13,42,66,.14)" stroke-width="1"/>
<path d="M32 32L37.0 7.5M32 32L52.8 18.2M32 32L56.5 37.0M32 32L45.8 52.8M32 32L27.0 56.5M32 32L11.2 45.8M32 32L7.5 27.0M32 32L18.2 11.2M33.6 24.2Q35.8 26.4 38.7 27.6M38.7 27.6Q38.6 30.7 39.8 33.6M39.8 33.6Q37.6 35.8 36.4 38.7M36.4 38.7Q33.3 38.6 30.4 39.8M30.4 39.8Q28.2 37.6 25.3 36.4M25.3 36.4Q25.4 33.3 24.2 30.4M24.2 30.4Q26.4 28.2 27.6 25.3M27.6 25.3Q30.7 25.4 33.6 24.2M35.1 16.8Q39.3 21.2 44.9 23.4M44.9 23.4Q44.8 29.5 47.2 35.1M47.2 35.1Q42.8 39.3 40.6 44.9M40.6 44.9Q34.5 44.8 28.9 47.2M28.9 47.2Q24.7 42.8 19.1 40.6M19.1 40.6Q19.2 34.5 16.8 28.9M16.8 28.9Q21.2 24.7 23.4 19.1M23.4 19.1Q29.5 19.2 35.1 16.8M36.4 10.4Q42.3 16.7 50.3 19.8M50.3 19.8Q50.1 28.5 53.6 36.4M53.6 36.4Q47.3 42.3 44.2 50.3M44.2 50.3Q35.5 50.1 27.6 53.6M27.6 53.6Q21.7 47.3 13.7 44.2M13.7 44.2Q13.9 35.5 10.4 27.6M10.4 27.6Q16.7 21.7 19.8 13.7M19.8 13.7Q28.5 13.9 36.4 10.4" fill="none" stroke="#3a7ca5" stroke-width="1.5" stroke-linecap="round"/>
<path d="M44 24V40" stroke="#1b4f72" stroke-width="1.3"/>
<g stroke="#0d2a42" stroke-width="1.8" stroke-linecap="round" fill="none">
<path d="M40.5 42Q37 40 36.5 37M40.5 45Q36.5 45 35.5 47.5M47.5 42Q51 40 51.5 37M47.5 45Q51.5 45 52.5 47.5"/>
</g>
<circle cx="44" cy="44" r="5.2" fill="#0d2a42"/>
<circle cx="42.3" cy="43" r="1.6" fill="#fff"/><circle cx="45.7" cy="43" r="1.6" fill="#fff"/>
<circle cx="42.6" cy="43.3" r=".75" fill="#0d2a42"/><circle cx="46" cy="43.3" r=".75" fill="#0d2a42"/>
</svg>`;

export default function Books() {
    const router = useRouter();
    return (
        <div className="bks">
            <span className="bks-shadow" aria-hidden="true" />
            <div className="bks-scene">
                <div className="bks-world">
                    {BOOKS.map((b) => (
                        <a
                            key={b.key}
                            href={b.href}
                            className={`bk bk-${b.key}`}
                            aria-label={b.hover}
                            onMouseEnter={() => router.prefetch(b.href)}
                            onClick={(e) => {
                                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                                e.preventDefault();
                                router.push(b.href);
                            }}
                        >
                            <span className="bk-face bk-bottom" />
                            <span className="bk-face bk-pages" />
                            <span className="bk-face bk-spine">
                                <span className={`bk-mark ${courier.className}`}>{b.mark}</span>
                                <span className="bk-title">
                                    <span className="bk-t bk-t-rest">{b.title}</span>
                                    <span className="bk-t bk-t-hover">{b.hover}</span>
                                </span>
                                <span className={`bk-mark ${courier.className}`}>FVL</span>
                            </span>
                            <span className="bk-face bk-cover">
                                {b.key === "blog" ? (
                                    <span className="bk-sticker" dangerouslySetInnerHTML={{ __html: STICKER }} />
                                ) : (
                                    <span className="bk-emboss" />
                                )}
                            </span>
                        </a>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .bks {
                    position: relative;
                    width: 236px;
                    height: 190px;
                    --ease: cubic-bezier(0.22, 1, 0.36, 1);
                }
                .bks-shadow {
                    position: absolute;
                    left: 26px;
                    right: 18px;
                    bottom: 14px;
                    height: 46px;
                    border-radius: 50%;
                    background: rgba(13, 42, 66, 0.3);
                    filter: blur(14px);
                    transform: rotate(-12deg);
                }
                .bks-scene {
                    position: absolute;
                    left: 68px;
                    top: 24px;
                    width: 0;
                    height: 0;
                    perspective: 1400px;
                }
                .bks-world {
                    position: absolute;
                    transform-style: preserve-3d;
                    transform: rotateX(56deg) rotateZ(38deg);
                }

                /* ---- a book: W × D cover, T thick ---- */
                .bk {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: var(--w);
                    height: var(--d);
                    transform-style: preserve-3d;
                    transform: var(--rest);
                    transition: transform 0.6s var(--ease);
                    cursor: pointer;
                    opacity: 1 !important; /* global a:hover dims links */
                    text-decoration: none;
                    -webkit-tap-highlight-color: transparent;
                }
                .bk:hover,
                .bk:focus-visible {
                    transform: var(--out);
                    outline: none;
                }
                .bk-snippets {
                    --w: 170px;
                    --d: 124px;
                    --t: 34px;
                    --c: #2f6e9b;
                    --c2: #24597f;
                    --sp: #1f5680;
                    --ink: #eaf5fb;
                    --rest: translate3d(0, 0, 0);
                    --out: translate3d(-2px, 30px, 2px) rotateZ(1.5deg);
                }
                .bk-blog {
                    --w: 158px;
                    --d: 114px;
                    --t: 30px;
                    --c: #b4ddf3;
                    --c2: #9bcdea;
                    --sp: #8ec5e6;
                    --ink: #0d2a42;
                    --rest: translate3d(7px, -2px, 34px) rotateZ(-11deg);
                    --out: translate3d(9px, 28px, 46px) rotateZ(-6deg);
                }
                .bk-face {
                    position: absolute;
                    left: 0;
                    top: 0;
                    backface-visibility: hidden;
                }
                .bk-cover {
                    width: var(--w);
                    height: var(--d);
                    transform: translateZ(var(--t));
                    border-radius: 3px 5px 5px 3px;
                    background: linear-gradient(135deg, var(--c) 0%, var(--c2) 100%);
                    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18), inset -2px -2px 6px rgba(13, 42, 66, 0.12);
                }
                .bk-bottom {
                    width: var(--w);
                    height: var(--d);
                    background: var(--c2);
                    border-radius: 3px 5px 5px 3px;
                }
                /* spine: rounded-looking, title in the middle */
                .bk-spine {
                    top: var(--d);
                    width: var(--w);
                    height: var(--t);
                    transform-origin: top;
                    transform: translateZ(var(--t)) rotateX(-90deg);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 12px;
                    border-radius: 0 0 5px 5px;
                    background: linear-gradient(180deg, var(--c) 0%, var(--sp) 45%, var(--c2) 100%);
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -2px 4px rgba(13, 42, 66, 0.18);
                    color: var(--ink);
                }
                .bk-mark {
                    font-size: 6.5px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    opacity: 0.7;
                }
                .bk-title {
                    position: relative;
                    flex: 1;
                    height: 100%;
                }
                .bk-t {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    white-space: nowrap;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 12.5px;
                    font-weight: 800;
                    letter-spacing: 0.16em;
                    text-transform: uppercase;
                    transition: opacity 0.3s ease, transform 0.4s var(--ease);
                }
                .bk-t-hover {
                    opacity: 0;
                    transform: translateY(6px);
                    font-size: 10.5px;
                    letter-spacing: 0.08em;
                }
                .bk:hover .bk-t-rest,
                .bk:focus-visible .bk-t-rest {
                    opacity: 0;
                    transform: translateY(-6px);
                }
                .bk:hover .bk-t-hover,
                .bk:focus-visible .bk-t-hover {
                    opacity: 1;
                    transform: none;
                    transition-delay: 0.08s;
                }
                /* page block on the open side, between the two cover boards */
                .bk-pages {
                    left: calc(var(--w) - 3px);
                    top: 3px;
                    width: var(--t);
                    height: calc(var(--d) - 6px);
                    transform-origin: left;
                    transform: translateZ(var(--t)) rotateY(90deg);
                    background: repeating-linear-gradient(90deg, #f7f9fa 0 1px, #e1e7ec 1px 2px);
                    box-shadow: inset 3px 0 0 var(--c), inset -3px 0 0 var(--c2), inset 0 -6px 8px -6px rgba(13, 42, 66, 0.35);
                }
                .bk-sticker {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    width: 52px;
                    height: 52px;
                    margin: -26px 0 0 -26px;
                    transform: rotate(-82deg);
                    filter: drop-shadow(0 1px 1px rgba(13, 42, 66, 0.3));
                }
                .bk-sticker :global(svg) {
                    display: block;
                    width: 100%;
                    height: 100%;
                }
                .bk-emboss {
                    position: absolute;
                    left: 18px;
                    right: 18px;
                    bottom: 14px;
                    height: 0;
                    border-top: 1.5px solid rgba(234, 245, 251, 0.35);
                }
                @media (prefers-reduced-motion: reduce) {
                    .bk,
                    .bk-t {
                        transition: none;
                    }
                }
            `}</style>
        </div>
    );
}
