import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import {
    Scan,
    CheckCircle,
    XCircle,
    Settings,
    Users,
    FileText,
    Check,
    Bus,
    Download,
    Search,
    RotateCw,
    BarChart3,
    TrendingUp,
    AlertTriangle,
    Clock,
    Bell,
    AlertCircle,
    LogOut,
    Filter,
    MapPin,
    ChevronDown,
    Menu,
    X,
    ShieldCheck,
    Eye
} from 'lucide-react';
import './AdminDashboard.css';
import ProfileSettings from './ProfileSettings';
import { safeFetch } from '../utils/api';

const getDaysRemaining = (validUntil) => {
    if (!validUntil) return null;
    const today = new Date();
    const expiry = new Date(validUntil);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};


const AdminDashboard = ({ onLogout, onUpdateUser }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [activeTab, setActiveTab] = useState('verifier');
    const [scanResult, setScanResult] = useState(null);
    const [studentId, setStudentId] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showCheckerQR, setShowCheckerQR] = useState(false);

    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);

    // Data states
    const [students, setStudents] = useState([]);
    const [applications, setApplications] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [stats, setStats] = useState({ totalStudents: 0, activePasses: 0, pendingApplications: 0, totalApplications: 0, expiredPasses: 0 });
    const [filters, setFilters] = useState({ department: 'All', year: 'All' });
    const [selectedRoute, setSelectedRoute] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [newRoute, setNewRoute] = useState({ route_number: '', route_name: '', stops: '', timings: '', bus_number: '' });
    const [editingRoute, setEditingRoute] = useState(null);
    const [rejectionModal, setRejectionModal] = useState({ isOpen: false, passId: null, reason: '' });

    // New State for Route Requests
    const [routeRequests, setRouteRequests] = useState([]);

    const fetchStats = useCallback(async () => {
        try {
            const data = await safeFetch('/api/admin/stats');
            setStats(data);
        } catch (err) { }
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await safeFetch(`/api/notifications/${user.id}`);
            if (data) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAsRead = async () => {
        try {
            await safeFetch('/api/notifications/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        } catch (error) {
            console.error("Failed to mark notifications as read", error);
        }
    };

    const handleBellClick = () => {
        if (!showNotifications && unreadCount > 0) {
            markAsRead();
        }
        setShowNotifications(!showNotifications);
    };

    const fetchRoutes = useCallback(async () => {
        try {
            const data = await safeFetch('/api/routes');
            setRoutes(data);
        } catch (err) { }
    }, []);

    const fetchRouteRequests = useCallback(async () => {
        try {
            const data = await safeFetch('/api/admin/route-change-requests');
            setRouteRequests(data);
        } catch (err) { }
    }, []);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const data = await safeFetch('/api/admin/students');
            console.log("Admin Students Data Fetched:", data);
            setStudents(data);
        } catch (err) {
            console.error("Error fetching students:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await safeFetch('/api/admin/applications');
            setApplications(data);
        } catch (err) {
            console.error("Error fetching applications:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleRequestStatus = async (requestId, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this request?`)) return;
        try {
            await safeFetch('/api/admin/route-change/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, status })
            });
            fetchRouteRequests();
        } catch (err) {
            alert("Failed: " + err.message);
        }
    };

    const handleUpdateStatus = async (id, status, reason = '') => {
        try {
            await safeFetch('/api/admin/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passId: id, status, reason })
            });
            fetchApplications();
            fetchStats();
            setRejectionModal({ isOpen: false, passId: null, reason: '' });
        } catch (err) {
            alert("Update failed: " + err.message);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchNotifications();

        // Polling for notifications
        const pollInterval = setInterval(fetchNotifications, 300000); // 5 mins
        return () => clearInterval(pollInterval);
    }, [user.id]);

    // Close notifications on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (activeTab === 'records') fetchStudents();
        if (activeTab === 'approvals') fetchApplications();
        if (activeTab === 'routes') fetchRoutes();
        if (activeTab === 'requests') fetchRouteRequests();
    }, [activeTab, fetchStudents, fetchApplications, fetchRoutes, fetchRouteRequests]);

    const filteredStudents = students.filter(s => {
        const matchesDept = filters.department === 'All' || s.department === filters.department;
        const matchesYear = filters.year === 'All' || s.year === filters.year;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = s.name.toLowerCase().includes(searchLower) ||
            s.roll_number.toLowerCase().includes(searchLower);
        return matchesDept && matchesYear && matchesSearch;
    });

    const handleSimulateScan = async () => {
        if (!studentId) return;
        setIsScanning(true);
        setScanResult(null);

        try {
            const isQR = studentId.includes('PASS-') || studentId.includes('PASS_ID:') || studentId.includes('QRI_');

            if (isQR) {
                // Use the new Live Verification endpoint
                const res = await fetch('/api/pass/verify-live', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        qrString: studentId,
                        routeNumber: selectedRoute === 'All' ? null : selectedRoute
                    })
                });
                const data = await res.json();
                setScanResult(data);
            } else {
                // Manual Verification (Roll No / ID)
                const res = await fetch('/api/pass/verify-manual', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier: studentId })
                });

                if (res.ok) {
                    const data = await res.json();
                    setScanResult(data);
                } else {
                    const errData = await res.json();
                    setScanResult(errData);
                }
            }
        } catch (err) {
            setScanResult({ valid: false, message: 'Connection Error' });
        } finally {
            setIsScanning(false);
        }
    };

    const handleAddRoute = async (e) => {
        e.preventDefault();
        try {
            const url = editingRoute ? `/api/routes/${editingRoute.id}` : '/api/routes';
            const method = editingRoute ? 'PUT' : 'POST';

            await safeFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRoute)
            });

            setNewRoute({ route_number: '', route_name: '', stops: '', timings: '', bus_number: '' });
            setEditingRoute(null);
            fetchRoutes();
        } catch (err) {
            alert("Operation failed: " + err.message);
        }
    };

    const handleEditRoute = (route) => {
        setEditingRoute(route);
        setNewRoute({
            route_number: route.route_number,
            route_name: route.route_name,
            stops: route.stops,
            timings: route.timings || '',
            bus_number: route.bus_number || ''
        });
    };

    const handleDeleteRoute = async (id) => {
        if (!window.confirm("Delete this route?")) return;
        try {
            await safeFetch(`/api/routes/${id}`, { method: 'DELETE' });
            fetchRoutes();
        } catch (err) {
            alert("Delete failed: " + err.message);
        }
    };

    const handleExport = () => {
        const headers = ["Name", "Roll No", "Dept", "Year", "Email", "Status"];
        const rows = students.map(s => [s.name, s.roll_number, s.department, s.year, s.email, s.pass_status || 'No Pass']);
        downloadCSV(headers, rows, "student_pass_records.csv");
    };

    const downloadCSV = (headers, rows, filename) => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(r => r.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadPDF = (title, headers, data, filename) => {
        try {
            const doc = new jsPDF();

            doc.setFontSize(18);
            doc.text(title, 14, 22);
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

            // Functional usage of autoTable for better compatibility
            autoTable(doc, {
                head: [headers],
                body: data,
                startY: 40,
                theme: 'striped',
                headStyles: {
                    fillColor: [63, 81, 181],
                    textColor: [255, 255, 255],
                    fontSize: 11,
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 10,
                    cellPadding: 4,
                    halign: 'left'
                },
                alternateRowStyles: {
                    fillColor: [245, 247, 250]
                },
                columnStyles: {
                    0: { cellWidth: 35 }, // Register Number
                    2: { halign: 'center' } // Bus Number
                }
            });

            doc.save(filename);
        } catch (err) {
            console.error("PDF Generation Error:", err);
            alert("Failed to generate PDF: " + err.message);
        }
    };

    const handleExportDefaulters = async () => {
        console.log("Fetching Defaulters Report...");
        try {
            const defaulters = await safeFetch('/api/admin/reports/defaulters');

            if (!defaulters || defaulters.length === 0) {
                alert("No fee defaulters found.");
                return;
            }

            const headers = ["Register Number", "Name", "Bus Number", "Stopping Name", "Payment Status"];
            const rows = defaulters.map(s => [
                s.roll_number || 'N/A',
                s.name || 'N/A',
                s.bus_number || 'N/A',
                s.boarding_point || 'N/A',
                (s.payment_status || 'Unknown').toUpperCase()
            ]);

            downloadPDF(
                "Fee Defaulters List",
                headers,
                rows,
                `Defaulters_Report_${new Date().toISOString().split('T')[0]}.pdf`
            );
        } catch (err) {
            alert("Failed to fetch defaulters: " + err.message);
        }
    };

    const handleExportExpired = async () => {
        console.log("Fetching Expired Report...");
        try {
            const expired = await safeFetch('/api/admin/reports/expired');

            if (!expired || expired.length === 0) {
                alert("No expired passes found.");
                return;
            }

            const headers = ["Register Number", "Name", "Bus Number", "Stopping Name", "Valid Until"];
            const rows = expired.map(s => [
                s.roll_number || 'N/A',
                s.name || 'N/A',
                s.bus_number || 'N/A',
                s.boarding_point || 'N/A',
                s.valid_until ? new Date(s.valid_until).toLocaleDateString() : 'N/A'
            ]);

            downloadPDF(
                "Expired Student Passes List",
                headers,
                rows,
                `Expired_Report_${new Date().toISOString().split('T')[0]}.pdf`
            );
        } catch (err) {
            alert("Failed to fetch expired students: " + err.message);
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="container dashboard-container-admin">
                <div className="dashboard-header-wrapper">
                    <div className="admin-header">
                        <div className="header-info">
                            <h1>Admin Dashboard</h1>
                            <p>Logged in as: {user.name} (Administrator)</p>
                        </div>
                        <div className="header-actions">
                            <div className="notification-wrapper" ref={notifRef}>
                                <button className="notification-btn" onClick={handleBellClick}>
                                    <Bell size={24} />
                                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                                </button>

                                {showNotifications && (
                                    <div className="notification-dropdown">
                                        <div className="notification-header">
                                            <h3>Notifications</h3>
                                            <button className="mark-read-btn" onClick={markAsRead}>Mark all read</button>
                                        </div>
                                        <div className="notification-list">
                                            {notifications.length > 0 ? (
                                                notifications.map(notif => (
                                                    <div key={notif.id} className={`notification-item ${notif.is_read ? '' : 'unread'}`}>
                                                        <div className={`notif-icon ${notif.type}`}>
                                                            {notif.type === 'warning' ? <AlertCircle size={16} /> :
                                                                notif.type === 'success' ? <CheckCircle size={16} /> :
                                                                    <Clock size={16} />}
                                                        </div>
                                                        <div className="notif-content">
                                                            <p>{notif.message}</p>
                                                            <span className="notif-time">{new Date(notif.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="empty-notif">No new notifications</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button className="settings-toggle-btn" onClick={() => setShowSettings(true)} title="Profile Settings">
                                {user.profile_pic ? (
                                    <img src={user.profile_pic} alt="Profile" className="header-avatar" />
                                ) : (
                                    <Settings size={28} />
                                )}
                            </button>

                            <button className="qr-badge-btn" onClick={() => setShowCheckerQR(true)} title="My Verification QR" style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f1',
                                padding: '8px 12px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#475569',
                                fontWeight: '600',
                                fontSize: '13px',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}>
                                <Scan size={18} />
                                <span>Checker ID</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="admin-tabs">
                    <button className={`tab-btn ${activeTab === 'verifier' ? 'active' : ''}`} onClick={() => setActiveTab('verifier')}>
                        <Scan size={18} /> Pass Verifier
                    </button>
                    <button className={`tab-btn ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
                        <FileText size={18} /> Approval Requests
                    </button>
                    <button className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
                        <RotateCw size={18} /> Route Requests
                    </button>
                    <button className={`tab-btn ${activeTab === 'routes' ? 'active' : ''}`} onClick={() => setActiveTab('routes')}>
                        <Bus size={18} /> Routes
                    </button>
                    <button className={`tab-btn ${activeTab === 'records' ? 'active' : ''}`} onClick={() => setActiveTab('records')}>
                        <Users size={18} /> Student Records
                    </button>
                    <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
                        <BarChart3 size={18} /> Analytics
                    </button>
                </div>

                {activeTab === 'verifier' && (
                    <div className="scanner-section">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <span className="stat-value">{stats.totalApplications}</span>
                                <span className="stat-label">Total Applications</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-value">{stats.pendingApplications}</span>
                                <span className="stat-label">Pending Approvals</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-value">{stats.activePasses}</span>
                                <span className="stat-label">Active Passes</span>
                            </div>
                        </div>

                        <div className="scanner-box">
                            <div className="scan-icon-pulse"><Scan size={64} /></div>
                            <h2>Pass Verifier</h2>
                            <p>Enter Student ID or QR String to verify</p>
                            <div className="verify-controls">
                                <div className="route-select-wrapper">
                                    <Bus size={18} />
                                    <select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)}>
                                        <option value="All">All Routes</option>
                                        {routes.map(r => (
                                            <option key={r.id} value={r.route_number}>Route {r.route_number}</option>
                                        ))}
                                    </select>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter Student ID or QR String"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSimulateScan()}
                                />
                                <button className="btn-verify" onClick={handleSimulateScan} disabled={isScanning}>
                                    {isScanning ? 'Verifying...' : 'Verify Pass'}
                                </button>
                            </div>
                        </div>

                        {scanResult && (
                            <div className={`scan-result-card ${scanResult.valid ? 'valid' : (scanResult.type === 'warning' ? 'warning' : 'invalid')}`}>

                                <div className="result-icon">
                                    {scanResult.valid ? <CheckCircle size={48} /> : <XCircle size={48} />}
                                </div>
                                <h3>{scanResult.message}</h3>
                                {scanResult.data && scanResult.data.profile_pic && (
                                    <div className="scan-photo-wrapper">
                                        <img
                                            src={scanResult.data.profile_pic}
                                            alt="Student Photo"
                                            className="scan-result-photo"
                                        />
                                    </div>
                                )}
                                <p>{scanResult.valid ? `Pass sequence verified for student` : 'Scanning security check failed'}</p>
                                {scanResult.subMessage && <p className="sub-message">{scanResult.subMessage}</p>}
                                {scanResult.valid && (
                                    <div className="result-details">
                                        <div className="res-name">{scanResult.data.name}</div>
                                        <div className="res-roll">{scanResult.data.roll_number}</div>

                                        {/* Added Bus and Stop Details */}
                                        {(scanResult.data.bus_route_bus_number || scanResult.data.boarding_point) && (
                                            <div className="student-sub-info" style={{ flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                                {scanResult.data.bus_route_bus_number && (
                                                    <div className="detail-row highlight">
                                                        <span className="detail-label">Bus Number</span>
                                                        <span className="detail-value">{scanResult.data.bus_route_bus_number}</span>
                                                    </div>
                                                )}
                                                {scanResult.data.boarding_point && (
                                                    <div className="detail-row highlight">
                                                        <span className="detail-label">Stopping Name</span>
                                                        <span className="detail-value">{scanResult.data.boarding_point}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="student-sub-info">
                                            <span>{scanResult.data.department} - {scanResult.data.year}</span>
                                        </div>
                                        <div className="expiry-tag">
                                            Expires: {new Date(scanResult.data.valid_until).toLocaleDateString()}
                                            {(() => {
                                                const days = getDaysRemaining(scanResult.data.valid_until);
                                                if (days !== null) {
                                                    if (days < 0) return <span className="badge-expired">EXPIRED</span>;
                                                    if (days <= 7) return <span className="badge-soon">EXPIRING SOON</span>;
                                                }
                                                return null;
                                            })()}
                                        </div>
                                        Rides: {scanResult.data.usage_count} / {scanResult.data.usage_limit}
                                    </div>
                                )}
                                {scanResult.data && scanResult.data.secondary_routes && scanResult.data.secondary_routes.length > 0 && (
                                    <div className="allowed-routes-tag" style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                                        <strong>Authorized Interchanges:</strong> {scanResult.data.secondary_routes.join(', ')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}


                {activeTab === 'approvals' && (
                    <div className="approvals-section">
                        <div className="section-header">
                            <h3>Pending Applications</h3>
                            <span className="count-badge">{applications.filter(a => a.status === 'pending').length} Pending</span>
                        </div>
                        <div className="records-table-container">
                            <table className="records-table">
                                <thead>
                                    <tr>
                                        <th>Student Details</th>
                                        <th>Academic Info</th>
                                        <th>Route & Duration</th>
                                        <th>Applied Date</th>
                                        <th>Documents</th>
                                        <th>Payment</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="7">Loading applications...</td></tr>
                                    ) : applications.length > 0 ? (
                                        applications.map(app => (
                                            <tr key={app.id} className={app.status}>
                                                <td>
                                                    <div className="student-name-cell">
                                                        {app.name}
                                                        <span className="student-email">{app.roll_number}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="academic-info-cell">
                                                        <span className="dept-badge">{app.department}</span>
                                                        <span className="year-val">{app.year}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="boarding-info">
                                                        <strong>{app.boarding_point}</strong>
                                                        <div className="sub">{app.duration} ({app.route_number || 'N/A'})</div>
                                                        {app.secondary_routes && app.secondary_routes.length > 0 && (
                                                            <div className="sub-routes" style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                                                + Interchanges: {app.secondary_routes.join(', ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="date-cell">
                                                    {new Date(app.applied_at).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <div className="doc-btns">
                                                        <button onClick={() => setSelectedDoc({ type: 'ID Proof', data: app.id_proof })} title="View ID Proof"><FileText size={14} /> ID</button>
                                                        {app.photo && (
                                                            <button onClick={() => setSelectedDoc({ type: 'Photo', data: app.photo })} title="View Photo" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <img src={app.photo} alt="Thumb" style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                                                                <Eye size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="payment-cell-admin">
                                                        <span className={`status-pill ${app.payment_status}`}>

                                                            {app.payment_status.toUpperCase()}
                                                        </span>
                                                        <span className="pay-amt">₹{app.amount}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {app.status === 'pending' ? (
                                                        <div className="action-btns">
                                                            <button
                                                                className="approve-btn"
                                                                onClick={() => handleUpdateStatus(app.id, 'active')}
                                                                title="Approve (Students can also pay after approval)"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button className="reject-btn" onClick={() => setRejectionModal({ isOpen: true, passId: app.id, reason: '' })} title="Reject"><X size={16} /></button>
                                                        </div>
                                                    ) : (
                                                        <span className={`status-pill ${app.status}`}>{app.status.toUpperCase()}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="7">No applications found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'routes' && (
                    <div className="routes-section">
                        <div className="section-header">
                            <h3>Bus Route Management</h3>
                        </div>
                        <div className="route-management-grid">
                            <div className="add-route-card">
                                <h4>{editingRoute ? 'Edit Route' : 'Add New Route'}</h4>
                                <form onSubmit={handleAddRoute}>
                                    <div className="form-group-admin">
                                        <label>Route #</label>
                                        <input type="text" value={newRoute.route_number} onChange={e => setNewRoute({ ...newRoute, route_number: e.target.value })} placeholder="e.g. 101" required />
                                    </div>
                                    <div className="form-group-admin">
                                        <label>Route Name</label>
                                        <input type="text" value={newRoute.route_name} onChange={e => setNewRoute({ ...newRoute, route_name: e.target.value })} placeholder="Green Valley Route" required />
                                    </div>
                                    <div className="form-row-admin">
                                        <div className="form-group-admin">
                                            <label>Bus Number</label>
                                            <input type="text" value={newRoute.bus_number} onChange={e => setNewRoute({ ...newRoute, bus_number: e.target.value })} placeholder="TN-37-B-1234" />
                                        </div>
                                        <div className="form-group-admin">
                                            <label>Timings</label>
                                            <input type="text" value={newRoute.timings} onChange={e => setNewRoute({ ...newRoute, timings: e.target.value })} placeholder="07:30 AM - 05:00 PM" />
                                        </div>
                                    </div>
                                    <div className="form-group-admin">
                                        <label>Stops (Comma separated)</label>
                                        <textarea value={newRoute.stops} onChange={e => setNewRoute({ ...newRoute, stops: e.target.value })} placeholder="Main Gate, Library, Hostels" required />
                                    </div>
                                    <div className="form-actions-admin">
                                        <button type="submit" className="btn-add-route">{editingRoute ? 'Update Route' : 'Add Route'}</button>
                                        {editingRoute && <button type="button" className="btn-cancel-edit" onClick={() => {
                                            setEditingRoute(null);
                                            setNewRoute({ route_number: '', route_name: '', stops: '', timings: '', bus_number: '' });
                                        }}>Cancel</button>}
                                    </div>
                                </form>
                            </div>
                            <div className="routes-list-card">
                                <h4>Available Routes</h4>
                                <div className="routes-v-list">
                                    {routes.map(r => (
                                        <div key={r.id} className="route-v-item">
                                            <div className="r-main">
                                                <div className="r-head">
                                                    <span className="r-num">#{r.route_number}</span>
                                                    <span className="r-name">{r.route_name}</span>
                                                </div>
                                                <div className="r-details">
                                                    <div className="r-detail-item"><Bus size={12} /> {r.bus_number || 'No Bus Assigned'}</div>
                                                    <div className="r-detail-item"><Clock size={12} /> {r.timings || 'No Timings Set'}</div>
                                                </div>
                                                <div className="r-stops">{r.stops}</div>
                                            </div>
                                            <div className="r-actions">
                                                <button onClick={() => handleEditRoute(r)} title="Edit"><Settings size={14} /></button>
                                                <button onClick={() => handleDeleteRoute(r.id)} title="Delete" className="del-btn"><X size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="analytics-section">
                        <div className="section-header">
                            <h3>System Insights & Usage</h3>
                            <button className="refresh-btn" onClick={fetchStats}><RotateCw size={16} /> Update Data</button>
                        </div>

                        <div className="analytics-grid">
                            <div className="analytics-card main-stat">
                                <div className="stat-icon-bg"><TrendingUp size={24} /></div>
                                <div className="stat-content">
                                    <span className="stat-title">Active Passes</span>
                                    <span className="stat-value">{stats.activePasses}</span>
                                    <p className="stat-desc">Currently valid for travel</p>
                                </div>
                            </div>
                            <div className="analytics-card warning-stat">
                                <div className="stat-icon-bg"><AlertTriangle size={24} /></div>
                                <div className="stat-content">
                                    <span className="stat-title">Expired/Rejected</span>
                                    <span className="stat-value">{stats.expiredPasses || 0}</span>
                                    <p className="stat-desc">Inactive or outdated passes</p>
                                </div>
                            </div>
                            <div className="analytics-card info-stat">
                                <div className="stat-icon-bg"><FileText size={24} /></div>
                                <div className="stat-content">
                                    <span className="stat-title">App Success Rate</span>
                                    <span className="stat-value">
                                        {stats.totalApplications > 0
                                            ? Math.round((stats.activePasses / stats.totalApplications) * 100)
                                            : 0}%
                                    </span>
                                    <p className="stat-desc">Approval relative to total apps</p>
                                </div>
                            </div>
                        </div>

                        <div className="route-usage-container">
                            <h4>Route-wise Scanning Activity</h4>
                            <p className="sub-header">Total scans recorded per bus route</p>
                            <div className="usage-bars-list">
                                {stats.routeUsage && stats.routeUsage.length > 0 ? (
                                    stats.routeUsage.map(route => {
                                        const maxScans = Math.max(...stats.routeUsage.map(r => r.scan_count), 1);
                                        const percentage = Math.round((route.scan_count / maxScans) * 100);
                                        return (
                                            <div key={route.route_number} className="usage-row">
                                                <div className="usage-info">
                                                    <span className="u-route">Route {route.route_number}</span>
                                                    <span className="u-name">{route.route_name}</span>
                                                    <span className="u-count">{route.scan_count} Scans</span>
                                                </div>
                                                <div className="usage-bar-bg">
                                                    <div className="usage-bar-fill" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="no-data-msg">No scan data available yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'records' && (
                    <div className="records-section">
                        <div className="records-filters-container">
                            <div className="search-box-admin">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by Name or Roll Number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="filter-group-admin">
                                <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
                                    <option value="All">All Departments</option>
                                    <option value="CSE">CSE</option>
                                    <option value="ECE">ECE</option>
                                    <option value="ME">ME</option>
                                    <option value="CIVIL">CIVIL</option>
                                </select>
                                <select value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })}>
                                    <option value="All">All Years</option>
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                </select>
                                <button className="refresh-btn" onClick={fetchStudents} title="Refresh Records"><RotateCw size={16} /></button>
                                <div className="export-group" style={{ display: 'flex', gap: '8px' }}>
                                    <button className="export-btn" onClick={handleExport} title="Export All"><Download size={16} /> All</button>
                                    <button className="export-btn warning" onClick={handleExportDefaulters} style={{ backgroundColor: '#f59e0b' }}><Download size={16} /> Defaulters</button>
                                    <button className="export-btn danger" onClick={handleExportExpired} style={{ backgroundColor: '#ef4444' }}><Download size={16} /> Expired</button>
                                </div>
                            </div>
                        </div>
                        <div className="records-table-container">
                            <table className="records-table">
                                <thead>
                                    <tr>
                                        <th>Roll No</th>
                                        <th>Name</th>
                                        <th>Dept / Year</th>
                                        <th>Pass Status</th>
                                        <th>Valid Until</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5">Loading students...</td></tr>
                                    ) : filteredStudents.map(student => (
                                        <tr key={student.id}>
                                            <td>{student.roll_number}</td>
                                            <td>
                                                <div className="student-name-cell">
                                                    {student.name}
                                                    <span className="student-email">{student.email}</span>
                                                </div>
                                                {student.valid_until && (
                                                    (() => {
                                                        const days = getDaysRemaining(student.valid_until);
                                                        if (days !== null) {
                                                            if (days < 0) {
                                                                return (
                                                                    <div className="expiry-alert-sm danger" style={{
                                                                        fontSize: '11px',
                                                                        color: '#b91c1c',
                                                                        background: '#fee2e2',
                                                                        padding: '2px 6px',
                                                                        borderRadius: '4px',
                                                                        marginTop: '4px',
                                                                        display: 'inline-block',
                                                                        fontWeight: '600'
                                                                    }}>
                                                                        <AlertCircle size={10} style={{ marginRight: '4px' }} />
                                                                        Pass Expired
                                                                    </div>
                                                                );
                                                            } else if (days <= 7) {
                                                                return (
                                                                    <div className="expiry-alert-sm warning" style={{
                                                                        fontSize: '11px',
                                                                        color: '#b45309',
                                                                        background: '#fef3c7',
                                                                        padding: '2px 6px',
                                                                        borderRadius: '4px',
                                                                        marginTop: '4px',
                                                                        display: 'inline-block',
                                                                        fontWeight: '600'
                                                                    }}>
                                                                        <Clock size={10} style={{ marginRight: '4px' }} />
                                                                        Expires on {new Date(student.valid_until).toLocaleDateString()}
                                                                    </div>
                                                                );
                                                            }
                                                        }
                                                        return null;
                                                    })()
                                                )}
                                            </td>
                                            <td>{student.department} / {student.year}</td>
                                            <td>
                                                <span className={`status-pill ${student.pass_status || 'none'}`}>

                                                    {(student.pass_status || 'No Pass').toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                {student.valid_until ? new Date(student.valid_until).toLocaleDateString() : 'N/A'}
                                                {(() => {
                                                    const days = getDaysRemaining(student.valid_until);
                                                    if (days !== null) {
                                                        if (days < 0) return <span className="badge-expired">Expired</span>;
                                                        if (days <= 7) return <span className="badge-soon">Expiring</span>;
                                                    }
                                                    return null;
                                                })()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="requests-section">
                        <div className="section-header">
                            <h3>Temporary Route Change Requests</h3>
                            <span className="count-badge">{routeRequests.filter(r => r.status === 'pending').length} Pending</span>
                        </div>

                        <div className="requests-grid">
                            {routeRequests.map(req => (
                                <div key={req.id} className="request-card-admin">
                                    <div className="req-header">
                                        <span className={`status-pill ${req.status}`}>{req.status}</span>
                                        <span className="req-date">{new Date(req.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="req-body">
                                        <h4>{req.name} <span className="sub-text">({req.roll_number})</span></h4>
                                        <div className="route-change-arrow">
                                            <span className="route-pill">#{req.original_route || 'N/A'}</span>
                                            <span className="arrow">➔</span>
                                            <span className="route-pill highlight">#{req.new_route}</span>
                                        </div>
                                        <div className="trip-info">
                                            <strong>Travel Date:</strong> {new Date(req.travel_date).toLocaleDateString()}
                                        </div>
                                        <p className="req-reason">"{req.reason}"</p>
                                    </div>
                                    {req.status === 'pending' && (
                                        <div className="req-actions">
                                            <button className="btn-reject-sm" onClick={() => handleRequestStatus(req.id, 'rejected')}>
                                                <XCircle size={16} /> Reject
                                            </button>
                                            <button className="btn-approve-sm" onClick={() => handleRequestStatus(req.id, 'approved')}>
                                                <CheckCircle size={16} /> Approve
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {routeRequests.length === 0 && <p className="no-data">No route change requests found.</p>}
                        </div>
                    </div>
                )}
            </div>


            {
                showSettings && (
                    <ProfileSettings
                        user={user}
                        onClose={() => setShowSettings(false)}
                        onUpdateUser={onUpdateUser}
                    />
                )
            }

            {
                rejectionModal.isOpen && (
                    <div className="modal-overlay rejection-modal-overlay">
                        <div className="modal-content rejection-modal">
                            <div className="rejection-modal-header">
                                <div className="rejection-icon-wrapper">
                                    <AlertCircle size={32} />
                                </div>
                                <h3>Rejection Reason</h3>
                                <p>Please state why this application is being declined.</p>
                            </div>

                            <div className="rejection-modal-body">
                                <label className="rejection-label">Detailed Reason</label>
                                <textarea
                                    placeholder="e.g. ID proof is blurry, incorrect student details, or duplicate application..."
                                    value={rejectionModal.reason}
                                    onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                                    autoFocus
                                    className="rejection-textarea"
                                />
                                <div className="rejection-tips">
                                    <div className="tip-item">• Be specific to help the student correct it.</div>
                                    <div className="tip-item">• Use professional and clear language.</div>
                                </div>
                            </div>

                            <div className="rejection-modal-footer">
                                <button className="btn-cancel-rejection" onClick={() => setRejectionModal({ isOpen: false, passId: null, reason: '' })}>
                                    Go Back
                                </button>
                                <button
                                    className="btn-confirm-rejection"
                                    onClick={() => handleUpdateStatus(rejectionModal.passId, 'rejected', rejectionModal.reason)}
                                    disabled={!rejectionModal.reason.trim()}
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                selectedDoc && (
                    <div className="modal-overlay doc-preview-overlay">
                        <div className="modal-content doc-modal">
                            <button className="modal-close" onClick={() => setSelectedDoc(null)}><X size={24} /></button>
                            <div className="doc-header">
                                <h3>{selectedDoc.type} Preview</h3>
                            </div>
                            <div className="doc-view">
                                <img src={selectedDoc.data} alt="Document" />
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showCheckerQR && (
                    <div className="modal-overlay checker-qr-overlay">
                        <div className="modal-content checker-qr-modal" style={{ textAlign: 'center', maxWidth: '400px' }}>
                            <button className="modal-close" onClick={() => setShowCheckerQR(false)}><X size={24} /></button>
                            <div className="checker-qr-header" style={{ marginBottom: '20px' }}>
                                <div className="qr-badge-icon" style={{ background: '#e0f2fe', color: '#0369a1', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', marginBottom: '12px', margin: '0 auto' }}>
                                    <ShieldCheck size={30} style={{ margin: 'auto' }} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>Official Checker QR</h3>
                                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Students scan this to verify your SREC authorization</p>
                            </div>

                            <div className="qr-display-area" style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px dashed #cbd5e1', marginBottom: '20px' }}>
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/verify-checker/${user.checker_id}`)}`}
                                    alt="Checker Verification QR"
                                    style={{ width: '100%', maxWidth: '200px', margin: '0 auto', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <div className="checker-id-pill" style={{ marginTop: '16px', display: 'inline-block', background: '#ffffff', border: '1px solid #e2e8f0', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>
                                    ID: {user.checker_id}
                                </div>
                            </div>

                            <div className="qr-instructions" style={{ textAlign: 'left', background: '#f0f9ff', padding: '12px', borderRadius: '10px', fontSize: '0.75rem', color: '#0369a1' }}>
                                <strong>How to use:</strong> Show this QR to students during pass verification. It opens an official SREC page confirming your active identity.
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default AdminDashboard;

// Verified and fixed syntax errors at 2026-02-15 21:09:07.033704
