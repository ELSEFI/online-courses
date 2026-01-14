import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
    ShoppingCart,
    Bell,
    Search,
    ChevronDown,
    ChevronLeft,
    Layout,
    PenTool,
    Play,
    PlayCircle,
    Lock,
    Heart,
    BookOpen,
    Clock,
    Globe,
    Star,
    CheckCircle2,
    MonitorPlay,
    Share2,
    Edit,
    FileQuestion,
    Users as UsersIcon
} from 'lucide-react';
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

import { Course, Module, Lesson } from "@/services/api";
import { useGetCourseDetailsQuery, useGetCourseSectionsQuery } from "@/store/api/courseApi";
import assetMap from '../imports/assetMap';
import SectionAccordionItem from '@/components/course/SectionAccordionItem';

interface CourseDetailsProps { }

export default function CourseDetails({ }: CourseDetailsProps) {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const courseSlug = id || "";
    const { data: courseResponse, isLoading, isError } = useGetCourseDetailsQuery(courseSlug);
    const course = courseResponse?.course;

    // Fetch sections with lessons
    const { data: sectionsData, isLoading: isSectionsLoading, isError: isSectionsError } = useGetCourseSectionsQuery(courseSlug, {
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

    React.useEffect(() => {
        if (canManage && sections.length > 0) {
            const fetchLessonCounts = async () => {
                try {
                    const counts: Record<string, number> = {};
                    let total = 0;

                    await Promise.all(
                        sections.map(async (section: any) => {
                            const response = await fetch(
                                `http://localhost:5000/api/v1/${courseSlug}/sections/${section._id}/lessons`
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
        <div className="min-h-screen bg-white font-sans text-slate-900 w-full mb-16">

            {/* Breadcrumb / Top Nav */}
            <div className="bg-slate-50 border-b border-slate-100 py-4">
                <div className="w-full max-w-[1200px] mx-auto px-4 flex items-center gap-2 text-sm text-slate-500">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="p-0 hover:bg-transparent hover:text-teal-600 gap-1 h-auto text-slate-500">
                        <ChevronLeft size={16} /> Back to Courses
                    </Button>
                    <span>/</span>
                    <span className="text-slate-500">{course.category?.name?.[i18n.language] || course.category?.name?.en || "Development"}</span>
                    <span>/</span>
                    <span className="text-slate-900 font-medium truncate max-w-[200px]">{course.title?.[i18n.language] || course.title?.en}</span>
                </div>
            </div>

            <main className="w-full max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-12">

                {/* LEFT CONTENT */}
                <div className="flex-1">

                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Badge className="bg-[#3dcbb1] text-white border-0">{course.level?.[i18n.language] || course.level?.en || 'All Levels'}</Badge>
                            <span className="text-slate-500 text-sm">{course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : "Recently updated"}</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                            {course.title?.[i18n.language] || course.title?.en}
                        </h1>

                        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                            {course.shortDescription?.[i18n.language] || course.shortDescription?.en || course.description?.[i18n.language] || course.description?.en}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <img
                                    src={course.instructor?.userId?.profileImageUrl || course.instructor?.userId?.profileImage || "https://github.com/shadcn.png"}
                                    className="w-10 h-10 rounded-full object-cover"
                                    alt={course.instructor?.userId?.name}
                                    onError={(e) => { e.currentTarget.src = "https://github.com/shadcn.png"; }}
                                />
                                <div>
                                    <p className="text-slate-900 font-bold">{course.instructor?.userId?.name || 'Instructor'}</p>
                                    <p className="text-xs">{course.instructor?.userId?.role || 'Expert'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="flex text-[#ffbd2e]">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} className={i < Math.floor(course.rating) ? "fill-current" : "text-slate-200 fill-current"} />
                                    ))}
                                </div>
                                <span className="font-bold text-slate-900 ml-1">{course.rating?.toFixed(1) || '0.0'}</span>
                                <span className="underline decoration-slate-300 decoration-1 underline-offset-4 ml-1">({course.totalReviews || course.enrollmentCount || 0} reviews)</span>
                            </div>
                            <div className="flex gap-4">
                                <span>{course.enrollmentCount || 0} Students</span>
                                <span>{i18n.language === 'ar' ? 'العربية/English' : 'English/Arabic'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs / Navigation Anchor (Visual only for now) */}
                    <div className="border-b border-slate-200 mb-8 overflow-x-auto">
                        <div className="flex gap-8 min-w-max">
                            <button className="py-4 text-teal-600 font-bold border-b-2 border-teal-600">About</button>
                            <button className="py-4 text-slate-500 font-medium hover:text-slate-900">Outcomes</button>
                            <button className="py-4 text-slate-500 font-medium hover:text-slate-900">Chapters</button>
                            <button className="py-4 text-slate-500 font-medium hover:text-slate-900">Reviews</button>
                        </div>
                    </div>

                    {/* About Content */}
                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">About Course</h2>
                        <div className="text-slate-600 leading-relaxed rich-text prose prose-slate">
                            <p className="mb-4">
                                {course.description?.[i18n.language] || course.description?.en}
                            </p>
                            <p>
                                Detailed insights into the curriculum will go here. This course covers everything from basic setup to advanced deployment strategies.
                            </p>
                        </div>
                    </div>

                    {/* Outcomes */}
                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">What you will learn</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {["Build fully functional apps", "Master correct coding patterns", "Understand state management", "Deploy to production servers"].map((item, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <CheckCircle2 size={20} className="text-teal-500 shrink-0 mt-0.5" />
                                    <span className="text-slate-700 font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Course Content */}
                    {canManage ? (
                        // Management View for Admin/Instructor
                        <div className="mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Manage Course Content</h2>
                                <Button className="bg-[#3dcbb1] hover:bg-[#34b39d] text-white">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Content
                                </Button>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="p-6 bg-teal-50 border border-teal-100 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Layout className="w-5 h-5 text-teal-600" />
                                        <p className="text-sm text-slate-500 font-bold uppercase">Sections</p>
                                    </div>
                                    <p className="text-3xl font-bold text-slate-900">{sections.length}</p>
                                </div>
                                <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <PlayCircle className="w-5 h-5 text-blue-600" />
                                        <p className="text-sm text-slate-500 font-bold uppercase">Lessons</p>
                                    </div>
                                    <p className="text-3xl font-bold text-slate-900">{totalLessons}</p>
                                </div>
                                <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <UsersIcon className="w-5 h-5 text-orange-600" />
                                        <p className="text-sm text-slate-500 font-bold uppercase">Enrolled</p>
                                    </div>
                                    <p className="text-3xl font-bold text-slate-900">{course?.enrollmentCount || 0}</p>
                                </div>
                            </div>

                            {/* Content Preview */}
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                                <h3 className="font-bold text-slate-900 mb-4">Content Overview</h3>
                                {isSectionsLoading ? (
                                    <p className="text-slate-500">Loading sections...</p>
                                ) : sections.length === 0 ? (
                                    <p className="text-slate-500">No content added yet. Start by adding sections.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {sections.map((section: any, idx: number) => (
                                            <div key={section._id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                                                <span className="font-medium text-slate-700">
                                                    {idx + 1}. {section.title[i18n.language] || section.title.en}
                                                </span>
                                                <span className="text-sm text-slate-500">
                                                    {sectionLessonCounts[section._id] ?? 0} lessons
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Student View
                        <div className="mb-12">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Course Content</h2>

                            {isSectionsLoading ? (
                                <div className="bg-slate-50 rounded-lg p-8 text-center">
                                    <p className="text-slate-500">Loading course content...</p>
                                </div>
                            ) : sections.length === 0 ? (
                                <div className="bg-slate-50 rounded-lg p-8 text-center">
                                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">No content available yet</p>
                                </div>
                            ) : (
                                <Accordion type="single" collapsible className="w-full border border-slate-200 rounded-lg overflow-hidden">
                                    {sections.map((section: any, index: number) => (
                                        <SectionAccordionItem
                                            key={section._id}
                                            section={section}
                                            index={index}
                                            courseSlug={courseSlug}
                                        />
                                    ))}
                                </Accordion>
                            )}
                        </div>
                    )}

                </div>

                {/* RIGHT SIDEBAR - STICKY CARD */}
                <div className="w-full lg:w-[380px] shrink-0">
                    <div className="sticky top-8 bg-white border border-slate-100 rounded-[20px] shadow-xl shadow-slate-200/50 overflow-hidden">

                        {/* Video Preview Area */}
                        <div className="relative h-[220px] bg-slate-900 group cursor-pointer group">
                            <img
                                src={course.thumbnailUrl || assetMap['course1']}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                                alt="Preview"
                                onError={(e) => { e.currentTarget.src = assetMap['course1']; }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
                                        <PlayCircle size={24} className="text-teal-600 ml-1" />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-4 left-0 right-0 text-center">
                                <span className="text-white font-bold text-sm shadow-sm">Preview this course</span>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex items-end gap-3 mb-6">
                                <span className="text-4xl font-bold text-slate-900">${course.price || 0}</span>
                                {course.discountPrice && <span className="text-lg text-slate-400 line-through mb-1.5">${course.discountPrice}</span>}
                                {course.discountPrice && <Badge className="bg-teal-100 text-teal-700 border-0 mb-2">{Math.round(((course.discountPrice - course.price) / course.discountPrice) * 100)}% OFF</Badge>}
                            </div>

                            <div className="flex flex-col gap-3 mb-8">
                                <Button className="h-12 w-full bg-[#3dcbb1] hover:bg-[#34b39d] text-white font-bold text-base rounded-[8px] shadow-lg shadow-[#3dcbb1]/20">
                                    Buy Now
                                </Button>
                                <Button variant="outline" className="h-12 w-full border-slate-200 text-slate-700 font-bold hover:bg-slate-50 rounded-[8px]">
                                    Add to Cart
                                </Button>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h4 className="font-bold text-slate-900">This course includes:</h4>
                                <ul className="space-y-3">
                                    {[
                                        { icon: MonitorPlay, label: "54.5 hours on-demand video" },
                                        { icon: CheckCircle2, label: "Full lifetime access" },
                                        { icon: MonitorPlay, label: "Access on mobile and TV" },
                                        { icon: CheckCircle2, label: "Certificate of completion" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                                            <item.icon size={18} className="text-slate-400" />
                                            <span>{item.label}</span>
                                        </div>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                                <Button variant="ghost" className="text-slate-500 hover:text-slate-900">
                                    <Share2 size={18} className="mr-2" /> Share
                                </Button>
                                <Button variant="ghost" className="text-slate-500 hover:text-rose-600">
                                    <Heart size={18} className="mr-2" /> Save
                                </Button>
                            </div>

                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
