"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "../utils/firebase"
import { ref, deleteObject } from "firebase/storage"
import { storage } from "../utils/firebase"
import Navbar from "../components/Header"
import ProjectForm from "../components/ProjectForm"
import ProjectCard from "../components/ProjectCard"
import DeleteConfirmationModal from "../components/DeleteConfirmationModal"

const Projects = () => {
  const { user } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [filter, setFilter] = useState("all") // all, public, private

  // Theme classes
  const theme = {
    bg: darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800",
    card: darkMode ? "bg-gray-800" : "bg-white",
    highlight: darkMode ? "text-white" : "text-gray-900",
    muted: darkMode ? "text-gray-400" : "text-gray-500",
    accent: darkMode ? "text-indigo-400" : "text-indigo-600",
    select: darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900",
  }

  // Fetch user's projects
  const fetchProjects = async () => {
    if (!user) return

    setLoading(true)
    try {
      const q = query(collection(db, "projects"), where("userId", "==", user.uid))
      const querySnapshot = await getDocs(q)

      const projectsList = []
      querySnapshot.forEach((doc) => {
        projectsList.push({
          id: doc.id,
          ...doc.data(),
        })
      })

      // Sort by creation date (newest first)
      projectsList.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
        return dateB - dateA
      })

      setProjects(projectsList)
    } catch (err) {
      console.error("Error fetching projects:", err)
      setError("Error al cargar los proyectos. Por favor, intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // Load projects on component mount
  useEffect(() => {
    fetchProjects()
  }, [user])

  // Create new project
  const handleCreateProject = async (projectData) => {
    try {
      const newProject = {
        ...projectData,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await addDoc(collection(db, "projects"), newProject)
      setIsFormOpen(false)
      fetchProjects()
    } catch (err) {
      console.error("Error creating project:", err)
      setError("Error al crear el proyecto. Por favor, intenta nuevamente.")
    }
  }

  // Update existing project
  const handleUpdateProject = async (projectData) => {
    try {
      const projectRef = doc(db, "projects", currentProject.id)
      await updateDoc(projectRef, {
        ...projectData,
        updatedAt: new Date(),
      })

      setIsFormOpen(false)
      setCurrentProject(null)
      fetchProjects()
    } catch (err) {
      console.error("Error updating project:", err)
      setError("Error al actualizar el proyecto. Por favor, intenta nuevamente.")
    }
  }

  // Delete project
  const handleDeleteProject = async (projectId) => {
    const projectToDelete = projects.find((project) => project.id === projectId)
    if (projectToDelete) {
      setProjectToDelete(projectToDelete)
      setIsDeleteModalOpen(true)
    }
  }

  // Confirm delete project
  const confirmDeleteProject = async () => {
    try {
      // Delete featured image if exists
      if (projectToDelete.featuredImage) {
        try {
          const imageRef = ref(storage, projectToDelete.featuredImage)
          await deleteObject(imageRef)
        } catch (error) {
          console.log("Could not delete project image:", error)
        }
      }

      // Delete project document
      await deleteDoc(doc(db, "projects", projectToDelete.id))
      setIsDeleteModalOpen(false)
      setProjectToDelete(null)
      fetchProjects()
    } catch (err) {
      console.error("Error deleting project:", err)
      setError("Error al eliminar el proyecto. Por favor, intenta nuevamente.")
      setIsDeleteModalOpen(false)
    }
  }

  // Open form for editing
  const handleEditProject = (project) => {
    setCurrentProject(project)
    setIsFormOpen(true)
  }

  // Filter projects based on visibility
  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true
    return project.visibility === filter
  })

  // Get stats
  const stats = {
    total: projects.length,
    public: projects.filter((p) => p.visibility === "public").length,
    private: projects.filter((p) => p.visibility === "private").length,
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="px-4 py-6 sm:px-0 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h1 className={`text-3xl font-bold ${theme.highlight}`}>Mis Proyectos</h1>
            <p className={`mt-1 text-sm ${theme.muted}`}>Gestiona tus proyectos personales</p>

            {/* Stats */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <span className={theme.muted}>
                Total: <span className={theme.highlight}>{stats.total}</span>
              </span>
              <span className={theme.muted}>
                Públicos: <span className="text-green-600 dark:text-green-400">{stats.public}</span>
              </span>
              <span className={theme.muted}>
                Privados: <span className="text-gray-600 dark:text-gray-400">{stats.private}</span>
              </span>
            </div>
          </div>

          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
            {/* Filter dropdown */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`rounded-md shadow-sm px-3 py-2 border ${theme.select}`}
            >
              <option value="all">Todos los proyectos</option>
              <option value="public">Solo públicos</option>
              <option value="private">Solo privados</option>
            </select>

            {/* Create project button */}
            <button
              onClick={() => {
                setCurrentProject(null)
                setIsFormOpen(true)
              }}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${darkMode ? "focus:ring-offset-gray-800" : ""}`}
            >
              <svg
                className="mr-2 -ml-1 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Proyecto
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 sm:px-0 mb-6">
            <div className="rounded-md bg-red-50 p-4 border border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setError("")}
                      className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:hover:bg-red-800/50"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Project form modal */}
        {isFormOpen && (
          <ProjectForm
            project={currentProject}
            onSubmit={currentProject ? handleUpdateProject : handleCreateProject}
            onCancel={() => {
              setIsFormOpen(false)
              setCurrentProject(null)
            }}
          />
        )}

        {/* Projects list */}
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
              <h3 className={`mt-2 text-sm font-medium ${theme.highlight}`}>
                {filter === "all"
                  ? "No hay proyectos"
                  : `No hay proyectos ${filter === "public" ? "públicos" : "privados"}`}
              </h3>
              <p className={`mt-1 text-sm ${theme.muted}`}>
                {filter === "all"
                  ? "Comienza creando un nuevo proyecto."
                  : `No tienes proyectos ${filter === "public" ? "públicos" : "privados"} aún.`}
              </p>
              {filter === "all" && (
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setCurrentProject(null)
                      setIsFormOpen(true)
                    }}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${darkMode ? "focus:ring-offset-gray-800" : ""}`}
                  >
                    <svg
                      className="mr-2 -ml-1 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Proyecto
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  showActions={true}
                  showAuthor={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteProject}
        projectTitle={projectToDelete?.title}
      />
    </div>
  )
}

export default Projects
