import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Server, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function ServerList() {
  const [servers, setServers] = useState<any[]>([]);
  const { user } = useAuth();

  const fetchServers = async () => {
    try {
      const res = await axios.get("/api/servers");
      setServers(res.data);
    } catch(e) {}
  };

  useEffect(() => {
    fetchServers();
    const interval = setInterval(fetchServers, 5000);
    return () => clearInterval(interval);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-5 md:p-10 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">Instances</h1>
          <p className="text-zinc-400">Manage and monitor your server fleet.</p>
        </div>
        {user?.role === "admin" && (
          <Link to="/servers/create" className="px-5 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10 text-sm whitespace-nowrap inline-flex items-center self-start md:self-auto">
            <Plus size={18} className="mr-2" />
            New Instance
          </Link>
        )}
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {servers.map(server => (
          <motion.div variants={itemAnim} key={server.id} className="bg-[#0a0a0c] rounded-2xl border border-white/5 p-5 md:p-6 flex flex-col group hover:border-white/10 transition-all shadow-xl relative overflow-hidden">
            {/* Subtle top glow based on status */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] opacity-50 ${server.status === 'online' ? 'bg-gradient-to-r from-transparent via-emerald-500 to-transparent' : 'bg-gradient-to-r from-transparent via-zinc-500 to-transparent'}`} />
            
            <Link to={`/servers/${server.id}`} className="block flex-1 z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-colors shadow-inner">
                    <Server className="w-6 h-6 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <div>
                    <h2 className="font-bold tracking-tight text-white text-lg group-hover:text-indigo-300 transition-colors">{server.name}</h2>
                    <div className="flex items-center mt-1.5 space-x-2">
                       <span className="flex h-2.5 w-2.5 relative">
                          {server.status === 'online' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${server.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-600'}`}></span>
                        </span>
                      <span className="text-xs font-medium text-zinc-400 capitalize flex items-center">{server.status}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 py-4 border-y border-white/5 my-4 text-sm mt-auto">
                <div>
                  <p className="text-zinc-500 text-[10px] md:text-xs mb-1 font-medium uppercase tracking-wider">CPU Limit</p>
                  <p className="font-mono text-zinc-300 text-xs md:text-sm">{server.cpu || 100} <span className="text-zinc-500">%</span></p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] md:text-xs mb-1 font-medium uppercase tracking-wider">RAM Limit</p>
                  <p className="font-mono text-zinc-300 text-xs md:text-sm">{server.ram} <span className="text-zinc-500">GB</span></p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] md:text-xs mb-1 font-medium uppercase tracking-wider">Disk Limit</p>
                  <p className="font-mono text-zinc-300 text-xs md:text-sm">{server.disk || 10} <span className="text-zinc-500">GB</span></p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] md:text-xs mb-1 font-medium uppercase tracking-wider">Version</p>
                  <p className="text-zinc-300 font-medium text-xs md:text-sm truncate" title={server.version}>
                    {server.version}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
        {servers.length === 0 && (
          <motion.div variants={itemAnim} className="col-span-full py-32 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                <Server className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Instances Running</h3>
            <p className="max-w-sm text-center mb-6 text-sm">You haven't deployed any servers yet. Create one to start managing your game instances.</p>
            {user?.role === "admin" && (
                <Link to="/servers/create" className="px-5 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10 text-sm">
                    Deploy your first server
                </Link>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
