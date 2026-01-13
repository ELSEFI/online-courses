import { apiSlice } from './apiSlice';
import { Course, FilterOptions, courseService } from '@/services/api';

export const courseApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTrendingCourses: builder.query<Course[], void>({
            queryFn: async () => {
                const data = await courseService.getTrendingCourses();
                return { data };
            },
            providesTags: ['Course'],
        }),
        getStudioCourses: builder.query<Course[], void>({
            queryFn: async () => {
                const data = await courseService.getStudioCourses();
                return { data };
            },
            providesTags: ['Course'],
        }),
        getActiveCourses: builder.query<Course[], void>({
            queryFn: async () => {
                const data = await courseService.getActiveCourses();
                return { data };
            },
            providesTags: ['Course'],
        }),
        getCourseDetails: builder.query<Course, string>({
            queryFn: async (id) => {
                const data = await courseService.getCourseDetails(id);
                return { data: data || ({} as Course) };
            },
            providesTags: (result, error, id) => [{ type: 'Course', id }],
        }),
        searchCourses: builder.query<Course[], { query: string; filters: FilterOptions }>({
            queryFn: async ({ query, filters }) => {
                const data = await courseService.searchCourses(query, filters);
                return { data };
            },
            providesTags: ['Course'],
        }),
        getMyCourses: builder.query<any, void>({
            query: () => '/my-courses',
            providesTags: ['Course'],
        }),
        getWishlist: builder.query<any, void>({
            query: () => '/wishlist',
            providesTags: ['Course'],
        }),
        addToWishlist: builder.mutation<any, string>({
            query: (courseId) => ({
                url: `/wishlist/${courseId}`,
                method: 'POST',
            }),
            invalidatesTags: ['Course'],
        }),
        removeFromWishlist: builder.mutation<any, string>({
            query: (courseId) => ({
                url: `/wishlist/${courseId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Course'],
        }),
        getInstructors: builder.query<any[], void>({
            queryFn: async () => {
                const data = await courseService.getInstructors();
                return { data };
            },
            providesTags: ['User'],
        }),
        getInstructorCourses: builder.query<Course[], void>({
            query: () => '/instructor/courses',
            providesTags: ['Course'],
        }),
        getHomeData: builder.query<any, string | undefined>({
            query: (category) => ({
                url: '/home-data',
                params: category ? { category } : undefined
            }),
            providesTags: ['Course'],
        }),
    }),
});

export const {
    useGetTrendingCoursesQuery,
    useGetStudioCoursesQuery,
    useGetActiveCoursesQuery,
    useGetCourseDetailsQuery,
    useSearchCoursesQuery,
    useGetMyCoursesQuery,
    useGetWishlistQuery,
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
    useGetInstructorsQuery,
    useGetInstructorCoursesQuery,
    useGetHomeDataQuery,
} = courseApi;
