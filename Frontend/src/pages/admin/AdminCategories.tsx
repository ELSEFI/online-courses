import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const AdminCategories = () => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {t('Categories Management')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {t('Manage course categories')}
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <p className="text-gray-500 dark:text-gray-400">{t('Coming soon...')}</p>
            </div>
        </div>
    );
};

export default AdminCategories;
