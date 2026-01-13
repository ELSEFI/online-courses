import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Play,
    CheckCircle2,
    Lock,
    ChevronDown,
    ChevronUp,
    Clock,
    FileText,
    MonitorPlay,
    ChevronLeft,
    CheckCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

import { Course, Module, Lesson } from "@/services/api";
import { useGetCourseDetailsQuery } from "@/store/api/courseApi";
import assetMap from '../imports/assetMap';

interface CourseLearningProps { }

export default function CourseLearning({ }: CourseLearningProps) {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const courseId = id || "1";
    const [activeTab, setActiveTab] = useState<'Description' | 'Courses' | 'Review'>('Courses');
    const [expandedModule, setExpandedModule] = useState<string | null>(null);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

    // RTK Query hook
    const { data: course, isLoading } = useGetCourseDetailsQuery(courseId);

    // Initial state setup when data loads
    useEffect(() => {
        if (course?.modules && course.modules.length > 0) {
            if (!expandedModule) setExpandedModule(course.modules[0].id);
            if (!activeLesson && course.modules[0].lessons.length > 0) {
                setActiveLesson(course.modules[0].lessons[0]);
            }
        }
    }, [course, expandedModule, activeLesson]);

    const handleLessonSelect = (lesson: Lesson) => {
        if (!lesson.isLocked) {
            setActiveLesson(lesson);
        }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-white">Loading Classroom...</div>;
    if (!course) return <div className="flex h-screen items-center justify-center bg-white">Course not found.</div>;

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 w-full mb-16">
            {/* Top Bar */}
            <header className="bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/my-courses')} className="text-slate-400 hover:text-white hover:bg-slate-800">
                        <ChevronLeft />
                    </Button>
                    <div>
                        <h1 className="font-bold text-lg truncate max-w-[200px] sm:max-w-md">{course.title}</h1>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><Clock size={12} /> {course.duration || "45h 20m"}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-xs font-medium text-slate-300 mb-1">Your Progress</span>
                        <div className="w-[150px] flex items-center gap-2">
                            <Progress value={35} className="h-2 bg-slate-700" />
                            <span className="text-xs font-bold text-teal-400">35%</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">

                {/* VIDEO PLAYER & TABS (Left) */}
                <div className="flex-1 flex flex-col gap-6">

                    {/* Video Player Area */}
                    <div className="w-full aspect-video bg-black rounded-[16px] overflow-hidden relative group shadow-2xl shadow-slate-200">
                        {/* Mock Video UI */}
                        {activeLesson ? (
                            <>
                                <img src={assetMap[course.image] || course.image} className="w-full h-full object-cover opacity-40 blur-sm" alt="Video Background" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                    <h2 className="text-2xl font-bold mb-4 px-4 text-center">{activeLesson.title}</h2>
                                    <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg shadow-teal-500/30">
                                        <Play fill="white" size={32} className="ml-1" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">Select a lesson</div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-slate-200">
                        <div className="flex gap-8">
                            {['Courses', 'Description', 'Review'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab
                                        ? 'text-teal-600 border-b-2 border-teal-600'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {tab === 'Courses' ? 'Curriculum' : tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[200px]">
                        {activeTab === 'Courses' && (
                            <div className="block lg:hidden">
                                <p className="text-sm text-slate-500 italic">Curriculum is shown in the sidebar on large screens.</p>
                            </div>
                        )}
                        {activeTab === 'Description' && (
                            <div className="prose prose-slate max-w-none">
                                <h3 className="text-xl font-bold mb-4">About this lesson</h3>
                                <p className="text-slate-600">{activeLesson?.title ? `In this lesson, we will dive deep into ${activeLesson.title}.` : course.description}</p>
                            </div>
                        )}
                        {activeTab === 'Review' && (
                            <div className="text-slate-500">Student reviews will appear here.</div>
                        )}
                    </div>

                </div>

                {/* SIDEBAR CURRICULUM (Right) */}
                <div className="w-full lg:w-[400px] shrink-0 flex flex-col h-full">
                    <div className="bg-slate-50 border border-slate-200 rounded-[16px] overflow-hidden flex flex-col max-h-[calc(100vh-140px)] sticky top-24">
                        <div className="p-4 border-b border-slate-200 bg-white">
                            <h3 className="font-bold text-slate-900">Course Content</h3>
                        </div>

                        <div className="overflow-y-auto p-4 flex flex-col gap-3">
                            {(course.modules || []).map((module: Module) => (
                                <div key={module.id} className="border border-slate-200 rounded-[12px] bg-white overflow-hidden">
                                    <div
                                        className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                                    >
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-slate-800 mb-1">{module.title}</h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span>{module.lessons.length} Lessons</span>
                                                <span>•</span>
                                                <span>{module.duration}</span>
                                            </div>
                                        </div>
                                        {expandedModule === module.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                    </div>

                                    {expandedModule === module.id && (
                                        <div className="border-t border-slate-100 bg-slate-50/50">
                                            {module.lessons.map((lesson: Lesson) => (
                                                <div
                                                    key={lesson.id}
                                                    onClick={() => handleLessonSelect(lesson)}
                                                    className={`p-3 pl-4 flex items-center justify-between cursor-pointer border-l-[3px] transition-all hover:bg-teal-50 ${activeLesson?.id === lesson.id
                                                        ? 'border-teal-500 bg-teal-50/50'
                                                        : 'border-transparent'
                                                        } ${lesson.isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {lesson.isLocked ? (
                                                            <Lock size={14} className="text-slate-400" />
                                                        ) : activeLesson?.id === lesson.id ? (
                                                            <div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center">
                                                                <Play size={8} fill="white" className="text-white ml-0.5" />
                                                            </div>
                                                        ) : (
                                                            <CheckCircle size={14} className="text-slate-300" />
                                                        )}
                                                        <span className={`text-sm font-medium ${activeLesson?.id === lesson.id ? 'text-teal-700' : 'text-slate-700'}`}>
                                                            {lesson.title}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-slate-400">{lesson.duration}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
