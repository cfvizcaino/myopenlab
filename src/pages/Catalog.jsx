import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import getTheme from "../utils/theme"; // Importar el tema general
import Header from "../components/Header"; // Importar el encabezado

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

  if (loading) {
    return <div className={theme.muted}>Cargando proyectos...</div>;
  }

  return (
    <div className={`min-h-screen ${theme.bg} transition-all duration-500`}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} theme={theme} />
      {/* Separar el catálogo del encabezado */}
      <div className="mt-8 px-4 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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
      </div>
    </div>
  );
};

export default Catalog;