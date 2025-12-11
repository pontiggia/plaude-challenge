"use client";

interface ToolInvocationBadgeProps {
    name: string;
    status?: string;
}

export function ToolInvocationBadge({ name, status }: ToolInvocationBadgeProps) {
    return (
        <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-medium">{name}</span>
                {status === "complete" && (
                    <span className="text-green-600 ml-auto">✓ Complete</span>
                )}
            </div>
        </div>
    );
}
