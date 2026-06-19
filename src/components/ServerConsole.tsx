import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function ServerConsole({ serverId }: { serverId: string }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [command, setCommand] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();

  useEffect(() => {
    const socket: Socket = io({
      auth: { token }
    });

    socket.on("connect", () => {
      socket.emit("joinServer", serverId);
      setLogs(prev => [...prev, "[System] Connected to console stream."]);
    });

    socket.on("log", (data: string) => {
      // Split stream data by newlines if necessary, or just append as log string
      const lines = data.split(/\r?\n/).filter(line => line.trim() !== "");
      setLogs(prev => {
        const newLogs = [...prev, ...lines];
        return newLogs.slice(-200); // Keep last 200 lines to prevent unmounting issues
      });
    });

    socket.on("disconnect", () => {
      setLogs(prev => [...prev, "[System] Disconnected from server."]);
    });

    return () => {
      socket.emit("leaveServer", serverId);
      socket.disconnect();
    };
  }, [serverId, token]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const sendCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    const cmd = command;
    setCommand("");
    try {
      await axios.post(`/api/servers/${serverId}/command`, { command: cmd });
    } catch(e) {
      setLogs(prev => [...prev, "[System Error] Failed to send command"]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[400px] bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm custom-scrollbar whitespace-pre-wrap break-words text-gray-300">
        {logs.map((log, i) => (
          <div key={i} className={`${log.startsWith('>') ? 'text-blue-400 font-semibold' : ''}`}>{log}</div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={sendCommand} className="border-t border-gray-800 p-4 bg-gray-950 flex space-x-4">
        <input 
          type="text" 
          value={command} 
          onChange={e => setCommand(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-sm"
          placeholder="Type a command... (e.g. op Steve)"
        />
        <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 font-medium text-white rounded-lg transition-colors text-sm">
          Send
        </button>
      </form>
    </div>
  );
}
