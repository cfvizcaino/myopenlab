"use client"

import { createContext, useContext, useState, useEffect } from "react"

// Create the context
const AccessibilityContext = createContext()

// Hook to use the context
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider")
  }
  return context
}

// Accessibility provider
export const AccessibilityProvider = ({ children }) => {
  // Get initial values from localStorage
  const getInitialContrastMode = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = window.localStorage.getItem("contrastMode")
      return stored === "true"
    }
    return false
  }

  const getInitialFontSize = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = window.localStorage.getItem("fontSize")
      return stored || "medium"
    }
    return "medium"
  }

  const [contrastMode, setContrastMode] = useState(getInitialContrastMode)
  const [fontSize, setFontSize] = useState(getInitialFontSize)

  // Font size options
  const fontSizes = {
    small: {
      name: "Pequeño",
      class: "text-sm",
      scale: "0.875rem",
    },
    medium: {
      name: "Mediano",
      class: "text-base",
      scale: "1rem",
    },
    large: {
      name: "Grande",
      class: "text-lg",
      scale: "1.125rem",
    },
    xlarge: {
      name: "Muy Grande",
      class: "text-xl",
      scale: "1.25rem",
    },
  }

  // Save to localStorage when values change
  useEffect(() => {
    localStorage.setItem("contrastMode", contrastMode.toString())
  }, [contrastMode])

  useEffect(() => {
    localStorage.setItem("fontSize", fontSize)
  }, [fontSize])

  // Apply font size to document root
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement
      root.style.fontSize = fontSizes[fontSize].scale
    }
  }, [fontSize])

  // Apply contrast mode to document
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement
      const body = document.body
      if (contrastMode) {
        root.classList.add("contrast-mode")
        body.classList.add("contrast-mode")
      } else {
        root.classList.remove("contrast-mode")
        body.classList.remove("contrast-mode")
      }
    }
  }, [contrastMode])

  // Toggle functions
  const toggleContrastMode = () => {
    setContrastMode(!contrastMode)
  }

  const increaseFontSize = () => {
    const sizes = Object.keys(fontSizes)
    const currentIndex = sizes.indexOf(fontSize)
    if (currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1])
    }
  }

  const decreaseFontSize = () => {
    const sizes = Object.keys(fontSizes)
    const currentIndex = sizes.indexOf(fontSize)
    if (currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1])
    }
  }

  const setFontSizeByName = (sizeName) => {
    if (fontSizes[sizeName]) {
      setFontSize(sizeName)
    }
  }

  // Get contrast-aware theme classes
  const getContrastTheme = (darkMode) => {
    if (contrastMode) {
      return {
        bg: "bg-black text-white",
        card: "bg-black text-white border-white",
        input: "bg-black border-white text-white placeholder-gray-300",
        button: {
          primary: "bg-white text-black hover:bg-gray-200 border-2 border-white font-bold",
          secondary: "bg-black text-white hover:bg-gray-900 border-2 border-white",
        },
        text: {
          primary: "text-white",
          secondary: "text-gray-200",
          muted: "text-gray-300",
        },
        accent: "text-yellow-400",
        border: "border-white",
        nav: "bg-black border-white",
        profile: {
          bg: "bg-black border-2 border-white",
          text: "text-white",
          initial: "bg-white text-black font-bold",
        },
      }
    }

    // Return normal theme if contrast mode is off
    return {
      bg: darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800",
      card: darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
      input: darkMode
        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
      button: {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
        secondary: darkMode
          ? "bg-gray-700 hover:bg-gray-600 text-white"
          : "bg-gray-100 hover:bg-gray-200 text-gray-700",
      },
      text: {
        primary: darkMode ? "text-white" : "text-gray-900",
        secondary: darkMode ? "text-gray-300" : "text-gray-600",
        muted: darkMode ? "text-gray-400" : "text-gray-500",
      },
      accent: darkMode ? "text-indigo-400" : "text-indigo-600",
      border: darkMode ? "border-gray-700" : "border-gray-200",
      nav: darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
      profile: {
        bg: darkMode ? "bg-indigo-600" : "bg-indigo-100",
        text: darkMode ? "text-white" : "text-indigo-700",
        initial: darkMode ? "text-white" : "text-indigo-700",
      },
    }
  }

  const value = {
    contrastMode,
    fontSize,
    fontSizes,
    toggleContrastMode,
    increaseFontSize,
    decreaseFontSize,
    setFontSizeByName,
    getContrastTheme,
  }

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
}
