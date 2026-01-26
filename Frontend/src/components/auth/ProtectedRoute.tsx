import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'user' | 'instructor' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const location = useLocation();
    const [hasShownToast, setHasShownToast] = useState(false);

    useEffect(() => {
        if (!isAuthenticated && !hasShownToast) {
            // Get current language
            const currentLang = localStorage.getItem('i18nextLng') || 'en';

            // Show language-aware toast
            if (currentLang === 'ar') {
                toast.error('يجب تسجيل الدخول', {
                    description: 'من فضلك سجل دخول للوصول لهذه الصفحة',
                    duration: 3000,
                });
            } else {
                toast.error('Authentication Required', {
                    description: 'Please login to access this page',
                    duration: 3000,
                });
            }

            setHasShownToast(true);
        }
    }, [isAuthenticated, hasShownToast]);

    if (!isAuthenticated) {
        // Redirect to login while preserving the intended destination
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role if required
    if (requiredRole && user?.role !== requiredRole) {
        const currentLang = localStorage.getItem('i18nextLng') || 'en';

        if (currentLang === 'ar') {
            toast.error('غير مصرح', {
                description: 'ليس لديك صلاحية للوصول لهذه الصفحة',
                duration: 3000,
            });
        } else {
            toast.error('Unauthorized', {
                description: 'You do not have permission to access this page',
                duration: 3000,
            });
        }

        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
