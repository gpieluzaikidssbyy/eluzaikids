"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  gradient?: string
  sub?: string
  href?: string
  index?: number
}

export function StatCard({
  label,
  value,
  icon: Icon,
  gradient = "from-primary to-blue-700",
  sub,
  href,
  index = 0,
}: StatCardProps) {
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-5 shadow-card transition-all duration-300 hover:border-primary/40 hover:shadow-md",
        href && "cursor-pointer"
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm",
            gradient
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  )

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {card}
      </Link>
    )
  }
  return card
}