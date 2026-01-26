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
    CheckCircle,
    PlayCircle,
    BookOpen,
    FileQuestion
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

import { useGetCourseDetailsQuery, useGetCourseSectionsQuery, useGetSectionLessonsQuery, useGetQuizPreviewQuery } from '@/store/api/courseApi';
import assetMap from '../imports/assetMap';

export default function CourseLearning() {
    const { courseSlug } = useParams<{ courseSlug: string }>();
    const { i18n } = useTranslation();
    const navigate = useNavigate();

    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [activeLesson, setActiveLesson] = useState<any | null>(null);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

    // Fetch course details
    const { data: courseData, isLoading: isCourseLoading } = useGetCourseDetailsQuery(courseSlug!, {
        skip: !courseSlug,
    });
    const course = courseData?.course;

    // Fetch sections
    const { data: sectionsData, isLoading: isSectionsLoading } = useGetCourseSectionsQuery(courseSlug!, {
        skip: !courseSlug,
    });
    const sections = sectionsData?.sections || [];

    // Fetch lessons for active section
    const { data: lessonsData, isLoading: isLessonsLoading } = useGetSectionLessonsQuery(
        { courseSlug: courseSlug!, sectionId: activeSectionId! },
        { skip: !courseSlug || !activeSectionId }
    );
    const activeLessons = lessonsData?.lessons || [];

    // Auto-expand first section and select first lesson
    useEffect(() => {
        if (sections.length > 0 && !expandedSection) {
            const firstSection = sections[0];
            setExpandedSection(firstSection._id);
            setActiveSectionId(firstSection._id);
        }
    }, [sections, expandedSection]);

    // Auto-select first lesson when lessons load
    useEffect(() => {
        if (activeLessons.length > 0 && !activeLesson) {
            setActiveLesson(activeLessons[0]);
        }
    }, [activeLessons, activeLesson]);

    const handleSectionToggle = (sectionId: string) => {
        if (expandedSection === sectionId) {
            setExpandedSection(null);
            setActiveSectionId(null);
        } else {
            setExpandedSection(sectionId);
            setActiveSectionId(sectionId);
        }
    };

    const handleLessonSelect = (lesson: any) => {
        setActiveLesson(lesson);
    };

    if (isCourseLoading || isSectionsLoading) {
        return <div className="flex h-screen items-center justify-center bg-slate-900 text-white">Loading Course...</div>;
    }

    if (!course) {
        return <div className="flex h-screen items-center justify-center bg-slate-900 text-white">Course not found.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-white w-full">
            {/* Top Bar */}
            <header className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/courses/${courseSlug}`)}
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        <ChevronLeft />
                    </Button>
                    <div>
                        <h1 className="font-bold text-lg truncate max-w-[200px] sm:max-w-md">
                            {course.title?.[i18n.language] || course.title?.en}
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                                <Clock size={12} /> {sections.length} sections
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-xs font-medium text-slate-300 mb-1">Your Progress</span>
                        <div className="w-[150px] flex items-center gap-2">
                            <Progress value={0} className="h-2 bg-slate-700" />
                            <span className="text-xs font-bold text-teal-400">0%</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex h-[calc(100vh-73px)]">

                {/* LEFT: Video Player */}
                <div className="flex-1 flex flex-col bg-black">
                    {/* Video Player Area */}
                    <div className="flex-1 relative group bg-black">
                        {activeLesson ? (
                            activeLesson.hasQuiz ? (
                                <QuizEntryPoint
                                    courseSlug={courseSlug!}
                                    lesson={activeLesson}
                                    i18n={i18n}
                                    navigate={navigate}
                                />
                            ) : activeLesson.videoUrl ? (
                                <video
                                    key={activeLesson._id}
                                    className="w-full h-full"
                                    controls
                                    autoPlay
                                    controlsList="nodownload"
                                >
                                    <source src={activeLesson.videoUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-white">
                                    <FileText size={64} className="text-slate-600 mb-4" />
                                    <h2 className="text-2xl font-bold mb-2">
                                        {activeLesson.title?.[i18n.language] || activeLesson.title?.en}
                                    </h2>
                                    <p className="text-slate-400">
                                        This lesson has no video content
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">
                                Select a lesson to start learning
                            </div>
                        )}
                    </div>

                    {/* Lesson Info Bar */}
                    {activeLesson && (
                        <div className="bg-slate-950 border-t border-slate-800 p-4">
                            <h3 className="font-bold text-white mb-2">
                                {activeLesson.title?.[i18n.language] || activeLesson.title?.en}
                            </h3>
                            <p className="text-sm text-slate-400">
                                {activeLesson.description?.[i18n.language] || activeLesson.description?.en || 'No description available'}
                            </p>
                        </div>
                    )}
                </div>

                {/* RIGHT: Course Content Sidebar */}
                <div className="w-[400px] bg-slate-900 border-l border-slate-800 overflow-y-auto">
                    <div className="p-4 border-b border-slate-800 bg-slate-950">
                        <h3 className="font-bold text-white">Course Content</h3>
                        <p className="text-xs text-slate-400 mt-1">
                            {sections.length} sections
                        </p>
                    </div>

                    <div className="p-4 space-y-2">
                        {sections.map((section: any, index: number) => (
                            <div key={section._id} className="border border-slate-800 rounded-lg bg-slate-950 overflow-hidden">
                                <div
                                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-800 transition-colors"
                                    onClick={() => handleSectionToggle(section._id)}
                                >
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm text-white mb-1">
                                            Section {index + 1}: {section.title[i18n.language] || section.title.en}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <span>{section.lessons?.length || 0} Lessons</span>
                                        </div>
                                    </div>
                                    {expandedSection === section._id ?
                                        <ChevronUp size={16} className="text-slate-400" /> :
                                        <ChevronDown size={16} className="text-slate-400" />
                                    }
                                </div>

                                {expandedSection === section._id && (
                                    <div className="border-t border-slate-800 bg-slate-900">
                                        {isLessonsLoading && activeSectionId === section._id ? (
                                            <div className="p-4 text-center text-slate-500 text-sm">
                                                Loading lessons...
                                            </div>
                                        ) : activeSectionId === section._id && activeLessons.length > 0 ? (
                                            activeLessons.map((lesson: any, lessonIndex: number) => (
                                                <div
                                                    key={lesson._id}
                                                    onClick={() => handleLessonSelect(lesson)}
                                                    className={`p-3 pl-4 flex items-center justify-between cursor-pointer border-l-[3px] transition-all hover:bg-slate-800 ${activeLesson?._id === lesson._id
                                                        ? 'border-teal-500 bg-slate-800'
                                                        : 'border-transparent'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {activeLesson?._id === lesson._id ? (
                                                            <div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center">
                                                                <Play size={8} fill="white" className="text-white ml-0.5" />
                                                            </div>
                                                        ) : lesson.hasQuiz ? (
                                                            <FileQuestion size={14} className="text-slate-400" />
                                                        ) : lesson.video ? (
                                                            <PlayCircle size={14} className="text-slate-400" />
                                                        ) : (
                                                            <BookOpen size={14} className="text-slate-400" />
                                                        )}
                                                        <span className={`text-sm font-medium ${activeLesson?._id === lesson._id ? 'text-teal-400' : 'text-slate-300'
                                                            }`}>
                                                            {lessonIndex + 1}. {lesson.title[i18n.language] || lesson.title.en}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {lesson.isFree && (
                                                            <Badge variant="outline" className="text-teal-400 border-teal-600 text-[10px]">
                                                                Free
                                                            </Badge>
                                                        )}
                                                        <span className="text-xs text-slate-500">{lesson.duration || '5:00'}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-slate-500 text-sm">
                                                No lessons in this section
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main >
        </div >
    );
}

// Sub-component to handle quiz entry logic logically
function QuizEntryPoint({ courseSlug, lesson, i18n, navigate }: { courseSlug: string, lesson: any, i18n: any, navigate: any }) {
    const quizId = typeof lesson.quiz === 'object' ? lesson.quiz._id : lesson.quiz;

    const { data: quizStatus, isLoading } = useGetQuizPreviewQuery(
        { courseSlug, lessonId: lesson._id, quizId },
        { skip: !courseSlug || !lesson._id || !quizId }
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white px-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                <p className="text-slate-400">Checking quiz status...</p>
            </div>
        );
    }

    const attemptsCount = quizStatus?.attempts?.length || 0;
    const canAttempt = quizStatus?.canAttempt;
    const latestAttempt = attemptsCount > 0 ? quizStatus.attempts[0] : null;

    let buttonText = "Take Quiz";
    let statusText = "This lesson includes a quiz to test your knowledge";
    let Icon = FileQuestion;

    if (attemptsCount > 0) {
        if (canAttempt) {
            buttonText = "Retake Quiz";
            statusText = `You previously scored ${latestAttempt.percentage}%. You have ${quizStatus.remainingAttempts} attempt(s) left.`;
        } else {
            buttonText = "View Results";
            statusText = `You've completed all attempts. Your best score was ${Math.max(...quizStatus.attempts.map((a: any) => a.percentage))}%`;
            Icon = CheckCircle2;
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-white px-8">
            <Icon size={80} className={`${canAttempt || attemptsCount === 0 ? 'text-teal-500' : 'text-blue-500'} mb-6`} />
            <h2 className="text-3xl font-bold mb-3 text-center">
                {lesson.title?.[i18n.language] || lesson.title?.en}
            </h2>
            <p className="text-slate-400 mb-8 text-center max-w-md italic">
                {statusText}
            </p>
            <Button
                size="lg"
                className={`${canAttempt || attemptsCount === 0 ? 'bg-teal-600 hover:bg-teal-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-8 py-6 text-lg transition-all transform hover:scale-105`}
                onClick={() => {
                    const url = `/learn/${courseSlug}/quiz/${quizId}?lessonId=${lesson._id}`;
                    window.open(url, '_blank');
                }}
            >
                <Icon className="mr-3" size={24} />
                {buttonText}
            </Button>

            {attemptsCount > 0 && (
                <p className="mt-4 text-xs text-slate-500">
                    Total Attempts: {attemptsCount} / {quizStatus.quiz?.totalAttempts}
                </p>
            )}
        </div>
    );
}
