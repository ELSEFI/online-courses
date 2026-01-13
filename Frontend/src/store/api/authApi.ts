import { apiSlice } from './apiSlice';

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        register: builder.mutation({
            query: (userData) => ({
                url: '/auth/register',
                method: 'POST',
                body: userData,
            }),
        }),
        verifyEmail: builder.mutation({
            query: (data) => ({
                url: '/auth/verify-email',
                method: 'POST',
                body: data,
            }),
        }),
        resendVerification: builder.mutation({
            query: (data) => ({
                url: '/auth/resend-verification',
                method: 'POST',
                body: data,
            }),
        }),
        forgetPassword: builder.mutation({
            query: (data) => ({
                url: '/auth/forget-password',
                method: 'POST',
                body: data,
            }),
        }),
        resetPassword: builder.mutation({
            query: ({ token, data }) => ({
                url: `/auth/reset-password/${token}`,
                method: 'PATCH',
                body: data,
            }),
        }),
        loginGoogle: builder.mutation({
            query: (data) => ({
                url: '/auth/google',
                method: 'POST',
                body: data,
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useVerifyEmailMutation,
    useResendVerificationMutation,
    useForgetPasswordMutation,
    useResetPasswordMutation,
    useLoginGoogleMutation,
    useLogoutMutation,
} = authApi;
