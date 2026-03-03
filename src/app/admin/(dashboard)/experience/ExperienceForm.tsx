"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Briefcase,
    Calendar,
    Type,
    Link as LinkIcon,
    Image as ImageIcon,
    ListChecks,
    FileText,
    Save,
    X,
    Sparkles,
    Building2,
    Globe
} from "lucide-react";

export default function ExperienceForm({ id }: { id?: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        company: "",
        role: "",
        duration: "",
        description: "",
        logo_url: "",
        company_url: "",
        points: "",
    });

    useEffect(() => {
        if (id) fetchExperience();
    }, [id]);

    const fetchExperience = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/experience/${id}`);
            const data = await res.json();
            const sanitizedData = {
                company: data.company || "",
                role: data.role || "",
                duration: data.duration || "",
                description: data.description || "",
                logo_url: data.logo_url || "",
                company_url: data.company_url || "",
                points: data.points || "",
            };
            setFormData(sanitizedData);
        } catch (error) {
            console.error("Error fetching experience:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { id: _, created_at, ...payload } = formData as any;
        try {
            const res = await fetch(id ? `/api/experience/${id}` : "/api/experience", {
                method: id ? "PUT" : "POST",
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                router.push("/admin/experience");
                router.refresh();
            } else {
                const err = await res.json();
                alert(`Error: ${err.error || "Failed to save"}`);
            }
        } catch (error) {
            console.error("Error saving experience:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && id) return <div className="p-8 text-center text-slate-500 font-medium">Preparing workspace...</div>;

    return (
        <form onSubmit={handleSubmit} className="premium-form-container">
            <section className="glass-section form-section">
                <div className="section-header">
                    <div className="section-title-box">
                        <Building2 size={22} color="#1B4F72" />
                        <h2 className="section-title">Workplace Identity</h2>
                    </div>
                </div>

                <div className="form-grid">
                    <div className="input-group">
                        <label className="input-label">
                            <Building2 size={16} />
                            Company Name
                        </label>
                        <input
                            name="company"
                            required
                            placeholder="e.g. Selangor Technical Skills..."
                            className="premium-input"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            <Type size={16} />
                            Your Role
                        </label>
                        <input
                            name="role"
                            required
                            placeholder="e.g. Comprehensive Trainee..."
                            className="premium-input"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            <Calendar size={16} />
                            Duration
                        </label>
                        <input
                            name="duration"
                            placeholder="e.g. Sep 2024 - Present"
                            className="premium-input"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            <Globe size={16} />
                            Company Website
                        </label>
                        <input
                            name="company_url"
                            placeholder="https://company.com"
                            className="premium-input"
                            value={formData.company_url}
                            onChange={(e) => setFormData({ ...formData, company_url: e.target.value })}
                        />
                    </div>
                </div>
            </section>

            <section className="glass-section form-section mt-8">
                <div className="section-header">
                    <div className="section-title-box">
                        <ImageIcon size={22} color="#1B4F72" />
                        <h2 className="section-title">Branding Assets</h2>
                    </div>
                </div>

                <div className="form-grid">
                    <div className="input-group full-width">
                        <label className="input-label">
                            <ImageIcon size={16} />
                            Official Logo URL
                        </label>
                        <input
                            name="logo_url"
                            className="premium-input"
                            placeholder="/assets/logo.png"
                            value={formData.logo_url}
                            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        />
                        <p className="helper-text">Recommendation: Use high-quality PNGs with transparent backgrounds.</p>
                    </div>
                </div>
            </section>

            <section className="glass-section form-section mt-8">
                <div className="section-header">
                    <div className="section-title-box">
                        <ListChecks size={22} color="#1B4F72" />
                        <h2 className="section-title">Achievements & Narrative</h2>
                    </div>
                </div>

                <div className="form-grid">
                    <div className="input-group full-width">
                        <label className="input-label">
                            <ListChecks size={16} />
                            Key Achievements (Comma separated)
                        </label>
                        <textarea
                            name="points"
                            rows={4}
                            className="premium-input"
                            value={formData.points}
                            placeholder="Developed iOS applications, Mastered SwiftUI syntax..."
                            onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                        />
                        <p className="helper-text">List your specific contributions, separated by commas for better rendering.</p>
                    </div>

                    <div className="input-group full-width">
                        <label className="input-label">
                            <FileText size={16} />
                            Brief Description
                        </label>
                        <textarea
                            name="description"
                            rows={4}
                            className="premium-input"
                            value={formData.description}
                            placeholder="Provide a high-level summary of your time at this organization..."
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>
            </section>

            <div className="form-actions-bar">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn-premium-cancel"
                >
                    <X size={20} />
                    <span>Discard Changes</span>
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-premium-save"
                >
                    {loading ? (
                        <>
                            <div className="spinner"></div>
                            <span>Syncing...</span>
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            <span>{id ? "Commit Updates" : "Register Experience"}</span>
                        </>
                    )}
                </button>
            </div>

            <style jsx>{`
                .premium-form-container {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .glass-section {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                    border-radius: 1.5rem;
                    border: 1px solid rgba(27, 79, 114, 0.1);
                    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
                    padding: 2.5rem;
                    overflow: hidden;
                    transition: transform 0.3s ease;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2.5rem;
                    border-bottom: 1px solid rgba(27, 79, 114, 0.05);
                    padding-bottom: 1rem;
                }

                .section-title-box {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .section-title {
                    font-size: 1.55rem;
                    font-weight: 800;
                    color: #1B4F72;
                    margin: 0;
                    line-height: 1;
                }

                .form-grid {
                    display: grid;
                    grid-template-cols: 1fr 1fr;
                    gap: 2rem;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .full-width {
                    grid-column: span 2;
                }

                .input-label {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #475569;
                    letter-spacing: 0.02em;
                    text-transform: uppercase;
                }

                .premium-input {
                    padding: 1rem 1.25rem;
                    background: rgba(255, 255, 255, 0.8);
                    border: 1.5px solid rgba(27, 79, 114, 0.1);
                    border-radius: 1rem;
                    font-size: 1rem;
                    color: #1e293b;
                    transition: all 0.2s ease;
                    outline: none;
                }

                .premium-input:focus {
                    background: white;
                    border-color: #3A99C9;
                    box-shadow: 0 0 0 4px rgba(58, 153, 201, 0.1);
                    transform: translateY(-1px);
                }

                .helper-text {
                    font-size: 0.75rem;
                    color: #64748b;
                    font-style: italic;
                    margin-top: 0.2rem;
                }

                .form-actions-bar {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1.5rem;
                    margin-top: 2rem;
                    padding-bottom: 3rem;
                }

                .btn-premium-cancel {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 2rem;
                    background: #fff;
                    color: #ef4444;
                    font-weight: 800;
                    border-radius: 1.25rem;
                    border: 1.5px solid rgba(239, 68, 68, 0.2);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: pointer;
                }

                .btn-premium-cancel:hover {
                    background: #fef2f2;
                    transform: translateY(-3px);
                    box-shadow: 0 10px 20px -5px rgba(239, 68, 68, 0.15);
                    border-color: #ef4444;
                }

                .btn-premium-save {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 3rem;
                    background: linear-gradient(135deg, #1B4F72 0%, #3A99C9 100%);
                    color: white;
                    font-weight: 800;
                    border-radius: 1.25rem;
                    border: none;
                    box-shadow: 0 10px 25px -5px rgba(27, 79, 114, 0.3);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: pointer;
                }

                .btn-premium-save:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 15px 35px -5px rgba(27, 79, 114, 0.4);
                }

                .btn-premium-save:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .spinner {
                    width: 22px;
                    height: 22px;
                    border: 2.5px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .form-grid {
                        grid-template-cols: 1fr;
                    }
                    .full-width {
                        grid-column: span 1;
                    }
                    .glass-section {
                        padding: 1.5rem;
                    }
                }
            `}</style>
        </form>
    );
}
