import React from 'react';

const GlobalFooter = () => {
    return (
        <footer style={{
            backgroundColor: '#0f172a', // Dark slate
            color: '#94a3b8',
            textAlign: 'center',
            padding: '15px 0',
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderTop: '1px solid #1e293b',
            position: 'relative',
            zIndex: 2000
            // Not fixed, but sits at bottom of layout
        }}>
            &copy; 2026 QRide - SREC Bus Management System. All rights reserved.
        </footer>
    );
};

export default GlobalFooter;
