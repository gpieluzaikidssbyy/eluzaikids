"use client"

import { useEffect, useState } from "react"

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const initial = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light"
    setTheme(initial)
    document.documentElement.classList.toggle("dark", initial === "dark")
  }, [])

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark"
      document.documentElement.classList.toggle("dark", next === "dark")
      localStorage.setItem("theme", next)
      return next
    })
  }

  return { theme, toggleTheme }
}