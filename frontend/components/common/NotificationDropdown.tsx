"use client"

import * as React from "react"
import { apiFetch } from "@/lib/api"
import { NotificationItem, Warranty } from "@/lib/types"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Bell,
    BellOff,
    Check,
    CheckCheck,
    Trash2,
    X,
    Mail,
    MessageSquare,
    Globe,
    Calendar,
    AlertCircle,
    Clock,
    Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { WarrantyQuickViewModal } from "@/components/common/WarrantyQuickViewModal"

export interface NotificationDropdownProps {
    className?: string
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
    const [isOpen, setIsOpen] = React.useState<boolean>(false)
    const [notifications, setNotifications] = React.useState<NotificationItem[]>([])
    const [unreadCount, setUnreadCount] = React.useState<number>(0)
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [selectedWarranty, setSelectedWarranty] = React.useState<Warranty | null>(null)
    const [isQuickViewOpen, setIsQuickViewOpen] = React.useState<boolean>(false)

    const dropdownRef = React.useRef<HTMLDivElement>(null)

    const fetchNotifications = React.useCallback(async () => {
        try {
            const res = await apiFetch<{
                notifications: NotificationItem[]
                unreadCount: number
            }>("/notifications")
            if (res.data) {
                setNotifications(res.data.notifications || [])
                setUnreadCount(res.data.unreadCount || 0)
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err)
        }
    }, [])

    React.useEffect(() => {
        fetchNotifications()
        // Poll notifications periodically (every 60s)
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [fetchNotifications])

    // Handle outside clicks to close dropdown
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen])

    const handleMarkAllRead = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await apiFetch("/notifications/read-all", { method: "PATCH" })
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
            setUnreadCount(0)
            toast.success("All notifications marked as read")
        } catch (err: any) {
            toast.error(err.message || "Failed to mark notifications as read")
        }
    }

    const handleClearAll = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await apiFetch("/notifications", { method: "DELETE" })
            setNotifications([])
            setUnreadCount(0)
            toast.success("Notifications cleared")
        } catch (err: any) {
            toast.error(err.message || "Failed to clear notifications")
        }
    }

    const handleClearSingle = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        try {
            await apiFetch(`/notifications/${id}`, { method: "DELETE" })
            setNotifications((prev) => {
                const updated = prev.filter((n) => n._id !== id)
                setUnreadCount(updated.filter((n) => !n.isRead).length)
                return updated
            })
        } catch (err: any) {
            toast.error(err.message || "Failed to dismiss notification")
        }
    }

    const handleNotificationClick = async (notification: NotificationItem) => {
        // Mark as read locally and remotely
        if (!notification.isRead) {
            try {
                apiFetch(`/notifications/${notification._id}/read`, { method: "PATCH" })
                setNotifications((prev) =>
                    prev.map((n) =>
                        n._id === notification._id ? { ...n, isRead: true } : n
                    )
                )
                setUnreadCount((prev) => Math.max(0, prev - 1))
            } catch (err) {
                console.error("Failed to mark notification read", err)
            }
        }

        // Open quick preview popup
        if (notification.product && typeof notification.product === "object") {
            setSelectedWarranty(notification.product)
            setIsQuickViewOpen(true)
            setIsOpen(false)
        }
    }

    return (
        <>
            <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
                {/* Notification Bell Button with Tooltip */}
                <Tooltip>
                    <TooltipTrigger
                        type="button"
                        onClick={() => {
                            setIsOpen(!isOpen)
                            if (!isOpen) {
                                fetchNotifications()
                            }
                        }}
                        className="size-9 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring relative"
                        aria-expanded={isOpen}
                        aria-haspopup="true"
                    >
                        <Bell className="size-5" />
                        <span className="sr-only">Notifications</span>

                        {/* Red Badge Indicator */}
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex min-w-4.5 h-4.5 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-in zoom-in-50">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </TooltipTrigger>
                    {!isOpen && (
                        <TooltipContent side="bottom" className="text-xs font-medium">
                            {unreadCount > 0
                                ? `Notifications (${unreadCount} unread)`
                                : "Notifications"}
                        </TooltipContent>
                    )}
                </Tooltip>

                {/* Dropdown Menu Panel */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-card text-card-foreground shadow-2xl border border-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-foreground">
                                    Notifications
                                </span>
                                {unreadCount > 0 ? (
                                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 font-bold">
                                        {unreadCount} new
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-semibold">
                                        {notifications.length}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={handleMarkAllRead}
                                        title="Mark all as read"
                                        className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                                    >
                                        <CheckCheck className="size-3.5" />
                                        <span className="sr-only">Mark all read</span>
                                    </Button>
                                )}
                                {notifications.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={handleClearAll}
                                        title="Clear all notifications"
                                        className="size-7 rounded-lg text-muted-foreground hover:text-rose-500"
                                    >
                                        <Trash2 className="size-3.5" />
                                        <span className="sr-only">Clear all</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Notification Items List */}
                        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center space-y-2">
                                    <div className="size-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                                        <BellOff className="size-5" />
                                    </div>
                                    <p className="text-xs font-bold text-foreground">
                                        All caught up!
                                    </p>
                                    <p className="text-[11px] text-muted-foreground max-w-[200px] mx-auto">
                                        No active reminders or notifications right now.
                                    </p>
                                </div>
                            ) : (
                                notifications.map((item) => {
                                    const productName =
                                        typeof item.product === "object"
                                            ? item.product?.productName
                                            : "Product Warranty"

                                    const scheduledDateStr = item.scheduledDate
                                        ? new Date(item.scheduledDate).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                          })
                                        : ""

                                    return (
                                        <div
                                            key={item._id}
                                            onClick={() => handleNotificationClick(item)}
                                            className={cn(
                                                "p-3.5 flex items-start gap-3 hover:bg-muted/50 cursor-pointer transition-colors group relative",
                                                !item.isRead && "bg-primary/[0.03] dark:bg-primary/[0.06]"
                                            )}
                                        >
                                            {/* Channel Icon */}
                                            <div className="size-8 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0 mt-0.5 text-foreground">
                                                {item.channel === "email" ? (
                                                    <Mail className="size-4 text-primary" />
                                                ) : item.channel === "whatsapp" ? (
                                                    <MessageSquare className="size-4 text-emerald-500" />
                                                ) : item.channel === "push" ? (
                                                    <Globe className="size-4 text-blue-500" />
                                                ) : (
                                                    <Bell className="size-4 text-amber-500" />
                                                )}
                                            </div>

                                            {/* Text Content */}
                                            <div className="flex-1 min-w-0 space-y-0.5">
                                                <div className="flex items-center justify-between gap-1">
                                                    <p className="text-xs font-bold text-foreground truncate">
                                                        {productName}
                                                    </p>
                                                    {!item.isRead && (
                                                        <span className="size-2 rounded-full bg-rose-500 shrink-0" />
                                                    )}
                                                </div>

                                                <p className="text-[11px] text-muted-foreground leading-tight">
                                                    Warranty expires in{" "}
                                                    <span className="font-semibold text-foreground">
                                                        {item.daysBeforeExpiry}{" "}
                                                        {item.daysBeforeExpiry === 1 ? "day" : "days"}
                                                    </span>
                                                </p>

                                                <div className="flex items-center gap-2 pt-1 text-[10px] text-muted-foreground">
                                                    <span className="flex items-center gap-1 font-medium">
                                                        <Calendar className="size-3" />
                                                        {scheduledDateStr}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="uppercase font-semibold tracking-wider">
                                                        {item.channel}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Dismiss Single Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => handleClearSingle(e, item._id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
                                                title="Dismiss"
                                            >
                                                <X className="size-3.5" />
                                                <span className="sr-only">Dismiss</span>
                                            </button>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-2.5 bg-muted/20 border-t border-border text-center">
                                <p className="text-[10px] text-muted-foreground font-medium">
                                    Click any notification to preview brief warranty details
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Warranty Quick Preview Modal */}
            <WarrantyQuickViewModal
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
                warranty={selectedWarranty}
            />
        </>
    )
}

export default NotificationDropdown
