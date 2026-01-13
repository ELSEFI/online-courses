import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useVerifyEmailMutation, useResendVerificationMutation } from '@/store/api/authApi';
import { toast } from 'sonner';

export default function VerifyEmail() {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
    const [resendCode, { isLoading: isResending }] = useResendVerificationMutation();
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    useEffect(() => {
        if (!email) {
            toast.error(t('auth.session_expired'));
            navigate('/register');
        }
    }, [email, navigate, t]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        if (value.length > 1) {
            value = value.slice(-1);
        }

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
            prevInput?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const verificationCode = code.join('');
        if (verificationCode.length !== 6) {
            toast.error(t('auth.enter_full_code'));
            return;
        }

        try {
            const result = await verifyEmail({ email, code: verificationCode }).unwrap();
            toast.success(result.message || t('auth.verify_success') || 'Email verified successfully!');
            navigate('/login');
        } catch (err: any) {
            toast.error(err.data?.message || t('auth.verification_failed'));
        }
    };

    const handleResend = async () => {
        try {
            const result = await resendCode({ email }).unwrap();
            toast.success(result.message || t('auth.code_resent'));
        } catch (err: any) {
            toast.error(err.data?.message || t('auth.resend_failed'));
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="max-w-md w-full bg-white p-8 sm:p-12 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100 text-center">
                <div className="w-20 h-20 bg-[#3DCBB1]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <ShieldCheck className="w-10 h-10 text-[#3DCBB1]" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.verify_email_title')}</h2>
                <p className="text-gray-500 mb-8">
                    {t('auth.verify_email_desc', { email })}
                </p>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="flex justify-between gap-2 max-w-[280px] mx-auto">
                        {code.map((digit, i) => (
                            <input
                                key={i}
                                id={`otp-${i}`}
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className="w-10 h-12 text-center text-xl font-bold bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#3DCBB1] focus:border-transparent outline-none transition-all"
                            />
                        ))}
                    </div>

                    <button
                        disabled={isLoading}
                        className="w-full bg-[#3DCBB1] hover:bg-[#34b59d] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#3DCBB1]/20 transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.verify_btn')}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        {t('auth.didnt_receive_code')}{' '}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isResending}
                            className="font-bold text-[#3DCBB1] hover:underline disabled:opacity-50"
                        >
                            {isResending ? t('auth.resending') : t('auth.resend_code')}
                        </button>
                    </p>
                    <Link to="/login" className="inline-block mt-4 text-sm font-semibold text-gray-400 hover:text-gray-600">
                        {t('auth.back_to_login')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
