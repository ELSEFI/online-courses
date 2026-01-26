import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

interface LessonFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => void;
    mode: 'create' | 'edit';
    initialData?: any;
    isLoading?: boolean;
}

export default function LessonForm({
    isOpen,
    onClose,
    onSubmit,
    mode,
    initialData,
    isLoading = false,
}: LessonFormProps) {
    const [formData, setFormData] = useState({
        titleEn: '',
        titleAr: '',
        order: 0,
        isFree: false,
        hasVideo: false,
        hasQuiz: false,
    });

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                titleEn: initialData.title?.en || '',
                titleAr: initialData.title?.ar || '',
                order: initialData.order || 0,
                isFree: initialData.isFree || false,
                hasVideo: !!initialData.video,
                hasQuiz: initialData.hasQuiz || false,
            });
        } else {
            setFormData({
                titleEn: '',
                titleAr: '',
                order: 0,
                isFree: false,
                hasVideo: false,
                hasQuiz: false,
            });
            setVideoFile(null);
            setAttachmentFiles([]);
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();
        data.append('titleEn', formData.titleEn);
        data.append('titleAr', formData.titleAr);
        data.append('order', formData.order.toString());
        data.append('isFree', formData.isFree.toString());
        data.append('hasVideo', formData.hasVideo.toString());
        data.append('hasQuiz', formData.hasQuiz.toString());

        if (formData.hasVideo && videoFile) {
            data.append('video', videoFile);
        }

        attachmentFiles.forEach((file, index) => {
            data.append('files', file);
            data.append(`fileName${index}`, file.name);
        });

        onSubmit(data);
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setVideoFile(e.target.files[0]);
        }
    };

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachmentFiles(Array.from(e.target.files));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mode === 'create' ? 'Add New Lesson' : 'Edit Lesson'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Title (English) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.titleEn}
                                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Title (Arabic) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.titleAr}
                                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-right"
                                required
                                dir="rtl"
                            />
                        </div>
                    </div>

                    {/* Order and Checkboxes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Order
                            </label>
                            <input
                                type="number"
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                min="0"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isFree}
                                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Free Lesson
                                </span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.hasVideo}
                                    onChange={(e) => setFormData({ ...formData, hasVideo: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Has Video
                                </span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.hasQuiz}
                                    onChange={(e) => setFormData({ ...formData, hasQuiz: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Has Quiz
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Video Upload */}
                    {formData.hasVideo && mode === 'create' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Video File <span className="text-red-500">*</span>
                            </label>
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoChange}
                                    className="hidden"
                                    id="video-upload"
                                    required={formData.hasVideo}
                                />
                                <label
                                    htmlFor="video-upload"
                                    className="flex flex-col items-center cursor-pointer"
                                >
                                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {videoFile ? videoFile.name : 'Click to upload video'}
                                    </span>
                                    {videoFile && (
                                        <span className="text-xs text-gray-500 mt-1">
                                            {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                                        </span>
                                    )}
                                </label>
                            </div>
                        </div>
                    )}

                    {/* File Attachments */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Attachments (PDF, ZIP)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                            <input
                                type="file"
                                accept=".pdf,.zip"
                                multiple
                                onChange={handleFilesChange}
                                className="hidden"
                                id="files-upload"
                            />
                            <label
                                htmlFor="files-upload"
                                className="flex flex-col items-center cursor-pointer"
                            >
                                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {attachmentFiles.length > 0
                                        ? `${attachmentFiles.length} file(s) selected`
                                        : 'Click to upload files'}
                                </span>
                                {attachmentFiles.length > 0 && (
                                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                                        {attachmentFiles.map((file, index) => (
                                            <div key={index}>
                                                {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : mode === 'create' ? 'Create Lesson' : 'Update Lesson'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
