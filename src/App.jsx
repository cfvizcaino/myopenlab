"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { AccessibilityProvider } from "./context/AccessibilityContext"
import { useEffect } from "react"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Projects from "./pages/Projects"
import Catalog from "./pages/Catalog"
import ProjectDetail from "./pages/ProjectDetail"
import UserProfile from "./pages/UserProfile"

// Keyboard shortcuts component
function KeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check for accessibility shortcuts
      if (event.ctrlKey) {
        switch (event.key) {
          case "+":
          case "=":
            event.preventDefault()
            // Increase font size
            const increaseEvent = new CustomEvent("increaseFontSize")
            window.dispatchEvent(increaseEvent)
            break
          case "-":
            event.preventDefault()
            // Decrease font size
            const decreaseEvent = new CustomEvent("decreaseFontSize")
            window.dispatchEvent(decreaseEvent)
            break
        }
      }

      // Ctrl + Alt + C for contrast mode
      if (event.ctrlKey && event.altKey && event.key === "c") {
        event.preventDefault()
        const contrastEvent = new CustomEvent("toggleContrast")
        window.dispatchEvent(contrastEvent)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return null
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AccessibilityProvider>
          <Router>
            <KeyboardShortcuts />
            <AppRoutes />
          </Router>
        </AccessibilityProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/project/:id" element={<ProjectDetail />} />

      {/* Auth routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/projects" element={user ? <Projects /> : <Navigate to="/login" />} />
      <Route path="/profile" element={user ? <UserProfile /> : <Navigate to="/login" />} />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
