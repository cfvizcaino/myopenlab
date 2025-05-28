"use client"

import { useState, useEffect } from "react"
import { useTheme } from "../context/ThemeContext"
import Header from "../components/Header"
import ProjectCard from "../components/ProjectCard"
import { getFunctions, httpsCallable } from "firebase/functions"

const Catalog = () => {
  const { darkMode } = useTheme()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [allTags, setAllTags] = useState([])

  // Theme classes
  const theme = {
    bg: darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800",
    card: darkMode ? "bg-gray-800" : "bg-white",
    highlight: darkMode ? "text-white" : "text-gray-900",
    muted: darkMode ? "text-gray-400" : "text-gray-500",
    accent: darkMode ? "text-indigo-400" : "text-indigo-600",
    input: darkMode
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
    select: darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900",
  }

  // At the top of the component, initialize functions
  const functions = getFunctions()
  const getPublicProjects = httpsCallable(functions, "getPublicProjects")

  // Replace the fetchPublicProjects function
  const fetchPublicProjects = async () => {
    setLoading(true)
    try {
      const result = await getPublicProjects()
      const projectsList = result.data.projects || []

      console.log("Found public projects:", projectsList.length)

      const tagsSet = new Set()
      projectsList.forEach((project) => {
        if (project.tags && Array.isArray(project.tags)) {
          project.tags.forEach((tag) => tagsSet.add(tag))
        }
      })

      // Sort projects by creation date (newest first)
      projectsList.sort((a, b) => {
        const dateA = new Date(a.createdAt)
        const dateB = new Date(b.createdAt)
        return dateB - dateA
      })

      setProjects(projectsList)
      setAllTags(Array.from(tagsSet).sort())
    } catch (error) {
      console.error("Error fetching public projects:", error)
      setProjects([])
      setAllTags([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPublicProjects()
  }, [])

  // Filter projects based on search term and selected tag
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.authorName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTag = !selectedTag || (project.tags && project.tags.includes(selectedTag))

    return matchesSearch && matchesTag
  })

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg}`}>
      <Header theme={theme} />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className={`text-3xl font-bold ${theme.highlight}`}>Catálogo de Proyectos</h1>
          <p className={`mt-1 text-sm ${theme.muted}`}>Descubre proyectos increíbles creados por la comunidad</p>
        </div>

        {/* Search and filters */}
        <div className="px-4 sm:px-0 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search input */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar proyectos, autores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full rounded-md shadow-sm px-4 py-2 border ${theme.input}`}
              />
            </div>

            {/* Tag filter */}
            <div className="sm:w-64">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className={`w-full rounded-md shadow-sm px-4 py-2 border ${theme.select}`}
              >
                <option value="">Todas las etiquetas</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4">
            <p className={`text-sm ${theme.muted}`}>
              {loading
                ? "Cargando..."
                : `${filteredProjects.length} proyecto${filteredProjects.length !== 1 ? "s" : ""} encontrado${filteredProjects.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Debug info - remove this in production */}
        {!loading && (
          <div className="px-4 sm:px-0 mb-4">
            <div className={`text-xs ${theme.muted} p-2 rounded ${theme.card}`}>
              Debug: Loaded {projects.length} public projects
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
              <span className={theme.highlight}>Cargando proyectos...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className={`text-center py-12 ${theme.card} rounded-lg shadow`}>
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className={`mt-2 text-sm font-medium ${theme.highlight}`}>No se encontraron proyectos</h3>
              <p className={`mt-1 text-sm ${theme.muted}`}>
                {searchTerm || selectedTag
                  ? "Intenta ajustar tus filtros de búsqueda."
                  : "Aún no hay proyectos públicos en el catálogo."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} showActions={false} showAuthor={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Catalog
