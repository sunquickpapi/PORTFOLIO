"use client";

import { useEffect, useState } from "react";
import { Download, Mail, ChevronDown, Trophy, Coffee, Zap } from "lucide-react";

export default function Hero() {
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        fetch("/api/profile")
            .then((res) => {
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                if (data && !data.error) setProfile(data);
            })
            .catch((err) => console.error("Error fetching profile:", err));
    }, []);

    return (
        <section id="home" className="hero hero-clean">
            <div className="hero-bg" aria-hidden="true" />
            {!profile ? (
                <div className="container" style={{ minHeight: "600px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="animate-pulse text-[var(--color-text-muted)] text-2xl font-bold tracking-tighter">Initializing Portfolio...</div>
                </div>
            ) : (
                <div className="container hero-grid">
                    <div className="hero-content text-left">
                        <h1>
                            Hello Everyone,<br />
                            I&apos;m <span className="name-gradient">{profile.name?.split(' ')[profile.name.split(' ').length - 1] || 'Naufal'}</span>
                        </h1>
                        <p className="subtitle">{profile.role || "Intelligent System Engineer"}</p>
                        <p className="value-prop">
                            {profile.tagline || profile.bio || "A passionate Intelligent System Engineer crafting smart solutions."}
                        </p>

                        <div className="hero-stats flex flex-wrap gap-4 my-8">
                            <div className="stat-card">
                                <Trophy className="stat-icon" />
                                <div className="stat-info">
                                    <h3>{profile.projects_count || "15"}+</h3>
                                    <p>Projects Completed</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <Zap className="stat-icon" />
                                <div className="stat-info">
                                    <h3>{profile.experience_years || "2"}+</h3>
                                    <p>Years in coding</p>
                                </div>
                            </div>
                            <div className="stat-card coffee-card">
                                <Coffee className="stat-icon" />
                                <div className="stat-info">
                                    <h3>{profile.coffee_consumed || "900"}+</h3>
                                    <p>Coffee Consumed</p>
                                </div>
                            </div>
                        </div>

                        <div className="cta-buttons flex gap-6">
                            <a href="#projects" className="btn btn-work group">
                                View Work
                                <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-1" />
                            </a>
                            <a href={profile.resume_url || "#"} className="btn btn-cv-dark" download>
                                <Download className="w-4 h-4" />
                                Download CV
                            </a>
                            <a href="#contact" className="btn btn-contact-minimal">
                                <Mail className="w-4 h-4" />
                                Contact Me
                            </a>
                        </div>
                    </div>

                    <HeroCard photo={profile.hero_photo_url} name={profile.name} />
                </div>
            )}
        </section>
    );
}

/** Right-hand brand card: FVL mark with slowly orbiting rings + availability badge. */
function HeroCard({ photo, name }: { photo?: string | null; name?: string }) {
    return (
        <div className={`hero-card ${photo ? "has-photo" : ""}`}>
            {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="hero-card-photo" src={photo} alt={name || "Portrait"} />
            ) : (
            <div className="hero-card-inner">
                <svg className="hero-card-orbits" viewBox="0 0 400 400" aria-hidden="true">
                    <circle className="orbit orbit-1" cx="200" cy="200" r="150" />
                    <circle className="orbit orbit-2" cx="200" cy="200" r="182" />
                    <g className="orbit-dot-track orbit-dot-track-1">
                        <circle cx="200" cy="50" r="5" className="orbit-dot" />
                    </g>
                    <g className="orbit-dot-track orbit-dot-track-2">
                        <circle cx="200" cy="18" r="3.5" className="orbit-dot orbit-dot-soft" />
                    </g>
                </svg>

                <svg className="hero-card-mark" viewBox="-92 -182 540 540" role="img" aria-label="FVL logo">
                    <defs>
                        <linearGradient id="heroV" x1="0.15" y1="1" x2="0.95" y2="0">
                            <stop offset="0" stopColor="#0d2a42" />
                            <stop offset="0.45" stopColor="#1B4F72" />
                            <stop offset="1" stopColor="#46C1E6" />
                        </linearGradient>
                    </defs>
                    <circle className="hero-card-ring" cx="178" cy="88" r="248" />
                    <path className="hero-card-ink" d="M12 158V40Q12 16 36 16H107V44H40V80H96V104H40V158Z" />
                    <path fill="url(#heroV)" d="M116 16H144L183 114L220 16H248L184 160Z" />
                    <path className="hero-card-ink" d="M260 16H288V132H341V158H284Q260 158 260 134Z" />
                </svg>
            </div>
            )}

            <div className="hero-card-badge">
                <span className="hero-card-pulse" />
                Open to internships
            </div>
        </div>
    );
}

