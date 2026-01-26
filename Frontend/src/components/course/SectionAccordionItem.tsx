import React, { useState } from 'react';
import { useGetSectionLessonsQuery } from '@/store/api/courseApi';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, BookOpen, FileQuestion, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface SectionAccordionItemProps {
    section: any;
    index: number;
    courseSlug: string;
    isEnrolled?: boolean;
    canManage?: boolean;
}

export default function SectionAccordionItem({ section, index, courseSlug, isEnrolled = false, canManage = false }: SectionAccordionItemProps) {
    const { i18n, t } = useTranslation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    // Only fetch lessons when accordion is opened
    const { data: lessonsData, isLoading: isLessonsLoading } = useGetSectionLessonsQuery(
        { courseSlug, sectionId: section._id },
        { skip: !isOpen }
    );

    const lessons = lessonsData?.lessons || [];

    return (
        <AccordionItem
            key={section._id}
            value={section._id}
            className="border-b last:border-0 bg-slate-50/50"
        >
            <AccordionTrigger
                className="px-6 py-4 hover:bg-slate-50 hover:no-underline"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex flex-col items-start gap-1 text-left">
                        <span className="font-bold text-slate-900 text-base">
                            Section {index + 1}: {section.title[i18n.language] || section.title.en}
                        </span>
                        <span className="text-xs text-slate-500 font-normal">
                            {section.description?.[i18n.language] || section.description?.en || 'No description'}
                        </span>
                    </div>
                </div>
            </AccordionTrigger>

            <AccordionContent className="px-0 pb-0 bg-white border-t border-slate-100">
                <div className="flex flex-col">
                    {isLessonsLoading ? (
                        <div className="px-6 py-4 text-center text-slate-500 text-sm">
                            Loading lessons...
                        </div>
                    ) : lessons.length > 0 ? (
                        lessons.map((lesson: any, lessonIndex: number) => {
                            const isLocked = !canManage && !isEnrolled && !lesson.isFree;

                            return (
                                <div
                                    key={lesson._id}
                                    className={`flex justify-between items-center px-6 py-3 border-b border-slate-50 last:border-0 ${isLocked ? 'opacity-60' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isLocked
                                                ? 'bg-slate-200 text-slate-400'
                                                : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            {isLocked ? (
                                                <Lock size={14} />
                                            ) : lesson.hasQuiz ? (
                                                <FileQuestion size={14} />
                                            ) : lesson.video ? (
                                                <PlayCircle size={14} />
                                            ) : (
                                                <BookOpen size={14} />
                                            )}
                                        </div>
                                        <span className={`text-sm font-medium ${isLocked ? 'text-slate-400' : 'text-slate-700'
                                            }`}>
                                            {lessonIndex + 1}. {lesson.title[i18n.language] || lesson.title.en}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {lesson.isFree && (
                                            <Badge variant="outline" className="text-teal-600 border-teal-200 text-[10px] hidden sm:inline-flex">
                                                Free Preview
                                            </Badge>
                                        )}
                                        {lesson.hasQuiz && (
                                            <Badge variant="outline" className="text-orange-600 border-orange-200 text-[10px] hidden sm:inline-flex">
                                                Quiz
                                            </Badge>
                                        )}
                                        {isLocked && (
                                            <Lock size={14} className="text-slate-400" />
                                        )}
                                        <span className="text-xs text-slate-500">{lesson.duration || '5:00'}</span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="px-6 py-4 text-center text-slate-500 text-sm">
                            No lessons in this section yet
                        </div>
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
