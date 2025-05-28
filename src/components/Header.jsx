"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { signOut } from "firebase/auth"
import { auth } from "../utils/firebase"

const Header = ({ theme }) => {
  const { user, userData } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  // Check if route is active
  const isActive = (path) => {
    return location.pathname === path
  }

  const renderNavLinks = (isMobile = false) => {
    const links = [
      { name: "Dashboard", path: "/dashboard", active: isActive("/dashboard") },
      { name: "Proyectos", path: "/projects", active: isActive("/projects") },
      { name: "Catálogo", path: "/catalog", active: isActive("/catalog") },
    ]

    return links.map((link) => (
      <Link
        key={link.name}
        to={link.path}
        className={`${isMobile ? "block" : ""} px-3 py-2 rounded-md text-sm font-medium ${
          link.active
            ? darkMode
              ? "bg-gray-900 text-white"
              : "bg-indigo-50 text-indigo-700"
            : darkMode
              ? "text-gray-300 hover:bg-gray-700 hover:text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        }`}
      >
        {link.name}
      </Link>
    ))
  }

  const renderProfileMenu = (isMobile = false) => (
    <div className={`${isMobile ? "mt-3 px-2 space-y-1" : ""}`}>
      <Link
        to="/profile"
        className={`${isMobile ? "block" : ""} px-3 py-2 rounded-md text-sm font-medium ${
          darkMode
            ? "text-gray-300 hover:bg-gray-700 hover:text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        }`}
      >
        Mi Perfil
      </Link>
      <Link
        to="#"
        className={`${isMobile ? "block" : ""} px-3 py-2 rounded-md text-sm font-medium ${
          darkMode
            ? "text-gray-300 hover:bg-gray-700 hover:text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        }`}
      >
        Configuración
      </Link>
      <button
        onClick={handleSignOut}
        className={`${isMobile ? "block w-full text-left" : ""} px-3 py-2 rounded-md text-sm font-medium ${
          darkMode
            ? "text-gray-300 hover:bg-gray-700 hover:text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        }`}
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
    <nav
      className={`border-b ${theme?.nav || (darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")} shadow-sm`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and desktop menu */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link
                to="/dashboard"
                className={`text-2xl font-bold ${theme?.accent || (darkMode ? "text-indigo-400" : "text-indigo-600")}`}
              >
                MyOpenLab
              </Link>
            </div>
            {user && <div className="hidden md:block ml-10 flex items-baseline space-x-4">{renderNavLinks()}</div>}
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

            {user && (
              <>
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
                      className={`h-8 w-8 rounded-full flex items-center justify-center overflow-hidden ${darkMode ? "bg-indigo-600" : "bg-indigo-100"}`}
                    >
                      {userData?.profilePicture ? (
                        <img
                          src={userData.profilePicture || "/placeholder.svg"}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className={`font-medium text-sm ${darkMode ? "text-white" : "text-indigo-700"}`}>
                          {user?.email?.charAt(0).toUpperCase() || "U"}
                        </span>
                      )}
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
              </>
            )}
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

            {user && (
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
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && user && (
        <div className="md:hidden">
          <div className={`px-2 pt-2 pb-3 space-y-1 ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
            {renderNavLinks(true)}
          </div>
          <div
            className={`pt-4 pb-3 border-t ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}
          >
            <div className="flex items-center px-5">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center overflow-hidden ${darkMode ? "bg-indigo-600" : "bg-indigo-100"}`}
              >
                {userData?.profilePicture ? (
                  <img
                    src={userData.profilePicture || "/placeholder.svg"}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className={`font-medium text-lg ${darkMode ? "text-white" : "text-indigo-700"}`}>
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div className="ml-3">
                <div className={darkMode ? "text-white" : "text-gray-900"}>
                  {userData?.firstName} {userData?.lastName}
                </div>
                <div className={darkMode ? "text-gray-400" : "text-gray-500"}>{user?.email}</div>
              </div>
            </div>
            {renderProfileMenu(true)}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Header
