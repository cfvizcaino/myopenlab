"use client"

import { useState, useEffect } from "react"
import { useTheme } from "../context/ThemeContext"

const ProjectForm = ({ project, onSubmit, onCancel }) => {
  const { darkMode } = useTheme()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [errors, setErrors] = useState({})

  // Theme classes
  const theme = {
    modal: darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900",
    input: darkMode
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
    button: {
      primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
      secondary: darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-white hover:bg-gray-50 text-gray-700",
    },
    overlay: darkMode ? "bg-black bg-opacity-75" : "bg-gray-500 bg-opacity-75",
  }

  // Initialize form with project data if editing
  useEffect(() => {
    if (project) {
      setTitle(project.title || "")
      setDescription(project.description || "")
    } else {
      // Reset form when creating a new project
      setTitle("")
      setDescription("")
    }
  }, [project])

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!title.trim()) {
      newErrors.title = "El título es obligatorio"
    }

    if (!description.trim()) {
      newErrors.description = "La descripción es obligatoria"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit({ title, description })
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div className="flex items-center justify-center min-h-screen">
        <div className={`fixed inset-0 ${theme.overlay}`} aria-hidden="true" onClick={onCancel}></div>

        {/* Modal panel */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full mx-auto my-8 shadow-xl z-50">
          <div className={`${theme.modal} px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-t-lg`}>
            <h3 className="text-lg leading-6 font-medium" id="modal-title">
              {project ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
            </h3>
            <div className="mt-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full rounded-md shadow-sm px-3 py-2 border ${theme.input} ${errors.title ? "border-red-500" : ""}`}
                    placeholder="Nombre del proyecto"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                </div>

                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full rounded-md shadow-sm px-3 py-2 border ${theme.input} ${errors.description ? "border-red-500" : ""}`}
                    placeholder="Describe tu proyecto"
                  ></textarea>
                  {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium sm:ml-3 sm:w-auto sm:text-sm ${theme.button.primary}`}
                  >
                    {project ? "Guardar Cambios" : "Crear Proyecto"}
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
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
    </div>
  )
}

export default ProjectForm

