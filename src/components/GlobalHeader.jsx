import React from 'react';

const GlobalHeader = () => {
    return (
        <header style={{
            backgroundColor: '#1F7A5A', // Official primary green
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '36px', // Fixed slim height
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            fontWeight: '500',
            fontSize: '13px',
            letterSpacing: '0.5px',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 2000,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
        }}>
            <span>Sri Ramakrishna Engineering College</span>
        </header>
    );
};

export default GlobalHeader;
