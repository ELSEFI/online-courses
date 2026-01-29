import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Edit, Trash2, Plus, Video, FileText, HelpCircle } from 'lucide-react';
import { Section, Lesson } from '../../services/courseContentApi';

interface SectionCardProps {
    section: Section;
    onEditSection: (section: Section) => void;
    onDeleteSection: (sectionId: string) => void;
    onAddLesson: (sectionId: string) => void;
    onEditLesson: (sectionId: string, lesson: Lesson) => void;
    onDeleteLesson: (sectionId: string, lessonId: string) => void;
}

export default function SectionCard({
    section,
    onEditSection,
    onDeleteSection,
    onAddLesson,
    onEditLesson,
    onDeleteLesson,
}: SectionCardProps) {
    const { t, i18n } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const isRtl = i18n.language.startsWith('ar');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Section Header */}
            <div className="p-4 bg-gray-50 dark:bg-gray-750">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shrink-0"
                        >
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                    #{section.order}
                                </span>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                    {isRtl ? (section.title.ar || section.title.en) : section.title.en}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                                {isRtl ? (section.description.ar || section.description.en) : section.description.en}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {section.lessons?.length || 0} {t('admin.lesson_count')}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => onAddLesson(section._id)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title={t('admin.add_lesson')}
                        >
                            <Plus size={18} />
                        </button>
                        <button
                            onClick={() => onEditSection(section)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title={t('admin.edit_section')}
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            onClick={() => onDeleteSection(section._id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title={t('admin.delete_section')}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Lessons List */}
            {isExpanded && (
                <div className="p-4 space-y-2">
                    {section.lessons && section.lessons.length > 0 ? (
                        section.lessons.map((lesson) => (
                            <div
                                key={lesson._id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded shrink-0">
                                        #{lesson.order}
                                    </span>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {isRtl ? (lesson.title.ar || lesson.title.en) : lesson.title.en}
                                            </h4>

                                            {/* Indicators */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                {lesson.video && (
                                                    <Video size={14} className="text-purple-600" />
                                                )}
                                                {lesson.files && lesson.files.length > 0 && (
                                                    <FileText size={14} className="text-blue-600" />
                                                )}
                                                {lesson.hasQuiz && (
                                                    <HelpCircle size={14} className="text-orange-600" />
                                                )}
                                            </div>

                                            {/* Free Badge */}
                                            {lesson.isFree && (
                                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full shrink-0">
                                                    {t('admin.free')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Lesson Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => onEditLesson(section._id, lesson)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                        title={t('admin.edit_lesson')}
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDeleteLesson(section._id, lesson._id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                        title={t('admin.delete_lesson')}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p className="text-sm">{t('admin.no_lessons')}</p>
                            <button
                                onClick={() => onAddLesson(section._id)}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                {t('admin.add_first_lesson')}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
