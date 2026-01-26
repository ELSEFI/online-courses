import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { getAllCategories, getAllInstructors } from '../../services/adminApi';

interface CourseFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => Promise<void>;
    course?: any;
    mode: 'create' | 'edit';
}

const CourseForm = ({ isOpen, onClose, onSubmit, course, mode }: CourseFormProps) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [instructors, setInstructors] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        titleEn: '',
        titleAr: '',
        shortDescEn: '',
        shortDescAr: '',
        descEn: '',
        descAr: '',
        requirementsEn: '',
        requirementsAr: '',
        price: '',
        discountPrice: '',
        instructorId: '',
        category: '',
        levelEn: '',
        levelAr: '',
        thumbnail: null as File | null,
    });

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            fetchInstructors();
            if (course && mode === 'edit') {
                setFormData({
                    titleEn: course.title?.en || '',
                    titleAr: course.title?.ar || '',
                    shortDescEn: course.shortDescription?.en || '',
                    shortDescAr: course.shortDescription?.ar || '',
                    descEn: course.description?.en || '',
                    descAr: course.description?.ar || '',
                    requirementsEn: course.requirements?.en?.[0] || '',
                    requirementsAr: course.requirements?.ar?.[0] || '',
                    price: course.price?.toString() || '',
                    discountPrice: course.discountPrice?.toString() || '',
                    instructorId: course.instructor?._id || '',
                    category: course.category?._id || '',
                    levelEn: course.level?.en || '',
                    levelAr: course.level?.ar || '',
                    thumbnail: null,
                });
            } else {
                // Reset form for create mode
                setFormData({
                    titleEn: '',
                    titleAr: '',
                    shortDescEn: '',
                    shortDescAr: '',
                    descEn: '',
                    descAr: '',
                    requirementsEn: '',
                    requirementsAr: '',
                    price: '',
                    discountPrice: '',
                    instructorId: '',
                    category: '',
                    levelEn: '',
                    levelAr: '',
                    thumbnail: null,
                });
            }
        }
    }, [isOpen, course, mode]);

    const fetchCategories = async () => {
        try {
            const response: any = await getAllCategories();
            console.log('Categories Response:', response);
            // Backend returns { data: [...] }
            const categoriesData = response.data || [];
            const sorted = categoriesData.sort((a: any, b: any) => {
                const nameA = a.name?.en || a.name || '';
                const nameB = b.name?.en || b.name || '';
                return nameA.localeCompare(nameB);
            });
            setCategories(sorted);
        } catch (error) {
            console.error('Categories Error:', error);
            toast.error(t('Failed to load categories'));
        }
    };

    const fetchInstructors = async () => {
        try {
            const response: any = await getAllInstructors();
            console.log('Instructors Response:', response);
            // Backend returns direct array [...]
            const instructorsData = Array.isArray(response) ? response : [];
            const sorted = instructorsData.sort((a: any, b: any) => {
                const nameA = a.userId?.name || '';
                const nameB = b.userId?.name || '';
                return nameA.localeCompare(nameB);
            });
            setInstructors(sorted);
        } catch (error) {
            console.error('Instructors Error:', error);
            toast.error(t('Failed to load instructors'));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, thumbnail: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('titleEn', formData.titleEn);
            data.append('titleAr', formData.titleAr);
            data.append('shortDescEn', formData.shortDescEn);
            data.append('shortDescAr', formData.shortDescAr);
            data.append('descEn', formData.descEn);
            data.append('descAr', formData.descAr);
            data.append('requirementsEn', formData.requirementsEn);
            data.append('requirementsAr', formData.requirementsAr);
            data.append('price', formData.price);
            if (formData.discountPrice) data.append('discountPrice', formData.discountPrice);
            data.append('instructorId', formData.instructorId);
            data.append('category', formData.category);
            data.append('levelEn', formData.levelEn);
            data.append('levelAr', formData.levelAr);
            if (formData.thumbnail) data.append('courseThumbnail', formData.thumbnail);

            await onSubmit(data);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mode === 'create' ? t('Add New Course') : t('Edit Course')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Title (English)')} *
                            </label>
                            <input
                                type="text"
                                name="titleEn"
                                value={formData.titleEn}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Title (Arabic)')} *
                            </label>
                            <input
                                type="text"
                                name="titleAr"
                                value={formData.titleAr}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Short Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Short Description (English)')}
                            </label>
                            <textarea
                                name="shortDescEn"
                                value={formData.shortDescEn}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Short Description (Arabic)')}
                            </label>
                            <textarea
                                name="shortDescAr"
                                value={formData.shortDescAr}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Description (English)')} *
                            </label>
                            <textarea
                                name="descEn"
                                value={formData.descEn}
                                onChange={handleChange}
                                required
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Description (Arabic)')} *
                            </label>
                            <textarea
                                name="descAr"
                                value={formData.descAr}
                                onChange={handleChange}
                                required
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Requirements (English)')}
                            </label>
                            <textarea
                                name="requirementsEn"
                                value={formData.requirementsEn}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Requirements (Arabic)')}
                            </label>
                            <textarea
                                name="requirementsAr"
                                value={formData.requirementsAr}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Price & Discount */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Price')} *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Discount Price')}
                            </label>
                            <input
                                type="number"
                                name="discountPrice"
                                value={formData.discountPrice}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Category & Level */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Category')} *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">{t('Select Category')}</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name?.en || cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Instructor')} *
                            </label>
                            <select
                                name="instructorId"
                                value={formData.instructorId}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">{t('Select Instructor')}</option>
                                {instructors.map((instructor) => (
                                    <option key={instructor._id} value={instructor._id}>
                                        {instructor.userId?.name || 'Unknown'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Level */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Level (English)')} *
                            </label>
                            <select
                                name="levelEn"
                                value={formData.levelEn}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">{t('Select Level')}</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="All Levels">All Levels</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Level (Arabic)')} *
                            </label>
                            <select
                                name="levelAr"
                                value={formData.levelAr}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">{t('Select Level')}</option>
                                <option value="مبتدئ">مبتدئ</option>
                                <option value="متوسط">متوسط</option>
                                <option value="متقدم">متقدم</option>
                                <option value="جميع المستويات">جميع المستويات</option>
                            </select>
                        </div>
                    </div>

                    {/* Thumbnail */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('Course Thumbnail')} {mode === 'create' && '*'}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            required={mode === 'create'}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            {t('Cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? t('Saving...') : mode === 'create' ? t('Create Course') : t('Update Course')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseForm;
