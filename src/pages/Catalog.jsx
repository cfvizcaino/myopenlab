import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import getTheme from "../utils/theme"; // Importar el tema general
import Header from "../components/Header"; // Importar el encabezado

const Catalog = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
                const userDocRef = doc(db, "users", project.userId); // Asegúrate de usar `doc` correctamente
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
        setLoading(false);

        console.log("Proyectos obtenidos:", projectsData);
      } catch (error) {
        console.error("Error al obtener los proyectos:", error);
        setLoading(false); // Asegúrate de que el estado de carga se detenga incluso si hay un error
      }
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
      <div className="mt-8 px-4 sm:px-8 lg:px-16">
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
      </div>
    </div>
  );
};

export default Catalog;