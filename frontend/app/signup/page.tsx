"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    ShieldCheck,
    Mail,
    Lock,
    User,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    Moon,
    Sun,
    Bell,
    MessageSquare,
    Globe,
    Check,
    Eye,
    EyeOff,
    CheckCircle2,
} from "lucide-react"

export default function SignupPage() {
    const router = useRouter()
    const [step, setStep] = React.useState<1 | 2>(1)
    const [isLoading, setIsLoading] = React.useState(false)
    const [isDarkMode, setIsDarkMode] = React.useState<boolean>(true)
    const [showPassword, setShowPassword] = React.useState<boolean>(false)

    // Form states - Step 1
    const [formData, setFormData] = React.useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        currency: "INR",
    })
    const [termsAccepted, setTermsAccepted] = React.useState<boolean>(false)

    // Notification preferences - Step 2 (Email ON by default, others OFF)
    const [notifications, setNotifications] = React.useState({
        email: true,
        whatsapp: false,
        webPush: false,
    })

    // Selected reminder intervals (multi-select: 30, 7, 1 days before expiry)
    const [reminderDays, setReminderDays] = React.useState<number[]>([30, 7, 1])

    const toggleReminderDay = (day: number) => {
        setReminderDays((prev) =>
            prev.includes(day)
                ? prev.filter((d) => d !== day)
                : [...prev, day].sort((a, b) => b - a)
        )
    }

    // Theme initialization & sync with localStorage
    React.useEffect(() => {
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

    const handleGoogleSignup = () => {
        setIsLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        window.location.href = `${apiUrl}/auth/google`
    }

    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!termsAccepted) return
        setStep(2)
    }

    const handleCompleteSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const res = await apiFetch("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    preferences: {
                        notificationChannels: notifications,
                        reminderDaysBefore: reminderDays,
                    },
                }),
            })

            if (res.data) {
                toast.success("Account created successfully! Redirecting...")
                router.push("/dashboard")
            }
        } catch (err: any) {
            toast.error(err.message || "Registration failed. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-zinc-100 to-emerald-50/40 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950/30 overflow-hidden">
            {/* Dark Mode Toggle Button */}
            <div className="absolute top-5 right-5 z-20">
                <Tooltip>
                    <TooltipTrigger
                        type="button"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        className="size-10 rounded-xl bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 shadow-sm backdrop-blur-md transition-all flex items-center justify-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {isDarkMode ? (
                            <Sun className="size-4 text-amber-400" />
                        ) : (
                            <Moon className="size-4 text-zinc-600" />
                        )}
                        <span className="sr-only">Toggle theme</span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs font-medium">
                        {isDarkMode ? "Light Mode" : "Dark Mode"}
                    </TooltipContent>
                </Tooltip>
            </div>

            {/* Ambient background glow elements */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-lg relative z-10 my-8">
                {/* Brand Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/25 mb-3 ring-4 ring-white dark:ring-zinc-900">
                        <ShieldCheck className="size-7" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Create Your Vault
                    </h1>
                    <p className="mt-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
                        Track warranties, save store receipts to Google Drive, and never miss an expiration claim.
                    </p>
                </div>

                {/* Main Signup Card */}
                <Card className="border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-xl shadow-zinc-200/50 dark:shadow-black/40 rounded-2xl overflow-hidden">
                    {/* Step Bar Header */}
                    <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold text-foreground">
                                    {step === 1 ? "Account Setup" : "Details & Preferences"}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    {step === 1
                                        ? "Choose your preferred way to register"
                                        : "Configure alerts and product details"}
                                </CardDescription>
                            </div>
                            <Badge
                                variant="outline"
                                className="px-2.5 py-1 text-xs font-semibold rounded-full bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-foreground"
                            >
                                Step {step} of 2
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        {/* ================= STEP 1: Account Creation ================= */}
                        {step === 1 && (
                            <div className="space-y-5 animate-in fade-in-50 duration-200">
                                {/* Option 1: Continue with Google */}
                                <Button
                                    type="button"
                                    onClick={handleGoogleSignup}
                                    disabled={isLoading}
                                    variant="outline"
                                    className="w-full h-11 text-xs sm:text-sm font-semibold border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm transition-all duration-200 rounded-xl group cursor-pointer"
                                >
                                    <svg className="size-4 sm:size-5 mr-2.5 shrink-0" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                        />
                                    </svg>
                                    <span>Continue with Google</span>
                                    <ArrowRight className="size-4 ml-auto text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                                </Button>

                                {/* Divider */}
                                <div className="relative flex items-center justify-center">
                                    <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
                                    <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider shrink-0">
                                        or register with email
                                    </span>
                                    <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
                                </div>

                                {/* Option 2: Manual Registration Fields */}
                                <form onSubmit={handleStep1Submit} className="space-y-4">
                                    <FieldSet className="gap-4">
                                        {/* Full Name */}
                                        <Field>
                                            <FieldLabel htmlFor="name" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                <User className="size-3.5 text-muted-foreground" />
                                                Full Name <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder="e.g. Alex Johnson"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                className="h-10 text-xs rounded-xl"
                                            />
                                        </Field>

                                        {/* Email */}
                                        <Field>
                                            <FieldLabel htmlFor="email" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                <Mail className="size-3.5 text-muted-foreground" />
                                                Email Address <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="alex@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                className="h-10 text-xs rounded-xl"
                                            />
                                        </Field>

                                        {/* Password with Eye Toggle */}
                                        <Field>
                                            <FieldLabel htmlFor="password" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                <Lock className="size-3.5 text-muted-foreground" />
                                                Password <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Create a strong password (min. 8 characters)"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    required
                                                    minLength={8}
                                                    className="h-10 text-xs rounded-xl pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="size-4" />
                                                    ) : (
                                                        <Eye className="size-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </Field>

                                        {/* Terms & Conditions Checkbox */}
                                        <div className="pt-2">
                                            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800">
                                                <Checkbox
                                                    id="terms"
                                                    checked={termsAccepted}
                                                    onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))}
                                                    className="mt-0.5 cursor-pointer"
                                                />
                                                <div className="text-xs text-muted-foreground leading-snug select-none">
                                                    I agree to the{" "}
                                                    <a
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                        }}
                                                        className="font-semibold text-foreground underline underline-offset-2 hover:text-primary transition-colors cursor-pointer"
                                                    >
                                                        Terms of Service
                                                    </a>{" "}
                                                    and acknowledge the{" "}
                                                    <a
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                        }}
                                                        className="font-semibold text-foreground underline underline-offset-2 hover:text-primary transition-colors cursor-pointer"
                                                    >
                                                        Privacy Policy
                                                    </a>
                                                    .
                                                </div>
                                            </div>
                                        </div>
                                    </FieldSet>

                                    {/* Next Step Button */}
                                    <Button
                                        type="submit"
                                        disabled={!termsAccepted || !formData.name || !formData.email || !formData.password}
                                        className="w-full h-11 text-xs sm:text-sm font-semibold rounded-xl mt-2 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span>Continue</span>
                                        <ArrowRight className="size-4" />
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* ================= STEP 2: Details & Notification Preferences ================= */}
                        {step === 2 && (
                            <form onSubmit={handleCompleteSignup} className="space-y-5 animate-in fade-in-50 duration-200">
                                <FieldSet className="gap-4">
                                    {/* Additional Details Group */}
                                    <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Phone / WhatsApp */}
                                        <Field>
                                            <FieldLabel htmlFor="phone" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                WhatsApp
                                            </FieldLabel>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="+91 00000 00000"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="h-10 text-xs rounded-xl"
                                            />
                                        </Field>

                                        {/* Default Currency */}
                                        <Field>
                                            <FieldLabel htmlFor="currency" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                Currency
                                            </FieldLabel>
                                            <select
                                                id="currency"
                                                value={formData.currency}
                                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                                className="h-10 w-full px-3 text-xs rounded-xl bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                            >
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                                <option value="GBP">GBP</option>
                                                <option value="INR">INR</option>
                                                <option value="CAD">CAD</option>
                                                <option value="AUD">AUD</option>
                                            </select>
                                        </Field>
                                    </FieldGroup>

                                    {/* Notification Channels Header */}
                                    <div className="pt-2">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                <Bell className="size-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-foreground">
                                                    Notification Channels
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Choose where you want to receive warranty expiry alerts
                                                </p>
                                            </div>
                                        </div>

                                        {/* Notification Channel Cards */}
                                        <div className="space-y-2.5">
                                            {/* 1. Email Channel (Default ON) */}
                                            <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                                        <Mail className="size-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-foreground">
                                                            Email Alerts
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground">
                                                            Direct reminders to your registered email address
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

                                            {/* 2. WhatsApp Channel (Disabled for now) */}
                                            <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-zinc-800/20 opacity-70">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600/70 dark:text-emerald-400/70 flex items-center justify-center shrink-0">
                                                        <MessageSquare className="size-4" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="text-xs font-semibold text-foreground">
                                                                WhatsApp Messages
                                                            </p>
                                                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-medium rounded-md bg-zinc-200/70 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300">
                                                                Coming Soon
                                                            </Badge>
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground">
                                                            Instant alerts sent directly to WhatsApp
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

                                            {/* 3. Web Push Notification Channel (Disabled for now) */}
                                            <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-zinc-800/20 opacity-70">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600/70 dark:text-purple-400/70 flex items-center justify-center shrink-0">
                                                        <Globe className="size-4" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="text-xs font-semibold text-foreground">
                                                                Web Push Notifications
                                                            </p>
                                                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-medium rounded-md bg-zinc-200/70 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300">
                                                                Coming Soon
                                                            </Badge>
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground">
                                                            Desktop & mobile browser banner alerts
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

                                    {/* Reminder Times Multi-Select */}
                                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                                <Sparkles className="size-3.5 text-amber-500" />
                                                Reminder Schedule (Days Before Expiry)
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                Select all that apply
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                                            {[
                                                { value: 30, label: "30 days before" },
                                                { value: 7, label: "7 days before" },
                                                { value: 1, label: "1 day before" },
                                            ].map((item) => {
                                                const isSelected = reminderDays.includes(item.value)
                                                return (
                                                    <label
                                                        key={item.value}
                                                        htmlFor={`reminder-${item.value}`}
                                                        className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none text-xs ${
                                                            isSelected
                                                                ? "border-primary bg-primary/5 text-foreground font-semibold ring-1 ring-primary/40 shadow-xs"
                                                                : "border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 text-muted-foreground hover:text-foreground hover:border-zinc-300 dark:hover:border-zinc-600"
                                                        }`}
                                                    >
                                                        <Checkbox
                                                            id={`reminder-${item.value}`}
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

                                {/* Bottom Navigation Actions */}
                                <div className="flex items-center justify-between gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        className="h-11 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <ArrowLeft className="size-4" />
                                        <span>Back</span>
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 h-11 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-md"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1" />
                                                <span>Creating Account...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="size-4" />
                                                <span>Complete Registration</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Sign in Footer Link */}
                        <div className="pt-5 mt-5 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
                            <p className="text-xs text-muted-foreground">
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="font-semibold text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
