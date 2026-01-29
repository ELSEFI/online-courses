import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    User,
    Users,
    Search,
    Plus,
    Trash2,
    MoreVertical,
    Loader2,
    Mail,
    Calendar,
    CheckCircle,
    XCircle,
    Shield,
    Ban,
    AlertTriangle,
    Filter,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { toast } from 'sonner';
import { getAllUsers, addUser, deleteUser, updateUserStatus } from '../../services/adminApi';

interface UserData {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    profileImageUrl?: string;
    role: string;
    status: boolean;
    createdAt: string;
}

const AdminUsers = () => {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;
    const isRtl = currentLang === 'ar';

    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const itemsPerPage = 8;

    // Add User Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    // Confirmation Modal State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<() => void>(() => { });
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmVariant, setConfirmVariant] = useState<'success' | 'danger'>('danger');

    useEffect(() => {
        fetchUsers();

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.closest('.dropdown-trigger') || target.closest('.dropdown-menu')) return;
            setActiveMenuId(null);
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers() as any;
            if (Array.isArray(data)) {
                setUsers(data);
            } else if (data && typeof data === 'object' && 'message' in data) {
                setUsers([]);
            } else {
                setUsers([]);
            }
        } catch (error: any) {
            console.error('Error fetching users:', error);
            if (!error.message?.includes('401')) {
                toast.error(t('admin.failed_to_fetch_users'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBanToggle = async (user: UserData) => {
        try {
            await updateUserStatus(user._id, { status: !user.status });
            toast.success(user.status ? t('admin.user_banned_success') : t('admin.user_activated_success'));
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || t('admin.failed_to_update_status'));
        }
    };

    const handleDeleteUser = async () => {
        if (selectedUser) {
            try {
                await deleteUser(selectedUser._id);
                toast.success(t('admin.user_deleted_success'));
                fetchUsers();
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
            } catch (error: any) {
                toast.error(error.message || t('admin.failed_to_delete_user'));
            }
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            await addUser(formData);
            toast.success(t('admin.user_added_success'));
            setIsAddModalOpen(false);
            resetForm();
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || t('admin.failed_to_add_user'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: ''
        });
    };

    const filteredUsers = users.filter((user: UserData) => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && user.status) || (statusFilter === 'banned' && !user.status);
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleToggleStatus = (id: string, currentStatus: boolean) => {
        // Kept for backward compatibility if used by other components, or remove if unused. 
        // Using handleBanToggle generally better as it takes full user object.
        const user = users.find(u => u._id === id);
        if (user) handleBanToggle(user);
    };

    const handleDelete = (id: string) => {
        const user = users.find(u => u._id === id);
        if (user) {
            setSelectedUser(user);
            setIsDeleteModalOpen(true);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.users')}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">{t('admin.manage_users_desc')}</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-md active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    <span>{t('admin.add_new_user')}</span>
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400`} />
                    <input
                        type="text"
                        placeholder={t('admin.search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500`}
                    />
                </div>
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="all">{t('admin.all_status')}</option>
                        <option value="active">{t('admin.active')}</option>
                        <option value="banned">{t('admin.banned')}</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">{t('admin.no_users_found')}</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        {t('admin.name')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        {t('admin.status')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        {t('admin.joined_date')}
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        {t('admin.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedUsers.length > 0 ? (
                                    paginatedUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                        {user.profileImageUrl || user.profileImage ? (
                                                            <img src={user.profileImageUrl || user.profileImage} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <User className="h-5 w-5 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${user.status
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    }`}>
                                                    {user.status ? t('admin.active') : t('admin.banned')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(user.createdAt).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleBanToggle(user)}
                                                        className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 
                                                            ${user.status ? 'text-orange-600' : 'text-green-600'}`}
                                                        title={user.status ? t('admin.ban_user') : t('admin.activate_user')}
                                                    >
                                                        {user.status ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                        title={t('admin.delete_user')}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <User className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                                            <p>{t('admin.no_users')}</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Responsive Grid/Cards View (Mobile & Tablet) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
                        {paginatedUsers.map((user) => (
                            <div key={user._id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2">
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setActiveMenuId(activeMenuId === user._id ? null : user._id);
                                            }}
                                            className="dropdown-trigger p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm"
                                        >
                                            <MoreVertical className="h-4 w-4 pointer-events-none" />
                                        </button>

                                        {activeMenuId === user._id && (
                                            <div
                                                className={`dropdown-menu absolute ${isRtl ? 'left-0' : 'right-0'} mt-1 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-[100] animate-in fade-in zoom-in duration-150 origin-top-right`}
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleBanToggle(user);
                                                        setActiveMenuId(null);
                                                    }}
                                                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold transition-colors ${user.status ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                                >
                                                    {user.status ? <Ban className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                                                    {user.status ? t('admin.ban_user') : t('admin.active')}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedUser(user);
                                                        setIsDeleteModalOpen(true);
                                                        setActiveMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    {t('admin.delete_user')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-600 shadow-md">
                                        {user.profileImageUrl || user.profileImage ? (
                                            <img src={user.profileImageUrl || user.profileImage} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-7 w-7 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{user.name}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-3 border-y border-gray-100 dark:border-gray-700 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(user.createdAt).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US')}
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${user.status
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                                        }`}>
                                        {user.status ? t('admin.active') : t('admin.banned')}
                                    </span>
                                </div>

                                <button
                                    onClick={() => window.open(`/profile/${user._id}`, '_blank')}
                                    className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold py-2 rounded-xl text-xs hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-2"
                                >
                                    <User className="h-4 w-4" />
                                    {t('admin.view_profile')}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6 gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md flex flex-col rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-none bg-white dark:bg-gray-800">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.add_new_user')}</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('admin.create_regular_user_account')}</p>
                            </div>
                            <button
                                onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all transform active:scale-95"
                            >
                                <XCircle className="h-7 w-7" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 md:p-8 space-y-6">
                            <form id="add-user-form" onSubmit={handleAddUser} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 px-1 uppercase tracking-wider">{t('admin.name')}</label>
                                    <div className="relative">
                                        <User className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400`} />
                                        <input
                                            required
                                            type="text"
                                            placeholder={t('admin.enter_user_name')}
                                            className={`w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 py-3 ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 px-1 uppercase tracking-wider">{t('admin.email')}</label>
                                    <div className="relative">
                                        <Mail className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400`} />
                                        <input
                                            required
                                            type="email"
                                            placeholder={t('admin.enter_email_address')}
                                            className={`w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 py-3 ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 px-1 uppercase tracking-wider">{t('admin.password')}</label>
                                    <div className="relative">
                                        <Shield className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400`} />
                                        <input
                                            required
                                            type="password"
                                            placeholder={t('admin.set_temporary_password')}
                                            className={`w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 py-3 ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95"
                            >
                                {t('admin.cancel')}
                            </button>
                            <button
                                form="add-user-form"
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-blue-500/20 active:scale-95"
                            >
                                {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
                                {t('admin.add_user')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteUser}
                title={t('admin.delete_user')}
                message={t('admin.delete_confirm_desc')}
                confirmText={t('admin.confirm')}
                cancelText={t('admin.cancel')}
                variant="danger"
            />
        </div>
    );
};

export default AdminUsers;
