"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Users, MicOff, Mic, Maximize2 } from "lucide-react";
import { getYouTubeEmbedUrl } from "@/lib/utils";

interface Message {
  id: number;
  user: string;
  text: string;
  time: string;
  isSystem?: boolean;
}

interface LiveStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamUrl: string | null;
  title: string;
  hostName?: string;
}

export default function LiveStreamModal({
  isOpen,
  onClose,
  streamUrl,
  title,
  hostName = "Property Agent",
}: LiveStreamModalProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, user: "System", text: `Welcome to the live tour of ${title}!`, time: "now", isSystem: true },
  ]);
  const [viewerCount, setViewerCount] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const embedUrl = getYouTubeEmbedUrl(streamUrl);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Simulate viewers joining
      const interval = setInterval(() => {
        setViewerCount(prev => prev + Math.floor(Math.random() * 3));
      }, 10000);
      return () => {
        clearInterval(interval);
        document.body.style.overflow = "auto";
      };
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const newMessage: Message = {
      id: Date.now(),
      user: "You",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMessage]);
    setMessage("");

    // Simulate response
    setTimeout(() => {
      const response: Message = {
        id: Date.now() + 1,
        user: hostName,
        text: "Thanks for your question! I'll show that area in a moment.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm transition-all duration-300">
      <div className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] bg-[#0F172A] shadow-2xl lg:flex-row border border-white/10">
        
        {/* Video Side */}
        <div className="relative flex-1 bg-black overflow-hidden group">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-white/50 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                <Maximize2 size={32} />
              </div>
              <p className="text-lg font-medium">Stream not available</p>
            </div>
          )}

          {/* Overlay Controls */}
          <div className="absolute inset-x-0 top-0 p-6 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto">
              <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white animate-pulse shadow-lg shadow-red-600/20">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
                Live
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/10">
                <Users size={12} />
                <span>{viewerCount}</span>
              </div>
            </div>
            
            <button 
                onClick={onClose}
                className="pointer-events-auto h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/10"
            >
              <X size={20} />
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="flex items-center justify-between pointer-events-auto">
              <div>
                <h3 className="text-white font-bold text-lg">{title}</h3>
                <p className="text-white/60 text-sm">Host: {hostName}</p>
              </div>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/10"
              >
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Chat Side */}
        <div className="flex w-full flex-col bg-[#0F172A] lg:w-80 border-l border-white/5">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h4 className="text-white font-bold text-sm tracking-tight">Live Chat</h4>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.isSystem ? 'items-center' : ''}`}>
                {msg.isSystem ? (
                  <span className="text-[10px] bg-white/5 px-3 py-1 rounded-full text-white/40 font-medium">
                    {msg.text}
                  </span>
                ) : (
                  <div className={`flex flex-col ${msg.user === 'You' ? 'items-end' : 'items-start'} group`}>
                    <span className="text-[10px] font-bold text-white/30 mb-1 px-1">
                      {msg.user}
                    </span>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-xs leading-relaxed transition-all ${
                      msg.user === 'You' 
                        ? 'bg-primary-600 text-white rounded-tr-none' 
                        : 'bg-white/5 text-white/90 border border-white/5 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-white/20 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {msg.time}
                    </span>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-white/5 bg-[#1E293B]/30">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask a question..."
                className="w-full rounded-full bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-primary-500/50 transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="h-9 w-9 flex items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop Close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
      />
    </div>
  );
}
