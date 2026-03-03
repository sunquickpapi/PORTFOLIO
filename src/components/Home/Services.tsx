import { PenTool, Code, Camera } from "lucide-react";

export default function Services() {
    return (
        <section id="skills">
            <div className="bg-animation-container">
                <div className="geo-bar geo-1"></div>
                <div className="geo-bar geo-2"></div>
                <div className="geo-bar geo-4"></div>
                <div className="geo-bar geo-6"></div>
                <div className="geo-bar geo-8"></div>
            </div>

            <div className="container" style={{ maxWidth: "1200px" }}>
                <div className="section-header">
                    <h2>What I Do</h2>
                    <p className="section-subtitle">Specialized services to bring your digital vision to life</p>
                </div>

                <div className="services-grid grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="service-card">
                        <div className="service-icon-wrapper">
                            <PenTool size={24} />
                        </div>
                        <h3>Web Design</h3>
                        <p>Creating intuitive and visually stunning user interfaces with modern design principles.</p>
                        <div className="service-tags">
                            <span className="service-tag">UI/UX</span>
                            <span className="service-tag">Responsive</span>
                        </div>
                    </div>

                    <div className="service-card">
                        <div className="service-icon-wrapper">
                            <Code size={24} />
                        </div>
                        <h3>Web Development</h3>
                        <p>Building robust, scalable web applications using cutting-edge technologies.</p>
                        <div className="service-tags">
                            <span className="service-tag">Frontend</span>
                            <span className="service-tag">Next.js</span>
                        </div>
                    </div>

                    <div className="service-card">
                        <div className="service-icon-wrapper">
                            <Camera size={24} />
                        </div>
                        <h3>Photographic Design</h3>
                        <p>Capturing compelling visual identities and digital assets that effectively communicate your brand.</p>
                        <div className="service-tags">
                            <span className="service-tag">Branding</span>
                            <span className="service-tag">Identity</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
