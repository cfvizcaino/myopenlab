"use client"

import { useEffect } from "react"
import { useAccessibility } from "../context/AccessibilityContext"

export const useKeyboardShortcuts = () => {
  const { increaseFontSize, decreaseFontSize, toggleContrastMode } = useAccessibility()

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Font size shortcuts
      if (event.ctrlKey) {
        switch (event.key) {
          case "+":
          case "=":
            event.preventDefault()
            increaseFontSize()
            break
          case "-":
            event.preventDefault()
            decreaseFontSize()
            break
        }
      }

      // Contrast mode shortcut
      if (event.ctrlKey && event.altKey && event.key === "c") {
        event.preventDefault()
        toggleContrastMode()
      }
    }

    // Custom event listeners for global shortcuts
    const handleIncreaseFontSize = () => increaseFontSize()
    const handleDecreaseFontSize = () => decreaseFontSize()
    const handleToggleContrast = () => toggleContrastMode()

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("increaseFontSize", handleIncreaseFontSize)
    window.addEventListener("decreaseFontSize", handleDecreaseFontSize)
    window.addEventListener("toggleContrast", handleToggleContrast)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("increaseFontSize", handleIncreaseFontSize)
      window.removeEventListener("decreaseFontSize", handleDecreaseFontSize)
      window.removeEventListener("toggleContrast", handleToggleContrast)
    }
  }, [increaseFontSize, decreaseFontSize, toggleContrastMode])
}
