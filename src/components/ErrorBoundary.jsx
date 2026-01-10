import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8fafc',
                    fontFamily: "'Inter', sans-serif",
                    padding: '20px',
                    textAlign: 'center',
                    color: '#0f172a'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '40px',
                        borderRadius: '24px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        maxWidth: '500px',
                        width: '100%'
                    }}>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#dc2626' }}>
                            Oops! Something went wrong.
                        </h1>
                        <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.6' }}>
                            We're sorry, but an unexpected error has occurred. We've logged the issue and notified our team.
                        </p>

                        {/* Optional: Show error details in development */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <pre style={{
                                textAlign: 'left',
                                background: '#f1f5f9',
                                padding: '12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                overflow: 'auto',
                                marginBottom: '24px',
                                color: '#ef4444'
                            }}>
                                {this.state.error.toString()}
                            </pre>
                        )}

                        <button
                            onClick={this.handleReload}
                            style={{
                                padding: '12px 24px',
                                background: '#1F7A5A',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: '600',
                                fontSize: '16px',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
