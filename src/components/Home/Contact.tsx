"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Github, Instagram, Linkedin } from "lucide-react";
import { Courier_Prime, JetBrains_Mono } from "next/font/google";
import FileLink from "./FileLink";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: "700", display: "swap" });

type Profile = {
    phone?: string;
    email?: string;
    location?: string;
    linkedin_url?: string;
    github_url?: string;
    instagram_url?: string;
};

function CopyChip({ text }: { text: string }) {
    const [done, setDone] = useState(false);
    return (
        <button
            type="button"
            className={`pc-copy ${done ? "is-done" : ""}`}
            aria-label={done ? "Copied" : `Copy ${text}`}
            title={done ? "Copied" : "Copy"}
            onClick={async (e) => {
                e.preventDefault();
                try {
                    await navigator.clipboard.writeText(text);
                    setDone(true);
                    window.setTimeout(() => setDone(false), 1800);
                } catch {
                    /* clipboard blocked: nothing to do */
                }
            }}
        >
            {done ? <Check size={15} strokeWidth={2.6} /> : <Copy size={15} strokeWidth={2.2} />}
        </button>
    );
}

/** Round postmark with the live local time in the middle. */
function Postmark({ time, place }: { time: string; place: string }) {
    const [hm, ampm] = time.split(" ");
    return (
        <svg className="pc-postmark" viewBox="0 0 200 200" aria-hidden="true">
            <defs>
                <path id="pcRingTop" d="M28 100 A72 72 0 0 1 172 100" />
                <path id="pcRingBot" d="M36 100 A64 64 0 0 0 164 100" />
            </defs>
            <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="3" />
            <circle cx="100" cy="100" r="58" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <text fontSize="13" fontWeight="700" letterSpacing="2" fill="currentColor">
                <textPath href="#pcRingTop" startOffset="50%" textAnchor="middle">
                    {place}
                </textPath>
            </text>
            <text fontSize="13" fontWeight="700" letterSpacing="4" fill="currentColor">
                <textPath href="#pcRingBot" startOffset="50%" textAnchor="middle">
                    ★ GMT+8 ★
                </textPath>
            </text>
            <text x="100" y="104" textAnchor="middle" fontSize="28" fontWeight="700" fill="currentColor">
                {hm || "--:--"}
            </text>
            <text x="100" y="126" textAnchor="middle" fontSize="13" fontWeight="700" letterSpacing="3" fill="currentColor">
                {ampm || ""}
            </text>
        </svg>
    );
}

/**
 * Contact, as an airmail postcard that fits one screen. Left: how to reach me, written on the
 * card's ruled lines (copy any of them), plus quick actions as file slips. Right: a stamp with
 * the pass-card portrait, a postmark with my live local time, an availability stamp, and my
 * socials on the address lines.
 */
export default function Contact() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [time, setTime] = useState("");
    const [available, setAvailable] = useState(false);

    useEffect(() => {
        fetch("/api/profile")
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => d && !d.error && setProfile(d))
            .catch(() => setProfile({}));
        const tick = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kuala_Lumpur" }));
            const h = parseInt(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Kuala_Lumpur" }).format(now));
            setAvailable(h >= 9 && h < 20);
        };
        tick();
        const id = window.setInterval(tick, 30000);
        return () => window.clearInterval(id);
    }, []);

    const p = profile || {};
    const phone = p.phone || "+6019-7952427";
    const email = p.email || "naufalnizam25@gmail.com";
    const location = p.location || "Ayer Keroh, Melaka, Malaysia";
    const socials = [
        { label: "LinkedIn", handle: "Professional network", href: p.linkedin_url || "https://www.linkedin.com/in/muhammad-naufal-bin-mohd-nizam-0603b2279", Icon: Linkedin },
        { label: "GitHub", handle: "Code repositories", href: p.github_url || "https://github.com/sunquickpapi", Icon: Github },
        ...(p.instagram_url ? [{ label: "Instagram", handle: "Follow my journey", href: p.instagram_url, Icon: Instagram }] : []),
    ];
    const place = (location.split(",")[0] || "MELAKA").trim().toUpperCase() + " · MY";

    return (
        <section
            id="contact"
            className="section-high-fidelity"
            style={{ minHeight: "100svh", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", padding: "110px 0 50px", scrollMarginTop: 0 }}
        >
            <div className="pc-wrap">
                <div className="pc-card">
                    {/* LEFT: the message side */}
                    <div className="pc-left">
                        <span className={`pc-k ${courier.className}`}>POSTCARD:: N°06</span>
                        <h3 className="pc-hello">Say hello.</h3>
                        <p className={`pc-note ${courier.className}`}>Write anytime, I usually reply within a day.</p>

                        <ul className="pc-lines">
                            <li>
                                <span className={`pc-label ${courier.className}`}>PHONE</span>
                                <a className="pc-value" href={`tel:${phone.replace(/[^+\d]/g, "")}`}>
                                    {phone}
                                </a>
                                <span className={`pc-hint ${courier.className}`}>9 AM – 8 PM MYT</span>
                                <CopyChip text={phone} />
                            </li>
                            <li>
                                <span className={`pc-label ${courier.className}`}>EMAIL</span>
                                <a className="pc-value" href={`mailto:${email}`}>
                                    {email}
                                </a>
                                <span className={`pc-hint ${courier.className}`}>INQUIRIES WELCOME</span>
                                <CopyChip text={email} />
                            </li>
                            <li>
                                <span className={`pc-label ${courier.className}`}>FROM</span>
                                <span className="pc-value">{location}</span>
                                <span className={`pc-hint ${courier.className}`}>GMT+8</span>
                                <CopyChip text={location} />
                            </li>
                        </ul>

                        <div className="pc-actions">
                            <FileLink href={`mailto:${email}`} kicker="QUICK:: MAIL" title="Send Inquiry" chip="WRITE" />
                            <FileLink href={`tel:${phone.replace(/[^+\d]/g, "")}`} kicker="QUICK:: CALL" title="Quick Chat" chip="RING" />
                        </div>
                    </div>

                    {/* RIGHT: stamp, postmark, availability, address lines */}
                    <div className="pc-right">
                        <div className="pc-stamp" aria-hidden="true">
                            <div className="pc-stamp-inner">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/assets/passcard/pass-photo.webp" alt="" draggable={false} />
                                <span className={`pc-stamp-val ${jetbrains.className}`}>RM 0.60</span>
                            </div>
                        </div>
                        <div className={`pc-mark ${courier.className}`}>
                            <Postmark time={time} place={place} />
                            <span className="pc-waves" />
                        </div>
                        <span className={`pc-avail ${available ? "" : "is-off"} ${courier.className}`}>
                            <span className="pc-dot" />
                            {available ? "AVAILABLE NOW" : "AFTER HOURS"}
                        </span>

                        <div className="pc-address">
                            <span className={`pc-label ${courier.className}`}>FIND ME ON</span>
                            {socials.map(({ label, handle, href, Icon }) => (
                                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="pc-addr-line">
                                    <Icon size={16} strokeWidth={2.2} />
                                    <span className="pc-addr-name">{label}</span>
                                    <span className={`pc-addr-sub ${courier.className}`}>{handle}</span>
                                    <span className="pc-addr-arrow" aria-hidden="true">
                                        ↗
                                    </span>
                                </a>
                            ))}
                        </div>
                        <p className={`pc-foot ${courier.className}`}>Open to freelance work and collaborations.</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .pc-wrap {
                    width: 100%;
                    max-width: 1080px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }
                /* airmail postcard: paper, a striped border and a centre divide */
                .pc-card {
                    position: relative;
                    display: grid;
                    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
                    gap: 0;
                    padding: 16px;
                    border-radius: 14px;
                    background: repeating-linear-gradient(-45deg, #1b4f72 0 14px, #fbfcfd 14px 22px, #3a99c9 22px 36px, #fbfcfd 36px 44px);
                    box-shadow: 0 30px 50px -28px rgba(13, 42, 66, 0.5), 0 0 0 1px rgba(13, 42, 66, 0.08);
                    transform: rotate(-0.6deg);
                }
                .pc-left,
                .pc-right {
                    position: relative;
                    background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9 0.35' numOctaves='3' seed='7'/><feColorMatrix values='0 0 0 0 0.05  0 0 0 0 0.16  0 0 0 0 0.26  0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"),
                        linear-gradient(160deg, #fbfcfd 0%, #f1f5f8 100%);
                }
                .pc-left {
                    padding: 34px 38px 30px 40px;
                    border-radius: 6px 0 0 6px;
                }
                .pc-right {
                    padding: 30px 34px 26px 38px;
                    border-radius: 0 6px 6px 0;
                    border-left: 2px dashed rgba(27, 79, 114, 0.22);
                }

                .pc-k {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.24em;
                    color: #3a7ca5;
                }
                .pc-hello {
                    margin: 8px 0 0;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif !important;
                    font-size: clamp(30px, 3.2vw, 44px);
                    font-weight: 800;
                    line-height: 1;
                    letter-spacing: -0.03em;
                    color: #0d2a42;
                }
                .pc-note {
                    margin: 10px 0 0;
                    font-size: 13px;
                    color: #3d5568;
                }

                /* details on ruled lines */
                .pc-lines {
                    list-style: none;
                    margin: 26px 0 0;
                    padding: 0;
                }
                .pc-lines li {
                    position: relative;
                    display: grid;
                    grid-template-columns: 74px minmax(0, 1fr) auto;
                    grid-template-rows: auto auto;
                    column-gap: 14px;
                    align-items: baseline;
                    padding: 12px 40px 10px 0;
                    border-bottom: 1.5px solid rgba(58, 153, 201, 0.25);
                }
                .pc-label {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.2em;
                    color: #3a7ca5;
                }
                .pc-lines .pc-label {
                    grid-row: 1 / 3;
                    align-self: center;
                }
                .pc-value {
                    min-width: 0;
                    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif;
                    font-size: 17px;
                    font-weight: 700;
                    color: #0d2a42;
                    text-decoration: none;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    opacity: 1 !important;
                    transition: color 0.2s ease;
                }
                a.pc-value:hover {
                    color: #1b4f72;
                    text-decoration: underline;
                    text-decoration-style: dashed;
                    text-underline-offset: 4px;
                }
                .pc-hint {
                    grid-column: 2;
                    font-size: 10.5px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    color: rgba(13, 42, 66, 0.45);
                }
                .pc-lines :global(.pc-copy) {
                    position: absolute;
                    right: 0;
                    top: 50%;
                    width: 30px;
                    height: 30px;
                    margin-top: -15px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 999px;
                    border: 1.5px solid rgba(13, 42, 66, 0.3);
                    background: rgba(255, 255, 255, 0.7);
                    color: #1b4f72;
                    cursor: pointer;
                    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.25s ease;
                }
                .pc-lines :global(.pc-copy:hover) {
                    background: #0d2a42;
                    border-color: #0d2a42;
                    color: #e9f4fa;
                    transform: scale(1.06);
                }
                .pc-lines :global(.pc-copy.is-done) {
                    background: #3a99c9;
                    border-color: #3a99c9;
                    color: #fff;
                }
                .pc-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px 18px;
                    margin-top: 30px;
                }
                /* the two quick actions share one row */
                .pc-actions {
                    flex-wrap: nowrap;
                }
                .pc-actions :global(.file-link) {
                    flex: 1 1 0;
                    min-width: 0;
                }
                .pc-actions :global(.hj-slip) {
                    justify-content: space-between;
                    gap: 0.7rem;
                    padding-left: 1.35rem;
                    padding-right: 0.8rem;
                }
                .pc-actions :global(.hj-title) {
                    font-size: 1rem;
                    white-space: nowrap;
                }

                /* stamp with the pass-card portrait */
                .pc-stamp {
                    position: absolute;
                    top: 26px;
                    right: 30px;
                    width: 112px;
                    height: 136px;
                    padding: 7px;
                    box-sizing: border-box;
                    background: #f7f9fa;
                    transform: rotate(3deg);
                    filter: drop-shadow(0 4px 6px rgba(13, 42, 66, 0.25));
                    -webkit-mask: radial-gradient(circle at center, transparent 4px, #000 4.5px) -7px -7px / 14px 14px,
                        linear-gradient(#000 0 0) content-box;
                    mask: radial-gradient(circle at center, transparent 4px, #000 4.5px) -7px -7px / 14px 14px, linear-gradient(#000 0 0) content-box;
                }
                .pc-stamp-inner {
                    position: relative;
                    height: 100%;
                    padding: 6px;
                    box-sizing: border-box;
                    background: #e7eef2;
                    box-shadow: inset 0 0 0 1px rgba(13, 42, 66, 0.15);
                }
                .pc-stamp-inner img {
                    width: 100%;
                    height: calc(100% - 16px);
                    object-fit: cover;
                    image-rendering: pixelated;
                    display: block;
                }
                .pc-stamp-val {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 3px;
                    text-align: center;
                    font-size: 9px;
                    color: #0d2a42;
                }
                /* postmark overlapping the stamp, with cancellation waves */
                .pc-mark {
                    position: absolute;
                    top: 70px;
                    right: 104px;
                    width: 118px;
                    height: 118px;
                    color: rgba(27, 79, 114, 0.72);
                    transform: rotate(-14deg);
                    pointer-events: none;
                    z-index: 2; /* inked over the stamp */
                }
                .pc-mark :global(.pc-postmark) {
                    width: 100%;
                    height: 100%;
                }
                .pc-waves {
                    position: absolute;
                    top: 34px;
                    right: 96%;
                    width: 120px;
                    height: 50px;
                    background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='50'><g fill='none' stroke='%231b4f72' stroke-opacity='.6' stroke-width='2.2'><path d='M0 8 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0 t20 0'/><path d='M0 25 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0 t20 0'/><path d='M0 42 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0 t20 0'/></g></svg>");
                }
                .pc-avail {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 6px;
                    padding: 7px 12px;
                    border: 2px solid #1b4f72;
                    border-radius: 8px;
                    outline: 1px solid #1b4f72;
                    outline-offset: -6px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.2em;
                    color: #1b4f72;
                    transform: rotate(-3deg);
                }
                .pc-avail.is-off {
                    color: #6b7f8e;
                    border-color: #6b7f8e;
                    outline-color: #6b7f8e;
                }
                .pc-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #3a99c9;
                    box-shadow: 0 0 0 0 rgba(58, 153, 201, 0.6);
                    animation: pc-pulse 2s ease-out infinite;
                }
                .pc-avail.is-off .pc-dot {
                    background: #9aaab6;
                    animation: none;
                }
                @keyframes pc-pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(58, 153, 201, 0.55);
                    }
                    100% {
                        box-shadow: 0 0 0 10px rgba(58, 153, 201, 0);
                    }
                }

                /* address lines with the socials */
                .pc-address {
                    margin-top: 150px;
                    display: flex;
                    flex-direction: column;
                }
                .pc-address .pc-label {
                    margin-bottom: 4px;
                }
                .pc-addr-line {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 11px 2px;
                    border-bottom: 1.5px solid rgba(58, 153, 201, 0.25);
                    color: #1b4f72;
                    text-decoration: none;
                    opacity: 1 !important;
                    transition: padding 0.25s ease, color 0.2s ease;
                }
                .pc-addr-line:hover {
                    padding-left: 8px;
                    color: #0d2a42;
                }
                .pc-addr-name {
                    font-size: 16px;
                    font-weight: 800;
                    color: #0d2a42;
                }
                .pc-addr-sub {
                    flex: 1;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    color: rgba(13, 42, 66, 0.45);
                    text-transform: uppercase;
                }
                .pc-addr-arrow {
                    font-weight: 800;
                    transition: transform 0.25s ease;
                }
                .pc-addr-line:hover .pc-addr-arrow {
                    transform: translate(2px, -2px);
                }
                .pc-foot {
                    margin: 16px 0 0;
                    font-size: 12px;
                    color: #3d5568;
                }

                @media (max-width: 900px) {
                    .pc-card {
                        grid-template-columns: minmax(0, 1fr);
                        transform: none;
                    }
                    .pc-left {
                        border-radius: 6px 6px 0 0;
                    }
                    .pc-right {
                        border-left: 0;
                        border-top: 2px dashed rgba(27, 79, 114, 0.22);
                        border-radius: 0 0 6px 6px;
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    .pc-dot {
                        animation: none;
                    }
                }
            `}</style>
        </section>
    );
}
