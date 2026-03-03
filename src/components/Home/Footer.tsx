"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, ChevronUp, FileText, Github, Linkedin, ExternalLink, Instagram } from "lucide-react";

export default function Footer() {
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        fetch("/api/profile")
            .then(res => res.json())
            .then(data => setProfile(data));
    }, []);

    if (!profile) return null;

    return (
        <footer className="footer-main">
            <div className="container" style={{ maxWidth: "1200px" }}>
                <div className="footer-grid">
                    {/* Brand Column */}
                    <div className="footer-col brand-col">
                        <div className="footer-brand">
                            <img src="/assets/circleLogo.png" alt="Naufal N Logo" className="footer-logo-img" />
                            <div className="brand-text">
                                <span className="brand-name">Naufal N</span>
                                <span className="brand-tagline">Portfolio 2.0</span>
                            </div>
                        </div>
                        <p className="footer-bio">{profile.role_description || "Intelligent System Engineer passionate about creating innovative solutions through data and code."}</p>
                        <div className="footer-stats-mini">
                            <div className="stat-mini-box">
                                <span className="stat-val">{profile.experience_years || "4"}+</span>
                                <span className="stat-lbl">Years Coding</span>
                            </div>
                            <div className="stat-mini-box">
                                <span className="stat-val">{profile.projects_count || "6"}+</span>
                                <span className="stat-lbl">Projects Built</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Column */}
                    <div className="footer-col">
                        <h4>Navigation</h4>
                        <ul className="footer-links">
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/about">About Me</Link></li>
                            <li><Link href="/projects">Projects</Link></li>
                            <li><Link href="/blog">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div className="footer-col">
                        <h4>Resources</h4>
                        <ul className="footer-links">
                            <li>
                                <a href={profile.resume_url || "/assets/MY RESUME.pdf"} target="_blank">
                                    <FileText size={14} /> My Resume
                                </a>
                            </li>
                            <li>
                                <a href={`mailto:${profile.email || "naufalnizam25@gmail.com"}`}>
                                    <Mail size={14} /> Contact Me
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Connect Column */}
                    <div className="footer-col">
                        <h4>Connect</h4>
                        <ul className="footer-links social-links-footer">
                            <li>
                                <a href={profile.linkedin_url || "https://www.linkedin.com/in/muhammad-naufal-bin-mohd-nizam-0603b2279"} target="_blank">
                                    <Linkedin size={14} /> LinkedIn
                                </a>
                            </li>
                            <li>
                                <a href={profile.github_url || "https://github.com/sunquickpapi"} target="_blank">
                                    <Github size={14} /> GitHub
                                </a>
                            </li>
                            {profile.instagram_url && (
                                <li>
                                    <a href={profile.instagram_url} target="_blank">
                                        <Instagram size={14} /> Instagram
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="footer-divider-extended"></div>

                <div className="footer-bottom-v2">
                    <div className="copyright">
                        <p>© 2026 Naufal N. All rights reserved.</p>
                    </div>
                    <div className="footer-tech-meta">
                        <div className="visitor-count">
                            <span className="dot-online"></span>
                            <span className="count-text" style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--color-text-muted)" }}>1 visitor online</span>
                        </div>
                        <div className="tech-stack-badges">
                            {["HTML5", "CSS3", "JavaScript"].map(tech => (
                                <span key={tech} className="tech-badge">{tech}</span>
                            ))}
                        </div>
                        <Link href="/admin" className="tech-badge hover:text-white transition-colors">Admin Access</Link>
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="back-to-top">
                            <ChevronUp size={14} /> Back to Top
                        </button>
                    </div >
                </div >
            </div >
        </footer >
    );
}
