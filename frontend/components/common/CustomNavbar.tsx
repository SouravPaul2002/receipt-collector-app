"use client"

import * as React from "react"
import { User } from "@/lib/types"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CustomDropdown } from "@/components/common/CustomDropdown"
import { NotificationDropdown } from "@/components/common/NotificationDropdown"
import { Switch } from "@/components/ui/switch"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    HardDrive,
    User as UserIcon,
    Moon,
    LogOut,
    BookText,
    Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface CustomNavbarProps {
    user: User | null
    isDarkMode: boolean
    toggleTheme: () => void
    handleLogout: () => void
    isLoggingOut?: boolean
    handleConnectDrive: () => void
    setShowProfileModal: (show: boolean) => void
    className?: string
}

export function CustomNavbar({
    user,
    isDarkMode,
    toggleTheme,
    handleLogout,
    isLoggingOut = false,
    handleConnectDrive,
    setShowProfileModal,
    className,
}: CustomNavbarProps) {
    return (
        <header
            className={cn(
                "sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md",
                className
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                {/* Brand Logo & App Name */}
                <div className="flex items-center gap-3">
                    <div>
                        <span className="font-extrabold text-base tracking-tight block text-zinc-900 dark:text-zinc-50">
                            Receipt Collector
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium block -mt-0.5">
                            Warranty & Receipt Vault
                        </span>
                    </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Drive Status Badge / Connect Button */}
                    {user?.driveConnected ? (
                        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                            <HardDrive className="size-3.5" />
                            Google Drive Connected
                        </div>
                    ) : (
                        <Button
                            onClick={handleConnectDrive}
                            size="sm"
                            variant="outline"
                            className="border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 text-xs font-semibold rounded-xl"
                        >
                            <HardDrive className="size-3.5 mr-1.5 text-amber-600" />
                            Connect Drive
                        </Button>
                    )}

                    {/* Documentation Tooltip Button */}
                    <Tooltip>
                        <TooltipTrigger className="size-9 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <BookText className="size-5" />
                            <span className="sr-only">Documentation</span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs font-medium">
                            Documentation
                        </TooltipContent>
                    </Tooltip>
                    {/* Interactive Notification Bell Dropdown */}
                    <NotificationDropdown />

                    {/* Settings Tooltip Button */}
                    <Tooltip>
                        <TooltipTrigger className="size-9 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring relative">
                            <Settings className="size-5" />
                            <span className="sr-only">Settings</span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs font-medium">
                            Settings
                        </TooltipContent>
                    </Tooltip>

                    {/* User Profile Dropdown */}
                    <div className="pl-1 sm:pl-2 border-l border-zinc-200 dark:border-zinc-800">
                        <CustomDropdown
                            trigger={
                                <div className="flex items-center gap-2">
                                    <Avatar className="size-9 ring-2 ring-zinc-200 dark:ring-zinc-800 hover:ring-zinc-400 dark:hover:ring-zinc-600 transition-all">
                                        <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                                            {user?.name ? user.name[0].toUpperCase() : "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            }
                            className="w-48 shadow-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                            items={[
                                {
                                    id: "profile",
                                    leftIcon: <UserIcon className="size-4" />,
                                    label: "Profile",
                                    onClick: () => setShowProfileModal(true),
                                },
                                {
                                    id: "theme",
                                    leftIcon: <Moon className="size-4" />,
                                    label: "Dark Mode",
                                    rightContent: (
                                        <Switch
                                            checked={isDarkMode}
                                            onCheckedChange={toggleTheme}
                                            size="sm"
                                        />
                                    ),
                                    closeOnClick: true,
                                },
                                {
                                    id: "logout",
                                    leftIcon: <LogOut className="size-4" />,
                                    label: isLoggingOut ? "Signing out..." : "Log Out",
                                    onClick: handleLogout,
                                    disabled: isLoggingOut,
                                    variant: "destructive",
                                    separatorBefore: true,
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </header>
    )
}

export default CustomNavbar
