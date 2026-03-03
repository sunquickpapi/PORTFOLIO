"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Layout,
    Code,
    Camera,
    Save,
    X,
    Sparkles,
    Type,
    Link as LinkIcon,
    Calendar,
    Image as ImageIcon,
    Layers,
    Zap,
    Target,
    Search,
    Github,
    Globe,
    FileText
} from "lucide-react";

interface ProjectFormProps {
    projectId?: string;
}

function ProjectFormContent({ projectId }: ProjectFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        image_url: "",
        tech_stack: "" as string | string[],
        live_demo_url: "",
        repo_url: "",
        slug: "",
        category: searchParams.get("category") || "Websites",
        challenge: "",
        solution: "",
        preview_images: "" as string | string[],
    });

    useEffect(() => {
        if (projectId) {
            fetchProject();
        }
    }, [projectId]);

    const fetchProject = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}`);
            const data = await res.json();
            setFormData({
                ...data,
                tech_stack: data.tech_stack ? data.tech_stack.join(", ") : "",
                preview_images: data.preview_images ? data.preview_images.join(", ") : "",
            });
        } catch (error) {
            console.error("Error fetching project:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            tech_stack: typeof formData.tech_stack === "string"
                ? formData.tech_stack.split(",").map((s) => s.trim()).filter(Boolean)
                : formData.tech_stack,
            preview_images: typeof formData.preview_images === "string"
                ? formData.preview_images.split(",").map((s) => s.trim()).filter(Boolean)
                : formData.preview_images,
        };

        try {
            const res = await fetch(
                projectId ? `/api/projects/${projectId}` : "/api/projects",
                {
                    method: projectId ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            if (res.ok) {
                router.push("/admin/projects");
                router.refresh();
            } else {
                const errorData = await res.json();
                alert(`Failed to save project: ${errorData.error || res.statusText}`);
            }
        } catch (error) {
            console.error("Error saving project:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading && projectId) return <div className="p-8 text-center text-slate-500 font-medium">Loading project details...</div>;

    return (
        <form onSubmit={handleSubmit} className="premium-form-container">
            <section className="glass-section form-section">
                <div className="section-header">
                    <div className="section-title-box">
                        <Layers size={22} color="#1B4F72" />
                        <h2 className="section-title">Identity & Classification</h2>
                    </div>
                </div>

                <div className="form-grid">
                    <div className="input-group">
                        <label className="input-label">
                            <Type size={16} />
                            Project Title
                        </label>
                        <input
                            name="title"
                            required
                            placeholder="e.g. PPASRATUHUB Application"
                            className="premium-input"
                            value={formData.title || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            <Search size={16} />
                            Slug (Unique URL)
                        </label>
                        <input
                            name="slug"
                            required
                            placeholder="ppasratuhub-app"
                            className="premium-input"
                            value={formData.slug || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            <Target size={16} />
                            Category
                        </label>
                        <select
                            name="category"
                            required
                            className="premium-input select-input"
                            value={formData.category || "Websites"}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="Websites">Websites</option>
                            <option value="Mobile">Mobile</option>
                            <option value="Photography">Photography</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            <Calendar size={16} />
                            Date
                        </label>
                        <input
                            name="date"
                            placeholder="e.g. January 2025"
                            className="premium-input"
                            value={formData.date || ""}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </section>

            <section className="glass-section form-section mt-8">
                <div className="section-header">
                    <div className="section-title-box">
                        <ImageIcon size={22} color="#1B4F72" />
                        <h2 className="section-title">Visual Assets</h2>
                    </div>
                </div>

                <div className="form-grid">
                    <div className="input-group full-width">
                        <label className="input-label">
                            <ImageIcon size={16} />
                            Main Image URL
                        </label>
                        <input
                            name="image_url"
                            className="premium-input"
                            placeholder="/assets/project1.jpg"
                            value={formData.image_url || ""}
                            onChange={handleChange}
                        />
                        <p className="helper-text">Recommendation: Use paths like <code className="code-path">/assets/image.jpg</code></p>
                    </div>

                    <div className="input-group full-width">
                        <label className="input-label">
                            <Layers size={16} />
                            Preview Image URLs (comma separated)
                        </label>
                        <textarea
                            name="preview_images"
                            rows={3}
                            placeholder="/assets/p1.jpg, /assets/p2.jpg"
                            className="premium-input"
                            value={formData.preview_images as string || ""}
                            onChange={handleChange}
                        />
                        <p className="helper-text">Separate multiple high-res gallery items with commas.</p>
                    </div>
                </div>
            </section>

            <section className="glass-section form-section mt-8">
                <div className="section-header">
                    <div className="section-title-box">
                        <FileText size={22} color="#1B4F72" />
                        <h2 className="section-title">Project Narrative</h2>
                    </div>
                </div>

                <div className="form-grid">
                    <div className="input-group full-width">
                        <label className="input-label">
                            <Zap size={16} />
                            The Challenge
                        </label>
                        <textarea
                            name="challenge"
                            rows={4}
                            className="premium-input"
                            value={formData.challenge || ""}
                            onChange={handleChange}
                            placeholder="Define the problem this project was set to solve..."
                        />
                    </div>

                    <div className="input-group full-width">
                        <label className="input-label">
                            <Sparkles size={16} />
                            The Solution
                        </label>
                        <textarea
                            name="solution"
                            rows={4}
                            className="premium-input"
                            value={formData.solution || ""}
                            onChange={handleChange}
                            placeholder="Detail your methodology and the specialized results..."
                        />
                    </div>

                    <div className="input-group full-width">
                        <label className="input-label">
                            <Type size={16} />
                            Short Description (Summary)
                        </label>
                        <textarea
                            name="description"
                            rows={2}
                            className="premium-input"
                            value={formData.description || ""}
                            onChange={handleChange}
                            placeholder="An at-a-glance summary for lists and cards..."
                        />
                    </div>
                </div>
            </section>

            <section className="glass-section form-section mt-8">
                <div className="section-header">
                    <div className="section-title-box">
                        <Code size={22} color="#1B4F72" />
                        <h2 className="section-title">Technical Specification & Links</h2>
                    </div>
                </div>

                <div className="form-grid">
                    <div className="input-group full-width">
                        <label className="input-label">
                            <Code size={16} />
                            Tech Stack (comma separated)
                        </label>
                        <input
                            name="tech_stack"
                            placeholder="React, Next.js, TypeScript, Supabase"
                            className="premium-input"
                            value={formData.tech_stack as string || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            <Globe size={16} />
                            Live Demo URL
                        </label>
                        <input
                            name="live_demo_url"
                            placeholder="https://your-production-link.com"
                            className="premium-input"
                            value={formData.live_demo_url || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            <Github size={16} />
                            Repository URL
                        </label>
                        <input
                            name="repo_url"
                            placeholder="https://github.com/username/project"
                            className="premium-input"
                            value={formData.repo_url || ""}
                            onChange={handleChange}
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
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            <span>{projectId ? "Update Project" : "Finalize & Launch"}</span>
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
                    padding: 2rem;
                    overflow: hidden;
                    transition: transform 0.3s ease;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
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
                    display: flex;
                    align-items: center;
                }

                .form-grid {
                    display: grid;
                    grid-template-cols: 1fr 1fr;
                    gap: 1.5rem;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.6rem;
                }

                .full-width {
                    grid-column: span 2;
                }

                .input-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #475569;
                    letter-spacing: 0.02em;
                }

                .premium-input {
                    padding: 0.85rem 1.25rem;
                    background: rgba(255, 255, 255, 0.8);
                    border: 1.5px solid rgba(27, 79, 114, 0.1);
                    border-radius: 0.85rem;
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

                .select-input {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%231B4F72'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1rem center;
                    background-size: 1.2rem;
                    padding-right: 2.5rem;
                }

                .helper-text {
                    font-size: 0.75rem;
                    color: #64748b;
                    font-style: italic;
                    margin-top: 0.2rem;
                }

                .code-path {
                    background: rgba(58, 153, 201, 0.1);
                    color: #1B4F72;
                    padding: 0.2rem 0.4rem;
                    border-radius: 0.4rem;
                    font-family: monospace;
                    font-weight: 600;
                }

                .form-actions-bar {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1.5rem;
                    margin-top: 2rem;
                    padding-bottom: 2rem;
                }

                .btn-premium-cancel {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 2rem;
                    background: #fff;
                    color: #ef4444;
                    font-weight: 800;
                    border-radius: 1rem;
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
                    padding: 1rem 2.5rem;
                    background: linear-gradient(135deg, #1B4F72 0%, #3A99C9 100%);
                    color: white;
                    font-weight: 800;
                    border-radius: 1rem;
                    border: none;
                    box-shadow: 0 10px 20px -5px rgba(27, 79, 114, 0.3);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: pointer;
                }

                .btn-premium-save:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 15px 25px -5px rgba(27, 79, 114, 0.4);
                }

                .btn-premium-save:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .spinner {
                    width: 20px;
                    height: 20px;
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
                    .page-title {
                        font-size: 2.5rem;
                    }
                }
            `}</style>
        </form>
    );
}

export default function ProjectForm({ projectId }: ProjectFormProps) {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Preparing high-fidelity workspace...</div>}>
            <ProjectFormContent projectId={projectId} />
        </Suspense>
    );
}
