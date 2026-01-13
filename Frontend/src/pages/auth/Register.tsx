
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Chrome, Loader2 } from 'lucide-react';
import { useRegisterMutation } from '@/store/api/authApi';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Using a different asset if possible, or same for symmetry
import authImage from "@/assets/ebe64b79a97a2a781199976361a3a5403e2dd1ad.png";

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    const [register, { isLoading }] = useRegisterMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await register({ name, email, password }).unwrap();
            toast.success(result.message || t('auth.register_success'));
            navigate('/verify-email', { state: { email } });
        } catch (err: any) {
            toast.error(err.data?.message || t('auth.register_failed'));
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-80px)] bg-white font-sans text-gray-900" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Left Side: Image (Swapped for Register) */}
            <div className="hidden lg:block flex-1 relative bg-[#3DCBB1]">
                <img
                    src={authImage}
                    alt="Register illustration"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-bl from-[#3DCBB1]/40 to-transparent"></div>
                <div className="absolute bottom-16 left-16 right-16 text-white p-8 bg-black/20 backdrop-blur-md rounded-3xl border border-white/20">
                    <h3 className="text-2xl font-bold mb-2">{t('auth.create_account_title')}</h3>
                    <p className="text-white/80">{t('auth.create_account_desc')}</p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-24 lg:px-32 py-12">
                <div className="max-w-md w-full mx-auto space-y-8">

                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.join_us')}</h2>
                        <p className="text-gray-500">{t('auth.signup_desc')}</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">{t('auth.full_name')}</label>
                            <div className="relative">
                                <User className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className={`w-full ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#3DCBB1] focus:border-transparent outline-none transition-all`}
                                />
                            </div>
                        </div>

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
                            <label className="text-sm font-semibold text-gray-700">{t('auth.password')}</label>
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

                        <button
                            disabled={isLoading}
                            className="w-full bg-[#3DCBB1] hover:bg-[#34b59d] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#3DCBB1]/20 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:active:scale-100"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.signup_btn')}
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-400">{t('auth.or_signup')}</span>
                            </div>
                        </div>

                        <button type="button" className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-300">
                            <Chrome className="w-5 h-5 text-red-500" />
                            {t('auth.google_signup')}
                        </button>
                    </form>

                    <p className="text-center text-gray-500">
                        {t('auth.have_account')}{' '}
                        <Link to="/login" className="font-bold text-[#3DCBB1] hover:underline">
                            {t('auth.signin_link')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

