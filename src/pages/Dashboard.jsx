"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { signOut } from "firebase/auth"
import { auth } from "../utils/firebase"
import { collection, query, where, getDocs, limit, doc, getDoc } from "firebase/firestore"
import { db } from "../utils/firebase"

const Dashboard = () => {
  const { user, userData } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [recentProjects, setRecentProjects] = useState([])

  // Fetch recent projects
  useEffect(() => {
    const fetchRecentProjects = async () => {
      if (!user) return

      try {
        const q = query(collection(db, "projects"), where("userId", "==", user.uid), limit(3))

        const querySnapshot = await getDocs(q)
        const projects = []

        querySnapshot.forEach((doc) => {
          projects.push({
            id: doc.id,
            ...doc.data(),
          })
        })

        setRecentProjects(projects)
      } catch (error) {
        console.error("Error fetching recent projects:", error)
      }
    }

    fetchRecentProjects()
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

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

  // Stats data
  const stats = [
    {
      title: "Proyectos Activos",
      count: recentProjects.length,
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
    },
    {
      title: "Nuevos Recursos",
      count: 24,
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      ),
      gradient: darkMode ? "from-green-800 to-teal-900" : "from-green-50 to-teal-100",
      linkColor: darkMode ? "text-green-300 hover:text-green-100" : "text-green-700 hover:text-green-900",
      linkText: "Explorar",
    },
    {
      title: "Miembros Equipo",
      count: 7,
      icon: (
        <svg
          className={darkMode ? "text-yellow-400" : "text-yellow-600"}
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      gradient: darkMode ? "from-yellow-800 to-amber-900" : "from-yellow-50 to-amber-100",
      linkColor: darkMode ? "text-yellow-300 hover:text-yellow-100" : "text-yellow-700 hover:text-yellow-900",
      linkText: "Administrar",
    },
    {
      title: "Tareas Pendientes",
      count: 5,
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      gradient: darkMode ? "from-red-800 to-pink-900" : "from-red-50 to-pink-100",
      linkColor: darkMode ? "text-red-300 hover:text-red-100" : "text-red-700 hover:text-red-900",
      linkText: "Completar",
    },
  ]

  const renderNavLinks = (isMobile = false) => {
    const links = [
      { name: "Dashboard", active: true, path: "/dashboard" },
      { name: "Proyectos", active: false, path: "/projects" },
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

      {/* Main content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="px-4 py-6 sm:px-0">
            <h1 className={`text-3xl font-bold ${theme.highlight}`}>
              Hola, {userData?.firstName || ''} {userData?.lastName || ''}
            </h1>
            <p className={`mt-1 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Bienvenido a tu dashboard personal. Aquí puedes gestionar tus proyectos y recursos.
            </p>
          </div>

          {/* Stats cards */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className={`overflow-hidden rounded-lg shadow ${theme.card}`}>
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">{stat.icon}</div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className={`text-sm font-medium truncate ${theme.muted}`}>{stat.title}</dt>
                        <dd>
                          <div className={`text-lg font-medium ${theme.highlight}`}>{stat.count}</div>
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

          {/* Recent projects */}
          <div className="mt-8 px-4 sm:px-0">
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-medium ${theme.highlight}`}>Proyectos Recientes</h2>
              <Link
                to="/projects"
                className={`text-sm font-medium ${darkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"}`}
              >
                Ver todos
              </Link>
            </div>

            <div className="mt-4">
              {recentProjects.length === 0 ? (
                <div className={`rounded-lg shadow ${theme.card} p-6 text-center`}>
                  <p className={theme.muted}>No tienes proyectos aún.</p>
                  <Link
                    to="/projects"
                    className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${darkMode ? "focus:ring-offset-gray-800" : ""}`}
                  >
                    Crear tu primer proyecto
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className={`${theme.card} overflow-hidden shadow rounded-lg border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                    >
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className={`text-lg font-medium ${theme.highlight} truncate`}>{project.title}</h3>
                        <p className={`mt-1 text-sm ${theme.muted} line-clamp-2`}>{project.description}</p>
                      </div>
                      <div className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"} px-4 py-4 sm:px-6`}>
                        <Link
                          to="/projects"
                          className={`text-sm font-medium ${darkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"}`}
                        >
                          Ver detalles
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
