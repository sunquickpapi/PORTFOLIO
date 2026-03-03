"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";
import * as LucideIcons from "lucide-react";
import ProjectModal from "./ProjectModal";
import PreviewModal from "./PreviewModal";

import { Project } from "@/types/project";

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [previewProject, setPreviewProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/projects")
            .then((res) => res.json())
            .then((data) => {
                setProjects(data.slice(0, 3)); // Only show latest 3 on home page
                setLoading(false);
            });
    }, []);

    return (
        <section id="projects">
            {loading ? (
                <div className="container" style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="animate-pulse text-[var(--color-text-muted)] text-xl font-bold">Loading Projects...</div>
                </div>
            ) : (
                <>
                    <div className="bg-animation-container">
                        <div className="geo-bar geo-1"></div>
                        <div className="geo-bar geo-2"></div>
                        <div className="geo-bar geo-4"></div>
                        <div className="geo-bar geo-6"></div>
                        <div className="geo-bar geo-8"></div>
                    </div>

                    <div className="container">
                        <div className="section-header">
                            <h2>Project</h2>
                            <p className="section-subtitle">A showcase of my recent work across mobile and web platforms</p>
                        </div>

                        <div className="projects-grid">
                            {projects.map((project) => (
                                <div key={project.id} className="project-new-card">
                                    <div className="project-image-container">
                                        <img
                                            src={project.image_url || "/assets/placeholder.jpg"}
                                            alt={project.title}
                                        />
                                        <button
                                            onClick={() => setSelectedProject(project)}
                                            className="btn-read-more"
                                        >
                                            Read More
                                        </button>
                                    </div>
                                    <div className="project-info">
                                        <h3>{project.title}</h3>
                                        <p className="project-date">{project.date}</p>
                                        <div className="project-tags">
                                            {project.tech_stack?.slice(0, 3).map((tag) => (
                                                <span key={tag} className="tag">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="project-actions">
                                            {project.preview_images && (Array.isArray(project.preview_images) ? project.preview_images.length > 0 : String(project.preview_images).length > 2) && (
                                                <button
                                                    onClick={() => setPreviewProject(project)}
                                                    className="btn-action btn-preview"
                                                >
                                                    <span>Preview</span>
                                                </button>
                                            )}
                                            {project.live_demo_url && (
                                                <a href={project.live_demo_url} target="_blank" className="btn-action btn-live">
                                                    <span>Live Demo</span>
                                                </a>
                                            )}
                                            {project.repo_url && (
                                                <a href={project.repo_url} target="_blank" className="btn-action btn-repo">
                                                    <span>Repository</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ textAlign: "center", marginTop: "4rem" }}>
                            <Link href="/projects" className="btn-view-all">
                                View All Projects
                            </Link>
                        </div>
                    </div>

                    {selectedProject && (
                        <ProjectModal
                            project={selectedProject}
                            isOpen={!!selectedProject}
                            onClose={() => setSelectedProject(null)}
                            onPreview={(project) => setPreviewProject(project)}
                        />
                    )}

                    {previewProject && (
                        <PreviewModal
                            project={previewProject}
                            isOpen={!!previewProject}
                            onClose={() => setPreviewProject(null)}
                        />
                    )}
                </>
            )}
        </section>
    );
}
