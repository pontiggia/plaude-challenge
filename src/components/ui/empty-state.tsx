"use client";

import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    children?: React.ReactNode;
    className?: string;
}

export function EmptyState({ icon, title, description, children, className }: EmptyStateProps) {
    return (
        <div className={cn("text-center py-12", className)}>
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                {icon || <MessageSquare className="w-8 h-8 text-muted-foreground" />}
            </div>
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">{description}</p>
            {children && <div className="mt-6">{children}</div>}
        </div>
    );
}
