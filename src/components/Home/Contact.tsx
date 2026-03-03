"use client";

import { useEffect, useState } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import * as LucideIcons from "lucide-react";
import CopyButton from "./CopyButton";

export default function Contact() {
    const [profile, setProfile] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState("");
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        fetch("/api/profile")
            .then(res => res.json())
            .then(data => setProfile(data));

        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZoneName: 'short',
                timeZone: 'Asia/Kuala_Lumpur'
            });
            setCurrentTime(timeString);

            // Availability logic (9 AM - 8 PM MYT)
            const klTime = new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                hour12: false,
                timeZone: 'Asia/Kuala_Lumpur'
            }).format(now);
            const hour = parseInt(klTime);
            setIsAvailable(hour >= 9 && hour < 20);
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const geoBars = (
        <div className="bg-animation-container">
            <div className="geo-bar geo-1"></div>
            <div className="geo-bar geo-2"></div>
            <div className="geo-bar geo-4"></div>
            <div className="geo-bar geo-6"></div>
            <div className="geo-bar geo-8"></div>
        </div>
    );

    return (
        <section id="contact" className="section-high-fidelity">
            {!profile ? (
                <div className="container" style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="animate-pulse text-[var(--color-text-muted)] text-xl font-bold">Connecting...</div>
                </div>
            ) : (
                <>
                    {geoBars}
                    <div className="container" style={{ maxWidth: "1200px" }}>
                        <div className="section-header">
                            <h2>Let's Work Together</h2>
                            <p className="section-subtitle">Ready to bring your ideas to life? Let's discuss your next project and create something amazing together.</p>
                        </div>

                        <div className="contact-grid">
                            {/* Main Contact Card */}
                            <div className="contact-main-card">
                                <div className="card-header">
                                    <div className="card-title-group">
                                        <h3>Contact Information</h3>
                                        <p>Let's connect and build something amazing together</p>
                                    </div>
                                    <div className="card-status">
                                        <span className="time">{currentTime || "Loading..."}</span>
                                        <span className={`status-badge ${!isAvailable ? 'after-hours' : ''}`}>
                                            {isAvailable ? "Available Now" : "After Hours"}
                                        </span>
                                    </div>
                                </div>

                                <div className="info-grid">
                                    {/* Phone */}
                                    <div className="info-item">
                                        <CopyButton text={profile.phone || "+6019-7952427"} />
                                        <div className="icon-box phone-bg">
                                            <Phone size={24} />
                                        </div>
                                        <div className="info-content">
                                            <h4>Phone Number</h4>
                                            <a href={`tel:${profile.phone || "+60197952427"}`} className="copy-target">{profile.phone || "+6019-7952427"}</a>
                                            <p>Available 9 AM - 8 PM MYT</p>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="info-item">
                                        <CopyButton text={profile.email || "naufalnizam25@gmail.com"} />
                                        <div className="icon-box email-bg">
                                            <Mail size={24} />
                                        </div>
                                        <div className="info-content">
                                            <h4>Email Address</h4>
                                            <a href={`mailto:${profile.email || "naufalnizam25@gmail.com"}`} className="copy-target text-xs sm:text-base">{profile.email || "naufalnizam25@gmail.com"}</a>
                                            <p>Professional inquiries welcome</p>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="info-item">
                                        <CopyButton text={profile.location || "Ayer Keroh, Melaka, Malaysia"} />
                                        <div className="icon-box location-bg">
                                            <MapPin size={24} />
                                        </div>
                                        <div className="info-content">
                                            <h4>Location</h4>
                                            <p className="copy-target">{profile.location || "Ayer Keroh, Melaka, Malaysia"}</p>
                                            <p>GMT+8 Timezone</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Side Cards */}
                            <div className="contact-side-grid">
                                {/* Social Media */}
                                <div className="contact-card social-card" style={{ paddingBottom: "25px" }}>
                                    <h3>Social Media</h3>
                                    <p>Follow me on social platforms</p>
                                    <div className="social-list-alt">
                                        <a href={profile.linkedin_url || "https://www.linkedin.com/in/muhammad-naufal-bin-mohd-nizam-0603b2279"} target="_blank" className="social-item-alt">
                                            <div className="social-icon-box">
                                                <LucideIcons.Linkedin size={20} />
                                            </div>
                                            <div className="social-text-group">
                                                <span className="name">LinkedIn</span>
                                                <span className="sub">Professional network</span>
                                            </div>
                                        </a>
                                        <a href={profile.github_url || "https://github.com/sunquickpapi"} target="_blank" className="social-item-alt">
                                            <div className="social-icon-box">
                                                <LucideIcons.Github size={20} />
                                            </div>
                                            <div className="social-text-group">
                                                <span className="name">GitHub</span>
                                                <span className="sub">Code repositories</span>
                                            </div>
                                        </a>
                                        {profile.instagram_url && (
                                            <a href={profile.instagram_url} target="_blank" className="social-item-alt">
                                                <div className="social-icon-box">
                                                    <LucideIcons.Instagram size={20} />
                                                </div>
                                                <div className="social-text-group">
                                                    <span className="name">Instagram</span>
                                                    <span className="sub">Follow my journey</span>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="contact-card actions-card" style={{ paddingBottom: "25px" }}>
                                    <h3>Quick Actions</h3>
                                    <p>Get in touch quickly</p>
                                    <div className="social-list-alt">
                                        <a href={`mailto:${profile.email || "naufalnizam25@gmail.com"}`} className="social-item-alt">
                                            <div className="social-icon-box inquiry-icon">
                                                <Send size={20} />
                                            </div>
                                            <div className="social-text-group">
                                                <span className="name font-bold">Send Inquiry</span>
                                                <span className="sub">Start a conversation</span>
                                            </div>
                                        </a>
                                        <a href={`tel:${profile.phone || "+60197952427"}`} className="social-item-alt">
                                            <div className="social-icon-box">
                                                <Phone size={20} />
                                            </div>
                                            <div className="social-text-group">
                                                <span className="name font-bold">Quick Chat</span>
                                                <span className="sub">Call me directly</span>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="availability-card">
                            <div className="pulse-dot"></div>
                            <div className="availability-text">
                                <h5>Currently available for new projects</h5>
                                <p>Accepting freelance work and collaboration opportunities</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
