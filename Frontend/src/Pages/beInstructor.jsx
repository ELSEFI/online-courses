import React, { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Briefcase,
  Award,
  CheckCircle,
  XCircle,
  Loader2,
  LogIn,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function BeInstructorForm() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    bio_ar: "",
    bio_en: "",
    experienceYears: "",
    jobTitle_ar: "",
    jobTitle_en: "",
    cvFile: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // { type: "success"|"error", message: "..." }

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setIsCheckingAuth(false);
  }, []);

  const handleLogin = () => {
    localStorage.setItem("returnTo", window.location.pathname);
    navigate("/login", { replace: true });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setErrors((prev) => ({ ...prev, cvFile: "File must be PDF format" }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          cvFile: "File size must be less than 5MB",
        }));
        return;
      }
      setFormData((prev) => ({ ...prev, cvFile: file }));
      setErrors((prev) => ({ ...prev, cvFile: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.bio_ar.trim()) newErrors.bio_ar = "Arabic bio is required";
    if (!formData.bio_en.trim()) newErrors.bio_en = "English bio is required";
    if (!formData.jobTitle_ar.trim())
      newErrors.jobTitle_ar = "Arabic job title is required";
    if (!formData.jobTitle_en.trim())
      newErrors.jobTitle_en = "English job title is required";
    if (!formData.experienceYears || formData.experienceYears < 0)
      newErrors.experienceYears = "Valid experience years required";
    if (!formData.cvFile) newErrors.cvFile = "CV file is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      formDataToSend.append("bio_ar", formData.bio_ar);
      formDataToSend.append("bio_en", formData.bio_en);
      formDataToSend.append("experienceYears", formData.experienceYears);
      formDataToSend.append("jobTitle_ar", formData.jobTitle_ar);
      formDataToSend.append("jobTitle_en", formData.jobTitle_en);
      formDataToSend.append("cv", formData.cvFile);

      const response = await fetch(
        "http://localhost:5000/api/v1/users/be-instructor",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({ type: "success", message: "Request Submitted Successfully!" });
        setTimeout(() => {
          setFormData({
            bio_ar: "",
            bio_en: "",
            experienceYears: "",
            jobTitle_ar: "",
            jobTitle_en: "",
            cvFile: null,
          });
          setSubmitStatus(null);
        }, 3000);
      } else {
        setSubmitStatus({ type: "error", message: data.message || "An Error Occurred" });
      }
    } catch (error) {
      setSubmitStatus({ type: "error", message: "An Error Occurred. Please try again." });
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 text-gray-100">
      <div className="max-w-4xl mx-auto">
        {isCheckingAuth ? (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
          </div>
        ) : !isLoggedIn ? (
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="max-w-md w-full">
              <div className="bg-gray-950 rounded-2xl shadow-2xl p-8 text-center border border-gray-800">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-6">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-100 mb-3">
                  Login Required
                </h2>
                <p className="text-gray-400 mb-8">
                  You need to be logged in to apply as an instructor. Please
                  sign in to continue.
                </p>
                <button
                  onClick={handleLogin}
                  className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 hover:scale-[1.02] flex items-center justify-center"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In to Continue
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-100 mb-3">
                Become an Instructor
              </h1>
              <p className="text-lg text-gray-400">
                Share your expertise and knowledge with thousands of students
                worldwide
              </p>
            </div>

            {/* Success/Error Status */}
            {submitStatus && submitStatus.type === "success" && (
              <div className="mb-8 bg-green-900/60 border-l-4 border-green-500 p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                  <div>
                    <h3 className="text-green-200 font-semibold">
                      {submitStatus.message}
                    </h3>
                    <p className="text-green-100 text-sm">
                      Your application will be reviewed shortly
                    </p>
                  </div>
                </div>
              </div>
            )}
            {submitStatus && submitStatus.type === "error" && (
              <div className="mb-8 bg-red-900/60 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <XCircle className="w-6 h-6 text-red-300 mr-3" />
                  <div>
                    <h3 className="text-red-200 font-semibold">
                      {submitStatus.message}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-950 rounded-2xl shadow-xl p-8 border border-gray-800">
              {/* Job Titles */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Briefcase className="w-5 h-5 text-indigo-400 mr-2" />
                  <h2 className="text-xl font-bold text-gray-100">Job Title</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {["en", "ar"].map((lang) => (
                    <div key={lang}>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Job Title ({lang === "en" ? "English" : "Arabic"}) *
                      </label>
                      <input
                        type="text"
                        name={`jobTitle_${lang}`}
                        value={formData[`jobTitle_${lang}`]}
                        onChange={handleInputChange}
                        placeholder={
                          lang === "en"
                            ? "e.g., Programming Instructor"
                            : "مثال: مدرس برمجة"
                        }
                        className={`w-full px-4 py-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-gray-900 text-gray-100 ${
                          errors[`jobTitle_${lang}`]
                            ? "border-red-500 bg-red-900/30"
                            : "border-gray-800 hover:border-indigo-500"
                        }`}
                      />
                      {errors[`jobTitle_${lang}`] && (
                        <p className="mt-2 text-sm text-red-400">
                          {errors[`jobTitle_${lang}`]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Years */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Number of years"
                  className={`w-full px-4 py-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-gray-900 text-gray-100 ${
                    errors.experienceYears
                      ? "border-red-500 bg-red-900/30"
                      : "border-gray-800 hover:border-indigo-500"
                  }`}
                />
                {errors.experienceYears && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.experienceYears}
                  </p>
                )}
              </div>

              {/* Bio Section */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <FileText className="w-5 h-5 text-indigo-400 mr-2" />
                  <h2 className="text-xl font-bold text-gray-100">Biography</h2>
                </div>
                {["en", "ar"].map((lang) => (
                  <div key={lang} className="mb-6">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Bio ({lang === "en" ? "English" : "Arabic"}) *
                    </label>
                    <textarea
                      name={`bio_${lang}`}
                      value={formData[`bio_${lang}`]}
                      onChange={handleInputChange}
                      rows="6"
                      placeholder={
                        lang === "en"
                          ? "Write about yourself and your experience..."
                          : "اكتب نبذة عنك وخبراتك..."
                      }
                      className={`w-full px-4 py-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-gray-900 text-gray-100 resize-none ${
                        errors[`bio_${lang}`]
                          ? "border-red-500 bg-red-900/30"
                          : "border-gray-800 hover:border-indigo-500"
                      }`}
                    />
                    {errors[`bio_${lang}`] && (
                      <p className="mt-2 text-sm text-red-400">
                        {errors[`bio_${lang}`]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* CV Upload */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Upload CV (PDF) *
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    errors.cvFile
                      ? "border-red-500 bg-red-900/30"
                      : "border-gray-800 hover:border-indigo-700 bg-gray-900/60"
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload
                    className={`w-12 h-12 mx-auto mb-3 ${
                      errors.cvFile ? "text-red-400" : "text-indigo-400"
                    }`}
                  />
                  <p className="text-gray-300 font-medium mb-1">
                    {formData.cvFile
                      ? formData.cvFile.name
                      : "Click or drag PDF file here"}
                  </p>
                  <p className="text-sm text-gray-500">Maximum size: 5MB</p>
                </div>
                {errors.cvFile && (
                  <p className="mt-2 text-sm text-red-400">{errors.cvFile}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Application
                  </>
                )}
              </button>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-gray-900 rounded-xl p-6 shadow-md border-t-4 border-blue-600">
                <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-bold text-gray-100 mb-2">
                  Share Knowledge
                </h3>
                <p className="text-sm text-gray-400">
                  Teach thousands of students what you've learned over the years
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 shadow-md border-t-4 border-purple-600">
                <div className="w-12 h-12 bg-purple-800 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-bold text-gray-100 mb-2">
                  Work Flexibility
                </h3>
                <p className="text-sm text-gray-400">
                  Set your own schedule and work from anywhere
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 shadow-md border-t-4 border-indigo-600">
                <div className="w-12 h-12 bg-indigo-800 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="font-bold text-gray-100 mb-2">Extra Income</h3>
                <p className="text-sm text-gray-400">
                  Earn money from your expertise and experience
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
