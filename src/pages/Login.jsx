
"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import { useAccessibility } from "../context/AccessibilityContext"
import { loginUser, resetPassword } from "../utils/authService"
import AccessibilityControls from "../components/AccessibilityControls"

const Login = () => {
  const { darkMode, toggleDarkMode } = useTheme()
  const { getContrastTheme } = useAccessibility()

  // Theme classes with contrast support
  const theme = getContrastTheme(darkMode)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = "El correo electrónico es obligatorio"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El correo electrónico no es válido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      await loginUser(formData.email, formData.password)
      navigate("/dashboard")
    } catch (error) {
      console.error("Error al iniciar sesión:", error)

      // Handle specific Firebase auth errors
      let errorMessage = "Error al iniciar sesión. Por favor, intenta nuevamente."

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No existe una cuenta con este correo electrónico."
          break
        case "auth/wrong-password":
          errorMessage = "Contraseña incorrecta."
          break
        case "auth/invalid-email":
          errorMessage = "El correo electrónico no es válido."
          break
        case "auth/user-disabled":
          errorMessage = "Esta cuenta ha sido deshabilitada."
          break
        case "auth/too-many-requests":
          errorMessage = "Demasiados intentos fallidos. Intenta más tarde."
          break
        case "auth/invalid-credential":
          errorMessage = "Credenciales inválidas. Verifica tu correo y contraseña."
          break
        default:
          errorMessage = error.message || errorMessage
      }

      setErrors({ general: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()

    if (!resetEmail) {
      setErrors({ resetEmail: "El correo electrónico es obligatorio" })
      return
    }

    if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      setErrors({ resetEmail: "El correo electrónico no es válido" })
      return
    }

    setResetLoading(true)
    setErrors({})

    try {
      await resetPassword(resetEmail)
      setResetMessage(
        "Se ha enviado un correo de recuperación a tu dirección de email. Revisa tu bandeja de entrada y spam.",
      )
      setResetEmail("")
    } catch (error) {
      console.error("Error al enviar correo de recuperación:", error)

      let errorMessage = "Error al enviar el correo de recuperación."

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No existe una cuenta con este correo electrónico."
          break
        case "auth/invalid-email":
          errorMessage = "El correo electrónico no es válido."
          break
        case "auth/too-many-requests":
          errorMessage = "Demasiados intentos. Intenta más tarde."
          break
        default:
          errorMessage = error.message || errorMessage
      }

      setErrors({ resetEmail: errorMessage })
    } finally {
      setResetLoading(false)
    }
  }

  const renderMoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  )

  const renderSunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  )

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${theme.bg}`}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-between items-center mb-6">
            <Link to="/" className={`text-2xl font-bold ${theme.accent}`}>
              MyOpenLab
            </Link>
            <div className="flex items-center space-x-2">
              {/* Accessibility Controls */}
              <AccessibilityControls />

              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-yellow-400" : "bg-gray-100 text-gray-700"}`}
                aria-label="Cambiar tema"
              >
                {darkMode ? renderSunIcon() : renderMoonIcon()}
              </button>
            </div>
          </div>
          <h2 className={`text-3xl font-extrabold ${theme.text.primary}`}>
            {showForgotPassword ? "Recuperar Contraseña" : "Inicia sesión en tu cuenta"}
          </h2>
          {!showForgotPassword && (
            <p className={`mt-2 text-sm ${theme.text.muted}`}>
              ¿No tienes una cuenta?{" "}
              <Link to="/register" className={`font-medium ${theme.accent} hover:underline`}>
                Regístrate aquí
              </Link>
            </p>
          )}
        </div>

        {/* Form */}
        <div className={`${theme.card} shadow rounded-lg p-8`}>
          {!showForgotPassword ? (
            // Login Form
            <form className="space-y-6" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
                  <div className="text-sm text-red-700 dark:text-red-400">{errors.general}</div>
                </div>
              )}

              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${theme.text.secondary}`}>
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 border ${theme.input} ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  placeholder="tu@email.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-medium ${theme.text.secondary}`}>
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 border ${theme.input} ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  placeholder="Tu contraseña"
                />
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className={`font-medium ${theme.accent} hover:underline`}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${theme.button.primary} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : null}
                  {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                </button>
              </div>
            </form>
          ) : (
            // Forgot Password Form
            <form className="space-y-6" onSubmit={handleForgotPassword}>
              <div className="text-center">
                <p className={`text-sm ${theme.text.secondary}`}>
                  Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </div>

              {resetMessage && (
                <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4">
                  <div className="text-sm text-green-700 dark:text-green-400">{resetMessage}</div>
                </div>
              )}

              <div>
                <label htmlFor="resetEmail" className={`block text-sm font-medium ${theme.text.secondary}`}>
                  Correo electrónico
                </label>
                <input
                  id="resetEmail"
                  name="resetEmail"
                  type="email"
                  autoComplete="email"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value)
                    if (errors.resetEmail) {
                      setErrors({})
                    }
                  }}
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 border ${theme.input} ${
                    errors.resetEmail ? "border-red-500" : ""
                  }`}
                  placeholder="tu@email.com"
                />
                {errors.resetEmail && <p className="mt-1 text-sm text-red-500">{errors.resetEmail}</p>}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setResetEmail("")
                    setResetMessage("")
                    setErrors({})
                  }}
                  className={`flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${theme.button.secondary}`}
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className={`flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${theme.button.primary} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {resetLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : null}
                  {resetLoading ? "Enviando..." : "Enviar correo"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className={`text-sm ${theme.text.muted}`}>
            <Link to="/" className={`${theme.accent} hover:underline`}>
              ← Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
