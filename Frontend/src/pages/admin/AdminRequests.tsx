import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    CheckCircle,
    XCircle,
    FileText,
    User,
    Calendar,
    Briefcase,
    ExternalLink,
    Loader2,
    Search,
    Filter,
    Check,
    AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { getAllRequests, approveRequest, rejectRequest } from '../../services/adminApi';

interface InstructorRequest {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        profileImage?: string;
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
    cvFile: string;
    cvURL?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

const AdminRequests = () => {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;
    const isRtl = currentLang === 'ar';

    const [requests, setRequests] = useState<InstructorRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

    // Rejection Modal State
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [rejectionReasonEn, setRejectionReasonEn] = useState('');
    const [rejectionReasonAr, setRejectionReasonAr] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Confirmation Modal State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<() => void>(() => { });
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmVariant, setConfirmVariant] = useState<'success' | 'danger'>('success');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await getAllRequests() as any;
            if (Array.isArray(data)) {
                setRequests(data);
            } else if (data && typeof data === 'object' && 'message' in data && (data.message as string).includes('No Requests')) {
                setRequests([]);
            }
        } catch (error: any) {
            console.error('Error fetching requests:', error);
            if (!error.message?.includes('401')) {
                toast.error(t('admin.failed_fetch_requests'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setConfirmTitle(t('admin.approve_instructor_title'));
        setConfirmMessage(t('admin.approve_instructor_confirm'));
        setConfirmVariant('success');
        setConfirmAction(() => async () => {
            try {
                await approveRequest(id);
                toast.success(t('admin.instructor_approved_success'));
                fetchRequests();
            } catch (error: any) {
                toast.error(error.message || t('admin.failed_approve_request'));
            }
        });
        setIsConfirmModalOpen(true);
    };

    const handleReject = async () => {
        if (!selectedRequestId || !rejectionReasonEn || !rejectionReasonAr) {
            toast.error(t('admin.reject_reasons_required'));
            return;
        }

        try {
            setIsSubmitting(true);
            await rejectRequest(selectedRequestId, {
                rejectionReason_en: rejectionReasonEn,
                rejectionReason_ar: rejectionReasonAr
            });
            toast.success(t('admin.request_rejected_success'));
            setIsRejectionModalOpen(false);
            setSelectedRequestId(null);
            setRejectionReasonEn('');
            setRejectionReasonAr('');
            fetchRequests();
        } catch (error: any) {
            toast.error(error.message || t('admin.failed_reject_request'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredRequests = requests.filter(req => {
        const name = req.userId?.name || t('admin.unknown_user');
        const email = req.userId?.email || '';

        const matchesSearch =
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' ? true : req.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {t('admin.instructor_requests')}
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
                        {t('admin.instructor_requests_desc')}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400`} />
                    <input
                        type="text"
                        placeholder={t('admin.search_requests_placeholder')}
                        className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative min-w-[150px]">
                    <Filter className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none`} />
                    <select
                        className="w-full h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white appearance-none cursor-pointer"
                        value={statusFilter}
                        onChange={(e: any) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">{t('admin.all_status')}</option>
                        <option value="pending">{t('admin.pending')}</option>
                        <option value="approved">{t('admin.approved')}</option>
                        <option value="rejected">{t('admin.rejected')}</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">{t('admin.no_requests')}</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table className="w-full text-left rtl:text-right">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 text-sm font-medium">
                                <tr>
                                    <th className="px-6 py-4">{t('admin.user')}</th>
                                    <th className="px-6 py-4">{t('admin.job_title')}</th>
                                    <th className="px-6 py-4">{t('admin.experience_years')}</th>
                                    <th className="px-6 py-4">{t('admin.application_date')}</th>
                                    <th className="px-6 py-4">{t('admin.status')}</th>
                                    <th className="px-6 py-4 text-center">{t('admin.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredRequests.map((req) => (
                                    <tr key={req._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                    {req.userId?.profileImage ? (
                                                        <img src={req.userId.profileImage} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <User className="h-5 w-5 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {req.userId?.name || t('admin.unknown_user')}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {req.userId?.email || t('admin.no_email')}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {currentLang === 'ar' ? req.jobTitle.ar : req.jobTitle.en}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {req.experienceYears} {t('admin.years_of_experience')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(req.createdAt).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                                                {t(`admin.${req.status}`)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {req.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(req._id)}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                            title={t('admin.approve')}
                                                        >
                                                            <CheckCircle className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRequestId(req._id);
                                                                setIsRejectionModalOpen(true);
                                                            }}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title={t('admin.reject')}
                                                        >
                                                            <XCircle className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                )}
                                                {req.cvURL && (
                                                    <a
                                                        href={req.cvURL}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        title={t('admin.view_cv')}
                                                    >
                                                        <ExternalLink className="h-5 w-5" />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile List */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {filteredRequests.map((req) => (
                            <div key={req._id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                            {req.userId?.profileImage ? (
                                                <img src={req.userId.profileImage} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-6 w-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {req.userId?.name || t('admin.unknown_user')}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {req.userId?.email || t('admin.no_email')}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                                        {t(`admin.${req.status}`)}
                                    </span>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <Briefcase className="h-4 w-4 text-gray-400" />
                                        <span>{currentLang === 'ar' ? req.jobTitle.ar : req.jobTitle.en}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <span>{req.experienceYears} {t('admin.years_of_experience')}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                                        <p className="line-clamp-2 italic text-xs">
                                            "{currentLang === 'ar' ? req.bio.ar : req.bio.en}"
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {req.status === 'pending' ? (
                                        <>
                                            <button
                                                onClick={() => handleApprove(req._id)}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                {t('admin.approve')}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedRequestId(req._id);
                                                    setIsRejectionModalOpen(true);
                                                }}
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                {t('admin.reject')}
                                            </button>
                                        </>
                                    ) : (
                                        req.cvURL && (
                                            <a
                                                href={req.cvURL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold py-2 rounded-lg flex items-center justify-center gap-2"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                {t('admin.view_cv')}
                                            </a>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Rejection Modal */}
            {isRejectionModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('admin.reject_application_title')}</h2>
                            <button
                                onClick={() => setIsRejectionModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('admin.reason_en')}
                                </label>
                                <textarea
                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
                                    placeholder={t('admin.reject_placeholder_en')}
                                    value={rejectionReasonEn}
                                    onChange={(e) => setRejectionReasonEn(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('admin.reason_ar')}
                                </label>
                                <textarea
                                    dir="rtl"
                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
                                    placeholder={t('admin.reject_placeholder_ar')}
                                    value={rejectionReasonAr}
                                    onChange={(e) => setRejectionReasonAr(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex gap-3">
                            <button
                                onClick={() => setIsRejectionModalOpen(false)}
                                className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                {t('admin.cancel')}
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={isSubmitting}
                                className="flex-1 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-500/20"
                            >
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {t('admin.confirm_reject')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                        <div className="p-8 text-center">
                            <div className={`mx-auto w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${confirmVariant === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-600' : 'bg-red-50 dark:bg-red-900/30 text-red-600'
                                }`}>
                                {confirmVariant === 'success' ? <Check className="h-10 w-10" /> : <AlertTriangle className="h-10 w-10" />}
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{confirmTitle}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{confirmMessage}</p>
                        </div>
                        <div className="flex bg-gray-50 dark:bg-gray-800/50 p-4 gap-4">
                            <button
                                onClick={() => setIsConfirmModalOpen(false)}
                                className="flex-1 py-4 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                            >
                                {t('admin.cancel')}
                            </button>
                            <button
                                onClick={async () => {
                                    if (confirmAction) {
                                        await (confirmAction as any)();
                                    }
                                    setIsConfirmModalOpen(false);
                                }}
                                className={`flex-1 py-4 px-6 rounded-2xl text-sm font-black text-white shadow-xl transition-all active:scale-95 ${confirmVariant === 'success' ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
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

export default AdminRequests;
