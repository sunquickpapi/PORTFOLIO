"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    Download,
    Trophy,
    Zap,
    Globe,
    Coffee,
    Dumbbell,
    ExternalLink,
    Heart,
    Award,
    ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import Contact from "@/components/Home/Contact";
import Footer from "@/components/Home/Footer";
import * as LucideIcons from "lucide-react";

// Helper to render lucide icons by name
const DynamicIcon = ({ name, size = 20, className = "" }: { name: string, size?: number, className?: string }) => {
    const IconComponent = (LucideIcons as any)[name];
    if (!IconComponent) return <Heart size={size} className={className} />;
    return <IconComponent size={size} className={className} />;
};

export default function AboutPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [education, setEducation] = useState<any[]>([]);
    const [experience, setExperience] = useState<any[]>([]);
    const [certifications, setCertifications] = useState<any[]>([]);
    const [hobbies, setHobbies] = useState<any[]>([]);
    const [hoveredCertImage, setHoveredCertImage] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        // Fetch all dynamic data
        Promise.all([
            fetch("/api/profile").then(res => res.json()),
            fetch("/api/education").then(res => res.json()),
            fetch("/api/experience").then(res => res.json()),
            fetch("/api/certifications").then(res => res.json()),
            fetch("/api/hobbies").then(res => res.json()),
        ]).then(([profileData, eduData, expData, certsData, hobbiesData]) => {
            setProfile(profileData);
            setEducation(eduData || []);
            setExperience(expData || []);
            setCertifications(certsData || []);
            setHobbies(hobbiesData || []);
        });
    }, []);

    const handleBackToHome = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push('/#about');
    };

    if (!profile) return <div className="min-h-screen bg-[var(--portfolio-bg)] flex items-center justify-center text-[var(--color-text-primary)] font-bold animate-pulse text-2xl">Loading Your Story...</div>;

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
        <main className="about-main-wrapper bg-[var(--portfolio-bg)] text-[var(--color-text-primary)] selection:bg-blue-500/30">
            {/* Bio Hero */}
            <section id="home" className="hero hero-about" style={{
                backgroundImage: profile.hero_bg_url ? `var(--hero-gradient), url('${profile.hero_bg_url}')` : 'var(--hero-gradient), url("/assets/main header.jpg")'
            }}>
                {/* Unique Portal Back Button - Absolute Inline Layout */}
                <Link
                    href="/#about"
                    className="unq-portal-link unq-portal-fixed"
                    onClick={handleBackToHome}
                >
                    <div className="unq-portal-icon-wrapper">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="unq-portal-text">
                        BACK TO HOME
                    </span>
                </Link>

                <div className="container">
                    <div className="hero-content text-left">
                        <h1>More About <span className="name-gradient">Me</span></h1>
                        <p className="subtitle">{profile.role || "Intelligent System Engineer"}</p>
                        <p className="value-prop">
                            {profile.tagline || "Passionate developer, lifelong learner, and creative problem solver. Here's my journey, skills, and what drives me every day."}
                        </p>

                        <div className="hero-stats">
                            <div className="stat-card">
                                <Trophy className="stat-icon" />
                                <div className="stat-info">
                                    <h3 className="text-xl font-bold">{profile.projects_count || "15"}+</h3>
                                    <p>Projects Built</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <Zap className="stat-icon" />
                                <div className="stat-info">
                                    <h3 className="text-xl font-bold">{profile.tech_learned_count || "17"}+</h3>
                                    <p>Tech Learned</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <Globe className="stat-icon" />
                                <div className="stat-info">
                                    <h3 className="text-xl font-bold">{profile.experience_years || "4"}+</h3>
                                    <p>Years in coding</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <Coffee className="stat-icon" />
                                <div className="stat-info">
                                    <h3 className="text-xl font-bold">{profile.coffee_consumed || "900"}+</h3>
                                    <p>Coffee Consumed</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <Dumbbell className="stat-icon" />
                                <div className="stat-info">
                                    <h3 className="text-xl font-bold">{profile.dumbells_lifted_count || "900"}+</h3>
                                    <p>Dumbells Lifted</p>
                                </div>
                            </div>
                        </div>

                        <div className="cta-buttons" style={{ marginTop: "2rem" }}>
                            <a href={profile.resume_url || "/assets/MY RESUME.pdf"} className="btn btn-cv-dark" target="_blank">
                                <Download size={20} className="icon-svg" /> Download CV
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Moving Banner Section */}
            <section className="banner-moving-section">
                <div className="banner-bg-move"></div>
                <div className="banner-container">
                    <div className="banner-row banner-row-top">
                        <div className="banner-track">
                            {[4, 5, 6, 7, 8, 4, 5, 6, 7, 8].map((i, idx) => (
                                <img key={`top-${idx}`} src={`/assets/ban${i}.jpg`} alt="" />
                            ))}
                        </div>
                    </div>
                    <div className="banner-row banner-row-bottom">
                        <div className="banner-track">
                            {[9, 10, 1, 2, 3, 9, 10, 1, 2, 3].map((i, idx) => (
                                <img key={`bottom-${idx}`} src={`/assets/ban${i}.jpg`} alt="" />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <div className="milestones-unified-wrapper">
                {/* Skills & Expertise */}
                <section id="skills" className="section-high-fidelity">
                    {geoBars}
                    <div className="container" style={{ maxWidth: "1200px" }}>
                        <div className="section-header">
                            <h2>Skills & Expertise</h2>
                            <p className="section-subtitle">Technologies and tools I work with, constantly learning and improving</p>
                        </div>

                        <div className="hobbies-card-wrapper">
                            <div className="hobbies-card">
                                <div className="hobbies-header">
                                    <Heart className="hobbies-icon" />
                                    <h3>Interests & Hobbies</h3>
                                </div>
                                <div className="hobby-tags">
                                    {hobbies.map((hobby: any) => (
                                        <span key={hobby.id} className="hobby-tag">{hobby.name}</span>
                                    ))}
                                    {hobbies.length === 0 && ["Coding", "Gym & Fitness", "Learning", "Coffee", "Photography", "Gaming", "Music", "Travel"].map(h => (
                                        <span key={h} className="hobby-tag">{h}</span>
                                    ))}
                                </div>
                                <div className="hobby-details">
                                    {hobbies.map((hobby: any) => (
                                        <div key={`detail-${hobby.id}`} className="hobby-detail-item">
                                            <div className="detail-icon-box">
                                                <DynamicIcon name={hobby.icon_name} />
                                            </div>
                                            <div className="detail-text">
                                                <p>{hobby.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {hobbies.length === 0 && (
                                        <>
                                            <div className="hobby-detail-item">
                                                <div className="detail-icon-box"><LucideIcons.Camera /></div>
                                                <div className="detail-text"><p>Photography enthusiast capturing moments and memories</p></div>
                                            </div>
                                            <div className="hobby-detail-item">
                                                <div className="detail-icon-box"><LucideIcons.Gamepad /></div>
                                                <div className="detail-text"><p>Gaming for creativity and strategic thinking</p></div>
                                            </div>
                                            <div className="hobby-detail-item">
                                                <div className="detail-icon-box"><LucideIcons.Music /></div>
                                                <div className="detail-text"><p>Music lover exploring various genres and artists</p></div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* My Journey Section */}
                <section className="bio-section section-high-fidelity">
                    {geoBars}
                    <div className="container" style={{ maxWidth: "1200px", position: "relative", zIndex: 10 }}>
                        <div className="journey-layout">
                            <div className="journey-info">
                                <h2 className="milestone-main-title" style={{ textAlign: "left" }}>My Journey</h2>
                                <div className="about-text">
                                    <p style={{ marginBottom: "1.5rem" }}>
                                        I'm a passionate <strong>{profile.role || "Intelligent System student"}</strong> and web developer with over {profile.experience_years || "4"} years of experience creating digital experiences.
                                    </p>
                                    <p style={{ marginBottom: "1.5rem" }}>
                                        Currently pursuing my degree, I balance my academic pursuits with hands-on project work, constantly learning and adapting to new technologies. I specialize in building intelligent, scalable systems that bridge the gap between AI and intuitive user experience.
                                    </p>
                                </div>
                            </div>
                            <div className="journey-gallery">
                                <h3 className="gallery-title">Life in Pictures</h3>
                                <div className="pictures-grid">
                                    {[14, 11, 12, 13].map((i) => (
                                        <div key={`gallery-${i}`} className="picture-item">
                                            <img src={`/assets/ban${i}.jpg`} alt="" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Education Section */}
                <section id="education" className="bio-section section-high-fidelity">
                    {geoBars}
                    <div className="container" style={{ maxWidth: "1200px", position: "relative", zIndex: 10 }}>
                        <div className="section-header education-header text-center">
                            <h2 className="milestone-main-title text-[var(--color-text-primary)]">Education & Certifications</h2>
                            <p className="section-subtitle text-[var(--color-text-secondary)]">My academic journey and professional certifications that shape my expertise</p>
                        </div>

                        {education.map((edu: any) => {
                            const activitySections = edu.activities?.reduce((acc: any, curr: any) => {
                                if (!acc[curr.section_name]) acc[curr.section_name] = [];
                                acc[curr.section_name].push(curr);
                                return acc;
                            }, {}) || {};

                            return (
                                <div key={edu.id} className="education-high-card" style={{ marginTop: "4rem" }}>
                                    <div className="edu-main-info flex items-start gap-8">
                                        <img src={edu.logo_url || "/assets/uitm logo.png"} alt="" className="edu-uni-logo-large" />
                                        <div className="edu-titles">
                                            <h3 className="edu-uni-name text-2xl font-bold text-[var(--color-text-primary)]">{edu.institution}</h3>
                                            <p className="edu-degree-subtitle text-lg text-[var(--color-text-secondary)]">{edu.degree}</p>
                                            <p className="edu-duration-tag text-sm text-[var(--color-text-muted)] uppercase tracking-widest">{edu.years}</p>
                                        </div>
                                    </div>

                                    {edu.coursework && (
                                        <div className="related-coursework-section mt-12">
                                            <h4 className="coursework-title">Related Coursework:</h4>
                                            <div className="course-tags-container">
                                                {edu.coursework.split(',').map((course: string) => (
                                                    <span key={course} className="course-tag">{course.trim()}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {Object.keys(activitySections).length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16 mt-16">
                                            {Object.entries(activitySections).map(([sectionName, items]: [string, any]) => (
                                                <div key={sectionName} className="activity-section">
                                                    <h3 className="text-2xl font-black mb-8 pb-4 border-b border-white/10 tracking-tight">{sectionName}</h3>
                                                    <div className="space-y-12">
                                                        {items.map((item: any) => (
                                                            <div key={item.id} className="activity-item group">
                                                                <div className="flex justify-between items-start gap-4 mb-3">
                                                                    <h4 className="activity-title text-[20px] font-bold leading-tight">{item.title}</h4>
                                                                    {item.tags && (
                                                                        <span className="activity-tag px-6 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap">
                                                                            {item.tags}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="activity-date text-[14px] font-medium mb-3 mt-1">{item.date}</p>
                                                                <p className="activity-description leading-relaxed text-[15px] font-normal opacity-90 mt-4">
                                                                    {item.description}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {edu.involvement && (
                                        <div className="edu-achievements-grid mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="edu-column">
                                                <h4 className="column-title font-bold mb-4 text-[var(--color-text-primary)]">Activities & Involvement</h4>
                                                <div className="achievement-item bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl">
                                                    <p className="achievement-desc text-sm leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-line">{edu.involvement}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Certifications Section */}
                    <div className="container" style={{ maxWidth: "1200px", position: "relative", zIndex: 10 }}>
                        <div className="prof-certifications-section" style={{ marginTop: "8rem" }}>
                            <div className="section-header text-center">
                                <h2 className="cert-section-title">Professional Certifications</h2>
                            </div>
                            <div className="certifications-grid">
                                {certifications.map((cert: any) => (
                                    <div
                                        key={cert.id}
                                        className="cert-card group"
                                        onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
                                        onMouseEnter={() => cert.image_url && setHoveredCertImage(cert.image_url)}
                                        onMouseLeave={() => setHoveredCertImage(null)}
                                    >
                                        <div className="cert-content">
                                            <div className="cert-meta">
                                                <h4 className="cert-title font-bold text-lg mb-2 text-[var(--color-text-primary)]">{cert.title}</h4>
                                                <span className="cert-date text-xs text-[var(--color-text-secondary)] uppercase tracking-widest">{cert.date}</span>
                                            </div>
                                            <div className="cert-footer mt-6 flex justify-between items-center">
                                                <p className="cert-issuer text-sm font-bold uppercase text-[var(--color-accent-blue)]">{cert.issuer}</p>
                                                <a href={cert.credential_url} target="_blank" className="cert-btn flex items-center gap-2 text-xs font-bold px-4 py-2 bg-[var(--card-bg)] text-[var(--color-text-primary)] border border-[var(--card-border)] rounded-xl hover:bg-[var(--color-text-primary)] hover:text-[var(--portfolio-bg)] transition-all">
                                                    <ExternalLink size={14} /> Credentials
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Floating Preview */}
                            {hoveredCertImage && (
                                <div
                                    className="cert-floating-preview"
                                    style={{
                                        left: mousePosition.x + 20,
                                        top: mousePosition.y + 20,
                                    }}
                                >
                                    <img src={hoveredCertImage} alt="Certificate Preview" />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Experience Section */}
                <section id="experience" className="bio-section section-high-fidelity">
                    {geoBars}
                    <div className="container" style={{ maxWidth: "1200px", position: "relative", zIndex: 10 }}>
                        <div className="section-header education-header text-center">
                            <h2 className="milestone-main-title">Experience</h2>
                            <p className="section-subtitle">A timeline of my professional growth and technical contributions</p>
                        </div>

                        {experience.map((exp: any) => (
                            <div key={exp.id} className="education-high-card" style={{ marginTop: "4rem" }}>
                                <div className="edu-main-info flex flex-col md:flex-row justify-between items-start w-full gap-6">
                                    <div className="flex items-start gap-8">
                                        {exp.logo_url ? (
                                            <img src={exp.logo_url} alt={`${exp.company} Logo`} className="edu-uni-logo-large" />
                                        ) : (
                                            <div className="edu-uni-logo-large bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center rounded-2xl">
                                                <Globe size={32} className="opacity-20 text-[var(--color-text-primary)]" />
                                            </div>
                                        )}
                                        <div className="edu-titles">
                                            <h3 className="edu-uni-name text-2xl font-bold text-[var(--color-text-primary)]">{exp.company}</h3>
                                            <p className="edu-degree-subtitle text-lg text-[var(--color-text-secondary)]">{exp.role}</p>
                                            <p className="edu-duration-tag text-sm text-[var(--color-text-muted)] uppercase tracking-widest">{exp.duration}</p>
                                        </div>
                                    </div>
                                    {exp.company_url && (
                                        <a href={exp.company_url} target="_blank" className="company-web-btn flex items-center gap-2 text-xs font-bold px-5 py-2.5 bg-[var(--card-bg)] text-[var(--color-text-primary)] border border-[var(--card-border)] rounded-full hover:bg-[var(--color-text-primary)] hover:text-[var(--portfolio-bg)] transition-all uppercase tracking-tighter">
                                            <Globe size={14} /> Company Website
                                        </a>
                                    )}
                                </div>

                                <div className="experience-details-container mt-8 w-full">
                                    {exp.description && (
                                        <p className="exp-description text-[var(--color-text-secondary)] opacity-80 line-height-1.6 mb-6 italic w-full max-w-none">
                                            {exp.description}
                                        </p>
                                    )}
                                    {exp.points && (
                                        <div className="experience-points-wrapper mt-6 w-full">
                                            <ul className="experience-points-list space-y-5 w-full list-none p-0 m-0">
                                                {exp.points.split(',').map((point: string, idx: number) => (
                                                    point.trim() && (
                                                        <li key={idx} className="flex items-start gap-4 text-[var(--color-text-primary)] text-sm md:text-base leading-relaxed w-full max-w-none">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                                                            {point.trim()}
                                                        </li>
                                                    )
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section bg-[var(--portfolio-bg)]">
                    {geoBars}
                    <div className="container" style={{ maxWidth: "1200px" }}>
                        <div className="cta-card text-center py-20 px-8 rounded-[4rem] bg-[var(--card-bg)] border border-[var(--card-border)]">
                            <h2 className="cta-title text-4xl md:text-6xl font-black mb-8 tracking-tighter leading-tight text-[var(--color-text-primary)]">Let's Build Something <br /> Amazing Together</h2>
                            <p className="cta-subtitle text-[var(--color-text-secondary)] text-lg md:text-xl max-w-2xl mx-auto mb-12">
                                Ready to turn your ideas into reality? Let's discuss your next project and create something extraordinary.
                            </p>
                            <div className="cta-buttons flex flex-col md:flex-row justify-center gap-6">
                                <Link href="/projects" className="cta-btn primary px-10 py-4 bg-[var(--color-text-primary)] text-[var(--portfolio-bg)] font-black rounded-2xl hover:opacity-90 transition-all flex items-center justify-center">View My Projects</Link>
                                <Link href="#contact" className="cta-btn outline px-10 py-4 bg-transparent border border-[var(--card-border)] text-[var(--color-text-primary)] font-black rounded-2xl hover:bg-[var(--color-text-primary)] hover:text-[var(--portfolio-bg)] transition-all flex items-center justify-center">Get In Touch</Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <Contact />

                {/* Footer Section */}
                <Footer />

                {/* Mobile Floating Action Buttons */}
                <div className="md:hidden">
                    {/* Back to Top - Bottom Left */}
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className={`floating-btn back-to-top ${showScrollTop ? 'visible' : ''}`}
                        aria-label="Back to top"
                    >
                        <LucideIcons.ChevronUp size={24} strokeWidth={2.5} />
                    </button>

                    {/* Socials - Bottom Right */}
                    <div className="social-floating-group">
                        <a
                            href={profile?.github_url || "https://github.com"}
                            target="_blank"
                            rel="noreferrer"
                            className="floating-btn"
                            aria-label="GitHub"
                        >
                            <LucideIcons.Github size={20} />
                        </a>
                        <a
                            href={profile?.linkedin_url || "https://www.linkedin.com/in/muhammad-naufal-bin-mohd-nizam-0603b2279"}
                            target="_blank"
                            rel="noreferrer"
                            className="floating-btn"
                            aria-label="LinkedIn"
                        >
                            <LucideIcons.Linkedin size={20} />
                        </a>
                    </div>
                </div>
            </div>


            <style jsx global>{`
                .about-main-wrapper {
                    overflow-x: hidden;
                    font-family: 'Inter', sans-serif;
                }
                .hero-about {
                    background-attachment: fixed;
                    background-size: cover;
                    background-position: center;
                }
                /* Use specific styles from styles.css were missing */
                .education-high-card {
                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    padding: 4rem;
                    border-radius: 3rem;
                    transition: all 0.4s ease;
                }
                .education-high-card:hover {
                    border-color: rgba(255, 255, 255, 0.1);
                    transform: translateY(-5px);
                }
                .activity-section h3 {
                    color: var(--color-text-primary) !important;
                    text-transform: none;
                    opacity: 1 !important;
                }
                .activity-title {
                    color: var(--color-text-primary) !important;
                    transition: color 0.3s ease;
                }
                .activity-item:hover .activity-title {
                    color: var(--color-accent-blue) !important;
                }
                .activity-date {
                    color: var(--color-text-secondary) !important;
                }
                .activity-description {
                    color: var(--color-text-secondary) !important;
                }
                .activity-tag {
                    background: var(--card-bg) !important;
                    color: var(--color-text-primary) !important;
                    border: 1px solid var(--card-border) !important;
                    font-size: 0.72rem !important;
                    font-weight: 700 !important;
                    border-radius: 9999px !important;
                    letter-spacing: 0.02em !important;
                    box-shadow: var(--shadow-sm) !important;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.4rem 1.5rem !important;
                }
                .activity-item:hover .activity-tag {
                    border-color: var(--color-text-primary) !important;
                    background: var(--card-bg) !important;
                    color: var(--color-text-primary) !important;
                    box-shadow: var(--shadow-md) !important;
                    padding: 0.4rem 1.5rem !important;
                }
            `}</style>
        </main >
    );
}
