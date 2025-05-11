import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useTheme } from "../context/ThemeContext"; // Importa el ThemeContext
import Header from "../components/Header"; // Importa el Header

const Catalog = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme(); // Usa el estado global de darkMode desde ThemeContext

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const db = getFirestore();
        const projectsCollection = collection(db, "projects");
        const projectsSnapshot = await getDocs(projectsCollection);

        const projectsData = await Promise.all(
          projectsSnapshot.docs.map(async (projectDoc) => {
            const project = { id: projectDoc.id, ...projectDoc.data() };

            // Obtener el nombre del autor desde la colección "users"
            if (project.userId) {
              try {
                const userDocRef = doc(db, "users", project.userId);
                const userSnapshot = await getDoc(userDocRef);
                if (userSnapshot.exists()) {
                  const userData = userSnapshot.data();
                  project.authorName = `${userData.firstName || "Desconocido"} ${userData.lastName || ""}`.trim();
                } else {
                  project.authorName = "Autor desconocido";
                }
              } catch (error) {
                console.error("Error al obtener el autor:", error);
                project.authorName = "Autor desconocido";
              }
            } else {
              project.authorName = "Autor desconocido";
            }

            return project;
          })
        );

        setProjects(projectsData);
      } catch (error) {
        console.error("Error al obtener los proyectos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

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
      <div className="mt-8 px-4 sm:px-8 lg:px-16">
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
            <span className={theme.highlight}>Cargando proyectos...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {projects.map((project) => (
              <Link to={`/project/${project.id}`} key={project.id}>
                <div
                  className={`card border rounded-lg shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 ${theme.card}`}
                >
                  <div className="p-6">
                    <h2 className={`text-2xl font-semibold mb-4 ${theme.highlight}`}>
                      {project.title}
                    </h2>
                    <p
                      className={`text-lg font-medium ${
                        darkMode ? "text-red-400" : "text-red-600"
                      }`}
                    >
                      Autor: {project.authorName || "Desconocido"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;