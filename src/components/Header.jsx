"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { useAccessibility } from "../context/AccessibilityContext"
import { signOut } from "firebase/auth"
import { auth } from "../utils/firebase"
import AccessibilityControls from "./AccessibilityControls"

const Header = ({ theme: propTheme }) => {
  const { user, userData } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const { getContrastTheme } = useAccessibility()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Use contrast-aware theme
  const theme = getContrastTheme(darkMode)

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
          link.active ? `${theme.accent} bg-opacity-10` : `${theme.text.secondary} hover:${theme.text.primary}`
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
        className={`${isMobile ? "block" : ""} px-3 py-2 rounded-md text-sm font-medium ${theme.text.secondary} hover:${theme.text.primary}`}
      >
        Mi Perfil
      </Link>
      <button
        onClick={handleSignOut}
        className={`${isMobile ? "block w-full text-left" : ""} px-3 py-2 rounded-md text-sm font-medium ${theme.text.secondary} hover:${theme.text.primary}`}
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
    <nav className={`border-b ${theme.nav} ${theme.border} shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and desktop menu */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/dashboard" className={`text-2xl font-bold ${theme.accent}`}>
                MyOpenLab
              </Link>
            </div>
            {user && <div className="hidden md:block ml-10 flex items-baseline space-x-4">{renderNavLinks()}</div>}
          </div>

          {/* Desktop right menu */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Accessibility Controls */}
            <AccessibilityControls />

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${theme.button.secondary} transition-colors`}
              aria-label="Cambiar tema"
            >
              {darkMode ? renderSunIcon() : renderMoonIcon()}
            </button>

            {user && (
              <>
                {/* Notifications */}
                <button className={`p-1 rounded-full ${theme.text.secondary} hover:${theme.text.primary}`}>
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
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center overflow-hidden ${theme.profile.bg}`}
                    >
                      {userData?.profilePicture ? (
                        <img
                          src={userData.profilePicture || "/placeholder.svg"}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className={`font-medium text-sm ${theme.profile.initial}`}>
                          {user?.email?.charAt(0).toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                  </button>

                  {isMenuOpen && (
                    <div
                      className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${theme.card} border-2 ${theme.border} z-50`}
                    >
                      {renderProfileMenu()}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Accessibility Controls */}
            <AccessibilityControls />

            {/* Dark mode toggle */}
            <button onClick={toggleDarkMode} className={`p-2 rounded-full ${theme.button.secondary}`}>
              {darkMode ? renderSunIcon() : renderMoonIcon()}
            </button>

            {user && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-md ${theme.text.secondary} hover:${theme.text.primary}`}
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
          <div className={`px-2 pt-2 pb-3 space-y-1 ${theme.card}`}>{renderNavLinks(true)}</div>
          <div className={`pt-4 pb-3 border-t ${theme.border} ${theme.card}`}>
            <div className="flex items-center px-5">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center overflow-hidden ${theme.profile.bg}`}
              >
                {userData?.profilePicture ? (
                  <img
                    src={userData.profilePicture || "/placeholder.svg"}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className={`font-medium text-lg ${theme.profile.initial}`}>
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div className="ml-3">
                <div className={theme.text.primary}>
                  {userData?.firstName} {userData?.lastName}
                </div>
                <div className={theme.text.secondary}>{user?.email}</div>
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
