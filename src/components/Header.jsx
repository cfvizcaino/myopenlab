import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useTheme } from "../context/ThemeContext"; // Importa el ThemeContext

const Header = ({ theme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const auth = getAuth();

  // Obtén el estado y la función del ThemeContext
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    const currentUser = auth.currentUser;
    setUser(currentUser);
  }, [auth]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("Sesión cerrada");
        window.location.href = "/login";
      })
      .catch((error) => {
        console.error("Error al cerrar sesión:", error);
      });
  };

  const renderNavLinks = (isMobile = false) => {
    const links = [
      { name: "Dashboard", path: "/dashboard", active: location.pathname === "/dashboard" },
      { name: "Proyectos", path: "/projects", active: location.pathname === "/projects" },
      { name: "Recursos", path: "#", active: location.pathname === "/resources" },
      { name: "Comunidad", path: "/catalog", active: location.pathname === "/catalog" || (location.pathname.startsWith("/project") && location.pathname !== "/projects") },
    ];

    return links.map((link) => (
      <Link
        key={link.name}
        to={link.path}
        className={`${isMobile ? "block" : ""} px-3 py-2 rounded-md text-sm font-medium ${
          link.active
            ? `${darkMode ? "bg-indigo-700 text-white" : "bg-indigo-100 text-indigo-700"} shadow-md`
            : `${darkMode ? "text-gray-300 hover:bg-gray-700 hover:text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"}`
        }`}
      >
        {link.name}
      </Link>
    ));
  };

  const renderProfileMenu = () => {
    if (!user) {
      // Si no hay usuario logueado, mostrar botón de "Iniciar Sesión"
      return (
        <div
          className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${
            darkMode ? "bg-gray-800 ring-1 ring-black ring-opacity-5" : "bg-white ring-1 ring-black ring-opacity-5"
          }`}
        >
          <Link
            to="/login"
            className={`block px-4 py-2 text-md text-center ${
              darkMode ? "text-gray-300 hover:bg-gray-700 hover:text-white" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            Iniciar Sesión
          </Link>
        </div>
      );
    }

    // Si hay usuario logueado, mostrar las opciones normales
    return (
      <div
        className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${
          darkMode ? "bg-gray-800 ring-1 ring-black ring-opacity-5" : "bg-white ring-1 ring-black ring-opacity-5"
        }`}
      >
        <Link
          to="#"
          className={`block px-4 py-2 text-sm ${darkMode ? "text-gray-300 hover:bg-gray-700 hover:text-white" : "text-gray-700 hover:bg-gray-100"}`}
        >
          Tu Perfil
        </Link>
        <Link
          to="#"
          className={`block px-4 py-2 text-sm ${darkMode ? "text-gray-300 hover:bg-gray-700 hover:text-white" : "text-gray-700 hover:bg-gray-100"}`}
        >
          Configuración
        </Link>
        <button
          onClick={handleLogout}
          className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? "text-gray-300 hover:bg-gray-700 hover:text-white" : "text-gray-700 hover:bg-gray-100"}`}
        >
          Cerrar Sesión
        </button>
      </div>
    );
  };

  const renderMoonIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 9.003 0 0012 21a9.003 9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );

  const renderSunIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );

  return (
    <nav className={`border-b ${theme.nav} shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and desktop menu */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className={`text-2xl font-bold ${theme.accent}`}>MyOpenLab</span>
            </div>
            <div className="hidden md:block ml-10 flex items-baseline space-x-4">
              {renderNavLinks()}
            </div>
          </div>

          {/* Desktop right menu */}
          <div className="hidden md:flex items-center">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                darkMode ? "bg-gray-700 text-yellow-400" : "bg-gray-100 text-gray-700"
              } mr-3`}
              aria-label="Cambiar tema"
            >
              {darkMode ? renderSunIcon() : renderMoonIcon()}
            </button>

            {/* User profile */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center"
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    darkMode ? "bg-indigo-600" : "bg-indigo-100"
                  }`}
                >
                  <span
                    className={`font-medium text-sm ${
                      darkMode ? "text-white" : "text-indigo-700"
                    }`}
                  >
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              </button>

              {isMenuOpen && renderProfileMenu()}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                darkMode ? "bg-gray-700 text-yellow-400" : "bg-gray-100 text-gray-700"
              } mr-2`}
            >
              {darkMode ? renderSunIcon() : renderMoonIcon()}
            </button>

            {/* Menu toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-md ${
                darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {isMenuOpen ? (
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
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
            className={`pt-4 pb-3 border-t ${
              darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-center px-5">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  darkMode ? "bg-indigo-600" : "bg-indigo-100"
                }`}
              >
                <span
                  className={`font-medium text-lg ${
                    darkMode ? "text-white" : "text-indigo-700"
                  }`}
                >
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="ml-3">
                <div className={theme.highlight}>{user?.displayName || user?.email}</div>
                <div className={theme.muted}>{user?.email}</div>
              </div>
            </div>
            {renderProfileMenu()}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;