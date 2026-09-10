import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckCircle2, AlertTriangle, XCircle, Info, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

/* ─── TailAdmin-style alert variants (see /alerts reference) ─── */

const alertVariants = cva(
  "relative flex w-full items-start gap-3 rounded-lg border p-4 text-sm",
  {
    variants: {
      variant: {
        success:
          "border-success/25 bg-success/[0.06] text-success dark:bg-success/[0.12]",
        warning:
          "border-amber-500/25 bg-amber-500/[0.06] text-amber-600 dark:bg-amber-500/[0.12] dark:text-amber-400",
        error:
          "border-destructive/25 bg-destructive/[0.06] text-destructive dark:bg-destructive/[0.12]",
        info: "border-primary/25 bg-primary/[0.06] text-primary dark:bg-primary/[0.12]",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

const alertIconMap: Record<string, React.ElementType> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
}

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  /** Message text rendered below the title */
  description?: React.ReactNode
  /** Optional trailing action link (e.g. "Learn more") */
  action?: React.ReactNode
  /** Show a rounded icon badge next to the content */
  icon?: boolean
  /** Allow content to fill available width */
  showLightbulb?: boolean
}

function Alert({
  className,
  variant = "info",
  title,
  description,
  action,
  icon = true,
  showLightbulb = false,
  children,
  ...props
}: AlertProps) {
  const Icon = showLightbulb ? Lightbulb : alertIconMap[variant ?? "info"]

  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon && (
        <span
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-current/10"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
      )}
      <div className="flex-1 space-y-1">
        {title && <p className="font-semibold leading-tight">{title}</p>}
        {description && (
          <div className="text-[13px] leading-relaxed opacity-90">{description}</div>
        )}
        {children}
        {action && <div className="pt-1">{action}</div>}
      </div>
    </div>
  )
}

/* Convenience exports for cleaner usage in pages */
const AlertSuccess = (props: Omit<AlertProps, "variant">) => <Alert variant="success" {...props} />
const AlertError = (props: Omit<AlertProps, "variant">) => <Alert variant="error" {...props} />

export { Alert, AlertSuccess, AlertError }