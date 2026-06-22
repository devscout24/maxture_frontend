"use client";

import { useState } from "react";
import { Search, Paperclip, Send } from "lucide-react";
import Image from "next/image";

// Types
interface Message {
    id: number;
    from: "me" | "them";
    text: string;
    time: string;
    seen?: boolean;
}

interface Conversation {
    id: number;
    name: string;
    avatar: string;
    lastMessage: string;
    online: boolean;
    active: boolean;
}

export default function Messages() {
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

    // Mock data
    const conversations: Conversation[] = [
        {
            id: 1,
            name: "James Wilson",
            avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100",
            lastMessage: "I'm interested in the downtown p...",
            online: true,
            active: true,
        },
        {
            id: 2,
            name: "Emily Chen",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
            lastMessage: "Thank you for the property report!",
            online: false,
            active: false,
        },
        {
            id: 3,
            name: "Robert Martinez",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
            lastMessage: "Let me discuss with my wife and...",
            online: false,
            active: false,
        },
        {
            id: 4,
            name: "Lisa Thompson",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
            lastMessage: "Perfect, see you at the open hous...",
            online: false,
            active: false,
        },
        {
            id: 5,
            name: "David Park",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
            lastMessage: "Can you send me the comparable list...",
            online: false,
            active: false,
        },
    ];

    const messages: Message[] = [
        { id: 1, from: "them", text: "Hi, I saw your listing for the downtown penthouse.", time: "10:30 AM" },
        { id: 2, from: "me", text: "Hello James! Yes, it's one of our premium listings.", time: "10:32 AM", seen: true },
        { id: 3, from: "them", text: "What's the square footage and HOA fees?", time: "10:35 AM" },
        { id: 4, from: "me", text: "It's 2,800 m² with HOA fees of $850/month. That covers amenities, security, and maintenance.", time: "10:38 AM", seen: true },
        { id: 5, from: "them", text: "Sounds great. Can we schedule a viewing this weekend?", time: "10:42 AM" },
        { id: 6, from: "me", text: "Absolutely! I have Saturday at 2 PM or Sunday at 11 AM available.", time: "10:42 AM", seen: true },
        { id: 7, from: "them", text: "I'm interested in the downtown penthouse. Is it still available?", time: "10:45 AM" },
    ];

    const currentConversation = selectedConversation || conversations[0];

    return (
        <div>
            <h1 className="text-xl font-bold text-gray-900 mb-6">Messages</h1>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex h-[580px]">

                    {/* Conversation List */}
                    <div className="w-72 border-r border-gray-100 flex flex-col shrink-0">
                        {/* Search */}
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                                <Search size={14} className="text-gray-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    className="text-sm text-gray-600 outline-none bg-transparent w-full placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto">
                            {conversations.map((convo) => (
                                <button
                                    key={convo.id}
                                    onClick={() => setSelectedConversation(convo)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${
                                        convo.active ? "bg-blue-50" : ""
                                    }`}
                                >
                                    <div className="relative shrink-0">
                                        <Image
                                            src={convo.avatar}
                                            alt={convo.name}
                                            className="w-9 h-9 rounded-full object-cover"
                                            width={36}
                                            height={36}
                                        />
                                        {convo.online && (
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm truncate ${
                                            convo.active ? "font-bold text-primary-600" : "font-medium text-gray-800"
                                        }`}>
                                            {convo.name}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate mt-0.5">{convo.lastMessage}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className="flex flex-col flex-1 min-w-0">

                        {/* Chat Header */}
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                            <div className="relative">
                                <Image
                                    src={currentConversation.avatar}
                                    alt={currentConversation.name}
                                    className="w-9 h-9 rounded-full object-cover"
                                    width={36}
                                    height={36}
                                />
                                {currentConversation.online && (
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">{currentConversation.name}</p>
                                <p className="text-xs text-green-500">Online</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-gray-50/30">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${
                                    msg.from === "me" ? "items-end" : "items-start"
                                }`}>
                                    <div
                                        className={`max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                            msg.from === "me"
                                                ? "bg-primary-600 text-white rounded-br-sm"
                                                : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1 px-1">
                                        <p className="text-[10px] text-gray-400">{msg.time}</p>
                                        {msg.from === "me" && msg.seen && (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={2.5}
                                                className="text-primary-400"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M4.5 12.75l6 6 9-13.5"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-3 bg-white">
                            {/* Emoji */}
                            <button className="text-gray-400 hover:text-gray-600 shrink-0 transition-colors">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
                                    />
                                </svg>
                            </button>
                            {/* Attach */}
                            <button className="text-gray-400 hover:text-gray-600 shrink-0 transition-colors">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                                    />
                                </svg>
                            </button>
                            {/* Input */}
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-50 rounded-full px-4 py-2.5 text-sm outline-none placeholder:text-gray-400 border border-gray-100"
                            />
                            {/* Send */}
                            <button className="w-9 h-9 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center shrink-0 transition-colors">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="15"
                                    height="15"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
