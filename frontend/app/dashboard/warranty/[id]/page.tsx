"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { User, Warranty } from "@/lib/types"
import { getExpiryStatus } from "@/components/common/CustomCard"
import { CustomNavbar } from "@/components/common/CustomNavbar"
import { ProfileModal } from "@/components/common/ProfileModal"
import { WarrantyFormDrawer } from "@/components/common/WarrantyFormDrawer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
    ArrowLeft,
    Calendar,
    Clock,
    DollarSign,
    ExternalLink,
    FileText,
    FileQuestion,
    Hash,
    Layers,
    Loader2,
    Pencil,
    Store,
    Tag,
    Trash2,
    AlertTriangle,
    ShieldAlert,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function WarrantyDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params?.id as string

    const [warranty, setWarranty] = React.useState<Warranty | null>(null)
    const [user, setUser] = React.useState<User | null>(null)
    const [loading, setLoading] = React.useState<boolean>(true)
    const [error, setError] = React.useState<string | null>(null)

    // UI Dialog & Drawer states
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<boolean>(false)
    const [isDeleting, setIsDeleting] = React.useState<boolean>(false)
    const [isEditDrawerOpen, setIsEditDrawerOpen] = React.useState<boolean>(false)
    const [isSavingEdit, setIsSavingEdit] = React.useState<boolean>(false)
    const [showProfileModal, setShowProfileModal] = React.useState<boolean>(false)

    // Theme state
    const [isDarkMode, setIsDarkMode] = React.useState<boolean>(true)

    React.useEffect(() => {
        const storedTheme = localStorage.getItem("theme")
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        const isDark = storedTheme === "dark" || (!storedTheme && prefersDark)
        setIsDarkMode(isDark)
        if (isDark) {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }, [])

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove("dark")
            localStorage.setItem("theme", "light")
            setIsDarkMode(false)
        } else {
            document.documentElement.classList.add("dark")
            localStorage.setItem("theme", "dark")
            setIsDarkMode(true)
        }
    }

    const fetchWarrantyAndUser = React.useCallback(async () => {
        if (!id) return
        setLoading(true)
        setError(null)

        try {
            const [warrantyRes, userRes] = await Promise.all([
                apiFetch<Warranty>(`/warranties/${id}`),
                apiFetch<User>("/auth/me").catch(() => null),
            ])

            if (warrantyRes.data) {
                setWarranty(warrantyRes.data)
            } else {
                setError("Warranty not found or you don't have permission to view it.")
            }

            if (userRes && (userRes as any).data) {
                setUser((userRes as any).data)
            }
        } catch (err: any) {
            setError(err.message || "Failed to load warranty details.")
        } finally {
            setLoading(false)
        }
    }, [id])

    React.useEffect(() => {
        fetchWarrantyAndUser()
    }, [fetchWarrantyAndUser])

    const handleLogout = async () => {
        try {
            await apiFetch("/auth/logout", { method: "POST" })
        } catch {
            // Ignore error
        } finally {
            window.location.href = "/login"
        }
    }

    const handleConnectDrive = () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        window.location.href = `${apiUrl}/auth/google/drive/connect`
    }

    const handleConfirmDelete = async () => {
        if (!warranty) return
        setIsDeleting(true)
        const name = warranty.productName
        try {
            await apiFetch(`/warranties/${warranty._id}`, {
                method: "DELETE",
            })
            toast.success(`"${name}" deleted successfully`)
            router.push("/dashboard")
        } catch (err: any) {
            toast.error(err.message || "Failed to delete warranty")
            setIsDeleting(false)
        }
    }

    const handleSaveEdit = async ({
        formValues,
    }: {
        formValues: Record<string, any>
        file: File | null
    }) => {
        if (!warranty) return
        setIsSavingEdit(true)
        try {
            const res = await apiFetch<Warranty>(`/warranties/${warranty._id}`, {
                method: "PUT",
                body: JSON.stringify({
                    ...formValues,
                    price: formValues.price ? Number(formValues.price) : undefined,
                    warrantyMonths: Number(formValues.warrantyMonths),
                }),
            })

            if (res.data) {
                setWarranty(res.data)
                toast.success(`"${res.data.productName}" updated successfully`)
                setIsEditDrawerOpen(false)
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to update warranty")
        } finally {
            setIsSavingEdit(false)
        }
    }

    const expiryStatus = warranty?.warrantyExpiryDate
        ? getExpiryStatus(warranty.warrantyExpiryDate)
        : null

    const formattedPurchaseDate = warranty?.purchaseDate
        ? new Date(warranty.purchaseDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : null

    const formattedExpiryDate = warranty?.warrantyExpiryDate
        ? new Date(warranty.warrantyExpiryDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : null

    const formattedPrice =
        warranty?.price !== undefined && warranty?.price !== null
            ? `${warranty.currency || "USD"} ${Number(warranty.price).toFixed(2)}`
            : null

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
            {/* Top Navigation */}
            <CustomNavbar
                user={user}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                handleLogout={handleLogout}
                handleConnectDrive={handleConnectDrive}
                setShowProfileModal={setShowProfileModal}
            />

            {/* Main Content */}
            <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* ================= LOADING STATE ================= */}
                {loading && (
                    <div className="space-y-6 animate-pulse">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-24 rounded-lg" />
                        </div>

                        {/* Header Skeleton */}
                        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-8 w-64 rounded-xl" />
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-5 w-20 rounded-full" />
                                        <Skeleton className="h-5 w-28 rounded-full" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-9 w-20 rounded-xl" />
                                    <Skeleton className="h-9 w-20 rounded-xl" />
                                </div>
                            </div>
                        </div>

                        {/* Details Skeleton */}
                        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                            <Skeleton className="h-5 w-40 rounded-lg" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <Skeleton key={i} className="h-16 rounded-xl" />
                                ))}
                            </div>
                        </div>

                        {/* Document Skeleton */}
                        <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
                            <Skeleton className="h-5 w-36 rounded-lg" />
                            <Skeleton className="h-20 rounded-xl" />
                        </div>
                    </div>
                )}

                {/* ================= ERROR / NOT FOUND STATE ================= */}
                {!loading && (error || !warranty) && (
                    <div className="py-12">
                        <Card className="max-w-md mx-auto rounded-2xl border-border bg-card shadow-lg text-center p-8 space-y-4">
                            <div className="size-12 mx-auto rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                                <ShieldAlert className="size-6" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold text-foreground">
                                    Warranty Not Found
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">
                                    {error || "The requested warranty item could not be found or you do not have permission to access it."}
                                </CardDescription>
                            </div>
                            <Button
                                onClick={() => router.push("/dashboard")}
                                className="w-full h-10 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                            >
                                <ArrowLeft className="size-4 mr-1.5" />
                                <span>Back to Dashboard</span>
                            </Button>
                        </Card>
                    </div>
                )}

                {/* ================= SUCCESS / DETAIL VIEW ================= */}
                {!loading && warranty && (
                    <div className="space-y-6 animate-in fade-in-50 duration-200">
                        {/* Navigation back link */}
                        <div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push("/dashboard")}
                                className="h-8 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg cursor-pointer flex items-center gap-1.5"
                            >
                                <ArrowLeft className="size-4" />
                                <span>Back to Dashboard</span>
                            </Button>
                        </div>

                        {/* 1. Header Card */}
                        <Card className="rounded-2xl border-border bg-card shadow-xs overflow-hidden">
                            <CardHeader className="p-6">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                                {warranty.productName}
                                            </h1>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                            {/* Category Badge */}
                                            <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                <Tag className="size-3 mr-1 text-muted-foreground" />
                                                {warranty.category || "General"}
                                            </Badge>

                                            {/* Status Badge */}
                                            {expiryStatus && (
                                                <Badge
                                                    variant={expiryStatus.variant}
                                                    className={cn(
                                                        "text-xs font-semibold px-2.5 py-0.5 rounded-full",
                                                        expiryStatus.badgeClass
                                                    )}
                                                >
                                                    <Clock className="size-3 mr-1" />
                                                    {expiryStatus.label} • {expiryStatus.daysText}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsEditDrawerOpen(true)}
                                            className="h-9 px-3.5 text-xs font-semibold rounded-xl cursor-pointer hover:bg-accent"
                                        >
                                            <Pencil className="size-3.5 mr-1.5 text-muted-foreground" />
                                            <span>Edit</span>
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="h-9 px-3.5 text-xs font-semibold rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 border-border cursor-pointer"
                                        >
                                            <Trash2 className="size-3.5 mr-1.5" />
                                            <span>Delete</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* 2. Key Details Section */}
                        <Card className="rounded-2xl border-border bg-card shadow-xs">
                            <CardHeader className="p-6 pb-4 border-b border-border">
                                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                    <Layers className="size-4 text-muted-foreground" />
                                    <span>Key Specifications</span>
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">
                                    Purchasing details, duration, and serial identifiers
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Retailer / Store */}
                                    {warranty.retailer && (
                                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                                            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                                                <Store className="size-3.5 text-muted-foreground" />
                                                Retailer / Store
                                            </span>
                                            <p className="text-sm font-bold text-foreground">
                                                {warranty.retailer}
                                            </p>
                                        </div>
                                    )}

                                    {/* Purchase Date */}
                                    {formattedPurchaseDate && (
                                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                                            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                                                <Calendar className="size-3.5 text-muted-foreground" />
                                                Purchase Date
                                            </span>
                                            <p className="text-sm font-bold text-foreground">
                                                {formattedPurchaseDate}
                                            </p>
                                        </div>
                                    )}

                                    {/* Price */}
                                    {formattedPrice && (
                                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                                            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                                                <DollarSign className="size-3.5 text-muted-foreground" />
                                                Purchase Price
                                            </span>
                                            <p className="text-sm font-bold text-foreground">
                                                {formattedPrice}
                                            </p>
                                        </div>
                                    )}

                                    {/* Warranty Duration */}
                                    {warranty.warrantyMonths !== undefined && (
                                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                                            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                                                <Clock className="size-3.5 text-muted-foreground" />
                                                Warranty Duration
                                            </span>
                                            <p className="text-sm font-bold text-foreground">
                                                {warranty.warrantyMonths} {warranty.warrantyMonths === 1 ? "Month" : "Months"}
                                            </p>
                                        </div>
                                    )}

                                    {/* Expiry Date */}
                                    {formattedExpiryDate && (
                                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                                            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                                                <Calendar className="size-3.5 text-muted-foreground" />
                                                Warranty Expiry Date
                                            </span>
                                            <p className="text-sm font-bold text-foreground">
                                                {formattedExpiryDate}
                                            </p>
                                        </div>
                                    )}

                                    {/* Brand / Manufacturer */}
                                    {warranty.brand && (
                                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                                            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                                                <Tag className="size-3.5 text-muted-foreground" />
                                                Brand / Manufacturer
                                            </span>
                                            <p className="text-sm font-bold text-foreground">
                                                {warranty.brand}
                                            </p>
                                        </div>
                                    )}

                                    {/* Model Number */}
                                    {warranty.modelNumber && (
                                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                                            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                                                <Hash className="size-3.5 text-muted-foreground" />
                                                Model Number
                                            </span>
                                            <p className="text-sm font-bold font-mono text-foreground">
                                                {warranty.modelNumber}
                                            </p>
                                        </div>
                                    )}

                                    {/* Serial Number */}
                                    {warranty.serialNumber && (
                                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                                            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                                                <Hash className="size-3.5 text-muted-foreground" />
                                                Serial Number
                                            </span>
                                            <p className="text-sm font-bold font-mono text-foreground">
                                                {warranty.serialNumber}
                                            </p>
                                        </div>
                                    )}

                                    {/* Additional Notes */}
                                    {warranty.notes && (
                                        <div className="col-span-1 sm:col-span-2 p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                                            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                                                <FileText className="size-3.5 text-muted-foreground" />
                                                Additional Notes
                                            </span>
                                            <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                                                {warranty.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. Document / Receipt Section */}
                        <Card className="rounded-2xl border-border bg-card shadow-xs">
                            <CardHeader className="p-6 pb-4 border-b border-border">
                                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                    <FileText className="size-4 text-muted-foreground" />
                                    <span>Receipt & Warranty Document</span>
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">
                                    Original digital receipt or warranty document stored in cloud
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-6">
                                {warranty.driveFileUrl ? (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/30">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                <FileText className="size-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-foreground truncate">
                                                    {warranty.productName} Receipt Document
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Stored securely in your Google Drive Vault
                                                </p>
                                            </div>
                                        </div>

                                        <a
                                            href={warranty.driveFileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="shrink-0 w-full sm:w-auto"
                                        >
                                            <Button
                                                size="sm"
                                                className="w-full sm:w-auto h-9 px-4 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer flex items-center justify-center gap-1.5"
                                            >
                                                <ExternalLink className="size-3.5" />
                                                <span>Open in Google Drive</span>
                                            </Button>
                                        </a>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center rounded-xl border border-dashed border-border bg-muted/20 space-y-2">
                                        <div className="size-10 mx-auto rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                                            <FileQuestion className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-foreground">
                                                No receipt attached
                                            </p>
                                            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto mt-0.5">
                                                A receipt or warranty document has not been uploaded for this item yet. You can attach one by editing this warranty.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>

            {/* Edit Item Drawer */}
            <WarrantyFormDrawer
                isOpen={isEditDrawerOpen}
                onOpenChange={setIsEditDrawerOpen}
                title="Edit Item"
                description="Update product specifications, purchase details, or reminder channels"
                initialData={warranty}
                onSubmit={handleSaveEdit}
                isLoading={isSavingEdit}
            />

            {/* Delete Confirmation Alert Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent className="rounded-2xl border-border bg-card shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-bold text-foreground">
                            Delete &ldquo;{warranty?.productName}&rdquo;?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                            This action cannot be undone. This will permanently delete this item from your warranty vault and cancel all upcoming expiration reminders.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-2 pt-2">
                        <AlertDialogCancel
                            disabled={isDeleting}
                            className="h-9 px-4 text-xs font-semibold rounded-xl cursor-pointer"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="h-9 px-4 text-xs font-semibold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                <span>Delete Item</span>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                user={user}
                onUserUpdate={(updatedUser) => setUser(updatedUser)}
                handleConnectDrive={handleConnectDrive}
            />
        </div>
    )
}
