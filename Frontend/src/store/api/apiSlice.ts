import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { logout } from '../slices/authSlice';
import { toast } from 'sonner';

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        // Get current language from localStorage (i18n stores it there)
        const currentLang = localStorage.getItem('i18nextLng') || 'en';

        // Show language-aware toast notification
        if (currentLang === 'ar') {
            toast.error('جلستك انتهت', {
                description: 'من فضلك سجل دخول مرة أخرى',
                duration: 3000,
            });
        } else {
            toast.error('Session Expired', {
                description: 'Please login again to continue',
                duration: 3000,
            });
        }

        // Log out the user automatically on 401 Unauthorized
        api.dispatch(logout());

        // Redirect to login page after a short delay
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000);
    }

    return result;
};

// Define a service using a base URL and expected endpoints
export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Course', 'User', 'Module', 'Lesson'],
    endpoints: () => ({}),
});
