import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Shield, User, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const fetchUsers = async () => {
    if (user.role !== "admin") return;
    try {
      const res = await axios.get("/api/system/users");
      setUsers(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/system/users", { username, password, role });
      setUsername("");
      setPassword("");
      fetchUsers();
      alert("User created successfully");
    } catch (e: any) {
      alert(e.response?.data?.error || "Error creating user");
    }
  };

  const deleteUser = async (id: string) => {
    if (confirm("Delete this user?")) {
      try {
        await axios.delete(`/api/system/users/${id}`);
        fetchUsers();
      } catch (e) {}
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-10 max-w-7xl mx-auto"
    >
      <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>

      <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <User className="mr-2 text-blue-400" /> My Account
        </h2>
        <p className="text-gray-400">Username: <strong className="text-white">{user.username}</strong></p>
        <p className="text-gray-400 mt-2">Role: <strong className="text-white capitalize">{user.role}</strong></p>
      </div>

      {user.role === "admin" && (
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Shield className="mr-2 text-purple-400" /> Admin: User Management
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 border-r border-gray-800 pr-8">
              <h3 className="font-semibold mb-4 text-gray-300">Create New User</h3>
              <form onSubmit={createUser} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Username</label>
                  <input required value={username} onChange={e=>setUsername(e.target.value)} type="text" className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Password</label>
                  <input required minLength={4} value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Role</label>
                  <select value={role} onChange={e=>setRole(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white">
                    <option value="user">Normal User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
                  Create
                </button>
              </form>
            </div>
            <div className="lg:col-span-2">
               <h3 className="font-semibold mb-4 text-gray-300">Existing Users</h3>
               <div className="space-y-3">
                 {users.map(u => (
                   <div key={u.id} className="flex justify-between items-center p-4 bg-gray-900 border border-gray-800 rounded-xl">
                      <div>
                        <p className="font-medium text-white">{u.username}</p>
                        <p className="text-xs text-gray-500 capitalize">Role: {u.role}</p>
                      </div>
                      {u.id !== user.id && (
                        <button onClick={() => deleteUser(u.id)} className="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      )}
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
