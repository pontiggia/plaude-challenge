import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
}

export function Logo({ className }: LogoProps) {
    return (
        <svg className={cn("w-8 h-8", className)} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M8 8C8 5.79086 9.79086 4 12 4H20C22.2091 4 24 5.79086 24 8V24C24 26.2091 22.2091 28 20 28H12C9.79086 28 8 26.2091 8 24V8Z"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
            />
        </svg>
    );
}
