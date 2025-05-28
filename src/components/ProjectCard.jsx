"use client"

import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useTheme } from "../context/ThemeContext"
import { Link } from "react-router-dom"
import { useState } from "react"
import { doc, updateDoc, increment } from "firebase/firestore"
import { db } from "../utils/firebase"
import { useAuth } from "../context/AuthContext"

const ProjectCard = ({ project, onEdit, onDelete, showActions = true, showAuthor = false }) => {
  const { darkMode } = useTheme()
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(project.likes || 0)

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
    badge: darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700",
    link: darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700",
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
    }
    return null
  }

  // Handle like button click
  const handleLike = async () => {
    if (!user) return // Require login to like

    try {
      const projectRef = doc(db, "projects", project.id)

      // Toggle like
      if (!liked) {
        await updateDoc(projectRef, {
          likes: increment(1),
        })
        setLikeCount(likeCount + 1)
      } else {
        await updateDoc(projectRef, {
          likes: increment(-1),
        })
        setLikeCount(likeCount - 1)
      }

      setLiked(!liked)
    } catch (error) {
      console.error("Error updating likes:", error)
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

        {/* Category */}
        {project.category && (
          <div className="mb-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300`}
            >
              {project.category}
            </span>
          </div>
        )}

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
        <div className={`border-t ${theme.border} pt-4 flex justify-between items-center`}>
          <div className="flex items-center">
            <button
              onClick={handleLike}
              className={`flex items-center text-sm font-medium ${
                liked
                  ? "text-red-500 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              } transition-colors`}
              title={liked ? "Quitar me gusta" : "Me gusta"}
            >
              <svg
                className={`w-5 h-5 mr-1 ${liked ? "fill-current" : "stroke-current fill-none"}`}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {likeCount}
            </button>

            <Link
              to={`/project/${project.id}`}
              className={`ml-4 text-sm font-medium ${theme.text.accent} hover:underline`}
            >
              Ver detalles
            </Link>
          </div>

          {showActions && (
            <div className="flex space-x-4">
              <button onClick={() => onEdit(project)} className={`text-sm font-medium ${theme.button.edit}`}>
                Editar
              </button>
              <button onClick={() => onDelete(project.id)} className={`text-sm font-medium ${theme.button.delete}`}>
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectCard
