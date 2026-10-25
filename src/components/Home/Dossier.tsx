"use client";

import { useEffect, useState } from "react";
import { Courier_Prime } from "next/font/google";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

/**
 * Little paper dossier that sits by the pass card. Textured cover with a wavy cut-out,
 * pages showing behind it, soft contact shadow. On hover the cover eases open and a
 * sheet slides out: the résumé's actual first page, rendered with PDF.js. Click opens the PDF.
 */
const PAPER =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9 0.35' numOctaves='3' seed='7'/><feColorMatrix values='0 0 0 0 0.05  0 0 0 0 0.16  0 0 0 0 0.26  0 0 0 0.09 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
/** Cover outline: rounded corners plus a wave bitten out of the right edge (160 × 214). */
const COVER_MASK =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 214'><path d='M16 0H134A26 26 0 0 1 160 26V80C160 96 143 98 143 116C143 134 160 136 160 152V198A16 16 0 0 1 144 214H16A16 16 0 0 1 0 198V16A16 16 0 0 1 16 0Z'/></svg>\")";

/** Render page 1 of the PDF to a small image, once the browser is idle. */
function useFirstPage(url: string) {
    const [img, setImg] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        setImg(null);
        const run = async () => {
            try {
                const pdfjs = await import("pdfjs-dist");
                // served as a plain static file so it works with any bundler (copied from pdfjs-dist; keep versions in step)
                pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
                const doc = await pdfjs.getDocument({ url }).promise;
                const page = await doc.getPage(1);
                const base = page.getViewport({ scale: 1 });
                const viewport = page.getViewport({ scale: 440 / base.width }); // ~3x the shown size, stays crisp
                const canvas = document.createElement("canvas");
                canvas.width = Math.round(viewport.width);
                canvas.height = Math.round(viewport.height);
                const ctx = canvas.getContext("2d");
                if (!ctx) return;
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                await page.render({ canvas, canvasContext: ctx, viewport }).promise;
                if (!cancelled) setImg(canvas.toDataURL("image/jpeg", 0.88));
                doc.destroy();
            } catch (err) {
                console.warn("Résumé preview unavailable:", err);
            }
        };
        const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
        if (w.requestIdleCallback) w.requestIdleCallback(run);
        else window.setTimeout(run, 900);
        return () => {
            cancelled = true;
        };
    }, [url]);
    return img;
}

