"use client";

import { useEffect, useState } from "react";
import { MapPin, Briefcase, Trophy } from "lucide-react";
import Link from "next/link";

export default function About() {
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        fetch("/api/profile")
            .then((res) => res.json())
            .then((data) => setProfile(data));
    }, []);

    return (
        <section id="about">
            {!profile ? (
                <div className="container" style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="animate-pulse text-[var(--color-text-muted)] text-xl font-bold">Loading Your Story...</div>
                </div>
            ) : (
                <>
                    <div className="bg-animation-container">
                        <div className="geo-bar geo-1"></div>
                        <div className="geo-bar geo-2"></div>
                        <div className="geo-bar geo-4"></div>
                        <div className="geo-bar geo-6"></div>
                        <div className="geo-bar geo-8"></div>
                    </div>

                    <div className="container" style={{ maxWidth: "1100px" }}>
                        <div className="section-header">
                            <h2>About Me</h2>
                        </div>
                        <div className="about-layout">
                            <div className="quick-facts-card">
                                <h3>Quick Facts</h3>
                                <div className="fact-list">
                                    <div className="fact-item">
                                        <div className="fact-icon-wrapper">
                                            <MapPin size={18} />
                                        </div>
                                        <span>Based in {profile.location || "Malaysia"}</span>
                                    </div>
                                    <div className="fact-item">
                                        <div className="fact-icon-wrapper">
                                            <Briefcase size={18} />
                                        </div>
                                        <span>{profile.experience_years || "2"}+ Years of Experience</span>
                                    </div>
                                    <div className="fact-item">
                                        <div className="fact-icon-wrapper">
                                            <Trophy size={18} />
                                        </div>
                                        <span>{profile.projects_count || "15"}+ Projects Completed</span>
                                    </div>
                                </div>
                            </div>
                            <div className="about-content-right">
                                <div className="about-text">
                                    <p>{profile.bio || "I specialize in designing and developing intelligent systems that leverage AI and machine learning to solve real-world challenges."}</p>
                                    <Link href="/about" className="learn-more-link">Learn more about me →</Link>
                                </div>
                            </div>
                        </div>

                        <div className="approach-box full-width">
                            <h3>My Approach</h3>
                            <p>
                                Currently pursuing my degree, I balance my academic pursuits with hands-on project work, constantly
                                learning and adapting to new technologies in the ever-evolving tech landscape.
                            </p>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
