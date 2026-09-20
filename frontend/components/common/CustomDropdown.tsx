"use client"

import * as React from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface DropdownItemConfig {
    id?: string
    leftIcon?: React.ReactNode
    label: string
    rightContent?: React.ReactNode
    onClick?: (e: React.MouseEvent) => void
    variant?: "default" | "destructive"
    disabled?: boolean
    separatorBefore?: boolean
    separatorAfter?: boolean
    className?: string
    leftIconClassName?: string
    labelClassName?: string
    rightContentClassName?: string
    closeOnClick?: boolean
}

export interface CustomDropdownProps {
    trigger: React.ReactNode
    items?: DropdownItemConfig[]
    header?: React.ReactNode
    footer?: React.ReactNode
    align?: "start" | "center" | "end"
    side?: "top" | "right" | "bottom" | "left"
    sideOffset?: number
    alignOffset?: number
    className?: string
    triggerClassName?: string
    itemClassName?: string
    leftIconClassName?: string
    labelClassName?: string
    rightContentClassName?: string
    headerClassName?: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children?: React.ReactNode
}

export function CustomDropdown({
    trigger,
    items,
    header,
    footer,
    align = "start",
    side = "bottom",
    sideOffset = 6,
    alignOffset = 0,
    className,
    triggerClassName,
    itemClassName,
    leftIconClassName,
    labelClassName,
    rightContentClassName,
    headerClassName,
    open,
    onOpenChange,
    children,
}: CustomDropdownProps) {
    return (
        <DropdownMenu open={open} onOpenChange={onOpenChange}>
            <DropdownMenuTrigger
                className={cn(
                    "outline-none cursor-pointer select-none transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full",
                    triggerClassName
                )}
            >
                {trigger}
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align={align}
                side={side}
                sideOffset={sideOffset}
                alignOffset={alignOffset}
                className={cn(
                    "w-56 p-1.5 shadow-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl",
                    className
                )}
            >
                {/* Optional Header */}
                {header && (
                    <>
                        <DropdownMenuLabel className={cn("p-2 font-normal text-xs text-zinc-500 dark:text-zinc-400", headerClassName)}>
                            {header}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                    </>
                )}

                {/* Items list */}
                {items && items.length > 0 && (
                    <DropdownMenuGroup>
                        {items.map((item, index) => {
                            const key = item.id || `dropdown-item-${index}`
                            const isDestructive = item.variant === "destructive"

                            return (
                                <React.Fragment key={key}>
                                    {item.separatorBefore && <DropdownMenuSeparator />}
                                    <DropdownMenuItem
                                        variant={item.variant}
                                        disabled={item.disabled}
                                        onClick={(e) => {
                                            if (item.disabled) return
                                            if (item.closeOnClick === false) {
                                                e.preventDefault()
                                            }
                                            item.onClick?.(e)
                                        }}
                                        className={cn(
                                            "cursor-pointer rounded-lg px-2.5 py-2 text-xs font-semibold flex items-center justify-between gap-2.5 transition-colors",
                                            isDestructive
                                                ? "text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/40"
                                                : "text-zinc-700 dark:text-zinc-200 focus:bg-zinc-100 dark:focus:bg-zinc-800",
                                            itemClassName,
                                            item.className
                                        )}
                                    >
                                        {/*Left Icon*/}
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            {item.leftIcon && (
                                                <span
                                                    className={cn(
                                                        "shrink-0 flex items-center justify-center [&_svg]:size-4",
                                                        isDestructive ? "text-rose-500" : "text-zinc-500 dark:text-zinc-400",
                                                        leftIconClassName,
                                                        item.leftIconClassName
                                                    )}
                                                >
                                                    {item.leftIcon}
                                                </span>
                                            )}
                                            <span
                                                className={cn(
                                                    "truncate select-none",
                                                    labelClassName,
                                                    item.labelClassName
                                                )}
                                            >
                                                {item.label}
                                            </span>
                                        </div>

                                        {/* Right Content */}
                                        {item.rightContent && (
                                            <div
                                                className={cn(
                                                    "shrink-0 flex items-center justify-end pl-2",
                                                    rightContentClassName,
                                                    item.rightContentClassName
                                                )}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                }}
                                            >
                                                {item.rightContent}
                                            </div>
                                        )}
                                    </DropdownMenuItem>
                                    {item.separatorAfter && <DropdownMenuSeparator />}
                                </React.Fragment>
                            )
                        })}
                    </DropdownMenuGroup>
                )}

                {/* Optional Custom Children */}
                {children}

                {/* Optional Footer */}
                {footer && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-1.5">{footer}</div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default CustomDropdown
