import {
    Activity,
    Book,
    Code,
    Palette,
    PenTool,
    Smartphone
} from "lucide-react";

// api.ts - Centralized Layout for Data Services

// ----------------------------------------------------------------------
// TYPES & INTERFACES
// ----------------------------------------------------------------------

export interface Instructor {
    id: number | string;
    name: string;
    role: string;
    image: string; // Asset key or URL
    bio?: string;
    coursesCount?: number;
    studentsCount?: string;
}

export interface Lesson {
    id: string;
    title: string;
    duration: string;
    isCompleted: boolean;
    isLocked: boolean;
    isPreview?: boolean;
    type: 'video' | 'quiz' | 'reading';
}

export interface Module {
    id: string;
    title: string;
    description?: string;
    lessons: Lesson[];
    duration?: string;
}

export interface Review {
    id: string;
    user: string;
    userImage?: string;
    rating: number;
    comment: string;
    date: string;
}

export interface Course {
    id: string | number;
    title: string;
    instructor: Instructor;

    // Listing Props
    image: string;
    price: number;
    originalPrice: number;
    rating: number;
    reviewsCount: string;
    badge?: string;
    badgeColor?: string;
    discount?: string;

    // Details Props
    description?: string;
    longDescription?: string;
    language?: string;
    duration?: string;
    enrolled?: string;
    updatedAt?: string;
    level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';

    // Learning Props
    progress?: string; // e.g., "4/10"
    progressPercent?: number;
    status?: 'Not Started' | 'In Progress' | 'Completed';

    // Content
    modules?: Module[];
    tags?: string[];
    category?: string;
}

export interface Category {
    id: string;
    name: string;
    subcategories: { title: string; desc: string }[];
}

export interface FilterOptions {
    rating?: number;
    duration?: string[];
    categories?: string[];
    level?: string;
}

// ----------------------------------------------------------------------
// MOCK DATA CONSTANTS
// ----------------------------------------------------------------------

export const CATEGORIES: Category[] = [
    {
        id: "design",
        name: "Design",
        subcategories: [
            { title: "Illustration", desc: "Learn how to draw and illustrate" },
            { title: "Graphic Design", desc: "Learn how to design visually" },
            { title: "UI/UX Design", desc: "Learn design for web and apps" }
        ]
    },
    {
        id: "programming",
        name: "Programming",
        subcategories: [
            { title: "Web Development", desc: "HTML, CSS, React, and more" },
            { title: "Mobile Apps", desc: "iOS and Android development" },
            { title: "Data Science", desc: "Python, R, and Machine Learning" }
        ]
    },
    { id: "business", name: "Business & Marketing", subcategories: [] },
    { id: "photo", name: "Photo & Video", subcategories: [] },
    { id: "writing", name: "Writing", subcategories: [] },
    { id: "finance", name: "Finance", subcategories: [] },
    { id: "music", name: "Music & Film", subcategories: [] },
];

const MOCK_INSTRUCTORS = {
    kitani: { id: 101, name: "Kitani Studio", role: "Expert Design Team", image: "imgPlaceholder2", coursesCount: 12, studentsCount: "45K" },
    alex: { id: 102, name: "Alexander Bastian", role: "Sr Software Engineer", image: "imgPlaceholder3" },
    steven: { id: 103, name: "Steven Arnautovic", role: "Mobile Developer", image: "imgPlaceholder5" },
    jonathan: { id: 104, name: "Jonathan Doe", role: "Financial Advisor", image: "imgPlaceholder6" }
};

