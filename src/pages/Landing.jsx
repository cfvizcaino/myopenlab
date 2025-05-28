"use client"

import { Link } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"

const Landing = () => {
  const { darkMode, toggleDarkMode } = useTheme()
  const { user } = useAuth()

  // Theme classes
  const theme = {
    bg: darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900",
    card: darkMode ? "bg-gray-800" : "bg-white",
    highlight: darkMode ? "text-white" : "text-gray-900",
    muted: darkMode ? "text-gray-400" : "text-gray-600",
    accent: darkMode ? "text-indigo-400" : "text-indigo-600",
    border: darkMode ? "border-gray-700" : "border-gray-200",
    gradient: darkMode ? "from-gray-900 via-purple-900 to-violet-900" : "from-blue-50 via-indigo-50 to-purple-50",
  }

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      title: "Gestión de Proyectos",
      description: "Organiza y gestiona todos tus proyectos en un solo lugar con herramientas intuitivas.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: "Colaboración",
      description: "Trabaja en equipo y comparte tus proyectos con la comunidad de desarrolladores.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Open Source",
      description: "Descubre proyectos de código abierto y contribuye a la comunidad global.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      title: "Analytics",
      description: "Obtén insights sobre el rendimiento y la popularidad de tus proyectos.",
    },
  ]

  const stats = [
    { number: "1,000+", label: "Proyectos Creados" },
    { number: "500+", label: "Desarrolladores" },
    { number: "50+", label: "Tecnologías" },
    { number: "24/7", label: "Soporte" },
  ]

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
      {/* Navigation */}
      <nav className={`border-b ${theme.border} backdrop-blur-sm bg-opacity-90`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className={`text-2xl font-bold ${theme.accent}`}>
                MyOpenLab
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/catalog" className={`text-sm font-medium ${theme.muted} hover:${theme.highlight}`}>
                Explorar Proyectos
              </Link>
              <a href="#features" className={`text-sm font-medium ${theme.muted} hover:${theme.highlight}`}>
                Características
              </a>
              <a href="#about" className={`text-sm font-medium ${theme.muted} hover:${theme.highlight}`}>
                Acerca de
              </a>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-yellow-400" : "bg-gray-100 text-gray-700"}`}
                aria-label="Cambiar tema"
              >
                {darkMode ? renderSunIcon() : renderMoonIcon()}
              </button>

              {/* Auth buttons */}
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className={`text-sm font-medium ${theme.muted} hover:${theme.highlight}`}>
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${theme.gradient}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className={`text-4xl md:text-6xl font-bold ${theme.highlight} mb-6`}>
              Gestiona y Comparte
              <br />
              <span className={theme.accent}>Tus Proyectos</span>
            </h1>
            <p className={`text-xl ${theme.muted} mb-8 max-w-3xl mx-auto`}>
              La plataforma definitiva para desarrolladores que quieren organizar sus proyectos, colaborar con otros y
              contribuir a la comunidad open source.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Ir al Dashboard
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Comenzar Gratis
                    <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    to="/catalog"
                    className={`inline-flex items-center px-8 py-3 border ${theme.border} text-base font-medium rounded-md ${theme.highlight} ${theme.card} hover:bg-opacity-80`}
                  >
                    Explorar Proyectos
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={`py-16 ${theme.card}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl md:text-4xl font-bold ${theme.accent} mb-2`}>{stat.number}</div>
                <div className={`text-sm ${theme.muted}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className={`py-24 ${theme.bg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold ${theme.highlight} mb-4`}>
              Todo lo que necesitas para gestionar tus proyectos
            </h2>
            <p className={`text-xl ${theme.muted} max-w-3xl mx-auto`}>
              Herramientas poderosas y fáciles de usar para desarrolladores de todos los niveles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className={`${theme.card} p-6 rounded-lg shadow-lg border ${theme.border}`}>
                <div className={`${theme.accent} mb-4`}>{feature.icon}</div>
                <h3 className={`text-xl font-semibold ${theme.highlight} mb-2`}>{feature.title}</h3>
                <p className={`${theme.muted}`}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`py-24 bg-gradient-to-r from-indigo-600 to-purple-600`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">¿Listo para comenzar tu próximo proyecto?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de desarrolladores que ya están usando MyOpenLab para gestionar sus proyectos.
          </p>
          {user ? (
            <Link
              to="/projects"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-gray-50"
            >
              Crear Proyecto
              <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-gray-50"
            >
              Registrarse Gratis
              <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className={`${theme.card} border-t ${theme.border}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className={`text-2xl font-bold ${theme.accent} mb-4 block`}>
                MyOpenLab
              </Link>
              <p className={`${theme.muted} mb-4 max-w-md`}>
                La plataforma definitiva para gestionar y compartir proyectos de desarrollo. Construida por
                desarrolladores, para desarrolladores.
              </p>
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${theme.highlight} uppercase tracking-wider mb-4`}>Producto</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/catalog" className={`text-sm ${theme.muted} hover:${theme.highlight}`}>
                    Explorar Proyectos
                  </Link>
                </li>
                <li>
                  <a href="#features" className={`text-sm ${theme.muted} hover:${theme.highlight}`}>
                    Características
                  </a>
                </li>
                <li>
                  <Link to="/register" className={`text-sm ${theme.muted} hover:${theme.highlight}`}>
                    Registrarse
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${theme.highlight} uppercase tracking-wider mb-4`}>Soporte</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className={`text-sm ${theme.muted} hover:${theme.highlight}`}>
                    Documentación
                  </a>
                </li>
                <li>
                  <a href="#" className={`text-sm ${theme.muted} hover:${theme.highlight}`}>
                    Contacto
                  </a>
                </li>
                <li>
                  <a href="#" className={`text-sm ${theme.muted} hover:${theme.highlight}`}>
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className={`mt-8 pt-8 border-t ${theme.border} text-center`}>
            <p className={`text-sm ${theme.muted}`}>© 2024 MyOpenLab. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
