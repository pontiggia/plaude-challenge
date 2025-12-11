"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/ui/logo";

interface ChatHeaderProps {
    teamName: string;
}

export function ChatHeader({ teamName }: ChatHeaderProps) {
    const router = useRouter();

    const handleDisconnect = async () => {
        try {
            await fetch("/api/slack/disconnect");
            router.push("/");
        } catch (error) {
            console.error("Failed to disconnect:", error);
        }
    };

    return (
        <header className="border-b border-border bg-background">
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Logo className="w-7 h-7" />
                    </Link>
                    <div className="h-6 w-px bg-border" />
                    <div>
                        <h1 className="font-semibold text-foreground">Support Agent</h1>
                        <p className="text-xs text-muted-foreground">
                            Connected to <span className="font-medium">{teamName}</span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleDisconnect}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    title="Disconnect Slack"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}
