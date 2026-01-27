import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ChevronRight, Star } from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Services & Types
import { CATEGORIES, Course, Instructor } from "@/services/api";
import {
    useGetHomeDataQuery
} from "@/store/api/courseApi";

// Assets Mapping
import assetMap from './assetMap';
import { getCourseThumbnail } from '@/utils/imageUtils';

export default function HomepageRefactored() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [selectedCategory, setSelectedCategory] = React.useState<string | undefined>(undefined);

    // Consolidated data fetching
    const { data: homeResponse, isLoading } = useGetHomeDataQuery(selectedCategory);
    const homeData = homeResponse || {};

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3DCBB1]"></div>
                <p className="text-slate-500 font-medium animate-pulse">{t('home.loading')}</p>
            </div>
        </div>;
    }

    const { topRatedCourses = [], trendingCourses = [], topInstructors = [], categories = [] } = homeData;

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 w-full overflow-x-hidden" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>

            {/* --- HERO SECTION --- */}
            <section className="bg-[#FFE483] w-full min-h-[520px] flex items-center relative overflow-hidden py-12 md:py-0">
                <div className="w-full max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 h-full items-center">

                    {/* Hero Left */}
                    <div className="z-10 text-center md:text-left">
                        <h1 className="text-[40px] md:text-[48px] font-bold text-slate-900 leading-[1.15] mb-4 tracking-tight">
                            {t('home.hero_title')}
                        </h1>
                        <p className="text-lg text-slate-600/80 mb-10 max-w-lg mx-auto md:mx-0 font-normal">
                            {t('home.hero_subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Button className="h-[52px] px-8 rounded-[12px] bg-[#3dcbb1] hover:bg-[#34b39d] text-white text-base font-bold shadow-sm transition-all w-full sm:w-auto" onClick={() => navigate('/search')}>
                                {t('home.explore_courses')}
                            </Button>
                            {!isAuthenticated ? (
                                <Button className="h-[52px] px-8 rounded-[12px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-base font-bold shadow-sm transition-all w-full sm:w-auto" onClick={() => navigate('/register')}>
                                    {t('nav.signup')}
                                </Button>
                            ) : (
                                <Button className="h-[52px] px-8 rounded-[12px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-base font-bold shadow-sm transition-all w-full sm:w-auto" onClick={() => navigate('/profile')}>
                                    {t('nav.dashboard')}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Hero Right: Code Editor */}
                    <div className="relative h-full flex items-center justify-center md:justify-end">
                        <div className="w-full max-w-lg aspect-[16/10] bg-[#1e1e1e] rounded-[12px] shadow-2xl overflow-hidden border border-slate-700/50">
                            <div className="h-8 bg-[#252526] flex items-center px-4 gap-2 border-b border-black/50">
                                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                            </div>
                            <div className="p-6 font-mono text-xs sm:text-sm leading-7">
                                <div className="text-[#569cd6]">import <span className="text-[#9cdcfe]">React</span> <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">'react'</span>;</div>
                                <div className="h-4"></div>
                                <div className="text-[#dcdcaa]">function <span className="text-[#dcdcaa]">App</span>() {'{'}</div>
                                <div className="pl-6 text-[#9cdcfe]">return (</div>
                                <div className="pl-12 text-[#808080] opacity-50">{'<div className="container">'}</div>
                                <div className="pl-16 text-[#ce9178]">{'<h1>Learn Everyday</h1>'}</div>
                                <div className="pl-12 text-[#808080] opacity-50">{'</div>'}</div>
                                <div className="pl-6 text-[#9cdcfe]">);</div>
                                <div className="text-[#dcdcaa]">{'}'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- MAIN CONTENT --- */}
            <div className="w-full max-w-[1200px] mx-auto px-4 pb-24">

                {/* --- TOP RATED COURSES --- */}
                <div className="mt-[80px] md:mt-[100px]">
                    <div className="mb-8 overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                            <div>
                                <h2 className="text-[32px] font-bold text-slate-900 mb-2 leading-tight uppercase tracking-tight">{t('home.top_rated')}</h2>
                                <p className="text-slate-500 text-lg max-w-xl">Master any skill with these world-class courses highly rated by thousands of students.</p>
                            </div>
                            <Button className="h-12 px-8 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50" onClick={() => navigate('/search')}>
                                {t('home.view_all_courses')}
                            </Button>
                        </div>

                        <div className="flex gap-3 mt-6 overflow-x-auto pb-4 scrollbar-hide">
                            <Badge
                                onClick={() => setSelectedCategory(undefined)}
                                className={`h-[38px] px-6 rounded-full font-bold border-0 cursor-pointer whitespace-nowrap transition-all uppercase text-[11px] tracking-wider ${!selectedCategory ? 'bg-[#3DCBB1] text-white shadow-lg shadow-teal-500/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            >
                                {t('home.all_recommendation')}
                            </Badge>
                            {categories.map((cat: any) => (
                                <Badge
                                    key={cat._id}
                                    onClick={() => setSelectedCategory(cat.slug)}
                                    className={`h-[38px] px-6 rounded-full font-bold border-0 cursor-pointer whitespace-nowrap transition-all uppercase text-[11px] tracking-wider ${selectedCategory === cat.slug ? 'bg-[#3DCBB1] text-white shadow-lg shadow-teal-500/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                >
                                    {cat.name[i18n.language] || cat.name.en}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {topRatedCourses.map((course: any) => (
                            <div key={course._id} onClick={() => navigate(`/courses/${course.slug}`)} className="bg-white rounded-[24px] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 overflow-hidden cursor-pointer group">
                                <div className="h-[220px] overflow-hidden relative bg-slate-100">
                                    <img
                                        src={getCourseThumbnail(course.thumbnail, course.thumbnailUrl)}
                                        alt={course.title.en}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => { e.currentTarget.src = assetMap['course1']; }}
                                    />
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-white/90 backdrop-blur-md text-[#3DCBB1] border-none font-bold px-3 py-1 rounded-lg">
                                            {t('home.top_rated_badge')}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-slate-900 text-xl mb-3 line-clamp-1 uppercase leading-tight tracking-tight">{course.title[i18n.language] || course.title.en}</h3>
                                    <div className="flex items-center gap-3 mb-6">
                                        <Avatar className="w-6 h-6 border-2 border-white shadow-sm">
                                            <AvatarImage src={course.instructor.userId.profileImage || "https://github.com/shadcn.png"} />
                                            <AvatarFallback>{course.instructor.userId.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm text-slate-500 font-medium italic">By <span className="text-[#3DCBB1] hover:underline font-bold not-italic">{course.instructor.userId.name}</span></span>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">{t('home.pricing')}</span>
                                            <span className="text-2xl font-black text-slate-900">${course.price}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1 mb-1">
                                                <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                                                <span className="text-sm font-bold text-slate-900">{course.rating.toFixed(1)}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{course.enrollmentCount} {t('home.enrolled')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- TRENDING COURSES --- */}
                <div className="mt-[100px] md:mt-[140px]">
                    <div className="mb-12">
                        <Badge className="bg-orange-100 text-orange-600 border-none font-black px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest text-[10px]">What's Hot</Badge>
                        <h2 className="text-[32px] font-bold text-slate-900 mb-2 leading-tight uppercase tracking-tight">{t('home.trending')}</h2>
                        <p className="text-slate-500 text-lg">Join the thousands of students currently obsessed with these courses.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {trendingCourses.map((course: any) => (
                            <div key={course._id} onClick={() => navigate(`/courses/${course.slug}`)} className="bg-white rounded-[24px] p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-50 group cursor-pointer">
                                <div className={`h-[180px] rounded-[18px] bg-slate-100 mb-5 relative overflow-hidden shadow-inner`}>
                                    <img
                                        src={getCourseThumbnail(course.thumbnail, course.thumbnailUrl)}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => { e.currentTarget.src = assetMap['course2']; }}
                                    />
                                    <div className="absolute top-3 left-3">
                                        <Badge className="h-6 text-[10px] px-3 rounded-lg border-0 bg-[#3dcbb1] text-white font-black uppercase tracking-widest">{t('home.trending_badge')}</Badge>
                                    </div>
                                </div>

                                <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-2 h-[44px] leading-tight uppercase tracking-tight">
                                    {course.title[i18n.language] || course.title.en}
                                </h3>

                                <div className="flex items-center gap-2 mb-4">
                                    <Avatar className="w-5 h-5 border border-white shadow-sm">
                                        <AvatarImage src={course.instructor.userId.profileImage || "https://github.com/shadcn.png"} />
                                        <AvatarFallback>{course.instructor.userId.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-[11px] text-[#3dcbb1] font-bold hover:underline transition-all">{course.instructor.userId.name}</span>
                                </div>

                                <div className="flex items-center gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} className={`w-3 h-3 ${star <= Math.round(course.rating) ? 'text-orange-400 fill-orange-400' : 'text-slate-200 fill-slate-200'}`} />
                                    ))}
                                    <span className="text-[10px] text-slate-400 font-bold ml-1">({course.enrollmentCount})</span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-xl text-slate-900">${course.price}</span>
                                        {course.discountPrice && (
                                            <span className="text-xs text-slate-400 line-through decoration-slate-400">${course.discountPrice}</span>
                                        )}
                                    </div>
                                    <Badge className="bg-slate-50 text-slate-400 hover:bg-slate-100 border-none text-[10px] font-bold py-0.5 px-2">{t('home.pricing')}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- POPULAR INSTRUCTORS --- */}
                <div className="mt-[100px] md:mt-[140px] mb-[100px]">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12 text-center md:text-left">
                        <div>
                            <h2 className="text-[32px] font-bold text-slate-900 mb-2 leading-tight uppercase tracking-tight">{t('home.top_instructors')}</h2>
                            <p className="text-slate-500 text-lg">Learn from the industry's best and most passionate experts.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        {topInstructors.map((inst: any, i: number) => (
                            <div key={i} className="group relative rounded-[32px] overflow-hidden aspect-[3/4.5] cursor-pointer shadow-lg hover:shadow-2xl transition-all">
                                <img
                                    src={inst.user.profileImage || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"}
                                    alt={inst.user.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 saturate-50 group-hover:saturate-100"
                                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>

                                <div className="absolute top-4 right-4">
                                    <Badge className="bg-white/20 backdrop-blur-md border-white/30 text-white font-bold px-3 py-1">{t('home.best_seller')}</Badge>
                                </div>

                                <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                                        <span className="text-white text-xs font-bold">{inst.profile.rating.toFixed(1)} {t('home.rating')}</span>
                                    </div>
                                    <h3 className="text-white font-bold text-2xl mb-1 leading-tight uppercase tracking-tight">{inst.user.name}</h3>
                                    <p className="text-teal-400 text-xs font-bold uppercase tracking-widest">{inst.profile.jobTitle[i18n.language] || inst.profile.jobTitle.en}</p>

                                    <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="text-center">
                                            <p className="text-white font-bold text-lg leading-none">{inst.totalStudents}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{t('home.students')}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-bold text-lg leading-none">{inst.coursesCount}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{t('home.courses')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- NEWSLETTER --- */}
                <div className="w-full bg-[#1EA4CE] rounded-[48px] px-12 py-20 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
                        <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                            <circle cx="80" cy="20" r="30" />
                            <circle cx="20" cy="80" r="15" />
                        </svg>
                    </div>

                    <div className="relative z-10 max-w-xl text-center md:text-left">
                        <Badge className="bg-white/20 text-white border-none font-black px-4 py-1.5 rounded-full mb-6 uppercase tracking-[0.2em] text-[10px]">Limited Time Offer</Badge>
                        <h2 className="text-[40px] md:text-[48px] font-black text-white mb-4 leading-tight uppercase tracking-tight">
                            {t('home.newsletter_title')}
                        </h2>
                        <p className="text-white/80 text-lg font-medium">{t('home.newsletter_subtitle')}</p>
                    </div>

                    <div className="relative z-10 w-full max-w-md flex flex-col gap-4">
                        <div className="relative">
                            <Input
                                placeholder={t('home.placeholder_email')}
                                className={`h-[64px] bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-[20px] px-8 text-lg focus-visible:ring-2 focus-visible:ring-white/50 ${i18n.language === 'ar' ? 'pl-[140px]' : 'pr-[140px]'}`}
                            />
                            <Button className={`absolute ${i18n.language === 'ar' ? 'left-2' : 'right-2'} top-2 bottom-2 px-8 bg-[#3dcbb1] hover:bg-[#34b39d] text-white font-black text-xs rounded-[14px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-teal-500/20`}>
                                {t('home.subscribe')}
                            </Button>
                        </div>
                        <p className="text-center md:text-left text-[11px] text-white/50 font-medium px-4">{t('home.no_spam')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
