"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Code, Sparkles, X, Save, Layout, Image as ImageIcon, ChevronDown, ChevronRight, StickyNote } from "lucide-react";

interface Snippet {
    id: string;
    title: string;
    description: string;
    code: string;
    language: string;
    category: string;
    tags: string;
    preview_image_url?: string;
    playground_url?: string;
    integration_vanilla?: string;
    integration_react?: string;
}

interface Note {
    id: string;
    title: string;
    content: string;
    type: string;
    color: string;
    pinned: boolean;
    created_at?: string;
}

const NOTE_TYPES = ["general", "idea", "bug", "todo", "learning", "reminder"];
const NOTE_COLORS = ["#3A99C9", "#22c55e", "#f97316", "#7c3aed", "#ef4444", "#eab308"];
const NOTE_TYPE_ICONS: Record<string, string> = { idea: "💡", bug: "🐛", todo: "✅", learning: "📚", reminder: "🔔", general: "📝" };

export default function SnippetsPage() {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [settings, setSettings] = useState({
        hero_title: "",
        hero_subtitle: "",
        hero_value_prop: "",
        hero_image_url: ""
    });
    const [notes, setNotes] = useState<Note[]>([]);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [noteFormLoading, setNoteFormLoading] = useState(false);
    const [noteFormError, setNoteFormError] = useState<string | null>(null);
    const [noteFormData, setNoteFormData] = useState({ title: "", content: "", type: "general", color: "#3A99C9", pinned: false });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"hero" | "list" | "notes">("hero");
    const [savingSettings, setSavingSettings] = useState(false);
    const [isEditingSettings, setIsEditingSettings] = useState(false);
    const [uploadingHeroPic, setUploadingHeroPic] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        code: "",
        language: "javascript",
        category: "utility",
        tags: "",
        preview_image_url: "",
        playground_url: "",
        integration_vanilla: "",
        integration_react: "",
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [snipRes, setRes, notesRes] = await Promise.all([
                fetch("/api/snippets"),
                fetch("/api/snippets-settings"),
                fetch("/api/notes")
            ]);
            const snipData = await snipRes.json();
            const setData = await setRes.json();
            const notesData = await notesRes.json();
            setSnippets(snipData);
            setSettings(setData);
            if (Array.isArray(notesData)) setNotes(notesData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSnippets = async () => {
        try {
            const res = await fetch("/api/snippets");
            const data = await res.json();
            setSnippets(data);
        } catch (error) {
            console.error("Error fetching snippets:", error);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            const res = await fetch("/api/snippets-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                alert("Settings saved successfully!");
                setIsEditingSettings(false);
            } else {
                alert("Failed to save settings");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
        } finally {
            setSavingSettings(false);
        }
    };

    const handleHeroPicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingHeroPic(true);
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: uploadFormData,
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Upload failed");
            }

            const data = await res.json();
            setSettings(prev => ({ ...prev, hero_image_url: data.url }));
        } catch (error: any) {
            console.error("Error uploading hero picture:", error);
            alert(error.message || "Failed to upload hero picture");
        } finally {
            setUploadingHeroPic(false);
        }
    };

    const handleRemoveHeroPic = () => {
        setSettings(prev => ({ ...prev, hero_image_url: "" }));
    };

    const handleOpenAddModal = () => {
        setEditingSnippet(null);
        setFormError(null);
        setFormData({
            title: "",
            description: "",
            code: "",
            language: "javascript",
            category: "utility",
            tags: "",
            preview_image_url: "",
            playground_url: "",
            integration_vanilla: "",
            integration_react: "",
        });
        setShowModal(true);
    };

    const handleOpenEditModal = (snippet: Snippet) => {
        setEditingSnippet(snippet);
        setFormError(null);
        setFormData({
            title: snippet.title,
            description: snippet.description || "",
            code: snippet.code,
            language: snippet.language,
            category: snippet.category || "utility",
            tags: snippet.tags || "",
            preview_image_url: snippet.preview_image_url || "",
            playground_url: snippet.playground_url || "",
            integration_vanilla: snippet.integration_vanilla || "",
            integration_react: snippet.integration_react || "",
        });
        setShowModal(true);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setFormError(null);

        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: uploadFormData,
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Upload failed");
            }

            const data = await res.json();
            setFormData(prev => ({ ...prev, preview_image_url: data.url }));
        } catch (error: any) {
            console.error("Error uploading file:", error);
            setFormError(error.message || "Failed to upload file");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveFile = () => {
        setFormData(prev => ({ ...prev, preview_image_url: "" }));
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this snippet?")) return;
        try {
            const res = await fetch(`/api/snippets/${id}`, { method: "DELETE" });
            if (res.ok) {
                setSnippets(snippets.filter((s) => s.id !== id));
            }
        } catch (error) {
            console.error("Error deleting snippet:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);

        try {
            const res = await fetch(
                editingSnippet ? `/api/snippets/${editingSnippet.id}` : "/api/snippets",
                {
                    method: editingSnippet ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            if (res.ok) {
                setShowModal(false);
                fetchSnippets();
            } else {
                const errData = await res.json();
                setFormError(errData.error || "Failed to save snippet. Please verify your database connection.");
            }
        } catch (error: any) {
            console.error("Error saving snippet:", error);
            setFormError(error.message || "An unexpected network error occurred.");
        } finally {
            setFormLoading(false);
        }
    };

    const toggleCategory = (cat: string) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [cat]: !prev[cat],
        }));
    };

    const categories = Array.from(new Set(snippets.map((s) => s.category || "utility")));

    if (loading) return (
        <div className="loading-state">
            <div className="spinner"></div>
            <span>Syncing Code Library...</span>
            <style jsx>{`
                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: calc(100vh - 100px);
                    gap: 1rem;
                    color: #1B4F72;
                    font-weight: 700;
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

    return (
        <div className="snippets-hub-wrapper">
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            <header className="page-header">
                <div className="header-top">
                    <div className="header-badge">
                        <Sparkles size={15} style={{ marginRight: '6px' }} />
                        Code Library
                    </div>
                </div>
                <div className="title-row">
                    <h1 className="page-title">
                        Manage <span className="gradient-text">Snippets</span>
                    </h1>
                </div>
                <p className="page-subtitle">Organize and share reusable code fragments and helper utilities.</p>
            </header>

            <div className="content-container">
                {/* Tabs Navigation */}
                <div className="tabs-container">
                    <div className="tabs-nav">
                        <button
                            onClick={() => setActiveTab("hero")}
                            className={`tab-item ${activeTab === "hero" ? "active" : ""}`}
                        >
                            <Layout size={24} />
                            <span>Hero Banner</span>
                            {activeTab === "hero" && <div className="tab-indicator" />}
                        </button>
                        <button
                            onClick={() => setActiveTab("list")}
                            className={`tab-item ${activeTab === "list" ? "active" : ""}`}
                        >
                            <Code size={24} />
                            <span>Code Snippets</span>
                            {activeTab === "list" && <div className="tab-indicator" />}
                        </button>
                        <button
                            onClick={() => setActiveTab("notes")}
                            className={`tab-item ${activeTab === "notes" ? "active" : ""}`}
                        >
                            <StickyNote size={24} />
                            <span>Dev Notes</span>
                            {activeTab === "notes" && <div className="tab-indicator" />}
                        </button>
                    </div>
                </div>

                {/* Tab: Hero Banner Settings */}
                {activeTab === "hero" && (
                    <div className="glass-section settings-section mb-8">
                        <div className="section-header">
                            <div className="section-title-box">
                                <Layout size={22} color="#1B4F72" />
                                <h2 className="section-title">Snippets Hero Settings</h2>
                            </div>
                            <button
                                onClick={() => setIsEditingSettings(!isEditingSettings)}
                                className={`btn-edit-toggle ${isEditingSettings ? 'active' : ''}`}
                            >
                                {isEditingSettings ? <X size={20} /> : <Edit size={20} />}
                                <span>{isEditingSettings ? "Cancel" : "Edit Settings"}</span>
                            </button>
                        </div>

                        <form onSubmit={handleSaveSettings} className="premium-form">
                            <div className="form-grid">
                                <div className="input-group">
                                    <label>Hero Main Title</label>
                                    <input
                                        value={settings.hero_title || ""}
                                        onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                                        placeholder="e.g., Snippet Gallery"
                                        readOnly={!isEditingSettings}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Hero Subtitle</label>
                                    <input
                                        value={settings.hero_subtitle || ""}
                                        onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                                        placeholder="e.g., Curated Reusable Code Gallery"
                                        readOnly={!isEditingSettings}
                                    />
                                </div>
                                <div className="input-group full-width">
                                    <label>Value Proposition</label>
                                    <textarea
                                        rows={3}
                                        value={settings.hero_value_prop || ""}
                                        onChange={(e) => setSettings({ ...settings, hero_value_prop: e.target.value })}
                                        placeholder="A comprehensive vault of reusable code fragments..."
                                        readOnly={!isEditingSettings}
                                    />
                                </div>
                                <div className="input-group full-width">
                                    <label>Hero Background Image (Header Pic)</label>
                                    <div className="file-uploader-container">
                                        {settings.hero_image_url ? (
                                            <div className="file-preview-box" style={{ maxWidth: '400px' }}>
                                                <img
                                                    src={settings.hero_image_url}
                                                    alt="Hero Background"
                                                    className="uploaded-preview-media"
                                                    style={{ height: '180px', width: '100%', objectFit: 'cover' }}
                                                />
                                                <div className="file-preview-info">
                                                    <span className="file-preview-path truncate">{settings.hero_image_url}</span>
                                                    {isEditingSettings && (
                                                        <button
                                                            type="button"
                                                            onClick={handleRemoveHeroPic}
                                                            className="btn-remove-file"
                                                        >
                                                            Remove Image
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="file-upload-dropzone" style={{ maxWidth: '400px', minHeight: '120px' }}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleHeroPicChange}
                                                    style={{ display: "none" }}
                                                    disabled={uploadingHeroPic || !isEditingSettings}
                                                />
                                                <div className="dropzone-content">
                                                    <Plus size={20} className="dropzone-icon" />
                                                    <span>{uploadingHeroPic ? "Uploading image..." : "Click to select image"}</span>
                                                </div>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {isEditingSettings && (
                                <div className="form-footer">
                                    <button
                                        type="submit"
                                        disabled={savingSettings}
                                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexDirection: 'row', whiteSpace: 'nowrap' }}
                                        className="btn-premium-save"
                                    >
                                        <Save size={22} />
                                        <span>{savingSettings ? "Saving..." : "Save Settings"}</span>
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                )}

                {/* Tab: Code Snippets List */}
                {activeTab === "list" && (
                    <>
                        <div className="top-actions">
                            <button
                                onClick={handleOpenAddModal}
                                id="btn-add-snippet"
                                className="btn-premium-add"
                            >
                                <Plus size={22} />
                                <span>Add New Snippet</span>
                            </button>
                        </div>

                        <div className="snippets-list-section">
                            {categories.length === 0 ? (
                                <div className="glass-section">
                                    <div className="section-header">
                                        <div className="section-title-box">
                                            <Code size={22} color="#1B4F72" />
                                            <h2 className="section-title">All Code Snippets</h2>
                                        </div>
                                        <span className="item-count">0 Snippets</span>
                                    </div>
                                    <div className="empty-state">
                                        <Code size={64} className="empty-icon" />
                                        <p>No snippets found. Click the button above to add one!</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="categories-stack">
                                    {categories.map((cat) => {
                                        const filteredSnippets = snippets.filter((s) => (s.category || "utility") === cat);
                                        const isExpanded = !!expandedCategories[cat];
                                        return (
                                            <div key={cat} className="glass-section category-section">
                                                <div 
                                                    className="section-header cursor-pointer select-none hover:bg-slate-50/50 transition-colors duration-150"
                                                    onClick={() => toggleCategory(cat)}
                                                    style={{ cursor: "pointer", borderBottom: isExpanded ? "1px solid rgba(0,0,0,0.03)" : "none" }}
                                                >
                                                    <div className="section-title-box">
                                                        {isExpanded ? <ChevronDown size={16} color="#1B4F72" /> : <ChevronRight size={16} color="#1B4F72" />}
                                                        <h2 className="section-title" style={{ textTransform: 'capitalize' }}>{cat}</h2>
                                                    </div>
                                                    <span className="item-count">
                                                        {filteredSnippets.length} Snippets
                                                    </span>
                                                </div>

                                                {isExpanded && (
                                                    <div className="snippets-grid">
                                                        {filteredSnippets.map((snippet) => (
                                                            <div key={snippet.id} className="snippet-card">
                                                                <div className="card-info">
                                                                    <div className="title-group">
                                                                        <span className="lang-tag">{snippet.language}</span>
                                                                        <h3 className="snippet-title">{snippet.title}</h3>
                                                                    </div>
                                                                    <p className="snippet-desc">{snippet.description}</p>
                                                                    {snippet.tags && (
                                                                        <div className="tags-container">
                                                                            {snippet.tags.split(",").map((tag) => (
                                                                                <span key={tag} className="tag">#{tag.trim()}</span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="card-actions">
                                                                    <button onClick={() => handleOpenEditModal(snippet)} className="icon-btn edit" title="Edit Snippet">
                                                                        <Edit size={18} />
                                                                    </button>
                                                                    <button onClick={() => handleDelete(snippet.id)} className="icon-btn delete" title="Delete Snippet">
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Tab: Dev Notes */}
                {activeTab === "notes" && (
                    <>
                        <div className="top-actions">
                            <button onClick={() => { setEditingNote(null); setNoteFormError(null); setNoteFormData({ title: "", content: "", type: "general", color: "#3A99C9", pinned: false }); setShowNoteModal(true); }} className="btn-premium-add">
                                <Plus size={22} />
                                <span>Add New Note</span>
                            </button>
                        </div>

                        <div className="glass-section mb-8">
                            <div className="section-header">
                                <div className="section-title-box">
                                    <StickyNote size={22} color="#1B4F72" />
                                    <h2 className="section-title">Dev Notes</h2>
                                </div>
                                <span className="item-count">{notes.length} Notes</span>
                            </div>

                            {notes.length === 0 ? (
                                <div className="empty-state">
                                    <StickyNote size={64} className="empty-icon" />
                                    <p>No notes yet. Click the button above to add one!</p>
                                </div>
                            ) : (
                                <div className="snippets-grid">
                                    {notes.map((note) => (
                                        <div key={note.id} className="snippet-card" style={{ borderLeft: `4px solid ${note.color || '#3A99C9'}` }}>
                                            <div className="card-info">
                                                <div className="title-group">
                                                    <span className="lang-tag" style={{ background: `${note.color}20`, color: note.color }}>
                                                        {NOTE_TYPE_ICONS[note.type] || "📝"} {note.type}
                                                    </span>
                                                    {note.pinned && <span className="lang-tag" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', marginLeft: '0.25rem' }}>📌 Pinned</span>}
                                                </div>
                                                <h3 className="snippet-title">{note.title}</h3>
                                                {note.content && <p className="snippet-desc">{note.content}</p>}
                                            </div>
                                            <div className="card-actions">
                                                <button onClick={() => {
                                                    setEditingNote(note);
                                                    setNoteFormError(null);
                                                    setNoteFormData({ title: note.title, content: note.content || "", type: note.type, color: note.color || "#3A99C9", pinned: note.pinned });
                                                    setShowNoteModal(true);
                                                }} className="icon-btn edit" title="Edit Note">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={async () => {
                                                    if (!confirm("Delete this note?")) return;
                                                    const res = await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
                                                    if (res.ok) setNotes(notes.filter(n => n.id !== note.id));
                                                }} className="icon-btn delete" title="Delete Note">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Snippet Form Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-card glass-modal">
                        <div className="modal-header">
                            <div className="header-title">
                                <Code size={20} />
                                <h3>{editingSnippet ? "Edit Snippet" : "Add New Snippet"}</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="close-btn">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            {formError && (
                                <div className="form-error-msg">
                                    ⚠️ {formError}
                                </div>
                            )}
                            <div className="form-group">
                                <label className="input-label">Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Debounce Helper Function"
                                    className="premium-input font-bold"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="input-label">Description</label>
                                <input
                                    type="text"
                                    placeholder="Brief description of what this code does"
                                    className="premium-input"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group-row">
                                <div className="form-group half">
                                    <label className="input-label">Language</label>
                                    <select
                                        className="premium-input"
                                        value={formData.language}
                                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                    >
                                        <option value="javascript">JavaScript</option>
                                        <option value="typescript">TypeScript</option>
                                        <option value="python">Python</option>
                                        <option value="css">CSS</option>
                                        <option value="html">HTML</option>
                                        <option value="bash">Bash</option>
                                        <option value="sql">SQL</option>
                                        <option value="json">JSON</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group half">
                                    <label className="input-label">Category</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g., utility, hook, animation..."
                                        className="premium-input"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="input-label">Tags (Comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="e.g., hooks, utility, styling"
                                    className="premium-input"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="input-label">Playground File / URL</label>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <select
                                            className="premium-input"
                                            style={{ flex: 1 }}
                                            value={
                                                formData.playground_url === "" ? "none" :
                                                formData.playground_url === "/snippet-playground/preview-scroll.html" ? "scroll" :
                                                formData.playground_url === "/snippet-playground/preview-magnetic.html" ? "magnetic" :
                                                formData.playground_url === "/snippet-playground/preview-clipboard.html" ? "clipboard" :
                                                formData.playground_url === "/snippet-playground/preview-debounce.html" ? "debounce" :
                                                formData.playground_url === "/snippet-playground/preview-glass.html" ? "glass" : "custom"
                                            }
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === "none") setFormData({ ...formData, playground_url: "" });
                                                else if (val === "scroll") setFormData({ ...formData, playground_url: "/snippet-playground/preview-scroll.html" });
                                                else if (val === "magnetic") setFormData({ ...formData, playground_url: "/snippet-playground/preview-magnetic.html" });
                                                else if (val === "clipboard") setFormData({ ...formData, playground_url: "/snippet-playground/preview-clipboard.html" });
                                                else if (val === "debounce") setFormData({ ...formData, playground_url: "/snippet-playground/preview-debounce.html" });
                                                else if (val === "glass") setFormData({ ...formData, playground_url: "/snippet-playground/preview-glass.html" });
                                            }}
                                        >
                                            <option value="none">None / Default Fallback</option>
                                            <option value="scroll">Scroll Reveal</option>
                                            <option value="magnetic">Magnetic Hover</option>
                                            <option value="clipboard">Clipboard Copy</option>
                                            <option value="debounce">Debounce Input</option>
                                            <option value="glass">Glassmorphism Card</option>
                                            <option value="custom">Custom Path / Upload...</option>
                                        </select>
                                        <label className="btn-premium-cancel" style={{ cursor: 'pointer', margin: 0, whiteSpace: 'nowrap' }}>
                                            <Plus size={16} />
                                            <span>Upload HTML</span>
                                            <input type="file" accept=".html,.htm" style={{ display: 'none' }} onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const fd = new FormData();
                                                fd.append("file", file);
                                                try {
                                                    const res = await fetch("/api/upload", { method: "POST", body: fd });
                                                    if (res.ok) {
                                                        const data = await res.json();
                                                        setFormData(prev => ({ ...prev, playground_url: data.url }));
                                                    }
                                                } catch (err) { console.error("Upload failed:", err); }
                                            }} />
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="URL path (e.g., /snippet-playground/preview-glass.html)"
                                        className="premium-input"
                                        value={formData.playground_url}
                                        onChange={(e) => setFormData({ ...formData, playground_url: e.target.value })}
                                        style={{ fontFamily: "'Geist Mono', monospace", fontSize: "0.8rem" }}
                                    />
                                </div>
                            </div>
                            <div className="form-group code-group">
                                <label className="input-label">Code Block</label>
                                <textarea
                                    required
                                    rows={8}
                                    placeholder="Paste code here..."
                                    className="premium-input font-mono"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    style={{ fontFamily: "monospace", tabSize: 2 }}
                                />
                            </div>
                            <div className="form-group code-group">
                                <label className="input-label">Integration Code — HTML/CSS/JS (Vanilla)</label>
                                <textarea
                                    rows={6}
                                    placeholder="Paste the HTML/CSS/JS integration example here... (optional)"
                                    className="premium-input font-mono"
                                    value={formData.integration_vanilla}
                                    onChange={(e) => setFormData({ ...formData, integration_vanilla: e.target.value })}
                                    style={{ fontFamily: "monospace", tabSize: 2, fontSize: "0.85rem" }}
                                />
                            </div>
                            <div className="form-group code-group">
                                <label className="input-label">Integration Code — React / TSX</label>
                                <textarea
                                    rows={6}
                                    placeholder="Paste the React/TSX integration example here... (optional)"
                                    className="premium-input font-mono"
                                    value={formData.integration_react}
                                    onChange={(e) => setFormData({ ...formData, integration_react: e.target.value })}
                                    style={{ fontFamily: "monospace", tabSize: 2, fontSize: "0.85rem" }}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-premium-cancel">
                                    <X size={16} />
                                    <span>Cancel</span>
                                </button>
                                <button type="submit" disabled={formLoading} className="btn-premium-save">
                                    <Save size={16} />
                                    <span>{formLoading ? "Saving..." : "Save Snippet"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Note Form Modal */}
            {showNoteModal && (
                <div className="modal-overlay">
                    <div className="modal-card glass-modal">
                        <div className="modal-header">
                            <div className="header-title">
                                <StickyNote size={20} />
                                <h3>{editingNote ? "Edit Note" : "Add New Note"}</h3>
                            </div>
                            <button onClick={() => setShowNoteModal(false)} className="close-btn"><X size={20} /></button>
                        </div>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setNoteFormLoading(true);
                            setNoteFormError(null);
                            try {
                                const res = await fetch(
                                    editingNote ? `/api/notes/${editingNote.id}` : "/api/notes",
                                    {
                                        method: editingNote ? "PUT" : "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(noteFormData),
                                    }
                                );
                                if (res.ok) {
                                    setShowNoteModal(false);
                                    const updated = await fetch("/api/notes").then(r => r.json());
                                    if (Array.isArray(updated)) setNotes(updated);
                                } else {
                                    const err = await res.json();
                                    setNoteFormError(err.error || "Failed to save note.");
                                }
                            } catch (err: any) {
                                setNoteFormError(err.message || "Network error.");
                            } finally {
                                setNoteFormLoading(false);
                            }
                        }} className="modal-form">
                            {noteFormError && <div className="form-error-msg">⚠️ {noteFormError}</div>}
                            <div className="form-group">
                                <label className="input-label">Title</label>
                                <input type="text" required placeholder="e.g., Refactor auth middleware" className="premium-input font-bold" value={noteFormData.title} onChange={(e) => setNoteFormData({ ...noteFormData, title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="input-label">Content</label>
                                <textarea rows={3} placeholder="Note details..." className="premium-input" value={noteFormData.content} onChange={(e) => setNoteFormData({ ...noteFormData, content: e.target.value })} />
                            </div>
                            <div className="form-group-row">
                                <div className="form-group half">
                                    <label className="input-label">Type</label>
                                    <input
                                        type="text"
                                        list="note-type-suggestions"
                                        className="premium-input"
                                        placeholder="e.g., idea, bug, todo..."
                                        value={noteFormData.type}
                                        onChange={(e) => setNoteFormData({ ...noteFormData, type: e.target.value.toLowerCase() })}
                                    />
                                    <datalist id="note-type-suggestions">
                                        {Array.from(new Set([
                                            ...NOTE_TYPES,
                                            ...notes.map(n => n.type).filter(Boolean)
                                        ])).map(t => (
                                            <option key={t} value={t}>{NOTE_TYPE_ICONS[t] || "📝"} {t}</option>
                                        ))}
                                    </datalist>
                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                        Pick from suggestions or type your own
                                    </span>
                                </div>
                                <div className="form-group half">
                                    <label className="input-label">Color</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                        {NOTE_COLORS.map(c => (
                                            <button key={c} type="button" onClick={() => setNoteFormData({ ...noteFormData, color: c })} style={{
                                                width: 28, height: 28, borderRadius: 8, background: c, border: noteFormData.color === c ? '3px solid #1B4F72' : '2px solid transparent',
                                                cursor: 'pointer', transition: 'all 0.2s', transform: noteFormData.color === c ? 'scale(1.15)' : 'scale(1)',
                                            }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={noteFormData.pinned} onChange={(e) => setNoteFormData({ ...noteFormData, pinned: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#1B4F72' }} />
                                    <span className="input-label" style={{ margin: 0 }}>📌 Pin this note</span>
                                </label>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowNoteModal(false)} className="btn-premium-cancel"><X size={16} /><span>Cancel</span></button>
                                <button type="submit" disabled={noteFormLoading} className="btn-premium-save"><Save size={16} /><span>{noteFormLoading ? "Saving..." : "Save Note"}</span></button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .snippets-hub-wrapper {
                    animation: fadeIn 0.8s ease-out;
                    padding: 2.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    width: 100%;
                    min-height: calc(100vh - 80px);
                }

                .form-error-msg {
                    background: rgba(239, 68, 68, 0.08);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                    padding: 0.8rem 1.2rem;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    line-height: 1.5;
                    width: 100%;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Background Blobs */
                .bg-blob {
                    position: fixed;
                    width: 600px;
                    height: 600px;
                    border-radius: 50%;
                    filter: blur(80px);
                    z-index: -1;
                    opacity: 0.15;
                    animation: blobFloat 20s infinite alternate;
                }

                .blob-1 {
                    background: #1B4F72;
                    top: -100px;
                    right: -100px;
                }

                .blob-2 {
                    background: #3A99C9;
                    bottom: -150px;
                    left: -100px;
                    animation-delay: -5s;
                }

                @keyframes blobFloat {
                    from { transform: translate(0, 0) scale(1); }
                    to { transform: translate(40px, 40px) scale(1.1); }
                }

                .content-container {
                    width: 100%;
                    max-width: 1400px;
                    z-index: 1;
                }

                /* Header Styling */
                .page-header {
                    text-align: center;
                    margin-bottom: 3.5rem;
                }

                .header-top {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                }

                .header-badge {
                    display: inline-flex;
                    align-items: center;
                    background: rgba(27, 79, 114, 0.05);
                    color: #1B4F72;
                    padding: 0.5rem 1rem;
                    border-radius: 2rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    border: 1px solid rgba(27, 79, 114, 0.1);
                }

                .page-title {
                    font-size: 3.5rem;
                    font-weight: 900;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                    margin-bottom: 1rem;
                }

                .gradient-text {
                    background: linear-gradient(135deg, #1B4F72 0%, #3A99C9 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .page-subtitle {
                    font-size: 1.15rem;
                    color: #64748b;
                    max-width: 600px;
                    margin: 0 auto;
                    line-height: 1.6;
                }

                /* Actions */
                .top-actions {
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 2rem;
                }

                .btn-premium-add {
                    padding: 0.8rem 1.8rem;
                    background: linear-gradient(135deg, #1B4F72 0%, #3A99C9 100%);
                    color: white !important;
                    border-radius: 1.5rem;
                    font-size: 0.9rem;
                    font-weight: 850;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-decoration: none !important;
                    box-shadow: 0 4px 15px rgba(27, 79, 114, 0.15);
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
                    border: none;
                    cursor: pointer;
                }

                .btn-premium-add:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 12px 25px rgba(27, 79, 114, 0.25) !important;
                    filter: brightness(1.1);
                }

                /* Glass Sections */
                .glass-section {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    border-radius: 2.5rem;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.03);
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .categories-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .category-section {
                    border-radius: 0.75rem;
                }

                .category-section .section-header {
                    padding: 0.45rem 1.25rem;
                }

                .category-section .section-title {
                    font-size: 0.95rem;
                    font-weight: 750;
                }

                .category-section .section-title-box {
                    gap: 0.5rem;
                }

                .category-section .snippets-grid {
                    padding: 1rem 1.25rem;
                }

                .category-section .item-count {
                    font-size: 0.7rem;
                    padding: 0.15rem 0.45rem;
                }

                .section-header {
                    padding: 2rem 2.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(0,0,0,0.03);
                    margin: 0;
                }

                .section-title-box {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .section-title {
                    font-size: 1.35rem;
                    font-weight: 850;
                    color: #1B4F72;
                    margin: 0;
                }

                .item-count {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #94a3b8;
                    background: #f1f5f9;
                    padding: 0.4rem 0.8rem;
                    border-radius: 1rem;
                }

                /* Grid Layout & Cards */
                .snippets-grid {
                    padding: 2rem 2.5rem;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                }

                .snippet-card {
                    background: #f8fafc;
                    padding: 1.5rem;
                    border-radius: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    gap: 1.25rem;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 1px solid transparent;
                }

                .snippet-card:hover {
                    background: white;
                    transform: scale(1.03) translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.06);
                    border-color: rgba(58, 153, 201, 0.15);
                }

                .card-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .title-group {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.5rem;
                }

                .lang-tag {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    background: rgba(27, 79, 114, 0.08);
                    color: #1B4F72;
                    font-weight: 800;
                    padding: 0.25rem 0.75rem;
                    border-radius: 0.5rem;
                    letter-spacing: 0.05em;
                    display: inline-block;
                }

                .snippet-title {
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0;
                    line-height: 1.4;
                }

                .snippet-desc {
                    font-size: 0.9rem;
                    color: #64748b;
                    margin: 0;
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .tags-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.4rem;
                }

                .tags-container .tag {
                    font-size: 0.75rem;
                    color: #64748b;
                    background: #f1f5f9;
                    padding: 0.2rem 0.5rem;
                    border-radius: 0.35rem;
                    font-weight: 600;
                }

                .card-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    border-top: 1px solid rgba(0,0,0,0.03);
                    padding-top: 1rem;
                    width: 100%;
                }

                .icon-btn {
                    width: 38px;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 0.75rem;
                    border: 1px solid #dbeafe;
                    background: #eff6ff;
                    color: #3b82f6;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .icon-btn:hover {
                    background: #dbeafe;
                    border-color: #3b82f6;
                    transform: translateY(-2px);
                }

                .icon-btn.delete {
                    background: #fef2f2;
                    border-color: #fecaca;
                    color: #ef4444;
                }

                .icon-btn.delete:hover {
                    background: #fee2e2;
                    border-color: #ef4444;
                }

                .empty-state {
                    padding: 5rem 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                    text-align: center;
                    color: #94a3b8;
                }

                .empty-icon {
                    color: #cbd5e1;
                    opacity: 0.5;
                }

                /* Modal Styling */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.3);
                    backdrop-filter: blur(8px);
                    z-index: 100;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                    animation: fadeIn 0.3s ease-out;
                }

                .glass-modal {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    border-radius: 2rem;
                    box-shadow: 0 30px 70px rgba(15, 23, 42, 0.15);
                    width: 100%;
                    max-width: 650px;
                    max-height: calc(100vh - 4rem);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    color: #1e293b;
                    animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes scaleUp {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }

                .modal-header {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-shrink: 0;
                }

                .header-title {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: #1B4F72;
                }

                .header-title h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 850;
                }

                .close-btn {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: color 0.3s ease;
                }

                .close-btn:hover {
                    color: #475569;
                }

                .modal-form {
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    overflow-y: auto;
                    flex: 1;
                }

                .modal-form::-webkit-scrollbar {
                    width: 6px;
                }
                .modal-form::-webkit-scrollbar-track {
                    background: transparent;
                }
                .modal-form::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 9999px;
                }
                :global(.admin-dark-mode) .modal-form::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.6rem;
                }

                .form-group-row {
                    display: flex;
                    gap: 1.25rem;
                }

                .form-group.half {
                    flex: 1;
                }

                .input-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    font-weight: 750;
                    letter-spacing: 0.05em;
                    color: #475569;
                }

                .premium-input {
                    width: 100%;
                    padding: 0.8rem 1.2rem;
                    background: rgba(255, 255, 255, 0.85);
                    border: 2px solid rgba(226, 232, 240, 0.8);
                    border-radius: 12px;
                    font-size: 0.95rem;
                    color: #1e293b;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    outline: none;
                }

                .premium-input:focus {
                    background: #ffffff;
                    border-color: #3A99C9;
                    box-shadow: 0 0 0 4px rgba(58, 153, 201, 0.12);
                    transform: translateY(-1px);
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .btn-premium-cancel {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 0.75rem 1.5rem;
                    background: #ffffff;
                    border: 2px solid #e2e8f0;
                    border-radius: 14px;
                    color: #64748b;
                    font-weight: 700;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .btn-premium-cancel:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                    color: #475569;
                    transform: translateY(-1px);
                }

                .btn-premium-save {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 0.75rem 1.75rem;
                    background: linear-gradient(135deg, #1B4F72 0%, #3A99C9 100%);
                    border: none;
                    border-radius: 14px;
                    color: white;
                    font-weight: 700;
                    font-size: 0.9rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(27, 79, 114, 0.2);
                }

                .btn-premium-save:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 18px rgba(27, 79, 114, 0.3);
                }

                .btn-premium-save:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                /* Dark Mode scoped overrides */
                :global(.admin-dark-mode) .snippet-card {
                    background: rgba(30, 41, 59, 0.4);
                    border-color: rgba(255, 255, 255, 0.05);
                }

                :global(.admin-dark-mode) .snippet-card:hover {
                    background: rgba(30, 41, 59, 0.7);
                    border-color: rgba(56, 189, 248, 0.3);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.3);
                }

                :global(.admin-dark-mode) .snippet-title {
                    color: #f1f5f9;
                }

                :global(.admin-dark-mode) .snippet-desc {
                    color: #94a3b8;
                }

                :global(.admin-dark-mode) .lang-tag {
                    background: rgba(56, 189, 248, 0.1);
                    color: #38bdf8;
                }

                :global(.admin-dark-mode) .tags-container .tag {
                    color: #64748b;
                    background: rgba(15, 23, 42, 0.3);
                }

                :global(.admin-dark-mode) .card-actions {
                    border-top-color: rgba(255, 255, 255, 0.05);
                }

                :global(.admin-dark-mode) .icon-btn {
                    background: #1e293b;
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #38bdf8;
                }

                :global(.admin-dark-mode) .icon-btn:hover {
                    background: #334155;
                    border-color: #38bdf8;
                }

                :global(.admin-dark-mode) .icon-btn.delete {
                    background: rgba(239, 68, 68, 0.1);
                    border-color: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                :global(.admin-dark-mode) .icon-btn.delete:hover {
                    background: rgba(239, 68, 68, 0.2);
                    border-color: #ef4444;
                }

                :global(.admin-dark-mode) .glass-modal {
                    background: rgba(30, 41, 59, 0.95);
                    border-color: rgba(255, 255, 255, 0.1);
                    box-shadow: 0 30px 70px rgba(0,0,0,0.5);
                    color: #f8fafc;
                }

                :global(.admin-dark-mode) .modal-header {
                    border-bottom-color: rgba(255, 255, 255, 0.05);
                }

                :global(.admin-dark-mode) .header-title {
                    color: #38bdf8;
                }

                :global(.admin-dark-mode) .input-label {
                    color: #94a3b8;
                }

                :global(.admin-dark-mode) .premium-input {
                    background: #0f172a;
                    border-color: #334155;
                    color: #f8fafc;
                }

                :global(.admin-dark-mode) .premium-input:focus {
                    background: #0f172a;
                    border-color: #38bdf8;
                    box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.15);
                }

                :global(.admin-dark-mode) .close-btn:hover {
                    color: #f8fafc;
                }

                :global(.admin-dark-mode) .btn-premium-cancel {
                    background: #1e293b;
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                }

                :global(.admin-dark-mode) .btn-premium-cancel:hover {
                    background: #334155;
                    color: #f8fafc;
                }

                @media (max-width: 1024px) {
                    .page-title { font-size: 2.5rem; }
                }

                @media (max-width: 768px) {
                    .snippets-hub-wrapper { padding: 1.5rem; }
                    .glass-section { border-radius: 1.5rem; }
                    .section-header { padding: 1.5rem; }
                    .category-section .section-header { padding: 0.45rem 0.85rem; }
                    .category-section .snippets-grid { padding: 0.85rem; }
                    .snippets-grid { padding: 1.5rem; grid-template-columns: 1fr; }
                    .btn-premium-add { width: 100%; justify-content: center; }
                    .form-group-row { flex-direction: column; gap: 1.25rem; }
                }

                /* File uploader styling */
                .file-uploader-container {
                    width: 100%;
                    margin-top: 0.5rem;
                }
                
                .file-upload-dropzone {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    min-height: 120px;
                    border: 2px dashed rgba(27, 79, 114, 0.2);
                    border-radius: 16px;
                    background: rgba(27, 79, 114, 0.02);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .file-upload-dropzone:hover {
                    border-color: #1B4F72;
                    background: rgba(27, 79, 114, 0.05);
                }
                :global(.admin-dark-mode) .file-upload-dropzone {
                    border-color: rgba(255, 255, 255, 0.15);
                    background: rgba(255, 255, 255, 0.02);
                }
                :global(.admin-dark-mode) .file-upload-dropzone:hover {
                    border-color: #38bdf8;
                    background: rgba(56, 189, 248, 0.05);
                }
                
                .dropzone-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    color: #1B4F72;
                    font-weight: 700;
                    font-size: 0.9rem;
                }
                :global(.admin-dark-mode) .dropzone-content {
                    color: #94a3b8;
                }
                
                .file-preview-box {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    width: 100%;
                    padding: 1rem;
                    border: 1px solid rgba(27, 79, 114, 0.1);
                    border-radius: 16px;
                    background: rgba(27, 79, 114, 0.02);
                }
                :global(.admin-dark-mode) .file-preview-box {
                    border-color: rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.01);
                }
                
                .uploaded-preview-media {
                    max-width: 100%;
                    max-height: 200px;
                    border-radius: 12px;
                    object-fit: cover;
                    border: 1px solid rgba(0,0,0,0.1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                
                .file-preview-info {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                }
                
                .file-preview-path {
                    font-size: 0.8rem;
                    font-family: monospace;
                    color: rgba(0,0,0,0.5);
                }
                :global(.admin-dark-mode) .file-preview-path {
                    color: rgba(255,255,255,0.5);
                }
                
                .btn-remove-file:hover {
                    background: rgba(239, 68, 68, 0.2);
                    border-color: #ef4444;
                }

                /* Tabs System */
                .tabs-container {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 2.5rem;
                }

                .tabs-nav {
                    display: flex;
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    padding: 0.4rem;
                    border-radius: 1.25rem;
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    gap: 0.5rem;
                }
                :global(.admin-dark-mode) .tabs-nav {
                    background: rgba(30, 41, 59, 0.7);
                    border-color: rgba(255, 255, 255, 0.05);
                }

                .tab-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1.5rem;
                    border-radius: 1rem;
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #64748b;
                    transition: all 0.3s ease;
                    position: relative;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                }

                .tab-item:hover {
                    color: #1B4F72;
                    background: rgba(255, 255, 255, 0.5);
                }
                :global(.admin-dark-mode) .tab-item:hover {
                    color: #38bdf8;
                    background: rgba(255, 255, 255, 0.05);
                }

                .tab-item.active {
                    color: #1B4F72;
                    background: white;
                    box-shadow: 0 4px 12px rgba(27, 79, 114, 0.08);
                }
                :global(.admin-dark-mode) .tab-item.active {
                    color: #38bdf8;
                    background: #1e293b;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
                }

                .tab-indicator {
                    position: absolute;
                    bottom: -1px;
                    left: 20%;
                    right: 20%;
                    height: 2px;
                    background: #1B4F72;
                    border-radius: 2px;
                }
                :global(.admin-dark-mode) .tab-indicator {
                    background: #38bdf8;
                }

                /* Hero settings form styling */
                .premium-form { padding: 2.5rem; }
                :global(.admin-dark-mode) .premium-form {
                    background: rgba(30, 41, 59, 0.2);
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .input-group.full-width { grid-column: span 2; }

                .input-group label {
                    font-size: 0.85rem;
                    font-weight: 800;
                    color: #334155;
                    margin-left: 0.2rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                :global(.admin-dark-mode) .input-group label {
                    color: #94a3b8;
                }

                .premium-form input, .premium-form textarea {
                    padding: 1rem 1.25rem;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    font-size: 0.95rem;
                    color: #1e293b;
                    transition: all 0.3s ease;
                }
                :global(.admin-dark-mode) .premium-form input, :global(.admin-dark-mode) .premium-form textarea {
                    background: #0f172a;
                    border-color: #334155;
                    color: #f8fafc;
                }

                .premium-form input:focus, .premium-form textarea:focus {
                    background: white;
                    border-color: #3A99C9;
                    box-shadow: 0 0 0 4px rgba(58, 153, 201, 0.1);
                    outline: none;
                }
                :global(.admin-dark-mode) .premium-form input:focus, :global(.admin-dark-mode) .premium-form textarea:focus {
                    background: #0f172a;
                    border-color: #38bdf8;
                    box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.15);
                }

                .premium-form input[readonly], .premium-form textarea[readonly] {
                    background: rgba(248, 250, 252, 0.5);
                    cursor: default;
                    border-color: transparent;
                }
                :global(.admin-dark-mode) .premium-form input[readonly], :global(.admin-dark-mode) .premium-form textarea[readonly] {
                    background: rgba(15, 23, 42, 0.4);
                    border-color: transparent;
                }

                .premium-form input[readonly]:focus, .premium-form textarea[readonly]:focus {
                    box-shadow: none;
                    border-color: transparent;
                }

                .btn-edit-toggle {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 0.6rem 1.2rem;
                    background: white;
                    color: #1B4F72;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.85rem;
                    font-size: 0.85rem;
                    font-weight: 800;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                }
                :global(.admin-dark-mode) .btn-edit-toggle {
                    background: #1e293b;
                    color: #38bdf8;
                    border-color: rgba(255, 255, 255, 0.1);
                }

                .btn-edit-toggle:hover {
                    transform: translateY(-2px);
                    border-color: #3A99C9;
                    color: #3A99C9;
                    box-shadow: 0 4px 12px rgba(58, 153, 201, 0.1);
                }
                :global(.admin-dark-mode) .btn-edit-toggle:hover {
                    border-color: #38bdf8;
                    color: #38bdf8;
                    box-shadow: 0 4px 12px rgba(56, 189, 248, 0.15);
                }

                .btn-edit-toggle.active {
                    background: #f1f5f9;
                    color: #64748b;
                    border-color: #cbd5e1;
                }
                :global(.admin-dark-mode) .btn-edit-toggle.active {
                    background: #334155;
                    color: #94a3b8;
                    border-color: #475569;
                }

                .form-footer {
                    margin-top: 2.5rem;
                    display: flex;
                    justify-content: flex-end;
                }
            `}</style>
        </div>
    );
}
