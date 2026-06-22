import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Server, ArrowLeft, Cpu, HardDrive, MemoryStick, Globe, Search, ChevronDown, Check, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function CreateServer() {
  const [name, setName] = useState("");
  const [ram, setRam] = useState<string>("2");
  const [cpu, setCpu] = useState<string>("100");
  const [disk, setDisk] = useState<string>("10");
  const [port, setPort] = useState<string>("25565");
  const [version, setVersion] = useState("1.21.1");
  const [owner, setOwner] = useState("");
  const [versions, setVersions] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    axios.get("/api/system/paper-versions").then(res => {
      setVersions(res.data);
      if(res.data.length > 0) setVersion(res.data[0]);
    });
    axios.get("/api/auth/users").then(res => {
      setUsers(res.data);
      if (res.data.length > 0) {
        // Default to the current admin's ID if available, otherwise first user
        const defaultOwner = res.data.find((u: any) => u.id === user?.id)?.id || res.data[0].id;
        setOwner(defaultOwner);
      }
    }).catch(() => {});
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload: any = { 
        name, 
        ram: Number(ram), 
        cpu: Number(cpu),
        disk: Number(disk),
        port: Number(port), 
        version 
      };
      if (owner) {
        payload.owner = owner;
      }
      await axios.post("/api/servers", payload);
      navigate("/servers");
    } catch (e) {
      alert("Error creating server");
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-5 md:p-10 max-w-3xl mx-auto"
    >
      <div className="mb-10">
        <Link to="/servers" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors mb-4">
          <ArrowLeft size={16} className="mr-2" /> Back to Instances
        </Link>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">Deploy Instance</h1>
        <p className="text-zinc-400">Configure parameters for a new Minecraft container.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-[#0a0a0c] p-6 md:p-8 rounded-2xl border border-white/5 shadow-2xl relative">
        {/* Subtle decorative glow */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full" />
        </div>

        <div className="space-y-8 relative z-10">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center">
              <Server className="w-4 h-4 mr-2 text-indigo-400" /> Instance Name
            </label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full bg-white/[0.02] border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl px-4 py-3 text-white transition-all shadow-inner outline-none"
              placeholder="e.g. Production Survival"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/[0.01] p-5 rounded-2xl border border-white/[0.02]">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center">
                <MemoryStick className="w-4 h-4 mr-2 text-purple-400" /> RAM Allocation (GB)
              </label>
              <input 
                type="number" 
                required 
                min={1}
                value={ram} 
                onChange={e => setRam(e.target.value)} 
                className="w-full bg-white/[0.02] border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl px-4 py-3 text-white transition-all shadow-inner outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center">
                <Cpu className="w-4 h-4 mr-2 text-blue-400" /> CPU Limit (%)
              </label>
              <input 
                type="number" 
                required 
                min={10}
                value={cpu} 
                onChange={e => setCpu(e.target.value)} 
                className="w-full bg-white/[0.02] border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl px-4 py-3 text-white transition-all shadow-inner outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center">
                <HardDrive className="w-4 h-4 mr-2 text-emerald-400" /> Disk Limit (GB)
              </label>
              <input 
                type="number" 
                required 
                min={1}
                value={disk} 
                onChange={e => setDisk(e.target.value)} 
                className="w-full bg-white/[0.02] border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl px-4 py-3 text-white transition-all shadow-inner outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center">
                 <Globe className="w-4 h-4 mr-2 text-orange-400" /> Network Port
              </label>
              <input 
                type="number" 
                required 
                value={port} 
                onChange={e => setPort(e.target.value)} 
                className="w-full bg-white/[0.02] border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl px-4 py-3 text-white transition-all shadow-inner outline-none font-mono"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center">
              <User className="w-4 h-4 mr-2 text-indigo-400" /> Assign Server Owner
            </label>
            <div className="relative">
              <select 
                value={owner} 
                onChange={e => setOwner(e.target.value)} 
                className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl px-4 py-3 text-white transition-all shadow-inner outline-none appearance-none cursor-pointer font-medium pr-10"
              >
                <option value="" disabled className="bg-[#0a0a0c]">Select a user...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id} className="bg-[#0a0a0c]">
                    {u.username} {u.id === user?.id ? "(You)" : `(${u.role})`}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Select which user owns and has access to this server.</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-300 mb-2">PaperMC Software Version</label>
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-xl px-4 py-3 text-white transition-all shadow-inner font-mono cursor-pointer flex justify-between items-center"
              >
                <span>{version || "Select a version"}</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {dropdownOpen && (
                <div className="absolute z-50 mt-2 w-full bg-[#0a0a0c] border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
                  <div className="p-3 border-b border-white/5 flex items-center bg-white/[0.02]">
                    <Search className="w-4 h-4 text-zinc-400 mr-2" />
                    <input 
                      type="text" 
                      placeholder="Search versions..." 
                      className="bg-transparent border-none outline-none text-white text-sm w-full font-mono placeholder:font-sans"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar">
                    {versions.filter(v => v.includes(searchQuery)).length === 0 ? (
                      <div className="p-3 text-zinc-500 text-sm text-center">No versions found</div>
                    ) : (
                      versions.filter(v => v.includes(searchQuery)).map(v => (
                        <div 
                          key={v}
                          onClick={() => { setVersion(v); setDropdownOpen(false); setSearchQuery(""); }}
                          className={`px-3 py-2.5 rounded-lg cursor-pointer flex items-center justify-between text-sm transition-colors font-mono ${version === v ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
                        >
                          {v}
                          {version === v && <Check className="w-4 h-4 text-indigo-400" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
             <button 
                type="submit" 
                disabled={loading}
                className="w-full px-4 py-3.5 bg-white text-zinc-900 hover:bg-zinc-200 font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full mr-3" />
                    Deploying Container...
                  </>
                ) : "Launch Instance"}
             </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
