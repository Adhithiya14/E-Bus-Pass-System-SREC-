import React, { useState, useEffect, useCallback } from 'react';
import {
    MapPin,
    Bus,
    Clock,
    Calendar,
    ShieldCheck,
    Download,
    AlertCircle,
    CreditCard,
    FileText,
    Camera,
    CheckCircle2,
    XCircle,
    Bell,
    Check,
    LogOut,
    Settings,
    Shuffle,
    PlusCircle,
    Clock3,
    AlertTriangle,
    Loader2,
    Ticket,
    User,
    Scan
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import html2canvas from 'html2canvas';
import ProfileSettings from './ProfileSettings';
import ApplyPassModal from './ApplyPassModal';
import PaymentModal from './PaymentModal';
import RouteChangeModal from './RouteChangeModal';
import './StudentDashboard.css';

import { safeFetch } from '../utils/api';

const LoadingOverlay = () => (
    <div className="loading-overlay">
        <Loader2 className="animate-spin" size={32} />
        <span>Processing...</span>
    </div>
);

const getDaysRemaining = (validUntil) => {
    if (!validUntil) return null;
    const today = new Date();
    const expiry = new Date(validUntil);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

const CheckerScanner = ({ onScanResult }) => {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner('reader', {
            qrbox: { width: 250, height: 250 },
            fps: 5,
        });

        scanner.render(onScanResult, (error) => {
            // console.warn(error);
        });

        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear scanner: ", error);
            });
        };
    }, [onScanResult]);

    return (
        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
            <div id="reader"></div>
            <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px', color: '#666' }}>
                Position the official Admin/Checker QR code within the frame to verify.
            </p>
        </div>
    );
};

