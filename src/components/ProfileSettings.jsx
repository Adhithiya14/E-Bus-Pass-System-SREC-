import React, { useState } from 'react';
import { Camera, Lock, X, Check, AlertCircle } from 'lucide-react';
import './ProfileSettings.css';
import { safeFetch } from '../utils/api';

const ProfileSettings = ({ user, onClose, onUpdateUser }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [passwordChanged, setPasswordChanged] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (file.size > 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image size should be less than 1MB' });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;
            setLoading(true);
            try {
                await safeFetch('/api/user/profile-pic', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, profilePic: base64String })
                });

                onUpdateUser({ ...user, profile_pic: base64String });
                setMessage({ type: 'success', text: 'Profile picture updated!' });
            } catch (err) {
                setMessage({ type: 'error', text: err.message || 'Failed to upload image' });
            } finally {
                setLoading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            await safeFetch('/api/user/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    currentPassword,
                    newPassword
                })
            });

            setPasswordChanged(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-overlay" onClick={(e) => e.target.className === 'settings-overlay' && onClose()}>
            <div className="settings-container" onClick={(e) => e.stopPropagation()}>
                <button className="close-settings" onClick={onClose} title="Close Settings"><X size={24} /></button>

                <h2 className="settings-title">Profile Settings</h2>

                {!passwordChanged ? (
                    <>
                        <div className="profile-upload-section">
                            <div className="avatar-preview-container">
                                {user?.profile_pic ? (
                                    <img src={user.profile_pic} alt="Profile" className="avatar-preview" />
                                ) : (
                                    <div className="avatar-placeholder">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                                )}
                                <label className="upload-label" title="Change Photo">
                                    <Camera size={18} />
                                    <input type="file" onChange={handleFileChange} hidden accept="image/*" />
                                </label>
                            </div>
                            <p className="upload-hint">Upload a profile photo to personalize your dashboard</p>
                            {loading && !currentPassword && <div className="spinner-small"></div>}
                        </div>

                        <form className="settings-form" onSubmit={handlePasswordChange}>
                            <div className="form-section-title">
                                <Lock size={18} />
                                <span>Security & Password</span>
                            </div>

                            <div className="form-group-custom">
                                <Lock size={16} className="field-icon" />
                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group-custom">
                                <Lock size={16} className="field-icon" />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group-custom">
                                <Check size={16} className="field-icon" />
                                <input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {message.text && (
                                <div className={`message-banner ${message.type}`}>
                                    {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                                    <span>{message.text}</span>
                                </div>
                            )}

                            <div className="settings-actions">
                                <button type="button" className="btn-cancel" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save-settings" disabled={loading}>
                                    {loading ? 'Saving Changes...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="success-screen">
                        <div className="success-icon-container">
                            <Check size={48} className="success-check" />
                        </div>
                        <h3>Password Updated!</h3>
                        <p>Your security settings have been successfully updated. You can now return to your dashboard.</p>
                        <button className="btn-primary-custom full-width" onClick={onClose}>
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileSettings;
