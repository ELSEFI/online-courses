import { apiSlice } from './apiSlice';

export const userApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMe: builder.query<any, void>({
            query: () => '/me',
            providesTags: ['User'],
        }),
        updateProfile: builder.mutation<any, FormData>({
            query: (formData) => ({
                url: '/update-profile',
                method: 'PATCH',
                body: formData,
            }),
            invalidatesTags: ['User'],
        }),
        changePassword: builder.mutation<any, any>({
            query: (data) => ({
                url: '/auth/change-password',
                method: 'PATCH',
                body: data,
            }),
        }),
        deleteAccount: builder.mutation<any, void>({
            query: () => ({
                url: '/delete-me',
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useGetMeQuery,
    useUpdateProfileMutation,
    useChangePasswordMutation,
    useDeleteAccountMutation,
} = userApi;
