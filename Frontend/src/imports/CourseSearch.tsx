import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';

import { Course, Module, Lesson, CATEGORIES } from "@/services/api";
import { useSearchCoursesQuery } from "@/store/api/courseApi";
import assetMap from '../imports/assetMap';

interface CourseSearchProps { }

export default function CourseSearch({ }: CourseSearchProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || "");
    const [filters, setFilters] = useState({});

    // RTK Query hook
    const { data: courses = [], isLoading } = useSearchCoursesQuery({ query: searchQuery, filters });


    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 w-full mb-16">

            {/* Header Info Bar */}
            <div className="bg-white border-b border-slate-100 py-4 mb-8">
                <div className="w-full max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="font-bold text-slate-900">Filter</span>
                        <span>Showing {courses.length} Results</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">Sort by:</span>
                        <Select defaultValue="popular">
                            <SelectTrigger className="w-[180px] bg-white border-slate-200">
                                <SelectValue placeholder="Sort order" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="popular">Most Popular</SelectItem>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="rated">Highest Rated</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <main className="w-full max-w-[1200px] mx-auto px-4 flex flex-col lg:flex-row gap-12">

                {/* LEFT SIDEBAR - FILTERS */}
                <div className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-8">

                    {/* Rating Filter */}
                    <Accordion type="single" collapsible defaultValue="rating" className="w-full">
                        <AccordionItem value="rating" className="border-b-0">
                            <AccordionTrigger className="hover:no-underline py-2 text-base font-bold text-slate-900">Rating</AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-col gap-3 pt-2">
                                    {[5, 4, 3, 2, 1].map((stars) => (
                                        <div key={stars} className="flex items-center gap-3">
                                            <Checkbox id={`rating-${stars}`} className="rounded-[4px] border-slate-300 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500" />
                                            <label htmlFor={`rating-${stars}`} className="flex items-center gap-1 cursor-pointer">
                                                <div className="flex text-[#ffbd2e]">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} className={i < stars ? "fill-current" : "text-slate-200 fill-current"} />
                                                    ))}
                                                </div>
                                                <span className="text-slate-400 text-sm ml-1">{stars} Star</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <div className="h-[1px] bg-slate-100 w-full" />

                    {/* Duration Filter */}
                    <Accordion type="single" collapsible defaultValue="duration" className="w-full">
                        <AccordionItem value="duration" className="border-b-0">
                            <AccordionTrigger className="hover:no-underline py-2 text-base font-bold text-slate-900">Video Duration</AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-col gap-3 pt-2">
                                    {["0-1 Hour", "1-3 Hours", "3-6 Hours", "6-18 Hours", "18+ Hours"].map((label, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Checkbox id={`dur-${i}`} className="rounded-[4px] border-slate-300 data-[state=checked]:bg-teal-500" />
                                            <label htmlFor={`dur-${i}`} className="text-slate-600 text-sm cursor-pointer">{label}</label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <div className="h-[1px] bg-slate-100 w-full" />

                    {/* Category Filter (Dynamic) */}
                    <Accordion type="single" collapsible defaultValue="category" className="w-full">
                        <AccordionItem value="category" className="border-b-0">
                            <AccordionTrigger className="hover:no-underline py-2 text-base font-bold text-slate-900">Category</AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-col gap-3 pt-2">
                                    {CATEGORIES.map((cat) => (
                                        <div key={cat.id} className="flex items-center gap-3">
                                            <Checkbox id={`cat-${cat.id}`} className="rounded-[4px] border-slate-300 data-[state=checked]:bg-teal-500" />
                                            <label htmlFor={`cat-${cat.id}`} className="text-slate-600 text-sm cursor-pointer">{cat.name}</label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                </div>

                {/* RIGHT COLUMN - RESULTS GRID */}
                <div className="flex-1 flex flex-col">

                    {/* Course Grid */}
                    {isLoading ? (
                        <div className="bg-slate-50 rounded p-10 text-center text-slate-500">Loading results...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
                            {courses.map((course: Course) => (
                                <div
                                    key={course.id}
                                    onClick={() => navigate(`/courses/${course.id}`)}
                                    className="group bg-white rounded-[16px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col"
                                >
                                    {/* Image Container */}
                                    <div className="relative h-[180px] bg-slate-200 overflow-hidden">
                                        <img src={assetMap[course.image] || course.image} alt={course.title} className="w-full h-full object-cover" />

                                        <div className="absolute top-3 left-3 flex gap-2">
                                            {course.badge && <Badge className={`${course.badgeColor} text-white border-0 text-[10px] px-2`}>{course.badge}</Badge>}
                                            {course.discount && <Badge className="bg-[#a04ae3] text-white border-0 text-[10px] px-2">{course.discount}</Badge>}
                                        </div>
                                        <div className="absolute top-3 right-3">
                                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-colors">
                                                <Heart size={16} className="text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 flex flex-col flex-1">
                                        <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-2 leading-tight group-hover:text-teal-600 transition-colors">{course.title}</h3>
                                        <p className="text-xs text-slate-400 mb-3">{course.instructor.name}</p>

                                        <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                                            {course.description || "Learn professional skills from top industry experts with this comprehensive course."}
                                        </p>

                                        <div className="mt-auto">
                                            <div className="flex items-center gap-1 mb-2">
                                                <div className="flex text-[#ffbd2e]">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <svg key={star} className={`w-3 h-3 ${star <= Math.floor(course.rating || 0) ? 'fill-current' : 'text-slate-200 fill-current'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                    ))}
                                                </div>
                                                <span className="text-xs text-slate-400">({course.reviewsCount})</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 text-lg">${course.price}</span>
                                                <span className="text-xs text-slate-400 line-through">${course.originalPrice}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="flex justify-center mb-16">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="w-10 h-10 rounded-full border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-500">
                                <ChevronLeft size={20} />
                            </Button>
                            <Button variant="outline" className="w-10 h-10 rounded-full bg-teal-500 text-white border-teal-500 hover:bg-teal-600 hover:text-white">1</Button>
                            <Button variant="outline" className="w-10 h-10 rounded-full border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600">2</Button>
                            <Button variant="outline" className="w-10 h-10 rounded-full border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600">3</Button>
                            <span className="text-slate-400">...</span>
                            <Button variant="outline" size="icon" className="w-10 h-10 rounded-full border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-500">
                                <ChevronRight size={20} />
                            </Button>
                        </div>
                    </div>

                    {/* Promo Banner */}
                    <div className="w-full bg-[#1e293b] rounded-[16px] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 h-auto md:h-[200px]">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>

                        <div className="relative z-10 max-w-lg">
                            <h2 className="text-2xl font-bold text-white mb-2">Join Klevr now</h2>
                            <p className="text-slate-400 text-sm">Join to get more info course or you can be an instructor.</p>
                        </div>

                        <div className="relative z-10">
                            <Button className="h-12 px-8 bg-[#3dcbb1] hover:bg-[#34b39d] text-white font-bold rounded-[8px]">
                                Get Started
                            </Button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
