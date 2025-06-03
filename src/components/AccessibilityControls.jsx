"use client"

import { useState } from "react"
import { useAccessibility } from "../context/AccessibilityContext"
import { useTheme } from "../context/ThemeContext"

const AccessibilityControls = () => {
  const { darkMode } = useTheme()
  const {
    contrastMode,
    fontSize,
    fontSizes,
    toggleContrastMode,
    increaseFontSize,
    decreaseFontSize,
    getContrastTheme,
  } = useAccessibility()
  const [isOpen, setIsOpen] = useState(false)

  const theme = getContrastTheme(darkMode)

  const canIncrease = fontSize !== "xlarge"
  const canDecrease = fontSize !== "small"

  return (
    <div className="relative z-1000">
      {/* Accessibility Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full ${theme.button.secondary} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        aria-label="Opciones de accesibilidad"
        title="Opciones de accesibilidad"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
          />
        </svg>
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div
            className={`absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 z-50 ${theme.card} ${theme.border} border-2`}
          >
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`text-lg font-medium ${theme.text.primary}`}>Opciones de Accesibilidad</h3>
              <p className={`text-sm ${theme.text.muted}`}>Personaliza la apariencia para una mejor experiencia</p>
            </div>

            <div className="p-4 space-y-6">
              {/* Contrast Mode */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-sm font-medium ${theme.text.primary}`}>Modo Alto Contraste</label>
                  <button
                    onClick={toggleContrastMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      contrastMode ? "bg-white" : "bg-gray-200"
                    }`}
                    role="switch"
                    aria-checked={contrastMode}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                        contrastMode ? "translate-x-6 bg-black" : "translate-x-1 bg-white border border-gray-300"
                      }`}
                    />
                  </button>
                </div>
                <p className={`text-xs ${theme.text.muted}`}>Aumenta el contraste para mejorar la legibilidad</p>
              </div>

              {/* Font Size */}
              <div>
                <label className={`block text-sm font-medium ${theme.text.primary} mb-3`}>Tamaño de Fuente</label>

                {/* Font Size Buttons */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={decreaseFontSize}
                    disabled={!canDecrease}
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      canDecrease ? theme.button.secondary : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    } transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    aria-label="Disminuir tamaño de fuente"
                    title="Disminuir tamaño de fuente"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>

                  <div className="flex-1 mx-4 text-center">
                    <span className={`text-sm font-medium ${theme.text.primary}`}>{fontSizes[fontSize].name}</span>
                    <div className={`text-xs ${theme.text.muted} mt-1`}>Ejemplo de texto con este tamaño</div>
                  </div>

                  <button
                    onClick={increaseFontSize}
                    disabled={!canIncrease}
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      canIncrease ? theme.button.secondary : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    } transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    aria-label="Aumentar tamaño de fuente"
                    title="Aumentar tamaño de fuente"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Font Size Indicator */}
                <div className="flex justify-center space-x-1">
                  {Object.keys(fontSizes).map((size) => (
                    <div
                      key={size}
                      className={`w-2 h-2 rounded-full ${fontSize === size ? "bg-indigo-600" : "bg-gray-300"}`}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <label className={`block text-sm font-medium ${theme.text.primary} mb-2`}>Acciones Rápidas</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (!contrastMode) toggleContrastMode()
                      if (fontSize !== "large") increaseFontSize()
                    }}
                    className={`px-3 py-2 text-xs rounded-md ${theme.button.primary} transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  >
                    Máxima Accesibilidad
                  </button>
                  <button
                    onClick={() => {
                      if (contrastMode) toggleContrastMode()
                      // Reset to medium font size
                      if (fontSize !== "medium") {
                        // This would need to be implemented in the context
                        window.localStorage.setItem("fontSize", "medium")
                        window.location.reload()
                      }
                    }}
                    className={`px-3 py-2 text-xs rounded-md ${theme.button.secondary} transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  >
                    Restablecer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AccessibilityControls
