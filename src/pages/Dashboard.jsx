"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { collection, query, where, getDocs, limit, doc, getDoc } from "firebase/firestore"
import { db } from "../utils/firebase"
import Header from "../components/Header" // Importa el componente Header

const Dashboard = () => {
  const { user, userData } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
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

  const theme = {
    bg: darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800",
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg}`}>
      {/* Usa el componente Header */}
      <Header darkMode={darkMode} theme={theme} />

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
                    className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700`}
                  >
                    Crear tu primer proyecto
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className={`${theme.card} overflow-hidden shadow rounded-lg`}
                    >
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className={`text-lg font-medium ${theme.highlight} truncate`}>{project.title}</h3>
                        <p className={`mt-1 text-sm ${theme.muted} line-clamp-2`}>{project.description}</p>
                      </div>
                      <div className={`border-t px-4 py-4 sm:px-6`}>
                        <Link
                          to="/projects"
                          className={`text-sm font-medium`}
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
