"use client";

import { Home, Layout, MessageSquare, BookOpen, Mail, Github, Linkedin, FileText, Sun, Moon, Menu, X, ChevronUp, ChevronDown, FileCode, Briefcase, ArrowUpRight, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Courier_Prime } from "next/font/google";
import { isPageReady, onPageReady } from "@/lib/pageReady";

const courier = Courier_Prime({ subsets: ["latin"], weight: ["700"], display: "swap" });

/** Liquid fill in the nav bar while the home page content loads (eases toward 90%, then 100% on ready). */
function useLoadProgress() {
    const [p, setP] = useState(0);
    const [phase, setPhase] = useState<"run" | "done" | "gone">("run");
    useEffect(() => {
        if (isPageReady()) {
            setPhase("gone");
            return;
        }
        let cur = 0;
        const id = window.setInterval(() => {
            cur = Math.min(90, cur + (90 - cur) * 0.035 + 0.12);
            setP(cur);
        }, 60);
        let t: number | undefined;
        const off = onPageReady(() => {
            window.clearInterval(id);
            setP(100);
            setPhase("done");
            t = window.setTimeout(() => setPhase("gone"), 1250);
        });
        return () => {
            window.clearInterval(id);
            if (t) window.clearTimeout(t);
            off();
        };
    }, []);
    return { p, phase };
}

