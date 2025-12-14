import React, { useState, useEffect } from "react";
import { usersApi } from "../../api/users.api";
import { instructorsApi } from "../../api/instructors.api";
import { requestsApi } from "../../api/requests.api";
import { Users, GraduationCap, BookOpen, AlertCircle, Eye } from "lucide-react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/toast/ToastContext";
import { useConfirm } from "../../components/ui/confirm/ConfirmContext";

export default function Overview() {
  const [stats, setStats] = useState({
    users: 0,
    instructors: 0,
    courses: 0,
    requests: 0,
  });
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReasons, setRejectReasons] = useState({ en: "", ar: "" });
  const [loading, setLoading] = useState(true);
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
      const [users, instructors, reqs] = await Promise.all([
        usersApi.getAll().catch(() => []),
        instructorsApi.getAll().catch(() => []),
        requestsApi.getAll().catch(() => []),
      ]);
      const reqArray = Array.isArray(reqs) ? reqs : [];
      setStats({
        users: Array.isArray(users) ? users.length : 0,
        instructors: Array.isArray(instructors) ? instructors.length : 0,
        courses: 0, // Coming Soon
        requests: reqArray.filter((r) => r.status === "pending").length,
      });
      setRequests(reqArray);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const viewRequest = async (id) => {
    try {
      const res = await requestsApi.getById(id);
      setSelectedRequest(res.request || res);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      setError("Failed to load request");
    }
  };

  const approve = async () => {
    if (!selectedRequest) return;

    const confirmed = await confirm({
      title: "Approve Instructor Request",
      message: "Are you sure you want to approve this instructor request?",
      confirmText: "Yes, Approve",
      variant: "info",
    });

    if (!confirmed) return;

    try {
      setProcessing(true);
      await requestsApi.approve(selectedRequest._id);
      setShowModal(false);
      await load();
      toast.success("Request approved successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to approve");
      toast.error("Failed to approve request");
    } finally {
      setProcessing(false);
    }
  };

  const reject = async () => {
    if (!rejectReasons.en.trim() || !rejectReasons.ar.trim()) {
      toast.warning("Please provide rejection reasons in both languages");
      return;
    }

    const confirmed = await confirm({
      title: "Reject Instructor Request",
      message: "Are you sure you want to reject this instructor request?",
      confirmText: "Yes, Reject",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      setProcessing(true);
      await requestsApi.reject(selectedRequest._id, {
        rejectionReason_en: rejectReasons.en,
        rejectionReason_ar: rejectReasons.ar,
      });
      setShowModal(false);
      setRejectReasons({ en: "", ar: "" });
      await load();
      toast.success("Request rejected successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to reject");
      toast.error("Failed to reject request");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-white">
        Dashboard Overview
      </h1>

      {error && (
        <div className="bg-red-800/20 border border-red-800 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Users</p>
              <h3 className="text-3xl font-bold">{stats.users}</h3>
            </div>
            <Users className="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Instructors</p>
              <h3 className="text-3xl font-bold">{stats.instructors}</h3>
            </div>
            <GraduationCap className="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Courses</p>
              <h3 className="text-3xl font-bold">{stats.courses}</h3>
            </div>
            <BookOpen className="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90 mb-1">Pending Requests</p>
              <h3 className="text-3xl font-bold">{stats.requests}</h3>
            </div>
            <AlertCircle className="w-10 h-10 opacity-80" />
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-700">
          <h2 className="text-xl lg:text-2xl font-bold text-white">
            Instructor Requests
          </h2>
        </div>

        <div className="overflow-x-auto">
          {requests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No requests available</p>
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
                  <th className="p-3 lg:p-4 text-left text-gray-300 font-semibold">
                    Status
                  </th>
                  <th className="p-3 lg:p-4 text-left text-gray-300 font-semibold hidden md:table-cell">
                    Date
                  </th>
                  <th className="p-3 lg:p-4 text-center text-gray-300 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {requests.map((r) => (
                  <tr
                    key={r._id}
                    className="hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="p-3 lg:p-4 text-white">
                      {r.userId?.name || "N/A"}
                    </td>
                    <td className="p-3 lg:p-4 text-gray-300 hidden sm:table-cell">
                      {r.userId?.email || "N/A"}
                    </td>
                    <td className="p-3 lg:p-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          r.status === "pending"
                            ? "bg-yellow-600/20 text-yellow-400"
                            : r.status === "approved"
                            ? "bg-green-600/20 text-green-400"
                            : "bg-red-600/20 text-red-400"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 lg:p-4 text-gray-400 hidden md:table-cell">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 lg:p-4 text-center">
                      <Button
                        onClick={() => viewRequest(r._id)}
                        className="text-sm"
                      >
                        <Eye size={16} className="inline mr-1" />
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

      {/* Request Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setRejectReasons({ en: "", ar: "" });
        }}
        title="Request Details"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Name</label>
              <p className="text-white font-medium">
                {selectedRequest.userId?.name}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-400">Email</label>
              <p className="text-white font-medium">
                {selectedRequest.userId?.email}
              </p>
            </div>

            {selectedRequest.cvURL && (
              <div>
                <label className="text-sm text-gray-400">CV File</label>
                <a
                  href={selectedRequest.cvURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline block"
                >
                  View CV
                </a>
              </div>
            )}

            {selectedRequest.status === "pending" && (
              <>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">
                    Rejection Reason (English)
                  </label>
                  <textarea
                    value={rejectReasons.en}
                    onChange={(e) =>
                      setRejectReasons((prev) => ({
                        ...prev,
                        en: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    placeholder="Enter rejection reason in English..."
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">
                    Rejection Reason (Arabic)
                  </label>
                  <textarea
                    value={rejectReasons.ar}
                    onChange={(e) =>
                      setRejectReasons((prev) => ({
                        ...prev,
                        ar: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    placeholder="أدخل سبب الرفض بالعربية..."
                    dir="rtl"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={approve}
                    variant="success"
                    disabled={processing}
                    className="flex-1"
                  >
                    {processing ? "Processing..." : "Approve Request"}
                  </Button>
                  <Button
                    onClick={reject}
                    variant="danger"
                    disabled={processing}
                    className="flex-1"
                  >
                    {processing ? "Processing..." : "Reject Request"}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
