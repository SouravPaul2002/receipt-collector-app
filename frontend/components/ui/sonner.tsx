"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
        ),
        info: (
          <InfoIcon className="size-4 text-blue-400 dark:text-blue-600 shrink-0" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-400 dark:text-amber-600 shrink-0" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-rose-400 dark:text-rose-600 shrink-0" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin shrink-0 text-zinc-400 dark:text-zinc-600" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans rounded-xl p-4 flex items-center gap-3 text-xs font-semibold shadow-2xl border transition-all !bg-zinc-900 !text-zinc-50 !border-zinc-800 dark:!bg-white dark:!text-zinc-950 dark:!border-zinc-200",
          description: "text-zinc-400 dark:text-zinc-600 text-xs font-normal",
          actionButton:
            "!bg-zinc-800 !text-zinc-100 hover:!bg-zinc-700 dark:!bg-zinc-100 dark:!text-zinc-900 dark:hover:!bg-zinc-200 text-xs font-semibold rounded-lg px-3 py-1.5",
          cancelButton:
            "!bg-zinc-800 !text-zinc-400 hover:!bg-zinc-700 dark:!bg-zinc-100 dark:!text-zinc-600 text-xs font-semibold rounded-lg px-3 py-1.5",
          closeButton:
            "!bg-zinc-800 !border-zinc-700 !text-zinc-400 hover:!text-white dark:!bg-zinc-100 dark:!border-zinc-300 dark:!text-zinc-600 dark:hover:!text-zinc-950",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
