import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    Share2
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
import { useGetCourseDetailsQuery } from "@/store/api/courseApi";
import assetMap from '../imports/assetMap';

interface CourseDetailsProps { }

export default function CourseDetails({ }: CourseDetailsProps) {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const courseId = id || "1";
    const { data: course, isLoading, isError } = useGetCourseDetailsQuery(courseId);

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
                    <span className="text-slate-500">{course.category || "Development"}</span>
                    <span>/</span>
                    <span className="text-slate-900 font-medium truncate max-w-[200px]">{course.title}</span>
                </div>
            </div>

            <main className="w-full max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-12">

                {/* LEFT CONTENT */}
                <div className="flex-1">

                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            {course.badge && <Badge className="bg-[#ffbd2e] text-black border-0 hover:bg-[#ffe58f]">{course.badge}</Badge>}
                            <span className="text-slate-500 text-sm">{course.updatedAt || "Last updated Set 20, 2019"}</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                            {course.title}
                        </h1>

                        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                            {course.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <img src={assetMap[course.instructor.image] || course.instructor.image} className="w-10 h-10 rounded-full object-cover" alt={course.instructor.name} />
                                <div>
                                    <p className="text-slate-900 font-bold">{course.instructor.name}</p>
                                    <p className="text-xs">{course.instructor.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="flex text-[#ffbd2e]">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} className={i < Math.floor(course.rating) ? "fill-current" : "text-slate-200 fill-current"} />
                                    ))}
                                </div>
                                <span className="font-bold text-slate-900 ml-1">{course.rating}</span>
                                <span className="underline decoration-slate-300 decoration-1 underline-offset-4 ml-1">({course.reviewsCount} reviews)</span>
                            </div>
                            <div className="flex gap-4">
                                <span>{course.enrolled || "2,312"} Students</span>
                                <span>{course.language || "English"}</span>
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
                                {course.longDescription || course.description}
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

                    {/* Course Content (Accordion) */}
                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Course Content</h2>
                        <Accordion type="single" collapsible defaultValue="module-1" className="w-full border border-slate-200 rounded-lg overflow-hidden">
                            {(course.modules || []).map((module: Module) => (
                                <AccordionItem key={module.id} value={module.id} className="border-b last:border-0 bg-slate-50/50">
                                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 hover:no-underline">
                                        <div className="flex flex-col items-start gap-1 text-left">
                                            <span className="font-bold text-slate-900 text-base">{module.title}</span>
                                            <span className="text-xs text-slate-500 font-normal">{module.duration} • {module.lessons.length} Lectures</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-0 pb-0 bg-white border-t border-slate-100">
                                        <div className="flex flex-col">
                                            {module.lessons.map((lesson: Lesson) => (
                                                <div key={lesson.id} className="flex justify-between items-center px-6 py-3 hover:bg-slate-50 group cursor-pointer border-b border-slate-50 last:border-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                                            {lesson.isLocked ? <Lock size={14} /> : <PlayCircle size={14} />}
                                                        </div>
                                                        <span className="text-slate-700 group-hover:text-teal-600 transition-colors font-medium text-sm">{lesson.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        {lesson.isPreview && <Badge variant="outline" className="text-teal-600 border-teal-200 text-[10px] hidden sm:inline-flex">Preview</Badge>}
                                                        <span className="text-slate-400 text-xs text-right min-w-[40px]">{lesson.duration}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>

                </div>

                {/* RIGHT SIDEBAR - STICKY CARD */}
                <div className="w-full lg:w-[380px] shrink-0">
                    <div className="sticky top-8 bg-white border border-slate-100 rounded-[20px] shadow-xl shadow-slate-200/50 overflow-hidden">

                        {/* Video Preview Area */}
                        <div className="relative h-[220px] bg-slate-900 group cursor-pointer group">
                            <img src={assetMap[course.image] || course.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" alt="Preview" />
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
                                <span className="text-4xl font-bold text-slate-900">${course.price}</span>
                                <span className="text-lg text-slate-400 line-through mb-1.5">${course.originalPrice}</span>
                                {course.discount && <Badge className="bg-teal-100 text-teal-700 border-0 mb-2">{course.discount}</Badge>}
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
