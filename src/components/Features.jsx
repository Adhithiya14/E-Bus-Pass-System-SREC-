import React from 'react';
import { ShieldCheck, CalendarClock, CreditCard, RotateCw, LayoutDashboard, Leaf } from 'lucide-react';
import './Features.css';

const featuresData = [
    {
        icon: <ShieldCheck size={32} />,
        title: "Student Verification",
        desc: "Instant roll-number based verification for every campus journey."
    },
    {
        icon: <CalendarClock size={32} />,
        title: "Instant Approval",
        desc: "Register and get your digital bus pass approved by the department."
    },
    {
        icon: <CreditCard size={32} />,
        title: "Online Payment",
        desc: "Seamlessly pay via UPI, cards, or net banking."
    },
    {
        icon: <RotateCw size={32} />,
        title: "Real-Time Tracking",
        desc: "Track pass status and validity instantly from the dashboard."
    },
    {
        icon: <LayoutDashboard size={32} />,
        title: "Smart Dashboard",
        desc: "Admins get a powerful panel to manage routes and students."
    },
    {
        icon: <Leaf size={32} />,
        title: "Smart Campus",
        desc: "Modernizing transportation with an eco-friendly registration process."
    }
];

const Features = () => {
    return (
        <section id="about" className="features-section">
            <div className="container">
                <div className="section-header text-center">
                    <h2 className="section-title">Institutional Features</h2>
                    <div className="title-underline"></div>
                </div>

                <div className="features-grid">
                    {featuresData.map((feature, index) => (
                        <div className="feature-card" key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                            <div className="feature-icon">
                                {feature.icon}
                            </div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-desc">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
