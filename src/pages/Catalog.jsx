"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from "firebase/firestore"
import { useTheme } from "../context/ThemeContext"
import Header from "../components/Header"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useAccessibility } from "../context/AccessibilityContext"
import { followUser, unfollowUser, isFollowing } from '../utils/followService'
import { auth } from '../utils/firebase'

const Catalog = () => {
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [allCategories, setAllCategories] = useState([])
  const { darkMode } = useTheme()
  const [error, setError] = useState(null)
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)

  // Theme classes
  const { getContrastTheme } = useAccessibility()
  const theme = getContrastTheme(darkMode)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const db = getFirestore()

        // Only fetch PUBLIC projects for the catalog
        const publicProjectsQuery = query(collection(db, "projects"), where("visibility", "==", "public"))
        const projectsSnapshot = await getDocs(publicProjectsQuery)

        console.log(`Found ${projectsSnapshot.docs.length} public projects`)

        // Fetch all comments to count them per project
        const commentsCollection = collection(db, "comments")
        const commentsSnapshot = await getDocs(commentsCollection)

        // Create a map of project ID to comment count
        const commentCounts = {}
        commentsSnapshot.docs.forEach((commentDoc) => {
          const comment = commentDoc.data()
          const projectId = comment.projectId
          commentCounts[projectId] = (commentCounts[projectId] || 0) + 1
        })

        const projectsData = await Promise.all(
          projectsSnapshot.docs.map(async (projectDoc) => {
            const project = { id: projectDoc.id, ...projectDoc.data() }

            // Add comment count
            project.commentCount = commentCounts[project.id] || 0

            // Ensure likes is an array and get count
            project.likes = project.likes || []
            project.likeCount = project.likes.length

            // Get author information
            if (project.userId) {
              try {
                const userDocRef = doc(db, "users", project.userId)
                const userSnapshot = await getDoc(userDocRef)
                if (userSnapshot.exists()) {
                  const userData = userSnapshot.data()
                  project.authorName = `${userData.firstName || "Desconocido"} ${userData.lastName || ""}`.trim()
                  project.authorProfilePicture = userData.profilePicture || ""
                } else {
                  project.authorName = "Autor desconocido"
                }
              } catch (error) {
                console.error("Error al obtener el autor:", error)
                project.authorName = "Autor desconocido"
              }
            } else {
              project.authorName = "Autor desconocido"
            }

            return project
          }),
        )

        console.log(`Processed ${projectsData.length} public projects with author data`)

        // Extract all unique tags for category filter
        const tagsSet = new Set()
        projectsData.forEach((project) => {
          if (project.tags && Array.isArray(project.tags)) {
            project.tags.forEach((tag) => tagsSet.add(tag))
          }
        })

        setProjects(projectsData)
        setFilteredProjects(projectsData)
        setAllCategories(Array.from(tagsSet).sort())
        setError(null)
      } catch (error) {
        console.error("Error al obtener los proyectos:", error)
        setError(`Error al cargar proyectos: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      const user = auth.currentUser;
      setCurrentUserId(user.uid);
    };
    fetchCurrentUserId();
  }, []);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (currentUserId && selectedProject?.userId) {
        const following = await isFollowing(currentUserId, selectedProject.userId);
        setIsFollowingAuthor(following);
      }
    };
    checkFollowStatus();
  }, [currentUserId, selectedProject]);

  const handleFollowToggle = async () => {
    if (!currentUserId || !selectedProject?.userId) return;
    if (isFollowingAuthor) {
      await unfollowUser(currentUserId, selectedProject.userId);
    } else {
      await followUser(currentUserId, selectedProject.userId);
    }
    setIsFollowingAuthor(!isFollowingAuthor);
  };

  // Filter and sort projects (only public ones)
  useEffect(() => {
    let filtered = [...projects]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.authorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (project.tags && project.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))),
      )
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((project) => project.tags && project.tags.includes(selectedCategory))
    }

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
          return dateB - dateA
        case "oldest":
          const dateA2 = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
          const dateB2 = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
          return dateA2 - dateB2
        case "most-liked":
          return (b.likeCount || 0) - (a.likeCount || 0)
        case "most-commented":
          return (b.commentCount || 0) - (a.commentCount || 0)
        case "alphabetical":
          return (a.title || "").localeCompare(b.title || "")
        default:
          return 0
      }
    })

    setFilteredProjects(filtered)
  }, [searchTerm, selectedCategory, sortBy, projects])

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "Fecha desconocida"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: es,
    })
  }

  // Get project card with enhanced information
  const ProjectCard = ({ project }) => (
    <div
      className={`h-full flex flex-col border rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${theme.card} ${theme.border} overflow-hidden`}
    >
      {/* Featured Image */}
      <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
        {project.featuredImage ? (
          <img
            src={project.featuredImage || "/placeholder.svg"}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        {/* Header with title and public badge */}
        <div className="flex items-start justify-between mb-3">
          <h2 className={`text-xl font-semibold ${theme.highlight} line-clamp-2 flex-1 mr-2`}>{project.title}</h2>
          <div className="flex-shrink-0">
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
          </div>
        </div>

        {/* Author */}
        <div className="flex items-center mb-3">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center overflow-hidden mr-3 ${darkMode ? "bg-indigo-600" : "bg-indigo-100"}`}
          >
            {project.authorProfilePicture ? (
              <img
                src={project.authorProfilePicture || "/placeholder.svg"}
                alt="Author"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className={`font-medium text-sm ${darkMode ? "text-white" : "text-indigo-700"}`}>
                {project.authorName?.charAt(0) || "U"}
              </span>
            )}
          </div>
          <div>
            <p className={`text-sm font-medium ${theme.highlight}`}>{project.authorName || "Desconocido"}</p>
            <p className={`text-xs ${theme.muted}`}>{formatDate(project.createdAt)}</p>
          </div>
        </div>

        {/* Description */}
        <div className="flex-grow mb-4">
          {project.description && <p className={`text-sm ${theme.muted} line-clamp-3`}>{project.description}</p>}
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${theme.badge}`}
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className={`text-xs ${theme.muted}`}>+{project.tags.length - 3} más</span>
            )}
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between mb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {/* Likes */}
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className={`text-sm font-medium ${theme.muted}`}>{project.likeCount || 0}</span>
            </div>

            {/* Comments */}
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className={`text-sm font-medium ${theme.muted}`}>{project.commentCount || 0}</span>
            </div>
          </div>

          {/* External Links */}
          <div className="flex items-center space-x-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${theme.link} hover:scale-110 transition-transform`}
                title="GitHub"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                title="Demo"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                title="Website"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </div>

        {/* View Details Button */}
        <Link
          to={`/project/${project.id}`}
          className={`w-full text-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${theme.accent} hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-current`}
        >
          Ver detalles
        </Link>
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen ${theme.bg} transition-all duration-500`}>
      <Header theme={theme} />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className={`text-3xl font-bold ${theme.highlight}`}>Catálogo Público</h1>
          <p className={`mt-1 text-sm ${theme.muted}`}>
            Descubre proyectos públicos increíbles creados por la comunidad
          </p>
        </div>

        {/* Search and filters */}
        <div className="px-4 sm:px-0 mb-6">
          {/* Search input */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar proyectos públicos, autores, tecnologías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 rounded-md shadow-sm px-4 py-3 border ${theme.input}`}
              />
            </div>
          </div>

          {/* Filters row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Category filter */}
            {allCategories.length > 0 && (
              <div>
                <label className={`block text-sm font-medium ${theme.muted} mb-1`}>Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full rounded-md shadow-sm px-3 py-2 border ${theme.select}`}
                >
                  <option value="">Todas las categorías</option>
                  {allCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort filter */}
            <div>
              <label className={`block text-sm font-medium ${theme.muted} mb-1`}>Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full rounded-md shadow-sm px-3 py-2 border ${theme.select}`}
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
                <option value="most-liked">Más gustados</option>
                <option value="most-commented">Más comentados</option>
                <option value="alphabetical">Alfabético</option>
              </select>
            </div>

            {/* Clear filters */}
            <div className="flex items-end">
              {(searchTerm || selectedCategory || sortBy !== "newest") && (
                <button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("")
                    setSortBy("newest")
                  }}
                  className={`w-full px-4 py-2 text-sm font-medium rounded-md border border-gray-300 ${theme.muted} hover:bg-gray-50 dark:hover:bg-gray-700`}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Results count and active filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <p className={`text-sm ${theme.muted}`}>
              {loading
                ? "Cargando..."
                : `${filteredProjects.length} proyecto${filteredProjects.length !== 1 ? "s" : ""} público${filteredProjects.length !== 1 ? "s" : ""} encontrado${filteredProjects.length !== 1 ? "s" : ""}`}
            </p>

            {/* Active filters badges */}
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                Búsqueda: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Categoría: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory("")}
                  className="ml-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Debug info */}
        {error && (
          <div className="px-4 sm:px-0 mb-4">
            <div
              className={`p-4 rounded-md bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400`}
            >
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Projects grid */}
        <div className="px-4 sm:px-0">
          {loading ? (
            <div className="flex justify-center py-12">
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
              <span className={theme.highlight}>Cargando proyectos públicos...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className={`text-center py-12 ${theme.card} rounded-lg shadow border ${theme.border}`}>
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className={`mt-2 text-sm font-medium ${theme.highlight}`}>No se encontraron proyectos públicos</h3>
              <p className={`mt-1 text-sm ${theme.muted}`}>
                {searchTerm || selectedCategory
                  ? "Intenta ajustar tus filtros de búsqueda."
                  : "Aún no hay proyectos públicos en el catálogo."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {selectedProject && (
          <div className="mt-6">
            <h3 className={`text-lg font-medium ${theme.highlight} mb-4`}>Detalles del Proyecto</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme.muted}`}>Autor: {selectedProject.authorName}</p>
              </div>
              <button onClick={handleFollowToggle}>
                {isFollowingAuthor ? 'Dejar de seguir' : 'Seguir'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Catalog
