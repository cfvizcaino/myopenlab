import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, getDoc, collection } from "firebase/firestore";
import getTheme from "../utils/theme"; // Importar el tema general

const ProjectDetail = () => {
  const { id } = useParams(); // Obtener el ID del proyecto desde la URL
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      const db = getFirestore();

      // Obtener el proyecto por ID
      const projectDoc = doc(db, "projects", id);
      const projectSnapshot = await getDoc(projectDoc);

      if (projectSnapshot.exists()) {
        const projectData = projectSnapshot.data();

        // Obtener el nombre del autor
        const userDoc = doc(collection(db, "users"), projectData.userId);
        const userSnapshot = await getDoc(userDoc);
        const authorName = userSnapshot.exists() ? userSnapshot.data().name : "Autor desconocido";

        setProject({
          ...projectData,
          authorName,
        });
      } else {
        console.error("El proyecto no existe.");
      }

      setLoading(false);
    };

    fetchProject();
  }, [id]);

  const theme = getTheme(darkMode);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  if (loading) {
    return <div className={theme.muted}>Cargando proyecto...</div>;
  }

  if (!project) {
    return <div className={theme.muted}>Proyecto no encontrado.</div>;
  }

  return (
    <div className={`min-h-screen ${theme.bg} py-8 transition-all duration-500`}>
      <div className="flex justify-between items-center px-4 sm:px-8 lg:px-16 mb-8">
        <h1 className={`text-4xl font-bold ${theme.highlight}`}>Detalle del Proyecto</h1>
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
      <div className="container mx-auto p-4">
        <h1 className={`text-3xl font-bold mb-4 ${theme.highlight}`}>{project.title}</h1>
        <p className={`text-lg font-medium mb-2 ${darkMode ? "text-red-400" : "text-red-600"}`}>
          Autor: {project.authorName}
        </p>
        <p className={`p-4 rounded-lg ${darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-100 text-gray-800"}`}>
          {project.description}
        </p>
      </div>
    </div>
  );
};

export default ProjectDetail;