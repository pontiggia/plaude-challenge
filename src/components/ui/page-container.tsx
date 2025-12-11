import { cn } from "@/lib/utils";

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
    centered?: boolean;
}

export function PageContainer({ children, className, centered = true }: PageContainerProps) {
    return (
        <main className={cn("min-h-screen bg-background flex flex-col", className)}>
            {children}
        </main>
    );
}

interface ContentWrapperProps {
    children: React.ReactNode;
    className?: string;
    maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function ContentWrapper({ children, className, maxWidth = "md" }: ContentWrapperProps) {
    const maxWidthClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-xl",
        xl: "max-w-3xl",
    };

    return (
        <div className="flex-1 flex items-center justify-center px-6">
            <div className={cn("w-full", maxWidthClasses[maxWidth], className)}>{children}</div>
        </div>
    );
}
