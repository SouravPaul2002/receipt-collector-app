"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Field,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    ShieldCheck,
    Mail,
    Lock,
    ArrowRight,
    Moon,
    Sun,
    Eye,
    EyeOff,
    Loader2,
    HardDrive,
    Bell,
    Sparkles,
} from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [isDarkMode, setIsDarkMode] = React.useState<boolean>(true)
    const [showPassword, setShowPassword] = React.useState<boolean>(false)

    // Form state
    const [formData, setFormData] = React.useState({
        email: "",
        password: "",
    })

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

    const handleGoogleLogin = () => {
        setIsLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        window.location.href = `${apiUrl}/auth/google`
    }

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.email || !formData.password) {
            toast.error("Please enter both email and password")
            return
        }

        setIsLoading(true)
        try {
            const res = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: formData.email.trim(),
                    password: formData.password,
                }),
            })

            if (res.data) {
                toast.success("Signed in successfully!")
                router.push("/dashboard")
            }
        } catch (err: any) {
            toast.error(err.message || "Invalid email or password")
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

            <div className="w-full max-w-md relative z-10 my-8">
                {/* Brand Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/25 mb-3 ring-4 ring-white dark:ring-zinc-900">
                        <ShieldCheck className="size-7" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Welcome Back
                    </h1>
                    <p className="mt-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
                        Sign in to access your warranty vault, stored receipts, and claim reminders.
                    </p>
                </div>

                {/* Main Login Card */}
                <Card className="border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-xl shadow-zinc-200/50 dark:shadow-black/40 rounded-2xl overflow-hidden">
                    <CardHeader className="text-center pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                        <CardTitle className="text-lg font-bold text-foreground">Sign In</CardTitle>
                        <CardDescription className="text-xs">
                            Choose your preferred way to access your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 space-y-5">
                        {/* Option 1: Continue with Google */}
                        <Button
                            type="button"
                            onClick={handleGoogleLogin}
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
                                or sign in with email
                            </span>
                            <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
                        </div>

                        {/* Option 2: Email & Password Form */}
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <FieldSet className="gap-3.5">
                                {/* Email */}
                                <Field>
                                    <FieldLabel htmlFor="login-email" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                        <Mail className="size-3.5 text-muted-foreground" />
                                        Email Address <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="login-email"
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
                                    <FieldLabel htmlFor="login-password" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                        <Lock className="size-3.5 text-muted-foreground" />
                                        Password <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <div className="relative">
                                        <Input
                                            id="login-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
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
                            </FieldSet>

                            {/* Sign In Button */}
                            <Button
                                type="submit"
                                disabled={isLoading || !formData.email || !formData.password}
                                className="w-full h-11 text-xs sm:text-sm font-semibold rounded-xl mt-2 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin mr-1" />
                                        <span>Signing In...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight className="size-4" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Sign up Footer Link */}
                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
                            <p className="text-xs text-muted-foreground">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/signup"
                                    className="font-semibold text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}