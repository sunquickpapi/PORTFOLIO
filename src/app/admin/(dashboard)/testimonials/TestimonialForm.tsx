"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Save,
    MessageSquare,
    User,
    Briefcase,
    Quote,
    ShieldCheck,
    X,
    Sparkles
} from "lucide-react";
import Link from "next/link";

interface TestimonialFormProps {
    testimonialId?: string;
}

export default function TestimonialForm({ testimonialId }: TestimonialFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        author: "",
        role: "",
        quote: "",
        feedback: "",
    });

    useEffect(() => {
        if (testimonialId) {
            fetchTestimonial();
        }
    }, [testimonialId]);

    const fetchTestimonial = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/testimonials/${testimonialId}`);
            const data = await res.json();
            setFormData(data);
        } catch (error) {
            console.error("Error fetching testimonial:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(
                testimonialId ? `/api/testimonials/${testimonialId}` : "/api/testimonials",
                {
                    method: testimonialId ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            if (res.ok) {
                router.push("/admin/testimonials");
                router.refresh();
            } else {
                alert("Failed to save testimonial");
            }
        } catch (error) {
            console.error("Error saving testimonial:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading && testimonialId) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <span>Retrieving Feedback Data...</span>
                <style jsx>{`
                    .loading-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 400px;
                        gap: 1rem;
                        color: #1B4F72;
                        font-weight: 600;
                    }
                    .spinner {
                        width: 40px;
                        height: 40px;
                        border: 3px solid rgba(27, 79, 114, 0.1);
                        border-top-color: #1B4F72;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    return (
        <div className="testimonial-form-container">
            <form onSubmit={handleSubmit} className="premium-form">
                <div className="glass-section">
                    <div className="section-badge">
                        <MessageSquare size={14} />
                        Identity & Professional Context
                    </div>

                    <div className="form-grid">
                        <div className="input-group">
                            <label className="input-label">
                                <User size={16} />
                                Author Name
                            </label>
                            <input
                                name="author"
                                required
                                placeholder="e.g. Dr. Wan Aziz"
                                className="premium-input"
                                value={formData.author || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">
                                <Briefcase size={16} />
                                Designation / Role
                            </label>
                            <input
                                name="role"
                                required
                                placeholder="e.g. Project Director, AI Research Lab"
                                className="premium-input"
                                value={formData.role || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group md:col-span-2">
                            <label className="input-label">
                                <Quote size={16} />
                                The Quote
                            </label>
                            <input
                                name="quote"
                                required
                                placeholder="e.g. Highly Recommended / Outstanding Vision"
                                className="premium-input font-bold"
                                value={formData.quote || ""}
                                onChange={handleChange}
                            />
                            <p className="helper-text">
                                <Sparkles size={10} style={{ marginRight: '4px' }} />
                                Short, impactful headline for the testimonial
                            </p>
                        </div>

                        <div className="input-group md:col-span-2">
                            <label className="input-label">
                                <MessageSquare size={16} />
                                Full Feedback Narrative
                            </label>
                            <textarea
                                name="feedback"
                                required
                                rows={6}
                                placeholder="Paste the complete feedback provided by the author..."
                                className="premium-textarea"
                                value={formData.feedback || ""}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

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
                                <div className="btn-spinner"></div>
                                <span>Syncing...</span>
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                <span>{testimonialId ? "Commit Updates" : "Publish Feedback"}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .testimonial-form-container {
                    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                    max-width: 900px;
                    margin: 0 auto;
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .premium-form {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .glass-section {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    border-radius: 24px;
                    padding: 2.5rem;
                    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.07);
                    position: relative;
                }

                .section-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 0.5rem 1rem;
                    background: rgba(27, 79, 114, 0.08);
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #1B4F72;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 2rem;
                }

                .form-grid {
                    display: grid;
                    grid-template-cols: 1fr;
                    gap: 2rem;
                }

                @media (min-width: 768px) {
                    .form-grid { grid-template-cols: repeat(2, 1fr); }
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .input-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #475569;
                    letter-spacing: -0.01em;
                }

                .premium-input, .premium-textarea {
                    width: 100%;
                    padding: 0.85rem 1.25rem;
                    background: rgba(255, 255, 255, 0.8);
                    border: 2px solid rgba(226, 232, 240, 0.8);
                    border-radius: 14px;
                    font-size: 0.95rem;
                    color: #1e293b;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    outline: none;
                }

                .premium-textarea {
                    resize: none;
                    min-height: 150px;
                    line-height: 1.6;
                }

                .premium-input:focus, .premium-textarea:focus {
                    background: #ffffff;
                    border-color: #3A99C9;
                    box-shadow: 0 0 0 4px rgba(58, 153, 201, 0.15);
                    transform: translateY(-1px);
                }

                .premium-input::placeholder, .premium-textarea::placeholder {
                    color: #94a3b8;
                }

                .helper-text {
                    display: flex;
                    align-items: center;
                    font-size: 0.75rem;
                    color: #64748b;
                    margin-top: 0.25rem;
                }

                .form-actions-bar {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    padding-top: 1rem;
                }

                .btn-premium-cancel {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 0.85rem 1.75rem;
                    background: #ffffff;
                    border: 2px solid #e2e8f0;
                    border-radius: 16px;
                    color: #64748b;
                    font-weight: 700;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .btn-premium-cancel:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                    color: #475569;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                .btn-premium-save {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 0.85rem 2.25rem;
                    background: linear-gradient(135deg, #1B4F72 0%, #3A99C9 100%);
                    border: none;
                    border-radius: 16px;
                    color: white;
                    font-weight: 700;
                    font-size: 0.95rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(27, 79, 114, 0.3);
                }

                .btn-premium-save:hover:not(:disabled) {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 8px 25px rgba(27, 79, 114, 0.4);
                    background: linear-gradient(135deg, #225f8a 0%, #46addf 100%);
                }

                .btn-premium-save:active:not(:disabled) {
                    transform: translateY(0) scale(0.98);
                }

                .btn-premium-save:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    filter: grayscale(0.5);
                }

                .btn-spinner {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin { to { transform: rotate(360deg); } }

                .relative { position: relative; }
            `}</style>
        </div>
    );
}
