// Admin API Service
// Handles all API calls for admin dashboard

const API_BASE_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

// Generic fetch wrapper
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
}

// Statistics
export const getStats = () => apiFetch('/admin/stats');

// Users
export const getAllUsers = () => apiFetch('/admin/users');
export const getUser = (userId: string) => apiFetch(`/admin/users/${userId}`);
export const addUser = (data: any) => apiFetch('/admin/users/add-user', {
    method: 'POST',
    body: JSON.stringify(data),
});
export const deleteUser = (userId: string) => apiFetch(`/admin/users/${userId}`, {
    method: 'DELETE',
});
export const updateUserStatus = (userId: string, data: any) => apiFetch(`/admin/users/${userId}/update-status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
});

// Helper for FormData requests
export async function apiFetchFormData<T>(endpoint: string, formData: FormData, method: string = 'POST'): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
}

// Instructors
export const getAllInstructors = () => apiFetch('/admin/instructors');
export const getTopRatedInstructors = () => apiFetch('/admin/instructors/top-instructors-rated');
export const getTopStudentsInstructors = () => apiFetch('/admin/instructors/top-instructors-students');
export const getInstructor = (instructorId: string) => apiFetch(`/admin/instructors/${instructorId}`);
export const addInstructor = (formData: FormData) => apiFetchFormData('/admin/instructors/add-instructor', formData, 'POST');
export const removeInstructor = (instructorId: string) => apiFetch(`/admin/instructors/${instructorId}/remove-instructor`, {
    method: 'DELETE',
});

// Instructor Requests
export const getAllRequests = () => apiFetch('/admin/instructors/requests');
export const getRequest = (requestId: string) => apiFetch(`/admin/instructors/requests/${requestId}`);
export const approveRequest = (requestId: string) => apiFetch(`/admin/instructors/requests/${requestId}/approve-request`, {
    method: 'PATCH',
});
export const rejectRequest = (requestId: string, data: any) => apiFetch(`/admin/instructors/requests/${requestId}/reject-request`, {
    method: 'PATCH',
    body: JSON.stringify(data),
});

// Courses
export const getAllCourses = () => apiFetch('/admin/all-courses');
export const getCourse = (courseSlug: string) => apiFetch(`/courses/${courseSlug}`);
export const createCourse = (formData: FormData) => apiFetchFormData('/courses', formData, 'POST');
export const updateCourse = (courseId: string, formData: FormData) => apiFetchFormData(`/courses/${courseId}/update-course`, formData, 'PATCH');
export const deleteCourse = (courseId: string) => apiFetch(`/courses/${courseId}`, {
    method: 'DELETE',
});
export const changePublishStatus = (courseId: string, data: any) => apiFetch(`/courses/${courseId}/publish-status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
});
export const restoreCourse = (courseId: string) => apiFetch(`/courses/${courseId}/restore-course`, {
    method: 'PATCH',
});
export const getUnpublishedCourses = () => apiFetch('/courses/unpublished');

// Categories
export const getAllCategories = () => apiFetch('/categories');
export const getSubCategories = (categoryId: string) => apiFetch(`/categories/${categoryId}`);
export const addCategory = (formData: FormData) => apiFetchFormData('/categories', formData, 'POST');
export const updateCategory = (categoryId: string, formData: FormData) => apiFetchFormData(`/categories/${categoryId}/update-category`, formData, 'PATCH');
export const disableCategory = (categoryId: string) => apiFetch(`/categories/${categoryId}/disable-category`, {
    method: 'PATCH',
});
export const restoreCategory = (categoryId: string) => apiFetch(`/categories/${categoryId}/restore-category`, {
    method: 'PATCH',
});
export const getUnActiveCategories = () => apiFetch('/categories/unActive');

// Messages
export const getAllMessages = () => apiFetch('/messages');
export const getMessage = (messageId: string) => apiFetch(`/messages/${messageId}`);
export const replyMessage = (messageId: string, data: any) => apiFetch(`/messages/${messageId}/reply-message`, {
    method: 'POST',
    body: JSON.stringify(data),
});
export const deleteMessage = (messageId: string) => apiFetch(`/messages/${messageId}/delete-message`, {
    method: 'DELETE',
});
export const deleteAllMessages = () => apiFetch('/messages/delete-messages', {
    method: 'DELETE',
});
