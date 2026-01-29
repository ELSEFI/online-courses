import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Loader } from 'lucide-react';
import { toast } from 'sonner';
import SectionCard from '../../components/admin/SectionCard';
import SectionForm from '../../components/admin/SectionForm';
import LessonForm from '../../components/admin/LessonForm';
import ConfirmModal from '../../components/admin/ConfirmModal';
import {
    Section,
    Lesson,
    SectionData,
    getSections,
    createSection,
    updateSection,
    deleteSection,
    createLesson,
    updateLesson,
    deleteLesson,
} from '../../services/courseContentApi';

export default function CourseContent() {
    const { courseSlug } = useParams<{ courseSlug: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Section Modal State
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [sectionMode, setSectionMode] = useState<'create' | 'edit'>('create');
    const [selectedSection, setSelectedSection] = useState<Section | undefined>();

    // Lesson Modal State
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [lessonMode, setLessonMode] = useState<'create' | 'edit'>('create');
    const [selectedLesson, setSelectedLesson] = useState<Lesson | undefined>();
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');

    // Delete Confirmation State
    const [deleteConfig, setDeleteConfig] = useState<{
        type: 'section' | 'lesson';
        sectionId: string;
        lessonId?: string;
    } | null>(null);

    // Fetch sections
    const fetchSections = async () => {
        if (!courseSlug) return;

        try {
            setLoading(true);
            const response = await getSections(courseSlug) as { sections: Section[] };
            setSections(response.sections || []);
        } catch (error: any) {
            console.error('Error fetching sections:', error);
            toast.error(error.message || t('admin.failed_load_sections'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSections();
    }, [courseSlug]);

    // Section Handlers
    const handleCreateSection = () => {
        setSectionMode('create');
        setSelectedSection(undefined);
        setIsSectionModalOpen(true);
    };

    const handleEditSection = (section: Section) => {
        setSectionMode('edit');
        setSelectedSection(section);
        setIsSectionModalOpen(true);
    };

    const handleSectionSubmit = async (data: SectionData) => {
        if (!courseSlug) return;

        try {
            setSaving(true);
            if (sectionMode === 'create') {
                await createSection(courseSlug, data);
                toast.success(t('admin.section_created'));
            } else if (selectedSection) {
                await updateSection(courseSlug, selectedSection._id, data);
                toast.success(t('admin.section_updated'));
            }
            setIsSectionModalOpen(false);
            fetchSections();
        } catch (error: any) {
            console.error('Error saving section:', error);
            toast.error(error.message || t('admin.failed_save_section'));
        } finally {
            setSaving(false);
        }
    };

    const confirmDeleteSection = (sectionId: string) => {
        setDeleteConfig({ type: 'section', sectionId });
    };

    const handleDeleteSection = async () => {
        if (!courseSlug || !deleteConfig || deleteConfig.type !== 'section') return;

        try {
            await deleteSection(courseSlug, deleteConfig.sectionId);
            toast.success(t('admin.section_deleted'));
            fetchSections();
            setDeleteConfig(null);
        } catch (error: any) {
            console.error('Error deleting section:', error);
            toast.error(error.message || t('admin.failed_delete_section'));
        }
    };

    // Lesson Handlers
    const handleAddLesson = (sectionId: string) => {
        setLessonMode('create');
        setSelectedSectionId(sectionId);
        setSelectedLesson(undefined);
        setIsLessonModalOpen(true);
    };

    const handleEditLesson = (sectionId: string, lesson: Lesson) => {
        setLessonMode('edit');
        setSelectedSectionId(sectionId);
        setSelectedLesson(lesson);
        setIsLessonModalOpen(true);
    };

    const handleLessonSubmit = async (formData: FormData) => {
        if (!courseSlug) return;

        try {
            setSaving(true);
            if (lessonMode === 'create') {
                await createLesson(courseSlug, selectedSectionId, formData);
                toast.success(t('admin.lesson_created'));
            } else if (selectedLesson) {
                await updateLesson(courseSlug, selectedSectionId, selectedLesson._id, formData);
                toast.success(t('admin.lesson_updated'));
            }
            setIsLessonModalOpen(false);
            fetchSections();
        } catch (error: any) {
            console.error('Error saving lesson:', error);
            toast.error(error.message || t('admin.failed_save_lesson'));
        } finally {
            setSaving(false);
        }
    };

    const confirmDeleteLesson = (sectionId: string, lessonId: string) => {
        setDeleteConfig({ type: 'lesson', sectionId, lessonId });
    };

    const handleDeleteLesson = async () => {
        if (!courseSlug || !deleteConfig || deleteConfig.type !== 'lesson' || !deleteConfig.lessonId) return;

        try {
            await deleteLesson(courseSlug, deleteConfig.sectionId, deleteConfig.lessonId);
            toast.success(t('admin.lesson_deleted'));
            fetchSections();
            setDeleteConfig(null);
        } catch (error: any) {
            console.error('Error deleting lesson:', error);
            toast.error(error.message || t('admin.failed_delete_lesson'));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/admin/courses')}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span>{t('admin.back_to_courses')}</span>
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {t('admin.course_content')}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {t('admin.manage_content_desc')}
                            </p>
                        </div>

                        <button
                            onClick={handleCreateSection}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            {t('admin.add_section')}
                        </button>
                    </div>
                </div>

                {/* Sections List */}
                <div className="space-y-4">
                    {sections.length > 0 ? (
                        sections.map((section) => (
                            <SectionCard
                                key={section._id}
                                section={section}
                                onEditSection={handleEditSection}
                                onDeleteSection={confirmDeleteSection}
                                onAddLesson={handleAddLesson}
                                onEditLesson={handleEditLesson}
                                onDeleteLesson={confirmDeleteLesson}
                            />
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {t('admin.no_sections')}
                            </p>
                            <button
                                onClick={handleCreateSection}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {t('admin.create_first_section')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Section Form Modal */}
            <SectionForm
                isOpen={isSectionModalOpen}
                onClose={() => setIsSectionModalOpen(false)}
                onSubmit={handleSectionSubmit}
                mode={sectionMode}
                initialData={
                    selectedSection
                        ? {
                            titleEn: selectedSection.title.en,
                            titleAr: selectedSection.title.ar,
                            descriptionEn: selectedSection.description.en,
                            descriptionAr: selectedSection.description.ar,
                            order: selectedSection.order,
                            _id: selectedSection._id,
                        }
                        : undefined
                }
                isLoading={saving}
            />

            {/* Lesson Form Modal */}
            <LessonForm
                isOpen={isLessonModalOpen}
                onClose={() => setIsLessonModalOpen(false)}
                onSubmit={handleLessonSubmit}
                mode={lessonMode}
                initialData={selectedLesson}
                isLoading={saving}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteConfig}
                onClose={() => setDeleteConfig(null)}
                onConfirm={deleteConfig?.type === 'section' ? handleDeleteSection : handleDeleteLesson}
                title={deleteConfig?.type === 'section' ? t('admin.delete_section') : t('admin.delete_lesson')}
                message={deleteConfig?.type === 'section' ? t('admin.delete_section_confirm') : t('admin.delete_lesson_confirm')}
                confirmText={t('admin.delete')}
                variant="danger"
            />
        </div>
    );
}
