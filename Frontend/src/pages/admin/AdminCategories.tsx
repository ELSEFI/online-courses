import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    getAllCategories,
    addCategory,
    updateCategory,
    disableCategory,
    restoreCategory,
    getUnActiveCategories
} from '../../services/adminApi';
import { toast } from 'sonner';
import { Plus, Loader2, RefreshCcw, Eye, EyeOff } from 'lucide-react';
import CategoryItem from '../../components/admin/CategoryItem';
import CategoryForm from '../../components/admin/CategoryForm';
import ConfirmModal from '../../components/admin/ConfirmModal';

interface Category {
    _id: string;
    name: { en: string; ar: string };
    description: { en: string; ar: string };
    imageUrl?: string;
    isActive: boolean;
    order: number;
    subcategories?: Category[];
    coursesCount: number;
    totalCourses?: number;
    parent?: string;
}

const AdminCategories = () => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
    const [targetParentId, setTargetParentId] = useState<string | null>(null);

    const [showDisabled, setShowDisabled] = useState(false);

    // Delete Confirmation State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, [showDisabled]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response: any = showDisabled
                ? await getUnActiveCategories()
                : await getAllCategories();

            if (response.data) {
                setCategories(response.data);
            } else if (Array.isArray(response)) {
                setCategories(response);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            toast.error(t('admin.failed_load_categories'));
        } finally {
            setLoading(false);
        }
    };

    const handleAddRoot = () => {
        setModalMode('create');
        setSelectedCategory(undefined);
        setTargetParentId(null);
        setIsModalOpen(true);
    };

    const handleAddSub = (parentId: string) => {
        setModalMode('create');
        setSelectedCategory(undefined);
        setTargetParentId(parentId);
        setIsModalOpen(true);
    };

    const handleEdit = (category: Category) => {
        setModalMode('edit');
        setSelectedCategory(category);
        setTargetParentId(null);
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            if (currentStatus) {
                await disableCategory(id);
                toast.success(t('admin.category_disabled_success'));
            } else {
                await restoreCategory(id);
                toast.success(t('admin.category_restored_success'));
            }
            fetchCategories();
        } catch (error) {
            toast.error(t('admin.failed_update_status'));
        }
    };

    const handleDelete = (id: string) => {
        setCategoryToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;

        // This actually disables the category based on current logic, but function name is toggleStatus
        // We assume the delete action is "disable"
        await handleToggleStatus(categoryToDelete, true);
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
    };

    const handleFormSubmit = async (formData: FormData) => {
        try {
            if (modalMode === 'create') {
                await addCategory(formData);
                toast.success(t('admin.category_created_success'));
            } else {
                if (selectedCategory) {
                    await updateCategory(selectedCategory._id, formData);
                    toast.success(t('admin.category_updated_success'));
                }
            }
            fetchCategories();
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    if (loading && categories.length === 0) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-gray-900 dark:text-white">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">{t('admin.categories_management')}</h1>
                    <p className="text-sm md:text-base text-gray-500 mt-1 md:mt-2">{t('admin.manage_categories_desc')}</p>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setShowDisabled(!showDisabled)}
                        className={`flex-1 md:flex-none p-2 rounded-lg transition-colors flex justify-center items-center ${showDisabled
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
                            }`}
                        title={showDisabled ? t('admin.show_active') : t('admin.show_disabled')}
                    >
                        {showDisabled ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={fetchCategories}
                        className="flex-1 md:flex-none p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 flex justify-center items-center"
                        title={t('admin.refresh')}
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleAddRoot}
                        className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        {t('admin.add_root_category')}
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {categories.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500">{t('admin.no_categories')}</p>
                        <button onClick={handleAddRoot} className="text-blue-600 hover:underline mt-2">
                            {t('admin.create_first_category')}
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {categories.map((category) => (
                            <CategoryItem
                                key={category._id}
                                category={category}
                                onAddSub={handleAddSub}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onToggleStatus={handleToggleStatus}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CategoryForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                mode={modalMode}
                initialData={selectedCategory}
                parentId={targetParentId}
            />

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={t('admin.disable_category')}
                message={t('admin.disable_category_confirm')}
                confirmText={t('admin.confirm')}
                variant="danger"
            />
        </div>
    );
};

export default AdminCategories;
