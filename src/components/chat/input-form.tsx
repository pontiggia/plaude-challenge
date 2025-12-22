"use client";

import { Send } from "lucide-react";
import type { FormEvent, KeyboardEvent } from "react";

interface InputFormProps {
    input: string;
    onInputChange: (value: string) => void;
    onSubmit: (e: FormEvent) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    isLoading: boolean;
}

export function InputForm({
    input,
    onInputChange,
    onSubmit,
    onKeyDown,
    isLoading,
}: InputFormProps) {
    return (
        <div className="border-t border-border bg-background">
            <form onSubmit={onSubmit} className="max-w-3xl mx-auto px-4 md:px-6 py-4">
                <div className="flex items-center gap-3 bg-muted rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background transition-shadow">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none py-2"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="p-2 bg-foreground text-background rounded-xl hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                    Requests requiring approval will be sent to your connected Slack workspace.
                </p>
            </form>
        </div>
    );
}
