import React, { useEffect, useState } from "react";
import axios from "axios";
import { Server, Activity, HardDrive, Cpu, MemoryStick } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [servers, setServers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, serversRes] = await Promise.all([
          axios.get("/api/system/stats"),
          axios.get("/api/servers")
        ]);
        setStats(statsRes.data);
        setServers(serversRes.data);
      } catch(e){}
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return (
    <div className="h-full flex items-center justify-center p-8">
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
      />
    </div>
  );

  const runningServers = servers.filter(s => s.status === 'online').length;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-10 max-w-7xl mx-auto"
    >
      <h1 className="text-3xl font-bold tracking-tight mb-8">System Overview</h1>
      
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Servers" value={servers.length.toString()} icon={<Server size={24} className="text-blue-400" />} />
        <StatCard title="Running Servers" value={runningServers.toString()} icon={<Activity size={24} className="text-green-400" />} />
        <StatCard title="CPU Usage" value={`${stats.cpuUsage}%`} icon={<Cpu size={24} className="text-purple-400" />} />
        <StatCard title="RAM Usage" value={`${stats.ramUsage}%`} icon={<MemoryStick size={24} className="text-orange-400" />} />
      </motion.div>

      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-xl font-bold tracking-tight mb-6 mt-12">Recent Activity</motion.h2>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-gray-950 rounded-2xl border border-gray-800 p-6 overflow-hidden">
        {servers.length === 0 ? (
           <p className="text-gray-500 text-sm">No recent activity.</p>
        ) : (
          <div className="space-y-4">
            {servers.slice(0, 5).map(server => (
              <div key={server.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800/50">
                <div>
                  <h3 className="font-medium text-white">{server.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">Status: <span className={server.status === 'online' ? 'text-green-400' : 'text-gray-400'}>{server.status}</span></p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(server.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };
  return (
    <motion.div variants={item} className="bg-gray-950 p-6 rounded-2xl border border-gray-800 flex items-center space-x-4 hover:border-gray-700 transition-colors">
      <div className="p-3 bg-gray-900 rounded-xl border border-gray-800/50">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white mt-1 tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
}
