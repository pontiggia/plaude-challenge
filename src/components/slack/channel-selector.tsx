"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, Hash, Lock, Loader2, ArrowRight, AlertCircle } from "lucide-react";

interface Channel {
    id: string;
    name: string;
    isPrivate: boolean;
}

export function ChannelSelector() {
    const router = useRouter();
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            setIsFetching(true);
            setError(null);
            const response = await fetch("/api/slack/channels");

            if (!response.ok) {
                throw new Error("Failed to fetch channels");
            }

            const data = await response.json();
            setChannels(data.channels || []);
        } catch (err) {
            console.error("Error fetching channels:", err);
            setError("Failed to load channels. Please try again.");
        } finally {
            setIsFetching(false);
        }
    };

    const handleSave = async () => {
        if (!selectedChannel) return;
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/slack/channel", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ channelId: selectedChannel.id }),
            });

            if (!response.ok) {
                throw new Error("Failed to save channel");
            }

            router.push("/chat");
        } catch (err) {
            console.error("Failed to save channel:", err);
            setError("Failed to save channel. Please try again.");
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading channels...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={isFetching || channels.length === 0}
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted border border-input rounded-xl text-left hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {selectedChannel ? (
                        <span className="flex items-center gap-2">
                            {selectedChannel.isPrivate ? (
                                <Lock className="w-4 h-4 text-muted-foreground" />
                            ) : (
                                <Hash className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="font-medium">{selectedChannel.name}</span>
                        </span>
                    ) : (
                        <span className="text-muted-foreground">
                            {channels.length === 0 ? "No channels available" : "Select a channel"}
                        </span>
                    )}
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && channels.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-10">
                        <div className="max-h-60 overflow-y-auto">
                            {channels.map((channel) => (
                                <button
                                    key={channel.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedChannel(channel);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted transition-colors ${
                                        selectedChannel?.id === channel.id ? "bg-muted" : ""
                                    }`}
                                >
                                    {channel.isPrivate ? (
                                        <Lock className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                        <Hash className="w-4 h-4 text-muted-foreground" />
                                    )}
                                    <span>{channel.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Button onClick={handleSave} disabled={!selectedChannel || isLoading || isFetching} className="w-full rounded-xl">
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                )}
            </Button>
        </div>
    );
}
