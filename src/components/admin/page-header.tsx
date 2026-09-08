"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  backHref?: string
  actions?: ReactNode
  iconClassName?: string
}

export function PageHeader({ title, description, icon, backHref, actions, iconClassName }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div
            className={cn(
              "hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-700 text-primary-foreground shadow-sm sm:flex",
              iconClassName
            )}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {backHref && (
            <Link
              href={backHref}
              className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Kembali
            </Link>
          )}
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </motion.div>
  )
}