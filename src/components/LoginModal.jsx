import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Shield, Hash, GraduationCap, Building2, Phone, ChevronLeft } from 'lucide-react';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, onLogin, initialRole, initialMode = 'login' }) => {
    const [isRegister, setIsRegister] = useState(initialMode === 'register');
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: ID, 2: OTP, 3: New Pass
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        roll_number: '',
        department: '',
        year: '',
        email: '', // Used as identifier (ID or Email) in login
        phone_number: '',
        password: '',
        role: (typeof initialRole === 'string' && initialRole) ? initialRole : 'student',
        gender: '',
        student_type: 'Day Scholar',
        bus_number: '',
        bus_stop_name: '',
        profile_pic: ''
    });

    const [resetData, setResetData] = useState({
        roll_number: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            const role = (typeof initialRole === 'string' && initialRole) ? initialRole : 'student';
            setFormData(prev => ({ ...prev, role }));
            setIsRegister(initialMode === 'register');
            setIsForgotPassword(false);
            setForgotStep(1);
            setResetData({ roll_number: '', otp: '', newPassword: '', confirmPassword: '' });
            setError('');
            setSuccess('');
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, initialRole, initialMode]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleResetChange = (e) => {
        setResetData({ ...resetData, [e.target.name]: e.target.value });
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (forgotStep === 1) {
                const res = await fetch('/api/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roll_number: resetData.roll_number })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setSuccess(data.message);
                setForgotStep(2);
            } else if (forgotStep === 2) {
                const res = await fetch('/api/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roll_number: resetData.roll_number, otp: resetData.otp })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setForgotStep(3);
                setSuccess('');
            } else if (forgotStep === 3) {
                if (resetData.newPassword !== resetData.confirmPassword) {
                    throw new Error("Passwords do not match");
                }
                const res = await fetch('/api/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        roll_number: resetData.roll_number,
                        otp: resetData.otp,
                        newPassword: resetData.newPassword
                    })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setSuccess(data.message);
                setTimeout(() => {
                    setIsForgotPassword(false);
                    setSuccess('');
                }, 3000);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const endpoint = isRegister ? '/api/register' : '/api/login';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            if (isRegister) {
                // Keep the modal open in register mode
                // Clear the form fields
                setFormData({
                    name: '',
                    roll_number: '',
                    department: '',
                    year: '',
                    email: '',
                    phone_number: '',
                    password: '',
                    role: formData.role, // Maintain the selected role (likely student)
                    gender: '',
                    student_type: 'Day Scholar',
                    bus_number: '',
                    bus_stop_name: '',
                    profile_pic: ''
                });

                // Show the specific success message
                setSuccess('Registration successful. You can register a new student now.');
                setError('');

                // Optional: Scroll to top of form if needed, but message is at top
            } else {
                // If login success, check if the returned user role matches the selected role
                if (data.user.role !== formData.role) {
                    throw new Error(`This email is registered as a ${data.user.role}. Please select the correct role.`);
                }
                onLogin(data.user, data.token);
                onClose();
            }
        } catch (err) {
            setError(err.message);
            setSuccess('');
        } finally {
            setLoading(false);
        }
    };

    return (
        isOpen && (
            <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
                <div className={`modal-container ${isOpen ? 'open' : ''}`}>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                    {isRegister && (
                        <button
                            className="back-auth-btn"
                            onClick={() => setIsRegister(false)}
                        >
                            <ChevronLeft size={20} /> Back
                        </button>
                    )}

                    <div className="login-header">
                        <h2>{isForgotPassword ? 'Reset Password' : (formData.role === 'admin' ? 'Admin Portal Access' : isRegister ? 'Join QRide – SREC Campus Bus System' : 'Welcome Back')}</h2>
                        <p>{isForgotPassword ? 'Recovery for SREC Register Numbers' : (formData.role === 'admin' ? 'Administrative security validation required' : isRegister ? 'Create your student account' : 'Sign in to access your dashboard')}</p>
                    </div>

                    {isForgotPassword ? (
                        <form onSubmit={handleForgotSubmit} className="login-form">
                            <button type="button" className="back-auth-btn" onClick={() => setIsForgotPassword(false)} style={{ marginBottom: '20px' }}>
                                <ChevronLeft size={18} /> Back to Login
                            </button>

                            <div className="reset-steps-container">
                                {forgotStep === 1 && (
                                    <div className="step-content">
                                        <div className="step-info">
                                            <h3>Identify Account</h3>
                                            <p>Enter your SREC Register Number to receive an OTP</p>
                                        </div>
                                        <div className="form-group">
                                            <Hash size={18} className="input-icon" />
                                            <input
                                                type="text"
                                                name="roll_number"
                                                placeholder="SREC Register Number"
                                                value={resetData.roll_number}
                                                onChange={handleResetChange}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn-login-submit" disabled={loading}>
                                            {loading ? 'Verifying...' : 'Send OTP'}
                                        </button>
                                    </div>
                                )}

                                {forgotStep === 2 && (
                                    <div className="step-content">
                                        <div className="step-info">
                                            <h3>Verify OTP</h3>
                                            <p>Enter the 6-digit code sent to your registered contact</p>
                                        </div>
                                        <div className="form-group">
                                            <Shield size={18} className="input-icon" />
                                            <input
                                                type="text"
                                                name="otp"
                                                placeholder="6-Digit OTP"
                                                value={resetData.otp}
                                                onChange={handleResetChange}
                                                maxLength={6}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn-login-submit" disabled={loading}>
                                            {loading ? 'Verifying...' : 'Verify OTP'}
                                        </button>
                                    </div>
                                )}

                                {forgotStep === 3 && (
                                    <div className="step-content">
                                        <div className="step-info">
                                            <h3>Set New Password</h3>
                                            <p>Create a strong password for your account</p>
                                        </div>
                                        <div className="form-group">
                                            <Lock size={18} className="input-icon" />
                                            <input
                                                type="password"
                                                name="newPassword"
                                                placeholder="New Password"
                                                value={resetData.newPassword}
                                                onChange={handleResetChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <Lock size={18} className="input-icon" />
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                placeholder="Confirm New Password"
                                                value={resetData.confirmPassword}
                                                onChange={handleResetChange}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn-login-submit" disabled={loading}>
                                            {loading ? 'Updating...' : 'Reset Password'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {error && <div className="error-message">{error}</div>}
                            {success && <div className="success-message">{success}</div>}
                        </form>
                    ) : (
                        <form className="login-form" onSubmit={handleSubmit}>
                            {error && <div className="error-message">{error}</div>}
                            {success && <div className="success-message">{success}</div>}

                            {/* Role Selector for Registration */}
                            {isRegister && (
                                <div className="form-group" style={{ marginBottom: '24px' }}>
                                    <Shield size={18} className="input-icon" />
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            padding: '14px 16px 14px 60px',
                                            fontSize: '15px',
                                            fontWeight: '700',
                                            color: formData.role === 'admin' ? '#1F7A5A' : '#1E1E1E',
                                            background: formData.role === 'admin' ? 'linear-gradient(135deg, rgba(31, 122, 90, 0.05) 0%, rgba(124, 255, 0, 0.05) 100%)' : 'white',
                                            border: formData.role === 'admin' ? '2px solid #1F7A5A' : '2px solid #e2e8f0'
                                        }}
                                    >
                                        <option value="student">👨‍🎓 Student Account</option>
                                        <option value="admin">🔐 Admin Account</option>
                                    </select>
                                </div>
                            )}

                            {isRegister && formData.role !== 'admin' && (
                                <div className="register-fields" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Personal Info */}
                                    <div className="form-group">
                                        <User size={18} className="input-icon" />
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Full Name (e.g. John Doe)"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <Hash size={18} className="input-icon" />
                                            <input
                                                type="text"
                                                name="roll_number"
                                                placeholder="SREC Register Number"
                                                value={formData.roll_number}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <GraduationCap size={18} className="input-icon" />
                                            <select
                                                name="year"
                                                value={formData.year}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Year</option>
                                                <option value="1st Year">1st Year</option>
                                                <option value="2nd Year">2nd Year</option>
                                                <option value="3rd Year">3rd Year</option>
                                                <option value="4th Year">4th Year</option>
                                                <option value="5th Year">5th Year</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <Building2 size={18} className="input-icon" />
                                            <select
                                                name="department"
                                                value={formData.department}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Department</option>
                                                <option value="CSE">CSE</option>
                                                <option value="ECE">ECE</option>
                                                <option value="EEE">EEE</option>
                                                <option value="MECH">MECH</option>
                                                <option value="CIVIL">CIVIL</option>
                                                <option value="IT">IT</option>
                                                <option value="MBA">MBA</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <Phone size={18} className="input-icon" />
                                            <input
                                                type="tel"
                                                name="phone_number"
                                                placeholder="Phone Number"
                                                value={formData.phone_number}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Gender & Student Type */}
                                    <div className="form-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Gender</label>
                                        <div style={{ display: 'flex', gap: '20px' }}>
                                            <label className="radio-label">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="Male"
                                                    checked={formData.gender === 'Male'}
                                                    onChange={handleChange}
                                                    required
                                                /> Male
                                            </label>
                                            <label className="radio-label">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="Female"
                                                    checked={formData.gender === 'Female'}
                                                    onChange={handleChange}
                                                /> Female
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Student Type</label>
                                        <div className="role-switch" style={{ width: '100%', marginBottom: '0' }}>
                                            <label className={`role-option ${formData.student_type === 'Day Scholar' ? 'active' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="student_type"
                                                    value="Day Scholar"
                                                    checked={formData.student_type === 'Day Scholar'}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                Day Scholar
                                            </label>
                                            <label className={`role-option ${formData.student_type === 'Hosteller' ? 'active' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="student_type"
                                                    value="Hosteller"
                                                    checked={formData.student_type === 'Hosteller'}
                                                    onChange={handleChange}
                                                />
                                                Hosteller
                                            </label>
                                        </div>
                                    </div>

                                    {/* Conditional Bus Details */}
                                    {formData.student_type === 'Day Scholar' && (
                                        <div className="form-row">
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    name="bus_number"
                                                    placeholder="Bus Number"
                                                    value={formData.bus_number}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    name="bus_stop_name"
                                                    placeholder="Bus Stop Name"
                                                    value={formData.bus_stop_name}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Photo Upload */}
                                    <div className="form-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Profile Photo (Max 2MB)</label>
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    if (file.size > 2 * 1024 * 1024) {
                                                        alert("File size exceeds 2MB");
                                                        e.target.value = null; // Reset
                                                        return;
                                                    }
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setFormData({ ...formData, profile_pic: reader.result });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            required
                                            style={{ padding: '10px' }}
                                        />
                                        {formData.profile_pic && (
                                            <img src={formData.profile_pic} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginTop: '5px' }} />
                                        )}
                                    </div>

                                </div>
                            )}

                            {/* Admin Name Field */}
                            {isRegister && formData.role === 'admin' && (
                                <div className="form-group">
                                    <User size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                {formData.role === 'admin' ? <Mail size={18} className="input-icon" /> : <Hash size={18} className="input-icon" />}
                                <input
                                    type={formData.role === 'admin' ? "email" : "text"}
                                    name="email"
                                    placeholder={formData.role === 'admin' ? "Admin Email Address" : "SREC Register Number"}
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {!isRegister && formData.role === 'student' && (
                                <div className="forgot-password-container">
                                    <button
                                        type="button"
                                        className="forgot-password-link"
                                        onClick={() => {
                                            setIsForgotPassword(true);
                                            setForgotStep(1);
                                            setError('');
                                            setSuccess('');
                                        }}
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}

                            {!isRegister && (
                                <div className="role-switch">
                                    <label className={`role-option ${formData.role === 'student' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="student"
                                            checked={formData.role === 'student'}
                                            onChange={handleChange}
                                        />
                                        Student
                                    </label>
                                    <label className={`role-option ${formData.role === 'admin' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="admin"
                                            checked={formData.role === 'admin'}
                                            onChange={handleChange}
                                        />
                                        Admin
                                    </label>
                                </div>
                            )}

                            <button type="submit" className="btn-login-submit" disabled={loading}>
                                {loading ? 'Processing...' : formData.role === 'admin' ? 'Authorize Access' : isRegister ? 'Create Account' : 'Login'}
                            </button>
                        </form>
                    )}

                    {formData.role !== 'admin' && (
                        <div className="login-footer">
                            <p>
                                {isRegister ? 'Already have an account?' : "Don't have an account?"}
                                <button className="toggle-btn" type="button" onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}>
                                    {isRegister ? 'Sign In' : 'Register Now'}
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )
    );
};

export default LoginModal;
