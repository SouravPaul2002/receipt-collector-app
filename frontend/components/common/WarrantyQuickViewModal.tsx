"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { Warranty } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Calendar,
    Store,
    DollarSign,
    Tag,
    Hash,
    Clock,
    ArrowUpRight,
    X,
    ShieldAlert,
    ShieldCheck,
    Mail,
    MessageSquare,
    Globe,
    Bell,
} from "lucide-react"

export interface WarrantyQuickViewModalProps {
    isOpen: boolean
    onClose: () => void
    warranty: Warranty | null
}

function getExpiryStatus(expiryDateStr?: string) {
    if (!expiryDateStr) return null

    const expiry = new Date(expiryDateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    expiry.setHours(0, 0, 0, 0)

    const diffTime = expiry.getTime() - today.getTime()
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (days < 0) {
        return {
            label: "Expired",
            badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 font-semibold",
            daysText: `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`,
            isExpired: true,
            isExpiringSoon: false,
            days,
        }
    }
    if (days <= 30) {
        return {
            label: "Expiring Soon",
            badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 font-semibold",
            daysText: `${days} day${days === 1 ? "" : "s"} left`,
            isExpired: false,
            isExpiringSoon: true,
            days,
        }
    }
    return {
        label: "Active Warranty",
        badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40 font-semibold",
        daysText: `${days} days remaining`,
        isExpired: false,
        isExpiringSoon: false,
        days,
    }
}

export function WarrantyQuickViewModal({
    isOpen,
    onClose,
    warranty,
}: WarrantyQuickViewModalProps) {
    const router = useRouter()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted || !isOpen || !warranty) return null

    const expiryStatus = getExpiryStatus(warranty.warrantyExpiryDate)

    const formattedPurchaseDate = warranty.purchaseDate
        ? new Date(warranty.purchaseDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
          })
        : null

    const formattedExpiryDate = warranty.warrantyExpiryDate
        ? new Date(warranty.warrantyExpiryDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
          })
        : null

    const formattedPrice =
        warranty.price !== undefined && warranty.price !== null
            ? `${warranty.currency || "INR"} ${Number(warranty.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
            : null

    const handleViewFullDetails = () => {
        onClose()
        router.push(`/dashboard/warranty/${warranty._id}`)
    }

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            {/* Backdrop click listener */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            {/* Modal Dialog Card */}
            <div className="relative w-full max-w-lg bg-card text-card-foreground border border-border rounded-2xl shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-border bg-muted/20">
                    <div className="space-y-1 pr-6">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight line-clamp-1">
                                {warranty.productName}
                            </h3>
                            {warranty.category && (
                                <Badge variant="secondary" className="text-[11px] font-semibold">
                                    {warranty.category}
                                </Badge>
                            )}
                        </div>
                        {warranty.brand && (
                            <p className="text-xs text-muted-foreground font-medium">
                                By {warranty.brand}
                            </p>
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onClose}
                        className="rounded-full shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                        <X className="size-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>

                {/* Expiry Banner */}
                {expiryStatus && (
                    <div
                        className={`px-5 py-3 border-b border-border flex items-center justify-between gap-3 text-xs ${
                            expiryStatus.isExpired
                                ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                : expiryStatus.isExpiringSoon
                                ? "bg-amber-500/10 text-amber-800 dark:text-amber-300"
                                : "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                        }`}
                    >
                        <div className="flex items-center gap-2 font-semibold">
                            {expiryStatus.isExpired ? (
                                <ShieldAlert className="size-4 text-rose-500 shrink-0" />
                            ) : (
                                <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                            )}
                            <span>{expiryStatus.label}</span>
                        </div>
                        <span className="font-bold text-[11px] px-2.5 py-0.5 rounded-full bg-background/80 shadow-xs border border-border">
                            {expiryStatus.daysText}
                        </span>
                    </div>
                )}

                {/* Quick Info Grid */}
                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        {/* Purchase Date */}
                        {formattedPurchaseDate && (
                            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                                <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                                    <Calendar className="size-3" />
                                    Purchase Date
                                </span>
                                <p className="font-bold text-foreground">
                                    {formattedPurchaseDate}
                                </p>
                            </div>
                        )}

                        {/* Expiry Date */}
                        {formattedExpiryDate && (
                            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                                <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                                    <Clock className="size-3" />
                                    Expiry Date
                                </span>
                                <p className="font-bold text-foreground">
                                    {formattedExpiryDate}
                                </p>
                            </div>
                        )}

                        {/* Retailer */}
                        {warranty.retailer && (
                            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                                <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                                    <Store className="size-3" />
                                    Retailer
                                </span>
                                <p className="font-bold text-foreground truncate">
                                    {warranty.retailer}
                                </p>
                            </div>
                        )}

                        {/* Price */}
                        {formattedPrice && (
                            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                                <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                                    <DollarSign className="size-3" />
                                    Price
                                </span>
                                <p className="font-bold text-foreground">
                                    {formattedPrice}
                                </p>
                            </div>
                        )}

                        {/* Model Number */}
                        {warranty.modelNumber && (
                            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                                <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                                    <Tag className="size-3" />
                                    Model No.
                                </span>
                                <p className="font-mono font-bold text-foreground truncate">
                                    {warranty.modelNumber}
                                </p>
                            </div>
                        )}

                        {/* Serial Number */}
                        {warranty.serialNumber && (
                            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                                <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                                    <Hash className="size-3" />
                                    Serial No.
                                </span>
                                <p className="font-mono font-bold text-foreground truncate">
                                    {warranty.serialNumber}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Active Notification Channels & Reminder Intervals */}
                    <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                                <Bell className="size-3.5 text-muted-foreground" />
                                Reminder Channels
                            </span>
                            <div className="flex items-center gap-1.5">
                                {warranty.notificationChannels?.email && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 gap-1 font-medium bg-background">
                                        <Mail className="size-2.5 text-primary" />
                                        Email
                                    </Badge>
                                )}
                                {warranty.notificationChannels?.whatsapp && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 gap-1 font-medium bg-background">
                                        <MessageSquare className="size-2.5 text-emerald-500" />
                                        WhatsApp
                                    </Badge>
                                )}
                                {warranty.notificationChannels?.webPush && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 gap-1 font-medium bg-background">
                                        <Globe className="size-2.5 text-blue-500" />
                                        Web Push
                                    </Badge>
                                )}
                                {!warranty.notificationChannels?.email &&
                                    !warranty.notificationChannels?.whatsapp &&
                                    !warranty.notificationChannels?.webPush && (
                                        <span className="text-[10px] text-muted-foreground">None configured</span>
                                    )}
                            </div>
                        </div>

                        {warranty.reminderDaysBefore && warranty.reminderDaysBefore.length > 0 && (
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1 border-t border-border/50">
                                <span>Alert schedule:</span>
                                <span className="font-semibold text-foreground">
                                    {warranty.reminderDaysBefore.map((d) => `${d}d`).join(", ")} before expiry
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Notes (if any) */}
                    {warranty.notes && (
                        <div className="p-3 rounded-xl bg-muted/20 border border-border text-xs space-y-1">
                            <span className="text-[10px] font-semibold text-muted-foreground">Notes</span>
                            <p className="text-foreground text-[11px] line-clamp-3 leading-relaxed whitespace-pre-wrap">
                                {warranty.notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        className="rounded-xl text-xs font-semibold"
                    >
                        Close
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleViewFullDetails}
                        className="rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 shadow-sm"
                    >
                        View Full Page
                        <ArrowUpRight className="size-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    )

    return createPortal(modalContent, document.body)
}

export default WarrantyQuickViewModal

