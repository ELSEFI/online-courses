import React from "react";
import { BookOpen, Clock } from "lucide-react";

export default function CoursesList() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-6 max-w-md">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-purple-600/20 rounded-full flex items-center justify-center">
              <BookOpen size={48} className="text-purple-500" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <Clock size={16} className="text-white" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            Courses Management
          </h2>
          <p className="text-xl text-purple-400 font-semibold">Coming Soon!</p>
          <p className="text-gray-400 text-base lg:text-lg">
            We're working hard to bring you an amazing course management system.
            Stay tuned for updates!
          </p>
        </div>

        {/* Decoration */}
        <div className="flex justify-center gap-2 pt-4">
          <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
