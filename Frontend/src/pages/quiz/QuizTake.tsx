import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ChevronLeft,
    ChevronRight,
    Send,
    Circle,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Clock,
    HelpCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

import { useGetQuizQuery, useSubmitQuizMutation } from '@/store/api/courseApi';

export default function QuizTake() {
    const { courseSlug, quizId } = useParams<{ courseSlug: string; quizId: string }>();
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const lessonId = new URLSearchParams(location.search).get('lessonId');

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: quizData, isLoading, error } = useGetQuizQuery(
        { courseSlug: courseSlug!, lessonId: lessonId!, quizId: quizId! },
        { skip: !courseSlug || !lessonId || !quizId }
    );

    const [submitQuiz] = useSubmitQuizMutation();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading questions...</p>
                </div>
            </div>
        );
    }

    if (error || !quizData?.quiz) {
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
                        {isForbidden ? 'Enrollment Required' : 'Error Loading Quiz'}
                    </h2>

                    <p className="text-slate-600 mb-8 leading-relaxed">
                        {isForbidden
                            ? 'You need to be enrolled in this course to take the quiz.'
                            : 'Could not load quiz questions. Please try again.'}
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

    const { quiz } = quizData;
    const questions = quiz.questions || [];
    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    const handleOptionSelect = (optionIndex: number) => {
        const questionKey = currentQuestion._id || `q_${currentQuestionIndex}`;
        setSelectedAnswers({
            ...selectedAnswers,
            [questionKey]: optionIndex
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {
        const answeredCount = Object.keys(selectedAnswers).length;
        if (answeredCount < totalQuestions) {
            toast.warning(`Please answer all questions before submitting. (${answeredCount}/${totalQuestions})`);
            return;
        }

        setIsSubmitting(true);
        try {
            // Transform answers to the format expected by backend
            const formattedAnswers = questions.map((q: any, idx: number) => {
                const qKey = q._id || `q_${idx}`;
                return {
                    questionId: q._id, // If _id is missing, backend will still need it
                    selectedOptionIndex: selectedAnswers[qKey]
                };
            });

            const result = await submitQuiz({
                courseSlug: courseSlug!,
                lessonId: lessonId!,
                quizId: quizId!,
                answers: formattedAnswers
            }).unwrap();

            toast.success("Quiz submitted successfully!");
            navigate(`/learn/${courseSlug}/quiz/${quizId}/results/${result.attempt._id}?lessonId=${lessonId}`);
        } catch (err: any) {
            console.error("Submission error:", err);
            toast.error(err?.data?.message || "Failed to submit quiz.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (window.confirm("Are you sure you want to leave? Your progress will not be saved.")) {
                                    navigate(-1);
                                }
                            }}
                        >
                            <ChevronLeft />
                        </Button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">
                                {quiz.title?.[i18n.language] || quiz.title?.en}
                            </h1>
                            <p className="text-xs text-slate-500">
                                Question {currentQuestionIndex + 1} of {totalQuestions}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Progress</span>
                            <span className="text-sm font-bold text-teal-600">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="w-24 h-2" />
                    </div>
                </div>
            </header>

            {/* Quiz Body */}
            <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Question Header */}
                    <div className="bg-slate-50 border-b border-slate-200 p-8">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                                {currentQuestionIndex + 1}
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900 leading-tight">
                                {currentQuestion.questionText}
                            </h2>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="p-8 space-y-4">
                        {currentQuestion.options.map((option: string, index: number) => {
                            const questionKey = currentQuestion._id || `q_${currentQuestionIndex}`;
                            const isSelected = selectedAnswers[questionKey] === index;
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleOptionSelect(index)}
                                    className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left ${isSelected
                                        ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-md transform scale-[1.01]'
                                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-teal-600' : 'border-slate-300'
                                        }`}>
                                        {isSelected && <div className="w-3 h-3 rounded-full bg-teal-600" />}
                                    </div>
                                    <span className="font-medium">{option}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer Controls */}
                    <div className="bg-slate-50 border-t border-slate-200 p-6 flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                            className="px-6"
                        >
                            <ChevronLeft className="mr-2" size={18} />
                            Previous
                        </Button>

                        {currentQuestionIndex === totalQuestions - 1 ? (
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-8"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Finish & Submit
                                        <Send className="ml-2" size={18} />
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                className="bg-slate-900 hover:bg-slate-800 text-white px-8"
                            >
                                Next
                                <ChevronRight className="ml-2" size={18} />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Question Grid (Quick Navigation) */}
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {questions.map((q: any, idx: number) => {
                        const qKey = q._id || `q_${idx}`;
                        const isAnswered = selectedAnswers[qKey] !== undefined;
                        const isCurrent = idx === currentQuestionIndex;
                        return (
                            <button
                                key={q._id}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-bold transition-all ${isCurrent
                                    ? 'bg-teal-600 border-teal-600 text-white shadow-lg scale-110'
                                    : isAnswered
                                        ? 'bg-teal-50 border-teal-200 text-teal-700'
                                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
