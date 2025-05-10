import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import getTheme from "../utils/theme"; // Importar el tema general

const Catalog = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const db = getFirestore();
      const projectsCollection = collection(db, "projects");
      const projectsSnapshot = await getDocs(projectsCollection);
      const projectsData = projectsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(projectsData);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const theme = getTheme(darkMode);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  if (loading) {
    return <div className={theme.muted}>Cargando proyectos...</div>;
  }

  return (
    <div className={`min-h-screen ${theme.bg} py-8 transition-all duration-500`}>
      <div className="flex justify-between items-center px-4 sm:px-8 lg:px-16 mb-8">
        <h1 className={`text-4xl font-bold ${theme.highlight}`}>Catálogo de Proyectos</h1>
        <div
          className="flex items-center cursor-pointer"
          onClick={toggleDarkMode}
        >
          <div
            className={`w-12 h-6 flex items-center rounded-full p-1 ${
              darkMode ? "bg-gray-700" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full shadow-md transform transition-transform ${
                darkMode ? "translate-x-6 bg-yellow-400" : "translate-x-0 bg-blue-500"
              }`}
            ></div>
          </div>
          <span className="ml-2 text-sm">
            {darkMode ? "🌙 Modo Oscuro" : "☀️ Modo Claro"}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-8 lg:px-16">
        {projects.map((project) => (
          <Link to={`/project/${project.id}`} key={project.id}>
            <div
              className={`card border rounded-lg shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 ${theme.card}`}
            >
              <div className="p-6">
                <h2
                  className={`text-2xl font-semibold mb-4 ${theme.highlight}`}
                >
                  {project.title}
                </h2>
                <p
                  className={`text-lg font-medium ${darkMode ? "text-red-400" : "text-red-600"}`}
                >
                  Autor: {project.authorName || "Desconocido"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Catalog;