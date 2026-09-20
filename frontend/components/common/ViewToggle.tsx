"use client"

import * as React from "react"
import { LayoutGrid, List } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type ViewMode = "grid" | "list"

export interface ViewToggleProps {
    view: ViewMode
    onViewChange: (view: ViewMode) => void
    className?: string
}

export function ViewToggle({
    view,
    onViewChange,
    className,
}: ViewToggleProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center p-1 rounded-xl bg-zinc-200/70 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800/80 gap-1",
                className
            )}
        >
            {/* Grid View Button */}
            <Tooltip>
                <TooltipTrigger
                    type="button"
                    onClick={() => onViewChange("grid")}
                    aria-label="Grid view"
                    className={cn(
                        "size-8 rounded-lg flex items-center justify-center transition-all cursor-pointer outline-none",
                        view === "grid"
                            ? "bg-white dark:bg-zinc-900 text-foreground shadow-sm font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-zinc-700/40"
                    )}
                >
                    <LayoutGrid className="size-4" />
                    <span className="sr-only">Grid view</span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">
                    Grid view
                </TooltipContent>
            </Tooltip>

            {/* List View Button */}
            <Tooltip>
                <TooltipTrigger
                    type="button"
                    onClick={() => onViewChange("list")}
                    aria-label="List view"
                    className={cn(
                        "size-8 rounded-lg flex items-center justify-center transition-all cursor-pointer outline-none",
                        view === "list"
                            ? "bg-white dark:bg-zinc-900 text-foreground shadow-sm font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-zinc-700/40"
                    )}
                >
                    <List className="size-4" />
                    <span className="sr-only">List view</span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">
                    List view
                </TooltipContent>
            </Tooltip>
        </div>
    )
}

export default ViewToggle
