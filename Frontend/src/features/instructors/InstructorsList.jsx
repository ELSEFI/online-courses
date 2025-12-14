import React, { useState, useEffect } from "react";
import { instructorsApi } from "../../api/instructors.api";
import { Search, UserPlus, Star, Briefcase } from "lucide-react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/toast/ToastContext";
import { useConfirm } from "../../components/ui/confirm/ConfirmContext";

export default function InstructorsList() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInstructor, setNewInstructor] = useState({
    name: "",
    email: "",
    password: "",
    bioEn: "",
    bioAr: "",
    jobTitleEn: "",
    jobTitleAr: "",
    experienceYears: "",
    cvFile: null,
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const d = await instructorsApi.getAll();
      setItems(Array.isArray(d) ? d : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load instructors");
      toast.error("Failed to load instructors");
    } finally {
      setLoading(false);
    }
  };

  const view = async (id) => {
    try {
      setError(null);
      const d = await instructorsApi.getById(id);
      setSelected(d);
    } catch (err) {
      console.error(err);
      setError("Failed to load instructor");
      toast.error("Failed to load instructor details");
    }
  };

  const addInstructor = async () => {
    const {
      name,
      email,
      password,
      bioEn,
      bioAr,
      jobTitleEn,
      jobTitleAr,
      experienceYears,
      cvFile,
    } = newInstructor;

    if (
      !name ||
      !email ||
      !password ||
      !bioEn ||
      !bioAr ||
      !jobTitleEn ||
      !jobTitleAr ||
      !experienceYears ||
      !cvFile
    ) {
      toast.warning("All fields including CV file are required");
      return;
    }

    try {
      setProcessing(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("bioEn", bioEn);
      formData.append("bioAr", bioAr);
      formData.append("jobTitleEn", jobTitleEn);
      formData.append("jobTitleAr", jobTitleAr);
      formData.append("experienceYears", experienceYears);
      formData.append("cvFile", cvFile);

      await instructorsApi.add(formData);
      setShowAddModal(false);
      setNewInstructor({
        name: "",
        email: "",
        password: "",
        bioEn: "",
        bioAr: "",
        jobTitleEn: "",
        jobTitleAr: "",
        experienceYears: "",
        cvFile: null,
      });
      await load();
      toast.success("Instructor added successfully!");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add instructor");
      toast.error(err.response?.data?.message || "Failed to add instructor");
    } finally {
      setProcessing(false);
    }
  };

  const remove = async (id) => {
    const confirmed = await confirm({
      title: "Remove Instructor",
      message:
        "Are you sure you want to remove this instructor? This action cannot be undone!",
      confirmText: "Yes, Remove Instructor",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      setProcessing(true);
      await instructorsApi.remove(id);
      await load();
      setSelected(null);
      toast.success("Instructor removed successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to remove instructor");
      toast.error("Failed to remove instructor");
    } finally {
      setProcessing(false);
    }
  };

  const filtered = items.filter(
    (inst) =>
      (inst.userId?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (inst.userId?.email || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          Instructors Management
        </h1>
        <Button onClick={() => setShowAddModal(true)} variant="success">
          <UserPlus size={18} className="inline mr-2" />
          Add Instructor
        </Button>
      </div>

      {error && (
        <div className="bg-red-800/20 border border-red-800 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search instructors by name or email..."
          className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700"
        />
      </div>

      {/* Instructors Table */}
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">No instructors found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="p-3 lg:p-4 text-left text-gray-300 font-semibold">
                    Name
                  </th>
                  <th className="p-3 lg:p-4 text-left text-gray-300 font-semibold hidden sm:table-cell">
                    Email
                  </th>
                  <th className="p-3 lg:p-4 text-left text-gray-300 font-semibold hidden lg:table-cell">
                    Job Title
                  </th>
                  <th className="p-3 lg:p-4 text-left text-gray-300 font-semibold hidden md:table-cell">
                    Experience
                  </th>
                  <th className="p-3 lg:p-4 text-left text-gray-300 font-semibold">
                    Rating
                  </th>
                  <th className="p-3 lg:p-4 text-center text-gray-300 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filtered.map((i) => (
                  <tr
                    key={i._id}
                    className="hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="p-3 lg:p-4">
                      <div>
                        <p className="text-white font-medium">
                          {i.userId?.name || "N/A"}
                        </p>
                        <p className="text-gray-400 text-sm sm:hidden">
                          {i.userId?.email || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="p-3 lg:p-4 text-gray-300 hidden sm:table-cell">
                      {i.userId?.email || "N/A"}
                    </td>
                    <td className="p-3 lg:p-4 text-gray-300 hidden lg:table-cell">
                      {i.jobTitle?.en || "N/A"}
                    </td>
                    <td className="p-3 lg:p-4 text-gray-400 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} />
                        {i.experienceYears} years
                      </div>
                    </td>
                    <td className="p-3 lg:p-4">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star size={16} fill="currentColor" />
                        <span className="font-medium">{i.rating || 0}</span>
                      </div>
                    </td>
                    <td className="p-3 lg:p-4 text-center">
                      <Button onClick={() => view(i._id)} className="text-sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Instructor Details Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Instructor Details"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Name</label>
                <p className="text-white font-medium">
                  {selected.userId?.name}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="text-white font-medium">
                  {selected.userId?.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/30 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Experience</p>
                <p className="text-white text-xl font-bold">
                  {selected.experienceYears} years
                </p>
              </div>
              <div className="bg-gray-700/30 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Rating</p>
                <p className="text-yellow-400 text-xl font-bold flex items-center gap-1">
                  <Star size={20} fill="currentColor" />
                  {selected.rating || 0}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400">Job Title (EN)</label>
              <p className="text-white">{selected.jobTitle?.en || "N/A"}</p>
            </div>

            <div>
              <label className="text-sm text-gray-400">Bio (EN)</label>
              <p className="text-gray-300 text-sm">
                {selected.bio?.en || "N/A"}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <Button
                onClick={() => remove(selected._id)}
                variant="danger"
                disabled={processing}
                className="w-full"
              >
                {processing ? "Processing..." : "Remove Instructor"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Instructor Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewInstructor({
            name: "",
            email: "",
            password: "",
            bioEn: "",
            bioAr: "",
            jobTitleEn: "",
            jobTitleAr: "",
            experienceYears: "",
            cvFile: null,
          });
        }}
        title="Add New Instructor"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Name *</label>
              <input
                type="text"
                value={newInstructor.name}
                onChange={(e) =>
                  setNewInstructor({ ...newInstructor, name: e.target.value })
                }
                className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Email *
              </label>
              <input
                type="email"
                value={newInstructor.email}
                onChange={(e) =>
                  setNewInstructor({ ...newInstructor, email: e.target.value })
                }
                className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter email"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">
              Password *
            </label>
            <input
              type="password"
              value={newInstructor.password}
              onChange={(e) =>
                setNewInstructor({ ...newInstructor, password: e.target.value })
              }
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter password"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Job Title (EN) *
              </label>
              <input
                type="text"
                value={newInstructor.jobTitleEn}
                onChange={(e) =>
                  setNewInstructor({
                    ...newInstructor,
                    jobTitleEn: e.target.value,
                  })
                }
                className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Senior Developer"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Job Title (AR) *
              </label>
              <input
                type="text"
                value={newInstructor.jobTitleAr}
                onChange={(e) =>
                  setNewInstructor({
                    ...newInstructor,
                    jobTitleAr: e.target.value,
                  })
                }
                className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="مثال: مطور أول"
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">
              Experience Years *
            </label>
            <input
              type="number"
              value={newInstructor.experienceYears}
              onChange={(e) =>
                setNewInstructor({
                  ...newInstructor,
                  experienceYears: e.target.value,
                })
              }
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter years of experience"
              min="0"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">
              Bio (EN) *
            </label>
            <textarea
              value={newInstructor.bioEn}
              onChange={(e) =>
                setNewInstructor({ ...newInstructor, bioEn: e.target.value })
              }
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="3"
              placeholder="Enter bio in English"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">
              Bio (AR) *
            </label>
            <textarea
              value={newInstructor.bioAr}
              onChange={(e) =>
                setNewInstructor({ ...newInstructor, bioAr: e.target.value })
              }
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="3"
              placeholder="أدخل السيرة الذاتية بالعربية"
              dir="rtl"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">
              CV File *
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) =>
                setNewInstructor({
                  ...newInstructor,
                  cvFile: e.target.files[0],
                })
              }
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700"
            />
            <p className="text-gray-500 text-xs mt-1">
              Accepted formats: PDF, DOC, DOCX
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={addInstructor}
              variant="success"
              disabled={processing}
              className="flex-1"
            >
              {processing ? "Adding..." : "Add Instructor"}
            </Button>
            <Button
              onClick={() => {
                setShowAddModal(false);
                setNewInstructor({
                  name: "",
                  email: "",
                  password: "",
                  bioEn: "",
                  bioAr: "",
                  jobTitleEn: "",
                  jobTitleAr: "",
                  experienceYears: "",
                  cvFile: null,
                });
              }}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
