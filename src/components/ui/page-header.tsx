import { Logo } from "./logo";

interface PageHeaderProps {
    children?: React.ReactNode;
}

export function PageHeader({ children }: PageHeaderProps) {
    return (
        <header className="border-b border-border">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Logo />
                    <span className="font-semibold text-lg tracking-tight">Plaude Challenge</span>
                </div>
                {children}
            </div>
        </header>
    );
}
