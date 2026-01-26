import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SectionData } from '../../services/courseContentApi';

interface SectionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SectionData) => void;
    mode: 'create' | 'edit';
    initialData?: SectionData & { _id?: string };
    isLoading?: boolean;
}

export default function SectionForm({
    isOpen,
    onClose,
    onSubmit,
    mode,
    initialData,
    isLoading = false,
}: SectionFormProps) {
    const [formData, setFormData] = useState<SectionData>({
        titleEn: '',
        titleAr: '',
        descriptionEn: '',
        descriptionAr: '',
        order: 0,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                titleEn: initialData.titleEn,
                titleAr: initialData.titleAr,
                descriptionEn: initialData.descriptionEn,
                descriptionAr: initialData.descriptionAr,
                order: initialData.order || 0,
            });
        } else {
            setFormData({
                titleEn: '',
                titleAr: '',
                descriptionEn: '',
                descriptionAr: '',
                order: 0,
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mode === 'create' ? 'Add New Section' : 'Edit Section'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Title (English) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.titleEn}
                                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Title (Arabic) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.titleAr}
                                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-right"
                                required
                                dir="rtl"
                            />
                        </div>
                    </div>

                    {/* Description Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description (English) <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.descriptionEn}
                                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description (Arabic) <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.descriptionAr}
                                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none text-right"
                                required
                                dir="rtl"
                            />
                        </div>
                    </div>

                    {/* Order Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Order
                        </label>
                        <input
                            type="number"
                            value={formData.order}
                            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                            className="w-full md:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            min="0"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Sections will be displayed in ascending order
                        </p>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : mode === 'create' ? 'Create Section' : 'Update Section'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
