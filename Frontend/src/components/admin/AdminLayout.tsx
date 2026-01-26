import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    GraduationCap,
    MessageSquare,
    FileText,
    LogOut,
    Home,
    Globe,
    FolderTree
} from 'lucide-react';
import { toast } from 'sonner';

const AdminLayout = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
        toast.success(t('Logged out successfully'));
        navigate('/');
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en';
        i18n.changeLanguage(newLang);
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    };

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
        { path: '/admin/categories', icon: FolderTree, label: 'Categories' },
        { path: '/admin/instructors', icon: GraduationCap, label: 'Instructors' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/requests', icon: FileText, label: 'Requests' },
        { path: '/admin/messages', icon: MessageSquare, label: 'Messages' },
    ];

    const isActive = (path: string, exact = false) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('Admin Panel')}
                    </h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path, item.exact);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{t(item.label)}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        <span className="font-medium">{t('Back to Site')}</span>
                    </button>

                    <button
                        onClick={toggleLanguage}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Globe className="w-5 h-5" />
                        <span className="font-medium">{i18n.language === 'en' ? 'العربية' : 'English'}</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">{t('Logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
