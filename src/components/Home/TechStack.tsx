"use client";

import { useEffect, useState } from "react";

interface Skill {
    id: string;
    name: string;
    category: string;
    icon_url?: string;
}

export default function TechStack() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/skills")
            .then((res) => res.json())
            .then((data) => {
                setSkills(data);
                setLoading(false);
            });
    }, []);

    const categories = Array.from(new Set(skills.map((s) => s.category)));

    return (
        <section id="tech-stack">
            {loading || skills.length === 0 ? (
                <div className="container" style={{ minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="animate-pulse text-[var(--color-text-muted)] text-xl font-bold">Loading Tech Stack...</div>
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

                    <div className="container" style={{ maxWidth: "1200px" }}>
                        <div className="section-header">
                            <h2>Technology Stack</h2>
                            <p className="section-subtitle">Cutting-edge tools and technologies I use to build exceptional digital experiences</p>
                        </div>

                        <div className="tech-main-layout flex flex-col md:flex-row gap-12">
                            {categories.map((cat) => (
                                <div key={cat} className="tech-column flex-1">
                                    <div className="tech-category-wrapper">
                                        <h3 className="tech-category-title">{cat}</h3>
                                        <div className="tech-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {skills
                                                .filter((s) => s.category === cat)
                                                .map((skill) => (
                                                    <div key={skill.id} className="tech-card">
                                                        <img
                                                            src={skill.icon_url || `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${skill.name.toLowerCase()}/${skill.name.toLowerCase()}-original.svg`}
                                                            alt={skill.name}
                                                            onError={(e: any) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "https://img.icons8.com/ios-filled/100/3182ce/rocket.png";
                                                            }}
                                                        />
                                                        <span>{skill.name}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
