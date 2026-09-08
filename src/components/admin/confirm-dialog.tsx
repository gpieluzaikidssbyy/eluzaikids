"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  trigger?: ReactNode
  title: string
  description?: ReactNode
  confirmLabel?: string
  pending?: boolean
  onConfirm: () => void
  variant?: "destructive" | "default"
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Hapus",
  pending = false,
  onConfirm,
  variant = "destructive",
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
            className={cn(variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90")}
            disabled={pending}
          >
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}