"use client";

import { User } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

interface MessageAvatarProps {
    isUser: boolean;
    className?: string;
}

export function MessageAvatar({ isUser, className }: MessageAvatarProps) {
    return (
        <div
            className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                isUser ? "bg-primary" : "bg-foreground",
                className
            )}
        >
            {isUser ? (
                <User className="w-4 h-4 text-primary-foreground" />
            ) : (
                <Logo className="w-4 h-4 text-background" />
            )}
        </div>
    );
}
