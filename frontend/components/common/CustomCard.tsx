"use client"

import * as React from "react"
import { Warranty } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CustomDropdown } from "@/components/common/CustomDropdown"
import {
    Calendar,
    Clock,
    Store,
    Tag,
    MoreVertical,
    Pencil,
    Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface ExpiryStatus {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
    badgeClass: string
    daysText: string
    days: number
}

export const getExpiryStatus = (expiryDate: string): ExpiryStatus => {
    const diffTime = new Date(expiryDate).getTime() - new Date().getTime()
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (days < 0) {
        return {
            label: "Expired",
            variant: "destructive",
            badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 font-semibold",
            daysText: `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`,
            days
        }
    }
    if (days <= 30) {
        return {
            label: "Expiring Soon",
            variant: "outline",
            badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 font-semibold",
            daysText: `${days} day${days === 1 ? "" : "s"} left`,
            days
        }
    }
    return {
        label: "Active",
        variant: "secondary",
        badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40 font-semibold",
        daysText: `${days} days left`,
        days
    }
}

export interface CustomCardProps {
    warranty: Warranty
    onClick?: (warranty: Warranty) => void
    onEdit?: (warranty: Warranty) => void
    onDelete?: (warranty: Warranty) => void
    className?: string
}

export function CustomCard({
    warranty,
    onClick,
    onEdit,
    onDelete,
    className,
}: CustomCardProps) {
    const status = getExpiryStatus(warranty.warrantyExpiryDate)

    return (
        <Card
            onClick={() => onClick?.(warranty)}
            className={cn(
                "rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group cursor-pointer active:scale-[0.99]",
                className
            )}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            {warranty.brand && (
                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                                    {warranty.brand}
                                </span>
                            )}
                            <Badge
                                variant={status.variant}
                                className={cn("text-[10px] px-2 py-0.2 rounded-full shrink-0 font-semibold", status.badgeClass)}
                            >
                                {status.label}
                            </Badge>
                        </div>

                        {/* Product Name */}
                        <CardTitle className="text-base font-bold leading-tight line-clamp-1 hover:shadow-md transition-colors">
                            {warranty.productName}
                        </CardTitle>
                    </div>

                    <div onClick={(e) => e.stopPropagation()} className="shrink-0 -mr-1 -mt-1">
                        <CustomDropdown
                            trigger={
                                <div className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                    <MoreVertical className="size-4" />
                                    <span className="sr-only">Actions</span>
                                </div>
                            }
                            align="end"
                            className="w-36 p-1 shadow-xl border-zinc-200 dark:border-zinc-800"
                            items={[
                                {
                                    id: "edit",
                                    leftIcon: <Pencil className="size-3.5" />,
                                    label: "Edit",
                                    onClick: () => onEdit?.(warranty),
                                },
                                {
                                    id: "delete",
                                    leftIcon: <Trash2 className="size-3.5" />,
                                    label: "Delete",
                                    variant: "destructive",
                                    onClick: () => onDelete?.(warranty),
                                },
                            ]}
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0 text-xs text-zinc-600 dark:text-zinc-400 flex-1">
                {/* Metadata Row: Category, Retailer, Price */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    {warranty.category && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                            <Tag className="size-3 text-zinc-400" />
                            {warranty.category}
                        </span>
                    )}
                    {warranty.retailer && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                            <Store className="size-3 text-zinc-400" />
                            {warranty.retailer}
                        </span>
                    )}
                    {warranty.price !== undefined && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                            {warranty.currency || "$"} {warranty.price}
                        </span>
                    )}
                </div>

                {/* Timeline / Dates */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400 flex items-center gap-1">
                            <Calendar className="size-3 text-zinc-400" /> Purchased
                        </span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {new Date(warranty.purchaseDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                            })}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400 flex items-center gap-1">
                            <Clock className="size-3 text-zinc-400" /> Expires
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {new Date(warranty.warrantyExpiryDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                            })}
                        </span>
                    </div>

                    {/* Days remaining status text */}
                    <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-right pt-0.5">
                        {status.daysText}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default CustomCard
