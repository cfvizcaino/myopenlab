"use client"

import { Link, useLocation } from "react-router-dom"

const Breadcrumbs = ({ theme }) => {
  const location = useLocation()

  // Don't show breadcrumbs on landing page
  if (location.pathname === "/") {
    return null
  }

  const pathnames = location.pathname.split("/").filter((x) => x)

  const breadcrumbNames = {
    catalog: "Catálogo",
    project: "Proyecto",
    dashboard: "Dashboard",
    projects: "Proyectos",
    profile: "Perfil",
    login: "Iniciar Sesión",
    register: "Registrarse",
  }

  return (
    <nav className={`${theme?.card || "bg-white"} border-b ${theme?.border || "border-gray-200"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 py-3 text-sm">
          <Link to="/" className={`${theme?.muted || "text-gray-500"} hover:${theme?.highlight || "text-gray-900"}`}>
            Inicio
          </Link>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`
            const isLast = index === pathnames.length - 1
            const displayName = breadcrumbNames[name] || name

            return (
              <div key={name} className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {isLast ? (
                  <span className={theme?.highlight || "text-gray-900"}>{displayName}</span>
                ) : (
                  <Link
                    to={routeTo}
                    className={`${theme?.muted || "text-gray-500"} hover:${theme?.highlight || "text-gray-900"}`}
                  >
                    {displayName}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Breadcrumbs
