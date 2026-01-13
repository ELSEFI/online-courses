import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Heart, MoreVertical, Clock } from 'lucide-react';

import { Course } from "@/services/api";
import { useGetMyCoursesQuery } from "@/store/api/courseApi";
import assetMap from './assetMap';

interface MyCoursesProps { }

export default function MyCourses({ }: MyCoursesProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'Courses' | 'Wishlist' | 'Completed'>('Courses');

    // RTK Query hook
    const { data: courses = [], isLoading } = useGetMyCoursesQuery(activeTab);


    // Helpers to render different card types
    const renderSalesCard = (course: Course) => (
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
                        <Heart size={16} className={`text-white ${activeTab === 'Wishlist' ? 'fill-white' : ''}`} />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-2 leading-tight group-hover:text-teal-600 transition-colors">{course.title}</h3>
                <p className="text-xs text-slate-400 mb-3">{course.instructor.name}</p>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {course.description || "More than 8yr Experience as Illustrator. Learn how to becoming professional Illustrator..."}
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
    );

    const renderLearningCard = (course: Course) => (
        <div
            key={course.id}
            onClick={() => navigate(`/learning/${course.id}`)}
            className="group bg-white rounded-[16px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col"
        >
            {/* Thumbnail */}
            <div className="bg-slate-200 h-[160px] relative overflow-hidden">
                <img src={assetMap[course.image] || course.image} alt={course.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3">
                    <button className="p-1 rounded-full bg-black/20 text-white hover:bg-black/40">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            <div className="p-4 flex flex-col gap-1">
                <h3 className="font-bold text-slate-900 text-[15px] leading-tight group-hover:text-teal-600 transition-colors">{course.title}</h3>
                <p className="text-xs text-slate-400 mb-2">{course.instructor.name}</p>

                <div className="mt-2">
                    <p className={`text-xs font-medium ${course.status === 'Completed' ? 'text-[#3dcbb1]' :
                        course.status === 'Not Started' ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                        {course.progress}
                    </p>

                    {course.status !== 'Not Started' && (
                        <div className="w-full h-1 bg-slate-100 rounded-full mt-2">
                            <div
                                className={`h-full rounded-full ${course.status === 'Completed' ? 'bg-[#3dcbb1]' : 'bg-teal-500'}`}
                                style={{ width: `${course.status === 'Completed' ? 100 : course.progressPercent || 30}%` }}
                            ></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );


    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 w-full mb-16">
            <div className="w-full max-w-[1200px] mx-auto px-4 py-8">

                {/* Page Title */}
                <div className="text-center mb-10">
                    <h1 className="text-[28px] font-bold text-slate-900 mb-6">My Course</h1>

                    {/* Tabs */}
                    <div className="flex justify-center items-center gap-8 border-b border-transparent">
                        {['Courses', 'Wishlist', 'Completed'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as 'Courses' | 'Wishlist' | 'Completed')}
                                className={`pb-2 text-sm font-medium transition-all relative px-2 ${activeTab === tab
                                    ? 'text-slate-900 font-bold after:content-[""] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-teal-500'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {isLoading ? (
                        <div className="col-span-full py-20 text-center text-slate-400">Loading courses...</div>
                    ) : (
                        courses.length > 0 ? (
                            courses.map((course: Course) => (
                                activeTab === 'Wishlist' ? renderSalesCard(course) : renderLearningCard(course)
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center text-slate-400">No courses found in this section.</div>
                        )
                    )}

                </div>

                {/* CTA Button */}
                <div className="flex justify-center mt-12 mb-20">
                    <Button
                        onClick={() => navigate('/search')}
                        className="h-12 px-8 bg-[#3dcbb1] hover:bg-[#34b39d] text-white font-bold rounded-[8px] text-base shadow-md shadow-teal-500/20"
                    >
                        Explore Courses
                    </Button>
                </div>

                {/* Newsletter Section */}
                <div className="bg-[#3b82f6] rounded-[20px] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 h-[220px]">
                    {/* Background deco */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -translate-x-1/2 translate-y-1/2 blur-2xl"></div>

                    <div className="relative z-10 text-white max-w-lg">
                        <h2 className="text-2xl md:text-3xl font-bold mb-2">Join and get amazing discount</h2>
                        <p className="text-blue-100 text-sm">With our responsive themes and mobile and desktop apps</p>
                    </div>

                    <div className="relative z-10 w-full max-w-md flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                placeholder="Email Address"
                                className="h-12 bg-white/20 border-0 placeholder:text-blue-100 text-white focus-visible:ring-0 rounded-[8px]"
                            />
                        </div>
                        <Button className="h-12 px-6 bg-[#3dcbb1] hover:bg-[#34b39d] text-white font-bold rounded-[8px]">
                            Subscribe
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
