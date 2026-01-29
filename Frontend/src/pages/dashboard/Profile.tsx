import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { User, Mail, Shield, BookOpen, Clock, Award, ShieldCheck, Users, Layout, Star, Heart } from 'lucide-react';
import { useGetMeQuery, useGetUserProfileQuery, useGetInstructorProfileQuery } from '@/store/api/userApi';
import {
    useGetMyCoursesQuery,
    useGetInstructorCoursesQuery,
    useGetSpecificInstructorCoursesQuery,
    useGetWishlistQuery,
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation
} from '@/store/api/courseApi';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCourseThumbnail } from '@/utils/imageUtils';
import { Button } from '@/components/ui/button';

export default function Profile() {
    const { userId: paramUserId } = useParams();
    const { user: authUser } = useSelector((state: RootState) => state.auth);
    const [searchParams] = useSearchParams();
    const instructorId = searchParams.get('instructorId');

    // Fetch data based on context (own profile or public)
    const { data: meData, isLoading: isMeLoading } = useGetMeQuery(undefined, { skip: !!paramUserId });
    const { data: publicData, isLoading: isPublicLoading } = useGetUserProfileQuery(paramUserId!, { skip: !paramUserId });
    const { data: instructorData, isLoading: isInstructorLoading } = useGetInstructorProfileQuery(instructorId!, { skip: !instructorId });
    const { data: instructorCoursesData, isLoading: isInstructorCoursesLoadingSpec } = useGetSpecificInstructorCoursesQuery(instructorId!, { skip: !instructorId });

    // Common queries
    const { data: enrolledCoursesResponse } = useGetMyCoursesQuery(undefined, { skip: !!paramUserId });
    const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !!paramUserId });

    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';
    const [activeTab, setActiveTab] = React.useState<'courses' | 'wishlist'>('courses');

    // Wishlist mutations
    const [addToWishlist] = useAddToWishlistMutation();
    const [removeFromWishlist] = useRemoveFromWishlistMutation();

    // Determine basic user info (public vs own)
    // Select the base user object
    let user = paramUserId ? publicData : (meData?.user || authUser);

    // If we have detailed instructor data (from admin view), merge it
    if (instructorData) {
        const baseUserInfo = instructorData.userId && typeof instructorData.userId === 'object'
            ? instructorData.userId
            : {};

        user = {
            ...user, // Current base info
            ...baseUserInfo, // Populated user info (name, email, profileImage, role)
            ...instructorData, // Instructor details (bio, jobTitle, etc.)
            // Ensure stats structure matches what renderStats expects
            instructorStats: {
                rating: instructorData.rating,
                studentsCount: instructorData.totalStudents,
                coursesCount: instructorData.totalCourses,
            }
        };
    }

    const isOwnProfile = !paramUserId || paramUserId === authUser?._id;

    // Determine which courses to show
    const { data: myInstructorCourses, isLoading: isMyInstructorCoursesLoading } = useGetInstructorCoursesQuery(undefined, {
        skip: user?.role !== 'instructor' || !isOwnProfile
    });

    const coursesToShow = instructorId ? instructorCoursesData : (isOwnProfile ? myInstructorCourses : user?.courses);
    const isCoursesLoading = instructorId ? isInstructorCoursesLoadingSpec : (isOwnProfile ? isMyInstructorCoursesLoading : false);

    const isLoading = isMeLoading || isPublicLoading || isInstructorLoading;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3DCBB1]"></div>
                <p className="text-slate-500 font-medium animate-pulse">{t('home.loading')}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-slate-500 font-medium">{t('home.loading')}</p>
            </div>
        );
    }

    const renderStats = () => {
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

        const stats = user.studentStats || {};
        return (
            <div className="w-full md:w-auto grid grid-cols-2 gap-4">
                <div className="p-6 bg-[#3DCBB1]/5 border border-[#3DCBB1]/10 rounded-[24px] text-center min-w-[140px]">
                    <BookOpen className="w-6 h-6 text-[#3DCBB1] mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{stats.enrolledCoursesCount || 0}</p>
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

    const handleWishlistToggle = async (courseId: string, isCurrentlyInWishlist: boolean) => {
        try {
            if (isCurrentlyInWishlist) {
                await removeFromWishlist(courseId).unwrap();
            } else {
                await addToWishlist(courseId).unwrap();
            }
        } catch (error) {
            console.error('Wishlist toggle error:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3DCBB1]"></div>
                <p className="text-slate-500 font-medium animate-pulse">{t('home.loading')}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-slate-500 font-medium">{t('home.loading')}</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-12" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-sm border border-slate-100 overflow-hidden mb-8 md:mb-12">
                <div className={`h-40 md:h-48 bg-gradient-to-r ${user?.role === 'admin' ? 'from-indigo-600 to-violet-600' :
                    user?.role === 'instructor' ? 'from-teal-500 to-emerald-600' :
                        'from-[#3DCBB1] to-[#2DA891]'
                    } relative`}>
                    <div className={`absolute -bottom-12 md:-bottom-16 ${isAr ? 'right-1/2 translate-x-1/2 md:right-12 md:translate-x-0' : 'left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0'}`}>
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl border-4 border-white overflow-hidden bg-white shadow-lg">
                            <img
                                src={user?.profileImageUrl || user?.profileImage || "https://github.com/shadcn.png"}
                                alt={user?.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-16 md:pt-20 pb-8 md:pb-12 px-6 md:px-12 text-center md:text-start">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
                        <div className="flex-1 space-y-6">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{user?.name}</h1>
                                {user?.jobTitle && (
                                    <p className="text-base md:text-lg font-semibold text-[#3DCBB1] mt-1 italic">
                                        {isAr ? user.jobTitle.ar : user.jobTitle.en}
                                    </p>
                                )}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
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
                        {renderStats()}
                    </div>
                </div>

                {user?.bio && (
                    <div className="px-6 md:px-12 pb-8 md:pb-12">
                        <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[24px] md:rounded-[32px] border border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-center md:justify-start gap-2">
                                <Layout className="w-4 h-4" />
                                {t('profile.about_me')}
                            </h3>
                            <p className="text-slate-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-base md:text-lg">
                                {isAr ? user.bio.ar : user.bio.en}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* --- TABS --- */}
            <div className="flex items-center gap-3 md:gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                <Button
                    variant={activeTab === 'courses' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('courses')}
                    className={`rounded-xl md:rounded-2xl h-10 md:h-12 px-6 md:px-8 font-bold whitespace-nowrap ${activeTab === 'courses' ? 'bg-[#3DCBB1] hover:bg-[#2DA891]' : 'text-slate-400'}`}
                >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {user?.role === 'instructor' ? t('profile.my_published_courses') : t('nav.my_courses')}
                </Button>
                {isOwnProfile && (
                    <Button
                        variant={activeTab === 'wishlist' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('wishlist')}
                        className={`rounded-xl md:rounded-2xl h-10 md:h-12 px-6 md:px-8 font-bold whitespace-nowrap ${activeTab === 'wishlist' ? 'bg-[#3DCBB1] hover:bg-[#2DA891]' : 'text-slate-400'}`}
                    >
                        <Heart className="w-4 h-4 mr-2" />
                        {t('nav.wishlist')}
                    </Button>
                )}
            </div>

            {/* --- CONTENT --- */}
            {activeTab === 'courses' ? (
                <div className="space-y-6">
                    {user?.role === 'instructor' ? (
                        <>
                            {isCoursesLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map(i => <div key={i} className="h-[300px] bg-slate-50 rounded-3xl animate-pulse" />)}
                                </div>
                            ) : (coursesToShow?.length > 0) ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {coursesToShow.map((course: any) => (
                                        <CourseCard
                                            key={course._id}
                                            course={course}
                                            t={t}
                                            i18n={i18n}
                                            wishlistData={isOwnProfile ? wishlistData : null}
                                            onWishlistToggle={isOwnProfile ? handleWishlistToggle : null}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<BookOpen className="w-12 h-12" />} title={t('profile.no_courses_published')} desc={t('profile.create_course_desc')} />
                            )}
                        </>
                    ) : (
                        <div className="space-y-6">
                            {(enrolledCoursesResponse?.data?.length > 0 || user.enrolledCourses?.length > 0) ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {(enrolledCoursesResponse?.data || user.enrolledCourses).map((item: any) => (
                                        <CourseCard
                                            key={item._id || item.course?._id}
                                            // Handle case where item is an enrollment object or a course object
                                            course={item.course || item}
                                            t={t}
                                            i18n={i18n}
                                            wishlistData={isOwnProfile ? wishlistData : null}
                                            onWishlistToggle={isOwnProfile ? handleWishlistToggle : null}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<BookOpen className="w-12 h-12" />} title={t('profile.no_enrolled_courses')} desc={t('home.explore_courses')} />
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {wishlistData?.data?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {wishlistData.data.map((item: any) => (
                                <CourseCard
                                    key={item._id}
                                    course={item.course || item}
                                    t={t}
                                    i18n={i18n}
                                    wishlistData={wishlistData}
                                    onWishlistToggle={handleWishlistToggle}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={<Heart className="w-12 h-12" />} title={t('profile.wishlist_empty')} desc={t('profile.wishlist_empty_desc')} />
                    )}
                </div>
            )}
        </div>
    );
}

function CourseCard({ course, t, i18n, wishlistData, onWishlistToggle }: any) {
    if (!course) return null;

    // Safety check for title
    const title = course.title?.[i18n.language] || course.title?.en || t('common.untitled');

    // Check if course is in wishlist
    const isInWishlist = wishlistData?.data?.some((item: any) =>
        (item.course?._id || item.course) === course._id
    );

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onWishlistToggle) {
            onWishlistToggle(course._id, isInWishlist);
        }
    };

    return (
        <div className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all relative">
            {/* Wishlist Heart Icon */}
            {onWishlistToggle && (
                <button
                    onClick={handleWishlistClick}
                    className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-110"
                >
                    <Heart
                        className={`w-5 h-5 transition-all ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-slate-400 hover:text-red-500'}`}
                    />
                </button>
            )}

            <div className="h-44 relative overflow-hidden bg-slate-100">
                <img
                    src={getCourseThumbnail(course.thumbnail, course.thumbnailUrl)}
                    alt={typeof title === 'string' ? title : ''}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80";
                    }}
                />
                <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase font-mono border ${course.isPublished ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {course.isPublished ? t('profile.live') : t('profile.draft')}
                    </span>
                </div>
            </div>
            <div className="p-6">
                <h4 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 leading-tight uppercase tracking-tight">{title}</h4>
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
    );
}

function EmptyState({ icon, title, desc }: any) {
    return (
        <div className="bg-slate-50 rounded-[32px] p-12 text-center border-2 border-dashed border-slate-200">
            <div className="text-slate-300 mx-auto mb-4">{icon}</div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">{title}</h4>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">{desc}</p>
        </div>
    );
}
