"use client";

import { useEffect, useState } from "react";
import { Download, Mail, ChevronDown, Trophy, Coffee, Zap } from "lucide-react";

export default function Hero() {
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        fetch("/api/profile")
            .then((res) => res.json())
            .then((data) => setProfile(data));
    }, []);

    return (
        <section
            id="home"
            className="hero"
            style={{
                backgroundImage: profile?.hero_bg_url
                    ? `var(--hero-gradient), url('${profile.hero_bg_url}')`
                    : undefined
            }}
        >
            {!profile ? (
                <div className="container" style={{ minHeight: "600px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="animate-pulse text-[var(--color-text-muted)] text-2xl font-bold tracking-tighter">Initializing Portfolio...</div>
                </div>
            ) : (
                <div className="container">
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
                </div>
            )}
        </section>
    );
}
