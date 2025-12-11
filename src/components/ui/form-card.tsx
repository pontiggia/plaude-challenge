import { cn } from "@/lib/utils";

interface FormCardProps {
    children: React.ReactNode;
    className?: string;
}

export function FormCard({ children, className }: FormCardProps) {
    return <div className={cn("bg-card border border-border rounded-2xl p-8", className)}>{children}</div>;
}

interface FormCardIconProps {
    children: React.ReactNode;
    className?: string;
}

export function FormCardIcon({ children, className }: FormCardIconProps) {
    return (
        <div className={cn("w-12 h-12 bg-foreground/10 rounded-full flex items-center justify-center mb-6", className)}>
            {children}
        </div>
    );
}

interface FormCardHeaderProps {
    title: string;
    description: string;
}

export function FormCardHeader({ title, description }: FormCardHeaderProps) {
    return (
        <>
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            <p className="text-muted-foreground mb-6">{description}</p>
        </>
    );
}
