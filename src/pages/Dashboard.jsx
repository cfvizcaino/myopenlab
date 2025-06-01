"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { signOut } from "firebase/auth"
import { auth } from "../utils/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../utils/firebase"
import Navbar from "../components/Header"
import ActivityTimeline from "../components/ActivityTimeline"
import { useAccessibility } from "../context/AccessibilityContext"

const Dashboard = () => {
  const { user } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [recentProjects, setRecentProjects] = useState([])
  const [dashboardStats, setDashboardStats] = useState({
    totalProjects: 0,
    totalLikes: 0,
    totalComments: 0,
    publicProjects: 0,
    privateProjects: 0,
  })
  const [loading, setLoading] = useState(true)

  // Theme classes
  const { getContrastTheme } = useAccessibility()
  const theme = getContrastTheme(darkMode)

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Fetch user's projects
        const projectsQuery = query(collection(db, "projects"), where("userId", "==", user.uid))
        const projectsSnapshot = await getDocs(projectsQuery)

        const projects = []
        let totalLikes = 0
        let publicProjects = 0
        let privateProjects = 0

        projectsSnapshot.forEach((doc) => {
          const projectData = { id: doc.id, ...doc.data() }
          projects.push(projectData)

          // Count likes
          if (projectData.likes && Array.isArray(projectData.likes)) {
            totalLikes += projectData.likes.length
          }

          // Count visibility
          if (projectData.visibility === "public") {
            publicProjects++
          } else {
            privateProjects++
          }
        })

        // Sort projects by creation date (newest first)
        projects.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
          return dateB - dateA
        })

        // Get recent projects (limit to 3)
        setRecentProjects(projects.slice(0, 3))

        // Fetch comments on user's projects
        let totalComments = 0
        if (projects.length > 0) {
          const projectIds = projects.map((p) => p.id)
          const commentsQuery = query(
            collection(db, "comments"),
            where("projectId", "in", projectIds.slice(0, 10)), // Firestore 'in' limit is 10
          )
          const commentsSnapshot = await getDocs(commentsQuery)
          totalComments = commentsSnapshot.size
        }

        setDashboardStats({
          totalProjects: projects.length,
          totalLikes,
          totalComments,
          publicProjects,
          privateProjects,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  // Get user's first name for greeting
  const firstName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || ""

  // Stats data with real user data
  const stats = [
    {
      title: "Proyectos Totales",
      count: dashboardStats.totalProjects,
      icon: (
        <svg
          className={theme.accent}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          width="24"
          height="24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      gradient: darkMode ? "from-indigo-800 to-purple-900" : "from-indigo-50 to-purple-100",
      linkColor: darkMode ? "text-indigo-300 hover:text-indigo-100" : "text-indigo-700 hover:text-indigo-900",
      linkText: "Ver todos",
      linkPath: "/projects",
      subtitle: `${dashboardStats.publicProjects} públicos, ${dashboardStats.privateProjects} privados`,
    },
    {
      title: "Me Gusta Recibidos",
      count: dashboardStats.totalLikes,
      icon: (
        <svg
          className={darkMode ? "text-red-400" : "text-red-600"}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          width="24"
          height="24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      gradient: darkMode ? "from-red-800 to-pink-900" : "from-red-50 to-pink-100",
      linkColor: darkMode ? "text-red-300 hover:text-red-100" : "text-red-700 hover:text-red-900",
      linkText: "Ver proyectos",
      linkPath: "/projects",
      subtitle: "En todos tus proyectos",
    },
    {
      title: "Comentarios Recibidos",
      count: dashboardStats.totalComments,
      icon: (
        <svg
          className={darkMode ? "text-blue-400" : "text-blue-600"}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          width="24"
          height="24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      gradient: darkMode ? "from-blue-800 to-cyan-900" : "from-blue-50 to-cyan-100",
      linkColor: darkMode ? "text-blue-300 hover:text-blue-100" : "text-blue-700 hover:text-blue-900",
      linkText: "Ver actividad",
      subtitle: "Interacciones en tus proyectos",
    },
    {
      title: "Proyectos Públicos",
      count: dashboardStats.publicProjects,
      icon: (
        <svg
          className={darkMode ? "text-green-400" : "text-green-600"}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          width="24"
          height="24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      gradient: darkMode ? "from-green-800 to-teal-900" : "from-green-50 to-teal-100",
      linkColor: darkMode ? "text-green-300 hover:text-green-100" : "text-green-700 hover:text-green-900",
      linkText: "Ver catálogo",
      linkPath: "/catalog",
      subtitle: "Visibles en el catálogo",
    },
  ]

  const renderNavLinks = (isMobile = false) => {
    const links = [
      { name: "Dashboard", active: true, path: "/dashboard" },
      { name: "Proyectos", active: false, path: "/projects" },
      { name: "Catálogo", active: false, path: "/catalog" },
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
        to="/profile"
        className={`${isMobile ? "block" : ""} px-3 py-2 rounded-md text-sm font-medium ${theme.inactiveNav}`}
      >
        Mi Perfil
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
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* Main content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="px-4 py-6 sm:px-0">
            <h1 className={`text-3xl font-bold ${theme.highlight}`}>Hola, {firstName}</h1>
            <p className={`mt-1 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Bienvenido a tu dashboard personal. Aquí puedes ver el resumen de tu actividad y proyectos.
            </p>
          </div>

          {/* Stats cards */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className={`overflow-hidden rounded-lg shadow ${theme.card} animate-pulse`}>
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-gray-300 rounded"></div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                          <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-200 px-5 py-3">
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              : stats.map((stat, index) => (
                  <div key={index} className={`overflow-hidden rounded-lg shadow ${theme.card}`}>
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">{stat.icon}</div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className={`text-sm font-medium truncate ${theme.muted}`}>{stat.title}</dt>
                            <dd>
                              <div className={`text-lg font-medium ${theme.highlight}`}>{stat.count}</div>
                              {stat.subtitle && <div className={`text-xs ${theme.muted} mt-1`}>{stat.subtitle}</div>}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className={`bg-gradient-to-r px-5 py-3 ${stat.gradient}`}>
                      <div className="text-sm">
                        <Link to={stat.linkPath || "#"} className={`font-medium ${stat.linkColor}`}>
                          {stat.linkText}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          {/* Main content grid */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent projects */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-medium ${theme.highlight}`}>Proyectos Recientes</h2>
                <Link
                  to="/projects"
                  className={`text-sm font-medium ${darkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"}`}
                >
                  Ver todos
                </Link>
              </div>

              {loading ? (
                <div className={`rounded-lg shadow ${theme.card} p-6`}>
                  <div className="animate-pulse space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : recentProjects.length === 0 ? (
                <div className={`rounded-lg shadow ${theme.card} p-6 text-center`}>
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h3 className={`mt-2 text-sm font-medium ${theme.highlight}`}>No tienes proyectos aún</h3>
                  <p className={`mt-1 text-sm ${theme.muted}`}>Comienza creando tu primer proyecto.</p>
                  <Link
                    to="/projects"
                    className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${darkMode ? "focus:ring-offset-gray-800" : ""}`}
                  >
                    Crear Proyecto
                  </Link>
                </div>
              ) : (
                <div
                  className={`rounded-lg shadow ${theme.card} divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
                >
                  {recentProjects.map((project) => (
                    <div key={project.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className={`text-lg font-medium ${theme.highlight} truncate`}>{project.title}</h3>
                          <p className={`mt-1 text-sm ${theme.muted} line-clamp-2`}>{project.description}</p>
                          <div className="mt-2 flex items-center space-x-4 text-sm">
                            <span className={`${theme.muted}`}>
                              {project.visibility === "public" ? (
                                <span className="inline-flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  Público
                                </span>
                              ) : (
                                <span className="inline-flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                  </svg>
                                  Privado
                                </span>
                              )}
                            </span>
                            {project.likes && project.likes.length > 0 && (
                              <span className={`${theme.muted} inline-flex items-center`}>
                                <svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                {project.likes.length} me gusta
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          to={`/project/${project.id}`}
                          className={`ml-4 text-sm font-medium ${darkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"}`}
                        >
                          Ver detalles
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Timeline */}
            <div className="lg:col-span-1">
              <h2 className={`text-lg font-medium ${theme.highlight} mb-4`}>Actividad Reciente</h2>
              <ActivityTimeline />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
