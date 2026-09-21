import type { Metadata } from "next"
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
})

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Receipt Collector — Warranty & Receipt Vault",
  description: "Securely store product warranties and receipts directly in your Google Drive with automated expiry reminders.",
}

import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans bg-background text-foreground selection:bg-primary/20 selection:text-foreground flex flex-col">
        <TooltipProvider delay={150}>
          {children}
          <Toaster position="top-right" closeButton />
        </TooltipProvider>
      </body>
    </html>
  )
}
