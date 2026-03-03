"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Filter, Code, Camera, Image as ImageIcon, ExternalLink, Github, Phone, Mail, MapPin, Send, MessageSquare, Heart, Award, FileText, ChevronUp, Linkedin, Instagram } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Project } from "@/types/project";
import ProjectModal from "@/components/Home/ProjectModal";
import PreviewModal from "@/components/Home/PreviewModal";
import Footer from "@/components/Home/Footer";
import CopyButton from "@/components/Home/CopyButton";

export default function ProjectsDetails() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"dev" | "shoot">("dev");
    const [devSearch, setDevSearch] = useState("");
    const [devFilter, setDevFilter] = useState("all");
    const [shootSearch, setShootSearch] = useState("");
    const [shootFilter, setShootFilter] = useState("all");
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [previewProject, setPreviewProject] = useState<Project | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState("");
    const [isAvailable, setIsAvailable] = useState(false);

    // Project Settings
    const [settings, setSettings] = useState({
        hero_title: "Full Portfolio",
        hero_subtitle: "Complete Project History",
        hero_value_prop: "A comprehensive showcase of my journey in Intelligent Systems Engineering. From mobile innovations to scalable web solutions—exploring the intersection of AI and precision engineering.",
        projects_completed_count: "3+",
        photography_shoots_count: "900+",
        years_coding_count: "4+"
    });

    // Floaty Preview State
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [projRes, setRes, profRes] = await Promise.all([
                    fetch("/api/projects"),
                    fetch("/api/project-settings"),
                    fetch("/api/profile")
                ]);

                const projData = await projRes.json();
                const setData = await setRes.json();
                const profData = await profRes.json();

                setProjects(projData);
                if (setData && setData.hero_title) {
                    setSettings(setData);
                }
                setProfile(profData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();

        // Update time every minute
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

    // Get unique tech stacks for each category
    const devTechStacks = Array.from(new Set(
        projects
            .filter(p => p.category !== "Photography")
            .flatMap(p => p.tech_stack || [])
    )).sort();

    const shootTechStacks = Array.from(new Set(
        projects
            .filter(p => p.category === "Photography")
            .flatMap(p => p.tech_stack || [])
    )).sort();

    // Filter Logic
    const filteredDevProjects = projects.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(devSearch.toLowerCase()) ||
            p.tech_stack?.some(t => t.toLowerCase().includes(devSearch.toLowerCase()));
        const matchesFilter = devFilter === "all" || p.tech_stack?.includes(devFilter);
        return p.category !== "Photography" && matchesSearch && matchesFilter;
    });

    const filteredPhotographyProjects = projects.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(shootSearch.toLowerCase());
        const matchesFilter = shootFilter === "all" || p.tech_stack?.includes(shootFilter);
        return p.category === "Photography" && matchesSearch && matchesFilter;
    });

    // Use global mouse listener for smoother tracking
    useEffect(() => {
        if (!hoveredPhoto) return;

        const handleGlobalMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", handleGlobalMouseMove);
        return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
    }, [hoveredPhoto]);

    const handleBackToHome = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push('/#projects');
    };

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
        <div className="min-h-screen">
            {/* Projects Hero */}
            <section id="home" className="hero hero-projects transition-all duration-700">
                {/* Unique Portal Back Button - Absolute Inline Layout */}
                <Link
                    href="/#projects"
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
                    <div className="hero-content">
                        <h1>{settings.hero_title.split(" ").slice(0, -1).join(" ")} <span className="name-gradient">{settings.hero_title.split(" ").slice(-1)}</span></h1>
                        <p className="subtitle">{settings.hero_subtitle}</p>
                        <p className="value-prop">
                            {settings.hero_value_prop}
                        </p>

                        <div className="hero-stats">
                            <div className="stat-card">
                                <div className="stat-icon-wrapper">
                                    <Code size={24} className="stat-icon" />
                                </div>
                                <div className="stat-info">
                                    <h3>{settings.projects_completed_count}</h3>
                                    <p>Projects Completed</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon-wrapper">
                                    <Camera size={24} className="stat-icon" />
                                </div>
                                <div className="stat-info">
                                    <h3>{settings.photography_shoots_count}</h3>
                                    <p>Photographic Shoot</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon-wrapper">
                                    <ImageIcon size={24} className="stat-icon" />
                                </div>
                                <div className="stat-info">
                                    <h3>{settings.years_coding_count}</h3>
                                    <p>Years in coding</p>
                                </div>
                            </div>
                        </div>

                        <div className="cta-buttons">
                            <a href="#projects" className="btn btn-work group">
                                View Work
                                <svg className="icon-svg ml-2 group-hover:translate-y-1 transition-transform" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none">
                                    <path d="M7 13l5 5 5-5M12 6v12"></path>
                                </svg>
                            </a>
                            <a href="/assets/resume.pdf" className="btn btn-cv-dark" download>
                                <svg className="icon-svg mr-2" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                                    <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"></path>
                                    <polyline points="7 11 12 16 17 11"></polyline>
                                    <line x1="12" y1="4" x2="12" y2="16"></line>
                                </svg>
                                Download CV
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section id="projects" className="bio-section section-high-fidelity">
                {/* Background Animation */}
                <div className="bg-animation-container">
                    <div className="geo-bar geo-1"></div>
                    <div className="geo-bar geo-2"></div>
                    <div className="geo-bar geo-4"></div>
                    <div className="geo-bar geo-6"></div>
                    <div className="geo-bar geo-8"></div>
                </div>

                <div className="container" style={{ maxWidth: "1200px", position: "relative", zIndex: 50, overflow: "visible" }}>
                    {/* Project Control Bar */}
                    <div className="project-control-bar" style={{ position: "relative", zIndex: 1000 }}>
                        <div className="control-left">
                            <div className="project-tabs">
                                <button
                                    className={`tab-btn ${activeTab === "dev" ? "active" : ""}`}
                                    onClick={() => setActiveTab("dev")}
                                >
                                    <Code size={18} className="tab-icon mr-2" />
                                    Development ({filteredDevProjects.length})
                                </button>
                                <button
                                    className={`tab-btn ${activeTab === "shoot" ? "active" : ""}`}
                                    onClick={() => setActiveTab("shoot")}
                                >
                                    <Camera size={18} className="tab-icon mr-2" />
                                    Photographic Shoot ({filteredPhotographyProjects.length})
                                </button>
                            </div>
                        </div>
                        <div className="control-right">
                            <div className="search-wrapper">
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    id="projectSearch"
                                    placeholder="Search projects..."
                                    value={activeTab === "dev" ? devSearch : shootSearch}
                                    onChange={(e) => activeTab === "dev" ? setDevSearch(e.target.value) : setShootSearch(e.target.value)}
                                />
                            </div>
                            <div className="filter-dropdown-wrapper">
                                <button
                                    className="btn-filter"
                                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                                >
                                    <Filter size={18} className="filter-icon mr-2" />
                                    Filter
                                </button>
                                {showFilterMenu && (
                                    <div className="filter-menu active">
                                        <div className="filter-title">Filter by Tech Stack</div>
                                        <button
                                            className={`filter-option ${(activeTab === "dev" ? devFilter : shootFilter) === "all" ? "active" : ""}`}
                                            onClick={() => {
                                                if (activeTab === "dev") setDevFilter("all");
                                                else setShootFilter("all");
                                                setShowFilterMenu(false);
                                            }}
                                        >
                                            All Categories
                                        </button>
                                        {(activeTab === "dev" ? devTechStacks : shootTechStacks).map(tech => (
                                            <button
                                                key={tech}
                                                className={`filter-option ${(activeTab === "dev" ? devFilter : shootFilter) === tech ? "active" : ""}`}
                                                onClick={() => {
                                                    if (activeTab === "dev") setDevFilter(tech);
                                                    else setShootFilter(tech);
                                                    setShowFilterMenu(false);
                                                }}
                                            >
                                                {tech}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="showing-status">
                        <span>Showing {activeTab === "dev" ? filteredDevProjects.length : filteredPhotographyProjects.length} of {activeTab === "dev" ? projects.filter(p => p.category !== "Photography").length : projects.filter(p => p.category === "Photography").length} projects</span>
                    </div>

                    {/* Development Projects Section */}
                    {activeTab === "dev" && (
                        <div className="project-section active">
                            <div className="section-title-group">
                                <div className="section-icon-box">
                                    <Code size={24} />
                                </div>
                                <div>
                                    <h2>Development Projects</h2>
                                    <p>Full-stack applications, websites, and software solutions</p>
                                </div>
                            </div>
                            <div className="projects-grid">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="bg-zinc-900/50 aspect-[4/5] rounded-3xl animate-pulse border border-white/5" />
                                    ))
                                ) : (
                                    filteredDevProjects.map((project: Project) => (
                                        <div key={project.id} className="project-new-card">
                                            <div className="project-image-container">
                                                <img src={project.image_url || "/assets/placeholder.jpg"} alt={project.title} />
                                                <button
                                                    className="btn-read-more"
                                                    onClick={() => setSelectedProject(project)}
                                                >
                                                    Read More
                                                </button>
                                            </div>
                                            <div className="project-info">
                                                <h3>{project.title}</h3>
                                                <p className="project-date">{project.date}</p>
                                                <div className="project-tags">
                                                    {project.tech_stack?.slice(0, 3).map(tag => (
                                                        <span key={tag} className="tag">{tag}</span>
                                                    ))}
                                                </div>
                                                <div className="project-actions">
                                                    <button
                                                        className="btn-action btn-preview"
                                                        onClick={() => setPreviewProject(project)}
                                                    >
                                                        <span>Preview</span>
                                                    </button>
                                                    {project.live_demo_url && (
                                                        <a href={project.live_demo_url} target="_blank" className="btn-action btn-live">
                                                            <span>Live Demo</span>
                                                        </a>
                                                    )}
                                                    {project.repo_url && (
                                                        <a href={project.repo_url} target="_blank" className="btn-action btn-repo">
                                                            <span>Repository</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Photographic Shoot Section */}
                    {activeTab === "shoot" && (
                        <div className="project-section active">
                            <div className="section-title-group">
                                <div className="section-icon-box">
                                    <Camera size={24} />
                                </div>
                                <div>
                                    <h2>Photographic Shoot</h2>
                                    <p>Capturing moments, products, and visual stories</p>
                                </div>
                            </div>
                            <div className="projects-grid photography-grid">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="bg-zinc-900/50 aspect-square rounded-2xl animate-pulse border border-white/5" />
                                    ))
                                ) : (
                                    filteredPhotographyProjects.length > 0 ? (
                                        filteredPhotographyProjects.map((project: Project) => (
                                            <div
                                                key={project.id}
                                                className="project-shoot-card group"
                                                onMouseEnter={() => setHoveredPhoto(project.image_url)}
                                                onMouseLeave={() => setHoveredPhoto(null)}
                                            >
                                                <div className="shoot-image-wrapper">
                                                    <img src={project.image_url} alt={project.title} />
                                                    <div className="shoot-overlay"></div>
                                                    <div className="shoot-info">
                                                        <span className="shoot-tag">{project.tech_stack?.[0] || "Photography"}</span>
                                                        <h4 className="shoot-title">{project.title}</h4>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-20 text-center">
                                            <p className="text-zinc-500 text-lg">No photography projects found in the database yet.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Floating Preview Effect - Moved outside sections to avoid stacking context issues */}
            {hoveredPhoto && (
                <div
                    className="cert-floating-preview"
                    style={{
                        position: "fixed",
                        left: mousePosition.x + 20,
                        top: mousePosition.y + 20,
                        zIndex: 10000,
                        pointerEvents: "none",
                        transition: "left 0.1s ease-out, top 0.1s ease-out",
                        width: "300px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        backgroundColor: "transparent"
                    }}
                >
                    <img
                        src={hoveredPhoto}
                        alt="Photography Preview"
                        style={{
                            width: "100%",
                            height: "auto",
                            display: "block"
                        }}
                    />
                </div>
            )}

            {/* Modals */}
            {selectedProject && (
                <ProjectModal
                    project={selectedProject}
                    isOpen={!!selectedProject}
                    onClose={() => setSelectedProject(null)}
                    onPreview={(p) => setPreviewProject(p)}
                />
            )}

            {previewProject && (
                <PreviewModal
                    project={previewProject}
                    isOpen={!!previewProject}
                    onClose={() => setPreviewProject(null)}
                />
            )}

            {/* Let's Work Together & Contact Sections */}
            {profile && (
                <div className="milestones-unified-wrapper">

                    {/* Contact Section */}
                    <section id="contact" className="section-high-fidelity">
                        {geoBars}
                        <div className="container" style={{ maxWidth: "1200px" }}>
                            <div className="section-header">
                                <h2 className="milestone-main-title">Let's Work Together</h2>
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
                                            <span className="time">{currentTime || "06:40 PM MYT"}</span>
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

                            <div className="availability-card" style={{ marginTop: "2rem" }}>
                                <div className="pulse-dot"></div>
                                <div className="availability-text">
                                    <h5>Currently available for new projects</h5>
                                    <p>Accepting freelance work and collaboration opportunities</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    <Footer />
                </div>
            )}


            <style jsx>{`
                .cert-floating-preview {
                    animation: previewFadeIn 0.3s ease-out;
                }
                @keyframes previewFadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
