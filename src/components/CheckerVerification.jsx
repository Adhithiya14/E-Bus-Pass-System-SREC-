import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, ChevronLeft, Loader2 } from 'lucide-react';
import { safeFetch } from '../utils/api';

const CheckerVerification = () => {
    const { checkerId } = useParams();
    const [status, setStatus] = useState('loading');
    const [checkerName, setCheckerName] = useState('');

    useEffect(() => {
        const verifyChecker = async () => {
            try {
                const data = await safeFetch(`/api/checker/verify/${checkerId}`);
                if (data && data.valid) {
                    setStatus('valid');
                    setCheckerName(data.name);
                } else {
                    setStatus('invalid');
                }
            } catch (err) {
                setStatus('invalid');
            }
        };
        verifyChecker();
    }, [checkerId]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className={`h-2 ${status === 'valid' ? 'bg-green-500' : status === 'invalid' ? 'bg-red-500' : 'bg-blue-500'}`} />

                <div className="p-8 text-center">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <Loader2 className="animate-spin text-blue-500" size={48} />
                            <h2 className="text-xl font-semibold text-gray-700">Verifying Checker...</h2>
                            <p className="text-gray-500 text-sm">Please wait while we authenticate the checker identity.</p>
                        </div>
                    )}

                    {status === 'valid' && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="bg-green-100 p-4 rounded-full text-green-600 mb-2">
                                <ShieldCheck size={64} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Authorized Checker</h2>
                            <div className="bg-gray-50 px-6 py-4 rounded-xl w-full">
                                <p className="text-gray-500 text-sm mb-1">Official Name</p>
                                <p className="text-xl font-semibold text-gray-800 uppercase leading-tight">{checkerName}</p>
                            </div>
                            <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg text-sm font-medium mt-2">
                                <ShieldCheck size={16} />
                                <span>Identity Verified & Active</span>
                            </div>
                        </div>
                    )}

                    {status === 'invalid' && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="bg-red-100 p-4 rounded-full text-red-600 mb-2">
                                <ShieldAlert size={64} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Unauthorized Checker</h2>
                            <p className="text-gray-600">
                                This identification code is not recognized as an authorized SREC bus checker.
                            </p>
                            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mt-2 border border-red-100">
                                <strong>Warning:</strong> If someone is claiming to be an official but shows an invalid verification, please report it to the admin office immediately.
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100 italic text-sm text-gray-400">
                        Official SREC Bus Pass Verification System
                    </div>
                </div>
            </div>

            <Link to="/" className="mt-8 flex items-center gap-2 text-blue-600 font-medium hover:underline">
                <ChevronLeft size={20} />
                Back to Dashboard
            </Link>
        </div>
    );
};

export default CheckerVerification;
