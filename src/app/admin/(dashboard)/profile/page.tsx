"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Save, Info, Camera, BarChart3, Edit3, X } from "lucide-react";

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        tagline: "",
        bio: "",
        email: "",
        phone: "",
        location: "",
        github_url: "",
        linkedin_url: "",
        instagram_url: "",
        projects_count: 0,
        experience_years: 0,
        coffee_consumed: 0,
        logo_url: "",
        hero_bg_url: "",
        tech_learned_count: 0,
        dumbells_lifted_count: 0,
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/profile");
            const data = await res.json();
            if (data && Object.keys(data).length > 0) {
                setFormData(data);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert("Profile updated successfully!");
                setIsEditing(false);
                router.refresh();
            } else {
                const errorData = await res.json();
                alert(`Failed to update profile: ${errorData.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const value = e.target.type === "number" ? parseInt(e.target.value) : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading premium profile...</p>
            <style jsx>{`
                .loading-container {
                    height: 80vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #1B4F72;
                    font-weight: 600;
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(58, 153, 201, 0.1);
                    border-top-color: #3A99C9;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );

    return (
        <div className="profile-wrapper">
            {/* Decorative Background Elements */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            <header className="profile-header">
                <div className="header-top">
                    <div className="header-badge">
                        <Sparkles size={12} style={{ marginRight: '6px' }} />
                        Profile Management
                    </div>
                </div>
                <h1 className="profile-title">
                    {isEditing ? "Edit" : "Profile"} <span className="gradient-text">{isEditing ? "Profile" : "Overview"}</span>
                </h1>
                <p className="profile-subtitle">
                    {isEditing
                        ? "Update your personal information and portfolio presentation."
                        : "Your professional identity as it appears on your portfolio."}
                </p>
            </header>

            <form onSubmit={handleSubmit} className={`form-outer ${!isEditing ? 'read-only-view' : ''}`}>
                <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className={`edit-toggle-btn ${isEditing ? 'active' : ''}`}
                    title={isEditing ? "Cancel Editing" : "Unlock Profile"}
                >
                    {isEditing ? <X size={18} /> : <Edit3 size={18} />}
                    <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                </button>

                <div className="form-inner">
                    <div className="form-grid-main">
                        {/* LEFT COLUMN: Identity & Contact */}
                        <div className="form-column">
                            <section className="form-section">
                                <div className="section-header">
                                    <Info size={16} color="#1B4F72" />
                                    <h2 className="section-title">Identity & Bio</h2>
                                </div>

                                <div className="grid-layout">
                                    <div className="input-group">
                                        <label>Full Name</label>
                                        <input
                                            name="name"
                                            required
                                            readOnly={!isEditing}
                                            placeholder="Naufal"
                                            value={formData.name || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Main Role</label>
                                        <input
                                            name="role"
                                            required
                                            readOnly={!isEditing}
                                            placeholder="Software Engineer"
                                            value={formData.role || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group full-width">
                                        <label>Hero Tagline</label>
                                        <input
                                            name="tagline"
                                            readOnly={!isEditing}
                                            placeholder="Catchy tagline..."
                                            value={formData.tagline || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group full-width">
                                        <label>Bio</label>
                                        <textarea
                                            name="bio"
                                            rows={5}
                                            readOnly={!isEditing}
                                            placeholder="Professional biography..."
                                            value={formData.bio || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </section>

                            <div className="small-divider"></div>

                            <section className="form-section">
                                <div className="section-header">
                                    <Info size={16} color="#3A99C9" />
                                    <h2 className="section-title">Contact & Location</h2>
                                </div>
                                <div className="grid-layout">
                                    <div className="input-group">
                                        <label>Email Address</label>
                                        <input
                                            name="email"
                                            type="email"
                                            readOnly={!isEditing}
                                            placeholder="your@email.com"
                                            value={formData.email || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Phone Number</label>
                                        <input
                                            name="phone"
                                            readOnly={!isEditing}
                                            placeholder="Contact number"
                                            value={formData.phone || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group full-width">
                                        <label>Location</label>
                                        <input
                                            name="location"
                                            readOnly={!isEditing}
                                            placeholder="City, Country"
                                            value={formData.location || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN: Socials, Assets & Stats */}
                        <div className="form-column">
                            <section className="form-section">
                                <div className="section-header">
                                    <Camera size={16} color="#75C2E6" />
                                    <h2 className="section-title">Media & Socials</h2>
                                </div>

                                <div className="grid-layout compact-socials">
                                    <div className="input-group">
                                        <label>LinkedIn URL</label>
                                        <input
                                            name="linkedin_url"
                                            readOnly={!isEditing}
                                            placeholder="linkedin.com/..."
                                            value={formData.linkedin_url || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>GitHub URL</label>
                                        <input
                                            name="github_url"
                                            readOnly={!isEditing}
                                            placeholder="github.com/..."
                                            value={formData.github_url || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Instagram URL</label>
                                        <input
                                            name="instagram_url"
                                            readOnly={!isEditing}
                                            placeholder="instagram.com/..."
                                            value={formData.instagram_url || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Menu Logo URL</label>
                                        <input
                                            name="logo_url"
                                            readOnly={!isEditing}
                                            placeholder="/assets/logo.png"
                                            value={formData.logo_url || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group full-width">
                                        <label>Hero Background URL</label>
                                        <input
                                            name="hero_bg_url"
                                            readOnly={!isEditing}
                                            placeholder="/assets/hero-bg.jpg"
                                            value={formData.hero_bg_url || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </section>

                            <div className="small-divider"></div>

                            <section className="form-section">
                                <div className="section-header">
                                    <BarChart3 size={16} color="#1B4F72" />
                                    <h2 className="section-title">Performance Metrics</h2>
                                </div>

                                <div className="stats-compact-grid">
                                    <div className="input-group">
                                        <label>Projects</label>
                                        <input
                                            name="projects_count"
                                            type="number"
                                            value={formData.projects_count}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Years Exp</label>
                                        <input
                                            name="experience_years"
                                            type="number"
                                            value={formData.experience_years}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Coffee</label>
                                        <input
                                            name="coffee_consumed"
                                            readOnly={!isEditing}
                                            type="number"
                                            value={formData.coffee_consumed}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Techs</label>
                                        <input
                                            name="tech_learned_count"
                                            readOnly={!isEditing}
                                            type="number"
                                            value={formData.tech_learned_count || 0}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Lifted</label>
                                        <input
                                            name="dumbells_lifted_count"
                                            readOnly={!isEditing}
                                            type="number"
                                            value={formData.dumbells_lifted_count || 0}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="form-footer">
                        <button
                            type="submit"
                            disabled={saving}
                            className="save-btn"
                        >
                            <div className="btn-content">
                                <Save size={18} className={saving ? 'anim-pulse' : ''} />
                                <span>{saving ? "Updating Profile..." : "Save Changes"}</span>
                            </div>
                            <div className="btn-shine"></div>
                        </button>
                    </div>
                )}
            </form>

            <style jsx>{`
                .profile-wrapper {
                    animation: fadeIn 0.8s ease-out;
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    width: 100%;
                    min-height: calc(100vh - 80px);
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .bg-blob {
                    position: absolute;
                    width: 400px;
                    height: 400px;
                    border-radius: 50%;
                    filter: blur(80px);
                    z-index: -1;
                    opacity: 0.15;
                    pointer-events: none;
                }

                .blob-1 { top: -50px; right: 0; background: radial-gradient(circle, #75C2E6 0%, transparent 70%); }
                .blob-2 { bottom: 0; left: 0; background: radial-gradient(circle, #3A99C9 0%, transparent 70%); }

                .profile-header {
                    margin-bottom: 3.5rem;
                    text-align: center;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .header-badge {
                    display: inline-flex;
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
                    margin-bottom: 1rem;
                }

                .title-row-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 2rem;
                    width: 100%;
                    max-width: 1400px;
                }

                .profile-title {
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

                .edit-toggle-btn {
                    position: absolute;
                    top: 2rem;
                    right: 2rem;
                    z-index: 50;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.7rem 1.5rem;
                    background: white;
                    color: #1B4F72;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    font-weight: 850;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                }

                .edit-toggle-btn:hover {
                    background: #f8fafc;
                    transform: translateX(5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                }

                .edit-toggle-btn.active {
                    background: #fee2e2;
                    color: #ef4444;
                    border-color: #fca5a5;
                }

                .edit-toggle-btn.active:hover {
                    background: #fecaca;
                }

                .profile-subtitle {
                    color: #64748b;
                    font-size: 1.15rem;
                    margin-top: 0.85rem;
                    font-weight: 500;
                    letter-spacing: -0.01em;
                }

                .form-outer {
                    width: 100%;
                    max-width: 1400px;
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px);
                    border-radius: 2.5rem;
                    border: 1px solid rgba(255, 255, 255, 1);
                    box-shadow: 0 25px 50px -12px rgba(27, 79, 114, 0.08);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.4s ease;
                }

                .read-only-view {
                    background: rgba(255, 255, 255, 0.65);
                    box-shadow: 0 10px 30px -10px rgba(27, 79, 114, 0.04);
                }

                .form-inner {
                    padding: 3rem;
                    flex: 1;
                }

                .form-grid-main {
                    display: grid;
                    grid-template-columns: 1.25fr 1fr;
                    gap: 3.5rem;
                    align-items: start;
                }

                .form-column {
                    display: flex;
                    flex-direction: column;
                    gap: 2.5rem;
                }

                .form-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1.75rem;
                }

                .section-header {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    gap: 1rem;
                }

                .section-icon-box {
                    width: 2.25rem;
                    height: 2.25rem;
                    border-radius: 0.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
                }

                .section-title {
                    font-size: 1.35rem;
                    font-weight: 800;
                    color: #1B4F72;
                    letter-spacing: -0.02em;
                    margin: 0;
                }

                .grid-layout {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.25rem;
                }

                .full-width { grid-column: span 2; }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .input-group label {
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-left: 0.1rem;
                }

                .input-group input, 
                .input-group textarea {
                    width: 100%;
                    padding: 0.85rem 1.15rem;
                    background: #f8fafc;
                    border: 1px solid #eef2f6;
                    border-radius: 1.15rem;
                    color: #1a202c;
                    font-size: 0.9rem;
                    line-height: 1.5;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .form-outer.read-only-view input,
                .form-outer.read-only-view textarea {
                    background: rgba(255, 255, 255, 0.5);
                    border-color: transparent;
                    color: #1B4F72;
                    font-weight: 650;
                    cursor: default;
                }

                .input-group input:focus, 
                .input-group textarea:focus {
                    outline: none;
                    background: white;
                    border-color: #3A99C9;
                    box-shadow: 0 0 0 4px rgba(58, 153, 201, 0.08);
                }

                .small-divider {
                    height: 1px;
                    background: #f1f5f9;
                    width: 100%;
                }

                .stats-compact-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
                    gap: 1.25rem;
                }

                .form-footer {
                    padding: 2rem 3rem;
                    background: #f8fafc;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: flex-end;
                    animation: slideUp 0.4s ease-out;
                }

                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .save-btn {
                    position: relative;
                    padding: 1rem 2.5rem;
                    background: linear-gradient(135deg, #1B4F72 0%, #3A99C9 100%);
                    color: white;
                    border: none;
                    border-radius: 1.25rem;
                    font-weight: 800;
                    font-size: 1rem;
                    cursor: pointer;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 10px 25px -5px rgba(27, 79, 114, 0.2);
                }

                .btn-content {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    position: relative;
                    z-index: 2;
                }

                .save-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 30px rgba(27, 79, 114, 0.25);
                }

                .btn-shine {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
                    transition: left 0.5s ease;
                }

                .save-btn:hover .btn-shine { left: 100%; }

                .anim-pulse { animation: pulse 1.5s infinite; }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

                @media (max-width: 1400px) {
                    .profile-title { font-size: 2.5rem; }
                    .form-inner { padding: 2rem; }
                    .form-grid-main { gap: 2.5rem; }
                    .edit-toggle-btn { top: 1.5rem; right: 1.5rem; padding: 0.6rem 1.2rem; }
                }

                @media (max-width: 1200px) {
                    .profile-wrapper { min-height: auto; }
                    .form-grid-main { grid-template-columns: 1fr; gap: 3rem; }
                    .stats-compact-grid { grid-template-columns: repeat(3, 1fr); }
                    .edit-toggle-btn { position: relative; top: 0; right: 0; margin: 1.5rem auto 0; width: fit-content; }
                }

                @media (max-width: 768px) {
                    .profile-title { font-size: 2.25rem; }
                    .form-inner { padding: 1.5rem; }
                    .grid-layout { grid-template-columns: 1fr; }
                    .save-btn { width: 100%; }
                }
            `}</style>
        </div>
    );
}
