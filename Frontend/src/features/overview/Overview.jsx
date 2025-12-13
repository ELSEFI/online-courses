import React, { useState, useEffect } from "react";
import { usersApi } from "../../api/users.api";
import { instructorsApi } from "../../api/instructors.api";
import { requestsApi } from "../../api/requests.api";
import {
  Eye,
  Users,
  GraduationCap,
  BookOpen,
  AlertCircle,
  Download,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal"; // we'll define Modal below as simple component
import EmptyState from "../../components/ui/EmptyState"; // define below
import LoadingSpinner from "../../components/ui/LoadingSpinner";

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

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [users, instructors, reqs] = await Promise.all([
        usersApi.getAll(),
        instructorsApi.getAll(),
        requestsApi.getAll(),
      ]);
      const reqArray = Array.isArray(reqs) ? reqs : [];
      setStats({
        users: Array.isArray(users) ? users.length : 0,
        instructors: Array.isArray(instructors) ? instructors.length : 0,
        courses: 0,
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
    if (!window.confirm("Approve?")) return;
    try {
      setProcessing(true);
      await requestsApi.approve(selectedRequest._id);
      setShowModal(false);
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to approve");
    } finally {
      setProcessing(false);
    }
  };

  const reject = async () => {
    if (!rejectReasons.en.trim() || !rejectReasons.ar.trim()) {
      alert("Provide both reasons");
      return;
    }
    if (!window.confirm("Reject?")) return;
    try {
      setProcessing(true);
      await requestsApi.reject(selectedRequest._id, {
        rejectionReason_en: rejectReasons.en,
        rejectionReason_ar: rejectReasons.ar,
      });
      setShowModal(false);
      setRejectReasons({ en: "", ar: "" });
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to reject");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard Overview</h1>
      {error && <div className="bg-red-800 p-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-white">
          {" "}
          <div className="flex justify-between">
            <div>
              <p className="text-sm">Total Users</p>
              <h3 className="text-3xl font-bold">{stats.users}</h3>
            </div>
            <Users className="w-12 h-12" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl p-6 text-white">
          {" "}
          <div className="flex justify-between">
            <div>
              <p className="text-sm">Total Instructors</p>
              <h3 className="text-3xl font-bold">{stats.instructors}</h3>
            </div>
            <GraduationCap className="w-12 h-12" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          {" "}
          <div className="flex justify-between">
            <div>
              <p className="text-sm">Total Courses</p>
              <h3 className="text-3xl font-bold">{stats.courses}</h3>
            </div>
            <BookOpen className="w-12 h-12" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-6 text-white">
          {" "}
          <div className="flex justify-between">
            <div>
              <p className="text-sm">Pending Requests</p>
              <h3 className="text-3xl font-bold">{stats.requests}</h3>
            </div>
            <AlertCircle className="w-12 h-12" />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 shadow">
        <h2 className="text-2xl font-bold text-white mb-4">
          Instructor Requests
        </h2>
        {requests.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No requests</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr
                    key={r._id}
                    className="border-b border-gray-700/50 hover:bg-gray-700/30"
                  >
                    <td className="p-3 text-white">
                      {r.userId?.name || "N/A"}
                    </td>
                    <td className="p-3 text-gray-300">
                      {r.userId?.email || "N/A"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                    <td className="p-3 text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <Button
                        onClick={() => viewRequest(r._id)}
                        variant="primary"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Request Details"
      >
        {selectedRequest && (
          <div>
            <p className="text-sm text-gray-400">Name</p>
            <p className="text-white">{selectedRequest.userId?.name}</p>
            <p className="text-sm text-gray-400 mt-4">Email</p>
            <p className="text-white">{selectedRequest.userId?.email}</p>

            <div className="mt-4">
              <label className="text-gray-400">Rejection Reason (EN)</label>
              <textarea
                value={rejectReasons.en}
                onChange={(e) =>
                  setRejectReasons((prev) => ({ ...prev, en: e.target.value }))
                }
                className="w-full bg-gray-700 text-white p-3 rounded mt-2"
                rows="3"
              />
            </div>
            <div className="mt-3">
              <label className="text-gray-400">Rejection Reason (AR)</label>
              <textarea
                value={rejectReasons.ar}
                onChange={(e) =>
                  setRejectReasons((prev) => ({ ...prev, ar: e.target.value }))
                }
                className="w-full bg-gray-700 text-white p-3 rounded mt-2"
                rows="3"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <Button onClick={approve} variant="success" disabled={processing}>
                {processing ? "Processing..." : "Accept"}
              </Button>
              <Button onClick={reject} variant="danger" disabled={processing}>
                {processing ? "Processing..." : "Reject"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
