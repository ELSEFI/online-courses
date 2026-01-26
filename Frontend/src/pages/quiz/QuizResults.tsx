import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    CheckCircle2,
    XCircle,
    Trophy,
    Award,
    RotateCcw,
    ChevronLeft,
    Home,
    AlertCircle,
    FileQuestion
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { useGetQuizPreviewQuery } from '@/store/api/courseApi';

export default function QuizResults() {
    const { courseSlug, quizId, attemptId } = useParams<{ courseSlug: string; quizId: string; attemptId: string }>();
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const lessonId = new URLSearchParams(location.search).get('lessonId');

    const { data: previewData, isLoading, error } = useGetQuizPreviewQuery(
        { courseSlug: courseSlug!, lessonId: lessonId!, quizId: quizId! },
        { skip: !courseSlug || !lessonId || !quizId }
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (error || !previewData) {
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
                        {isForbidden ? 'Enrollment Required' : 'Error Loading Results'}
                    </h2>

                    <p className="text-slate-600 mb-8 leading-relaxed">
                        {isForbidden
                            ? 'You need to be enrolled in this course to view quiz results.'
                            : 'Could not load your results. Please try again.'}
                    </p>

                    <Button
                        className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-lg font-semibold"
                        onClick={() => navigate(isForbidden ? `/courses/${courseSlug}` : `/learn/${courseSlug}`)}
                    >
                        {isForbidden ? 'View Course Details' : 'Back to Course'}
                    </Button>
                </div>
            </div>
        );
    }

    // Find current attempt from preview data
    const attempt = previewData.attempts.find((a: any) => a._id === attemptId);
    const { quiz } = previewData;

    if (!attempt) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Attempt Not Found</h2>
                    <Button onClick={() => navigate(`/learn/${courseSlug}/quiz/${quizId}?lessonId=${lessonId}`)}>
                        Back to Quiz Preview
                    </Button>
                </div>
            </div>
        );
    }

    const isPassed = attempt.percentage >= 50;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                    {/* Header Banner */}
                    <div className={`p-12 text-center text-white ${isPassed ? 'bg-teal-600' : 'bg-red-500'}`}>
                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
                                {isPassed ? (
                                    <Trophy size={48} className="text-white fill-white/20" />
                                ) : (
                                    <AlertCircle size={48} className="text-white" />
                                )}
                            </div>
                        </div>
                        <h1 className="text-4xl font-extrabold mb-2">
                            {isPassed ? 'Congratulations!' : 'Keep Practicing!'}
                        </h1>
                        <p className="text-xl text-white/80">
                            {isPassed
                                ? 'You passed the quiz with a great score.'
                                : 'You didn\'t pass this time, but you can try again.'}
                        </p>
                    </div>

                    {/* Result Card */}
                    <div className="p-10">
                        <div className="grid grid-cols-2 gap-6 mb-10">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                                <span className="text-slate-500 text-sm block mb-1 font-medium">Your Score</span>
                                <div className="text-3xl font-black text-slate-900">
                                    {attempt.obtainedScore} <span className="text-lg text-slate-400 font-normal">/ {attempt.totalScore}</span>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                                <span className="text-slate-500 text-sm block mb-1 font-medium">Percentage</span>
                                <div className={`text-3xl font-black ${isPassed ? 'text-teal-600' : 'text-red-500'}`}>
                                    {attempt.percentage}%
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-slate-700">Quiz Completion</span>
                                    <Badge variant={isPassed ? "default" : "destructive"} className={isPassed ? "bg-teal-600 px-4 py-1" : "px-4 py-1"}>
                                        {isPassed ? 'PASSED' : 'FAILED'}
                                    </Badge>
                                </div>
                                <Progress value={attempt.percentage} className={`h-4 rounded-full ${isPassed ? 'bg-teal-100' : 'bg-red-100'}`} />
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Award size={20} className="text-teal-600" />
                                    Quiz Summary
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Total Questions</span>
                                        <span className="font-bold text-slate-900">{quiz.questionsCount}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Passing Grade</span>
                                        <span className="font-bold text-slate-900">50%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Date Completed</span>
                                        <span className="font-bold text-slate-900">{new Date(attempt.submittedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full h-14 text-lg font-bold border-2"
                                onClick={() => navigate(`/learn/${courseSlug}`)}
                            >
                                <ChevronLeft className="mr-2" />
                                Back to Course
                            </Button>

                            {previewData.canAttempt ? (
                                <Button
                                    size="lg"
                                    className="w-full h-14 text-lg font-bold bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/20"
                                    onClick={() => navigate(`/learn/${courseSlug}/quiz/${quizId}/take?lessonId=${lessonId}`)}
                                >
                                    <RotateCcw className="mr-2" />
                                    Try Again
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    className="w-full h-14 text-lg font-bold bg-slate-900 hover:bg-slate-800 shadow-lg"
                                    onClick={() => navigate(`/learn/${courseSlug}/quiz/${quizId}?lessonId=${lessonId}`)}
                                >
                                    <FileQuestion className="mr-2" />
                                    Show My Grades
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <p className="text-center mt-8 text-slate-400 text-sm">
                    Review your answers in the previous attempts section of the <button onClick={() => navigate(`/learn/${courseSlug}/quiz/${quizId}?lessonId=${lessonId}`)} className="text-teal-600 font-bold underline">quiz dashboard</button>.
                </p>
            </div>
        </div>
    );
}
