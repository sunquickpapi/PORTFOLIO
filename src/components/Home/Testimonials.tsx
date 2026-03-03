"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";

interface Testimonial {
    id: string;
    author: string;
    role: string;
    quote: string;
    feedback: string;
}

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const res = await fetch("/api/testimonials");
                const data = await res.json();
                setTestimonials(data);
            } catch (error) {
                console.error("Error fetching testimonials:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTestimonials();
    }, []);

    if (loading) return (
        <section id="testimonials" className="section-high-fidelity py-24">
            <div className="container" style={{ maxWidth: "1400px" }}>
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/20"></div>
                </div>
            </div>
        </section>
    );

    if (testimonials.length === 0) return null;

    return (
        <section id="testimonials" className="section-high-fidelity py-24 relative overflow-hidden">
            {/* Background elements to match high-fidelity style */}
            <div className="bg-animation-container opacity-30">
                <div className="geo-bar geo-1"></div>
                <div className="geo-bar geo-4"></div>
                <div className="geo-bar geo-8"></div>
            </div>

            <div className="container relative z-10" style={{ maxWidth: "1400px" }}>
                <div className="section-header mb-20 flex flex-col items-center">
                    <h2>Testimonials</h2>
                    <p className="section-subtitle text-center text-lg md:text-xl max-w-3xl mx-auto italic leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                        What my clients and colleagues say about working with me
                    </p>
                </div>

                <div className="testimonials-masonry">
                    {testimonials.map((t) => (
                        <div key={t.id} className="testimonial-card group">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="testimonial-quote">&quot;{t.quote}&quot;</h3>
                                <Quote size={20} className="transition-colors" style={{ color: "var(--color-text-muted)" }} />
                            </div>

                            <p className="testimonial-text">
                                {t.feedback}
                            </p>

                            <div className="testimonial-author">
                                <span className="name">{t.author}</span>
                                <span className="role">{t.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
