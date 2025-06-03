"use client"

import { useState, useEffect } from "react"
import { useTheme } from "../context/ThemeContext"
import { useAccessibility } from "../context/AccessibilityContext"

const EditProfileModal = ({ isOpen, onClose, onSave, currentData }) => {
  const { darkMode } = useTheme()
  const { getContrastTheme } = useAccessibility()

  // Theme classes with contrast support
  const theme = getContrastTheme(darkMode)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    website: "",
  })
  const [errors, setErrors] = useState({})

  // Initialize form with current data
  useEffect(() => {
    if (currentData) {
      setFormData({
        firstName: currentData.firstName || "",
        lastName: currentData.lastName || "",
        bio: currentData.bio || "",
        location: currentData.location || "",
        website: currentData.website || "",
      })
    }
  }, [currentData])

  // Handle input changes
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

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio"
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = "Por favor ingresa una URL válida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validate URL
  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      onSave(formData)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div className="flex items-center justify-center min-h-screen">
        <div className={`fixed inset-0 ${theme.overlay}`} aria-hidden="true" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full mx-auto my-8 shadow-xl z-50">
          <div className={`${theme.modal} px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg`}>
            <h3 className="text-lg leading-6 font-medium mb-4" id="modal-title">
              Editar Perfil
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full rounded-md shadow-sm px-3 py-2 border ${theme.input} ${errors.firstName ? "border-red-500" : ""}`}
                  placeholder="Tu nombre"
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full rounded-md shadow-sm px-3 py-2 border ${theme.input} ${errors.lastName ? "border-red-500" : ""}`}
                  placeholder="Tu apellido"
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-1">
                  Biografía
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleChange}
                  className={`w-full rounded-md shadow-sm px-3 py-2 border ${theme.input}`}
                  placeholder="Cuéntanos sobre ti..."
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full rounded-md shadow-sm px-3 py-2 border ${theme.input}`}
                  placeholder="Ciudad, País"
                />
              </div>

              {/* Website */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium mb-1">
                  Sitio Web
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className={`w-full rounded-md shadow-sm px-3 py-2 border ${theme.input} ${errors.website ? "border-red-500" : ""}`}
                  placeholder="https://tu-sitio-web.com"
                />
                {errors.website && <p className="mt-1 text-sm text-red-500">{errors.website}</p>}
              </div>

              {/* Buttons */}
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium sm:ml-3 sm:w-auto sm:text-sm ${theme.button.primary}`}
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 text-base font-medium sm:mt-0 sm:w-auto sm:text-sm ${theme.button.secondary}`}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProfileModal
