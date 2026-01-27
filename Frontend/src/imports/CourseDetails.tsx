import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
    ShoppingCart,
    ChevronLeft,
    PlayCircle,
    Lock,
    Star,
    CheckCircle2,
    Clock,
    Globe,
    Users as UsersIcon,
    Award,
    Infinity,
    Smartphone,
    FileText,
    Edit
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

import { Course, Module, Lesson } from "@/services/api";
import { useGetCourseDetailsQuery, useGetCourseSectionsQuery, useGetMyCoursesQuery } from '@/store/api/courseApi';
import assetMap from '../imports/assetMap';
import { getCourseThumbnail } from '@/utils/imageUtils';
import SectionAccordionItem from '@/components/course/SectionAccordionItem';

export default function CourseDetails() {
    const { id } = useParams<{ id: string }>();
    const courseSlug = id; // Route uses :id but we call it courseSlug internally
    const navigate = useNavigate();
    const { i18n, t } = useTranslation();
    const { user } = useSelector((state: RootState) => state.auth);

    // Fetch course details
    const { data: courseData, isLoading, isError } = useGetCourseDetailsQuery(courseSlug!, {
        skip: !courseSlug,
    });
    const course = courseData?.course;

    // Fetch sections with lessons
    const { data: sectionsData, isLoading: isSectionsLoading, isError: isSectionsError } = useGetCourseSectionsQuery(courseSlug!, {
        skip: !courseSlug || !course
    });
    const sections = sectionsData?.sections || [];

    // Role detection
    const isAdmin = user?.role === 'admin';
    const isInstructor = course?.instructor?.userId?._id === user?._id;
    const canManage = isAdmin || isInstructor;

    // For management view, fetch lesson counts
    const [sectionLessonCounts, setSectionLessonCounts] = React.useState<Record<string, number>>({});
    const [totalLessons, setTotalLessons] = React.useState(0);

    // Check enrollment status from user's enrolled courses
    const { data: myCoursesData, isLoading: isMyCoursesLoading } = useGetMyCoursesQuery(undefined, {
        skip: !user || canManage,
    });

    const isEnrolled = React.useMemo(() => {
        if (canManage || !user || isMyCoursesLoading) return false;

        console.log('🔍 Enrollment Check:', {
            courseSlug,
            myCoursesData,
            enrollments: myCoursesData?.data
        });

        const enrolled = myCoursesData?.data?.some((enrollment: any) => {
            console.log('Checking enrollment:', enrollment?.course?.slug, 'vs', courseSlug);
            return enrollment?.course?.slug === courseSlug;
        });

        console.log('Is enrolled:', enrolled);
        return enrolled || false;
    }, [myCoursesData, courseSlug, canManage, user, isMyCoursesLoading]);

    React.useEffect(() => {
        if (canManage && sections.length > 0) {
            const fetchLessonCounts = async () => {
                try {
                    const counts: Record<string, number> = {};
                    let total = 0;

                    await Promise.all(
                        sections.map(async (section: any) => {
                            const response = await fetch(
                                `http://localhost:5000/api/v1/${courseSlug!}/sections/${section._id}/lessons`
                            );
                            if (response.ok) {
                                const data = await response.json();
                                const count = data.lessons?.length || 0;
                                counts[section._id] = count;
                                total += count;
                            } else {
                                counts[section._id] = 0;
                            }
                        })
                    );

                    setSectionLessonCounts(counts);
                    setTotalLessons(total);
                } catch (error) {
                    console.error('Error fetching lesson counts:', error);
                }
            };
            fetchLessonCounts();
        }
    }, [canManage, sections, courseSlug]);

    if (isLoading) {
        return <div className="min-h-screen bg-white flex items-center justify-center">Loading Course Details...</div>;
    }

    if (!course) {
        return <div className="min-h-screen bg-white flex items-center justify-center">Course not found.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 w-full">

            {/* Hero Section - Dark Background */}
            <div className="bg-slate-900 text-white">
                <div className="w-full max-w-[1200px] mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/')}
                            className="p-0 hover:bg-transparent hover:text-teal-400 gap-1 h-auto text-slate-400"
                        >
                            <ChevronLeft size={16} /> Back to Courses
                        </Button>
                        <span>/</span>
                        <span>{course.category?.name?.[i18n.language] || course.category?.name?.en || "Development"}</span>
                    </div>

                    {/* Course Title & Info */}
                    <div className="max-w-3xl">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                            {course.title?.[i18n.language] || course.title?.en}
                        </h1>

                        <p className="text-lg text-slate-300 mb-6">
                            {course.shortDescription?.[i18n.language] || course.shortDescription?.en}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                            <Badge className="bg-teal-600 text-white border-0">
                                {course.level?.[i18n.language] || course.level?.en || 'All Levels'}
                            </Badge>
                            <div className="flex items-center gap-1">
                                <div className="flex text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} className={i < Math.floor(course.rating || 0) ? "fill-current" : "text-slate-600 fill-current"} />
                                    ))}
                                </div>
                                <span className="font-bold ml-1">{course.rating?.toFixed(1) || '0.0'}</span>
                                <span className="text-slate-400">({course.totalReviews || 0} reviews)</span>
                            </div>
                            <span className="text-slate-400">{course.enrollmentCount || 0} students</span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <span>Created by</span>
                            <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                    <AvatarImage src={course.instructor?.userId?.profileImage} />
                                    <AvatarFallback className="bg-teal-600 text-white text-xs">
                                        {course.instructor?.userId?.name?.charAt(0) || 'I'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-teal-400">
                                    {course.instructor?.userId?.name || 'Instructor'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content + Sidebar */}
            <div className="w-full max-w-[1200px] mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT: Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* What you'll learn */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">What you'll learn</h2>
                            <div className="grid md:grid-cols-2 gap-3">
                                {course.requirements?.[i18n.language]?.slice(0, 6).map((item: string, i: number) => (
                                    <div key={i} className="flex gap-2 items-start">
                                        <CheckCircle2 size={18} className="text-teal-600 shrink-0 mt-0.5" />
                                        <span className="text-slate-700 text-sm">{item}</span>
                                    </div>
                                )) || [
                                    "Build fully functional applications",
                                    "Master modern development practices",
                                    "Understand core concepts deeply",
                                    "Deploy to production servers"
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-2 items-start">
                                        <CheckCircle2 size={18} className="text-teal-600 shrink-0 mt-0.5" />
                                        <span className="text-slate-700 text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Course Content */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-slate-900">Course content</h2>
                                <span className="text-sm text-slate-600">
                                    {sections.length} sections • {canManage ? totalLessons : sections.reduce((sum: number, s: any) => sum + (sectionLessonCounts[s._id] || 0), 0)} lectures
                                </span>
                            </div>

                            <Accordion type="single" collapsible className="w-full">
                                {sections.map((section: any, index: number) => (
                                    <SectionAccordionItem
                                        key={section._id}
                                        section={section}
                                        index={index}
                                        courseSlug={courseSlug!}
                                        isEnrolled={isEnrolled}
                                        canManage={canManage}
                                    />
                                ))}
                            </Accordion>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Description</h2>
                            <div className="text-slate-700 leading-relaxed prose prose-slate max-w-none">
                                <p>{course.description?.[i18n.language] || course.description?.en}</p>
                            </div>
                        </div>

                        {/* Student Reviews */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Student feedback</h2>

                            {/* Overall Rating */}
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8 pb-6 border-b border-slate-200">
                                <div className="text-center">
                                    <div className="text-5xl font-bold text-slate-900 mb-2">
                                        {course.rating?.toFixed(1) || '0.0'}
                                    </div>
                                    <div className="flex text-amber-400 mb-2 justify-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={20} className={i < Math.floor(course.rating || 0) ? "fill-current" : "text-slate-300 fill-current"} />
                                        ))}
                                    </div>
                                    <div className="text-sm text-slate-600">Course Rating</div>
                                </div>

                                <div className="flex-1 w-full">
                                    {[5, 4, 3, 2, 1].map((stars) => (
                                        <div key={stars} className="flex items-center gap-2 mb-1">
                                            <div className="flex items-center gap-1 w-20">
                                                <Star size={14} className="text-amber-400 fill-current" />
                                                <span className="text-sm text-slate-600">{stars}</span>
                                            </div>
                                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-400"
                                                    style={{ width: `${Math.random() * 80 + 10}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-slate-600 w-12 text-right">
                                                {Math.floor(Math.random() * 50)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Individual Reviews */}
                            <div className="space-y-6">
                                {[1, 2, 3].map((review) => (
                                    <div key={review} className="pb-6 border-b border-slate-200 last:border-0">
                                        <div className="flex items-start gap-4">
                                            <Avatar className="w-12 h-12">
                                                <AvatarFallback className="bg-teal-100 text-teal-700">
                                                    U{review}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-bold text-slate-900">User {review}</span>
                                                    <span className="text-sm text-slate-500">• 2 weeks ago</span>
                                                </div>
                                                <div className="flex text-amber-400 mb-3">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} className="fill-current" />
                                                    ))}
                                                </div>
                                                <p className="text-slate-700 leading-relaxed">
                                                    Great course! The instructor explains everything clearly and the projects are very practical. Highly recommended for anyone wanting to learn this topic.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4 space-y-4">
                            {/* Course Card */}
                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-lg">
                                {/* Course Thumbnail */}
                                <div className="relative aspect-video bg-slate-900">
                                    <img
                                        src={getCourseThumbnail(course.thumbnail, course.thumbnailUrl)}
                                        alt={course.title?.en}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = assetMap['course-placeholder.jpg'];
                                        }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                                            <PlayCircle size={32} className="text-slate-900" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Price */}
                                    {!canManage && !isEnrolled && (
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-slate-900">
                                                ${course.discountPrice || course.price}
                                            </span>
                                            {course.discountPrice && course.discountPrice < course.price && (
                                                <span className="text-lg text-slate-500 line-through">
                                                    ${course.price}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Enrollment Status */}
                                    {isEnrolled && (
                                        <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-lg border border-teal-200">
                                            <CheckCircle2 size={20} className="text-teal-600" />
                                            <span className="text-sm font-medium text-teal-900">
                                                You purchased this course
                                            </span>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <Button
                                        size="lg"
                                        className={`w-full ${canManage
                                            ? "bg-blue-600 hover:bg-blue-700"
                                            : isEnrolled
                                                ? "bg-teal-600 hover:bg-teal-700"
                                                : "bg-slate-900 hover:bg-slate-800"
                                            }`}
                                        onClick={() => {
                                            if (canManage) {
                                                navigate(`/studio/courses/${course.slug}/edit`);
                                            } else if (isEnrolled) {
                                                navigate(`/learn/${course.slug}`);
                                            } else {
                                                navigate(`/courses/${course.slug}/enroll`);
                                            }
                                        }}
                                    >
                                        {canManage ? (
                                            <>
                                                <Edit size={18} className="mr-2" />
                                                Edit Content
                                            </>
                                        ) : isEnrolled ? (
                                            "Go to course"
                                        ) : (
                                            <>
                                                <ShoppingCart size={18} className="mr-2" />
                                                Buy now
                                            </>
                                        )}
                                    </Button>

                                    {/* Course Includes */}
                                    <div className="pt-4 border-t border-slate-200">
                                        <h3 className="font-bold text-slate-900 mb-3">This course includes:</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <Clock size={16} className="text-slate-500" />
                                                <span>{sections.length} sections</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <PlayCircle size={16} className="text-slate-500" />
                                                <span>On-demand video</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <Smartphone size={16} className="text-slate-500" />
                                                <span>Access on mobile and TV</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <Infinity size={16} className="text-slate-500" />
                                                <span>Full lifetime access</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <Award size={16} className="text-slate-500" />
                                                <span>Certificate of completion</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
