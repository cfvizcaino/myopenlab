"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "../utils/firebase"
import { signOut } from "firebase/auth"
import { auth } from "../utils/firebase"
import ProjectForm from "../components/ProjectForm"
import ProjectList from "../components/ProjectList"

const Projects = () => {
  const { user } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Theme classes
  const theme = {
    bg: darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800",
    nav: darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
    card: darkMode ? "bg-gray-800" : "bg-white",
    highlight: darkMode ? "text-white" : "text-gray-900",
    muted: darkMode ? "text-gray-400" : "text-gray-500",
    accent: darkMode ? "text-indigo-400" : "text-indigo-600",
    activeNav: darkMode ? "bg-gray-900 text-white" : "bg-indigo-50 text-indigo-700",
    inactiveNav: darkMode
      ? "text-gray-300 hover:bg-gray-700 hover:text-white"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800",
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
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
        title: projectData.title,
        description: projectData.description,
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
    if (!window.confirm("¿Estás seguro de que deseas eliminar este proyecto?")) {
      return
    }

    try {
      await deleteDoc(doc(db, "projects", projectId))
      fetchProjects()
    } catch (err) {
      console.error("Error deleting project:", err)
      setError("Error al eliminar el proyecto. Por favor, intenta nuevamente.")
    }
  }

  // Open form for editing
  const handleEditProject = (project) => {
    setCurrentProject(project)
    setIsFormOpen(true)
  }

  // Get user's first name for greeting
  const firstName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || ""

  const renderNavLinks = (isMobile = false) => {
    const links = [
      { name: "Dashboard", active: false, path: "/dashboard" },
      { name: "Proyectos", active: true, path: "/projects" },
      { name: "Recursos", active: false, path: "#" },
      { name: "Comunidad", active: false, path: "#" },
    ]

    return links.map((link) => (
      <Link
        key={link.name}
        to={link.path}
        className={`${isMobile ? "block" : ""} px-3 py-2 rounded-md text-sm font-medium ${link.active ? theme.activeNav : theme.inactiveNav}`}
      >
        {link.name}
      </Link>
    ))
  }

  const renderProfileMenu = (isMobile = false) => (
    <div className={`${isMobile ? "mt-3 px-2 space-y-1" : ""}`}>
      <Link
        to="#"
        className={`${isMobile ? "block" : ""} px-3 py-2 rounded-md text-sm font-medium ${theme.inactiveNav}`}
      >
        Tu Perfil
      </Link>
      <Link
        to="#"
        className={`${isMobile ? "block" : ""} px-3 py-2 rounded-md text-sm font-medium ${theme.inactiveNav}`}
      >
        Configuración
      </Link>
      <button
        onClick={handleSignOut}
        className={`${isMobile ? "block w-full text-left" : ""} px-3 py-2 rounded-md text-sm font-medium ${theme.inactiveNav}`}
      >
        Cerrar Sesión
      </button>
    </div>
  )

  const renderMoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  )

  const renderSunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  )

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg}`}>
      {/* Navbar */}
      <nav className={`border-b ${theme.nav} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and desktop menu */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className={`text-2xl font-bold ${theme.accent}`}>MyOpenLab</span>
              </div>
              <div className="hidden md:block ml-10 flex items-baseline space-x-4">{renderNavLinks()}</div>
            </div>

            {/* Desktop right menu */}
            <div className="hidden md:flex items-center">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-yellow-400" : "bg-gray-100 text-gray-700"} mr-3`}
                aria-label="Cambiar tema"
              >
                {darkMode ? renderSunIcon() : renderMoonIcon()}
              </button>

              {/* Notifications */}
              <button
                className={`p-1 rounded-full ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-black"} mr-3`}
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>

              {/* User profile */}
              <div className="relative">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${darkMode ? "bg-indigo-600" : "bg-indigo-100"}`}
                  >
                    <span className={`font-medium text-sm ${darkMode ? "text-white" : "text-indigo-700"}`}>
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                </button>

                {isMenuOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${darkMode ? "bg-gray-800 ring-1 ring-black ring-opacity-5" : "bg-white ring-1 ring-black ring-opacity-5"}`}
                  >
                    {renderProfileMenu()}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-yellow-400" : "bg-gray-100 text-gray-700"} mr-2`}
              >
                {darkMode ? renderSunIcon() : renderMoonIcon()}
              </button>

              {/* Menu toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-md ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"}`}
              >
                {isMenuOpen ? (
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className={`px-2 pt-2 pb-3 space-y-1 ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
              {renderNavLinks(true)}
            </div>
            <div
              className={`pt-4 pb-3 border-t ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}
            >
              <div className="flex items-center px-5">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${darkMode ? "bg-indigo-600" : "bg-indigo-100"}`}
                >
                  <span className={`font-medium text-lg ${darkMode ? "text-white" : "text-indigo-700"}`}>
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="ml-3">
                  <div className={theme.highlight}>{user?.displayName || user?.email}</div>
                  <div className={theme.muted}>{user?.email}</div>
                </div>
              </div>
              {renderProfileMenu(true)}
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="px-4 py-6 sm:px-0 flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${theme.highlight}`}>Mis Proyectos</h1>
            <p className={`mt-1 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Gestiona tus proyectos personales
            </p>
          </div>

          <div>
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
            darkMode={darkMode}
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
          ) : projects.length === 0 ? (
            <div className={`text-center py-12 ${theme.card} rounded-lg shadow`}>
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className={`mt-2 text-sm font-medium ${theme.highlight}`}>No hay proyectos</h3>
              <p className={`mt-1 text-sm ${theme.muted}`}>Comienza creando un nuevo proyecto.</p>
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
            </div>
          ) : (
            <ProjectList
              projects={projects}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              darkMode={darkMode}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Projects
