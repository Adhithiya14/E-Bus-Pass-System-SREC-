import React from 'react';
import { Code, Server, Database, Lock, Key, QrCode } from 'lucide-react';
import './TechStack.css';

const techData = [
    { icon: <Code size={24} />, name: "React + Vite", category: "Frontend" },
    { icon: <Code size={24} />, name: "Vanilla CSS", category: "Styling" },
    { icon: <Server size={24} />, name: "Node.js", category: "Backend" },
    { icon: <Database size={24} />, name: "MySQL", category: "Database" },
    { icon: <QrCode size={24} />, name: "QR Tech", category: "Core Feature" },
    { icon: <Lock size={24} />, name: "Encryption", category: "Security" },
];

const TechStack = () => {
    return (
        <section className="tech-section">
            <div className="container">
                <div className="section-header text-center">
                    <h2 className="section-title">Security & Technology</h2>
                    <div className="title-underline"></div>
                    <p className="section-subtitle">Built with modern, secure, and scalable technologies.</p>
                </div>

                <div className="tech-grid">
                    {techData.map((tech, index) => (
                        <div className="tech-card" key={index}>
                            <div className="tech-icon">
                                {tech.icon}
                            </div>
                            <div className="tech-info">
                                <h3>{tech.name}</h3>
                                <span>{tech.category}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="security-note">
                    <p><Key size={16} inline="true" /> All student data is end-to-end encrypted and securely authenticated.</p>
                </div>
            </div>
        </section>
    );
};

export default TechStack;
