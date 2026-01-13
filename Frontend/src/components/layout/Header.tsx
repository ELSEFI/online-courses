import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Globe, ShoppingCart, Bell, Search, ChevronDown, ChevronRight, Menu, X, Layout, PenTool, Heart, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { CATEGORIES } from "@/services/api";
import { logout } from '@/store/slices/authSlice';
import { useLogoutMutation } from '@/store/api/authApi';
import { apiSlice } from '@/store/api/apiSlice';
import { RootState } from '@/store';
import { toast } from 'sonner';

export default function Header() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [logoutMutation] = useLogoutMutation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'ar' ? 'en' : 'ar';
        i18n.changeLanguage(newLang);
    };

    const handleLogout = async () => {
        try {
            await logoutMutation({}).unwrap();
            dispatch(logout());
            dispatch(apiSlice.util.resetApiState());
            toast.success(t('nav.logout_success') || 'Logged out successfully');
            navigate('/login');
        } catch (err) {
            // Even if backend fails, we usually want to clear local state
            dispatch(logout());
            dispatch(apiSlice.util.resetApiState());
            navigate('/login');
        }
    };

    return (
        <header className="h-[80px] bg-[#FFE483] w-full flex items-center relative z-[100] shadow-sm" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="w-full max-w-[1200px] mx-auto px-4 flex items-center justify-between h-full">

                {/* LEFT: Logo & Mobile Toggle */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="md:hidden p-0" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </Button>

                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="bg-teal-500 rounded-full w-8 h-8 flex items-center justify-center">
                            <span className="text-white font-bold text-lg leading-none">m</span>
                        </div>
                        <span className="font-bold text-xl text-slate-900 hidden sm:block">MyCourse.io</span>
                    </div>
                </div>

                {/* CENTER: Browse Mega Menu (Desktop) */}
                <div className="hidden md:flex flex-1 mx-8 h-full items-center justify-between">
                    {/* Browse Toggle Wrapper (Isolated Group) */}
                    <div className="relative h-full flex items-center group px-4 cursor-pointer">
                        <div className="flex items-center gap-2 font-medium text-slate-900">
                            {t('nav.browse_categories')} <ChevronDown size={16} className={i18n.language === 'ar' ? 'mr-1' : 'ml-1'} />
                        </div>

                        {/* Mega Menu Dropdown */}
                        <div className="absolute top-[80px] left-0 bg-white rounded-b-[12px] shadow-lg border border-slate-100 hidden group-hover:flex w-[600px] min-h-[300px] z-50">
                            {/* Categories */}
                            <div className="w-1/3 border-r border-slate-100 py-4">
                                {CATEGORIES.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${activeCategory === cat.name ? 'bg-slate-50' : ''}`}
                                        onMouseEnter={() => setActiveCategory(cat.name)}
                                    >
                                        <span className="font-bold text-slate-800 text-sm">{cat.name[i18n.language] || cat.name.en || cat.name}</span>
                                        <ChevronRight size={14} className={`text-slate-400 ${i18n.language === 'ar' ? 'rotate-180' : ''}`} />
                                    </div>
                                ))}
                            </div>

                            {/* Subcategories */}
                            <div className="w-2/3 py-4 bg-white rounded-br-[12px]">
                                {activeCategory && CATEGORIES.find(c => c.name === activeCategory)?.subcategories.map((sub, idx) => (
                                    <div key={idx} className="px-6 py-3 hover:bg-slate-50 cursor-pointer transition-colors block" onClick={() => navigate('/search')}>
                                        <div className="font-bold text-slate-900 text-sm mb-0.5">{sub.title}</div>
                                        <div className="text-xs text-slate-500">{sub.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Search Input (Desktop) - Outside Group */}
                    <div className="flex-1 max-w-md ml-8 relative">
                        <Input
                            placeholder={t('home.explore_courses')}
                            className={`w-full h-10 rounded-full bg-white border-0 focus-visible:ring-1 focus-visible:ring-teal-500 shadow-sm placeholder:text-slate-400 text-sm ${i18n.language === 'ar' ? 'pr-6 pl-10' : 'pl-6 pr-10'}`}
                            onKeyDown={(e) => e.key === 'Enter' && navigate('/search')}
                        />
                        <Search className={`absolute top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 cursor-pointer ${i18n.language === 'ar' ? 'left-3' : 'right-3'}`} onClick={() => navigate('/search')} />
                    </div>
                </div>

                {/* RIGHT: Actions */}
                <div className="flex items-center gap-4 md:gap-[24px]">
                    {/* Mobile Search Toggle */}
                    <Button variant="ghost" size="icon" onClick={toggleLanguage} title={i18n.language === 'ar' ? 'English' : 'العربية'}>
                        <Globe className="w-5 h-5 text-slate-700" />
                    </Button>

                    {(!isAuthenticated || user?.role === 'user') && (
                        <Link to="/become-instructor" className="hidden lg:block text-slate-700 font-medium text-sm hover:text-slate-900 transition-colors">{t('nav.become_instructor')}</Link>
                    )}
                    <ShoppingCart className="w-5 h-5 text-slate-700 cursor-pointer hover:text-slate-900 transition-colors" />

                    {isAuthenticated ? (
                        <>
                            <Bell className="w-5 h-5 text-slate-700 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => navigate('/notifications')} />

                            {/* User Avatar */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-[#3DCBB1] hover:shadow-md transition-all">
                                        <img src={user?.profileImageUrl || user?.profileImage || "https://github.com/shadcn.png"} alt={user?.name} className="w-full h-full object-cover" />
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-60 p-0 rounded-[12px] shadow-lg border-slate-100 mt-2" align="end" forceMount>
                                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-[12px] cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => navigate('/profile')}>
                                        <p className="font-bold text-slate-900 text-sm">{user?.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                    </div>
                                    <div className="p-2 flex flex-col gap-1">
                                        {/* Role-Specific Links */}
                                        {user?.role === 'admin' && (
                                            <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer py-2 px-3 rounded-[8px] text-sm text-indigo-600 font-bold focus:bg-indigo-50">
                                                <ShieldCheck className={`w-4 h-4 ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'}`} /> {t('nav.admin_panel')}
                                            </DropdownMenuItem>
                                        )}
                                        {user?.role === 'instructor' && (
                                            <DropdownMenuItem onClick={() => navigate('/instructor')} className="cursor-pointer py-2 px-3 rounded-[8px] text-sm text-teal-600 font-bold focus:bg-teal-50">
                                                <PenTool className={`w-4 h-4 ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'}`} /> {t('nav.instructor_dashboard')}
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuItem onClick={() => navigate('/my-courses')} className="cursor-pointer py-2 px-3 rounded-[8px] text-sm text-slate-700 focus:bg-slate-50">
                                            <Layout className={`w-4 h-4 ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'}`} /> {t('nav.my_courses')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/wishlist')} className="cursor-pointer py-2 px-3 rounded-[8px] text-sm text-slate-700 focus:bg-slate-50">
                                            <Heart className={`w-4 h-4 ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'}`} /> {t('nav.wishlist')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/notifications')} className="cursor-pointer py-2 px-3 rounded-[8px] text-sm text-slate-700 focus:bg-slate-50">
                                            <Bell className={`w-4 h-4 ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'}`} /> {t('nav.notifications')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer py-2 px-3 rounded-[8px] text-sm text-slate-700 focus:bg-slate-50">
                                            <PenTool className={`w-4 h-4 ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'}`} /> {t('nav.settings')}
                                        </DropdownMenuItem>
                                        <div className="h-px bg-slate-100 my-1 mx-2"></div>
                                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2 px-3 rounded-[8px] text-sm text-red-500 focus:text-red-600 focus:bg-red-50 font-medium">
                                            <LogOut className={`w-4 h-4 ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'}`} /> {t('nav.logout')}
                                        </DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" onClick={() => navigate('/login')} className="text-slate-700 font-semibold hidden sm:flex">
                                {t('nav.login')}
                            </Button>
                            <Button onClick={() => navigate('/register')} className="bg-[#3DCBB1] hover:bg-[#34b59d] text-white font-bold rounded-xl px-6">
                                {t('nav.signup')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>


            {/* Mobile Search Bar (Expandable) */}
            {isSearchOpen && (
                <div className="absolute top-[80px] left-0 w-full bg-[#FFE483] p-4 shadow-md md:hidden animate-in slide-in-from-top-2">
                    <div className="relative w-full">
                        <Input
                            placeholder={t('nav.search_placeholder')}
                            autoFocus
                            className={`w-full h-12 rounded-full bg-white border-0 shadow-sm placeholder:text-slate-400 text-base ${i18n.language === 'ar' ? 'pr-6 pl-12' : 'pl-6 pr-12'}`}
                        />
                        <Search className={`absolute top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 ${i18n.language === 'ar' ? 'left-4' : 'right-4'}`} />
                    </div>
                </div>
            )}

            {/* Mobile Menu Sidebar (Drawer) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 top-[80px] z-50 bg-white md:hidden overflow-y-auto animate-in slide-in-from-left-10 duration-200 border-t border-slate-100">
                    <div className="p-4 flex flex-col gap-6 pb-20">
                        {/* Mobile Categories (Scrollable & Accordion) */}
                        <div>
                            <h3 className="font-bold text-lg mb-4 text-slate-900 flex items-center gap-2">
                                <Layout size={18} /> {t('nav.browse_categories')}
                            </h3>
                            {/* Scrollable Container */}
                            <div className="flex flex-col border-l-2 border-slate-100 ml-2 pl-4 gap-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {CATEGORIES.map(cat => (
                                    <div key={cat.id} className="flex flex-col">
                                        {/* Category Row: Name distinct from Toggle */}
                                        <div className="flex items-center justify-between py-2 group">
                                            <span
                                                className="font-medium text-slate-600 text-base hover:text-teal-600 cursor-pointer transition-colors bg-transparent flex-1"
                                                onClick={() => {
                                                    navigate(`/search?category=${cat.name}`);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                            >
                                                {cat.name}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExpandedMobileCat(expandedMobileCat === cat.id ? null : cat.id);
                                                }}
                                                className="p-2 -mr-2 text-slate-400 hover:text-teal-600 transition-colors focus:outline-none active:scale-95"
                                            >
                                                <ChevronRight size={18} className={`transition-transform duration-200 ${expandedMobileCat === cat.id ? 'rotate-90 text-teal-600' : ''}`} />
                                            </button>
                                        </div>

                                        {/* Subcategories Expansion */}
                                        {expandedMobileCat === cat.id && (
                                            <div className="pl-2 pb-2 animate-in slide-in-from-top-1 fade-in-50 duration-200">
                                                {cat.subcategories.length > 0 ? (
                                                    cat.subcategories.map((sub, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="py-2 px-3 text-sm text-slate-500 hover:text-teal-600 hover:bg-slate-50 rounded-md cursor-pointer mb-1"
                                                            onClick={() => {
                                                                navigate(`/search?subcategory=${sub.title}`);
                                                                setIsMobileMenuOpen(false);
                                                            }}
                                                        >
                                                            {sub.title}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="py-2 text-xs text-slate-400 italic pl-3">No subcategories</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 w-full"></div>

                        {/* Mobile Links */}
                        <div className="flex flex-col gap-4">
                            {(!isAuthenticated || user?.role === 'user') && (
                                <Link to="/become-instructor" onClick={() => setIsMobileMenuOpen(false)} className="font-medium text-slate-900 text-lg flex items-center gap-3 hover:text-teal-600 transition-colors">
                                    <PenTool size={18} /> {t('nav.become_instructor')}
                                </Link>
                            )}

                            <Link to="/my-courses" onClick={() => setIsMobileMenuOpen(false)} className="font-medium text-slate-900 text-lg flex items-center gap-3 hover:text-teal-600 transition-colors">
                                <Layout size={18} /> {t('nav.my_courses')}
                            </Link>
                            <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="font-medium text-slate-900 text-lg flex items-center gap-3 hover:text-teal-600 transition-colors">
                                <Heart size={18} /> {t('nav.wishlist')}
                            </Link>
                            <Link to="/notifications" onClick={() => setIsMobileMenuOpen(false)} className="font-medium text-slate-900 text-lg flex items-center gap-3 hover:text-teal-600 transition-colors">
                                <Bell size={18} /> {t('nav.notifications')}
                            </Link>
                        </div>

                        <div className="h-px bg-slate-100 w-full"></div>

                        {/* Logout Button (Profile Removed) */}
                        <Button variant="outline" className="text-red-500 border-red-100 bg-red-50 hover:bg-red-100 hover:text-red-600 w-full justify-start h-12 text-base font-medium">
                            {t('nav.logout')}
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}
