import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    FileQuestion,
    Clock,
    Award,
    ChevronLeft,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { useGetQuizPreviewQuery } from '@/store/api/courseApi';

export default function QuizPreview() {
    const { courseSlug, quizId } = useParams<{ courseSlug: string; quizId: string }>();
    const { i18n } = useTranslation();
    const navigate = useNavigate();

    // Get lessonId from URL or state (you might need to pass this)
    const lessonId = new URLSearchParams(window.location.search).get('lessonId');

    const { data, isLoading, error } = useGetQuizPreviewQuery(
        { courseSlug: courseSlug!, lessonId: lessonId!, quizId: quizId! },
        { skip: !courseSlug || !lessonId || !quizId }
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        const isForbidden = (error as any)?.status === 403;
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
                    <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${isForbidden ? 'bg-amber-100' : 'bg-red-100'}`}>
                        {isForbidden ? (
                            <AlertCircle size={40} className="text-amber-600" />
                        ) : (
                            <XCircle size={40} className="text-red-600" />
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-3">
                        {isForbidden ? 'Enrollment Required' : 'Quiz Not Found'}
                    </h2>

                    <p className="text-slate-600 mb-8 leading-relaxed">
                        {isForbidden
                            ? 'You need to be enrolled in this course to access the quiz and view your attempts.'
                            : 'The quiz you are looking for might have been moved or doesn\'t exist.'}
                    </p>

                    <div className="space-y-3">
                        {isForbidden ? (
                            <Button
                                className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-lg font-semibold"
                                onClick={() => navigate(`/courses/${courseSlug}`)}
                            >
                                View Course Details
                            </Button>
                        ) : (
                            <Button
                                className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-lg font-semibold"
                                onClick={() => navigate(`/learn/${courseSlug}`)}
                            >
                                Back to Course
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            className="w-full h-12"
                            onClick={() => navigate('/')}
                        >
                            Back to Home
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const { quiz, attempts, remainingAttempts, canAttempt } = data;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/learn/${courseSlug}`)}
                    >
                        <ChevronLeft />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            {quiz.title?.[i18n.language] || quiz.title?.en}
                        </h1>
                        <p className="text-sm text-slate-500">Quiz Preview</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT: Quiz Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quiz Details Card */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
                                    <FileQuestion size={32} className="text-teal-600" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                        {quiz.title?.[i18n.language] || quiz.title?.en}
                                    </h2>
                                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <FileQuestion size={16} />
                                            <span>{quiz.questionsCount} Questions</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Award size={16} />
                                            <span>{quiz.totalScore} Points</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} />
                                            <span>{quiz.totalAttempts} Attempts Allowed</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-6">
                                <h3 className="font-semibold text-slate-900 mb-3">Quiz Information</h3>
                                <ul className="space-y-2 text-sm text-slate-700">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 size={16} className="text-teal-600 mt-0.5 flex-shrink-0" />
                                        <span>You have <strong>{remainingAttempts}</strong> attempt(s) remaining</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 size={16} className="text-teal-600 mt-0.5 flex-shrink-0" />
                                        <span>Passing score: <strong>50%</strong></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 size={16} className="text-teal-600 mt-0.5 flex-shrink-0" />
                                        <span>You can review your answers after submission</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Previous Attempts */}
                        {attempts && attempts.length > 0 && (
                            <div className="bg-white rounded-lg border border-slate-200 p-6">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Your Previous Attempts</h3>
                                <div className="space-y-4">
                                    {attempts.map((attempt: any, index: number) => (
                                        <div
                                            key={attempt._id}
                                            className="border border-slate-200 rounded-lg p-4 hover:border-teal-300 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant={attempt.passed ? "default" : "destructive"} className={attempt.passed ? "bg-teal-600" : ""}>
                                                        Attempt {attempts.length - index}
                                                    </Badge>
                                                    {attempt.passed ? (
                                                        <CheckCircle2 size={20} className="text-teal-600" />
                                                    ) : (
                                                        <XCircle size={20} className="text-red-500" />
                                                    )}
                                                </div>
                                                <span className="text-sm text-slate-500">
                                                    {new Date(attempt.submittedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-slate-700">
                                                            Score: {attempt.obtainedScore} / {attempt.totalScore}
                                                        </span>
                                                        <span className={`text-sm font-bold ${attempt.passed ? 'text-teal-600' : 'text-red-600'}`}>
                                                            {attempt.percentage}%
                                                        </span>
                                                    </div>
                                                    <Progress value={attempt.percentage} className="h-2" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Action Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-24">
                            <h3 className="font-bold text-slate-900 mb-4">Ready to Start?</h3>

                            {canAttempt ? (
                                <>
                                    <p className="text-sm text-slate-600 mb-6">
                                        You have {remainingAttempts} attempt(s) remaining. Good luck!
                                    </p>
                                    <Button
                                        size="lg"
                                        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                                        onClick={() => navigate(`/learn/${courseSlug}/quiz/${quizId}/take?lessonId=${lessonId}`)}
                                    >
                                        <FileQuestion className="mr-2" size={20} />
                                        Start Quiz
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-red-900 mb-1">
                                                    No Attempts Remaining
                                                </p>
                                                <p className="text-xs text-red-700">
                                                    You have used all {quiz.totalAttempts} attempts for this quiz.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate(`/learn/${courseSlug}`)}
                                    >
                                        Back to Course
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
