import React from 'react';
import { useGetMyCoursesQuery } from '@/store/api/courseApi';
import { BookOpen, PlayCircle, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import assetMap from '@/imports/assetMap';
import { getCourseThumbnail } from '@/utils/imageUtils';
import { useTranslation } from 'react-i18next';

export default function MyCourses() {
    const { data, isLoading } = useGetMyCoursesQuery();
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';
    const enrollments = data?.data || [];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3DCBB1]"></div>
                <p className="text-slate-500 font-medium animate-pulse">{t('home.loading')}</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('profile.my_learning')}</h1>
                    <p className="text-slate-500 mt-1">{t('profile.my_learning_desc')}</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#3DCBB1]" />
                    <span className="text-sm font-bold text-slate-700">{enrollments.length} {t('home.courses')}</span>
                </div>
            </div>

            {enrollments.length === 0 ? (
                <div className="bg-white rounded-[32px] p-16 text-center border border-slate-100 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <PlayCircle size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{t('profile.no_courses_yet')}</h3>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">{t('profile.no_courses_yet_desc')}</p>
                    <Link
                        to="/search"
                        className="inline-flex items-center gap-2 bg-[#3DCBB1] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#34b59d] transition-all"
                    >
                        {t('home.explore_courses')}
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {enrollments.map((enrollment: any) => {
                        const course = enrollment.course;
                        if (!course) return null;

                        return (
                            <div key={enrollment._id} className="group bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all overflow-hidden flex flex-col">
                                {/* Thumbnail */}
                                <div className="relative aspect-video overflow-hidden">
                                    <img
                                        src={getCourseThumbnail(course.thumbnail, course.thumbnailUrl)}
                                        alt={course.title?.[i18n.language] || course.title?.en}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.currentTarget.src = assetMap['course-placeholder.jpg'];
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#3DCBB1] shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                            <PlayCircle fill="currentColor" className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <div className={`absolute top-4 ${isAr ? 'right-4' : 'left-4'}`}>
                                        <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-slate-900 uppercase tracking-widest border border-white/20">
                                            {course.level?.[i18n.language] || t('profile.all_levels')}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <p className="text-[#3DCBB1] text-xs font-bold uppercase tracking-wider mb-2">
                                        {course.category?.name?.[i18n.language] || course.category?.name?.en || 'Development'}
                                    </p>
                                    <h3 className="text-lg font-bold text-slate-900 line-clamp-2 mb-4 group-hover:text-[#3DCBB1] transition-colors leading-tight uppercase tracking-tight">
                                        {course.title?.[i18n.language] || course.title?.en}
                                    </h3>

                                    {/* Progress */}
                                    <div className="mt-auto space-y-3">
                                        <div className="flex items-center justify-between text-xs font-bold">
                                            <span className="text-slate-500 uppercase tracking-tight">{t('profile.progress')}</span>
                                            <span className="text-[#3DCBB1]">{enrollment.progress || 0}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[#3DCBB1] to-[#2DA891] rounded-full transition-all duration-1000"
                                                style={{ width: `${enrollment.progress || 0}%` }}
                                            />
                                        </div>

                                        <Link
                                            to={`/learning/${course._id}`}
                                            className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-[#3DCBB1] hover:text-white text-slate-600 rounded-2xl font-bold transition-all border border-slate-100 group-hover:border-[#3DCBB1]"
                                        >
                                            {t('profile.continue_learning')}
                                            <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
