import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAllCourses, changePublishStatus, deleteCourse, createCourse, updateCourse } from '../../services/adminApi';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, CheckCircle, XCircle, FolderOpen } from 'lucide-react';
import CourseForm from '../../components/admin/CourseForm';

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
            toast.error(t('Failed to load courses'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const togglePublishStatus = async (courseId: string, currentStatus: boolean) => {
        try {
            await changePublishStatus(courseId, { isPublished: !currentStatus });
            toast.success(t('Course status updated'));
            fetchCourses();
        } catch (error) {
            toast.error(t('Failed to update course'));
            console.error(error);
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm(t('Are you sure you want to delete this course?'))) return;

        try {
            await deleteCourse(courseId);
            toast.success(t('Course deleted'));
            fetchCourses();
        } catch (error) {
            toast.error(t('Failed to delete course'));
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
                toast.success(t('Course created successfully'));
            } else {
                await updateCourse(selectedCourse!._id, formData);
                toast.success(t('Course updated successfully'));
            }
            fetchCourses();
        } catch (error: any) {
            toast.error(error.message || t('Failed to save course'));
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {t('Courses Management')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {t('Manage all courses on the platform')}
                    </p>
                </div>
                <button
                    onClick={handleCreateCourse}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    {t('Add Course')}
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <input
                    type="text"
                    placeholder={t('Search courses by title...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
            </div>

            {/* Courses Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t('Title')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t('Instructor')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t('Price')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t('Enrollments')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t('Rating')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t('Status')}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t('Actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredCourses.map((course) => (
                                <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {course.title[i18n.language as 'en' | 'ar']}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {course.instructor?.userId?.name || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            ${course.discountPrice || course.price}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {course.enrollmentCount || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {course.rating?.toFixed(1) || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${course.isPublished
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                            }`}>
                                            {course.isPublished ? t('Published') : t('Pending')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => togglePublishStatus(course._id, course.isPublished)}
                                                className={`${course.isPublished
                                                    ? 'text-green-600 hover:text-green-900 dark:text-green-400'
                                                    : 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400'
                                                    }`}
                                                title={course.isPublished ? t('Unpublish') : t('Publish')}
                                            >
                                                {course.isPublished ? (
                                                    <CheckCircle className="w-5 h-5" />
                                                ) : (
                                                    <XCircle className="w-5 h-5" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => navigate(`/admin/courses/${course.slug}/content`)}
                                                className="text-purple-600 hover:text-purple-900 dark:text-purple-400"
                                                title="View Content"
                                            >
                                                <FolderOpen className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEditCourse(course)}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCourse(course._id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredCourses.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchQuery ? t('No courses found matching your search') : t('No courses found')}
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
        </div>
    );
};

export default AdminCourses;
