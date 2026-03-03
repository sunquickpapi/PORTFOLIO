"use client";

import CertificationForm from "../CertificationForm";
import { Sparkles, ShieldCheck } from "lucide-react";

export default function NewCertificationPage() {
    return (
        <div className="projects-wrapper">
            {/* Background Blobs for Depth */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            <header className="page-header">
                <div className="header-top">
                    <div className="header-badge">
                        <Sparkles size={15} style={{ marginRight: '6px' }} />
                        Credential Validation
                    </div>
                </div>
                <div className="title-row">
                    <ShieldCheck className="title-icon" size={32} />
                    <h1 className="page-title">
                        Add New <span className="gradient-text">Certification</span>
                    </h1>
                </div>
                <p className="page-subtitle">Add a new official credential to your professional portfolio and showcase your expertise.</p>
            </header>

            <div className="content-container">
                <CertificationForm />
            </div>

            <style jsx>{`
                .projects-wrapper {
                    position: relative;
                    min-height: 100vh;
                    padding: 2rem;
                    overflow: hidden;
                    background: #f8fafc;
                }

                .bg-blob {
                    position: absolute;
                    filter: blur(80px);
                    z-index: 0;
                    opacity: 0.4;
                    border-radius: 50%;
                }

                .blob-1 {
                    width: 400px;
                    height: 400px;
                    background: #3A99C9;
                    top: -100px;
                    right: -100px;
                    animation: float 20s infinite alternate;
                }

                .blob-2 {
                    width: 300px;
                    height: 300px;
                    background: #1B4F72;
                    bottom: -50px;
                    left: -50px;
                    animation: float 25s infinite alternate-reverse;
                }

                @keyframes float {
                    0% { transform: translate(0, 0) scale(1); }
                    100% { transform: translate(30px, 50px) scale(1.1); }
                }

                .page-header {
                    position: relative;
                    z-index: 10;
                    margin-bottom: 3rem;
                    max-width: 1200px;
                    margin-left: auto;
                    margin-right: auto;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }

                .header-top {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                }

                .header-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.5rem 1rem;
                    background: rgba(27, 79, 114, 0.05);
                    border: 1px solid rgba(27, 79, 114, 0.1);
                    border-radius: 2rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #1B4F72;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .title-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1.25rem;
                    margin-bottom: 1rem;
                }

                .title-icon {
                    color: #1B4F72;
                }

                .page-title {
                    font-size: 3rem;
                    font-weight: 900;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                    margin: 0;
                }

                .gradient-text {
                    background: linear-gradient(135deg, #1B4F72 0%, #3A99C9 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .page-subtitle {
                    font-size: 1.1rem;
                    color: #64748b;
                    max-width: 600px;
                    line-height: 1.6;
                }

                .content-container {
                    position: relative;
                    z-index: 10;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                @media (max-width: 768px) {
                    .page-title { font-size: 2.25rem; }
                    .projects-wrapper { padding: 1.5rem; }
                }
            `}</style>
        </div>
    );
}
