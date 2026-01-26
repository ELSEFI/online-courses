
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle2, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useResetPasswordMutation } from '@/store/api/authApi';
import { toast } from 'sonner';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (password.length < 8) {
            toast.error(t('auth.pass_at_least_8'));
            return;
        }

        if (password !== confirmPassword) {
            toast.error(t('auth.passwords_not_match') || 'Passwords do not match');
            return;
        }

        if (!token) {
            toast.error(t('auth.invalid_token') || 'Invalid reset token');
            return;
        }

        try {
            const result = await resetPassword({
                token,
                data: { password, confirmPassword }
            }).unwrap();

            toast.success(result.message || t('auth.password_reset_success'), {
                description: t('auth.redirecting_to_login') || 'This page will close automatically',
                duration: 3000,
            });

            // Close the page/tab after 2 seconds for security
            setTimeout(() => {
                // Try to close the window/tab
                window.close();

                // If window.close() doesn't work (some browsers block it), redirect to login
                setTimeout(() => {
                    navigate('/login');
                }, 500);
            }, 2000);
        } catch (err: any) {
            const errorMessage = err.data?.message || err.message || t('auth.password_reset_failed');
            toast.error(errorMessage);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="max-w-md w-full bg-white p-8 sm:p-12 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="mb-8">
                    <Link to="/login" className="flex items-center gap-2 text-sm font-semibold text-[#3DCBB1] hover:underline mb-8">
                        {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />} {t('auth.back_to_login')}
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.set_new_password_title')}</h2>
                    <p className="text-gray-500">
                        {t('auth.choose_strong_password')}
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">{t('auth.new_password')}</label>
                        <div className="relative">
                            <Lock className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className={`w-full ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#3DCBB1] focus:border-transparent outline-none transition-all`}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">{t('auth.confirm_password') || 'Confirm New Password'}</label>
                        <div className="relative">
                            <Lock className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className={`w-full ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#3DCBB1] focus:border-transparent outline-none transition-all`}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#3DCBB1] hover:bg-[#34b59d] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#3DCBB1]/20 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.reset_password_btn')}
                    </button>
                </form>

                <div className="mt-8 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle2 className={`w-4 h-4 text-[#3DCBB1] ${isAr ? 'ml-1' : ''}`} /> {t('auth.pass_at_least_8')}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle2 className={`w-4 h-4 text-[#3DCBB1] ${isAr ? 'ml-1' : ''}`} /> {t('auth.pass_upper_lower')}
                    </div>
                </div>
            </div>
        </div>
    );
}
