"use client";

import { useEffect, useState } from "react";
import PassCard from "./PassCard";

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
                <div className="container hero-grid has-pass">
                    <div className="hero-content text-left">
                        <h1>
                            Hello Everyone,<br />
                            I&apos;m <span className="name-gradient">{profile.name?.split(' ')[profile.name.split(' ').length - 1] || 'Naufal'}</span>
                        </h1>
                        <p className="subtitle">{profile.role || "Intelligent System Engineer"}</p>
                        <p className="value-prop">
                            {profile.tagline || profile.bio || "A passionate Intelligent System Engineer crafting smart solutions."}
                        </p>
                    </div>

                    <div className="hero-pass">
                        <PassCard
                            socials={{ linkedin: profile.linkedin_url, github: profile.github_url, instagram: profile.instagram_url }}
                            stats={{ projects: profile.projects_count, years: profile.experience_years, coffee: profile.coffee_consumed }}
                        />
                    </div>
                </div>
            )}
        </section>
    );
}