export default function Navigation() {
    const { theme, toggleTheme } = useTheme();
    const [profile, setProfile] = useState<any>(null);
    const [mounted, setMounted] = useState(false);
    const [activeSection, setActiveSection] = useState("home");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [atTop, setAtTop] = useState(true);
    const [hireOpen, setHireOpen] = useState(false);
    const hireRef = useRef<HTMLDivElement>(null);
    const load = useLoadProgress();

    // Close the Hire Me menu on outside click or Escape
    useEffect(() => {
        if (!hireOpen) return;
        const onPointer = (e: PointerEvent) => {
            if (hireRef.current && !hireRef.current.contains(e.target as Node)) setHireOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setHireOpen(false);
        };
        document.addEventListener("pointerdown", onPointer);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onPointer);
            document.removeEventListener("keydown", onKey);
        };
    }, [hireOpen]);

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
        const sections = ["home", "projects", "snippets", "testimonials", "blog-latest", "contact"];
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
            // Hysteresis: collapse past 80px, expand again only near the very top,
            // so small scroll jitters around one threshold don't make it flicker.
            const y = window.scrollY;
            setAtTop((prev) => (prev ? y < 80 : y < 24));
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const hireLinks = [
        {
            label: "GitHub",
            hint: "See my code",
            href: profile?.github_url || "https://github.com/sunquickpapi",
            icon: Github,
            external: true,
        },
        {
            label: "LinkedIn",
            hint: "Connect with me",
            href: profile?.linkedin_url || "https://www.linkedin.com/in/muhammad-naufal-bin-mohd-nizam-0603b2279",
            icon: Linkedin,
            external: true,
        },
        {
            label: "Email",
            hint: "Send me a message",
            href: profile?.email ? `mailto:${profile.email}` : "#contact",
            icon: Mail,
            external: false,
        },
        {
            label: "Resume",
            hint: "Download PDF",
            href: profile?.resume_url || "/assets/resume.pdf",
            icon: FileText,
            download: true,
        },
    ];

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const navItems: { id: string; label: string; short?: string; icon: typeof Home; href?: string }[] = [
        { id: "home", label: "Home", icon: Home },
        { id: "projects", label: "Project", short: "Projects", icon: Layout },
        { id: "snippets", label: "Snippets", icon: FileCode },
        { id: "testimonials", label: "Testimonials", icon: MessageSquare },
        { id: "blog-latest", label: "Blog", icon: BookOpen },
        { id: "contact", label: "Contacts", short: "Contact", icon: Mail },
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

            {/* Mobile menu: a paper index card that slides up, everything on one sheet (no scrolling) */}
            <div className={`mobile-menu-overlay ${isMenuOpen ? "open" : ""}`} onClick={() => setIsMenuOpen(false)}>
                <div
                    className={`mobile-menu-drawer mnav ${isMenuOpen ? "open" : ""}`}
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menu"
                >
                    <button type="button" className="mnav-grip" aria-label="Close menu" onClick={() => setIsMenuOpen(false)} />

                    <div className="mnav-head">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="mnav-avatar" src="/assets/passcard/pass-photo.webp" alt="" />
                        <div className="mnav-id">
                            <span className={`mnav-kicker ${courier.className}`}>FILE:: INDEX</span>
                            <span className="mnav-name">Naufal Nizam</span>
                            <span className="mnav-role">{profile?.role || "Intelligent System Engineer"}</span>
                        </div>
                    </div>

                    <nav className="mnav-grid" aria-label="Sections">
                        {navItems.map((item, i) => {
                            const Icon = item.icon;
                            const active = activeSection === item.id;
                            return (
                                <a
                                    key={item.id}
                                    href={item.href || `#${item.id}`}
                                    className={`mnav-tile ${active ? "is-active" : ""}`}
                                    style={{ "--i": i } as React.CSSProperties}
                                    aria-current={active ? "true" : undefined}
                                    onClick={() => {
                                        setActiveSection(item.id);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <span className={`mnav-no ${courier.className}`}>N°{String(i + 1).padStart(2, "0")}</span>
                                    <span className="mnav-tile-row">
                                        <Icon size={18} strokeWidth={2.1} />
                                        <span className="mnav-label">{item.short || item.label}</span>
                                    </span>
                                </a>
                            );
                        })}
                    </nav>

                    <div className="mnav-rule" aria-hidden="true" />

                    <div className="mnav-links">
                        {hireLinks.map((link, i) => {
                            const Icon = link.icon;
                            return (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="mnav-link"
                                    style={{ "--i": i + 6 } as React.CSSProperties}
                                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                    {...(link.download ? { download: true } : {})}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className="mnav-stamp"><Icon size={18} strokeWidth={2.1} /></span>
                                    <span className={`mnav-link-label ${courier.className}`}>{link.label}</span>
                                </a>
                            );
                        })}
                    </div>

                    <div className="mnav-foot">
                        {mounted && (
                            <button type="button" className={`mnav-theme ${courier.className}`} onClick={toggleTheme}>
                                {theme === "dark" ? <Sun size={15} strokeWidth={2.25} /> : <Moon size={15} strokeWidth={2.25} />}
                                {theme === "dark" ? "LIGHT MODE" : "DARK MODE"}
                            </button>
                        )}
                        <span className={`mnav-route ${courier.className}`} aria-hidden="true">
                            {(profile?.route_from || "MLK").trim()} → {(profile?.route_to || "KDH").trim()}
                        </span>
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

            <nav className={`dock-wrapper ${atTop ? "is-expanded" : ""}`}>
                <div className={`dock ${load.phase === "run" ? "is-loading" : ""}`}>
                    {load.phase !== "gone" && (
                        <div
                            className={`dock-liquid ${load.phase === "done" ? "is-done" : ""}`}
                            style={{ "--p": load.p } as React.CSSProperties}
                            role="progressbar"
                            aria-label="Loading"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(load.p)}
                        >
                            <span className="dock-liquid-fill">
                                <span className="dock-liquid-wave" />
                            </span>
                            <span className={`dock-liquid-num ${courier.className}`}>{String(Math.round(load.p)).padStart(2, "0")}</span>
                        </div>
                    )}
                    {/* Logo */}
                    <div className="dock-group">
                        <a href="/admin/login" className="dock-item dock-item-logo" data-label="Admin" aria-label="Admin">
                            <img
                                src={profile?.logo_url || "/assets/NameLogo.png"}
                                alt="FVL"
                                className="dock-logo w-8 h-8 rounded-full"
                            />
                            <span className="dock-tooltip">Admin</span>
                        </a>
                    </div>

                    <div className="dock-separator"></div>

                    {/* Main Sections */}
                    <div className="dock-group">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <a
                                    key={item.id}
                                    href={item.href || `#${item.id}`}
                                    className={`dock-item dock-item-nav ${activeSection === item.id ? "active" : ""}`}
                                    data-label={item.label}
                                    aria-label={item.label}
                                    onClick={() => setActiveSection(item.id)}
                                >
                                    <span className="dock-icon"><Icon size={20} /></span>
                                    <span className="dock-word">{item.short || item.label}</span>
                                    <span className="dock-tooltip">{item.label}</span>
                                </a>
                            );
                        })}
                    </div>

                    <div className="dock-separator"></div>

                    {/* Theme + Hire Me */}
                    <div className="dock-group dock-group-actions">
                        {mounted && (
                            <button
                                onClick={toggleTheme}
                                className="dock-item theme-toggle"
                                data-label={theme === 'dark' ? "Light Mode" : "Dark Mode"}
                                aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                                <span className="dock-tooltip">{theme === 'dark' ? "Light Mode" : "Dark Mode"}</span>
                            </button>
                        )}

                        <div className={`hire ${hireOpen ? "is-open" : ""}`} ref={hireRef}>
                            <button
                                type="button"
                                className="hire-btn"
                                aria-haspopup="menu"
                                aria-expanded={hireOpen}
                                aria-controls="hire-menu"
                                onClick={() => setHireOpen((o) => !o)}
                            >
                                <Briefcase size={16} strokeWidth={2.25} />
                                <span>Hire Me</span>
                                <ChevronDown size={14} strokeWidth={2.5} className="hire-chevron" />
                            </button>

                            <div id="hire-menu" className="hire-menu" role="menu" aria-hidden={!hireOpen}>
                                {hireLinks.map((link, i) => {
                                    const Icon = link.icon;
                                    return (
                                        <a
                                            key={link.label}
                                            href={link.href}
                                            role="menuitem"
                                            tabIndex={hireOpen ? 0 : -1}
                                            className="hire-item"
                                            style={{ transitionDelay: hireOpen ? `${40 + i * 35}ms` : "0ms" }}
                                            {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                            {...(link.download ? { download: true } : {})}
                                            onClick={() => setHireOpen(false)}
                                        >
                                            <span className="hire-item-icon"><Icon size={17} /></span>
                                            <span className="hire-item-text">
                                                <span className="hire-item-label">{link.label}</span>
                                                <span className="hire-item-hint">{link.hint}</span>
                                            </span>
                                            {link.download ? (
                                                <Download size={15} className="hire-item-arrow" />
                                            ) : (
                                                <ArrowUpRight size={15} className="hire-item-arrow" />
                                            )}
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
