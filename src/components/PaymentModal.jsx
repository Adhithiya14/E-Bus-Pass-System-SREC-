import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import './PaymentModal.css';

const PaymentModal = ({ isOpen, onClose, paymentDetails, onPaymentSuccess }) => {
    // paymentDetails = { title, amount, summary: [{ label, value }] }

    const [step, setStep] = useState(1);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen || !paymentDetails) return null;

    const handleNext = () => {
        if (step === 1) setStep(2);
    };

    const handleBack = () => {
        if (step === 2) setStep(1);
    };

    const handleSimulatePayment = async () => {
        if (!selectedMethod) return;
        setLoading(true);
        setError('');

        try {
            // Simulated Payment Gateway Animation
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Execute the actual API call passed from parent
            // We assume onPaymentSuccess returns true on success, false on failure (as fixed in Dashboard)
            if (onPaymentSuccess) {
                const apiSuccess = await onPaymentSuccess();
                if (apiSuccess !== false) { // Handle void/true as success
                    setSuccess(true);
                    setTimeout(() => {
                        onClose();
                    }, 2500); // Close after showing success animation
                } else {
                    throw new Error("Transaction verification failed.");
                }
            } else {
                setSuccess(true);
            }

        } catch (err) {
            setError(err.message || 'Payment Gateway Error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay payment-overlay">
            <div className={`modal-content payment-modal ${success ? 'success-mode' : ''}`}>
                <button className="modal-close" onClick={onClose}><X size={24} /></button>

                {!success ? (
                    <>
                        <div className="payment-progress-bar">
                            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
                            <div className="progress-line"></div>
                            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
                        </div>

                        <div className="payment-header">
                            <h2>{step === 1 ? 'Payment Summary' : 'Select Payment Method'}</h2>
                            <p>{step === 1 ? `Review your ${paymentDetails.title} order` : 'Choose how you want to pay'}</p>
                        </div>

                        <div className="payment-body-scroll">
                            {step === 1 && (
                                <div className="step-content fade-in">
                                    <div className="order-summary-card">
                                        <div className="summary-item highlight-item">
                                            <span className="label">Product</span>
                                            <span className="value">{paymentDetails.title}</span>
                                        </div>

                                        {paymentDetails.summary && (Array.isArray(paymentDetails.summary) ? (
                                            paymentDetails.summary.map((item, idx) => (
                                                <div key={idx} className="summary-item">
                                                    <span className="label">{item.label}</span>
                                                    <span className="value">{item.value}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="summary-item">
                                                <span className="label">Details</span>
                                                <span className="value">{paymentDetails.summary}</span>
                                            </div>
                                        ))}

                                        <div className="divider"></div>
                                        <div className="total-row">
                                            <span>Total Amount</span>
                                            <span className="amount">₹ {paymentDetails.amount}</span>
                                        </div>
                                    </div>
                                    <div className="security-note">
                                        <ShieldCheck size={16} />
                                        <span>Secured by SREC Campus Gateway</span>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="step-content fade-in">
                                    <div className="methods-grid">
                                        <div
                                            className={`method-card ${selectedMethod === 'UPI' ? 'selected' : ''}`}
                                            onClick={() => setSelectedMethod('UPI')}
                                        >
                                            <div className="method-icon">🔥</div>
                                            <div className="method-info">
                                                <h4>UPI</h4>
                                                <p>GPay, PhonePe, Paytm</p>
                                            </div>
                                            {selectedMethod === 'UPI' && <CheckCircle className="check-icon" size={20} />}
                                        </div>

                                        <div
                                            className={`method-card ${selectedMethod === 'CARD' ? 'selected' : ''}`}
                                            onClick={() => setSelectedMethod('CARD')}
                                        >
                                            <div className="method-icon">💳</div>
                                            <div className="method-info">
                                                <h4>Card</h4>
                                                <p>Credit & Debit Cards</p>
                                            </div>
                                            {selectedMethod === 'CARD' && <CheckCircle className="check-icon" size={20} />}
                                        </div>

                                        <div
                                            className={`method-card ${selectedMethod === 'WALLET' ? 'selected' : ''}`}
                                            onClick={() => setSelectedMethod('WALLET')}
                                        >
                                            <div className="method-icon">👛</div>
                                            <div className="method-info">
                                                <h4>Wallet</h4>
                                                <p>Amazon Pay, Freecharge</p>
                                            </div>
                                            {selectedMethod === 'WALLET' && <CheckCircle className="check-icon" size={20} />}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="payment-actions">
                            {step === 2 && (
                                <button className="btn-back" onClick={handleBack} disabled={loading}>
                                    Back
                                </button>
                            )}

                            {step === 1 ? (
                                <button className="btn-primary-pay" onClick={handleNext}>
                                    Proceed to Pay ₹{paymentDetails.amount}
                                </button>
                            ) : (
                                <button
                                    className="btn-pay-secure"
                                    onClick={handleSimulatePayment}
                                    disabled={!selectedMethod || loading}
                                >
                                    {loading ? 'Processing Transaction...' : `Pay via ${selectedMethod}`}
                                    {!loading && <ShieldCheck size={18} />}
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="payment-success-content scale-in">
                        <div className="success-icon-anim">
                            <CheckCircle size={80} />
                        </div>
                        <h2>Payment Successful!</h2>
                        <p>Activation in progress...</p>
                        <div className="receipt-snippet">
                            <span>Transaction ID</span>
                            <span className="txn-id">TXN_{Math.floor(Math.random() * 9000000 + 1000000)}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
