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
    FolderTree,
    Menu,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

const AdminLayout = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        dispatch(logout());
        toast.success(t('nav.logout_success'));
        navigate('/');
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en';
        i18n.changeLanguage(newLang);
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    };

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'admin.dashboard', exact: true },
        { path: '/admin/courses', icon: BookOpen, label: 'admin.courses' },
        { path: '/admin/categories', icon: FolderTree, label: 'admin.categories' },
        { path: '/admin/instructors', icon: GraduationCap, label: 'admin.instructors' },
        { path: '/admin/users', icon: Users, label: 'admin.users' },
        { path: '/admin/requests', icon: FileText, label: 'admin.requests' },
        { path: '/admin/messages', icon: MessageSquare, label: 'admin.messages' },
    ];

    const isActive = (path: string, exact = false) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 z-40">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('admin.admin_panel')}
                </h1>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            {/* Sidebar Overlay (Mobile) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 z-50 w-72 bg-white dark:bg-gray-800 
                    flex flex-col transform transition-transform duration-300 ease-in-out
                    md:relative md:translate-x-0 md:flex w-64
                    ${i18n.language.startsWith('ar')
                        ? `right-0 border-l border-gray-200 dark:border-gray-700 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`
                        : `left-0 border-r border-gray-200 dark:border-gray-700 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
                    }
                `}
            >
                {/* Logo & Close (Mobile) */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('admin.admin_panel')}
                    </h1>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path, item.exact);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{t(item.label)}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2 mb-safe">
                    <button
                        onClick={() => window.open('/', '_blank')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        <span className="font-medium">{t('admin.back_to_site')}</span>
                    </button>

                    <button
                        onClick={toggleLanguage}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Globe className="w-5 h-5" />
                        <span className="font-medium">{i18n.language === 'en' ? 'العربية' : 'English'}</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">{t('admin.logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
