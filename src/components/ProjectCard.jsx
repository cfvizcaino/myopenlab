"use client"

import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useTheme } from "../context/ThemeContext"
import { Link } from "react-router-dom"
import { useAccessibility } from "../context/AccessibilityContext"

const ProjectCard = ({ project, onEdit, onDelete, showActions = true, showAuthor = false }) => {
  const { darkMode } = useTheme()
  const { getContrastTheme } = useAccessibility()

  // Theme classes with contrast support
  const theme = getContrastTheme(darkMode)

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "Fecha desconocida"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: es,
    })
  }

  // Get visibility badge
  const getVisibilityBadge = () => {
    if (project.visibility === "private") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Privado
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Público
        </span>
      )
    }
  }

  return (
    <div
      className={`${theme.card} overflow-hidden shadow rounded-lg border ${theme.border} transition-all duration-200 hover:shadow-lg`}
    >
      {/* Featured Image */}
      {project.featuredImage && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={project.featuredImage || "/placeholder.svg"}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        {/* Header with title and visibility */}
        <div className="flex items-start justify-between mb-2">
          <h3 className={`text-lg font-medium ${theme.text.primary} line-clamp-2 flex-1`}>{project.title}</h3>
          <div className="ml-2 flex-shrink-0">{getVisibilityBadge()}</div>
        </div>

        {/* Author (if showing in catalog) */}
        {showAuthor && project.authorName && (
          <p className={`text-sm ${theme.text.secondary} mb-2`}>por {project.authorName}</p>
        )}

        {/* Date */}
        <div className={`text-sm ${theme.text.secondary} mb-3`}>{formatDate(project.createdAt)}</div>

        {/* Description */}
        <p className={`text-sm ${theme.text.primary} line-clamp-3 mb-4`}>{project.description}</p>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${theme.badge}`}
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className={`text-xs ${theme.text.secondary}`}>+{project.tags.length - 3} más</span>
            )}
          </div>
        )}

        {/* External Links */}
        <div className="flex items-center space-x-3 mb-4">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${theme.link} hover:scale-110 transition-transform`}
              title="Ver en GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${theme.link} hover:scale-110 transition-transform`}
              title="Ver demo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V7a3 3 0 00-3-3H6a3 3 0 00-3 3v1m0 0v10a2 2 0 002 2h12a2 2 0 002-2V8m0 0V7a3 3 0 00-3-3H6a3 3 0 00-3 3v1z"
                />
              </svg>
            </a>
          )}
          {project.websiteUrl && (
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${theme.link} hover:scale-110 transition-transform`}
              title="Visitar sitio web"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
                />
              </svg>
            </a>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className={`border-t ${theme.border} pt-4 flex justify-between items-center`}>
            <Link to={`/project/${project.id}`} className={`text-sm font-medium ${theme.text.accent} hover:underline`}>
              Ver detalles
            </Link>
            <div className="flex space-x-4">
              <button onClick={() => onEdit(project)} className={`text-sm font-medium ${theme.button.edit}`}>
                Editar
              </button>
              <button onClick={() => onDelete(project.id)} className={`text-sm font-medium ${theme.button.delete}`}>
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectCard
