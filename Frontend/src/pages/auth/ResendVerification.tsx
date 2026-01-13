import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useResendVerificationMutation } from '@/store/api/authApi';
import { toast } from 'sonner';

export default function ResendVerification() {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const [resendCode, { isLoading }] = useResendVerificationMutation();
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await resendCode({ email }).unwrap();
            toast.success(result.message || t('auth.code_sent_success'));
            // Redirect to verify-email with email in state
            navigate('/verify-email', { state: { email } });
        } catch (err: any) {
            toast.error(err.data?.message || t('auth.code_sent_failed'));
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="max-w-md w-full bg-white p-8 sm:p-12 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="mb-8">
                    <Link to="/login" className="flex items-center gap-2 text-sm font-semibold text-[#3DCBB1] hover:underline mb-8">
                        {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />} {t('auth.back_to_login')}
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.resend_verification_title')}</h2>
                    <p className="text-gray-500">
                        {t('auth.resend_verification_desc')}
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">{t('auth.email')}</label>
                        <div className="relative">
                            <Mail className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className={`w-full ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#3DCBB1] focus:border-transparent outline-none transition-all`}
                            />
                        </div>
                    </div>

                    <button
                        disabled={isLoading}
                        className="w-full bg-[#3DCBB1] hover:bg-[#34b59d] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#3DCBB1]/20 transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.send_code_btn')}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    {t('auth.already_have_code')}{' '}
                    <Link to="/verify-email" className="font-bold text-[#3DCBB1] hover:underline">
                        {t('auth.enter_code_here')}
                    </Link>
                </p>
            </div>
        </div>
    );
}

