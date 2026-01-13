
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Lock, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ResetPassword() {
    const { token } = useParams(); // URL would be reset-password/:token
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="max-w-md w-full bg-white p-8 sm:p-12 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.set_new_password_title')}</h2>
                    <p className="text-gray-500">
                        {t('auth.choose_strong_password')}
                    </p>
                </div>

                <form className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">{t('auth.new_password')}</label>
                        <div className="relative">
                            <Lock className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                            <input
                                type="password"
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
                                placeholder="••••••••"
                                className={`w-full ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#3DCBB1] focus:border-transparent outline-none transition-all`}
                            />
                        </div>
                    </div>

                    <button className="w-full bg-[#3DCBB1] hover:bg-[#34b59d] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#3DCBB1]/20 transition-all duration-300">
                        {t('auth.reset_password_btn')}
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
