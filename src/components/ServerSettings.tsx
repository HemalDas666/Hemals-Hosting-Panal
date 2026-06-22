import React, { useState, useEffect } from "react";
import { Trash2, AlertTriangle, User, Save } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ServerSettings({ serverId, server }: { serverId: string, server: any }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [owner, setOwner] = useState(server?.owner || "");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user?.role === "admin") {
      axios.get("/api/auth/users").then(res => {
        setUsers(res.data);
      }).catch(() => {});
    }
  }, [user]);

  if (!server) return null;
  const canManage = user?.role === "admin" || server.owner === user?.id;

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/servers/${serverId}`);
      navigate("/servers");
    } catch(e) {
      alert("Failed to delete server");
      setIsDeleting(false);
    }
  };

  const handleUpdateOwner = async () => {
    try {
      setIsSaving(true);
      await axios.put(`/api/servers/${serverId}/owner`, { owner });
      alert("Owner updated successfully");
    } catch(e) {
      alert("Failed to update owner");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar text-white">
      <div className="max-w-3xl space-y-8">
        <div>
          <h2 className="text-xl font-bold mb-2">Settings</h2>
          <p className="text-zinc-400 text-sm mb-6">Manage advanced configuration and dangerous actions for this unit.</p>
        </div>

        {canManage ? (
          <>
            {user?.role === "admin" && (
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-indigo-400 font-bold mb-2 flex items-center">
                  <User className="w-5 h-5 mr-2" /> Server Ownership
                </h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Transfer the ownership of this server to another user.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <select 
                    value={owner} 
                    onChange={e => setOwner(e.target.value)} 
                    className="flex-1 bg-[#0a0a0c] border border-white/10 focus:border-indigo-500 rounded-xl px-4 py-2 text-white outline-none"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleUpdateOwner}
                    disabled={isSaving || owner === server.owner}
                    className="px-6 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-medium rounded-xl border border-indigo-500/20 transition-all disabled:opacity-50 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" /> Save
                  </button>
                </div>
              </div>
            )}

            <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6">
              <h3 className="text-red-400 font-bold mb-2 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" /> Danger Zone
              </h3>
              <p className="text-zinc-400 text-sm mb-6">
                Permanently delete this server instance and all of its data. This action cannot be undone.
              </p>
              
              {!isDeleting ? (
                <button 
                  onClick={() => setIsDeleting(true)}
                  className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-xl border border-red-500/20 transition-all flex items-center shadow-sm hover:shadow-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Server
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 bg-red-500/10 p-4 rounded-xl border border-red-500/30">
                   <span className="text-red-400 font-medium text-sm">Are you absolutely sure?</span>
                   <div className="flex space-x-2">
                     <button 
                       onClick={handleDelete}
                       className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors text-sm shadow-md"
                     >
                       Yes, Delete
                     </button>
                     <button 
                       onClick={() => setIsDeleting(false)}
                       className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg transition-colors text-sm"
                     >
                       Cancel
                     </button>
                   </div>
                </div>
              )}
            </div>
          </>
        ) : (
           <div className="text-zinc-500 text-sm p-4 bg-white/5 rounded-xl border border-white/5">
             You do not have permission to manage this server's settings.
           </div>
        )}
      </div>
    </div>
  );
}
