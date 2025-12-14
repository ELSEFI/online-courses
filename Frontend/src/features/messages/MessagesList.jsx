import React, { useState, useEffect } from "react";
import { messagesApi } from "../../api/messages.api";
import { Mail, Trash2, Send } from "lucide-react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/toast/ToastContext";
import { useConfirm } from "../../components/ui/confirm/ConfirmContext";

export default function MessagesList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
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
      const d = await messagesApi.getAll();
      setItems(Array.isArray(d) ? d : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load messages");
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const view = async (id) => {
    try {
      setError(null);
      const d = await messagesApi.getById(id);
      setSelected(d);
    } catch (err) {
      console.error(err);
      setError("Failed to load message");
      toast.error("Failed to load message details");
    }
  };

  const sendReply = async () => {
    if (!reply.trim()) {
      toast.warning("Please enter a reply message");
      return;
    }
    try {
      setProcessing(true);
      await messagesApi.reply(selected._id, { reply });
      toast.success("Reply sent successfully!");
      setReply("");
      setSelected(null);
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to send reply");
      toast.error("Failed to send reply");
    } finally {
      setProcessing(false);
    }
  };

  const del = async (id) => {
    const confirmed = await confirm({
      title: "Delete Message",
      message: "Are you sure you want to delete this message permanently?",
      confirmText: "Yes, Delete Message",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      setProcessing(true);
      await messagesApi.delete(id);
      await load();
      setSelected(null);
      toast.success("Message deleted successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to delete message");
      toast.error("Failed to delete message");
    } finally {
      setProcessing(false);
    }
  };

  const deleteAll = async () => {
    const confirmed = await confirm({
      title: "Delete All Messages",
      message:
        "Are you sure you want to delete ALL messages? This action cannot be undone!",
      confirmText: "Yes, Delete All Messages",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      setProcessing(true);
      await messagesApi.deleteAll();
      await load();
      toast.success("All messages deleted successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to delete all messages");
      toast.error("Failed to delete all messages");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          Messages Management
        </h1>
        {items.length > 0 && (
          <Button onClick={deleteAll} variant="danger" disabled={processing}>
            <Trash2 size={18} className="inline mr-2" />
            Delete All Messages
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-800/20 border border-red-800 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Messages Table */}
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No messages available</p>
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
                    Message
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
                {items.map((m) => (
                  <tr
                    key={m._id}
                    className="hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="p-3 lg:p-4">
                      <div>
                        <p className="text-white font-medium">{m.name}</p>
                        <p className="text-gray-400 text-sm sm:hidden">
                          {m.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-3 lg:p-4 text-gray-300 hidden sm:table-cell">
                      {m.email}
                    </td>
                    <td className="p-3 lg:p-4 text-gray-400 hidden lg:table-cell">
                      <p className="truncate max-w-xs">{m.message}</p>
                    </td>
                    <td className="p-3 lg:p-4 text-gray-400 hidden md:table-cell">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 lg:p-4 text-center">
                      <Button onClick={() => view(m._id)} className="text-sm">
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

      {/* Message Details Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => {
          setSelected(null);
          setReply("");
        }}
        title="Message Details"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">From</label>
                <p className="text-white font-medium">{selected.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="text-white font-medium">{selected.email}</p>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400">Date</label>
              <p className="text-white">
                {new Date(selected.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Message
              </label>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <p className="text-white whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Reply</label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows="4"
                className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Type your reply here..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
              <Button
                onClick={sendReply}
                variant="success"
                disabled={processing}
                className="flex-1"
              >
                <Send size={16} className="inline mr-2" />
                {processing ? "Sending..." : "Send Reply"}
              </Button>
              <Button
                onClick={() => del(selected._id)}
                variant="danger"
                disabled={processing}
                className="flex-1"
              >
                <Trash2 size={16} className="inline mr-2" />
                {processing ? "Deleting..." : "Delete Message"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
