import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Search,
    Filter,
    Plus,
    Star,
    Users,
    BookOpen,
    Trash2,
    MoreVertical,
    Loader2,
    Briefcase,
    Calendar,
    FileText,
    Upload,
    XCircle,
    Check,
    AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { getAllInstructors, removeInstructor, addInstructor } from '../../services/adminApi';

interface Instructor {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        profileImage?: string;
        profileImageUrl?: string;
    };
    bio: {
        en: string;
        ar: string;
    };
    jobTitle: {
        en: string;
        ar: string;
    };
    experienceYears: number;
    rating: number;
    totalStudents: number;
    totalCourses: number;
    createdAt: string;
    cvURL?: string;
}

const AdminInstructors = () => {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;
    const isRtl = currentLang === 'ar';

    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);

    // Add Instructor Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        bioEn: '',
        bioAr: '',
        jobTitleEn: '',
        jobTitleAr: '',
        experienceYears: ''
    });

    // Confirmation Modal State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<() => void>(() => { });
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmVariant, setConfirmVariant] = useState<'success' | 'danger'>('danger');

    useEffect(() => {
        fetchInstructors();

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.closest('.dropdown-trigger') || target.closest('.dropdown-menu')) return;
            setActiveMenuId(null);
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchInstructors = async () => {
        try {
            setLoading(true);
            const data = await getAllInstructors() as any;
            if (Array.isArray(data)) {
                setInstructors(data);
            } else if (data && typeof data === 'object' && 'message' in data) {
                setInstructors([]);
            } else {
                setInstructors([]);
            }
        } catch (error: any) {
            console.error('Error fetching instructors:', error);
            if (!error.message?.includes('401')) {
                toast.error(t('admin.failed_fetch_instructors'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = (id: string) => {
        setConfirmTitle(t('admin.remove_instructor'));
        setConfirmMessage(t('admin.remove_instructor_desc'));
        setConfirmVariant('danger');
        setConfirmAction(() => async () => {
            try {
                await removeInstructor(id);
                toast.success(t('admin.instructor_removed_success'));
                fetchInstructors();
            } catch (error: any) {
                toast.error(error.message || t('admin.failed_remove_instructor'));
            }
        });
        setIsConfirmModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCvFile(e.target.files[0]);
        }
    };

    const handleAddInstructor = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cvFile) {
            toast.error(t('admin.please_upload_cv'));
            return;
        }

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });
        data.append('cvFile', cvFile);

        try {
            setIsSubmitting(true);
            await addInstructor(data);
            toast.success(t('admin.instructor_added_success'));
            setIsAddModalOpen(false);
            resetForm();
            fetchInstructors();
        } catch (error: any) {
            toast.error(error.message || t('admin.failed_add_instructor'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            bioEn: '',
            bioAr: '',
            jobTitleEn: '',
            jobTitleAr: '',
            experienceYears: ''
        });
        setCvFile(null);
    };

    const filteredInstructors = instructors.filter(inst =>
        inst.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.userId.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {t('admin.instructors_management')}
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
                        {t('admin.manage_instructors_subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-md active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    <span>{t('admin.add_instructor')}</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400`} />
                <input
                    type="text"
                    placeholder={t('admin.search_instructors_placeholder')}
                    className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : filteredInstructors.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">{t('admin.no_instructors_found')}</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-left rtl:text-right">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 text-xs font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">{t('admin.instructor')}</th>
                                    <th className="px-6 py-4">{t('admin.stats')}</th>
                                    <th className="px-6 py-4">{t('admin.specialization')}</th>
                                    <th className="px-6 py-4">{t('admin.joined_date')}</th>
                                    <th className="px-6 py-4 text-center">{t('admin.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredInstructors.map((inst) => (
                                    <tr key={inst._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm">
                                                    {inst.userId.profileImageUrl || inst.userId.profileImage ? (
                                                        <img src={inst.userId.profileImageUrl || inst.userId.profileImage} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <User className="h-5 w-5 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{inst.userId.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{inst.userId.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-4 text-xs">
                                                    <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500 font-medium">
                                                        <Star className="h-3 w-3 fill-current" />
                                                        {inst.rating.toFixed(1)}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                                                        <Users className="h-3 w-3" />
                                                        {inst.totalStudents} {t('admin.students')}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                                                        <BookOpen className="h-3 w-3" />
                                                        {inst.totalCourses} {t('admin.courses')}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                {currentLang === 'ar' ? inst.jobTitle.ar : inst.jobTitle.en}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {inst.experienceYears} {t('admin.years_xp_short')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(inst.createdAt).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center">
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setActiveMenuId(activeMenuId === inst._id ? null : inst._id);
                                                        }}
                                                        className={`dropdown-trigger p-2 rounded-xl transition-all duration-200 ${activeMenuId === inst._id
                                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                            : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                                            }`}
                                                    >
                                                        <MoreVertical className="h-5 w-5 pointer-events-none" />
                                                    </button>

                                                    {activeMenuId === inst._id && (
                                                        <div
                                                            className={`dropdown-menu absolute ${isRtl ? 'left-0' : 'right-0'} mt-3 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-[100] animate-in fade-in zoom-in-95 duration-150 origin-top-right`}
                                                        >
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.open(`/profile/${inst.userId._id}?instructorId=${inst._id}`, '_blank');
                                                                    setActiveMenuId(null);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                            >
                                                                <User className="h-4 w-4 text-blue-500" />
                                                                {t('admin.view_profile')}
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (inst.cvURL) {
                                                                        window.open(inst.cvURL, '_blank');
                                                                        setActiveMenuId(null);
                                                                    }
                                                                }}
                                                                disabled={!inst.cvURL}
                                                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors ${inst.cvURL
                                                                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                                    : 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-70'
                                                                    }`}
                                                            >
                                                                <FileText className={`h-4 w-4 ${inst.cvURL ? 'text-green-500' : 'text-gray-400 dark:text-gray-600'}`} />
                                                                {t('admin.view_cv')}
                                                            </button>
                                                            <div className="h-px bg-gray-100 dark:bg-gray-700 mx-3 my-1" />
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemove(inst._id);
                                                                    setActiveMenuId(null);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                {t('admin.remove_instructor')}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Responsive Grid/Cards View (Mobile & Tablet) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
                        {filteredInstructors.map((inst) => (
                            <div key={inst._id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2">
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setActiveMenuId(activeMenuId === inst._id ? null : inst._id);
                                            }}
                                            className="dropdown-trigger p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm"
                                        >
                                            <MoreVertical className="h-4 w-4 pointer-events-none" />
                                        </button>

                                        {activeMenuId === inst._id && (
                                            <div
                                                className={`dropdown-menu absolute ${isRtl ? 'left-0' : 'right-0'} mt-1 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-[100] animate-in fade-in zoom-in duration-150 origin-top-right`}
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (inst.cvURL) {
                                                            window.open(inst.cvURL, '_blank');
                                                            setActiveMenuId(null);
                                                        }
                                                    }}
                                                    disabled={!inst.cvURL}
                                                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold transition-colors ${inst.cvURL
                                                        ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                        : 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-70'
                                                        }`}
                                                >
                                                    <FileText className={`h-4 w-4 ${inst.cvURL ? 'text-green-500' : 'text-gray-400 dark:text-gray-600'}`} />
                                                    {t('admin.view_cv')}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemove(inst._id);
                                                        setActiveMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    {t('admin.remove_instructor')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-600 shadow-md">
                                        {inst.userId.profileImageUrl || inst.userId.profileImage ? (
                                            <img src={inst.userId.profileImageUrl || inst.userId.profileImage} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-7 w-7 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{inst.userId.name}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{inst.userId.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 dark:border-gray-700 mb-4 text-center">
                                    <div>
                                        <div className="flex items-center justify-center gap-1 text-yellow-600 dark:text-yellow-500 font-bold text-sm">
                                            <Star className="h-3 w-3 fill-current" />
                                            {inst.rating.toFixed(1)}
                                        </div>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">{t('admin.rating')}</p>
                                    </div>
                                    <div className="border-x border-gray-100 dark:border-gray-700">
                                        <div className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                                            {inst.totalStudents}
                                        </div>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">{t('admin.students')}</p>
                                    </div>
                                    <div>
                                        <div className="text-purple-600 dark:text-purple-400 font-bold text-sm">
                                            {inst.totalCourses}
                                        </div>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">{t('admin.courses')}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                        <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="font-medium">{currentLang === 'ar' ? inst.jobTitle.ar : inst.jobTitle.en}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                        <span>{inst.experienceYears} {t('admin.years_of_experience')}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => window.open(`/profile/${inst.userId._id}?instructorId=${inst._id}`, '_blank')}
                                    className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold py-2 rounded-xl text-xs hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FileText className="h-4 w-4" />
                                    {t('admin.view_detailed_profile')}
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Add Instructor Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] flex flex-col md:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-none bg-white dark:bg-gray-800">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.add_instructor')}</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('admin.create_instructor_manual')}</p>
                            </div>
                            <button
                                onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all transform active:scale-95"
                            >
                                <XCircle className="h-7 w-7" />
                            </button>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <form id="add-instructor-form" onSubmit={handleAddInstructor} className="p-6 md:p-8 space-y-8">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 px-1 uppercase tracking-wider">{t('admin.name')}</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder={t('admin.enter_name')}
                                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 px-1 uppercase tracking-wider">{t('admin.email')}</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder={t('admin.enter_email')}
                                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 px-1 uppercase tracking-wider">{t('admin.password')}</label>
                                        <input
                                            required
                                            type="password"
                                            placeholder={t('admin.set_password')}
                                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 px-1 uppercase tracking-wider">{t('admin.experience_years')}</label>
                                        <input
                                            required
                                            type="number"
                                            placeholder={t('admin.eg_5')}
                                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            value={formData.experienceYears}
                                            onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Job Title */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 px-1 uppercase tracking-wider">{t('admin.job_title')} (English)</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g., Senior Full Stack Developer"
                                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            value={formData.jobTitleEn}
                                            onChange={(e) => setFormData({ ...formData, jobTitleEn: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 px-1 uppercase tracking-wider">{t('admin.job_title')} (العربية)</label>
                                        <input
                                            required
                                            dir="rtl"
                                            type="text"
                                            placeholder="مثلاً: مطور برمجيات خبير"
                                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            value={formData.jobTitleAr}
                                            onChange={(e) => setFormData({ ...formData, jobTitleAr: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Bios */}
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 px-1 uppercase tracking-wider">{t('admin.bio_en')}</label>
                                        <textarea
                                            required
                                            placeholder={t('admin.tell_about_instructor')}
                                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px] resize-none"
                                            value={formData.bioEn}
                                            onChange={(e) => setFormData({ ...formData, bioEn: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 px-1 uppercase tracking-wider">{t('admin.bio_ar')}</label>
                                        <textarea
                                            required
                                            dir="rtl"
                                            placeholder={t('admin.tell_about_instructor_ar')}
                                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px] resize-none"
                                            value={formData.bioAr}
                                            onChange={(e) => setFormData({ ...formData, bioAr: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* CV Upload */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 px-1 uppercase tracking-wider">{t('admin.cv_file_label')}</label>
                                    <div className="relative group">
                                        <input
                                            required
                                            id="cv-upload"
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="cv-upload"
                                            className="w-full h-24 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 group bg-gray-50/50 dark:bg-gray-900/30"
                                        >
                                            <Upload className={`h-8 w-8 ${cvFile ? 'text-green-500' : 'text-gray-400 group-hover:text-blue-500'} transition-colors`} />
                                            <span className={`text-xs mt-2 font-medium ${cvFile ? 'text-green-600' : 'text-gray-500'} px-4 text-center truncate w-full`}>
                                                {cvFile ? cvFile.name : t('admin.upload_cv_placeholder')}
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-6">
                                    {/* Form content remains inside the scrollable body, but we'll move buttons to a fixed footer below */}
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer - Fixed */}
                        <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-3 flex-none">
                            <button
                                type="button"
                                onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                                className="flex-1 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95"
                            >
                                {t('admin.cancel')}
                            </button>
                            <button
                                form="add-instructor-form"
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-blue-500/20 active:scale-95"
                            >
                                {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
                                {t('admin.add_instructor')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Confirmation Modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                        <div className="p-10 text-center">
                            <div className={`mx-auto w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 shadow-outer ${confirmVariant === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-600' : 'bg-red-50 dark:bg-red-900/30 text-red-600'
                                }`}>
                                {confirmVariant === 'success' ? <Check className="h-12 w-12" /> : <AlertTriangle className="h-12 w-12" />}
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">{confirmTitle}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-relaxed px-2">{confirmMessage}</p>
                        </div>
                        <div className="flex bg-gray-50/50 dark:bg-gray-700/30 p-6 gap-4">
                            <button
                                onClick={() => setIsConfirmModalOpen(false)}
                                className="flex-1 py-5 text-sm font-black text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all transform active:scale-95"
                            >
                                {t('admin.not_now')}
                            </button>
                            <button
                                onClick={async () => {
                                    if (confirmAction) {
                                        await (confirmAction as any)();
                                    }
                                    setIsConfirmModalOpen(false);
                                }}
                                className={`flex-1 py-5 px-6 rounded-3xl text-sm font-black text-white shadow-2xl transition-all active:scale-95 hover:-translate-y-1 ${confirmVariant === 'success' ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30' : 'bg-red-600 hover:bg-red-700 shadow-red-500/30'
                                    }`}
                            >
                                {t('admin.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInstructors;