const MOCK_COURSES: Course[] = [
    {
        id: '1',
        title: 'Make Uber Clone App',
        instructor: MOCK_INSTRUCTORS.steven,
        image: 'imgPlaceholder2',
        rating: 4.8,
        reviewsCount: '1.2k',
        price: 24.92,
        originalPrice: 32.90,
        badge: 'Best Seller',
        badgeColor: 'bg-teal-500',
        discount: '20% OFF',
        category: 'Programming',
        level: 'Intermediate',
        duration: '12h 40m',
        description: 'Build a full-stack Uber clone using React Native, AWS Amplify, and GraphQL. Complete guide from zero to hero.'
    },
    {
        id: '2',
        title: 'Mobile Dev React Native',
        instructor: MOCK_INSTRUCTORS.kitani,
        image: 'imgPlaceholder3',
        rating: 4.7,
        reviewsCount: '850',
        price: 24.92,
        originalPrice: 32.90,
        badge: 'Best Seller',
        badgeColor: 'bg-teal-500',
        discount: '20% OFF',
        category: 'Programming',
        level: 'Beginner',
        duration: '8h 15m'
    },
    {
        id: '3',
        title: 'Vue Javascript Course',
        instructor: MOCK_INSTRUCTORS.kitani,
        image: 'imgPlaceholder4',
        rating: 4.9,
        reviewsCount: '2.1k',
        price: 24.92,
        originalPrice: 32.90,
        badge: 'Best Seller',
        badgeColor: 'bg-orange-500',
        discount: '20% OFF',
        category: 'Programming'
    },
    {
        id: '4',
        title: 'Adobe Illustrator Scratch Course',
        instructor: MOCK_INSTRUCTORS.kitani,
        image: 'imgPlaceholder7',
        rating: 4.8,
        reviewsCount: '1.5k',
        price: 24.92,
        originalPrice: 32.90,
        badge: 'New',
        badgeColor: 'bg-blue-500',
        discount: '15% OFF',
        category: 'Design'
    },
    {
        id: '5',
        title: 'UI Design for Beginners',
        instructor: MOCK_INSTRUCTORS.kitani,
        image: 'imgPlaceholder5',
        rating: 4.6,
        reviewsCount: '500',
        price: 19.99,
        originalPrice: 24.99,
        badge: 'Best Seller',
        badgeColor: 'bg-teal-500',
        category: 'Design'
    },
    {
        id: '101',
        title: 'Website Dev Zero to Hero',
        instructor: MOCK_INSTRUCTORS.kitani,
        image: 'imgPlaceholder6',
        // Learning State overrides
        status: 'In Progress',
        progress: '4/10 Videos Completed',
        progressPercent: 40,
        rating: 0, reviewsCount: '0', price: 0, originalPrice: 0 // Mock fillers
    },
    {
        id: '102',
        title: 'Wordpress Course Intermediate',
        instructor: MOCK_INSTRUCTORS.kitani,
        image: 'imgPlaceholder3',
        status: 'Completed',
        progress: 'Completed',
        progressPercent: 100,
        rating: 0, reviewsCount: '0', price: 0, originalPrice: 0
    }
];

const MOCK_MODULES: Module[] = [
    {
        id: "m1",
        title: "Introduction to Design",
        duration: "45 min",
        lessons: [
            { id: "l1", title: "What is Design Thinking?", duration: "10:30", isCompleted: true, isLocked: false, type: 'video' },
            { id: "l2", title: "Understanding the User", duration: "15:00", isCompleted: true, isLocked: false, type: 'video' },
            { id: "l3", title: "Quiz: Design Basics", duration: "5:00", isCompleted: false, isLocked: false, type: 'quiz' }
        ]
    },
    {
        id: "m2",
        title: "Wireframing & Prototyping",
        duration: "1h 30min",
        lessons: [
            { id: "l4", title: "Tools of the Trade", duration: "12:00", isCompleted: false, isLocked: false, type: 'video' },
            { id: "l5", title: "Creating your first wireframe", duration: "25:00", isCompleted: false, isLocked: true, type: 'video' }
        ]
    }
];

// ----------------------------------------------------------------------
// SERVICE METHODS
// ----------------------------------------------------------------------

export const courseService = {
    // HOMEPAGE
    getActiveCourses: async (): Promise<Course[]> => {
        return delay(MOCK_COURSES.filter(c => c.status === 'In Progress' || c.status === 'Not Started').slice(0, 3));
    },
    getStudioCourses: async (): Promise<Course[]> => {
        return delay(MOCK_COURSES.filter(c => !c.status).slice(0, 4));
    },
    getTrendingCourses: async (): Promise<Course[]> => {
        return delay(MOCK_COURSES.slice(1, 5));
    },
    getInstructors: async (): Promise<Instructor[]> => {
        return delay(Object.values(MOCK_INSTRUCTORS));
    },

    // DETAILS & SEARCH
    getAllCourses: async (): Promise<Course[]> => {
        return delay(MOCK_COURSES.filter(c => !c.status)); // Only sales courses
    },
    searchCourses: async (query: string, filters: FilterOptions): Promise<Course[]> => {
        // Mock filtering logic can be added here
        console.log(`Searching for "${query}" with filters:`, filters);
        return delay(MOCK_COURSES.filter(c => !c.status));
    },
    getCourseDetails: async (id: string): Promise<Course | undefined> => {
        const course = MOCK_COURSES.find(c => c.id === id) || MOCK_COURSES[0];
        // Inject modules just for the mock detail return
        return delay({ ...course, modules: MOCK_MODULES });
    },

    // MY COURSES
    getMyCourses: async (tab: 'Courses' | 'Wishlist' | 'Completed'): Promise<Course[]> => {
        if (tab === 'Wishlist') return delay(MOCK_COURSES.slice(2, 4));
        if (tab === 'Completed') return delay(MOCK_COURSES.filter(c => c.status === 'Completed'));
        return delay(MOCK_COURSES.filter(c => c.status === 'In Progress' || c.status === 'Not Started'));
    }
};

// Start Helper
function delay<T>(data: T, ms: number = 500): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(data), ms));
}
