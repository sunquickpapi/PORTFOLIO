"use client";

import Link from "next/link";
import {
    User,
    Briefcase,
    Award,
    GraduationCap,
    Layout,
    ArrowRight,
    FileText,
    MessageSquare,
    BookOpen,
    Sparkles
} from "lucide-react";

export default function AdminDashboard() {
    return (
        <div className="dashboard-wrapper">
            {/* Decorative Background Elements */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            <header className="dashboard-header">
                <div className="header-top">
                    <div className="header-badge">
                        <Sparkles size={15} style={{ marginRight: '6px' }} />
                        System Overview
                    </div>
                </div>
                <h1 className="dashboard-title">
                    Admin <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="dashboard-subtitle">Manage your digital portfolio with premium controls and real-time updates.</p>
            </header>

            <div className="cards-grid">
                <DashboardCard
                    title="Profile"
                    description="Personal info & links."
                    link="/admin/profile"
                    icon={User}
                    color="#1B4F72"
                />
                <DashboardCard
                    title="About Page"
                    description="Hobbies & about text."
                    link="/admin/about-details"
                    icon={FileText}
                    color="#3A99C9"
                />
                <DashboardCard
                    title="Projects"
                    description="Portfolio management."
                    link="/admin/projects"
                    icon={Briefcase}
                    color="#75C2E6"
                />
                <DashboardCard
                    title="Experience"
                    description="Work history details."
                    link="/admin/experience"
                    icon={Award}
                    color="#1B4F72"
                />
                <DashboardCard
                    title="Education"
                    description="Academic background."
                    link="/admin/education"
                    icon={GraduationCap}
                    color="#3A99C9"
                />
                <DashboardCard
                    title="Certifications"
                    description="Pro certifications."
                    link="/admin/certifications"
                    icon={Award}
                    color="#75C2E6"
                />
                <DashboardCard
                    title="Skills"
                    description="Technical stack."
                    link="/admin/skills"
                    icon={Layout}
                    color="#1B4F72"
                />
                <DashboardCard
                    title="Testimonials"
                    description="Client feedback."
                    link="/admin/testimonials"
                    icon={MessageSquare}
                    color="#3A99C9"
                />
                <DashboardCard
                    title="Blog"
                    description="Article management."
                    link="/admin/blogs"
                    icon={BookOpen}
                    color="#75C2E6"
                />
            </div>

            <style jsx>{`
                .dashboard-wrapper {
                    animation: fadeIn 0.8s ease-out;
                    padding: 2rem 1rem;
                    height: 100%;
                    width: 100%;
                    max-height: calc(100vh - 120px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    overflow: hidden;
                }

                /* Hide scrollbar for Chrome, Safari and Opera */
                .dashboard-wrapper::-webkit-scrollbar {
                    display: none;
                }

                /* Hide scrollbar for IE, Edge and Firefox */
                .dashboard-wrapper {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .bg-blob {
                    position: absolute;
                    width: 400px;
                    height: 400px;
                    border-radius: 50%;
                    filter: blur(80px);
                    z-index: -1;
                    opacity: 0.3;
                    pointer-events: none;
                }

                .blob-1 {
                    top: -150px;
                    right: -100px;
                    background: radial-gradient(circle, #75C2E6 0%, transparent 70%);
                    animation: float 20s infinite alternate;
                }

                .blob-2 {
                    bottom: 0px;
                    left: 100px;
                    background: radial-gradient(circle, #3A99C9 0%, transparent 70%);
                    animation: float 15s infinite alternate-reverse;
                }

                @keyframes float {
                    0% { transform: translate(0, 0) scale(1); }
                    100% { transform: translate(30px, 20px) scale(1.1); }
                }

                .dashboard-header {
                    margin-bottom: 3.5rem;
                    position: relative;
                    z-index: 10;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .header-top {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1rem;
                }

                .header-badge {
                    display: flex;
                    align-items: center;
                    padding: 0.4rem 1rem;
                    background: white;
                    color: #3A99C9;
                    border-radius: 100px;
                    font-size: 0.72rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    box-shadow: 0 4px 20px rgba(58, 153, 201, 0.12);
                    border: 1px solid rgba(58, 153, 201, 0.1);
                }

                .dashboard-title {
                    font-size: 3rem;
                    font-weight: 950;
                    color: #1B4F72;
                    letter-spacing: -0.05em;
                    margin: 0;
                    line-height: 1.1;
                }

                .gradient-text {
                    background: linear-gradient(135deg, #1B4F72 0%, #3A99C9 50%, #75C2E6 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .dashboard-subtitle {
                    color: #64748b;
                    font-size: 1.15rem;
                    margin-top: 0.85rem;
                    font-weight: 500;
                    letter-spacing: -0.01em;
                    width: 100%;
                }

                .cards-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.75rem;
                    padding-bottom: 2rem;
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    justify-content: center;
                }

                @media (max-width: 1600px) {
                    .cards-grid {
                        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    }
                }

                @media (max-width: 1400px) {
                    .cards-grid {
                        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                        gap: 1.5rem;
                    }
                    .dashboard-title { font-size: 2.5rem; }
                }

                @media (max-width: 768px) {
                    .cards-grid {
                        grid-template-columns: 1fr;
                    }
                    .dashboard-title { font-size: 2.25rem; }
                }
            `}</style>
        </div>
    );
}

function DashboardCard({
    title,
    description,
    link,
    icon: Icon,
    color,
}: {
    title: string;
    description: string;
    link: string;
    icon: any;
    color: string;
}) {
    return (
        <Link href={link} className="card-link">
            <div className="card-outer">
                <div className="card-inner">
                    <div className="card-header">
                        <div className="icon-box" style={{
                            background: `linear-gradient(135deg, ${color}22 0%, ${color}08 100%)`,
                            border: `1px solid ${color}15`
                        }}>
                            <Icon size={26} color={color} strokeWidth={2} />
                        </div>
                        <div className="status-dot" style={{ backgroundColor: color }}></div>
                    </div>

                    <div className="card-content">
                        <div className="title-row">
                            <h2 className="card-title">{title}</h2>
                            <ArrowRight className="arrow-icon" size={20} />
                        </div>
                        <p className="card-description">{description}</p>
                    </div>

                    <div className="card-btn">
                        <span>Configure Section</span>
                        <div className="btn-shine"></div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .card-link {
                    text-decoration: none;
                    display: block;
                    perspective: 1000px;
                }

                .card-outer {
                    position: relative;
                    padding: 1px;
                    border-radius: 1.75rem;
                    background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(226,232,240,0.3) 100%);
                    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                    cursor: pointer;
                    box-shadow: 0 10px 30px -10px rgba(58, 153, 201, 0.05);
                    height: 100%;
                    backdrop-filter: blur(10px);
                }

                .card-inner {
                    background: rgba(255, 255, 255, 0.9);
                    border-radius: 1.7rem;
                    padding: 1.75rem;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .icon-box {
                    width: 3.25rem;
                    height: 3.25rem;
                    border-radius: 1.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    opacity: 0.3;
                    margin-top: 5px;
                }

                .card-content {
                    flex: 1;
                }

                .title-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                }

                .card-title {
                    font-size: 1.35rem;
                    font-weight: 800;
                    color: #1B4F72;
                    margin: 0;
                    letter-spacing: -0.02em;
                }

                .arrow-icon {
                    color: ${color};
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
                }

                .card-description {
                    color: #64748b;
                    font-size: 0.9rem;
                    line-height: 1.5;
                    margin: 0;
                    font-weight: 500;
                }

                .card-btn {
                    margin-top: auto;
                    padding: 0.75rem;
                    background: #f8fafc;
                    border-radius: 1rem;
                    text-align: center;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    transition: all 0.4s ease;
                    position: relative;
                    overflow: hidden;
                    border: 1px solid #f1f5f9;
                }

                .btn-shine {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
                    transition: left 0.6s ease;
                }

                /* Hover Effects */
                .card-link:hover .card-outer {
                    transform: translateY(-8px) scale(1.02);
                    background: linear-gradient(135deg, ${color} 0%, #3A99C9 100%);
                    box-shadow: 0 25px 50px -15px ${color}33;
                }

                .card-link:hover .card-inner {
                    background: rgba(255, 255, 255, 0.95);
                    border-color: rgba(255, 255, 255, 0.8);
                }

                .card-link:hover .icon-box {
                    transform: scale(1.15) rotate(-5deg);
                    background: ${color} !important;
                }

                .card-link:hover :global(svg[color]) {
                    color: white !important;
                }

                .card-link:hover .card-title {
                    color: ${color};
                }

                .card-link:hover .arrow-icon {
                    opacity: 1;
                    transform: translateX(0);
                }

                .card-link:hover .card-btn {
                    background: ${color};
                    color: white;
                    border-color: transparent;
                    box-shadow: 0 5px 15px ${color}44;
                }

                .card-link:hover .btn-shine {
                    left: 100%;
                }

                .card-link:hover .status-dot {
                    opacity: 1;
                    box-shadow: 0 0 10px ${color};
                }
            `}</style>
        </Link>
    );
}
