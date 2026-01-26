import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit, Trash2, Plus, Video, FileText, HelpCircle } from 'lucide-react';
import { Section, Lesson } from '../../services/courseContentApi';
import { toast } from 'sonner';

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
    const [isExpanded, setIsExpanded] = useState(false);

    const handleDeleteSection = () => {
        if (window.confirm(`Are you sure you want to delete "${section.title.en}"? This will also deactivate all lessons in this section.`)) {
            onDeleteSection(section._id);
        }
    };

    const handleDeleteLesson = (lessonId: string, lessonTitle: string) => {
        if (window.confirm(`Are you sure you want to delete "${lessonTitle}"?`)) {
            onDeleteLesson(section._id, lessonId);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Section Header */}
            <div className="p-4 bg-gray-50 dark:bg-gray-750">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                    #{section.order}
                                </span>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {section.title.en}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {section.description.en}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {section.lessons?.length || 0} lesson(s)
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onAddLesson(section._id)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Add Lesson"
                        >
                            <Plus size={18} />
                        </button>
                        <button
                            onClick={() => onEditSection(section)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit Section"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            onClick={handleDeleteSection}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete Section"
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
                                <div className="flex items-center gap-3 flex-1">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
                                        #{lesson.order}
                                    </span>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                {lesson.title.en}
                                            </h4>

                                            {/* Indicators */}
                                            <div className="flex items-center gap-1">
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
                                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                                                    Free
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Lesson Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onEditLesson(section._id, lesson)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                        title="Edit Lesson"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteLesson(lesson._id, lesson.title.en)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                        title="Delete Lesson"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p className="text-sm">No lessons yet</p>
                            <button
                                onClick={() => onAddLesson(section._id)}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Add your first lesson
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
