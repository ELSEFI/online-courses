import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getStats } from '../../services/adminApi';
import { toast } from 'sonner';
import {
    Users,
    GraduationCap,
    BookOpen,
    MessageSquare,
    FileText,
    TrendingUp,
    CheckCircle,
    Clock
} from 'lucide-react';

interface Stats {
    users: {
        totalUsers: number;
        usersCount: number;
        instructorsCount: number;
    };
    courses: {
        totalCourses: number;
        publishedCourses: number;
        pendingCourses: number;
    };
    enrollments: {
        totalEnrollments: number;
    };
    messages: {
        totalMessages: number;
    };
    instructorRequests: {
        totalRequests: number;
        pendingRequests: number;
    };
}

const AdminDashboard = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await getStats();
            setStats(data as Stats);
        } catch (error) {
            toast.error(t('Failed to load statistics'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">{t('No data available')}</p>
            </div>
        );
    }

    const statCards = [
        {
            title: t('Total Users'),
            value: stats.users?.totalUsers || 0,
            icon: Users,
            color: 'bg-blue-500',
            subStats: [
                { label: t('Students'), value: stats.users?.usersCount || 0 },
                { label: t('Instructors'), value: stats.users?.instructorsCount || 0 }
            ]
        },
        {
            title: t('Courses'),
            value: stats.courses?.totalCourses || 0,
            icon: BookOpen,
            color: 'bg-green-500',
            subStats: [
                { label: t('Published'), value: stats.courses?.publishedCourses || 0 },
                { label: t('Pending'), value: stats.courses?.pendingCourses || 0 }
            ]
        },
        {
            title: t('Enrollments'),
            value: stats.enrollments?.totalEnrollments || 0,
            icon: TrendingUp,
            color: 'bg-purple-500'
        },
        {
            title: t('Messages'),
            value: stats.messages?.totalMessages || 0,
            icon: MessageSquare,
            color: 'bg-yellow-500'
        },
        {
            title: t('Instructor Requests'),
            value: stats.instructorRequests?.totalRequests || 0,
            icon: FileText,
            color: 'bg-red-500',
            subStats: [
                { label: t('Pending'), value: stats.instructorRequests?.pendingRequests || 0 }
            ]
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {t('Dashboard')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {t('Overview of your platform statistics')}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${card.color} p-3 rounded-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {card.value}
                                    </p>
                                </div>
                            </div>

                            {card.subStats && (
                                <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    {card.subStats.map((sub, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">{sub.label}</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {sub.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {t('Quick Actions')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/admin/courses"
                        className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                    >
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900 dark:text-white">{t('Manage Courses')}</span>
                    </a>
                    <a
                        href="/admin/requests"
                        className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                    >
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900 dark:text-white">{t('Review Requests')}</span>
                    </a>
                    <a
                        href="/admin/messages"
                        className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                    >
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900 dark:text-white">{t('View Messages')}</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
