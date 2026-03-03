"use client";

import { X, ExternalLink, Github, Calendar, Layers } from "lucide-react";
import { useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

import { Project } from "@/types/project";

interface ProjectModalProps {
    project: Project;
    isOpen: boolean;
    onClose: () => void;
    onPreview: (project: Project) => void;
}

export default function ProjectModal({ project, isOpen, onClose, onPreview }: ProjectModalProps) {
    const { theme } = useTheme();
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className={`absolute inset-0 backdrop-blur-sm transition-opacity ${theme === 'light' ? 'bg-white/70' : 'bg-black/90'}`}
                onClick={onClose}
            />

            <div className={`relative w-full max-w-[900px] border overflow-hidden flex flex-col project-details-content shadow-[0_0_100px_rgba(0,0,0,0.8)]`}>
                <button onClick={onClose} className="modal-close">
                    <X size={20} />
                </button>

                <div className="details-body">
                    <div className="details-header">
                        <img
                            src={project.image_url || "/assets/placeholder.jpg"}
                            alt={project.title}
                        />
                    </div>

                    <div className="details-info">
                        <h2>{project.title}</h2>
                        <p className="project-date">{project.date}</p>

                        <div className="project-tags">
                            {project.tech_stack?.map((tech) => (
                                <span key={tech} className="tag">{tech}</span>
                            ))}
                        </div>

                        <div className="project-full-desc">
                            {project.challenge && (
                                <>
                                    <h3>The Challenge</h3>
                                    <p>{project.challenge}</p>
                                </>
                            )}

                            {project.solution && (
                                <>
                                    <h3>The Solution</h3>
                                    <p>{project.solution}</p>
                                </>
                            )}

                            {!project.challenge && !project.solution && project.description && (
                                <>
                                    <h3>Project Overview</h3>
                                    <p>{project.description}</p>
                                </>
                            )}
                        </div>

                        <div className="project-actions">
                            <button
                                onClick={() => { onClose(); onPreview(project); }}
                                className="btn-action btn-preview"
                            >
                                <span>Preview</span>
                            </button>

                            {project.live_demo_url && (
                                <a
                                    href={project.live_demo_url}
                                    target="_blank"
                                    className="btn-action btn-live"
                                >
                                    <span>Live Demo</span>
                                </a>
                            )}

                            {project.repo_url && (
                                <a
                                    href={project.repo_url}
                                    target="_blank"
                                    className="btn-action btn-repo"
                                >
                                    <span>Repository</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
