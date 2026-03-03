"use client";

import { Home, User, Code, Layout, MessageSquare, BookOpen, Mail, Github, Linkedin, FileText, Sun, Moon, Menu, X, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function Navigation() {
    const { theme, toggleTheme } = useTheme();
    const [profile, setProfile] = useState<any>(null);
    const [mounted, setMounted] = useState(false);
    const [activeSection, setActiveSection] = useState("home");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetch("/api/profile")
            .then((res) => res.json())
            .then((data) => setProfile(data));

        // Intersection Observer to track active section
        const observerOptions = {
            threshold: 0.3, // Trigger when 30% of the section is visible
            rootMargin: "-20% 0px -20% 0px" // Focus more on the center of the viewport
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Sections to observe
        const sections = ["home", "about", "tech-stack", "projects", "testimonials", "blog-latest", "contact"];
        sections.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        // Handle initial hash for "auto-tap" feel
        const hash = window.location.hash.replace("#", "");
        if (hash && sections.includes(hash)) {
            setActiveSection(hash);
        }

        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 500);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const navItems = [
        { id: "home", label: "Home", icon: Home },
        { id: "about", label: "About Me", icon: User },
        { id: "tech-stack", label: "TechStack", icon: Code },
        { id: "projects", label: "Project", icon: Layout },
        { id: "testimonials", label: "Testimonials", icon: MessageSquare },
        { id: "blog-latest", label: "Blog", icon: BookOpen },
        { id: "contact", label: "Contacts", icon: Mail },
    ];

    return (
        <>
            {/* Mobile Menu Trigger */}
            <button
                className={`mobile-menu-trigger ${isMenuOpen ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle Menu"
            >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Drawer Overlay */}
            <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
                <div className={`mobile-menu-drawer ${isMenuOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                    <div className="drawer-header">
                        <span className="drawer-brand">Adhaghani</span>
                    </div>

                    <div className="drawer-content">
                        {/* Navigation Sections */}
                        <div className="drawer-section">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className={`drawer-link ${activeSection === item.id ? "active" : ""}`}
                                        onClick={() => {
                                            setActiveSection(item.id);
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        <div className="link-icon">
                                            <Icon size={20} />
                                        </div>
                                        <span className="link-label">{item.label}</span>
                                    </a>
                                );
                            })}
                        </div>

                        <div className="drawer-separator"></div>

                        {/* Social & External */}
                        <div className="drawer-section">
                            <a href="https://github.com/sunquickpapi" target="_blank" className="drawer-link">
                                <div className="link-icon"><Github size={20} /></div>
                                <span className="link-label">GitHub</span>
                            </a>
                            <a href="https://www.linkedin.com/in/muhammad-naufal-bin-mohd-nizam-0603b2279" target="_blank" className="drawer-link">
                                <div className="link-icon"><Linkedin size={20} /></div>
                                <span className="link-label">LinkedIn</span>
                            </a>
                            <a href="#contact" className="drawer-link" onClick={() => setIsMenuOpen(false)}>
                                <div className="link-icon"><Mail size={20} /></div>
                                <span className="link-label">Send Email</span>
                            </a>
                            <a href="#" download className="drawer-link">
                                <div className="link-icon"><FileText size={20} /></div>
                                <span className="link-label">Resume</span>
                            </a>
                            {mounted && (
                                <button
                                    onClick={toggleTheme}
                                    className="drawer-link w-full border-none bg-transparent"
                                >
                                    <div className="link-icon">
                                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                                    </div>
                                    <span className="link-label">{theme === 'dark' ? "Light Mode" : "Dark Mode"}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Floating Buttons */}
            <div className="mobile-floating-actions">
                {/* Bottom Left: Back to Top */}
                <button
                    className={`floating-btn back-to-top ${showBackToTop ? 'visible' : ''}`}
                    onClick={scrollToTop}
                    aria-label="Back to top"
                >
                    <ChevronUp size={24} strokeWidth={2.5} />
                </button>

                {/* Bottom Right: Socials */}
                <div className="social-floating-group">
                    <a
                        href="https://github.com/sunquickpapi"
                        target="_blank"
                        className="floating-btn"
                        aria-label="GitHub"
                    >
                        <Github size={20} />
                    </a>
                    <a
                        href="https://www.linkedin.com/in/muhammad-naufal-bin-mohd-nizam-0603b2279"
                        target="_blank"
                        className="floating-btn"
                        aria-label="LinkedIn"
                    >
                        <Linkedin size={20} />
                    </a>
                </div>
            </div>

            <nav className="dock-wrapper">
                <div className="dock">
                    {/* Main Sections */}
                    <div className="dock-group">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    className={`dock-item ${activeSection === item.id ? "active" : ""}`}
                                    data-label={item.label}
                                    onClick={() => setActiveSection(item.id)}
                                >
                                    <Icon size={20} />
                                    <span className="dock-tooltip">{item.label}</span>
                                </a>
                            );
                        })}
                    </div>

                    <div className="dock-separator"></div>

                    {/* Socials & Tools */}
                    <div className="dock-group">
                        <a href="https://github.com/sunquickpapi" target="_blank" className="dock-item" data-label="GitHub">
                            <Github size={20} />
                            <span className="dock-tooltip">GitHub</span>
                        </a>
                        <a href="https://www.linkedin.com/in/muhammad-naufal-bin-mohd-nizam-0603b2279" target="_blank" className="dock-item" data-label="LinkedIn">
                            <Linkedin size={20} />
                            <span className="dock-tooltip">LinkedIn</span>
                        </a>
                        <a href="#contact" className="dock-item" data-label="Contact">
                            <Mail size={20} />
                            <span className="dock-tooltip">Contact</span>
                        </a>
                        <a href="#" download className="dock-item" data-label="Resume">
                            <FileText size={20} />
                            <span className="dock-tooltip">Resume</span>
                        </a>
                    </div>

                    <div className="dock-separator"></div>

                    {/* Utility & Theme */}
                    <div className="dock-group">
                        {mounted && (
                            <button
                                onClick={toggleTheme}
                                className="dock-item theme-toggle"
                                data-label={theme === 'dark' ? "Light Mode" : "Dark Mode"}
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                                <span className="dock-tooltip">{theme === 'dark' ? "Light Mode" : "Dark Mode"}</span>
                            </button>
                        )}
                        <a href="/admin/login" className="dock-item dock-item-logo" data-label="Admin">
                            <img
                                src={profile?.logo_url || "/assets/NameLogo.png"}
                                alt="Admin"
                                className="dock-logo w-8 h-8 rounded-full"
                            />
                            <span className="dock-tooltip">Admin</span>
                        </a>
                    </div>
                </div>
            </nav>
        </>
    );
}
