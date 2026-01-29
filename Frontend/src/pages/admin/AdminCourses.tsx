import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAllCourses, changePublishStatus, deleteCourse, createCourse, updateCourse } from '../../services/adminApi';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, CheckCircle, XCircle, FolderOpen } from 'lucide-react';
import CourseForm from '../../components/admin/CourseForm';
import ConfirmModal from '../../components/admin/ConfirmModal';

interface Course {
    _id: string;
    title: { en: string; ar: string };
    slug: string;
    price: number;
    discountPrice: number;
    isPublished: boolean;
    enrollmentCount: number;
    rating: number;
    instructor?: {
        _id: string;
        userId?: {
            name: string;
        };
    };
}

const AdminCourses = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();
    const [searchQuery, setSearchQuery] = useState('');

    // Delete Confirmation State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredCourses(courses);
        } else {
            const filtered = courses.filter((course) => {
                const titleEn = course.title?.en?.toLowerCase() || '';
                const titleAr = course.title?.ar || '';
                const query = searchQuery.toLowerCase();
                return titleEn.includes(query) || titleAr.includes(searchQuery);
            });
            setFilteredCourses(filtered);
        }
    }, [searchQuery, courses]);

    const fetchCourses = async () => {
        try {
            const data: any = await getAllCourses();
            console.log('Admin Courses Response:', data);
            const coursesData = data.courses || [];
            setCourses(coursesData);
            setFilteredCourses(coursesData);
        } catch (error) {
            toast.error(t('admin.failed_load_courses'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const togglePublishStatus = async (courseId: string, currentStatus: boolean) => {
        try {
            await changePublishStatus(courseId, { isPublished: !currentStatus });
            toast.success(t('admin.course_status_updated'));
            fetchCourses();
        } catch (error) {
            toast.error(t('admin.failed_update_course'));
            console.error(error);
        }
    };

    const handleDeleteClick = (courseId: string) => {
        setCourseToDelete(courseId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!courseToDelete) return;

        try {
            await deleteCourse(courseToDelete);
            toast.success(t('admin.course_deleted_success'));
            fetchCourses();
            setIsDeleteModalOpen(false);
            setCourseToDelete(null);
        } catch (error) {
            toast.error(t('admin.failed_delete_course'));
            console.error(error);
        }
    };

    const handleCreateCourse = () => {
        setModalMode('create');
        setSelectedCourse(undefined);
        setIsModalOpen(true);
    };

    const handleEditCourse = (course: Course) => {
        setModalMode('edit');
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (formData: FormData) => {
        try {
            if (modalMode === 'create') {
                await createCourse(formData);
                toast.success(t('admin.course_created_success'));
            } else {
                await updateCourse(selectedCourse!._id, formData);
                toast.success(t('admin.course_updated_success'));
            }
            fetchCourses();
        } catch (error: any) {
            toast.error(error.message || t('admin.failed_save_course'));
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {t('admin.courses_management')}
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 md:mt-2">
                        {t('admin.manage_courses_desc')}
                    </p>
                </div>
                <button
                    onClick={handleCreateCourse}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    {t('admin.add_course')}
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <input
                    type="text"
                    placeholder={t('admin.search_courses_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
            </div>

            {/* Courses View */}
            <div className="space-y-4">
                {/* Desktop Table View */}
                <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left rtl:text-right">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('admin.title')}</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('admin.instructor')}</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('admin.price')}</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('admin.enrollments')}</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('admin.rating')}</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('admin.status')}</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('admin.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredCourses.map((course) => (
                                    <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {course.title[i18n.language.startsWith('ar') ? 'ar' : 'en'] || course.title.en}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {course.instructor?.userId?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                            ${course.discountPrice || course.price}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {course.enrollmentCount || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {course.rating?.toFixed(1) || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${course.isPublished
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                {course.isPublished ? t('admin.published') : t('admin.pending')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => togglePublishStatus(course._id, course.isPublished)}
                                                    className={`p-2 rounded-lg transition-colors ${course.isPublished
                                                        ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                        : 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                                        }`}
                                                    title={course.isPublished ? t('admin.unpublish') : t('admin.publish')}
                                                >
                                                    {course.isPublished ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/courses/${course.slug}/content`)}
                                                    className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                                    title="View Content"
                                                >
                                                    <FolderOpen className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditCourse(course)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title={t('admin.edit')}
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(course._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title={t('admin.delete')}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card List View */}
                <div className="md:hidden space-y-4">
                    {filteredCourses.map((course) => (
                        <div key={course._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1 pr-4 min-w-0">
                                    <h3 className="font-bold text-gray-900 dark:text-white truncate">
                                        {course.title[i18n.language.startsWith('ar') ? 'ar' : 'en'] || course.title.en}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {course.instructor?.userId?.name || 'N/A'}
                                    </p>
                                </div>
                                <span className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${course.isPublished
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}>
                                    {course.isPublished ? t('admin.published') : t('admin.pending')}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 dark:border-gray-700">
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t('admin.price')}</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">${course.discountPrice || course.price}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t('admin.enrollments')}</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{course.enrollmentCount || 0}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t('admin.rating')}</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{course.rating?.toFixed(1) || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => togglePublishStatus(course._id, course.isPublished)}
                                        className={`p-2 rounded-lg ${course.isPublished ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}
                                    >
                                        {course.isPublished ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/courses/${course.slug}/content`)}
                                        className="p-2 bg-purple-50 text-purple-600 rounded-lg"
                                    >
                                        <FolderOpen className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditCourse(course)}
                                        className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-blue-600"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(course._id)}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredCourses.length === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchQuery ? t('admin.no_courses_search') : t('admin.no_courses')}
                        </p>
                    </div>
                )}
            </div>

            {/* Course Form Modal */}
            <CourseForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                course={selectedCourse}
                mode={modalMode}
            />

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={t('admin.delete_course')}
                message={t('admin.delete_course_confirm_desc')}
                confirmText={t('admin.delete')}
                variant="danger"
            />
        </div>
    );
};

export default AdminCourses;
