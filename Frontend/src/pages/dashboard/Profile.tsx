import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { User, Mail, Shield, BookOpen, Clock, Award, ShieldCheck, Users, Layout, Star } from 'lucide-react';
import { useGetMeQuery } from '@/store/api/userApi';
import { useGetMyCoursesQuery, useGetInstructorCoursesQuery } from '@/store/api/courseApi';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Profile() {
    const { user: authUser } = useSelector((state: RootState) => state.auth);
    const { data: meData, isLoading: isMeLoading } = useGetMeQuery();
    const { data: coursesData } = useGetMyCoursesQuery();
    const { data: instructorCourses, isLoading: isInstructorCoursesLoading } = useGetInstructorCoursesQuery(undefined, {
        skip: (meData?.user || authUser)?.role !== 'instructor'
    });
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    const user = meData?.user || authUser;
    const enrolledCount = coursesData?.results || 0;

    const renderStats = () => {
        // Safety check: if user is null/undefined, return empty div
        if (!user) {
            return <div className="w-full md:w-auto" />;
        }

        if (user?.role === 'instructor') {
            const stats = user.instructorStats || {};
            return (
                <div className="w-full md:w-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-6 bg-teal-50 border border-teal-100 rounded-[24px] text-center min-w-[140px]">
                        <BookOpen className="w-6 h-6 text-[#3DCBB1] mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-900">{stats.coursesCount || 0}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase">{t('home.courses')}</p>
                    </div>
                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-[24px] text-center min-w-[140px]">
                        <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-900">{stats.studentsCount || 0}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase">{t('home.students')}</p>
                    </div>
                    <div className="p-6 bg-orange-50 border border-orange-100 rounded-[24px] text-center min-w-[140px]">
                        <Star className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-900">{(stats.rating || 0).toFixed(1)}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase">{t('home.rating')}</p>
                    </div>
                </div>
            );
        }

        if (user?.role === 'admin') {
            const stats = user.adminStats || {};
            return (
                <div className="w-full md:w-auto grid grid-cols-2 gap-4">
                    <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[24px] text-center min-w-[140px]">
                        <ShieldCheck className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalUsers || 0}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase">{t('profile.total_users')}</p>
                    </div>
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-[24px] text-center min-w-[140px]">
                        <Layout className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalCourses || 0}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase">{t('profile.total_courses')}</p>
                    </div>
                </div>
            );
        }

        // Student stats
        const studentStats = user.studentStats || {};
        return (
            <div className="w-full md:w-auto grid grid-cols-2 gap-4">
                <div className="p-6 bg-[#3DCBB1]/5 border border-[#3DCBB1]/10 rounded-[24px] text-center min-w-[140px]">
                    <BookOpen className="w-6 h-6 text-[#3DCBB1] mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{studentStats.enrolledCoursesCount || enrolledCount}</p>
                    <p className="text-xs text-slate-500 font-bold uppercase">{t('home.courses')}</p>
                </div>
                <div className="p-6 bg-orange-50 border border-orange-100 rounded-[24px] text-center min-w-[140px]">
                    <Award className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">0</p>
                    <p className="text-xs text-slate-500 font-bold uppercase">{t('profile.certificates')}</p>
                </div>
            </div>
        );
    };

    if (isMeLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3DCBB1]"></div>
                <p className="text-slate-500 font-medium animate-pulse">{t('home.loading')}</p>
            </div>
        );
    }

    // If user is null after loading, show a message (this happens during logout)
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-slate-500 font-medium">{t('home.loading')}</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                {/* Header/Cover */}
                <div className={`h-48 bg-gradient-to-r ${user?.role === 'admin' ? 'from-indigo-600 to-violet-600' :
                    user?.role === 'instructor' ? 'from-teal-500 to-emerald-600' :
                        'from-[#3DCBB1] to-[#2DA891]'
                    } relative`}>
                    <div className={`absolute -bottom-16 ${isAr ? 'right-12' : 'left-12'}`}>
                        <div className="w-32 h-32 rounded-3xl border-4 border-white overflow-hidden bg-white shadow-lg">
                            <img
                                src={user?.profileImageUrl || user?.profileImage || "https://github.com/shadcn.png"}
                                alt={user?.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-20 pb-12 px-12">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        {/* Info */}
                        <div className="flex-1 space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">{user?.name}</h1>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${user?.role === 'admin' ? 'bg-indigo-100 text-indigo-600' :
                                        user?.role === 'instructor' ? 'bg-teal-100 text-teal-600' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                        {user?.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                        {t(`profile.roles.${user?.role}`)}
                                    </span>
                                    {user?.role === 'instructor' && (
                                        <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                            <Award className="w-3 h-3" /> {t('profile.verified_instructor')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">{t('profile.email_address')}</p>
                                        <p className="text-slate-700 font-medium">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">{t('profile.full_name')}</p>
                                        <p className="text-slate-700 font-medium">{user?.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        {renderStats()}
                    </div>
                </div>
            </div>

            {/* Additional Content Section */}
            <div className="mt-8">
                {user?.role === 'instructor' ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{t('profile.my_published_courses')}</h3>
                            <button onClick={() => navigate('/instructor')} className="text-sm font-bold text-[#3DCBB1] hover:underline">{t('profile.manage_all')}</button>
                        </div>

                        {isInstructorCoursesLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-[300px] bg-slate-50 rounded-3xl animate-pulse" />
                                ))}
                            </div>
                        ) : instructorCourses?.length === 0 ? (
                            <div className="bg-slate-50 rounded-[32px] p-12 text-center border-2 border-dashed border-slate-200">
                                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h4 className="text-lg font-bold text-slate-900 mb-2">{t('profile.no_courses_published')}</h4>
                                <p className="text-slate-500 mb-6 max-w-sm mx-auto">{t('profile.create_course_desc')}</p>
                                <button onClick={() => navigate('/instructor')} className="px-8 py-3 bg-[#3DCBB1] text-white font-bold rounded-2xl transition-all hover:bg-[#2DA891] hover:scale-105">{t('profile.create_first_course')}</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {instructorCourses?.map((course: any) => (
                                    <div key={course._id} className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all">
                                        <div className="h-44 relative overflow-hidden bg-slate-100">
                                            <img src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"} alt={course.title.en} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            <div className="absolute top-4 right-4">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase font-mono border ${course.isPublished ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                    {course.isPublished ? t('profile.live') : t('profile.draft')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h4 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 leading-tight uppercase tracking-tight">{course.title[i18n.language] || course.title.en}</h4>
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-slate-400" />
                                                    <span className="text-xs font-bold text-slate-600">{course.enrollmentCount || 0} {t('home.students')}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                                                    <span className="text-xs font-bold text-slate-900">{course.rating?.toFixed(1) || '0.0'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-teal-50/30 p-8 rounded-[32px] border border-teal-100/50">
                                <h3 className="text-xl font-bold text-slate-900 mb-6">{t('profile.continue_learning')}</h3>
                                {enrolledCount > 0 ? (
                                    <div className="space-y-4">
                                        <p className="text-slate-600">{t('profile.active_courses_msg', { count: enrolledCount })}</p>
                                        <button onClick={() => navigate('/my-courses')} className="px-6 py-2 bg-teal-600 text-white font-bold rounded-xl text-sm transition-all hover:bg-teal-700">{t('profile.go_to_my_courses')}</button>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-slate-500 mb-4">{t('profile.no_enrolled_courses')}</p>
                                        <button onClick={() => navigate('/search')} className="text-[#3DCBB1] font-bold hover:underline">{t('home.explore_courses')}</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#3DCBB1]/10 rounded-full blur-3xl group-hover:bg-[#3DCBB1]/20 transition-colors" />
                            <Award className="w-10 h-10 text-orange-500 mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{t('profile.my_progress')}</h3>
                            <p className="text-sm text-slate-500 mb-6">{t('profile.progress_desc')}</p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-slate-400 uppercase">{t('profile.profile_completion')}</span>
                                    <span className="text-[#3DCBB1]">100%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#3DCBB1] w-full rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
