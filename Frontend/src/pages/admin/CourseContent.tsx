import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Loader } from 'lucide-react';
import { toast } from 'sonner';
import SectionCard from '../../components/admin/SectionCard';
import SectionForm from '../../components/admin/SectionForm';
import LessonForm from '../../components/admin/LessonForm';
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

    // Fetch sections
    const fetchSections = async () => {
        if (!courseSlug) return;

        try {
            setLoading(true);
            const response = await getSections(courseSlug) as { sections: Section[] };
            setSections(response.sections || []);
        } catch (error: any) {
            console.error('Error fetching sections:', error);
            toast.error(error.message || 'Failed to load sections');
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
                toast.success('Section created successfully');
            } else if (selectedSection) {
                await updateSection(courseSlug, selectedSection._id, data);
                toast.success('Section updated successfully');
            }
            setIsSectionModalOpen(false);
            fetchSections();
        } catch (error: any) {
            console.error('Error saving section:', error);
            toast.error(error.message || 'Failed to save section');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSection = async (sectionId: string) => {
        if (!courseSlug) return;

        try {
            await deleteSection(courseSlug, sectionId);
            toast.success('Section deleted successfully');
            fetchSections();
        } catch (error: any) {
            console.error('Error deleting section:', error);
            toast.error(error.message || 'Failed to delete section');
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
                toast.success('Lesson created successfully');
            } else if (selectedLesson) {
                await updateLesson(courseSlug, selectedSectionId, selectedLesson._id, formData);
                toast.success('Lesson updated successfully');
            }
            setIsLessonModalOpen(false);
            fetchSections();
        } catch (error: any) {
            console.error('Error saving lesson:', error);
            toast.error(error.message || 'Failed to save lesson');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
        if (!courseSlug) return;

        try {
            await deleteLesson(courseSlug, sectionId, lessonId);
            toast.success('Lesson deleted successfully');
            fetchSections();
        } catch (error: any) {
            console.error('Error deleting lesson:', error);
            toast.error(error.message || 'Failed to delete lesson');
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
                        <span>Back to Courses</span>
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Course Content
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Manage sections and lessons for {courseSlug}
                            </p>
                        </div>

                        <button
                            onClick={handleCreateSection}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            Add Section
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
                                onDeleteSection={handleDeleteSection}
                                onAddLesson={handleAddLesson}
                                onEditLesson={handleEditLesson}
                                onDeleteLesson={handleDeleteLesson}
                            />
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                No sections yet. Create your first section to get started.
                            </p>
                            <button
                                onClick={handleCreateSection}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create First Section
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
        </div>
    );
}
