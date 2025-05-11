import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useTheme } from "../context/ThemeContext"; // Importa el ThemeContext
import Header from "../components/Header"; // Importa el Header

const ProjectDetail = () => {
  const { id } = useParams(); // Obtener el ID del proyecto desde la URL
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme(); // Usa el estado global de darkMode desde ThemeContext

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const db = getFirestore();

        // Obtener el proyecto por ID
        const projectDocRef = doc(db, "projects", id);
        const projectSnapshot = await getDoc(projectDocRef);

        if (projectSnapshot.exists()) {
          const projectData = projectSnapshot.data();

          // Obtener el nombre del autor desde la colección "users"
          let authorName = "Autor desconocido";
          if (projectData.userId) {
            try {
              const userDocRef = doc(db, "users", projectData.userId);
              const userSnapshot = await getDoc(userDocRef);
              if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                authorName = `${userData.firstName || "Desconocido"} ${userData.lastName || ""}`.trim();
              }
            } catch (error) {
              console.error("Error al obtener el autor:", error);
            }
          }

          setProject({
            ...projectData,
            authorName,
          });
        } else {
          console.error("El proyecto no existe.");
        }
      } catch (error) {
        console.error("Error al obtener el proyecto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const theme = {
    bg: darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800",
    card: darkMode ? "bg-gray-800" : "bg-white",
    highlight: darkMode ? "text-white" : "text-gray-900",
    muted: darkMode ? "text-gray-400" : "text-gray-500",
    accent: darkMode ? "text-indigo-400" : "text-indigo-600",
  };
  

  return (
    <div className={`min-h-screen ${theme.bg} transition-all duration-500`}>
      <Header theme={theme} /> {/* Usa el Header con el tema */}
      <div className="container mx-auto p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <svg
              className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className={theme.highlight}>Cargando proyecto...</span>
          </div>
        ) : project ? (
          <>
            <h1 className={`text-3xl font-bold mb-4 ${theme.highlight}`}>
              {project.title}
            </h1>
            <p
              className={`text-lg font-medium mb-2 ${
                darkMode ? "text-red-400" : "text-red-600"
              }`}
            >
              Autor: {project.authorName}
            </p>
            <p
              className={`p-4 rounded-lg ${
                darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-100 text-gray-800"
              }`}
            >
              {project.description}
            </p>
          </>
        ) : (
          <div className={theme.muted}>Proyecto no encontrado.</div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;