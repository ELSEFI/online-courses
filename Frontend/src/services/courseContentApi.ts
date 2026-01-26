import { apiFetch, apiFetchFormData } from './adminApi';

// ==================== SECTIONS ====================

export interface SectionData {
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
    order?: number;
}

export interface Section {
    _id: string;
    course: string;
    title: {
        en: string;
        ar: string;
    };
    description: {
        en: string;
        ar: string;
    };
    order: number;
    isActive: boolean;
    lessons?: Lesson[];
    createdAt: string;
    updatedAt: string;
}

// Get all sections for a course
export const getSections = (courseSlug: string) =>
    apiFetch(`/${courseSlug}/sections`);

// Create a new section
export const createSection = (courseSlug: string, data: SectionData) =>
    apiFetch(`/${courseSlug}/sections`, {
        method: 'POST',
        body: JSON.stringify(data),
    });

// Update a section
export const updateSection = (courseSlug: string, sectionId: string, data: SectionData) =>
    apiFetch(`/${courseSlug}/sections/${sectionId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });

// Delete a section (soft delete)
export const deleteSection = (courseSlug: string, sectionId: string) =>
    apiFetch(`/${courseSlug}/sections/${sectionId}`, {
        method: 'DELETE',
    });

// Restore a deleted section
export const restoreSection = (courseSlug: string, sectionId: string) =>
    apiFetch(`/${courseSlug}/sections/${sectionId}/restore`, {
        method: 'PATCH',
    });

// ==================== LESSONS ====================

export interface Lesson {
    _id: string;
    section: string;
    title: {
        en: string;
        ar: string;
    };
    order: number;
    isActive: boolean;
    isFree: boolean;
    video?: {
        provider: string;
        fileName: string;
        size: number;
        duration: number | null;
    };
    hasQuiz: boolean;
    files: {
        name: string;
        type: string;
        fileName: string;
        size: number;
        fileUrl: string;
    }[];
    videoUrl?: string;
    createdAt: string;
    updatedAt: string;
}

// Get all lessons for a section
export const getLessons = (courseSlug: string, sectionId: string) =>
    apiFetch(`/${courseSlug}/sections/${sectionId}/lessons`);

// Create a new lesson
export const createLesson = (courseSlug: string, sectionId: string, formData: FormData) =>
    apiFetchFormData(`/${courseSlug}/sections/${sectionId}/lessons`, formData, 'POST');

// Update a lesson
export const updateLesson = (courseSlug: string, sectionId: string, lessonId: string, formData: FormData) =>
    apiFetchFormData(`/${courseSlug}/sections/${sectionId}/lessons/${lessonId}`, formData, 'PATCH');

// Delete a lesson (soft delete)
export const deleteLesson = (courseSlug: string, sectionId: string, lessonId: string) =>
    apiFetch(`/${courseSlug}/sections/${sectionId}/lessons/${lessonId}`, {
        method: 'DELETE',
    });

// Restore a deleted lesson
export const restoreLesson = (courseSlug: string, sectionId: string, lessonId: string) =>
    apiFetch(`/${courseSlug}/sections/${sectionId}/lessons/${lessonId}/restore`, {
        method: 'PATCH',
    });
