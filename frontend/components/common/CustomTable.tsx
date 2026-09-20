"use client"

import * as React from "react"
import { Warranty } from "@/lib/types"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CustomDropdown } from "@/components/common/CustomDropdown"
import { getExpiryStatus } from "@/components/common/CustomCard"
import {
    Store,
    Tag,
    MoreVertical,
    Pencil,
    Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface CustomTableProps {
    data: Warranty[]
    onRowClick?: (warranty: Warranty) => void
    onEdit?: (warranty: Warranty) => void
    onDelete?: (warranty: Warranty) => void
    className?: string
}

export function CustomTable({
    data,
    onRowClick,
    onEdit,
    onDelete,
    className,
}: CustomTableProps) {
    return (
        <div
            className={cn(
                "w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-card text-card-foreground shadow-sm overflow-hidden",
                className
            )}
        >
            <Table>
                <TableHeader className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
                    <TableRow className="hover:bg-transparent border-zinc-200 dark:border-zinc-800">
                        <TableHead className="w-[30%] text-xs font-bold text-zinc-500 dark:text-zinc-400 py-3.5 pl-5">
                            Product & Brand
                        </TableHead>
                        <TableHead className="text-xs font-bold text-zinc-500 dark:text-zinc-400 py-3.5">
                            Retailer & Price
                        </TableHead>
                        <TableHead className="text-xs font-bold text-zinc-500 dark:text-zinc-400 py-3.5">
                            Purchased
                        </TableHead>
                        <TableHead className="text-xs font-bold text-zinc-500 dark:text-zinc-400 py-3.5">
                            Expires
                        </TableHead>
                        <TableHead className="text-xs font-bold text-zinc-500 dark:text-zinc-400 py-3.5">
                            Days Left
                        </TableHead>
                        <TableHead className="text-xs font-bold text-zinc-500 dark:text-zinc-400 py-3.5">
                            Status
                        </TableHead>
                        <TableHead className="w-[60px] text-xs font-bold text-zinc-500 dark:text-zinc-400 py-3.5 pr-5 text-right">
                            Action
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((w) => {
                        const status = getExpiryStatus(w.warrantyExpiryDate)

                        return (
                            <TableRow
                                key={w._id}
                                onClick={() => onRowClick?.(w)}
                                className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors border-b border-zinc-100 dark:border-zinc-800/80 last:border-b-0"
                            >
                                {/* Product & Brand */}
                                <TableCell className="py-3.5 pl-5">
                                    <div className="flex flex-col">
                                        {w.brand && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                {w.brand}
                                            </span>
                                        )}
                                        <span className="font-semibold text-xs text-foreground line-clamp-1">
                                            {w.productName}
                                        </span>
                                        {w.category && (
                                            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                <Tag className="size-3 text-zinc-400" />
                                                {w.category}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>

                                {/* Retailer & Price */}
                                <TableCell className="py-3.5 text-xs text-zinc-600 dark:text-zinc-400">
                                    <div className="flex flex-col">
                                        {w.retailer ? (
                                            <span className="font-medium text-foreground inline-flex items-center gap-1">
                                                <Store className="size-3 text-zinc-400" />
                                                {w.retailer}
                                            </span>
                                        ) : (
                                            <span className="text-zinc-400">—</span>
                                        )}
                                        {w.price !== undefined && (
                                            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                                                {w.currency || "$"} {w.price}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>

                                {/* Purchase Date */}
                                <TableCell className="py-3.5 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                                    <span className="inline-flex items-center gap-1">
                                        {new Date(w.purchaseDate).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </span>
                                </TableCell>

                                {/* Expiry Date */}
                                <TableCell className="py-3.5 text-xs font-semibold text-foreground">
                                    <span className="inline-flex items-center gap-1">
                                        {new Date(w.warrantyExpiryDate).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </span>
                                </TableCell>

                                {/* Days Left */}
                                <TableCell className="py-3.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                    {status.daysText}
                                </TableCell>

                                {/* Status Badge */}
                                <TableCell className="py-3.5">
                                    <Badge
                                        variant={status.variant}
                                        className={cn("text-[11px] px-2.5 py-0.5 rounded-full inline-block", status.badgeClass)}
                                    >
                                        {status.label}
                                    </Badge>
                                </TableCell>

                                <TableCell className="py-3.5 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                                    <CustomDropdown
                                        trigger={
                                            <div className="size-8 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
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
                                                onClick: () => onEdit?.(w),
                                            },
                                            {
                                                id: "delete",
                                                leftIcon: <Trash2 className="size-3.5" />,
                                                label: "Delete",
                                                variant: "destructive",
                                                onClick: () => onDelete?.(w),
                                            },
                                        ]}
                                    />
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

export default CustomTable
