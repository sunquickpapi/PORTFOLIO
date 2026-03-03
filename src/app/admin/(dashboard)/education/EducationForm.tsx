"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    School,
    GraduationCap,
    Calendar,
    ImageIcon,
    BookOpen,
    FileText,
    Save,
    X,
    Plus,
    Edit2,
    Trash2,
    Sparkles,
    Tag,
    Trophy,
    LayoutGrid,
    CheckCircle2
} from "lucide-react";

export default function EducationForm({ id }: { id?: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const defaultFormData = {
        institution: "",
        degree: "",
        years: "",
        description: "",
        logo_url: "",
        coursework: "",
    };
    const [formData, setFormData] = useState(defaultFormData);
    const [activities, setActivities] = useState<any[]>([]);
    const [showActivityForm, setShowActivityForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState<any>(null);
    const [activityForm, setActivityForm] = useState({
        section_name: "",
        title: "",
        tags: "",
        date: "",
        description: "",
    });

    useEffect(() => {
        if (id) {
            fetchEducation();
            fetchActivities();
        }
    }, [id]);

    const fetchEducation = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/education/${id}`);
            if (res.ok) {
                const data = await res.json();
                const sanitizedData = { ...defaultFormData };
                Object.keys(data).forEach(key => {
                    if (data[key] !== null && data[key] !== undefined) {
                        sanitizedData[key as keyof typeof defaultFormData] = data[key];
                    }
                });
                setFormData(sanitizedData);
            }
        } catch (error) {
            console.error("Error fetching education:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchActivities = async () => {
        try {
            const res = await fetch(`/api/education-activities?education_id=${id}`);
            const data = await res.json();
            setActivities(data);
        } catch (error) {
            console.error("Error fetching activities:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { id: _, created_at, updated_at, activities, ...payload } = formData as any;

        try {
            const res = await fetch(id ? `/api/education/${id}` : "/api/education", {
                method: id ? "PUT" : "POST",
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                if (!id) {
                    const newEdu = await res.json();
                    router.push(`/admin/education/${newEdu.id}`);
                } else {
                    router.push("/admin/education");
                }
                router.refresh();
            } else {
                const error = await res.json();
                alert(`Error: ${error.error || "Failed to save"}`);
            }
        } catch (error) {
            console.error("Save failure:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleActivitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(editingActivity ? `/api/education-activities/${editingActivity.id}` : "/api/education-activities", {
                method: editingActivity ? "PUT" : "POST",
                body: JSON.stringify({ ...activityForm, education_id: id }),
            });
            if (res.ok) {
                fetchActivities();
                setShowActivityForm(false);
                setEditingActivity(null);
                setActivityForm({ section_name: "", title: "", tags: "", date: "", description: "" });
            }
        } catch (error) {
            console.error("Activity save failure:", error);
        }
    };

    const deleteActivity = async (aId: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/education-activities/${aId}`, { method: "DELETE" });
            if (res.ok) fetchActivities();
        } catch (error) {
            console.error("Delete failure:", error);
        }
    };

    if (loading && id && formData.institution === "") {
        return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Initializing academic workspace...</div>;
    }

    return (
        <div className="premium-form-layout">
            <form onSubmit={handleSubmit} className="premium-main-form">
                <section className="glass-section">
                    <div className="section-header">
                        <div className="section-title-box">
                            <School size={22} color="#1B4F72" />
                            <h2 className="section-title">Academic Identity</h2>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="input-group">
                            <label className="input-label">
                                <School size={16} />
                                Educational Institution
                            </label>
                            <input
                                name="institution"
                                required
                                placeholder="e.g. Universiti Teknologi MARA..."
                                className="premium-input"
                                value={formData.institution}
                                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">
                                <GraduationCap size={16} />
                                Degree / Certification
                            </label>
                            <input
                                name="degree"
                                required
                                placeholder="e.g. Bachelor of Information Systems..."
                                className="premium-input"
                                value={formData.degree}
                                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">
                                <Calendar size={16} />
                                Academic Period
                            </label>
                            <input
                                name="years"
                                placeholder="e.g. March 2025 - Present"
                                className="premium-input"
                                value={formData.years}
                                onChange={(e) => setFormData({ ...formData, years: e.target.value })}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">
                                <ImageIcon size={16} />
                                Institutional Logo URL
                            </label>
                            <input
                                name="logo_url"
                                placeholder="/assets/uni-logo.png"
                                className="premium-input"
                                value={formData.logo_url}
                                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                            />
                        </div>

                        <div className="input-group full-width">
                            <label className="input-label">
                                <BookOpen size={16} />
                                Specialized Coursework (Comma separated)
                            </label>
                            <textarea
                                name="coursework"
                                placeholder="Machine Learning, Data Mining, Knowledge Based Systems..."
                                rows={2}
                                className="premium-input"
                                value={formData.coursework}
                                onChange={(e) => setFormData({ ...formData, coursework: e.target.value })}
                            />
                            <p className="helper-text">List key modules that highlight your technical expertise.</p>
                        </div>

                        <div className="input-group full-width">
                            <label className="input-label">
                                <FileText size={16} />
                                Academic Narrative
                            </label>
                            <textarea
                                name="description"
                                rows={4}
                                placeholder="Describe your academic journey, honors, or institutional involvement..."
                                className="premium-input"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-actions-bar">
                        <button type="button" onClick={() => router.back()} className="btn-premium-cancel">
                            <X size={20} />
                            <span>Discard</span>
                        </button>
                        <button type="submit" disabled={loading} className="btn-premium-save">
                            {loading ? (
                                <>
                                    <div className="spinner"></div>
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>{id ? "Commit Updates" : "Register Education"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </section>
            </form>

            {id && (
                <section className="glass-section mt-12 activities-center">
                    <div className="section-header">
                        <div className="section-title-box">
                            <LayoutGrid size={22} color="#1B4F72" />
                            <h2 className="section-title">Academic Milestones & Activities</h2>
                        </div>
                        <button
                            onClick={() => { setShowActivityForm(true); setEditingActivity(null); }}
                            className="btn-premium-add"
                        >
                            <Plus size={18} />
                            <span>Add Activity</span>
                        </button>
                    </div>

                    {showActivityForm && (
                        <form onSubmit={handleActivitySubmit} className="activity-form-card">
                            <div className="activity-form-header">
                                <Sparkles size={18} className="text-amber-500" />
                                <h3>{editingActivity ? "Refine Activity" : "New Milestone"}</h3>
                            </div>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label className="input-label">
                                        <Tag size={14} />
                                        Section Category
                                    </label>
                                    <input
                                        required placeholder="e.g. Competitions Involvement"
                                        className="premium-input small"
                                        value={activityForm.section_name}
                                        onChange={(e) => setActivityForm({ ...activityForm, section_name: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">
                                        <Trophy size={14} />
                                        Activity Title
                                    </label>
                                    <input
                                        required placeholder="e.g. PPKomp 2025"
                                        className="premium-input small"
                                        value={activityForm.title}
                                        onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">
                                        <CheckCircle2 size={14} />
                                        Achievement Tags
                                    </label>
                                    <input
                                        placeholder="Second Overall Group"
                                        className="premium-input small"
                                        value={activityForm.tags}
                                        onChange={(e) => setActivityForm({ ...activityForm, tags: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">
                                        <Calendar size={14} />
                                        Date
                                    </label>
                                    <input
                                        placeholder="April 2025"
                                        className="premium-input small"
                                        value={activityForm.date}
                                        onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                                    />
                                </div>
                                <div className="input-group full-width">
                                    <label className="input-label">
                                        <FileText size={14} />
                                        Highlight Description
                                    </label>
                                    <textarea
                                        rows={3} required
                                        placeholder="Detail your role and the impact of this activity..."
                                        className="premium-input small"
                                        value={activityForm.description}
                                        onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="activity-form-actions">
                                <button type="button" onClick={() => setShowActivityForm(false)} className="btn-activity-cancel">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-activity-save">
                                    {editingActivity ? "Update Milestone" : "Save Milestone"}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="activities-grid-container">
                        {activities.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon"><BookOpen size={48} /></div>
                                <p>No specific academic activities recorded yet.</p>
                            </div>
                        ) : (
                            Object.entries(
                                activities.reduce((acc: any, curr: any) => {
                                    if (!acc[curr.section_name]) acc[curr.section_name] = [];
                                    acc[curr.section_name].push(curr);
                                    return acc;
                                }, {})
                            ).map(([section, items]: [string, any]) => (
                                <div key={section} className="activity-section-block">
                                    <div className="section-divider">
                                        <span className="section-label">{section}</span>
                                        <div className="divider-line"></div>
                                    </div>
                                    <div className="activity-cards-grid">
                                        {items.map((item: any) => (
                                            <div key={item.id} className="premium-activity-card group">
                                                <div className="card-top">
                                                    <h4 className="activity-card-title">{item.title}</h4>
                                                    <div className="card-actions">
                                                        <button
                                                            onClick={() => {
                                                                setEditingActivity(item);
                                                                setActivityForm({
                                                                    section_name: item.section_name,
                                                                    title: item.title,
                                                                    tags: item.tags || "",
                                                                    date: item.date || "",
                                                                    description: item.description || ""
                                                                });
                                                                setShowActivityForm(true);
                                                            }}
                                                            className="action-btn edit"
                                                            title="Edit Milestone"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button onClick={() => deleteActivity(item.id)} className="action-btn delete" title="Remove">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                {item.tags && (
                                                    <div className="activity-badge">
                                                        <Trophy size={10} style={{ marginRight: '4px' }} />
                                                        {item.tags}
                                                    </div>
                                                )}
                                                <div className="activity-date">
                                                    <Calendar size={12} style={{ marginRight: '6px' }} />
                                                    {item.date}
                                                </div>
                                                <p className="activity-desc">{item.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            )}

            <style jsx>{`
                .premium-form-layout {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding-bottom: 5rem;
                }

                .glass-section {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                    border-radius: 1.5rem;
                    border: 1px solid rgba(27, 79, 114, 0.1);
                    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
                    padding: 2.5rem;
                    overflow: hidden;
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
                    gap: 0.6rem;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #475569;
                    letter-spacing: 0.02em;
                    text-transform: uppercase;
                }

                .premium-input {
                    padding: 0.85rem 1.25rem;
                    background: rgba(255, 255, 255, 0.8);
                    border: 1.5px solid rgba(27, 79, 114, 0.1);
                    border-radius: 1rem;
                    font-size: 1rem;
                    color: #1e293b;
                    transition: all 0.2s ease;
                    outline: none;
                }

                .premium-input.small {
                    padding: 0.75rem 1rem;
                    font-size: 0.9rem;
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
                    gap: 1.25rem;
                    margin-top: 2.5rem;
                }

                .btn-premium-cancel {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 0.75rem 1.75rem;
                    background: #fff;
                    color: #ef4444;
                    font-weight: 800;
                    border-radius: 1rem;
                    border: 1.5px solid rgba(239, 68, 68, 0.2);
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .btn-premium-cancel:hover {
                    background: #fef2f2;
                    border-color: #ef4444;
                    transform: translateY(-2px);
                }

                .btn-premium-save {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 2.5rem;
                    background: linear-gradient(135deg, #1B4F72 0%, #3A99C9 100%);
                    color: white;
                    font-weight: 800;
                    border-radius: 1rem;
                    border: none;
                    box-shadow: 0 10px 20px -5px rgba(27, 79, 114, 0.25);
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .btn-premium-save:hover {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 15px 30px -5px rgba(27, 79, 114, 0.35);
                }

                /* Activity Styling */

                .btn-premium-add {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #10b981;
                    color: white;
                    padding: 0.6rem 1.25rem;
                    border-radius: 0.75rem;
                    font-weight: 700;
                    font-size: 0.85rem;
                    border: none;
                    box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.3);
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .btn-premium-add:hover {
                    background: #059669;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 15px -2px rgba(16, 185, 129, 0.4);
                }

                .activity-form-card {
                    background: rgba(248, 250, 252, 0.8);
                    border: 1.5px dashed rgba(27, 79, 114, 0.2);
                    border-radius: 1.25rem;
                    padding: 2rem;
                    margin-bottom: 2.5rem;
                    animation: slideIn 0.3s ease-out;
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .activity-form-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .activity-form-header h3 {
                    font-weight: 800;
                    color: #1e293b;
                    font-size: 1.1rem;
                }

                .activity-form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 1.5rem;
                }

                .btn-activity-cancel {
                    padding: 0.5rem 1.25rem;
                    border-radius: 0.5rem;
                    font-weight: 700;
                    color: #64748b;
                    border: 1.5px solid #e2e8f0;
                    background: transparent;
                    cursor: pointer;
                }

                .btn-activity-save {
                    padding: 0.5rem 1.5rem;
                    border-radius: 0.5rem;
                    font-weight: 700;
                    color: white;
                    background: #1B4F72;
                    border: none;
                    cursor: pointer;
                }

                .activity-section-block {
                    margin-top: 2.5rem;
                }

                .section-divider {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    margin-bottom: 1.5rem;
                }

                .section-label {
                    white-space: nowrap;
                    font-weight: 800;
                    font-size: 0.85rem;
                    color: #3A99C9;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .divider-line {
                    height: 1px;
                    background: linear-gradient(to right, rgba(58, 153, 201, 0.2), transparent);
                    flex-grow: 1;
                }

                .activity-cards-grid {
                    display: grid;
                    grid-template-cols: repeat(auto-fill, minmax(400px, 1fr));
                    gap: 1.5rem;
                }

                .premium-activity-card {
                    background: white;
                    border: 1px solid rgba(27, 79, 114, 0.08);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px -5px rgba(0, 0, 0, 0.02);
                }

                .premium-activity-card:hover {
                    border-color: rgba(58, 153, 201, 0.3);
                    box-shadow: 0 10px 25px -10px rgba(27, 79, 114, 0.1);
                    transform: translateY(-4px);
                }

                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.75rem;
                }

                .activity-card-title {
                    font-weight: 800;
                    font-size: 1.1rem;
                    color: #0f172a;
                    line-height: 1.3;
                }

                .card-actions {
                    display: flex;
                    gap: 0.5rem;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .premium-activity-card:hover .card-actions {
                    opacity: 1;
                }

                .action-btn {
                    padding: 0.4rem;
                    border-radius: 0.5rem;
                    border: 1px solid #e2e8f0;
                    background: #f8fafc;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .action-btn.edit { color: #1B4F72; }
                .action-btn.delete { color: #ef4444; }
                .action-btn:hover { background: #fff; transform: scale(1.1); }

                .activity-badge {
                    display: inline-flex;
                    align-items: center;
                    background: #f1f5f9;
                    color: #334155;
                    padding: 0.2rem 0.6rem;
                    border-radius: 0.4rem;
                    font-size: 0.7rem;
                    font-weight: 800;
                    margin-bottom: 0.75rem;
                }

                .activity-date {
                    display: flex;
                    align-items: center;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #94a3b8;
                    margin-bottom: 0.75rem;
                }

                .activity-desc {
                    font-size: 0.9rem;
                    color: #64748b;
                    line-height: 1.6;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: #94a3b8;
                }

                .empty-icon {
                    margin-bottom: 1rem;
                    opacity: 0.3;
                    display: flex;
                    justify-content: center;
                }

                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin { to { transform: rotate(360deg); } }

                @media (max-width: 768px) {
                    .form-grid { grid-template-cols: 1fr; }
                    .full-width { grid-column: span 1; }
                    .activity-cards-grid { grid-template-cols: 1fr; }
                }
            `}</style>
        </div>
    );
}
