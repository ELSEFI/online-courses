import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    MessageSquare,
    Trash2,
    Search,
    Loader2,
    Mail,
    User,
    Calendar,
    AlertTriangle,
    X,
    Filter
} from 'lucide-react';
import { toast } from 'sonner';
// You might need to add these functions to adminApi.ts if they don't exist
import { getAllMessages, deleteMessage } from '../../services/adminApi';

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
}

const AdminMessages = () => {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;
    const isRtl = currentLang === 'ar';

    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Delete Confirmation State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const data = await getAllMessages() as any;
            if (Array.isArray(data)) {
                setMessages(data);
            } else if (data && typeof data === 'object' && 'message' in data && (data.message as string).toLowerCase().includes('no messages')) {
                setMessages([]);
            }
        } catch (error: any) {
            console.error('Error fetching messages:', error);
            // Handle specific "No Messages" 400 error gracefully
            if (error.response?.status === 400 || error.message?.includes('No Messages')) {
                setMessages([]);
            } else {
                toast.error(t('admin.failed_fetch_messages'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!messageToDelete) return;

        try {
            setIsDeleting(true);
            await deleteMessage(messageToDelete);
            toast.success(t('admin.message_deleted_success'));
            setMessages(prev => prev.filter(msg => msg._id !== messageToDelete));
            setIsDeleteModalOpen(false);
            setMessageToDelete(null);
        } catch (error: any) {
            toast.error(error.message || t('admin.failed_delete_message'));
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {t('admin.messages')}
                </h1>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
                    {t('admin.messages_desc')}
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400`} />
                <input
                    type="text"
                    placeholder={t('admin.search_messages_placeholder')}
                    className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : filteredMessages.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{t('admin.no_messages')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredMessages.map((msg) => (
                        <div
                            key={msg._id}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group"
                        >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">{msg.name}</h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <Mail className="h-3 w-3" />
                                                    {msg.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 whitespace-nowrap bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1 rounded-full">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(msg.createdAt).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 leading-relaxed border border-gray-100 dark:border-gray-700/50">
                                        "{msg.message}"
                                    </div>
                                </div>

                                <div className="flex md:flex-col gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={() => {
                                            setMessageToDelete(msg._id);
                                            setIsDeleteModalOpen(true);
                                        }}
                                        className="flex-1 md:flex-initial flex items-center justify-center p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group-hover:opacity-100 opacity-100 md:opacity-0"
                                        title={t('admin.delete_message')}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                        <span className="md:hidden ml-2 text-sm font-medium">{t('admin.delete')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                        <div className="p-8 text-center">
                            <div className="mx-auto w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-900/30 text-red-600 flex items-center justify-center mb-6">
                                <Trash2 className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{t('admin.delete_message_confirm')}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                {t('admin.delete_message_desc')}
                            </p>
                        </div>
                        <div className="flex bg-gray-50 dark:bg-gray-800/50 p-4 gap-4">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-4 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                            >
                                {t('admin.cancel')}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 py-4 px-6 rounded-2xl text-sm font-black text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('admin.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMessages;
