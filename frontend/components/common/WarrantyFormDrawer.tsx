"use client"

import * as React from "react"
import { Warranty } from "@/lib/types"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Sparkles,
    UploadCloud,
    FileText,
    CheckCircle2,
    X,
    ArrowRight,
    ArrowLeft,
    Calendar,
    Tag,
    Store,
    DollarSign,
    Hash,
    Layers,
    Loader2,
    Bell,
    Mail,
    MessageSquare,
    Globe,
    ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface WarrantyFormDrawerProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    title?: string
    description?: string
    initialData?: Partial<Warranty> | null
    onSubmit: (data: { formValues: Record<string, any>; file: File | null }) => Promise<void>
    isLoading?: boolean
}

const CATEGORIES = [
    "Electronics",
    "Appliances",
    "Furniture",
    "Vehicles",
    "Clothing",
    "Personal Care",
    "Other",
]

export function WarrantyFormDrawer({
    isOpen,
    onOpenChange,
    title = "Add Item",
    description,
    initialData,
    onSubmit,
    isLoading = false,
}: WarrantyFormDrawerProps) {
    const isEditMode = Boolean(initialData?._id)

    // Wizard Step State (1: Upload / OCR Info, 2: Form Fields)
    const [step, setStep] = React.useState<1 | 2>(1)

    // File upload state (Step 1)
    const [file, setFile] = React.useState<File | null>(null)
    const [fileProgress, setFileProgress] = React.useState<number>(0)
    const [isDragging, setIsDragging] = React.useState<boolean>(false)
    const fileInputRef = React.useRef<HTMLInputElement | null>(null)

    // Form fields state (Step 2)
    const [formValues, setFormValues] = React.useState({
        productName: "",
        brand: "",
        category: "Electronics",
        retailer: "",
        price: "",
        currency: "USD",
        purchaseDate: new Date().toISOString().split("T")[0],
        warrantyMonths: 12,
        modelNumber: "",
        serialNumber: "",
        notes: "",
    })

    // Notification channel preferences for this warranty
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

    // Reset or prefill when initialData changes
    React.useEffect(() => {
        if (isOpen) {
            // Always start on Step 1
            setStep(1)
            setFile(null)
            setFileProgress(0)

            if (initialData) {
                setFormValues({
                    productName: initialData.productName || "",
                    brand: initialData.brand || "",
                    category: initialData.category || "Electronics",
                    retailer: initialData.retailer || "",
                    price: initialData.price !== undefined ? String(initialData.price) : "",
                    currency: initialData.currency || "USD",
                    purchaseDate: initialData.purchaseDate
                        ? new Date(initialData.purchaseDate).toISOString().split("T")[0]
                        : new Date().toISOString().split("T")[0],
                    warrantyMonths: initialData.warrantyMonths || 12,
                    modelNumber: initialData.modelNumber || "",
                    serialNumber: initialData.serialNumber || "",
                    notes: initialData.notes || "",
                })
                const existingNotification = initialData.notificationChannels || (initialData as any)?.notifications
                setNotifications({
                    email: existingNotification?.email ?? true,
                    whatsapp: false,
                    webPush: false,
                })
                if (Array.isArray(initialData.reminderDaysBefore)) {
                    setReminderDays(initialData.reminderDaysBefore)
                } else {
                    setReminderDays([30, 7, 1])
                }
            } else {
                setFormValues({
                    productName: "",
                    brand: "",
                    category: "Electronics",
                    retailer: "",
                    price: "",
                    currency: "USD",
                    purchaseDate: new Date().toISOString().split("T")[0],
                    warrantyMonths: 12,
                    modelNumber: "",
                    serialNumber: "",
                    notes: "",
                })
                setNotifications({
                    email: true,
                    whatsapp: false,
                    webPush: false,
                })
                setReminderDays([30, 7, 1])
            }
        }
    }, [isOpen, initialData])

    // File selection handler with simulated scan progress
    const handleFileSelect = (selectedFile: File) => {
        if (!selectedFile) return
        setFile(selectedFile)
        setFileProgress(15)

        const interval = setInterval(() => {
            setFileProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval)
                    return 100
                }
                return prev + 25
            })
        }, 120)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0])
        }
    }

    const removeFile = () => {
        setFile(null)
        setFileProgress(0)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    // Auto-compute estimated expiry date
    const computedExpiryDate = React.useMemo(() => {
        if (!formValues.purchaseDate || !formValues.warrantyMonths) return null
        const date = new Date(formValues.purchaseDate)
        if (isNaN(date.getTime())) return null
        date.setMonth(date.getMonth() + Number(formValues.warrantyMonths))
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }, [formValues.purchaseDate, formValues.warrantyMonths])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formValues.productName.trim()) {
            setStep(2)
            return
        }
        await onSubmit({
            formValues: {
                ...formValues,
                notifications,
                reminderDaysBefore: reminderDays,
            },
            file,
        })
    }

    return (
        <Drawer
            open={isOpen}
            onOpenChange={onOpenChange}
            swipeDirection="right"
        >
            <DrawerContent
                className="w-full sm:[--drawer-content-width:580px] md:[--drawer-content-width:680px] lg:[--drawer-content-width:740px] max-w-[25vw] h-full bg-background border-l border-border shadow-2xl p-0 flex flex-col justify-between"
            >
                {/* Drawer Top Header */}
                <DrawerHeader className="px-6 py-5 border-b border-border bg-card/50 flex flex-row items-center justify-between shrink-0">
                    <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2">
                            <DrawerTitle className="text-lg font-bold tracking-tight text-foreground">
                                {title}
                            </DrawerTitle>
                            <Badge variant="outline" className="text-[11px] px-2 py-0.5 rounded-full font-semibold">
                                Step {step} of 2
                            </Badge>
                        </div>
                        <DrawerDescription className="text-xs text-muted-foreground">
                            {description ||
                                (step === 1
                                    ? "Snap a photo of your receipt and we'll fill in the details — or add them yourself."
                                    : "Fill in product specifications and store information")}
                        </DrawerDescription>
                    </div>

                    <DrawerClose className="inline-flex items-center justify-center size-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer">
                        <X className="size-4" />
                        <span className="sr-only">Close</span>
                    </DrawerClose>
                </DrawerHeader>

                {/* Drawer Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* ================= STEP 1: Upload & OCR Info ================= */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in-50 duration-200">
                            {/* AI OCR Information Banner */}
                            <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-border space-y-2.5">
                                <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                        <Sparkles className="size-4" />
                                    </div>
                                    <span>Receipt Scanner & Auto-Fill</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Upload your receipt, invoice, or warranty card (PDF, PNG, JPG). Our OCR engine will securely store it in your Google Drive Vault and extract the product name, retailer, purchase date, and price automatically.
                                </p>
                            </div>

                            {/* Dropzone Area */}
                            <div
                                onDragOver={(e) => {
                                    e.preventDefault()
                                    setIsDragging(true)
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3",
                                    isDragging
                                        ? "border-primary bg-primary/5 scale-[0.99]"
                                        : "border-border hover:border-zinc-400 dark:hover:border-zinc-600 bg-card/60 hover:bg-card"
                                )}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleFileSelect(e.target.files[0])
                                        }
                                    }}
                                    className="hidden"
                                />

                                <div className="size-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center shadow-xs">
                                    <UploadCloud className="size-6 text-foreground" />
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-foreground">
                                        {initialData?.driveFileUrl || initialData?.driveFileId
                                            ? "Upload a new receipt to replace existing"
                                            : "Click to upload or drag & drop receipt"}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        Supported formats: PDF, PNG, JPG, WEBP, HEIC (Max 10MB)
                                    </p>
                                </div>
                            </div>

                            {/* Existing Google Drive Receipt (in edit mode if no replacement file selected) */}
                            {!file && (initialData?.driveFileUrl || initialData?.driveFileId) && (
                                <div className="p-4 rounded-2xl border border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="size-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                                <FileText className="size-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-bold text-foreground truncate">
                                                        {initialData.productName ? `${initialData.productName} Receipt` : "Uploaded Receipt"}
                                                    </p>
                                                    <Badge variant="outline" className="text-[10px] px-2 py-0 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10">
                                                        Attached on Drive
                                                    </Badge>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    Stored securely in your Google Drive Vault
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {initialData.driveFileUrl && (
                                                <a
                                                    href={initialData.driveFileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-foreground transition-colors"
                                                >
                                                    <ExternalLink className="size-3.5" />
                                                    <span>View</span>
                                                </a>
                                            )}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer hover:bg-accent"
                                            >
                                                Replace
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Newly Selected Replacement / Uploaded File Progress */}
                            {file && (
                                <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-3 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="size-10 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0">
                                                <FileText className="size-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-bold text-foreground truncate">
                                                        {file.name}
                                                    </p>
                                                    {initialData?.driveFileUrl && (
                                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                                                            New Replacement
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {fileProgress === 100 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        if (fileInputRef.current) {
                                                            fileInputRef.current.value = ""
                                                            fileInputRef.current.click()
                                                        }
                                                    }}
                                                    className="h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer hover:bg-accent"
                                                >
                                                    Reupload
                                                </Button>
                                            )}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeFile()
                                                }}
                                                className="size-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                            >
                                                <X className="size-4" />
                                                <span className="sr-only">Remove</span>
                                            </Button>
                                        </div>
                                    </div>

                                    {fileProgress < 100 && (
                                        <div className="space-y-1">
                                            <Progress value={fileProgress} className="h-1.5 rounded-full" />
                                            <p className="text-[10px] text-muted-foreground text-right">
                                                Processing {fileProgress}%
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ================= STEP 2: Form Fields ================= */}
                    {step === 2 && (
                        <form id="warranty-form" onSubmit={handleSubmit} className="space-y-5 animate-in fade-in-50 duration-200">
                            <FieldSet className="gap-5">
                                {/* Row 1: Product Name & Brand */}
                                <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="productName" className="text-xs font-bold text-foreground">
                                            Product Name <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="productName"
                                            placeholder="e.g. MacBook Pro 16 M3"
                                            value={formValues.productName}
                                            onChange={(e) => setFormValues({ ...formValues, productName: e.target.value })}
                                            required
                                            className="h-10 text-xs rounded-xl"
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="brand" className="text-xs font-bold text-foreground">
                                            Brand / Manufacturer
                                        </FieldLabel>
                                        <Input
                                            id="brand"
                                            placeholder="e.g. Apple, Sony, Samsung"
                                            value={formValues.brand}
                                            onChange={(e) => setFormValues({ ...formValues, brand: e.target.value })}
                                            className="h-10 text-xs rounded-xl"
                                        />
                                    </Field>
                                </FieldGroup>

                                {/* Row 2: Category & Retailer */}
                                <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="category" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <Tag className="size-3.5 text-muted-foreground" />
                                            Category
                                        </FieldLabel>
                                        <select
                                            id="category"
                                            value={formValues.category}
                                            onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
                                            className="h-10 w-full px-3 text-xs rounded-xl bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                        >
                                            {CATEGORIES.map((cat) => (
                                                <option key={cat} value={cat}>
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="retailer" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <Store className="size-3.5 text-muted-foreground" />
                                            Retailer / Store
                                        </FieldLabel>
                                        <Input
                                            id="retailer"
                                            placeholder="e.g. Best Buy, Amazon, Official Store"
                                            value={formValues.retailer}
                                            onChange={(e) => setFormValues({ ...formValues, retailer: e.target.value })}
                                            className="h-10 text-xs rounded-xl"
                                        />
                                    </Field>
                                </FieldGroup>

                                {/* Row 3: Price & Currency */}
                                <FieldGroup className="grid grid-cols-3 gap-4">
                                    <Field className="col-span-2">
                                        <FieldLabel htmlFor="price" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            Price
                                        </FieldLabel>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            value={formValues.price}
                                            onChange={(e) => setFormValues({ ...formValues, price: e.target.value })}
                                            className="h-10 text-xs rounded-xl"
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="currency" className="text-xs font-bold text-foreground">
                                            Currency
                                        </FieldLabel>
                                        <Input
                                            id="currency"
                                            placeholder="USD"
                                            value={formValues.currency}
                                            onChange={(e) => setFormValues({ ...formValues, currency: e.target.value.toUpperCase() })}
                                            className="h-10 text-xs rounded-xl uppercase"
                                        />
                                    </Field>
                                </FieldGroup>

                                {/* Row 4: Purchase Date & Warranty Months */}
                                <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="purchaseDate" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <Calendar className="size-3.5 text-muted-foreground" />
                                            Purchase Date <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="purchaseDate"
                                            type="date"
                                            value={formValues.purchaseDate}
                                            onChange={(e) => setFormValues({ ...formValues, purchaseDate: e.target.value })}
                                            required
                                            className="h-10 text-xs rounded-xl"
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="warrantyMonths" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <Layers className="size-3.5 text-muted-foreground" />
                                            Warranty Period (Months) <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="warrantyMonths"
                                            type="number"
                                            min="0"
                                            placeholder="12"
                                            value={formValues.warrantyMonths}
                                            onChange={(e) => setFormValues({ ...formValues, warrantyMonths: Number(e.target.value) })}
                                            required
                                            className="h-10 text-xs rounded-xl"
                                        />
                                    </Field>
                                </FieldGroup>

                                {/* Computed Expiry Preview Badge */}
                                {computedExpiryDate && (
                                    <div className="p-3 rounded-xl bg-muted/60 border border-border flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground font-medium">
                                            Warranty Expiry:
                                        </span>
                                        <span className="font-bold text-foreground">
                                            {computedExpiryDate}
                                        </span>
                                    </div>
                                )}

                                {/* Row 5: Model & Serial Number */}
                                <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="modelNumber" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <Hash className="size-3.5 text-muted-foreground" />
                                            Model Number
                                        </FieldLabel>
                                        <Input
                                            id="modelNumber"
                                            placeholder="e.g. A2991"
                                            value={formValues.modelNumber}
                                            onChange={(e) => setFormValues({ ...formValues, modelNumber: e.target.value })}
                                            className="h-10 text-xs rounded-xl"
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="serialNumber" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <Hash className="size-3.5 text-muted-foreground" />
                                            Serial Number
                                        </FieldLabel>
                                        <Input
                                            id="serialNumber"
                                            placeholder="e.g. C02G80X0MD6R"
                                            value={formValues.serialNumber}
                                            onChange={(e) => setFormValues({ ...formValues, serialNumber: e.target.value })}
                                            className="h-10 text-xs rounded-xl"
                                        />
                                    </Field>
                                </FieldGroup>

                                {/* Row 6: Additional Notes */}
                                <Field>
                                    <FieldLabel htmlFor="notes" className="text-xs font-bold text-foreground">
                                        Additional Notes
                                    </FieldLabel>
                                    <Input
                                        id="notes"
                                        placeholder="Add any extra details, extended warranty terms, or notes..."
                                        value={formValues.notes}
                                        onChange={(e) => setFormValues({ ...formValues, notes: e.target.value })}
                                        className="h-10 text-xs rounded-xl"
                                    />
                                </Field>

                                {/* Notification Channels Section */}
                                <div className="pt-2 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                            <Bell className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-foreground">
                                                Reminder Channels
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Select how you want to receive alerts before this warranty expires
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        {/* 1. Email Channel (Default ON) */}
                                        <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/60 shadow-xs">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                                    <Mail className="size-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-foreground">
                                                        Email Reminders
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        Send expiry notifications to your registered email
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

                                        {/* 2. WhatsApp Channel (Disabled / Coming Soon) */}
                                        <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/30 opacity-70">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600/70 dark:text-emerald-400/70 flex items-center justify-center shrink-0">
                                                    <MessageSquare className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-xs font-semibold text-foreground">
                                                            WhatsApp Alerts
                                                        </p>
                                                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-medium rounded-md bg-zinc-200/70 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300">
                                                            Coming Soon
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        Instant reminder messages sent directly to WhatsApp
                                                    </p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={false}
                                                disabled={true}
                                                size="sm"
                                                aria-label="WhatsApp alerts coming soon"
                                            />
                                        </div>

                                        {/* 3. Web Push Channel (Disabled / Coming Soon) */}
                                        <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/30 opacity-70">
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
                                                        Desktop & mobile browser banner notifications
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

                                {/* Reminder Schedule (Days Before Expiry) */}
                                <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2.5">
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
                                                    htmlFor={`modal-reminder-${item.value}`}
                                                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none text-xs ${
                                                        isSelected
                                                            ? "border-primary bg-primary/5 text-foreground font-semibold ring-1 ring-primary/40 shadow-xs"
                                                            : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-zinc-300 dark:hover:border-zinc-600"
                                                    }`}
                                                >
                                                    <Checkbox
                                                        id={`modal-reminder-${item.value}`}
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
                    )}
                </div>

                {/* Drawer Footer Actions */}
                <DrawerFooter className="px-6 py-4 border-t border-border bg-card/50 flex flex-row items-center justify-between gap-3 shrink-0">
                    {step === 1 ? (
                        <>
                            <Button
                                key="btn-footer-cancel"
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="h-10 px-4 rounded-xl text-xs font-semibold cursor-pointer"
                            >
                                Cancel
                            </Button>

                            <Button
                                key="btn-footer-next"
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setStep(2)
                                }}
                                className="h-10 px-5 rounded-xl text-xs font-semibold flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-sm"
                            >
                                <span>Next</span>
                                <ArrowRight className="size-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                key="btn-footer-back"
                                type="button"
                                variant="outline"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setStep(1)
                                }}
                                disabled={isLoading}
                                className="h-10 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                                <ArrowLeft className="size-4" />
                                <span>Back</span>
                            </Button>

                            <Button
                                key="btn-footer-submit"
                                type="submit"
                                form="warranty-form"
                                disabled={isLoading || !formValues.productName.trim()}
                                className="h-10 px-5 rounded-xl text-xs font-semibold flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-sm"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        <span>Saving Item...</span>
                                    </>
                                ) : (
                                    <span>{isEditMode ? "Save Changes" : "Create Item"}</span>
                                )}
                            </Button>
                        </>
                    )}
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default WarrantyFormDrawer