export default function Dossier({ href, date }: { href: string; date?: string }) {
    const firstPage = useFirstPage(href);
    return (
        <a className={`dossier ${courier.className}`} href={href} target="_blank" rel="noopener noreferrer" aria-label="Open my résumé (PDF)">
            <span className="ds-shadow" aria-hidden="true" />

            {/* pages inside the file */}
            <span className="ds-page ds-page-2" aria-hidden="true" />
            <span className="ds-page ds-page-1" aria-hidden="true">
                <span className="ds-page-no">N°01</span>
                <span className="ds-lines">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <i key={i} style={{ width: `${[78, 92, 64, 88, 70, 95, 58, 84, 46][i]}%` }} />
                    ))}
                </span>
            </span>

            {/* the résumé's first page slides out on hover */}
            <span className="ds-sheet" aria-hidden="true">
                {firstPage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="ds-sheet-img" src={firstPage} alt="" draggable={false} />
                ) : (
                    <span className="ds-sheet-skeleton">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <i key={i} style={{ width: `${[40, 70, 92, 85, 60, 94, 88, 72, 90, 66, 84, 50][i]}%` }} />
                        ))}
                    </span>
                )}
            </span>

            {/* front cover */}
            <span className="ds-cover-wrap" aria-hidden="true">
                <span className="ds-cover">
                    <span className="ds-label">FILE:: N°01</span>
                    <span className="ds-number">01</span>
                    <span className="ds-title">The Résumé</span>
                    <span className="ds-foot">
                        <span className="ds-chip">PDF</span>
                        <span className="ds-date">{date || "2026"}</span>
                    </span>
                </span>
            </span>

            <style jsx>{`
                .dossier {
                    --ink: #0d2a42;
                    --ink-2: #1b4f72;
                    --accent: #3a99c9;
                    position: relative;
                    display: block;
                    width: 172px;
                    height: 222px;
                    perspective: 900px;
                    text-decoration: none;
                    color: var(--ink);
                    cursor: pointer;
                    -webkit-tap-highlight-color: transparent;
                    outline: none;
                }
                .dossier:focus-visible .ds-cover-wrap {
                    outline: 2px dashed var(--accent);
                    outline-offset: 6px;
                    border-radius: 18px;
                }

                /* soft contact shadow on the "desk" */
                .ds-shadow {
                    position: absolute;
                    left: 8px;
                    right: -4px;
                    bottom: -10px;
                    height: 26px;
                    border-radius: 50%;
                    background: radial-gradient(closest-side, rgba(13, 42, 66, 0.32), rgba(13, 42, 66, 0));
                    filter: blur(4px);
                    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease;
                }

                /* pages behind the cover */
                .ds-page {
                    position: absolute;
                    top: 5px;
                    left: 10px;
                    width: 156px;
                    height: 210px;
                    border-radius: 6px 22px 12px 6px;
                    background: ${PAPER}, linear-gradient(100deg, #f4f7f9, #e6ecf0);
                    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8) inset, 0 6px 14px -6px rgba(13, 42, 66, 0.35);
                    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .ds-page-2 {
                    top: 9px;
                    left: 14px;
                    height: 204px;
                    background: linear-gradient(100deg, #e9eff3, #d9e2e8);
                }
                .ds-page-no {
                    position: absolute;
                    top: 12px;
                    right: 14px;
                    font-size: 8px;
                    letter-spacing: 1px;
                    color: rgba(13, 42, 66, 0.55);
                }
                .ds-lines {
                    position: absolute;
                    top: 70px;
                    right: 12px;
                    width: 58px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 7px;
                }
                .ds-lines i {
                    display: block;
                    height: 2.5px;
                    border-radius: 2px;
                    background: rgba(13, 42, 66, 0.28);
                }

                /* sliding sheet: an A4 page */
                .ds-sheet {
                    position: absolute;
                    top: 14px;
                    left: 26px;
                    width: 134px;
                    aspect-ratio: 1 / 1.414;
                    overflow: hidden;
                    background: #fff;
                    border-radius: 2px;
                    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 22px 34px -16px rgba(13, 42, 66, 0.55),
                        0 3px 8px -3px rgba(13, 42, 66, 0.28);
                    opacity: 0;
                    transform: translate(0, 6px) rotate(0deg);
                    transition: transform 0.75s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease;
                }
                .ds-sheet-img {
                    display: block;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: top;
                    user-select: none;
                }
                /* placeholder lines while the page renders */
                .ds-sheet-skeleton {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    padding: 14px 12px;
                }
                .ds-sheet-skeleton i {
                    display: block;
                    height: 3px;
                    border-radius: 2px;
                    background: rgba(13, 42, 66, 0.12);
                }
                /* paper sheen on the page */
                .ds-sheet::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.35) 55%, rgba(255, 255, 255, 0) 70%),
                        linear-gradient(90deg, rgba(13, 42, 66, 0.06), rgba(13, 42, 66, 0) 18%);
                    pointer-events: none;
                }

                /* cover */
                .ds-cover-wrap {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 160px;
                    height: 214px;
                    transform-origin: 0 50%;
                    transition: transform 0.75s cubic-bezier(0.22, 1, 0.36, 1);
                    /* follows the masked outline, wave included */
                    filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.9)) drop-shadow(0 10px 14px rgba(13, 42, 66, 0.22))
                        drop-shadow(2px 2px 2px rgba(13, 42, 66, 0.18));
                }
                .ds-cover {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    padding: 15px 15px 14px 20px;
                    background: ${PAPER},
                        radial-gradient(120% 80% at 18% 0%, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0) 60%),
                        linear-gradient(160deg, #f6f9fb 0%, #e7eef2 55%, #d8e2e8 100%);
                    -webkit-mask: ${COVER_MASK} 0 0 / 100% 100% no-repeat;
                    mask: ${COVER_MASK} 0 0 / 100% 100% no-repeat;
                    overflow: hidden;
                }
                /* spine fold */
                .ds-cover::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 9px;
                    width: 1px;
                    background: rgba(13, 42, 66, 0.12);
                    box-shadow: 1px 0 0 rgba(255, 255, 255, 0.85);
                }
                /* sheen that moves when the cover opens */
                .ds-cover::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(115deg, rgba(255, 255, 255, 0) 30%, rgba(255, 255, 255, 0.55) 48%, rgba(255, 255, 255, 0) 62%);
                    transform: translateX(-70%);
                    transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
                    pointer-events: none;
                }
                .ds-label {
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    color: var(--ink-2);
                    padding-bottom: 7px;
                    border-bottom: 1px solid rgba(13, 42, 66, 0.14);
                }
                .ds-number {
                    margin-top: auto;
                    align-self: flex-end;
                    margin-right: -6px;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 76px;
                    font-weight: 800;
                    line-height: 0.82;
                    letter-spacing: -5px;
                    color: var(--ink);
                }
                .ds-title {
                    margin-top: 10px;
                    padding-top: 8px;
                    border-top: 1px solid rgba(13, 42, 66, 0.14);
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 15px;
                    font-weight: 700;
                    letter-spacing: -0.4px;
                    color: var(--ink);
                }
                .ds-foot {
                    margin-top: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .ds-chip {
                    font-size: 8px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    padding: 3px 7px;
                    border: 1px solid rgba(13, 42, 66, 0.45);
                    border-radius: 999px;
                    color: var(--ink-2);
                }
                .ds-date {
                    font-size: 8px;
                    letter-spacing: 1px;
                    color: rgba(13, 42, 66, 0.6);
                }

                /* hover / focus: cover eases open, a sheet slides out */
                .dossier:hover .ds-cover-wrap,
                .dossier:focus-visible .ds-cover-wrap {
                    transform: rotateY(-16deg) translateX(-4px);
                }
                .dossier:hover .ds-cover::after,
                .dossier:focus-visible .ds-cover::after {
                    transform: translateX(70%);
                }
                .dossier:hover .ds-page-1,
                .dossier:focus-visible .ds-page-1 {
                    transform: translateX(6px) rotate(1deg);
                }
                .dossier:hover .ds-page-2,
                .dossier:focus-visible .ds-page-2 {
                    transform: translateX(9px) rotate(2deg);
                }
                .dossier:hover .ds-sheet,
                .dossier:focus-visible .ds-sheet {
                    opacity: 1;
                    transform: translate(112px, -26px) rotate(5deg);
                }
                .dossier:hover .ds-shadow {
                    transform: scaleX(1.12) translateX(10px);
                    opacity: 0.85;
                }

                @media (prefers-reduced-motion: reduce) {
                    .ds-cover-wrap,
                    .ds-page,
                    .ds-sheet,
                    .ds-shadow,
                    .ds-cover::after {
                        transition-duration: 0.01ms;
                    }
                }
            `}</style>
        </a>
    );
}
