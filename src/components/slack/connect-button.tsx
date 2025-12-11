"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export function SlackConnectButton() {
    return (
        <Button
            asChild
            size="lg"
            className="rounded-full px-8 py-6 text-base font-medium bg-foreground text-background hover:bg-foreground/90"
        >
            <Link href="/api/slack/oauth">
                Connect Slack
                <ArrowUpRight className="w-5 h-5 ml-2" />
            </Link>
        </Button>
    );
}
