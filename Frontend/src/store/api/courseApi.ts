import { apiSlice } from './apiSlice';
import { Course, FilterOptions, courseService } from '@/services/api';

export const courseApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTrendingCourses: builder.query<any, void>({
            query: () => '/home-data', // Trending and Top Rated are facets of home-data
            transformResponse: (response: any) => response.data.trendingCourses,
            providesTags: ['Course'],
        }),
        getStudioCourses: builder.query<any, void>({
            query: () => '/home-data',
            transformResponse: (response: any) => response.data.topRatedCourses,
            providesTags: ['Course'],
        }),
        getActiveCourses: builder.query<any, void>({
            query: () => '/my-courses',
            providesTags: ['Course'],
        }),
        getCourseDetails: builder.query<any, string>({
            query: (slug) => `/courses/${slug}`,
            providesTags: (result, error, slug) => [{ type: 'Course', id: slug }],
        }),
        searchCourses: builder.query<any, { query?: string; filters?: any }>({
            query: ({ query, filters }) => ({
                url: '/all/courses',
                params: {
                    q: query,
                    ...filters
                }
            }),
            transformResponse: (response: any) => response,
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
            query: () => '/admin/instructors', // From app.use('/api/v1/admin/instructors', instructorsRoutes)
            providesTags: ['User'],
        }),
        getInstructorCourses: builder.query<any, void>({
            query: () => '/instructor/courses',
            providesTags: ['Course'],
        }),
        getSpecificInstructorCourses: builder.query<any, string>({
            query: (instructorId) => `/admin/instructors/${instructorId}/courses`,
            providesTags: ['Course'],
        }),
        getHomeData: builder.query<any, string | undefined>({
            query: (category) => ({
                url: '/home-data',
                params: category ? { category } : undefined
            }),
            transformResponse: (response: any) => response.data,
            providesTags: ['Course'],
        }),
        getCourseSections: builder.query<any, string>({
            query: (courseSlug) => `${courseSlug}/sections`,
            providesTags: (result, error, courseSlug) => [
                { type: 'Course', id: courseSlug }
            ],
        }),
        getSectionLessons: builder.query<any, { courseSlug: string; sectionId: string }>({
            query: ({ courseSlug, sectionId }) => `${courseSlug}/sections/${sectionId}/lessons`,
            providesTags: (result, error, { courseSlug, sectionId }) => [
                { type: 'Course', id: `${courseSlug}-${sectionId}` }
            ],
        }),

        // Quiz endpoints
        // Quiz endpoints
        getQuizPreview: builder.query({
            query: ({ courseSlug, lessonId, quizId }) =>
                `${courseSlug}/lessons/${lessonId}/quiz/${quizId}/preview`,
        }),

        getQuiz: builder.query({
            query: ({ courseSlug, lessonId, quizId }) =>
                `${courseSlug}/lessons/${lessonId}/quiz/${quizId}`,
        }),

        submitQuiz: builder.mutation({
            query: ({ courseSlug, lessonId, quizId, answers }) => ({
                url: `${courseSlug}/lessons/${lessonId}/quiz/${quizId}`,
                method: 'POST',
                body: answers,
            }),
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
    useGetSpecificInstructorCoursesQuery,
    useGetHomeDataQuery,
    useGetCourseSectionsQuery,
    useGetSectionLessonsQuery,
    useGetQuizPreviewQuery,
    useGetQuizQuery,
    useSubmitQuizMutation,
} = courseApi;
