import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ChevronRight,
    ChevronDown,
    Plus,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    Folder
} from 'lucide-react';

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
}

interface CategoryItemProps {
    category: Category;
    level?: number;
    onAddSub: (parentId: string) => void;
    onEdit: (category: Category) => void;
    onDelete: (id: string, name: string) => void;
    onToggleStatus: (id: string, isActive: boolean) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
    category,
    level = 0,
    onAddSub,
    onEdit,
    onDelete,
    onToggleStatus
}) => {
    const { t, i18n } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);

    const hasChildren = category.subcategories && category.subcategories.length > 0;

    const currentName = category.name[i18n.language.startsWith('ar') ? 'ar' : 'en'] || category.name.en;

    // Use totalCourses virtual if available, fallback to stored count
    const count = category.totalCourses ?? category.coursesCount;

    return (
        <div className="select-none">
            <div
                className={`
                    relative flex items-center justify-between p-3 
                    hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                    border-b border-gray-100 dark:border-gray-800
                    ${!category.isActive ? 'opacity-60 bg-gray-50/50 dark:bg-gray-900/50' : ''}
                `}
            >
                <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
                    {/* Expand Toggle */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`
                            p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0
                            ${!hasChildren ? 'invisible' : ''}
                        `}
                    >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700">
                        {category.imageUrl ? (
                            <img src={category.imageUrl} alt={currentName} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <Folder className="w-5 h-5 text-gray-400" />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col min-w-0">
                        <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2 truncate">
                            {currentName}
                            {!category.isActive && (
                                <span className="px-2 py-0.5 text-[10px] bg-red-100 text-red-600 rounded-full font-bold uppercase shrink-0">
                                    {t('admin.disabled')}
                                </span>
                            )}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                            {count} {t('admin.courses')} • #{category.order}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onAddSub(category._id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title={t('admin.add_subcategory')}
                    >
                        <Plus className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => onEdit(category)}
                        className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                        title={t('admin.edit')}
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => onToggleStatus(category._id, category.isActive)}
                        className={`p-2 rounded-lg transition-colors ${category.isActive
                            ? 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-red-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                        title={category.isActive ? t('admin.disable') : t('admin.enable')}
                    >
                        {category.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    <button
                        onClick={() => onDelete(category._id, currentName)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title={t('admin.delete')}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Recursion - Responsive Indentation */}
            {hasChildren && isExpanded && (
                <div className="border-l border-gray-100 dark:border-gray-800 ml-2 md:ml-4 lg:ml-8">
                    {category.subcategories!.map((sub) => (
                        <CategoryItem
                            key={sub._id}
                            category={sub}
                            level={level + 1}
                            onAddSub={onAddSub}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onToggleStatus={onToggleStatus}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryItem;
