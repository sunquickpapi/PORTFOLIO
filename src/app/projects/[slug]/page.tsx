"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ExternalLink, Github, ArrowLeft, Image as ImageIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface Project {
    id: string;
    title: string;
    description: string;
    challenge: string;
    solution: string;
    date: string;
    category: string;
    image_url: string;
    preview_images: string[];
    tech_stack: string[];
    live_demo_url: string;
    repo_url: string;
    slug: string;
}

export default function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetch("/api/projects");
                const projects = await res.json();
                const found = projects.find((p: Project) => p.slug === slug);
                setProject(found || null);
            } catch (error) {
                console.error("Error fetching project:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-pulse text-zinc-500">Loading project details...</div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Project Not Found</h1>
                    <Link href="/" className="text-indigo-400 hover:underline flex items-center justify-center gap-2">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
            {/* Hero Section */}
            <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <img
                    src={project.image_url || "/assets/placeholder.jpg"}
                    alt="Project Hero"
                    className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
                />

                <div className="absolute top-8 left-8 z-20">
                    <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-all">
                        <ArrowLeft size={18} />
                        <span className="text-sm font-medium">Back to projects</span>
                    </Link>
                </div>

                <div className="absolute bottom-12 left-0 w-full z-20 px-8 lg:px-24">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`px-3 py-1 rounded border border-white/10 text-[10px] uppercase font-bold tracking-widest ${project.category === 'Mobile' ? 'text-blue-400 bg-blue-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>
                                {project.category || 'Websites'}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight uppercase tracking-widest">{project.title}</h1>
                        <p className="text-lg md:text-xl text-zinc-400 font-bold uppercase tracking-[0.2em] mb-8">{project.date}</p>

                        <div className="flex flex-wrap gap-2">
                            {project.tech_stack?.map((tech) => (
                                <span key={tech} className="px-4 py-1.5 bg-zinc-800/80 backdrop-blur-sm rounded-full text-sm font-medium border border-white/5">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-5xl mx-auto px-8 lg:px-24 py-20 space-y-20">
                {/* Information Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-16">
                    {project.challenge && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">The Challenge</h2>
                            <p className="text-lg text-zinc-400 leading-relaxed font-light">
                                {project.challenge}
                            </p>
                        </div>
                    )}

                    {project.solution && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">The Solution</h2>
                            <p className="text-lg text-zinc-400 leading-relaxed font-light">
                                {project.solution}
                            </p>
                        </div>
                    )}

                    {!project.challenge && !project.solution && project.description && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">Project Overview</h2>
                            <p className="text-lg text-zinc-400 leading-relaxed font-light">
                                {project.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* Preview Images */}
                {project.preview_images && project.preview_images.length > 0 && (
                    <div className="space-y-8 pt-10 border-t border-white/5">
                        <h2 className="text-3xl font-bold tracking-tight">Preview Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {project.preview_images.map((img, idx) => (
                                <div key={idx} className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 aspect-video hover-glow">
                                    <img
                                        src={img}
                                        alt={`Preview ${idx + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Final Actions */}
                <div className="flex flex-wrap gap-4 pt-10 border-t border-white/5">
                    {project.preview_images && project.preview_images.length > 0 && (
                        <button className="flex items-center gap-2 px-8 py-3 bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 transition-all font-bold group">
                            <ImageIcon size={20} className="group-hover:scale-110 transition-transform" />
                            Preview
                        </button>
                    )}

                    {project.live_demo_url && (
                        <a
                            href={project.live_demo_url}
                            target="_blank"
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-xl hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all font-bold group"
                        >
                            <ExternalLink size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            Live Demo
                        </a>
                    )}

                    {project.repo_url && (
                        <a
                            href={project.repo_url}
                            target="_blank"
                            className="flex items-center gap-2 px-8 py-3 bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 transition-all font-bold group"
                        >
                            <LucideIcons.Github size={20} className="group-hover:scale-110 transition-transform" />
                            Repository
                        </a>
                    )}
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                .hover-glow:hover {
                    box-shadow: 0 0 30px rgba(79, 70, 229, 0.1);
                    border-color: rgba(79, 70, 229, 0.2);
                }
            `}</style>
        </main>
    );
}
