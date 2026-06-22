"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import {
  Check,
  Heart,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Send,
  Ticket,
  User,
  X,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import Image from "next/image";

type AccountLink = {
  key: string;
  label: string;
  icon: ReactNode;
  href?: string;
  active?: boolean;
  badge?: number;
};

export default function MessagesPage() {
  const pathname = usePathname();
  const normalizedPath = (pathname || "").replace(/\/$/, "");
  
  const conversations = [
    {
      id: 1,
      name: "James Wilson",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100",
      role: "Online",
      lastMessage: "Hi, I saw your listing for the downtown penthouse.",
      time: "10:32 AM",
      unread: true,
    },
    {
      id: 2,
      name: "Emily Chen",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      role: "",
      lastMessage: "Thank you for the property report!",
      time: "9:45 AM",
      unread: false,
    },
    {
      id: 3,
      name: "Robert Martinez",
      avatar: "https://randomuser.me/api/portraits/men/35.jpg",
      role: "",
      lastMessage: "Is this property still available?",
      time: "9:12 AM",
      unread: false,
    },
    {
      id: 4,
      name: "Lila Thompson",
      avatar: "https://randomuser.me/api/portraits/women/62.jpg",
      role: "",
      lastMessage: "Perfect, see you at the open house.",
      time: "8:58 AM",
      unread: false,
    },
    {
      id: 5,
      name: "David Park",
      avatar: "https://randomuser.me/api/portraits/men/51.jpg",
      role: "",
      lastMessage: "Can you send me the brochure link?",
      time: "8:41 AM",
      unread: false,
    },
  ];

  const initialMessages = [
    {
      id: 1,
      from: "them",
      text: "Hi, I saw your listing for the downtown penthouse.",
      time: "10:30 AM",
    },
    {
      id: 2,
      from: "me",
      text: "Hello James! Yes, it's one of our premium listings.",
      time: "10:32 AM",
    },
    {
      id: 3,
      from: "them",
      text: "What's the square footage and HOA fees?",
      time: "10:34 AM",
    },
    {
      id: 4,
      from: "me",
      text: "It's 2,400 m² with HOA fees of $850/month. The tower's amenities are exceptional.",
      time: "10:36 AM",
    },
    {
      id: 5,
      from: "them",
      text: "Sounds great. Can we schedule a viewing this weekend?",
      time: "10:40 AM",
    },
    {
      id: 6,
      from: "me",
      text: "Absolutely! I have Saturday at 2 PM or Sunday at 11 AM available.",
      time: "10:41 AM",
    },
    {
      id: 7,
      from: "them",
      text: "I'm interested in the downtown penthouse. Is it still available?",
      time: "10:43 AM",
    },
  ];

  const accountLinks: AccountLink[] = [
    { key: "profile", label: "Profile", icon: <User size={14} />, href: "/dashboard" },
    {
      key: "messages",
      label: "Messages",
      icon: <MessageCircle size={14} />,
      href: "/dashboard/message",
    },
    { key: "saved", label: "Saved", icon: <Heart size={14} />, href: "/dashboard/saved", badge: 4 },
    {
      key: "tickets",
      label: "Raffle Tickets",
      icon: <Ticket size={14} />,
      href: "/dashboard/raffle-tickets",
      badge: 2,
    },
  ];

  const quickLinks = [
    { label: "Browse Raffles", href: "/raffles" },
    { label: "All Listings", href: "/properties" },
  ];

  const [selectedConvo, setSelectedConvo] = useState(conversations[0]);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const initials = "JH";

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        from: "me",
        text: messageInput,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setMessageInput("");
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 shadow-sm fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 text-gray-500"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu size={20} />
              </button>
              <Link href="/" className="font-bold text-xl text-[#1B2B5E] tracking-wide">
                EXPOVIVIENDA
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-5">
              {[
                { label: "Home", href: "/" },
                { label: "Properties", href: "/properties" },
                { label: "Virtual Expo", href: "/virtual-expo" },
                { label: "Raffles", href: "/raffles" },
                { label: "Agents", href: "/agents" },
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {searchOpen && (
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search..."
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none w-36 sm:w-52 mr-2 focus:border-primary-600 transition-all"
                  />
                )}
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                >
                  {searchOpen ? <X size={18} /> : <Search size={18} />}
                </button>
              </div>

              <Link
                href="/properties"
                className="hidden sm:block bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                List Property
              </Link>

              <div className="w-9 h-9 rounded-full bg-[#1B2B5E] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {initials}
              </div>
            </div>
          </div>
        </header>

      <div className="bg-[#1B2B5E] pt-20 pb-20 text-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/bgg.jpg')" }}>
        <h1 className="text-2xl sm:text-5xl font-bold text-white pt-10">My Dashboard</h1>
        <p className="text-white/60 text-[20px] mt-2">Manage your properties, tickets, and account settings</p>
      </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_300px_1fr] gap-4 mt-[70px]">
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            <aside className={`
              fixed top-0 left-0 h-full w-64 bg-white z-40 shadow-xl pt-20 px-5 transition-transform duration-300
              lg:static lg:w-auto lg:h-fit lg:shadow-sm lg:pt-4 lg:px-4 lg:translate-x-0 lg:z-auto
              lg:rounded-2xl lg:border lg:border-gray-100
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
              <div className="lg:hidden flex justify-end mb-4">
                <button onClick={() => setSidebarOpen(false)}>
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <p className="text-[20px] font-bold text-[#4B5563] uppercase tracking-widest mb-3">
                Account
              </p>
              <ul className="space-y-1.5 mb-6">
                {accountLinks.map((item) => (
                  <li key={item.key}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          normalizedPath === item.href
                            ? "bg-blue-50 text-primary-600 font-semibold"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {item.icon}
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="flex-shrink-0 bg-primary-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-col">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <button className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <span className="flex items-center gap-2">
                          {item.icon}
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="flex-shrink-0 bg-primary-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-col">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Quick Links
              </p>
              <ul className="space-y-1.5 mb-4">
                {quickLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Check size={14} className="text-gray-400" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
                <LogOut size={14} />
                Logout
              </button>
            </aside>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">Messages</h3>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                  <Search size={14} className="text-gray-400" />
                  <input
                    placeholder="Search conversations..."
                    className="bg-transparent outline-none text-sm w-full placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="max-h-[560px] overflow-y-auto">
                {conversations.map((convo) => (
                  <button
                    key={convo.id}
                    onClick={() => setSelectedConvo(convo)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gray-50 transition-colors ${selectedConvo.id === convo.id ? "bg-blue-50/70" : "hover:bg-gray-50"
                      }`}
                  >
                    <Image
                      src={convo.avatar}
                      alt={convo.name}
                      className="w-10 h-10 rounded-full object-cover"
                      width={40}
                      height={40}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">{convo.name}</p>
                        <span className="text-[10px] text-gray-400 shrink-0">{convo.time}</span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{convo.lastMessage}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-[600px] flex flex-col">
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <Image
                    src={selectedConvo.avatar}
                    alt={selectedConvo.name}
                    className="w-9 h-9 rounded-full object-cover"
                    width={36}
                    height={36}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{selectedConvo.name}</p>
                    <p className="text-xs text-green-500">{selectedConvo.role || "Online"}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fbfcfe]">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div className="max-w-[82%]">
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.from === "me"
                              ? "bg-blue-600 text-white rounded-br-md"
                              : "bg-gray-100 text-gray-700 rounded-bl-md"
                            }`}
                        >
                          {msg.text}
                        </div>
                        <p
                          className={`text-[10px] mt-1 ${msg.from === "me" ? "text-right text-gray-400" : "text-gray-400"
                            }`}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-gray-100 flex items-center gap-2 bg-white">
                  <input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-primary-600"
                    placeholder="Type a message..."
                  />
                  <button
                    onClick={sendMessage}
                    className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                    aria-label="Send message"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
