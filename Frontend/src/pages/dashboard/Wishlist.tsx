import React from 'react';
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from '@/store/api/courseApi';
import { Heart, Trash2, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import assetMap from '@/imports/assetMap';
import { getCourseThumbnail } from '@/utils/imageUtils';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export default function Wishlist() {
    const { data: wishlistItems, isLoading } = useGetWishlistQuery();
    const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    const handleRemove = async (courseId: string) => {
        try {
            await removeFromWishlist(courseId).unwrap();
            toast.success(t('profile.removed_wishlist'));
        } catch (err: any) {
            toast.error(err.data?.message || t('profile.failed_wishlist'));
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3DCBB1]"></div>
                <p className="text-slate-500 font-medium animate-pulse">{t('home.loading')}</p>
            </div>
        );
    }

    const items = wishlistItems || [];

    return (
        <div className="max-w-6xl mx-auto px-4 py-12" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
                    {t('profile.my_wishlist')}
                </h1>
                <p className="text-slate-500 mt-1">{t('profile.wishlist_desc')}</p>
            </div>

            {items.length === 0 ? (
                <div className="bg-white rounded-[32px] p-20 text-center border border-slate-100 shadow-sm">
                    <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6 text-pink-200">
                        <Heart size={48} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('profile.wishlist_empty')}</h3>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">{t('profile.wishlist_empty_desc')}</p>
                    <Link
                        to="/search"
                        className="inline-flex items-center gap-2 bg-[#3DCBB1] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#34b59d] transition-all shadow-lg shadow-[#3DCBB1]/20"
                    >
                        {t('home.explore_courses')}
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {items.map((item: any) => {
                        const course = item.course;
                        if (!course) return null;

                        return (
                            <div key={item._id} className="group bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all overflow-hidden flex flex-col md:flex-row p-4 gap-6">
                                {/* Image */}
                                <div className="w-full md:w-64 aspect-video md:aspect-auto md:h-44 rounded-2xl overflow-hidden shrink-0">
                                    <img
                                        src={getCourseThumbnail(course.thumbnail, course.thumbnailUrl)}
                                        alt={course.title?.[i18n.language] || course.title?.en}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.currentTarget.src = assetMap['course-placeholder.jpg'];
                                        }}
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col justify-between py-2">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[#3DCBB1] text-[10px] font-bold uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-100/50">
                                                {course.category?.name?.[i18n.language] || course.category?.name?.en || 'Development'}
                                            </span>
                                            <div className="flex items-center gap-1 text-orange-400">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="text-sm font-bold text-slate-700">{course.rating || t('profile.new')}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#3DCBB1] transition-colors line-clamp-2 leading-tight uppercase tracking-tight">
                                            {course.title?.[i18n.language] || course.title?.en}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-1 italic">
                                            By {course.instructor?.userId?.name || t('profile.expert_instructor')}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-6">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold text-[#3DCBB1]">${course.price || 0}</span>
                                            {course.discountPrice && (
                                                <span className="text-sm text-slate-400 line-through">${course.discountPrice}</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleRemove(course._id)}
                                                disabled={isRemoving}
                                                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-slate-100"
                                                title={t('profile.remove_wishlist_label')}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <Link
                                                to={`/courses/${course._id}`}
                                                className="flex items-center gap-2 px-6 py-3 bg-[#3DCBB1]/10 text-[#3DCBB1] hover:bg-[#3DCBB1] hover:text-white rounded-2xl font-bold transition-all"
                                            >
                                                <ShoppingCart size={18} />
                                                {t('profile.view_details')}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
