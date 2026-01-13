const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const InstructorRequest = require("../models/instructorRequest");
const Message = require("../models/contactWithUs");
const mongoose = require("mongoose");

exports.getStats = async (req, res) => {
    const userStats = await User.aggregate([
        {
            $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                usersCount: {
                    $sum: {
                        $cond: [{ $eq: ["$role", "user"] }, 1, 0]
                    }
                },
                instructorsCount: {
                    $sum: {
                        $cond: [{ $eq: ["$role", "instructor"] }, 1, 0]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalUsers: 1,
                usersCount: 1,
                instructorsCount: 1
            }
        }
    ]);
    const courseStats = await Course.aggregate([
        {
            $group: {
                _id: null,
                totalCourses: { $sum: 1 },
                publishedCourses: {
                    $sum: {
                        $cond: [{ $eq: ["$isPublished", true] }, 1, 0]
                    }
                },
                pendingCourses: {
                    $sum: {
                        $cond: [{ $eq: ["$isPublished", false] }, 1, 0]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalCourses: 1,
                publishedCourses: 1,
                pendingCourses: 1
            }
        }
    ]);

    const enrollmentsStats = await Enrollment.aggregate([
        {
            $group: {
                _id: null,
                totalEnrollments: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                totalEnrollments: 1
            }
        }
    ]);

    const messagesStats = await Message.aggregate([
        {
            $group: {
                _id: null,
                totalMessages: { $sum: 1 },
            }
        },
        {
            $project: {
                _id: 0,
                totalMessages: 1,
            }
        }
    ]);

    const instructorRequestsStats = await InstructorRequest.aggregate([
        {
            $group: {
                _id: null,
                totalRequests: { $sum: 1 },
                pendingRequests: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "pending"] }, 1, 0]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalRequests: 1,
                pendingRequests: 1
            }
        }
    ]);

    res.status(200).json({
        status: "success",
        users: userStats[0],
        courses: courseStats[0],
        enrollments: enrollmentsStats[0],
        messages: messagesStats[0],
        instructorRequests: instructorRequestsStats[0]
    });
};
