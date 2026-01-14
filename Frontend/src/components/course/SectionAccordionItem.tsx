import React, { useState } from 'react';
import { useGetSectionLessonsQuery } from '@/store/api/courseApi';
import { useTranslation } from 'react-i18next';
import { PlayCircle, BookOpen, FileQuestion, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface SectionAccordionItemProps {
    section: any;
    index: number;
    courseSlug: string;
}

export default function SectionAccordionItem({ section, index, courseSlug }: SectionAccordionItemProps) {
    const { i18n } = useTranslation();
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
                        lessons.map((lesson: any, lessonIndex: number) => (
                            <div
                                key={lesson._id}
                                className="flex justify-between items-center px-6 py-3 hover:bg-slate-50 group cursor-pointer border-b border-slate-50 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                        {lesson.hasQuiz ? (
                                            <FileQuestion size={14} />
                                        ) : lesson.video ? (
                                            <PlayCircle size={14} />
                                        ) : (
                                            <BookOpen size={14} />
                                        )}
                                    </div>
                                    <span className="text-slate-700 group-hover:text-teal-600 transition-colors font-medium text-sm">
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
                                </div>
                            </div>
                        ))
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