const StudentDashboard = ({ user, onLogout, onUpdateUser }) => {
    // Top Level Safety Check
    if (!user) {
        return (
            <div className="dashboard-container">
                <div style={{ textAlign: 'center', color: '#666' }}>
                    <h2>Loading User Data...</h2>
                    <p>If this persists, please try logging in again.</p>
                    <button onClick={onLogout} className="btn-outline" style={{ marginTop: 20 }}>Return to Login</button>
                </div>
            </div>
        );
    }

    const [pass, setPass] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (pass) console.log('Current Pass Data:', pass);
    }, [pass]);
    const [showSettings, setShowSettings] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showRouteModal, setShowRouteModal] = useState(false);
    const [paymentModalData, setPaymentModalData] = useState(null); // Stores data for payment: { type, title, amount, summary, apiCall }
    const [downloading, setDownloading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifPanel, setShowNotifPanel] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeTab, setActiveTab] = useState('My Pass');
    const [verificationStatus, setVerificationStatus] = useState(null); // { valid, name, message }
    const [verifying, setVerifying] = useState(false);

    // New State for Route Requests & Tickets
    const [myRouteRequests, setMyRouteRequests] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [activeTickets, setActiveTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const fetchNotifications = useCallback(async () => {
        if (!user?.id) return;
        try {
            const data = await safeFetch(`/api/notifications/${user.id}`);
            if (Array.isArray(data)) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            }
        } catch (err) {
            // Silent fail for background sync
        }
    }, [user.id]);

    const markNotificationsAsRead = async () => {
        try {
            await safeFetch('/api/notifications/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            setUnreadCount(0);
        } catch (err) { }
    };

    const fetchMyRequests = useCallback(async () => {
        try {
            const data = await safeFetch(`/api/route-change/my-requests/${user.id}`);
            setMyRouteRequests(data);
        } catch (err) { }
    }, [user.id]);

    const fetchTickets = useCallback(async () => {
        try {
            // Assuming endpoint exists, if not safeFetch throws 404 which we catch
            const data = await safeFetch(`/api/tickets/${user.id}`);
            setActiveTickets(data || []);
        } catch (err) { }
    }, [user.id]);

    const fetchRoutes = useCallback(async () => {
        try {
            const data = await safeFetch('/api/routes');
            setRoutes(data);
        } catch (err) { }
    }, []);

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            if (mounted) {
                // Parallelize initial fetch for faster load
                setLoading(true);
                await Promise.all([
                    fetchPassData(false), // handle loading state manually
                    fetchNotifications(),
                    fetchMyRequests(),
                    fetchRoutes(),
                    fetchTickets()
                ]);
                if (mounted) setLoading(false);
            }
        };

        loadData();

        const interval = setInterval(() => {
            if (mounted) {
                // Poll only dynamic data, skip static data like Routes
                Promise.all([
                    fetchPassData(false),
                    fetchNotifications(),
                    fetchMyRequests(),
                    fetchTickets()
                ]);
            }
        }, 15000); // Increased to 15s to reduce network load

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [user.id]);

    const fetchPassData = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const data = await safeFetch(`/api/pass/${user.id}`);
            setPass(data);
            setError(null);
        } catch (err) {
            if (err.message.includes('No pass found') || err.message.includes('404')) {
                setPass(null); // Valid state: user has no pass
            } else {
                setError("Unable to load pass. Check connection.");
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [user.id]);

    const handleApplySubmit = (data) => {
        fetchPassData();
    };

    // Universal Payment Success Handler
    const handleUniversalPaymentSuccess = () => {
        if (!paymentModalData) return;

        // Execute the deferred API call
        if (typeof paymentModalData.apiCall === 'function') {
            paymentModalData.apiCall();
        }
        setPaymentModalData(null); // Close modal
    };

    const handleDownloadPass = async () => {
        const passElement = document.getElementById('digital-pass-card');
        if (!passElement) return;

        setDownloading(true);
        try {
            const canvas = await html2canvas(passElement, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true
            });
            const link = document.createElement('a');
            link.download = `SREC_Campus_Pass_${user.roll_number || 'download'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Error downloading pass:", err);
            alert("Failed to download pass. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    const handleCheckerScan = async (decodedText) => {
        if (verifying) return;
        setVerifying(true);
        setVerificationStatus(null);

        try {
            // Extract checker_id from URL if it's a full verification link
            // e.g., http://localhost:5173/verify-checker/CHK-AD-2-ABCDE
            let checkerId = decodedText;
            if (decodedText.includes('/verify-checker/')) {
                checkerId = decodedText.split('/verify-checker/').pop();
            }

            const data = await safeFetch(`/api/checker/verify/${checkerId}`);
            if (data && data.valid) {
                setVerificationStatus({ valid: true, name: data.name, message: "Authorized Checker" });
            } else {
                setVerificationStatus({ valid: false, message: "Unauthorized Checker" });
            }
        } catch (err) {
            setVerificationStatus({ valid: false, message: "Unauthorized Checker" });
        } finally {
            setVerifying(false);
        }
    };



    const initiateTicketPurchase = () => {
        const routeNum = prompt("Enter Route Number for this ticket (e.g. 5):", "1");
        if (!routeNum) return;

        setPaymentModalData({
            type: 'ticket',
            title: 'Pay-Per-Ride Ticket',
            amount: 50,
            summary: [
                { label: 'Type', value: 'Single Ride' },
                { label: 'Route', value: `#${routeNum}` }
            ],
            apiCall: async () => {
                try {
                    await safeFetch('/api/pass/ticket/purchase', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: user.id,
                            routeNumber: routeNum,
                            amount: 50
                        })
                    });
                    fetchTickets();
                    return true;
                } catch (err) {
                    alert(err.message);
                    return false;
                }
            }
        });
    };

    const initiateLitePurchase = () => {
        setPaymentModalData({
            title: 'Hosteller Lite Pass',
            amount: 150,
            summary: [
                { label: 'Validity', value: '30 Days' },
                { label: 'Limit', value: '10 Rides' }
            ],
            apiCall: async () => {
                try {
                    const data = await safeFetch('/api/pass/lite/purchase', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id, routeNumber: 'All', amount: 150 })
                    });
                    if (data.success) {
                        fetchPassData();
                        return true;
                    }
                    return false;
                } catch (err) {
                    alert(err.message);
                    return false;
                }
            }
        });
    };

    const initiateEmergencyOTP = () => {
        setPaymentModalData({
            title: 'Emergency OTP Access',
            amount: 50, // Nominal fee for emergency
            summary: [
                { label: 'Type', value: 'One-Time Code' },
                { label: 'Validity', value: '5 Minutes' }
            ],
            apiCall: async () => {
                try {
                    const data = await safeFetch('/api/auth/otp/request', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id })
                    });
                    if (data.success) {
                        alert(`Pass Payment Successful! Your OTP is: ${data.otp}`);
                        return true;
                    }
                    return false;
                } catch (err) {
                    alert(err.message);
                    return false;
                }
            }
        });
    };

    // Legacy Standard Pass Payment
    const initiateStandardPayment = () => {
        setPaymentModalData({
            title: 'Term Bus Pass Fee',
            amount: pass.amount,
            summary: [
                { label: 'Pass ID', value: pass.id },
                { label: 'Route', value: pass.route_number || 'N/A' }
            ],
            apiCall: async () => {
                try {
                    await safeFetch('/api/payment/mock', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ passId: pass.id })
                    });
                    await fetchPassData();
                    return true;
                } catch (err) {
                    alert(err.message);
                    return false;
                }
            }
        });
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header-wrapper">
                <div className="dashboard-header">
                    <div className="header-info">
                        <h1>Student Dashboard</h1>
                        <div className="welcome-row">
                            <span className="welcome-text">Welcome back,</span>
                            <span className="user-highlight">{user.name || 'Student'}</span>
                        </div>
                    </div>
                    <div className="header-actions">
                        <div className="notif-wrapper">
                            <button
                                className={`btn-notif ${unreadCount > 0 ? 'pulse' : ''}`}
                                onClick={() => {
                                    setShowNotifPanel(!showNotifPanel);
                                    if (!showNotifPanel && unreadCount > 0) markNotificationsAsRead();
                                }}
                            >
                                <Bell size={24} />
                                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                            </button>

                            {showNotifPanel && (
                                <div className="notif-panel">
                                    <div className="notif-header">
                                        <h4>Notifications</h4>
                                    </div>
                                    <div className="notif-list">
                                        {notifications.length > 0 ? (
                                            notifications.map(n => (
                                                <div key={n.id} className={`notif-item ${n.type} ${!n.is_read ? 'unread' : ''}`}>
                                                    <div className="notif-msg">{n.message}</div>
                                                    <div className="notif-time">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="notif-empty">No new notifications</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            className="settings-toggle-btn"
                            onClick={() => setShowSettings(true)}
                            title="Profile Settings"
                        >
                            {user.profile_pic ? (
                                <img src={user.profile_pic} alt="Profile" className="header-avatar" />
                            ) : (
                                <Settings size={24} />
                            )}
                        </button>

                        <button
                            className="settings-toggle-btn"
                            onClick={onLogout}
                            title="Log Out"
                        >
                            <LogOut size={24} />
                        </button>
                    </div>
                </div>
                <div className="dashboard-tabs">
                    <button
                        className={`tab-button ${activeTab === 'My Pass' ? 'active' : ''}`}
                        onClick={() => setActiveTab('My Pass')}
                    >
                        My Pass
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'Hostellers Pass' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Hostellers Pass')}
                    >
                        Hostellers Pass
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'Verify Checker' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Verify Checker')}
                    >
                        <Scan size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        Verify Checker
                    </button>
                </div>
            </div>

            <div className="dashboard-content">
                {loading ? (
                    <div className="loading-state">Loading pass details...</div>
                ) : error ? (
                    <div className="error-state">{error}</div>
                ) : (
                    <>
                        {activeTab === 'My Pass' && (
                            <div className="tab-pane active slide-in">


                                {!loading && pass && pass.status === 'active' && pass.valid_until && (
                                    (() => {
                                        const daysRemaining = getDaysRemaining(pass.valid_until);
                                        if (daysRemaining !== null) {
                                            if (daysRemaining < 0) {
                                                return (
                                                    <div className="expiration-alert expired" style={{
                                                        backgroundColor: '#fee2e2',
                                                        color: '#b91c1c',
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        marginBottom: '16px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        border: '1px solid #fecaca'
                                                    }}>
                                                        <AlertCircle size={20} />
                                                        <strong>Your bus pass has expired</strong>
                                                    </div>
                                                );
                                            } else if (daysRemaining <= 7) {
                                                const expiryDate = new Date(pass.valid_until).toLocaleDateString();
                                                return (
                                                    <div className="expiration-alert soon" style={{
                                                        backgroundColor: '#fef3c7',
                                                        color: '#b45309',
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        marginBottom: '16px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        border: '1px solid #fcd34d'
                                                    }}>
                                                        <Clock size={20} />
                                                        <strong>Your bus pass will expire on {expiryDate}</strong>
                                                    </div>
                                                );
                                            }
                                        }
                                        return null;
                                    })()
                                )}


                                {!loading && !pass && !error && (
                                    <div className="no-pass-card">
                                        <div className="no-pass-icon">
                                            <Bus size={48} />
                                        </div>
                                        <h3>No Active Bus Pass Found</h3>
                                        <p>You don't have a valid pass for the current academic session. Apply for a new pass to start commuting.</p>
                                        <button className="btn-primary-large" onClick={() => setShowApplyModal(true)}>
                                            <PlusCircle size={20} />
                                            Apply for New Pass
                                        </button>
                                    </div>
                                )}

                                {!loading && pass && pass.status === 'pending' && (
                                    <div className="no-pass-card pending-state">
                                        {pass.payment_status === 'unpaid' ? (
                                            <>
                                                <div className="no-pass-icon pending" style={{ color: '#f59e0b', background: '#fffbeb' }}>
                                                    <CreditCard size={48} />
                                                </div>
                                                <div className="status-badge-large" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' }}>Payment Required</div>
                                                <h3>Complete Your Payment</h3>
                                                <p>Your application is pending payment. Please pay the fee to proceed for approval.</p>
                                                <div className="application-summary">
                                                    <p><strong>Amount Due:</strong> ₹{pass.amount}</p>
                                                    <p><strong>Route:</strong> {pass.route_number || 'N/A'}</p>
                                                </div>
                                                <button className="btn-primary-large" onClick={initiateStandardPayment}>
                                                    Pay ₹{pass.amount} Now
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="no-pass-icon pending">
                                                    <Clock3 size={48} />
                                                </div>
                                                <div className="status-badge-large pending">Verification in Progress</div>
                                                <h3>Application Submitted</h3>
                                                <p>Your pass application is currently under review by the details provided.</p>
                                                <div className="application-summary">
                                                    <p><strong>Applied for:</strong> {pass.route_number ? `Route #${pass.route_number}` : 'Bus Pass'}</p>
                                                    <p><strong>Date:</strong> {new Date(pass.applied_at).toLocaleDateString()}</p>
                                                </div>
                                                <button className="btn-outline-large" disabled>
                                                    Check Status Later
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}

                                {!loading && pass && pass.status === 'rejected' && (
                                    <div className="no-pass-card rejected-state">
                                        <div className="no-pass-icon rejected">
                                            <AlertTriangle size={48} />
                                        </div>
                                        <div className="status-badge-large rejected">Application Rejected</div>
                                        <h3>Action Required</h3>
                                        <p>{pass.rejection_reason || 'Your application was rejected. Please check details and try again.'}</p>
                                        <button className="btn-primary-large" onClick={() => setShowApplyModal(true)}>
                                            Apply Again
                                        </button>
                                    </div>
                                )}

                                {!loading && pass && pass.status === 'active' && (
                                    <div className="pass-display-section">
                                        <div className="pass-card-container">
                                            <div className={`pass-card ${pass.status}`} id="digital-pass-card">
                                                <div className="pass-header-minimal">
                                                    <div className="profile-photo-container">
                                                        {user.profile_pic ? (
                                                            <img src={user.profile_pic} alt="Profile" className="profile-photo" />
                                                        ) : (
                                                            <div className="profile-photo-placeholder">
                                                                <User size={40} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h1 className="brand-title">QRide – SREC Campus Bus System</h1>
                                                    <h2 className="pass-title">STUDENT BUS PASS</h2>
                                                </div>

                                                <div className="pass-body-minimal">
                                                    <div className="qr-container-minimal">
                                                        {pass.qr_code ? (
                                                            <QRCodeCanvas
                                                                value={pass.qr_code}
                                                                size={200}
                                                                style={{ width: '100%', height: 'auto' }}
                                                            />
                                                        ) : (
                                                            <div className="qr-placeholder">No QR</div>
                                                        )}
                                                    </div>

                                                    <div className="student-details-minimal">
                                                        <h3 className="student-name">{user.name || 'Student Name'}</h3>
                                                        <p className="student-roll">Roll: {user.roll_number || 'N/A'}</p>
                                                        <div className="student-meta">
                                                            <span>{user.department || 'Dept'}</span>
                                                            <span>{user.year || 'N/A'}</span>
                                                        </div>

                                                        <div className="validity-block">
                                                            <span className="label">VALID UNTIL</span>
                                                            <span className="date">{pass.valid_until ? new Date(pass.valid_until).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="status-badge-minimal">
                                                        <CheckCircle2 size={16} />
                                                        <span>ACTIVE</span>
                                                    </div>

                                                    <div className="info-box-minimal">
                                                        <div className="info-item">
                                                            <MapPin size={16} />
                                                            <span>{pass.boarding_point || 'City'}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <Bus size={16} />
                                                            <span>Bus {pass.bus_number || 'Pending'} - {pass.boarding_point || 'City'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="pass-id-minimal">PASS ID: #{pass.id}</div>

                                                <button
                                                    className="btn-download-minimal"
                                                    onClick={handleDownloadPass}
                                                    disabled={downloading}
                                                >
                                                    <Download size={18} />
                                                    {downloading ? 'Saving...' : 'Download Pass'}
                                                </button>
                                            </div>

                                        </div>

                                        {/* Quick Actions Below Pass */}
                                        <div className="quick-actions-row">
                                            <button className="action-card" onClick={() => setShowRouteModal(true)}>
                                                <div className="icon-box warning">
                                                    <Shuffle size={20} />
                                                </div>
                                                <div className="text-box">
                                                    <h4>Change Route</h4>
                                                    <p>Request temporary change</p>
                                                </div>
                                            </button>

                                            <button className="action-card" onClick={() => initiateTicketPurchase()}>
                                                <div className="icon-box primary">
                                                    <Ticket size={20} />
                                                </div>
                                                <div className="text-box">
                                                    <h4>Buy Ticket</h4>
                                                    <p>One-time trip pass</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'Hostellers Pass' && (
                            <div className="flexible-travel-container animate-fade-in">
                                <div className="section-header">
                                    <h2>Hosteller's Pass</h2>
                                </div>

                                <div className="travel-options-grid">
                                    {/* Pay-Per-Ride Ticket */}
                                    <div className="option-card highlight" style={{ gridColumn: '1 / -1', maxWidth: '400px', margin: '0 auto' }}>
                                        <div className="option-icon">🎫</div>
                                        <h3>Pay-Per-Ride Ticket</h3>
                                        <p>Single trip ticket. Valid for 24 hours from purchase.</p>
                                        <div className="price-tag">₹ 50 <span>/ Ride</span></div>
                                        <button className="btn-option-primary" style={{ background: '#0f172a' }} onClick={initiateTicketPurchase}>
                                            Buy Ticket
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showRouteModal && (
                            <RouteChangeModal
                                isOpen={showRouteModal}
                                onClose={() => setShowRouteModal(false)}
                                userId={user.id}
                                currentRoute={pass?.route_number}
                                routes={routes}
                                onSubmit={async (data) => {
                                    const res = await safeFetch('/api/route-change/request', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(data)
                                    });
                                    if (!res.success) throw new Error(res.error || 'Failed');
                                    fetchMyRequests();
                                }}
                            />
                        )}

                        {selectedTicket && (
                            <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
                                <div className="modal-content" style={{ textAlign: 'center', maxWidth: '300px' }} onClick={e => e.stopPropagation()}>
                                    <button className="modal-close" onClick={() => setSelectedTicket(null)}><XCircle size={24} /></button>
                                    <h3>One-Time Ticket</h3>
                                    <p style={{ marginBottom: '20px', color: '#64748b' }}>Route #{selectedTicket.route_number}</p>
                                    <div style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'inline-block' }}>
                                        <QRCodeCanvas value={selectedTicket.qr_code} size={200} />
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '15px' }}>Show this QR to the conductor. <br /> Valid for one scan only.</p>
                                </div>
                            </div>
                        )}

                        {showSettings && (
                            <div className="modal-overlay" onClick={() => setShowSettings(false)}>
                                <div className="modal-content">
                                    <button className="modal-close" onClick={() => setShowSettings(false)}><XCircle size={24} /></button>
                                    <h2>Profile Settings</h2>
                                    <div className="profile-details">
                                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                            <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto' }}>
                                                <img
                                                    src={user.profile_pic || "https://via.placeholder.com/100"}
                                                    alt="Profile"
                                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #eee' }}
                                                />
                                                <label htmlFor="settings-photo-upload" style={{
                                                    position: 'absolute',
                                                    bottom: '0',
                                                    right: '0',
                                                    background: '#2563eb',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    padding: '6px',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                                }}>
                                                    <Camera size={14} />
                                                </label>
                                                <input
                                                    type="file"
                                                    id="settings-photo-upload"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = async () => {
                                                                // Optimistic update
                                                                if (onUpdateUser) onUpdateUser({ ...user, profile_pic: reader.result });

                                                                // API Call
                                                                await safeFetch('/api/user/profile-pic', {
                                                                    method: 'PUT',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ userId: user.id, profilePic: reader.result })
                                                                });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <p><strong>Name:</strong> {user.name}</p>
                                        <p><strong>Email:</strong> {user.email}</p>
                                        <p><strong>Roll Number:</strong> {user.roll_number}</p>
                                    </div>
                                    <button className="btn-logout" onClick={onLogout} style={{ width: '100%', marginTop: '20px' }}>
                                        <LogOut size={18} /> Logout
                                    </button>
                                </div>
                            </div>
                        )}

                        {showApplyModal && (
                            <ApplyPassModal
                                isOpen={showApplyModal}
                                onClose={() => setShowApplyModal(false)}
                                userId={user.id}
                                onApplySubmit={async () => {
                                    setShowApplyModal(false);
                                    fetchPassData();
                                }}
                            />
                        )}

                        {paymentModalData && (
                            <PaymentModal
                                isOpen={!!paymentModalData}
                                onClose={() => setPaymentModalData(null)}
                                paymentDetails={paymentModalData}
                                onPaymentSuccess={async () => {
                                    if (paymentModalData && typeof paymentModalData.apiCall === 'function') {
                                        return await paymentModalData.apiCall();
                                    }
                                    return true;
                                }}
                            />
                        )}

                        {activeTab === 'Verify Checker' && (
                            <div className="tab-pane active slide-in">
                                <div className="no-pass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                                    <div className="no-pass-icon" style={{ background: '#f0f9ff', color: '#0369a1' }}>
                                        <ShieldCheck size={48} />
                                    </div>
                                    <h3>Verify Bus Checker</h3>
                                    <p>Scan the official QR code provided by the bus checker to verify their SREC authorization.</p>

                                    {verificationStatus ? (
                                        <div className={`verification-result-container ${verificationStatus.valid ? 'valid' : 'invalid'}`} style={{
                                            marginTop: '24px',
                                            padding: '24px',
                                            borderRadius: '16px',
                                            background: verificationStatus.valid ? '#f0fdf4' : '#fef2f2',
                                            border: `1px solid ${verificationStatus.valid ? '#bbf7d0' : '#fecaca'}`,
                                            width: '100%'
                                        }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                                {verificationStatus.valid ? (
                                                    <CheckCircle2 size={48} style={{ color: '#16a34a' }} />
                                                ) : (
                                                    <XCircle size={48} style={{ color: '#dc2626' }} />
                                                )}
                                                <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: verificationStatus.valid ? '#166534' : '#991b1b' }}>
                                                    {verificationStatus.message}
                                                </h4>
                                                {verificationStatus.valid && (
                                                    <div style={{ textAlign: 'center' }}>
                                                        <p style={{ color: '#15803d', fontSize: '0.875rem', fontWeight: '500' }}>Official Official Identity</p>
                                                        <p style={{ color: '#111827', fontSize: '1.125rem', fontWeight: '600', marginTop: '4px' }}>{verificationStatus.name}</p>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => setVerificationStatus(null)}
                                                    className="btn-outline"
                                                    style={{ marginTop: '12px', padding: '8px 24px' }}
                                                >
                                                    Scan Again
                                                </button>
                                            </div>
                                        </div>
                                    ) : verifying ? (
                                        <div className="verifying-state" style={{ marginTop: '24px', textAlign: 'center' }}>
                                            <Loader2 className="animate-spin text-blue-500" size={40} style={{ margin: '0 auto', color: '#3b82f6' }} />
                                            <p style={{ marginTop: '12px', color: '#64748b' }}>Authenticating identity...</p>
                                        </div>
                                    ) : (
                                        <div className="scanner-container" style={{ marginTop: '24px', width: '100%' }}>
                                            <CheckerScanner onScanResult={handleCheckerScan} />
                                        </div>
                                    )}

                                    <div style={{ marginTop: '24px', padding: '12px', borderRadius: '8px', background: '#f8fafc', fontSize: '0.75rem', color: '#64748b', textAlign: 'left' }}>
                                        <strong>Privacy Note:</strong> This scanner is only for identifying official SREC bus checkers. No personal camera data is stored or transmitted.
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;


