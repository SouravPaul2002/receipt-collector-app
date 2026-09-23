"use client"

import * as React from "react"
import { User } from "@/lib/types"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
    Field,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field"
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
import {
    User as UserIcon,
    Mail,
    HardDrive,
    Bell,
    Clock,
    Pencil,
    X,
    Check,
    Loader2,
    MessageSquare,
    Globe,
    Unlink,
} from "lucide-react"

export interface ProfileModalProps {
    isOpen: boolean
    onClose: () => void
    user: User | null
    onUserUpdate: (updatedUser: User) => void
    handleConnectDrive: () => void
}

export function ProfileModal({
    isOpen,
    onClose,
    user,
    onUserUpdate,
    handleConnectDrive,
}: ProfileModalProps) {
    const [isEditMode, setIsEditMode] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)
    const [showDisconnectConfirm, setShowDisconnectConfirm] = React.useState(false)
    const [isDisconnecting, setIsDisconnecting] = React.useState(false)

    // Form fields for Edit Mode
    const [editName, setEditName] = React.useState("")
    const [notifications, setNotifications] = React.useState({
        email: true,
        whatsApp: false,
        webPush: false,
    })
    const [reminderDays, setReminderDays] = React.useState<number[]>([30, 7, 1])

    // Sync form state from user object
    React.useEffect(() => {
        if (user) {
            setEditName(user.name || "")
            setNotifications({
                email: user.preferences?.notificationChannels?.email ?? true,
                whatsApp: false,
                webPush: false,
            })
            if (Array.isArray(user.preferences?.reminderDaysBefore)) {
                setReminderDays(user.preferences.reminderDaysBefore)
            } else {
                setReminderDays([30, 7, 1])
            }
        }
    }, [user, isOpen])

    if (!isOpen) return null

    const toggleReminderDay = (day: number) => {
        setReminderDays((prev) =>
            prev.includes(day)
                ? prev.filter((d) => d !== day)
                : [...prev, day].sort((a, b) => b - a)
        )
    }

    const handleCancelEdit = () => {
        if (user) {
            setEditName(user.name || "")
            setNotifications({
                email: user.preferences?.notificationChannels?.email ?? true,
                whatsApp: false,
                webPush: false,
            })
            setReminderDays(user.preferences?.reminderDaysBefore || [30, 7, 1])
        }
        setIsEditMode(false)
    }

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editName.trim()) {
            toast.error("Name cannot be empty")
            return
        }

        setIsSaving(true)
        try {
            const res = await apiFetch<User>("/auth/profile", {
                method: "PATCH",
                body: JSON.stringify({
                    name: editName.trim(),
                    preferences: {
                        notificationChannels: notifications,
                        reminderDaysBefore: reminderDays,
                    },
                }),
            })

            if (res.data) {
                onUserUpdate(res.data)
                toast.success("Profile updated successfully")
                setIsEditMode(false)
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to update profile")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDisconnectDrive = async () => {
        setIsDisconnecting(true)
        try {
            const res = await apiFetch<User>("/auth/drive/disconnect", {
                method: "POST",
            })

            if (res.data) {
                onUserUpdate(res.data)
                toast.success("Google Drive disconnected successfully")
                setShowDisconnectConfirm(false)
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to disconnect Google Drive")
        } finally {
            setIsDisconnecting(false)
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <Card className="w-full max-w-lg rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
                                <UserIcon className="size-4" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold text-foreground">
                                    {isEditMode ? "Edit Profile" : "Account Profile"}
                                </CardTitle>
                                <p className="text-[11px] text-muted-foreground">
                                    {isEditMode
                                        ? "Update your personal details & reminder alerts"
                                        : "Manage your account settings & preferences"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            {!isEditMode && (
                                <Button
                                    type="button"
                                    onClick={() => setIsEditMode(true)}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-2.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer border-zinc-200 dark:border-zinc-700"
                                >
                                    <Pencil className="size-3.5 text-muted-foreground" />
                                    <span>Edit</span>
                                </Button>
                            )}
                            <Button
                                onClick={onClose}
                                variant="ghost"
                                size="sm"
                                className="size-8 p-0 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                            >
                                <X className="size-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    {/* Modal Scrollable Body */}
                    <div className="overflow-y-auto p-6 space-y-5 flex-1">
                        {isEditMode ? (
                            /* ================= EDIT MODE ================= */
                            <form id="profile-edit-form" onSubmit={handleSaveProfile} className="space-y-5">
                                <FieldSet className="gap-4">
                                    {/* Full Name */}
                                    <Field>
                                        <FieldLabel htmlFor="edit-name" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <UserIcon className="size-3.5 text-muted-foreground" />
                                            Full Name <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="edit-name"
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Your full name"
                                            required
                                            className="h-10 text-xs rounded-xl"
                                        />
                                    </Field>

                                    {/* Static Email */}
                                    <Field>
                                        <FieldLabel htmlFor="edit-email" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <Mail className="size-3.5 text-muted-foreground" />
                                            Email Address
                                        </FieldLabel>
                                        <Input
                                            id="edit-email"
                                            type="email"
                                            value={user?.email || ""}
                                            disabled
                                            className="h-10 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-muted-foreground cursor-not-allowed border-dashed"
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            Email address cannot be modified once registered.
                                        </p>
                                    </Field>

                                    {/* Notification Channels */}
                                    <div className="pt-1 space-y-2.5">
                                        <div className="flex items-center gap-1.5">
                                            <Bell className="size-3.5 text-zinc-700 dark:text-zinc-300" />
                                            <span className="text-xs font-bold text-foreground">
                                                Notification Channels
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            {/* Email Toggle */}
                                            <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="size-7 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-foreground flex items-center justify-center shrink-0">
                                                        <Mail className="size-3.5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-foreground">
                                                            Email Reminders
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            Direct reminders to your email
                                                        </p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={notifications.email}
                                                    onCheckedChange={(checked) =>
                                                        setNotifications({ ...notifications, email: checked })
                                                    }
                                                    size="sm"
                                                />
                                            </div>

                                            {/* WhatsApp (Disabled) */}
                                            <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-800/20 opacity-70">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="size-7 rounded-lg bg-zinc-200/60 dark:bg-zinc-700/60 text-muted-foreground flex items-center justify-center shrink-0">
                                                        <MessageSquare className="size-3.5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="text-xs font-semibold text-foreground">
                                                                WhatsApp Alerts
                                                            </p>
                                                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-medium rounded-md bg-zinc-200/80 dark:bg-zinc-700/70 text-zinc-600 dark:text-zinc-300">
                                                                Coming Soon
                                                            </Badge>
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            Instant alerts sent to WhatsApp
                                                        </p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={false}
                                                    disabled={true}
                                                    size="sm"
                                                    aria-label="WhatsApp notifications coming soon"
                                                />
                                            </div>

                                            {/* Web Push (Disabled) */}
                                            <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-800/20 opacity-70">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="size-7 rounded-lg bg-zinc-200/60 dark:bg-zinc-700/60 text-muted-foreground flex items-center justify-center shrink-0">
                                                        <Globe className="size-3.5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="text-xs font-semibold text-foreground">
                                                                Web Push Notifications
                                                            </p>
                                                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-medium rounded-md bg-zinc-200/80 dark:bg-zinc-700/70 text-zinc-600 dark:text-zinc-300">
                                                                Coming Soon
                                                            </Badge>
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            Browser desktop & mobile alerts
                                                        </p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={false}
                                                    disabled={true}
                                                    size="sm"
                                                    aria-label="Web push notifications coming soon"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reminder Schedule (Multi-Select 30, 7, 1) */}
                                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                                <Clock className="size-3.5 text-amber-500" />
                                                Default Reminder Intervals
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                Select all that apply
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                                            {[
                                                { value: 30, label: "30 days before" },
                                                { value: 7, label: "7 days before" },
                                                { value: 1, label: "1 day before" },
                                            ].map((item) => {
                                                const isSelected = reminderDays.includes(item.value)
                                                return (
                                                    <label
                                                        key={item.value}
                                                        htmlFor={`profile-reminder-${item.value}`}
                                                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer select-none text-xs ${
                                                            isSelected
                                                                ? "border-primary bg-primary/5 text-foreground font-semibold ring-1 ring-primary/40 shadow-xs"
                                                                : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-muted-foreground hover:text-foreground"
                                                        }`}
                                                    >
                                                        <Checkbox
                                                            id={`profile-reminder-${item.value}`}
                                                            checked={isSelected}
                                                            onCheckedChange={() => toggleReminderDay(item.value)}
                                                            className="cursor-pointer"
                                                        />
                                                        <span>{item.label}</span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </FieldSet>
                            </form>
                        ) : (
                            /* ================= VIEW MODE ================= */
                            <div className="space-y-5 animate-in fade-in-50 duration-200">
                                {/* Avatar & Basic Details */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800">
                                    <Avatar className="size-14 ring-2 ring-zinc-200 dark:ring-zinc-700">
                                        <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                                        <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                                            {user?.name ? user.name[0].toUpperCase() : "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 truncate">
                                            {user?.name}
                                        </h3>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5 truncate">
                                            <Mail className="size-3.5 shrink-0" />
                                            <span>{user?.email}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Google Drive Storage Card */}
                                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <HardDrive className="size-4 text-zinc-600 dark:text-zinc-400" />
                                            Google Drive Storage
                                        </span>
                                        {user?.driveConnected ? (
                                            <Badge variant="outline" className="bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-600 text-[10px] font-semibold">
                                                Connected
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 text-[10px]">
                                                Not Connected
                                            </Badge>
                                        )}
                                    </div>

                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        {user?.driveConnected
                                            ? "Receipts and warranty documents are securely stored in your dedicated Google Drive Vault folder."
                                            : "Connect your Google Drive account to enable direct receipt and invoice document cloud storage."}
                                    </p>

                                    {user?.driveConnected ? (
                                        <Button
                                            type="button"
                                            onClick={() => setShowDisconnectConfirm(true)}
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs font-semibold rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 border-zinc-200 dark:border-zinc-700 cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <Unlink className="size-3.5" />
                                            <span>Disconnect Google Drive</span>
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            onClick={handleConnectDrive}
                                            size="sm"
                                            className="w-full text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                                        >
                                            Connect Google Drive
                                        </Button>
                                    )}
                                </div>

                                {/* Active Reminder Preferences Summary */}
                                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                            <Bell className="size-4 text-amber-500" />
                                            Active Reminder Preferences
                                        </span>
                                    </div>

                                    {/* Channel status */}
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>Email Reminders:</span>
                                        <Badge variant="secondary" className="text-[10px] font-semibold">
                                            {user?.preferences?.notificationChannels?.email !== false ? "Enabled" : "Disabled"}
                                        </Badge>
                                    </div>

                                    {/* Active intervals */}
                                    <div className="pt-1">
                                        <p className="text-[11px] text-muted-foreground mb-1.5 font-medium">
                                            Reminder Schedule:
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {(user?.preferences?.reminderDaysBefore || [30, 7, 1]).map((days) => (
                                                <span
                                                    key={days}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-foreground text-xs font-semibold border border-zinc-200 dark:border-zinc-700 shadow-xs"
                                                >
                                                    <Check className="size-3 text-primary" />
                                                    {days} {days === 1 ? "day" : "days"} before
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    {isEditMode && (
                        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-end gap-3 shrink-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                                className="h-9 px-4 text-xs font-semibold rounded-xl cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                form="profile-edit-form"
                                disabled={isSaving || !editName.trim()}
                                className="h-9 px-5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-sm flex items-center gap-1.5"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="size-3.5 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <span>Save Changes</span>
                                )}
                            </Button>
                        </div>
                    )}
                </Card>
            </div>

            {/* Disconnect Google Drive Confirmation Dialog */}
            <AlertDialog open={showDisconnectConfirm} onOpenChange={setShowDisconnectConfirm}>
                <AlertDialogContent className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-bold text-foreground">
                            Disconnect Google Drive?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                            Your existing receipts and invoices stored in Google Drive will remain safe, but new uploads will no longer sync until you reconnect your Google Drive account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-2 pt-2">
                        <AlertDialogCancel
                            disabled={isDisconnecting}
                            className="h-9 px-4 text-xs font-semibold rounded-xl"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDisconnectDrive}
                            disabled={isDisconnecting}
                            className="h-9 px-4 text-xs font-semibold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                        >
                            {isDisconnecting ? "Disconnecting..." : "Disconnect Drive"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default ProfileModal
