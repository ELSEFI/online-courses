
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword() {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="max-w-md w-full bg-white p-8 sm:p-12 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="mb-8">
                    <Link to="/login" className="flex items-center gap-2 text-sm font-semibold text-[#3DCBB1] hover:underline mb-8">
                        {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />} {t('auth.back_to_login')}
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.forgot_password_title')}</h2>
                    <p className="text-gray-500">
                        {t('auth.forgot_password_desc')}
                    </p>
                </div>

                <form className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">{t('auth.email')}</label>
                        <div className="relative">
                            <Mail className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className={`w-full ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#3DCBB1] focus:border-transparent outline-none transition-all`}
                            />
                        </div>
                    </div>

                    <button className="w-full bg-[#3DCBB1] hover:bg-[#34b59d] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#3DCBB1]/20 transition-all duration-300">
                        {t('auth.send_reset_link')}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    {t('auth.remember_password')}{' '}
                    <Link to="/login" className="font-bold text-[#3DCBB1] hover:underline">
                        {t('auth.signin_link')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
