import React from 'react';
import { User, Shield, FileText, Upload, Eye, CreditCard, Layout, Scan, Settings } from 'lucide-react';
import './UserModules.css';

const UserModules = ({ onOpenLogin }) => {
    return (
        <section id="modules" className="modules-section">
            <div className="container">
                <div className="section-header text-center">
                    <h2 className="section-title">User Modules</h2>
                    <div className="title-underline"></div>
                </div>

                <div className="modules-split">
                    {/* Student Module */}
                    <div className="module-card student-module" data-aos="fade-right">
                        <div className="module-header">
                            <div className="icon-badge student">
                                <User size={32} />
                            </div>
                            <h3>Student Module</h3>
                            <p>Apply, track, and manage your bus pass seamlessly.</p>
                        </div>

                        <ul className="module-features">
                            <li><FileText size={18} /> Apply for New Pass</li>
                            <li><Upload size={18} /> Upload Documents</li>
                            <li><Eye size={18} /> View Digital QR Pass</li>
                            <li><CreditCard size={18} /> Pay & Renew Online</li>
                        </ul>

                        <button className="btn-module student-btn" onClick={() => onOpenLogin('student')}>Login as Student</button>
                    </div>

                    {/* Admin Module */}
                    <div className="module-card admin-module" data-aos="fade-left">
                        <div className="module-header">
                            <div className="icon-badge admin">
                                <Shield size={32} />
                            </div>
                            <h3>Admin Module</h3>
                            <p>Efficiently manage routes, verify passes, and view reports.</p>
                        </div>

                        <ul className="module-features">
                            <li><Scan size={18} /> Scan & Verify Pass</li>
                            <li><Layout size={18} /> Manage Routes</li>
                            <li><FileText size={18} /> Approve / Reject Passes</li>
                            <li><Settings size={18} /> User Management</li>
                        </ul>

                        <button className="btn-module admin-btn" onClick={() => onOpenLogin('admin')}>Login as Admin</button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UserModules;
