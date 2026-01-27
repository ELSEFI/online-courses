
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Lock, Chrome, Loader2 } from 'lucide-react';
import { useLoginMutation, useLoginGoogleMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Using a valid asset from the project
import authImage from "@/assets/c44d9c4405123860b8ed6398ddc0e385f097fea6.png";

// Declare google on window for TypeScript
declare global {
    interface Window {
        google: any;
    }
}

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    const [login, { isLoading }] = useLoginMutation();
    const [loginGoogle, { isLoading: isGoogleLoading }] = useLoginGoogleMutation();

    useEffect(() => {
        // Initialize Google Sign-In
        if (window.google) {
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

            window.google.accounts.id.initialize({
                client_id: clientId.trim(),
                callback: handleGoogleResponse,
                auto_select: false,
                cancel_on_tap_outside: true,
                use_fedcm_tap: true,
                ux_mode: 'popup',
                context: 'signin',
            });

            // Render the standard button
            const googleBtn = document.getElementById('google-signin-button');
            if (googleBtn) {
                window.google.accounts.id.renderButton(googleBtn, {
                    theme: 'outline',
                    size: 'large',
                    width: 400, // Valid range is 200-400 (number)
                    text: 'signin_with',
                    shape: 'pill',
                });
            }
        }
    }, [i18n.language]); // Updates button text if language changes

    const handleGoogleResponse = async (response: any) => {
        try {
            const result = await loginGoogle({ token: response.credential }).unwrap();
            dispatch(setCredentials({ user: result.user, token: result.token }));
            toast.success(result.message || t('auth.login_success'));
            navigate('/');
        } catch (err: any) {
            toast.error(err.data?.message || t('auth.google_login_failed'));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await login({ email, password }).unwrap();
            dispatch(setCredentials({ user: result.user, token: result.token }));
            toast.success(result.message || t('auth.login_success'));
            navigate('/');
        } catch (err: any) {
            // Handle unverified email specifically
            const errorMessage = err.data?.message || err.message || t('auth.login_failed');

            // Check if error is about email verification
            if (errorMessage.toLowerCase().includes('verify') ||
                errorMessage.toLowerCase().includes('تأكيد') ||
                errorMessage.toLowerCase().includes('confirm')) {
                toast.error(errorMessage);
                // Don't trigger any other errors or redirects
                return;
            }

            toast.error(errorMessage);
        }
    };



    return (
        <div className="flex min-h-[calc(100vh-80px)] bg-white font-sans text-gray-900" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Left Side: Form */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-24 lg:px-32 py-12">
                <div className="max-w-md w-full mx-auto space-y-8">

                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.welcome_back')}</h2>
                        <p className="text-gray-500">{t('auth.signin_desc')}</p>
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

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-gray-700">{t('auth.password')}</label>
                                <Link to="/forgot-password" title="reset password" className="text-sm font-semibold text-[#3DCBB1] hover:underline">
                                    {t('auth.forgot_password')}
                                </Link>
                            </div>
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

                        <div className="flex items-center justify-between">
                            <Link to="/resend-verification" className="text-sm font-semibold text-[#3DCBB1] hover:underline">
                                {t('auth.confirm_email')}
                            </Link>
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full bg-[#3DCBB1] hover:bg-[#34b59d] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#3DCBB1]/20 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:active:scale-100"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.signin_btn')}
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-400">{t('auth.or_continue')}</span>
                            </div>
                        </div>
                        <div id="google-signin-button" className="w-full flex justify-center py-2 min-h-[50px]"></div>
                        {isGoogleLoading && (
                            <div className="flex justify-center">
                                <Loader2 className="w-5 h-5 animate-spin text-[#3DCBB1]" />
                            </div>
                        )}
                    </form>

                    <p className="text-center text-gray-500">
                        {t('auth.no_account')}{' '}
                        <Link to="/register" className="font-bold text-[#3DCBB1] hover:underline">
                            {t('auth.signup_link')}
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side: Image */}
            <div className="hidden lg:block flex-1 relative bg-[#3DCBB1]">
                <img
                    src={authImage}
                    alt="Login illustration"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#3DCBB1]/40 to-transparent"></div>
                <div className="absolute bottom-16 left-16 right-16 text-white p-8 bg-black/20 backdrop-blur-md rounded-3xl border border-white/20">
                    <h3 className="text-2xl font-bold mb-2">{t('auth.learn_best')}</h3>
                    <p className="text-white/80">{t('auth.learn_best_desc')}</p>
                </div>
            </div>
        </div >
    );
}

