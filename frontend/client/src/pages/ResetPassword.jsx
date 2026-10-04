import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import Logo from '../assets/logo.png';

import {
    FaEye,
    FaEyeSlash,
    FaLock,
    FaCircleCheck,
    FaCircleExclamation,
    FaArrowRight,
} from 'react-icons/fa6';

const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrorMessage('');
        setSuccessMessage('');

        if (!token) {
            setErrorMessage('Invalid password reset link.');
            return;
        }

        if (!password || !confirmPassword) {
            setErrorMessage('Please enter and confirm your new password.');
            return;
        }

        if (password.length < 6) {
            setErrorMessage('Password must contain at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `${API_BASE_URL}/api/auth/reset-password/${token}`,
                {
                    password,
                }
            );

            setSuccessMessage(
                response.data?.message || 'Password reset successful.'
            );

            setPassword('');
            setConfirmPassword('');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Reset password error:', error.response || error);

            setErrorMessage(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    'Unable to reset your password. The link may have expired.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4">
            {/* Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[150px] pointer-events-none" />

            {/* Card */}
            <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center shadow-sm">
                        <img
                            src={Logo}
                            alt="Medicare Hospital"
                            className="w-14 h-14 object-contain"
                        />
                    </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
                        Reset Password
                    </h1>
                    <p className="text-slate-500 mt-3 text-base">
                        Create a new secure password for your Medicare Hospital account.
                    </p>
                </div>

                {/* Success */}
                {successMessage && (
                    <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
                        <FaCircleCheck className="text-emerald-600 text-xl mt-0.5 flex-shrink-0" />
                        <p>{successMessage}</p>
                    </div>
                )}

                {/* Error */}
                {errorMessage && (
                    <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 font-semibold">
                        <FaCircleExclamation className="text-rose-600 text-xl mt-0.5 flex-shrink-0" />
                        <p>{errorMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* New Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-bold text-slate-800 mb-2"
                        >
                            New Password
                        </label>

                        <div className="relative">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                autoComplete="new-password"
                                disabled={loading}
                                className="w-full pl-12 pr-12 py-4 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 mt-2">
                            Password must contain at least 6 characters.
                        </p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-bold text-slate-800 mb-2"
                        >
                            Confirm New Password
                        </label>

                        <div className="relative">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                placeholder="Confirm new password"
                                autoComplete="new-password"
                                disabled={loading}
                                className="w-full pl-12 pr-12 py-4 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                            >
                                {showConfirmPassword ? (
                                    <FaEyeSlash />
                                ) : (
                                    <FaEye />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || !!successMessage}
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-600 text-white font-black text-lg shadow-lg shadow-blue-600/20 hover:shadow-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Resetting Password...
                            </>
                        ) : (
                            <>
                                Reset Password
                                <FaArrowRight />
                            </>
                        )}
                    </button>
                </form>

                {/* Login */}
                <div className="text-center mt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-blue-600 font-bold hover:underline"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;