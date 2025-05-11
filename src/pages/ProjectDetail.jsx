import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import getTheme from "../utils/theme"; // Importar el tema general
import Header from "../components/Header"; // Importar el encabezado

const ProjectDetail = () => {
  const { id } = useParams(); // Obtener el ID del proyecto desde la URL
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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

  const theme = getTheme(darkMode);

  if (loading) {
    return <div className={theme.muted}>Cargando proyecto...</div>;
  }

  if (!project) {
    return <div className={theme.muted}>Proyecto no encontrado.</div>;
  }

  return (
    <div className={`min-h-screen ${theme.bg} transition-all duration-500`}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} theme={theme} />
      <div className="container mx-auto p-4">
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
      </div>
    </div>
  );
};

export default ProjectDetail;