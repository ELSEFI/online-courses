import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface CategoryFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => Promise<void>;
    initialData?: any;
    parentId?: string | null;
    mode: 'create' | 'edit';
}

const CategoryForm: React.FC<CategoryFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    parentId,
    mode
}) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    // Form States
    const [nameEn, setNameEn] = useState('');
    const [nameAr, setNameAr] = useState('');
    const [descEn, setDescEn] = useState('');
    const [descAr, setDescAr] = useState('');
    const [order, setOrder] = useState(0);
    const [image, setImage] = useState<File | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && initialData) {
                setNameEn(initialData.name?.en || '');
                setNameAr(initialData.name?.ar || '');
                setDescEn(initialData.description?.en || '');
                setDescAr(initialData.description?.ar || '');
                setOrder(initialData.order || 0);
                setPreview(initialData.imageUrl || null);
            } else {
                // Reset for create mode
                setNameEn('');
                setNameAr('');
                setDescEn('');
                setDescAr('');
                setOrder(0);
                setPreview(null);
                setImage(null);
            }
        }
    }, [isOpen, mode, initialData]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error(t('admin.image_size_error'));
                e.target.value = ''; // Reset input
                return;
            }
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append('nameEn', nameEn);
        formData.append('nameAr', nameAr);
        formData.append('descriptionEn', descEn);
        formData.append('descriptionAr', descAr);
        formData.append('order', order.toString());

        if (image) {
            formData.append('image', image);
        }

        if (mode === 'create' && parentId) {
            formData.append('parentsCategory', parentId);
        }
        // For edit, parent handling might differ or be omitted if not moving categories
        if (mode === 'edit' && initialData?.parent) {
            formData.append('parentCategory', initialData.parent);
        }

        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {mode === 'create' ? t('admin.add_new_category') : t('admin.edit_category')}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image Upload */}
                    <div className="flex justify-center">
                        <div className="relative group cursor-pointer">
                            <div className={`w-32 h-32 rounded-2xl overflow-hidden border-2 border-dashed ${preview ? 'border-transparent' : 'border-gray-300 dark:border-gray-600'} flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors group-hover:bg-gray-100 dark:group-hover:bg-gray-800 relative`}>
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center p-4">
                                        <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                        <span className="text-xs text-gray-500">{t('admin.upload_icon')}</span>
                                    </div>
                                )}
                                {preview && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <Upload className="w-6 h-6 text-white" />
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* English Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('admin.category_name_en')}</label>
                            <input
                                type="text"
                                required
                                value={nameEn}
                                onChange={(e) => setNameEn(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="e.g. Development"
                            />
                        </div>

                        {/* Arabic Name */}
                        <div className="space-y-2" dir="rtl">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('admin.category_name_ar')}</label>
                            <input
                                type="text"
                                required
                                value={nameAr}
                                onChange={(e) => setNameAr(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="مثال: البرمجة"
                            />
                        </div>

                        {/* English Description */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('admin.category_desc_en')}</label>
                            <textarea
                                required
                                value={descEn}
                                onChange={(e) => setDescEn(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                placeholder="Brief description..."
                            />
                        </div>

                        {/* Arabic Description */}
                        <div className="space-y-2 md:col-span-2" dir="rtl">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('admin.category_desc_ar')}</label>
                            <textarea
                                required
                                value={descAr}
                                onChange={(e) => setDescAr(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                placeholder="وصف مختصر..."
                            />
                        </div>

                        {/* Order */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('admin.order')}</label>
                            <input
                                type="number"
                                value={order}
                                onChange={(e) => setOrder(parseInt(e.target.value))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {t('admin.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {mode === 'create' ? t('admin.create_category') : t('admin.save_changes')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryForm;
