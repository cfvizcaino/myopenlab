
"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import { useAccessibility } from "../context/AccessibilityContext"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../utils/firebase"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Header from "../components/Header"
import Breadcrumbs from "../components/Breadcrumbs"
import ProjectInteractions from "../components/ProjectInteractions"
import { followUser, unfollowUser, isFollowing } from '../utils/followService'
import { auth } from '../utils/firebase'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { darkMode } = useTheme()
  const { getContrastTheme } = useAccessibility()
  const [project, setProject] = useState(null)
  const [author, setAuthor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)

  // Theme classes - now contrast-aware
  const theme = getContrastTheme(darkMode)

  // Extend theme with project-specific properties
  const extendedTheme = {
    ...theme,
    badge: darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700",
    link: darkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700",
  }

  // Fetch project details
  const fetchProject = async () => {
    if (!id) return

    setLoading(true)
    try {
      const projectDoc = await getDoc(doc(db, "projects", id))

      if (!projectDoc.exists()) {
        setError("Proyecto no encontrado")
        return
      }

      const projectData = { id: projectDoc.id, ...projectDoc.data() }
      setProject(projectData)

      // Fetch author information
      if (projectData.userId) {
        try {
          const userDoc = await getDoc(doc(db, "users", projectData.userId))
          if (userDoc.exists()) {
            setAuthor(userDoc.data())
          }
        } catch (error) {
          console.error("Error fetching author:", error)
        }
      }
    } catch (error) {
      console.error("Error fetching project:", error)
      setError("Error al cargar el proyecto")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProject()
  }, [id])

  useEffect(() => {
    if (auth.currentUser) {
      setCurrentUserId(auth.currentUser.uid)
    }
  }, [])

  useEffect(() => {
    const checkFollow = async () => {
      if (currentUserId && project && project.userId) {
        const following = await isFollowing(currentUserId, project.userId)
        setIsFollowingAuthor(following)
      }
    }
    checkFollow()
  }, [currentUserId, project])

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "Fecha desconocida"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: es,
    })
  }

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${theme.bg}`}>
        <Header theme={theme} />
        <Breadcrumbs theme={theme} />
        <div className="flex justify-center items-center py-12">
          <svg
            className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className={theme.highlight}>Cargando proyecto...</span>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${theme.bg}`}>
        <Header theme={theme} />
        <Breadcrumbs theme={theme} />
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className={`text-center py-12 ${theme.card} rounded-lg shadow`}>
            <h3 className={`text-lg font-medium ${theme.highlight}`}>{error || "Proyecto no encontrado"}</h3>
            <button
              onClick={() => navigate(-1)}
              className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700`}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg}`}>
      <Header theme={theme} />
      <Breadcrumbs theme={theme} />

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="px-4 sm:px-0 mb-6">
          <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center text-sm font-medium ${extendedTheme.link}`}
          >
            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
        </div>

        {/* Project content */}
        <div className={`${theme.card} shadow rounded-lg overflow-hidden mb-6`}>
          {/* Featured image */}
          {project.featuredImage && (
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={project.featuredImage || "/placeholder.svg"}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
              <div className="flex-1">
                <h1 className={`text-3xl font-bold ${theme.highlight} mb-2`}>{project.title}</h1>

                {/* Author and date */}
                <div className={`text-sm ${theme.muted} mb-4`}>
                  {author && (
                    <span>
                      por {author.firstName} {author.lastName} •
                    </span>
                  )}
                  <span className="ml-1">{formatDate(project.createdAt)}</span>
                </div>

                {/* Visibility badge */}
                <div className="mb-4">
                  {project.visibility === "private" ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Proyecto Privado
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Proyecto Público
                    </span>
                  )}
                </div>
              </div>

              {/* External links */}
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    GitHub
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V7a3 3 0 00-3-3H6a3 3 0 00-3 3v1m0 0v10a2 2 0 002 2h12a2 2 0 002-2V8m0 0V7a3 3 0 00-3-3H6a3 3 0 00-3 3v1z"
                      />
                    </svg>
                    Ver Demo
                  </a>
                )}
                {project.websiteUrl && (
                  <a
                    href={project.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
                      />
                    </svg>
                    Sitio Web
                  </a>
                )}
              </div>
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-sm font-medium ${theme.muted} mb-2`}>Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${extendedTheme.badge}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className={`text-lg font-medium ${theme.highlight} mb-3`}>Descripción</h3>
              <div className={`text-sm ${theme.highlight} leading-relaxed whitespace-pre-wrap`}>
                {project.description}
              </div>
            </div>

            {/* Author info */}
            {author && (
              <div className={`border-t ${theme.border} pt-6`}>
                <h3 className={`text-lg font-medium ${theme.highlight} mb-3`}>Sobre el Autor</h3>
                <div className="flex items-start space-x-4">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center overflow-hidden ${darkMode ? "bg-indigo-600" : "bg-indigo-100"}`}
                  >
                    {author.profilePicture ? (
                      <img
                        src={author.profilePicture || "/placeholder.svg"}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className={`font-medium text-lg ${darkMode ? "text-white" : "text-indigo-700"}`}>
                        {author.firstName?.charAt(0) || author.email?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className={`font-medium ${theme.highlight}`}>
                      {author.firstName} {author.lastName}
                    </h4>
                    <p className={`text-sm ${theme.muted}`}>{author.email}</p>
                    {author.bio && <p className={`text-sm ${theme.highlight} mt-2`}>{author.bio}</p>}
                  </div>
                </div>
                <div className="mt-2">
                  {currentUserId && (author.uid || project.userId) && currentUserId !== (author.uid || project.userId) && (
                    <button
                      onClick={async () => {
                        const authorUid = author.uid || project.userId;
                        if (!authorUid) return;
                        if (isFollowingAuthor) {
                          await unfollowUser(currentUserId, authorUid);
                          setIsFollowingAuthor(false);
                        } else {
                          await followUser(currentUserId, authorUid);
                          setIsFollowingAuthor(true);
                        }
                      }}
                      className="ml-2 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      {isFollowingAuthor ? 'Dejar de seguir' : 'Seguir'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Interactions (Likes, Comments, Favorites) */}
        {project.visibility === "public" && <ProjectInteractions project={project} onProjectUpdate={fetchProject} />}
      </div>
    </div>
  )
}

export default ProjectDetail