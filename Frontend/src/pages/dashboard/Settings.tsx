import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { useUpdateProfileMutation, useChangePasswordMutation, useGetMeQuery } from '@/store/api/userApi';
import { setCredentials, updateUser } from '@/store/slices/authSlice';
import { toast } from 'sonner';
import { User, Lock, Camera, Loader2, Save, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Settings() {
    const { user: authUser } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const { refetch } = useGetMeQuery();
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    // Profile State
    const [name, setName] = useState(authUser?.name || '');
    const [email, setEmail] = useState(authUser?.email || '');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(authUser?.profileImageUrl || authUser?.profileImage || '');

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
    const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const onUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }

        try {
            const result = await updateProfile(formData).unwrap();
            toast.success(result.message || t('profile.profile_updated'));

            if (result.user) {
                dispatch(updateUser(result.user));
                await refetch();
            }
        } catch (err: any) {
            toast.error(err.data?.message || t('profile.profile_failed'));
        }
    };

    const onChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error(t('profile.passwords_mismatch'));
        }

        try {
            const result = await changePassword({ currentPassword, newPassword, passwordConfirm: confirmPassword }).unwrap();
            toast.success(result.message || t('profile.password_updated'));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            toast.error(err.data?.message || t('profile.password_failed'));
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900">{t('profile.account_settings')}</h1>
                <p className="text-slate-500 mt-1">{t('profile.settings_desc')}</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="bg-slate-100 p-1 rounded-2xl mb-8">
                    <TabsTrigger value="profile" className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <User className={`w-4 h-4 ${isAr ? 'ml-2' : 'mr-2'}`} />
                        {t('profile.edit_profile')}
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Lock className={`w-4 h-4 ${isAr ? 'ml-2' : 'mr-2'}`} />
                        {t('profile.security')}
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    <form onSubmit={onUpdateProfile} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 space-y-8">
                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-md">
                                        <img
                                            src={previewUrl || "https://github.com/shadcn.png"}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="w-8 h-8" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>
                                <p className="mt-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('profile.change_avatar')}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('profile.full_name')}</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-12 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">{t('profile.email_address')}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 flex justify-end">
                            <Button
                                type="submit"
                                disabled={isUpdatingProfile}
                                className="bg-[#3DCBB1] hover:bg-[#34b59d] text-white px-8 h-12 rounded-xl font-bold gap-2"
                            >
                                {isUpdatingProfile ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                                {t('profile.save_changes')}
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                    <form onSubmit={onChangePassword} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{t('profile.change_password')}</h3>
                                    <p className="text-sm text-slate-500 tracking-tight">{t('profile.change_password_desc')}</p>
                                </div>
                            </div>

                            <div className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="current">{t('profile.current_password')}</Label>
                                    <Input
                                        id="current"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-12 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new">{t('profile.new_password')}</Label>
                                    <Input
                                        id="new"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-12 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm">{t('profile.confirm_password')}</Label>
                                    <Input
                                        id="confirm"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-12 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 flex justify-end">
                            <Button
                                type="submit"
                                disabled={isChangingPassword}
                                className="bg-[#3DCBB1] hover:bg-[#34b59d] text-white px-8 h-12 rounded-xl font-bold gap-2"
                            >
                                {isChangingPassword ? <Loader2 className="animate-spin w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                {t('profile.update_password')}
                            </Button>
                        </div>
                    </form>
                </TabsContent>
            </Tabs>
        </div>
    );
}
