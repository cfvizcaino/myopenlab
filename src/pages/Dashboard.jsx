import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import Header from '../components/Header'; // Importar el encabezado general

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Detect system dark mode preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(mediaQuery.matches);
    
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Get user's first name for greeting
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || '';
  
  // Theme classes
  const theme = {
    bg: darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800',
    nav: darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    card: darkMode ? 'bg-gray-800' : 'bg-white',
    highlight: darkMode ? 'text-white' : 'text-gray-900',
    muted: darkMode ? 'text-gray-400' : 'text-gray-500',
    accent: darkMode ? 'text-indigo-400' : 'text-indigo-600',
    activeNav: darkMode ? 'bg-gray-900 text-white' : 'bg-indigo-50 text-indigo-700',
    inactiveNav: darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800',
  };

  // Stats data
  const stats = [
    {
      title: 'Proyectos Activos',
      count: 12,
      icon: (
        <svg className={theme.accent} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: darkMode ? 'from-indigo-800 to-purple-900' : 'from-indigo-50 to-purple-100',
      linkColor: darkMode ? 'text-indigo-300 hover:text-indigo-100' : 'text-indigo-700 hover:text-indigo-900',
      linkText: 'Ver todos'
    },
    {
      title: 'Nuevos Recursos',
      count: 24,
      icon: (
        <svg className={darkMode ? 'text-green-400' : 'text-green-600'} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      ),
      gradient: darkMode ? 'from-green-800 to-teal-900' : 'from-green-50 to-teal-100',
      linkColor: darkMode ? 'text-green-300 hover:text-green-100' : 'text-green-700 hover:text-green-900',
      linkText: 'Explorar'
    },
    {
      title: 'Miembros Equipo',
      count: 7,
      icon: (
        <svg className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: darkMode ? 'from-yellow-800 to-amber-900' : 'from-yellow-50 to-amber-100',
      linkColor: darkMode ? 'text-yellow-300 hover:text-yellow-100' : 'text-yellow-700 hover:text-yellow-900',
      linkText: 'Administrar'
    },
    {
      title: 'Tareas Pendientes',
      count: 5,
      icon: (
        <svg className={darkMode ? 'text-red-400' : 'text-red-600'} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: darkMode ? 'from-red-800 to-pink-900' : 'from-red-50 to-pink-100',
      linkColor: darkMode ? 'text-red-300 hover:text-red-100' : 'text-red-700 hover:text-red-900',
      linkText: 'Completar'
    }
  ];

  // Projects data
  const projects = [
    { name: 'Análisis de Datos', status: 'En progreso', members: 3, date: '12 May 2025' },
    { name: 'Sistema de Inventario', status: 'Completado', members: 4, date: '5 May 2025' },
    { name: 'App Móvil', status: 'Planificación', members: 2, date: '20 May 2025' }
  ];

  const renderNavLinks = (isMobile = false) => {
    const links = [
      { name: 'Dashboard', active: true },
      { name: 'Proyectos', active: false },
      { name: 'Recursos', active: false },
      { name: 'Comunidad', active: false }
    ];

    return links.map(link => (
      <Link 
        key={link.name}
        to="#" 
        className={`${isMobile ? 'block' : ''} px-3 py-2 rounded-md text-sm font-medium ${link.active ? theme.activeNav : theme.inactiveNav}`}
      >
        {link.name}
      </Link>
    ));
  };

  const renderProfileMenu = (isMobile = false) => (
    <div className={`${isMobile ? 'mt-3 px-2 space-y-1' : ''}`}>
      <Link to="#" className={`${isMobile ? 'block' : ''} px-3 py-2 rounded-md text-sm font-medium ${theme.inactiveNav}`}>Tu Perfil</Link>
      <Link to="#" className={`${isMobile ? 'block' : ''} px-3 py-2 rounded-md text-sm font-medium ${theme.inactiveNav}`}>Configuración</Link>
      <button 
        onClick={handleSignOut}
        className={`${isMobile ? 'block w-full text-left' : ''} px-3 py-2 rounded-md text-sm font-medium ${theme.inactiveNav}`}
      >
        Cerrar Sesión
      </button>
    </div>
  );

  const renderMoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );

  const renderSunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg}`}>
      {/* Navbar */}
      <Header darkMode={darkMode} setDarkMode={setDarkMode} theme={theme} />

      {/* Main content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="px-4 py-6 sm:px-0">
            <h1 className={`text-3xl font-bold ${theme.highlight}`}>
              Hola, {firstName}
            </h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Bienvenido a tu dashboard personal. Aquí puedes gestionar tus proyectos y recursos.
            </p>
          </div>
          
          {/* Stats cards */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className={`overflow-hidden rounded-lg shadow ${theme.card}`}>
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {stat.icon}
                    </div>
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
                    <Link to="#" className={`font-medium ${stat.linkColor}`}>
                      {stat.linkText}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Recent projects */}
          <div className="mt-8">
            <h2 className={`text-lg font-medium ${theme.highlight}`}>Proyectos Recientes</h2>
            <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-300 bg-white'}`}>
                <thead>
                  <tr>
                    <th className={`py-3.5 pl-4 pr-3 text-left text-sm font-semibold ${theme.highlight} sm:pl-6`}>Nombre</th>
                    <th className={`px-3 py-3.5 text-left text-sm font-semibold ${theme.highlight}`}>Estado</th>
                    <th className={`px-3 py-3.5 text-left text-sm font-semibold ${theme.highlight}`}>Miembros</th>
                    <th className={`px-3 py-3.5 text-left text-sm font-semibold ${theme.highlight}`}>Fecha</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Editar</span>
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {projects.map((project, index) => (
                    <tr key={index}>
                      <td className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium ${theme.highlight} sm:pl-6`}>{project.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{project.status}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{project.members}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{project.date}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link to="#" className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'} hover:underline`}>Editar</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;