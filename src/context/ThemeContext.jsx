"use client"

import { createContext, useContext, useState, useEffect } from "react"

// Crear el contexto
const ThemeContext = createContext()

// Hook personalizado para usar el contexto
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme debe ser usado dentro de un ThemeProvider")
  }
  return context
}

// Proveedor del contexto
export const ThemeProvider = ({ children }) => {
  // Intentar obtener el tema guardado en localStorage, o usar la preferencia del sistema
  const getInitialTheme = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      const storedTheme = window.localStorage.getItem("theme")
      if (storedTheme === "dark" || storedTheme === "light") {
        return storedTheme === "dark"
      }
    }

    // Si no hay tema guardado, usar la preferencia del sistema
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
    }

    // Valor por defecto
    return false
  }

  const [darkMode, setDarkMode] = useState(getInitialTheme)

  // Guardar el tema en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light")
  }, [darkMode])

  // Función para cambiar el tema
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e) => {
      // Solo cambiar automáticamente si el usuario no ha establecido una preferencia
      if (!localStorage.getItem("theme")) {
        setDarkMode(e.matches)
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>{children}</ThemeContext.Provider>
}
