const getTheme = (darkMode) => ({
  bg: darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800',
  nav: darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
  card: darkMode ? 'bg-gray-800' : 'bg-white',
  highlight: darkMode ? 'text-white' : 'text-gray-900',
  muted: darkMode ? 'text-gray-400' : 'text-gray-500',
  accent: darkMode ? 'text-indigo-400' : 'text-indigo-600',
  activeNav: darkMode ? 'bg-gray-900 text-white' : 'bg-indigo-50 text-indigo-700',
  inactiveNav: darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800',
});

export default getTheme;