"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Save,
    X,
    Award,
    Building,
    Calendar,
    Link as LinkIcon,
    Image as ImageIcon,
    ExternalLink,
    ShieldCheck
} from "lucide-react";
import Link from "next/link";

interface CertificationFormProps {
    certId?: string;
}

export default function CertificationForm({ certId }: CertificationFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        issuer: "",
        date: "",
        credential_url: "",
        image_url: "",
    });

    useEffect(() => {
        if (certId) {
            fetchCert();
        }
    }, [certId]);

    const fetchCert = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/certifications/${certId}`);
            const data = await res.json();
            setFormData(data);
        } catch (error) {
            console.error("Error fetching certification:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(
                certId ? `/api/certifications/${certId}` : "/api/certifications",
                {
                    method: certId ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            if (res.ok) {
                router.push("/admin/certifications");
                router.refresh();
            } else {
                alert("Failed to save certification");
            }
        } catch (error) {
            console.error("Error saving certification:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading && certId) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <span>Retrieving Credential Data...</span>
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
        <div className="certification-form-container">
            <form onSubmit={handleSubmit} className="premium-form">
                <div className="glass-section">
                    <div className="section-badge">
                        <Award size={14} />
                        Certification Details
                    </div>

                    <div className="form-grid">
                        <div className="input-group md:col-span-2">
                            <label className="input-label">
                                <Award size={16} />
                                Certification Title
                            </label>
                            <input
                                name="title"
                                required
                                placeholder="e.g. MongoDB CRUD Operations in Node.js..."
                                className="premium-input"
                                value={formData.title || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">
                                <Building size={16} />
                                Issuing Organization
                            </label>
                            <input
                                name="issuer"
                                required
                                placeholder="e.g. MongoDB University..."
                                className="premium-input"
                                value={formData.issuer || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">
                                <Calendar size={16} />
                                Date Issued
                            </label>
                            <input
                                name="date"
                                placeholder="e.g. July 2025"
                                className="premium-input"
                                value={formData.date || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">
                                <LinkIcon size={16} />
                                Credential URL (Link)
                            </label>
                            <div className="relative">
                                <input
                                    name="credential_url"
                                    placeholder="https://..."
                                    className="premium-input pr-10"
                                    value={formData.credential_url || ""}
                                    onChange={handleChange}
                                />
                                {formData.credential_url && (
                                    <a
                                        href={formData.credential_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700"
                                    >
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">
                                <ImageIcon size={16} />
                                Preview Image (Banner)
                            </label>
                            <input
                                name="image_url"
                                placeholder="/assets/cert-preview.jpg"
                                className="premium-input"
                                value={formData.image_url || ""}
                                onChange={handleChange}
                            />
                            <p className="helper-text">
                                <ShieldCheck size={10} style={{ marginRight: '4px' }} />
                                Used for the hover effect in your About page
                            </p>
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
                                <span>{certId ? "Commit Updates" : "Create Certification"}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .certification-form-container {
                    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
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

                .premium-input {
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

                .premium-input:focus {
                    background: #ffffff;
                    border-color: #3A99C9;
                    box-shadow: 0 0 0 4px rgba(58, 153, 201, 0.15);
                    transform: translateY(-1px);
                }

                .premium-input::placeholder {
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
