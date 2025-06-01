"use client"

import { useState, useEffect } from "react"
import { useTheme } from "../context/ThemeContext"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "../utils/firebase"
import { useAuth } from "../context/AuthContext"
import { useAccessibility } from "../context/AccessibilityContext"

const ProjectForm = ({ project, onSubmit, onCancel }) => {
  const { darkMode } = useTheme()
  const { getContrastTheme } = useAccessibility()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    visibility: "public",
    githubUrl: "",
    demoUrl: "",
    websiteUrl: "",
    featuredImage: "",
  })
  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState("")

  // Theme classes with contrast support
  const theme = getContrastTheme(darkMode)

  // Initialize form with project data if editing
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        description: project.description || "",
        tags: project.tags ? project.tags.join(", ") : "",
        visibility: project.visibility || "public",
        githubUrl: project.githubUrl || "",
        demoUrl: project.demoUrl || "",
        websiteUrl: project.websiteUrl || "",
        featuredImage: project.featuredImage || "",
      })
      setImagePreview(project.featuredImage || "")
    } else {
      // Reset form when creating a new project
      setFormData({
        title: "",
        description: "",
        tags: "",
        visibility: "public",
        githubUrl: "",
        demoUrl: "",
        websiteUrl: "",
        featuredImage: "",
      })
      setImagePreview("")
    }
  }, [project])

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

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!file || !user) return

    setUploading(true)
    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("El archivo es demasiado grande. Máximo 5MB.")
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Por favor selecciona un archivo de imagen válido.")
      }

      console.log("Starting image upload:", file.name, file.size)

      // Create unique filename
      const timestamp = Date.now()
      const fileExtension = file.name.split(".").pop()
      const filename = `project_${user.uid}_${timestamp}.${fileExtension}`
      const imageRef = ref(storage, `project-images/${user.uid}/${filename}`)

      console.log("Uploading to path:", `project-images/${user.uid}/${filename}`)

      // Upload image
      const uploadResult = await uploadBytes(imageRef, file)
      console.log("Upload successful:", uploadResult)

      const downloadURL = await getDownloadURL(imageRef)
      console.log("Download URL obtained:", downloadURL)

      // Delete old image if exists and it's different
      if (formData.featuredImage && formData.featuredImage !== downloadURL) {
        try {
          // Extract the path from the old URL
          const oldUrl = formData.featuredImage
          if (oldUrl.includes("project-images/")) {
            const oldImageRef = ref(storage, formData.featuredImage)
            await deleteObject(oldImageRef)
            console.log("Old image deleted")
          }
        } catch (error) {
          console.log("Could not delete old image:", error)
        }
      }

      setFormData((prev) => ({
        ...prev,
        featuredImage: downloadURL,
      }))
      setImagePreview(downloadURL)

      console.log("Image upload completed successfully")
    } catch (error) {
      console.error("Error uploading image:", error)
      setErrors((prev) => ({
        ...prev,
        featuredImage: `Error al subir la imagen: ${error.message}`,
      }))
    } finally {
      setUploading(false)
    }
  }

  // Remove featured image
  const removeImage = async () => {
    if (formData.featuredImage) {
      try {
        const imageRef = ref(storage, formData.featuredImage)
        await deleteObject(imageRef)
      } catch (error) {
        console.log("Could not delete image:", error)
      }
    }
    setFormData((prev) => ({
      ...prev,
      featuredImage: "",
    }))
    setImagePreview("")
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "El título es obligatorio"
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria"
    }

    // Validate URLs if provided
    const urlFields = ["githubUrl", "demoUrl", "websiteUrl"]
    urlFields.forEach((field) => {
      if (formData[field] && !isValidUrl(formData[field])) {
        newErrors[field] = "Por favor ingresa una URL válida"
      }
    })

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
      const projectData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        // Ensure visibility is always set
        visibility: formData.visibility || "public",
      }
      onSubmit(projectData)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className={`fixed inset-0 ${theme.overlay}`} aria-hidden="true" onClick={onCancel}></div>

        {/* Modal panel */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-auto shadow-xl z-50 max-h-[90vh] overflow-y-auto">
          <div className={`${theme.modal} px-6 pt-6 pb-4 rounded-t-lg`}>
            <h3 className="text-xl leading-6 font-medium mb-6" id="modal-title">
              {project ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full rounded-md shadow-sm px-3 py-2 border ${theme.input} ${errors.title ? "border-red-500" : ""}`}
                  placeholder="Nombre del proyecto"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full rounded-md shadow-sm px-3 py-2 border ${theme.input} ${errors.description ? "border-red-500" : ""}`}
                  placeholder="Describe tu proyecto en detalle"
                />
                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium mb-2">
                  Etiquetas
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className={`w-full rounded-md shadow-sm px-3 py-2 border ${theme.input}`}
                  placeholder="React, JavaScript, Open Source (separadas por comas)"
                />
                <p className="mt-1 text-xs text-gray-500">Separa las etiquetas con comas</p>
              </div>

              {/* Visibility */}
              <div>
                <label htmlFor="visibility" className="block text-sm font-medium mb-2">
                  Visibilidad
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className={`w-full rounded-md shadow-sm px-3 py-2 border ${theme.select}`}
                >
                  <option value="public">Público - Visible en el catálogo</option>
                  <option value="private">Privado - Solo visible para ti</option>
                </select>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Imagen Destacada</label>

                {imagePreview ? (
                  <div className="mb-4">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className={`mt-2 inline-flex items-center px-3 py-1 text-sm font-medium rounded-md ${theme.button.danger}`}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Eliminar imagen
                    </button>
                  </div>
                ) : (
                  <div
                    className={`border-2 border-dashed rounded-md p-6 text-center ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                  >
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Sube una imagen para tu proyecto</p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      console.log("File selected:", file.name, file.size, file.type)
                      handleImageUpload(file)
                    }
                  }}
                  className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300"
                  disabled={uploading}
                />
                {uploading && (
                  <div className="mt-2 flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-sm text-blue-500">Subiendo imagen...</span>
                  </div>
                )}
                {errors.featuredImage && <p className="mt-1 text-sm text-red-500">{errors.featuredImage}</p>}
              </div>

              {/* External Links */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Enlaces Externos</h4>

                {/* GitHub URL */}
                <div>
                  <label htmlFor="githubUrl" className="block text-sm font-medium mb-2">
                    <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    GitHub
                  </label>
                  <input
                    type="url"
                    id="githubUrl"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    className={`w-full rounded-md shadow-sm px-3 py-2 border ${theme.input} ${errors.githubUrl ? "border-red-500" : ""}`}
                    placeholder="https://github.com/usuario/proyecto"
                  />
                  {errors.githubUrl && <p className="mt-1 text-sm text-red-500">{errors.githubUrl}</p>}
                </div>

                {/* Demo URL */}
                <div>
                  <label htmlFor="demoUrl" className="block text-sm font-medium mb-2">
                    <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V7a3 3 0 00-3-3H6a3 3 0 00-3 3v1m0 0v10a2 2 0 002 2h12a2 2 0 002-2V8m0 0V7a3 3 0 00-3-3H6a3 3 0 00-3 3v1z"
                      />
                    </svg>
                    Demo / Video
                  </label>
                  <input
                    type="url"
                    id="demoUrl"
                    name="demoUrl"
                    value={formData.demoUrl}
                    onChange={handleChange}
                    className={`w-full rounded-md shadow-sm px-3 py-2 border ${theme.input} ${errors.demoUrl ? "border-red-500" : ""}`}
                    placeholder="https://demo.ejemplo.com o https://youtube.com/watch?v=..."
                  />
                  {errors.demoUrl && <p className="mt-1 text-sm text-red-500">{errors.demoUrl}</p>}
                </div>

                {/* Website URL */}
                <div>
                  <label htmlFor="websiteUrl" className="block text-sm font-medium mb-2">
                    <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
                      />
                    </svg>
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    id="websiteUrl"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    className={`w-full rounded-md shadow-sm px-3 py-2 border ${theme.input} ${errors.websiteUrl ? "border-red-500" : ""}`}
                    placeholder="https://mi-proyecto.com"
                  />
                  {errors.websiteUrl && <p className="mt-1 text-sm text-red-500">{errors.websiteUrl}</p>}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row-reverse gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={uploading}
                  className={`w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium sm:text-sm ${theme.button.primary} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {uploading ? "Subiendo..." : project ? "Guardar Cambios" : "Crear Proyecto"}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className={`w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 text-base font-medium sm:text-sm ${theme.button.secondary}`}
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

export default ProjectForm
