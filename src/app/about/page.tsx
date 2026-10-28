"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Courier_Prime } from "next/font/google";
import * as LucideIcons from "lucide-react";
import { ArrowLeft, ArrowUpRight, Award, Coffee, Download, Dumbbell, ExternalLink, Globe, Heart, Trophy, Zap } from "lucide-react";
import PixelField from "@/components/Home/PixelField";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Hobby icons are stored by Lucide name; a couple of loose names are mapped, anything unknown falls back to a heart. */
const ICON_ALIAS: Record<string, string> = { console: "Gamepad2", gaming: "Gamepad2", gamepad: "Gamepad2", music: "Music" };
function HobbyIcon({ name, size = 18 }: { name?: string; size?: number }) {
    const key = (name || "").trim();
    const Icon = ((LucideIcons as any)[ICON_ALIAS[key.toLowerCase()] || key] || Heart) as React.ComponentType<{ size?: number; strokeWidth?: number }>;
    return <Icon size={size} strokeWidth={2.2} />;
}

/** Experience points are stored as one comma-separated string; split only where a new sentence starts. */
const splitPoints = (s?: string) =>
    (s || "")
        .split(/,\s*\n\s*|,\s+(?=[A-Z])/)
        .map((p) => p.trim().replace(/[.,]$/, ""))
        .filter(Boolean);

const SECTIONS = [
    ["profile", "Profile"],
    ["skills", "Skills"],
    ["journey", "Journey"],
    ["education", "Education"],
    ["certifications", "Certificates"],
    ["experience", "Experience"],
] as const;

const BANNER_TOP = [4, 5, 6, 7, 8];
const BANNER_BOTTOM = [9, 10, 1, 2, 3];
const GALLERY = [14, 11, 12, 13];

function Head({ no, title, sub }: { no: string; title: string; sub?: string }) {
    return (
        <header className="ab-head">
            <span className={`ab-kicker ${courier.className}`}>FILE:: {no}</span>
            <h2 className="ab-h2">{title}</h2>
            {sub && <p className="ab-sub">{sub}</p>}
        </header>
    );
}

/**
 * About, rebuilt in the site's current look: pixel background, floating top bar, paper
 * panels with navy ink and typewriter labels. Same content as before: profile + stats + CV,
 * the moving photo banner, skills & hobbies, journey + life in pictures, education with
 * coursework and activities, certifications (hover for a preview), experience, and a CTA.
 */
export default function AboutPage() {
    const [profile, setProfile] = useState<any>(null);
    const [skills, setSkills] = useState<any[]>([]);
    const [education, setEducation] = useState<any[]>([]);
    const [experience, setExperience] = useState<any[]>([]);
    const [certifications, setCertifications] = useState<any[]>([]);
    const [hobbies, setHobbies] = useState<any[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [preview, setPreview] = useState<{ src: string; x: number; y: number } | null>(null);
    const [active, setActive] = useState("profile");

    useEffect(() => {
        const get = (url: string) =>
            fetch(url)
                .then((r) => (r.ok ? r.json() : null))
                .then((d) => (d?.error ? null : d))
                .catch(() => null);
        Promise.all([get("/api/profile"), get("/api/skills"), get("/api/education"), get("/api/experience"), get("/api/certifications"), get("/api/hobbies")]).then(
            ([p, s, edu, exp, certs, hob]) => {
                setProfile(p || {});
                setSkills(Array.isArray(s) ? s : []);
                setEducation(Array.isArray(edu) ? edu : []);
                setExperience(Array.isArray(exp) ? exp : []);
                setCertifications(Array.isArray(certs) ? certs : []);
                setHobbies(Array.isArray(hob) ? hob : []);
                setLoaded(true);
            }
        );
    }, []);

    // highlight the section in view in the top bar
    useEffect(() => {
        if (!loaded) return;
        const onScroll = () => {
            let cur: string = SECTIONS[0][0];
            for (const [id] of SECTIONS) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35) cur = id;
            }
            setActive(cur);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [loaded]);

    const skillGroups = useMemo(() => {
        const m = new Map<string, any[]>();
        skills.forEach((s) => {
            const c = s.category || "Other";
            m.set(c, [...(m.get(c) || []), s]);
        });
        return Array.from(m.entries());
    }, [skills]);

    const stats = profile
        ? [
              { icon: Trophy, n: profile.projects_count || "15", label: "Projects built" },
              { icon: Zap, n: profile.tech_learned_count || "17", label: "Tech learned" },
              { icon: Globe, n: profile.experience_years || "4", label: "Years coding" },
              { icon: Coffee, n: profile.coffee_consumed || "900", label: "Coffee consumed" },
              { icon: Dumbbell, n: profile.dumbells_lifted_count || "900", label: "Dumbbells lifted" },
          ]
        : [];
    const cv = profile?.resume_url || "/assets/MY RESUME.pdf";

    return (
        <div className="ab-page">
            <PixelField />

            {/* top bar: back, section links, CV */}
            <div className="ab-bar">
                <Link href="/" className="ab-back" aria-label="Back to home">
                    <ArrowLeft size={16} strokeWidth={2.4} />
                    <span className={courier.className}>HOME</span>
                </Link>
                <nav className="ab-nav" aria-label="Sections">
                    {SECTIONS.map(([id, label]) => (
                        <a key={id} href={`#${id}`} className={active === id ? "is-on" : ""}>
                            {label}
                        </a>
                    ))}
                </nav>
                <a href={cv} target="_blank" rel="noreferrer" className="ab-cv">
                    <Download size={15} strokeWidth={2.4} /> <span>CV</span>
                </a>
            </div>

            {!loaded ? (
                <p className={`ab-loading ${courier.className}`}>OPENING THE FILE…</p>
            ) : (
                <main className="ab-main" data-no-ripple>
                    {/* ── 01 PROFILE ── */}
                    <div id="profile" className="ab-panel ab-hero">
                        <div className="ab-hero-text">
                            <span className={`ab-kicker ${courier.className}`}>FILE:: 00 · PERSONNEL RECORD</span>
                            <h1 className="ab-h1">
                                More About <span>Me</span>
                            </h1>
                            <p className="ab-role">{profile.role || "Intelligent System Engineer"}</p>
                            <p className="ab-tagline">
                                {profile.tagline ||
                                    "Passionate developer, lifelong learner, and creative problem solver. Here's my journey, skills, and what drives me every day."}
                            </p>
                            <div className="ab-ctas">
                                <a href={cv} target="_blank" rel="noreferrer" className="ab-btn is-dark">
                                    <Download size={16} strokeWidth={2.4} /> Download CV
                                </a>
                                <Link href="/projects" className="ab-btn">
                                    View my projects <ArrowUpRight size={16} strokeWidth={2.4} />
                                </Link>
                            </div>
                        </div>
                        <div className="ab-photo-wrap" aria-hidden="true">
                            <div className="ab-photo">
                                <div className="ab-photo-in">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/assets/passcard/pass-photo.webp" alt="" draggable={false} />
                                    <span className={courier.className}>{(profile.name || "Naufal Nizam").toUpperCase()}</span>
                                </div>
                            </div>
                            <span className={`ab-photo-tag ${courier.className}`}>{(profile.location || "MALAYSIA").toUpperCase()}</span>
                        </div>
                        <div className="ab-stats">
                            {stats.map(({ icon: Icon, n, label }) => (
                                <div className="ab-stat" key={label}>
                                    <Icon size={18} strokeWidth={2.2} />
                                    <strong>{n}+</strong>
                                    <span className={courier.className}>{label.toUpperCase()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── moving photo banner ── */}
                    <div className="ab-banner" aria-hidden="true">
                        {[BANNER_TOP, BANNER_BOTTOM].map((row, r) => (
                            <div className={`ab-banner-row ${r ? "is-rev" : ""}`} key={r}>
                                <div className="ab-banner-track">
                                    {[...row, ...row, ...row, ...row].map((i, k) => (
                                        <span className="ab-print" key={k} style={{ ["--t" as string]: `${[-2, 1.5, -1, 2, -1.5][k % 5]}deg` }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={`/assets/ban${i}.jpg`} alt="" loading="lazy" draggable={false} />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── 02 SKILLS ── */}
                    <div id="skills" className="ab-sec">
                        <Head no="01 · SKILLS & EXPERTISE" title="Skills & Expertise" sub="Technologies and tools I work with, constantly learning and improving." />
                        <div className="ab-skills">
                            {skillGroups.map(([cat, list]) => (
                                <div className="ab-panel ab-skill-col" key={cat}>
                                    <span className={`ab-kicker ab-rule ${courier.className}`}>
                                        {cat.toUpperCase()} · {String(list.length).padStart(2, "0")}
                                    </span>
                                    <div className="ab-chips">
                                        {list.map((s: any) => (
                                            <span className="ab-chip" key={s.id}>
                                                {s.icon_url && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={s.icon_url} alt="" />
                                                )}
                                                {s.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div className="ab-panel ab-hobbies">
                                <span className={`ab-kicker ab-rule ${courier.className}`}>INTERESTS & HOBBIES</span>
                                <ul>
                                    {(hobbies.length
                                        ? hobbies
                                        : [
                                              { id: "p", name: "Photography", icon_name: "Camera", description: "Photography enthusiast capturing moments and memories" },
                                              { id: "g", name: "Gaming", icon_name: "Gamepad2", description: "Gaming for creativity and strategic thinking" },
                                              { id: "m", name: "Music", icon_name: "Music", description: "Music lover exploring various genres and artists" },
                                          ]
                                    ).map((h: any) => (
                                        <li key={h.id}>
                                            <span className="ab-hob-ico">
                                                <HobbyIcon name={h.icon_name} />
                                            </span>
                                            <span>
                                                <strong>{(h.name || "").trim()}</strong>
                                                {h.description && <em>{h.description.trim()}</em>}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* ── 03 JOURNEY ── */}
                    <div id="journey" className="ab-sec">
                        <div className="ab-panel ab-journey">
                            <div className="ab-journey-text">
                                <Head no="02 · MY JOURNEY" title="My Journey" />
                                <p>
                                    I&apos;m a passionate <strong>{profile.role || "Intelligent System student"}</strong> and web developer with over{" "}
                                    {profile.experience_years || "4"} years of experience creating digital experiences.
                                </p>
                                <p>
                                    Currently pursuing my degree, I balance my academic pursuits with hands-on project work, constantly learning and adapting to new
                                    technologies. I specialize in building intelligent, scalable systems that bridge the gap between AI and intuitive user experience.
                                </p>
                            </div>
                            <div className="ab-gallery">
                                <span className={`ab-kicker ${courier.className}`}>LIFE IN PICTURES</span>
                                <div className="ab-gallery-grid">
                                    {GALLERY.map((i, k) => (
                                        <span className="ab-print" key={i} style={{ ["--t" as string]: `${[-2.5, 2, 1.5, -2][k]}deg` }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={`/assets/ban${i}.jpg`} alt="" loading="lazy" draggable={false} />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── 04 EDUCATION ── */}
                    {education.length > 0 && (
                        <div id="education" className="ab-sec">
                            <Head no="03 · EDUCATION" title="Education" sub="My academic journey and the coursework and activities that shape my expertise." />
                            {education.map((edu: any) => {
                                const groups = (edu.activities || []).reduce((acc: Record<string, any[]>, a: any) => {
                                    (acc[a.section_name] ||= []).push(a);
                                    return acc;
                                }, {});
                                return (
                                    <div className="ab-panel ab-org" key={edu.id}>
                                        <div className="ab-org-head">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img className="ab-logo" src={edu.logo_url || "/assets/uitm logo.png"} alt="" />
                                            <div>
                                                <h3>{edu.institution}</h3>
                                                <p>{edu.degree}</p>
                                                <span className={`ab-pill ${courier.className}`}>{(edu.years || "").toUpperCase()}</span>
                                            </div>
                                        </div>
                                        {edu.coursework && (
                                            <div className="ab-block">
                                                <span className={`ab-kicker ab-rule ${courier.className}`}>RELATED COURSEWORK</span>
                                                <div className="ab-chips">
                                                    {edu.coursework
                                                        .split(",")
                                                        .map((c: string) => c.trim())
                                                        .filter(Boolean)
                                                        .map((c: string) => (
                                                            <span className="ab-chip is-soft" key={c}>
                                                                {c}
                                                            </span>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                        {Object.keys(groups).length > 0 && (
                                            <div className="ab-acts">
                                                {Object.entries(groups).map(([name, items]) => (
                                                    <div className="ab-block" key={name}>
                                                        <span className={`ab-kicker ab-rule ${courier.className}`}>{name.toUpperCase()}</span>
                                                        <ol className="ab-timeline">
                                                            {(items as any[]).map((a) => (
                                                                <li key={a.id}>
                                                                    <div className="ab-tl-top">
                                                                        <strong>{a.title}</strong>
                                                                        {a.tags && <span className="ab-badge">{a.tags}</span>}
                                                                    </div>
                                                                    {a.date && <span className={`ab-date ${courier.className}`}>{a.date.toUpperCase()}</span>}
                                                                    {a.description && <p>{a.description.trim()}</p>}
                                                                </li>
                                                            ))}
                                                        </ol>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {edu.involvement && (
                                            <div className="ab-block">
                                                <span className={`ab-kicker ab-rule ${courier.className}`}>ACTIVITIES & INVOLVEMENT</span>
                                                <p className="ab-pre">{edu.involvement}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── 05 CERTIFICATIONS ── */}
                    {certifications.length > 0 && (
                        <div id="certifications" className="ab-sec">
                            <Head
                                no="04 · CERTIFICATIONS"
                                title="Professional Certifications"
                                sub={`${certifications.length} certificates and awards. Hover one to see it.`}
                            />
                            <div className="ab-certs">
                                {certifications.map((c: any, i: number) => (
                                    <div
                                        className="ab-cert"
                                        key={c.id}
                                        onMouseMove={(e) => c.image_url && setPreview({ src: c.image_url.trim(), x: e.clientX, y: e.clientY })}
                                        onMouseLeave={() => setPreview(null)}
                                    >
                                        <span className={`ab-cert-no ${courier.className}`}>{String(i + 1).padStart(2, "0")}</span>
                                        <Award className="ab-cert-ico" size={20} strokeWidth={2.2} />
                                        <h4>{c.title}</h4>
                                        <span className={`ab-date ${courier.className}`}>{(c.date || "").toUpperCase()}</span>
                                        <div className="ab-cert-foot">
                                            <span className="ab-issuer">{(c.issuer || "").replace(/^Certification By\s+/i, "")}</span>
                                            {c.credential_url && (
                                                <a href={c.credential_url} target="_blank" rel="noreferrer" className="ab-cred">
                                                    <ExternalLink size={13} strokeWidth={2.4} /> Credential
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── 06 EXPERIENCE ── */}
                    {experience.length > 0 && (
                        <div id="experience" className="ab-sec">
                            <Head no="05 · EXPERIENCE" title="Experience" sub="A timeline of my professional growth and technical contributions." />
                            <div className="ab-exp">
                                {experience.map((x: any) => {
                                    const desc = (x.description || "").trim();
                                    return (
                                        <div className="ab-panel ab-org" key={x.id}>
                                            <div className="ab-org-head">
                                                {x.logo_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img className="ab-logo" src={x.logo_url} alt="" />
                                                ) : (
                                                    <span className="ab-logo is-empty">
                                                        <Globe size={26} />
                                                    </span>
                                                )}
                                                <div>
                                                    <h3>{x.company}</h3>
                                                    <p>{x.role}</p>
                                                    <span className={`ab-pill ${courier.className}`}>{(x.duration || "").toUpperCase()}</span>
                                                </div>
                                                {x.company_url && (
                                                    <a href={x.company_url} target="_blank" rel="noreferrer" className="ab-btn is-small">
                                                        <Globe size={14} strokeWidth={2.4} /> Website
                                                    </a>
                                                )}
                                            </div>
                                            {desc && !desc.endsWith(":") && <p className="ab-desc">{desc}</p>}
                                            {splitPoints(x.points).length > 0 && (
                                                <ul className="ab-points">
                                                    {splitPoints(x.points).map((p, k) => (
                                                        <li key={k}>{p}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── CTA ── */}
                    <div className="ab-panel ab-cta">
                        <span className={`ab-kicker ${courier.className}`}>END OF FILE</span>
                        <h2 className="ab-h2">
                            Let&apos;s build something
                            <br />
                            amazing together
                        </h2>
                        <p className="ab-sub">Ready to turn your ideas into reality? Let&apos;s discuss your next project and create something extraordinary.</p>
                        <div className="ab-ctas">
                            <Link href="/projects" className="ab-btn is-dark">
                                View my projects
                            </Link>
                            <Link href="/#contact" className="ab-btn">
                                Get in touch <ArrowUpRight size={16} strokeWidth={2.4} />
                            </Link>
                        </div>
                    </div>
                </main>
            )}

            {/* certificate preview follows the cursor */}
            {preview && (
                <div className="ab-preview" style={{ left: Math.min(preview.x + 22, (typeof window !== "undefined" ? window.innerWidth : 9999) - 340), top: preview.y + 22 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview.src} alt="" />
                </div>
            )}

            <style jsx global>{STYLES}</style>
        </div>
    );
}

const STYLES = `
.ab-page {
    position: relative;
    min-height: 100vh;
    background: transparent;
    --ink: #0d2a42;
    --navy: #1b4f72;
    --sky: #3a99c9;
    --muted: #3a7ca5;
    --paper: #fbfcfd;
    --body: #3d5a70;
}
.ab-page a { opacity: 1 !important; }

/* ---- floating top bar ---- */
.ab-bar {
    position: sticky;
    top: 18px;
    z-index: 50;
    width: fit-content;
    max-width: calc(100% - 32px);
    margin: 18px auto 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px;
    border-radius: 16px;
    background: rgba(251, 252, 253, 0.88);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 16px 30px -18px rgba(13, 42, 66, 0.45);
}
.ab-back {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 38px;
    padding: 0 12px;
    border-radius: 11px;
    color: var(--ink);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-decoration: none;
    transition: background 0.2s ease;
}
.ab-back:hover { background: rgba(27, 79, 114, 0.08); }
.ab-nav { display: flex; gap: 2px; overflow-x: auto; scrollbar-width: none; }
.ab-nav::-webkit-scrollbar { display: none; }
.ab-nav a {
    flex: none;
    height: 38px;
    display: inline-flex;
    align-items: center;
    padding: 0 12px;
    border-radius: 11px;
    color: var(--navy);
    font-size: 13.5px;
    font-weight: 700;
    text-decoration: none;
    transition: background 0.2s ease, color 0.2s ease;
}
.ab-nav a:hover { background: rgba(27, 79, 114, 0.07); color: var(--ink); }
.ab-nav a.is-on { background: rgba(27, 79, 114, 0.1); color: var(--ink); }
.ab-cv {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 38px;
    padding: 0 14px;
    border-radius: 11px;
    background: var(--ink);
    color: #e9f4fa;
    font-size: 13.5px;
    font-weight: 800;
    text-decoration: none;
}
.ab-loading { padding-top: 30vh; text-align: center; font-size: 12px; font-weight: 700; letter-spacing: 0.24em; color: var(--muted); animation: ab-blink 1.2s ease-in-out infinite; }
@keyframes ab-blink { 50% { opacity: 0.35; } }

/* ---- shared ---- */
.ab-main { position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; padding: 34px 20px 90px; }
.ab-panel {
    position: relative;
    border-radius: 20px;
    background: linear-gradient(160deg, #fbfcfd 0%, #f1f5f8 100%);
    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.1), 0 30px 50px -34px rgba(13, 42, 66, 0.5);
}
.ab-kicker { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.24em; color: var(--muted); }
.ab-rule { padding-bottom: 10px; margin-bottom: 14px; border-bottom: 1.5px solid rgba(27, 79, 114, 0.16); }
.ab-sec { padding-top: 96px; scroll-margin-top: 30px; }
.ab-head { margin-bottom: 26px; }
.ab-h2 {
    margin: 8px 0 0;
    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif !important;
    font-size: clamp(32px, 4vw, 48px);
    line-height: 1.05;
    font-weight: 900;
    letter-spacing: -0.035em;
    color: var(--ink);
}
.ab-sub { margin: 10px 0 0; max-width: 560px; font-size: 16px; line-height: 1.6; color: var(--body); }
.ab-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 46px;
    padding: 0 20px;
    border: 2px solid var(--ink);
    border-radius: 999px;
    background: #fff;
    color: var(--ink);
    font-size: 14.5px;
    font-weight: 800;
    text-decoration: none;
    white-space: nowrap;
    transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease;
}
.ab-btn:hover { transform: translateY(-2px); }
.ab-btn.is-dark { background: var(--ink); color: #e9f4fa; }
.ab-btn.is-small { height: 36px; padding: 0 14px; font-size: 13px; margin-left: auto; align-self: flex-start; }
.ab-btn.is-small:hover { background: var(--ink); color: #e9f4fa; }
.ab-ctas { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
.ab-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.ab-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 13px;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.1), 0 6px 12px -10px rgba(13, 42, 66, 0.5);
    color: var(--ink);
    font-size: 14px;
    font-weight: 700;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.ab-chip:hover { transform: translateY(-2px); box-shadow: 0 0 0 1.5px var(--sky), 0 10px 16px -10px rgba(13, 42, 66, 0.5); }
.ab-chip img { width: 18px; height: 18px; object-fit: contain; }
.ab-chip.is-soft { background: rgba(27, 79, 114, 0.07); box-shadow: none; font-size: 13.5px; color: var(--navy); }
.ab-chip.is-soft:hover { box-shadow: none; background: rgba(27, 79, 114, 0.12); }
.ab-pill { display: inline-block; margin-top: 10px; padding: 3px 11px; border: 1.5px solid rgba(13, 42, 66, 0.35); border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: var(--navy); }
.ab-date { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; color: var(--muted); }

/* ---- profile ---- */
.ab-hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 30px 50px;
    padding: 50px 54px 0;
    scroll-margin-top: 100px;
    animation: ab-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes ab-in { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
.ab-hero::before { content: ""; position: absolute; inset: 10px; border: 1.5px solid rgba(27, 79, 114, 0.18); border-radius: 13px; pointer-events: none; }
.ab-h1 {
    margin: 12px 0 0;
    font-family: var(--font-geist-sans), Inter, -apple-system, sans-serif !important;
    font-size: clamp(46px, 6.4vw, 86px);
    line-height: 0.95;
    font-weight: 900;
    letter-spacing: -0.045em;
    color: var(--ink);
}
.ab-h1 span { color: var(--sky); }
.ab-role { margin: 18px 0 0; font-size: 20px; font-weight: 800; color: var(--navy); }
.ab-tagline { margin: 10px 0 0; max-width: 560px; font-size: 16.5px; line-height: 1.7; color: var(--body); }
.ab-photo-wrap { position: relative; align-self: center; justify-self: center; }
.ab-photo {
    width: 250px;
    padding: 9px;
    /* perforated stamp edge: holes only show in the 9px border band */
    background: radial-gradient(circle, transparent 4px, #fff 4.6px) -7px -7px / 14px 14px;
    filter: drop-shadow(0 18px 22px rgba(13, 42, 66, 0.3));
    transform: rotate(2.5deg);
    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.ab-photo:hover { transform: rotate(0deg) scale(1.02); }
.ab-photo-in { padding: 10px 10px 0; background: #fff; }
.ab-photo img { display: block; width: 100%; aspect-ratio: 368 / 420; object-fit: cover; object-position: 50% 0; image-rendering: pixelated; background: #c9d4da; }
.ab-photo span { display: block; padding: 12px 2px 16px; font-size: 13px; font-weight: 700; letter-spacing: 0.18em; color: var(--ink); }
.ab-photo-tag {
    position: absolute;
    left: -30px;
    top: 30px;
    padding: 6px 12px;
    border-radius: 6px;
    background: var(--ink);
    color: #e9f4fa;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    transform: rotate(-6deg);
    box-shadow: 0 10px 18px -10px rgba(13, 42, 66, 0.6);
}
.ab-stats {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    margin: 0 -54px;
    border-top: 1.5px solid rgba(27, 79, 114, 0.16);
}
.ab-stat { display: flex; flex-direction: column; gap: 4px; padding: 22px 26px 26px; color: var(--navy); }
.ab-stat + .ab-stat { border-left: 2px dashed rgba(27, 79, 114, 0.18); }
.ab-stat strong { margin-top: 8px; font-size: 32px; line-height: 1; font-weight: 900; letter-spacing: -0.03em; color: var(--ink); }
.ab-stat span { font-size: 10.5px; font-weight: 700; letter-spacing: 0.16em; color: var(--muted); }

/* ---- moving banner ---- */
.ab-banner {
    margin: 70px -20px 0;
    display: flex;
    flex-direction: column;
    gap: 22px;
    -webkit-mask: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
    mask: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}
.ab-banner-row { overflow: hidden; padding: 10px 0; }
.ab-banner-track { display: flex; gap: 22px; width: max-content; animation: ab-marquee 60s linear infinite; }
.ab-banner-row.is-rev .ab-banner-track { animation-direction: reverse; animation-duration: 70s; }
.ab-banner:hover .ab-banner-track { animation-play-state: paused; }
@keyframes ab-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.ab-print {
    flex: none;
    display: block;
    padding: 7px 7px 22px;
    border-radius: 4px;
    background: #fff;
    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 16px 24px -16px rgba(13, 42, 66, 0.55);
    transform: rotate(var(--t, 0deg));
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.ab-print:hover { transform: rotate(0deg) scale(1.04); }
.ab-print img { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 2px; background: #dfe9f0; }
.ab-banner .ab-print { width: 280px; height: 210px; }

/* ---- skills ---- */
.ab-skills { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.ab-skill-col { padding: 24px 24px 26px; }
.ab-hobbies { grid-column: 1 / -1; padding: 24px 26px 26px; }
.ab-hobbies ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.ab-hobbies li { display: flex; align-items: flex-start; gap: 14px; }
.ab-hob-ico { flex: none; display: grid; place-items: center; width: 42px; height: 42px; border-radius: 12px; background: var(--ink); color: #e9f4fa; }
.ab-hobbies strong { display: block; font-size: 15.5px; font-weight: 800; color: var(--ink); }
.ab-hobbies em { display: block; margin-top: 2px; font-style: normal; font-size: 14px; line-height: 1.5; color: var(--body); }

/* ---- journey ---- */
.ab-journey { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 50px; padding: 42px 46px 46px; }
.ab-journey-text p { margin: 0 0 1.1em; font-size: 17px; line-height: 1.75; color: var(--body); }
.ab-journey-text strong { color: var(--ink); }
.ab-gallery-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-top: 16px; }
.ab-gallery-grid .ab-print { aspect-ratio: 4 / 3.4; }

/* ---- education / experience cards ---- */
.ab-org { padding: 34px 36px 36px; }
.ab-org + .ab-org { margin-top: 22px; }
.ab-org-head { display: flex; align-items: flex-start; gap: 22px; }
.ab-logo {
    flex: none;
    width: 72px;
    height: 72px;
    padding: 8px;
    border-radius: 16px;
    background: #fff;
    object-fit: contain;
    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.1), 0 10px 18px -12px rgba(13, 42, 66, 0.5);
}
.ab-logo.is-empty { display: grid; place-items: center; color: rgba(27, 79, 114, 0.4); }
.ab-org-head h3 { margin: 0; font-size: 22px; line-height: 1.25; font-weight: 800; letter-spacing: -0.015em; color: var(--ink); }
.ab-org-head p { margin: 4px 0 0; font-size: 16px; line-height: 1.45; color: var(--body); }
.ab-block { margin-top: 28px; }
.ab-acts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 34px; }
.ab-timeline { list-style: none; margin: 0; padding: 0 0 0 20px; border-left: 2px solid rgba(27, 79, 114, 0.14); display: flex; flex-direction: column; gap: 22px; }
.ab-timeline li { position: relative; }
.ab-timeline li::before { content: ""; position: absolute; left: -27px; top: 5px; width: 12px; height: 12px; border-radius: 50%; background: var(--paper); box-shadow: inset 0 0 0 3px var(--sky); }
.ab-tl-top { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 10px; }
.ab-tl-top strong { font-size: 16.5px; font-weight: 800; color: var(--ink); }
.ab-badge { padding: 2px 10px; border-radius: 999px; background: var(--ink); color: #e9f4fa; font-size: 11.5px; font-weight: 700; }
.ab-timeline .ab-date { margin-top: 6px; }
.ab-timeline p { margin: 8px 0 0; font-size: 14.5px; line-height: 1.6; color: var(--body); }
.ab-pre { margin: 0; white-space: pre-line; font-size: 15px; line-height: 1.65; color: var(--body); }
.ab-desc { margin: 22px 0 0; font-size: 15.5px; line-height: 1.65; color: var(--body); }
.ab-points { list-style: none; margin: 22px 0 0; padding: 18px 0 0; border-top: 2px dashed rgba(27, 79, 114, 0.16); display: flex; flex-direction: column; gap: 12px; }
.ab-points li { position: relative; padding-left: 24px; font-size: 15.5px; line-height: 1.6; color: #2d4a60; }
.ab-points li::before { content: ""; position: absolute; left: 4px; top: 9px; width: 8px; height: 8px; border-radius: 2px; background: var(--sky); transform: rotate(45deg); }

/* ---- certifications ---- */
.ab-certs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.ab-cert {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 22px 22px 18px;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.08), 0 16px 26px -20px rgba(13, 42, 66, 0.55);
    cursor: zoom-in;
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
}
.ab-cert:hover { transform: translateY(-4px); box-shadow: 0 0 0 1.5px var(--sky), 0 22px 30px -20px rgba(13, 42, 66, 0.6); }
.ab-cert-no { position: absolute; top: 18px; right: 20px; font-size: 12px; font-weight: 700; color: rgba(27, 79, 114, 0.35); }
.ab-cert-ico { color: var(--sky); }
.ab-cert h4 { margin: 4px 0 0; font-size: 15.5px; line-height: 1.35; font-weight: 800; color: var(--ink); }
.ab-cert-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: auto; padding-top: 12px; border-top: 2px dashed rgba(27, 79, 114, 0.14); }
.ab-issuer { font-size: 12.5px; font-weight: 700; color: var(--navy); }
.ab-cred {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 30px;
    padding: 0 11px;
    border-radius: 999px;
    background: rgba(27, 79, 114, 0.08);
    color: var(--ink);
    font-size: 12px;
    font-weight: 800;
    text-decoration: none;
    transition: background 0.2s ease, color 0.2s ease;
}
.ab-cred:hover { background: var(--ink); color: #e9f4fa; }
.ab-preview {
    position: fixed;
    z-index: 200;
    width: 320px;
    padding: 8px;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 0 0 1px rgba(13, 42, 66, 0.1), 0 30px 50px -20px rgba(13, 42, 66, 0.6);
    pointer-events: none;
    animation: ab-pop 0.25s ease both;
}
@keyframes ab-pop { from { opacity: 0; transform: scale(0.94); } }
.ab-preview img { display: block; width: 100%; border-radius: 6px; }

/* ---- CTA ---- */
.ab-cta { margin-top: 96px; padding: 56px 40px; text-align: center; }
.ab-cta::before { content: ""; position: absolute; inset: 10px; border: 1.5px solid rgba(27, 79, 114, 0.18); border-radius: 13px; pointer-events: none; }
.ab-cta .ab-sub { margin-left: auto; margin-right: auto; }
.ab-cta .ab-ctas { justify-content: center; }

/* ---- smaller screens ---- */
@media (max-width: 1000px) {
    .ab-hero { grid-template-columns: minmax(0, 1fr); padding: 40px 32px 0; }
    .ab-photo-wrap { grid-row: 1; justify-self: start; }
    .ab-photo { width: 190px; }
    .ab-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 0 -32px; }
    .ab-stat:nth-child(4) { border-left: 0; }
    .ab-stat:nth-child(n + 4) { border-top: 2px dashed rgba(27, 79, 114, 0.18); }
    .ab-skills, .ab-certs { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .ab-hobbies ul { grid-template-columns: minmax(0, 1fr); }
    .ab-journey { grid-template-columns: minmax(0, 1fr); padding: 34px 30px; }
    .ab-acts { grid-template-columns: minmax(0, 1fr); }
    .ab-nav { max-width: 46vw; }
}
@media (max-width: 640px) {
    .ab-main { padding: 22px 12px 70px; }
    .ab-hero { padding: 34px 22px 0; }
    .ab-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 0 -22px; }
    .ab-stat { padding: 18px 20px 20px; }
    .ab-stat:nth-child(n) { border-left: 0; border-top: 2px dashed rgba(27, 79, 114, 0.18); }
    .ab-stat:nth-child(even) { border-left: 2px dashed rgba(27, 79, 114, 0.18); }
    .ab-stat:nth-child(-n + 2) { border-top: 0; }
    .ab-skills, .ab-certs { grid-template-columns: minmax(0, 1fr); }
    .ab-org { padding: 26px 22px; }
    .ab-org-head { flex-wrap: wrap; }
    .ab-btn.is-small { margin-left: 0; }
    .ab-banner .ab-print { width: 200px; height: 150px; }
    .ab-nav { display: none; }
    .ab-sec { padding-top: 70px; }
    .ab-cta { padding: 40px 22px; }
}
@media (prefers-reduced-motion: reduce) {
    .ab-banner-track { animation: none; }
}
`;
