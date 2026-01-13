import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Heart, User, ArrowLeft, PenTool, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const PlaceholderView = ({ title, icon: Icon, description }: { title: string, icon: any, description: string }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6 text-teal-600">
                <Icon size={40} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
            <p className="text-slate-500 max-w-md mb-8">{description}</p>
            <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="gap-2"
            >
                <ArrowLeft size={16} />
                Back to Home
            </Button>
        </div>
    );
};

export const SettingsView = () => (
    <PlaceholderView
        title="Account Settings"
        icon={Settings}
        description="Manage your profile information, password, and notification preferences. This section is currently under construction."
    />
);

export const WishlistView = () => (
    <PlaceholderView
        title="My Wishlist"
        icon={Heart}
        description="View and manage the courses you've saved for later. This feature will be available soon in the next update."
    />
);

export const ProfileView = () => (
    <PlaceholderView
        title="User Profile"
        icon={User}
        description="View your learning achievements, certificates, and public bio. Profile editing will be enabled after authentication setup."
    />
);

export const BecomeInstructorView = () => (
    <PlaceholderView
        title="Become an Instructor"
        icon={PenTool}
        description="Share your knowledge with the world. Apply to become an instructor and start creating your own courses."
    />
);

export const NotificationsView = () => (
    <PlaceholderView
        title="Notifications"
        icon={Bell}
        description="Stay updated with your course progress, announcements, and messages from instructors."
    />
);
