"use client"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useTheme } from "../context/ThemeContext"

const ProjectList = ({ projects, onEdit, onDelete }) => {
  const { darkMode } = useTheme()

  // Theme classes
  const theme = {
    card: darkMode ? "bg-gray-800" : "bg-white",
    border: darkMode ? "border-gray-700" : "border-gray-200",
    text: {
      primary: darkMode ? "text-white" : "text-gray-900",
      secondary: darkMode ? "text-gray-300" : "text-gray-500",
      accent: darkMode ? "text-indigo-400" : "text-indigo-600",
    },
    button: {
      edit: darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800",
      delete: darkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-800",
    },
  }

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "Fecha desconocida"

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)

    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: es,
    })
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <div
          key={project.id}
          className={`${theme.card} overflow-hidden shadow rounded-lg border ${theme.border} transition-all duration-200 hover:shadow-md`}
        >
          <div className="px-4 py-5 sm:p-6">
            <h3 className={`text-lg font-medium ${theme.text.primary} truncate`}>{project.title}</h3>
            <div className={`mt-1 text-sm ${theme.text.secondary}`}>{formatDate(project.createdAt)}</div>
            <p className={`mt-3 text-sm ${theme.text.primary} line-clamp-3`}>{project.description}</p>
          </div>
          <div className={`border-t ${theme.border} px-4 py-4 sm:px-6 flex justify-end space-x-4`}>
            <button onClick={() => onEdit(project)} className={`text-sm font-medium ${theme.button.edit}`}>
              Editar
            </button>
            <button onClick={() => onDelete(project.id)} className={`text-sm font-medium ${theme.button.delete}`}>
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProjectList
