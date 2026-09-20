"use client"

import { useEffect, useState, useMemo } from "react"
import { apiFetch } from "@/lib/api"
import { User, Warranty } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { CustomNavbar } from "@/components/common/CustomNavbar"
import { CustomCard, getExpiryStatus } from "@/components/common/CustomCard"
import { CustomTable } from "@/components/common/CustomTable"
import { ViewToggle, type ViewMode } from "@/components/common/ViewToggle"
import { WarrantyFormDrawer } from "@/components/common/WarrantyFormDrawer"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    HardDrive,
    Search,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    FileText,
    User as UserIcon,
    X,
    Mail,
    Bell,
    Check,
    Plus,
    Filter,
} from "lucide-react"

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null)
    const [warranties, setWarranties] = useState<Warranty[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [filter, setFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [viewMode, setViewMode] = useState<ViewMode>("grid")
    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false)
    const [isDarkMode, setIsDarkMode] = useState<boolean>(true)
    const [showProfileModal, setShowProfileModal] = useState<boolean>(false)

    // Drawer state for Add and Edit Item
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
    const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null)
    const [isSaving, setIsSaving] = useState<boolean>(false)

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

    // Theme initialization & sync
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme")
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        const isDark = storedTheme === "dark" || (!storedTheme && prefersDark)

        if (isDark) {
            document.documentElement.classList.add("dark")
            setIsDarkMode(true)
        } else {
            document.documentElement.classList.remove("dark")
            setIsDarkMode(false)
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

    const fetchWarranties = async () => {
        try {
            const res = await apiFetch<Warranty[]>("/warranties")
            setWarranties(res.data || [])
        } catch (err) {
            console.error("Failed to fetch warranties", err)
        }
    }

    useEffect(() => {
        Promise.all([
            apiFetch<User>("/auth/me"),
            apiFetch<Warranty[]>("/warranties")
        ])
            .then(([userRes, warrantiesRes]) => {
                setUser(userRes.data)
                setWarranties(warrantiesRes.data || [])
            })
            .catch(() => {
                window.location.href = "/login"
            })
            .finally(() => setLoading(false))
    }, [])

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await apiFetch("/auth/logout", { method: "POST" })
        } catch {
            // Ignore error and proceed to login redirect
        } finally {
            window.location.href = "/login"
        }
    }

    const handleConnectDrive = () => {
        window.location.href = `${apiUrl}/auth/google/drive/connect`
    }

    const handleOpenAdd = () => {
        setSelectedWarranty(null)
        setIsDrawerOpen(true)
    }

    const handleOpenEdit = (warranty: Warranty) => {
        setSelectedWarranty(warranty)
        setIsDrawerOpen(true)
    }

    const handleDeleteWarranty = async (warranty: Warranty) => {
        if (!confirm(`Are you sure you want to delete "${warranty.productName}"?`)) return
        try {
            await apiFetch(`/warranties/${warranty._id}`, { method: "DELETE" })
            setWarranties((prev) => prev.filter((w) => w._id !== warranty._id))
        } catch (err: any) {
            alert(err.message || "Failed to delete warranty")
        }
    }

    const handleSaveWarranty = async ({
        formValues,
        file,
    }: {
        formValues: Record<string, any>
        file: File | null
    }) => {
        setIsSaving(true)
        try {
            if (selectedWarranty) {
                // Edit existing warranty (PUT)
                const res = await apiFetch<Warranty>(`/warranties/${selectedWarranty._id}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        ...formValues,
                        price: formValues.price ? Number(formValues.price) : undefined,
                        warrantyMonths: Number(formValues.warrantyMonths),
                    }),
                })
                if (res.data) {
                    setWarranties((prev) =>
                        prev.map((w) => (w._id === selectedWarranty._id ? res.data : w))
                    )
                }
            } else {
                // Add new warranty (POST multipart)
                const formData = new FormData()
                Object.entries(formValues).forEach(([key, val]) => {
                    if (val !== undefined && val !== null && val !== "") {
                        formData.append(key, String(val))
                    }
                })
                if (file) {
                    formData.append("invoice", file)
                }

                const response = await fetch(`${apiUrl}/warranties`, {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                })

                const result = await response.json()
                if (!response.ok) {
                    throw new Error(result.message || "Failed to create warranty")
                }

                await fetchWarranties()
            }

            setIsDrawerOpen(false)
            setSelectedWarranty(null)
        } catch (err: any) {
            alert(err.message || "Failed to save warranty")
        } finally {
            setIsSaving(false)
        }
    }

    // Stats calculations
    const stats = useMemo(() => {
        let active = 0
        let expiringSoon = 0
        let expired = 0

        warranties.forEach((w) => {
            const status = getExpiryStatus(w.warrantyExpiryDate)
            if (status.days < 0) expired++
            else if (status.days <= 30) expiringSoon++
            else active++
        })

        return {
            total: warranties.length,
            active,
            expiringSoon,
            expired
        }
    }, [warranties])

    // Filtered & Searched warranties
    const filteredWarranties = useMemo(() => {
        return warranties.filter((w) => {
            const status = getExpiryStatus(w.warrantyExpiryDate)
            const statusSlug = status.label.toLowerCase().replace(" ", "-")

            // Tab Filter Match
            const matchesFilter = filter === "all" || statusSlug === filter

            // Search Query Match
            const query = searchQuery.toLowerCase().trim()
            const matchesSearch =
                !query ||
                w.productName.toLowerCase().includes(query) ||
                (w.brand && w.brand.toLowerCase().includes(query)) ||
                (w.category && w.category.toLowerCase().includes(query)) ||
                (w.retailer && w.retailer.toLowerCase().includes(query)) ||
                (w.modelNumber && w.modelNumber.toLowerCase().includes(query))

            return matchesFilter && matchesSearch
        })
    }, [warranties, filter, searchQuery])

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-48 rounded-xl" />
                    <Skeleton className="h-10 w-36 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Skeleton className="h-28 rounded-2xl" />
                    <Skeleton className="h-28 rounded-2xl" />
                    <Skeleton className="h-28 rounded-2xl" />
                    <Skeleton className="h-28 rounded-2xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-56 rounded-2xl" />
                    <Skeleton className="h-56 rounded-2xl" />
                    <Skeleton className="h-56 rounded-2xl" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-50/80 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
            {/* Top Navigation Bar */}
            <CustomNavbar
                user={user}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                handleLogout={handleLogout}
                isLoggingOut={isLoggingOut}
                handleConnectDrive={handleConnectDrive}
                setShowProfileModal={setShowProfileModal}
            />

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Stats Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Warranties */}
                    <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Items</p>
                                <p className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">{stats.total}</p>
                            </div>
                            <div className="size-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center">
                                <FileText className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Protected */}
                    <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Active Coverage</p>
                                <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{stats.active}</p>
                            </div>
                            <div className="size-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <CheckCircle2 className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Expiring Soon */}
                    <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Expiring Soon</p>
                                <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{stats.expiringSoon}</p>
                            </div>
                            <div className="size-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <AlertTriangle className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Expired */}
                    <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Expired</p>
                                <p className="text-2xl font-bold mt-1 text-rose-600 dark:text-rose-400">{stats.expired}</p>
                            </div>
                            <div className="size-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                                <XCircle className="size-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search & Action Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Search input (positioned where tabs used to be) */}
                    <div className="relative w-full sm:w-80 md:w-96">
                        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by name, brand, store..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-9 pr-4 rounded-xl text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-all placeholder:text-zinc-400 shadow-sm"
                        />
                    </div>

                    {/* Right: Actions (Add Item, Filter with tooltip, ViewToggle) */}
                    <div className="flex items-center gap-2 sm:gap-2.5 self-end sm:self-auto">
                        {/* Add Item Button */}
                        <button
                            type="button"
                            onClick={handleOpenAdd}
                            aria-label="Add Item"
                            className="h-10 px-3.5 rounded-xl bg-zinc-200/70 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 border border-zinc-200/80 dark:border-zinc-800/80 text-foreground transition-all flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <Plus className="size-4 text-muted-foreground" />
                            <span>Add Item</span>
                        </button>

                        {/* Filter Button */}
                        <Tooltip>
                            <TooltipTrigger
                                type="button"
                                onClick={() => {
                                    console.log("Filter clicked")
                                }}
                                aria-label="Filter"
                                className="size-10 rounded-xl bg-zinc-200/70 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 border border-zinc-200/80 dark:border-zinc-800/80 text-foreground transition-all flex items-center justify-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <Filter className="size-4 text-muted-foreground" />
                                <span className="sr-only">Filter</span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs font-medium">
                                Filter
                            </TooltipContent>
                        </Tooltip>

                        {/* View Switcher (Grid / List) */}
                        <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    </div>
                </div>

                {/* Warranties Content (Grid or List View) */}
                {filteredWarranties.length === 0 ? (
                    <Card className="rounded-2xl border-dashed border-2 border-zinc-200 dark:border-zinc-800 bg-transparent">
                        <CardContent className="py-16 text-center space-y-3">
                            <div className="size-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center">
                                <Search className="size-6" />
                            </div>
                            <CardTitle className="text-base font-bold">No warranties found</CardTitle>
                            <CardDescription className="text-xs max-w-sm mx-auto">
                                {searchQuery
                                    ? `No results match "${searchQuery}". Try a different keyword or filter.`
                                    : "You don't have any items registered under this category yet."}
                            </CardDescription>
                            {searchQuery && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSearchQuery("")}
                                    className="mt-2 text-xs font-semibold rounded-xl"
                                >
                                    Clear Search
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredWarranties.map((w) => (
                            <CustomCard
                                key={w._id}
                                warranty={w}
                                onClick={(item) => {
                                    console.log("Viewing warranty details for:", item._id)
                                }}
                                onEdit={(item) => handleOpenEdit(item)}
                                onDelete={(item) => handleDeleteWarranty(item)}
                            />
                        ))}
                    </div>
                ) : (
                    <CustomTable
                        data={filteredWarranties}
                        onRowClick={(item) => {
                            console.log("Viewing warranty details for:", item._id)
                        }}
                        onEdit={(item) => handleOpenEdit(item)}
                        onDelete={(item) => handleDeleteWarranty(item)}
                    />
                )}
            </main>

            {/* Add & Edit Item Drawer (Right Slide-in Wizard) */}
            <WarrantyFormDrawer
                isOpen={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                title={selectedWarranty ? "Edit Item" : "Add Item"}
                description={
                    selectedWarranty
                        ? "Update product details, warranty timeline, or store receipts."
                        : undefined
                }
                initialData={selectedWarranty}
                onSubmit={handleSaveWarranty}
                isLoading={isSaving}
            />

            {/* Profile & Account Details Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-md rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                                    <UserIcon className="size-4" />
                                </div>
                                <CardTitle className="text-base font-bold">Account Profile</CardTitle>
                            </div>
                            <Button
                                onClick={() => setShowProfileModal(false)}
                                variant="ghost"
                                size="sm"
                                className="size-8 p-0 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                            >
                                <X className="size-4" />
                            </Button>
                        </CardHeader>

                        <CardContent className="p-6 space-y-5">
                            {/* Avatar & Basic Info */}
                            <div className="flex items-center gap-4">
                                <Avatar className="size-14 ring-2 ring-border">
                                    <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                                        {user?.name ? user.name[0].toUpperCase() : "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">{user?.name}</h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                                        <Mail className="size-3" /> {user?.email}
                                    </p>
                                </div>
                            </div>

                            {/* Storage Integration Status */}
                            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                        <HardDrive className="size-4 text-zinc-600 dark:text-zinc-400" />
                                        Google Drive Storage
                                    </span>
                                    {user?.driveConnected ? (
                                        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px]">
                                            Connected
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-amber-600 border-amber-300 text-[10px]">
                                            Not Connected
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                    {user?.driveConnected
                                        ? "Receipts and warranty invoices are securely uploaded directly to your dedicated Google Drive Vault."
                                        : "Connect your Google Drive to enable direct receipt file backup."}
                                </p>
                                {!user?.driveConnected && (
                                    <Button
                                        onClick={handleConnectDrive}
                                        size="sm"
                                        className="w-full mt-2 text-xs font-semibold rounded-xl"
                                    >
                                        Connect Google Drive
                                    </Button>
                                )}
                            </div>

                            {/* Notification Preferences */}
                            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-2">
                                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                    <Bell className="size-4 text-amber-500" />
                                    Active Reminder Intervals
                                </span>
                                <div className="flex items-center gap-2 pt-1">
                                    {(user?.preferences?.reminderDaysBefore || [30, 7, 1]).map((days) => (
                                        <span
                                            key={days}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700"
                                        >
                                            <Check className="size-3 text-emerald-500" />
                                            {days}d before
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}