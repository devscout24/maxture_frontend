"use client";

import { useState, useEffect } from "react";

// Types
interface User {
    name?: string;
    role?: string;
}

interface UserInitialsProps {
    user: User | null;
    className?: string;
}

// Shared component for user initials to avoid hydration issues
export default function UserInitials({ user, className = "text-white font-bold text-sm" }: UserInitialsProps) {
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);
    
    if (!isClient) {
        return <span className={className}>AG</span>;
    }
    
    return <span className={className}>
        {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AG'}
    </span>;
}

// Shared component for user info to avoid hydration issues
export function UserInfo({ user }: { user: User | null }) {
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);
    
    if (!isClient) {
        return (
            <>
                <p className="font-bold text-gray-900 text-sm">Agent</p>
                <p className="text-gray-400 text-xs capitalize">Agent</p>
            </>
        );
    }
    
    return (
        <>
            <p className="font-bold text-gray-900 text-sm">{user?.name || "Agent"}</p>
            <p className="text-gray-400 text-xs capitalize">{user?.role || "Agent"}</p>
        </>
    );
}
