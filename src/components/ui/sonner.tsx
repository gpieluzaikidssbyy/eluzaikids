"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark")

  return (
    <Sonner
      theme={isDark ? "dark" : "light"}
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "rounded-xl border shadow-lg",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }