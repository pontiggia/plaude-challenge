"use client";

import type React from "react";

interface SuggestionChipProps {
    children: React.ReactNode;
    onClick?: () => void;
}

export function SuggestionChip({ children, onClick }: SuggestionChipProps) {
    return (
        <button
            onClick={onClick}
            className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 text-foreground rounded-full transition-colors"
        >
            {children}
        </button>
    );
}
