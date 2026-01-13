import { useTranslation } from 'react-i18next';

export default function Footer() {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';
    return (
        <footer className="bg-[#1e1e1e] text-white py-16 mt-0" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-8 max-w-[1200px]">
                <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
                    {/* Brand */}
                    <div className="max-w-xs">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="bg-teal-500 rounded-full w-8 h-8 flex items-center justify-center">
                                <span className="text-white font-bold text-lg leading-none">m</span>
                            </div>
                            <span className="font-bold text-xl text-white">MyCourse.io</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {t('footer.brand_desc')}
                        </p>
                    </div>

                    {/* Links Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
                        {['Web Programming', 'Mobile Programming', 'Java Beginner', 'PHP Beginner'].map((link, i) => (
                            <a key={i} href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{link}</a>
                        ))}
                        {['Adobe Illustrator', 'Adobe Photoshop', 'Design Logo', 'Writing Course'].map((link, i) => (
                            <a key={i} href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{link}</a>
                        ))}
                        {['Photography', 'Video Making', 'Writing', 'Business'].map((link, i) => (
                            <a key={i} href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{link}</a>
                        ))}
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm">{t('footer.rights')}</p>
                    <div className="flex gap-4">
                        <SocialIcon path="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                        <SocialIcon path="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" rect={<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>} />
                        <SocialIcon path="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ path, rect }: { path: string, rect?: React.ReactNode }) {
    return (
        <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-teal-500 transition-colors cursor-pointer text-white">
            <svg className="w-4 h-4" fill={rect ? "none" : "currentColor"} stroke={rect ? "currentColor" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                {rect}
                <path d={path}></path>
            </svg>
        </div>
    );
}
