import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getFollowing } from "../utils/followService";
import { db } from "../utils/firebase";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import Header from "../components/Header";
import { useTheme } from "../context/ThemeContext";
import { useAccessibility } from "../context/AccessibilityContext";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const Feed = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const { getContrastTheme } = useAccessibility();
  const theme = getContrastTheme(darkMode);

  const [feedProjects, setFeedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const followingIds = await getFollowing(user.uid);
        let projects = [];
        // Firestore permite máximo 10 elementos en 'in'
        const chunks = [];
        for (let i = 0; i < followingIds.length; i += 10) {
          chunks.push(followingIds.slice(i, i + 10));
        }
        for (const chunk of chunks) {
          if (chunk.length === 0) continue;
          const q = query(
            collection(db, "projects"),
            where("userId", "in", chunk),
            where("visibility", "==", "public"),
            orderBy("createdAt", "desc")
          );
          const snapshot = await getDocs(q);
          projects = projects.concat(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }

        // Obtener comentarios y datos de autor igual que en Catalog.jsx
        // 1. Comentarios
        const commentsCollection = collection(db, "comments");
        const commentsSnapshot = await getDocs(commentsCollection);
        const commentCounts = {};
        commentsSnapshot.docs.forEach((commentDoc) => {
          const comment = commentDoc.data();
          const projectId = comment.projectId;
          commentCounts[projectId] = (commentCounts[projectId] || 0) + 1;
        });

        // 2. Datos de autor y likes
        const projectsData = await Promise.all(
          projects.map(async (project) => {
            // Comentarios
            project.commentCount = commentCounts[project.id] || 0;
            // Likes
            project.likes = project.likes || [];
            project.likeCount = project.likes.length;
            // Autor
            if (project.userId) {
              try {
                const userDocRef = doc(db, "users", project.userId);
                const userSnapshot = await getDoc(userDocRef);
                if (userSnapshot.exists()) {
                  const userData = userSnapshot.data();
                  project.authorName = `${userData.firstName || "Desconocido"} ${userData.lastName || ""}`.trim();
                  project.authorProfilePicture = userData.profilePicture || "";
                } else {
                  project.authorName = "Autor desconocido";
                }
              } catch (error) {
                project.authorName = "Autor desconocido";
              }
            } else {
              project.authorName = "Autor desconocido";
            }
            return project;
          })
        );

        // Ordenar por fecha de creación descendente (por si hay varios chunks)
        projectsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        setFeedProjects(projectsData);
      } catch (err) {
        console.error("Error fetching feed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [user]);

  // Copia exacta del ProjectCard de Catalog.jsx
  const formatDate = (timestamp) => {
    if (!timestamp) return "Fecha desconocida";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: es,
    });
  };

  const ProjectCard = ({ project }) => (
    <div
      className={`h-full flex flex-col border rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${theme.card} ${theme.border} overflow-hidden`}
    >
      {/* Featured Image */}
      <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
        {project.featuredImage ? (
          <img
            src={project.featuredImage || "/placeholder.svg"}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        {/* Header with title and public badge */}
        <div className="flex items-start justify-between mb-3">
          <h2 className={`text-xl font-semibold ${theme.highlight} line-clamp-2 flex-1 mr-2`}>{project.title}</h2>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Público
            </span>
          </div>
        </div>

        {/* Author */}
        <div className="flex items-center mb-3">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center overflow-hidden mr-3 ${darkMode ? "bg-indigo-600" : "bg-indigo-100"}`}
          >
            {project.authorProfilePicture ? (
              <img
                src={project.authorProfilePicture || "/placeholder.svg"}
                alt="Author"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className={`font-medium text-sm ${darkMode ? "text-white" : "text-indigo-700"}`}>
                {project.authorName?.charAt(0) || "U"}
              </span>
            )}
          </div>
          <div>
            <p className={`text-sm font-medium ${theme.highlight}`}>{project.authorName || "Desconocido"}</p>
            <p className={`text-xs ${theme.muted}`}>{formatDate(project.createdAt)}</p>
          </div>
        </div>

        {/* Description */}
        <div className="flex-grow mb-4">
          {project.description && <p className={`text-sm ${theme.muted} line-clamp-3`}>{project.description}</p>}
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${theme.badge}`}
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className={`text-xs ${theme.muted}`}>+{project.tags.length - 3} más</span>
            )}
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between mb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {/* Likes */}
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className={`text-sm font-medium ${theme.muted}`}>{project.likeCount || 0}</span>
            </div>

            {/* Comments */}
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className={`text-sm font-medium ${theme.muted}`}>{project.commentCount || 0}</span>
            </div>
          </div>

          {/* External Links */}
          <div className="flex items-center space-x-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${theme.link} hover:scale-110 transition-transform`}
                title="GitHub"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${theme.link} hover:scale-110 transition-transform`}
                title="Demo"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V7a3 3 0 00-3-3H6a3 3 0 00-3 3v1m0 0v10a2 2 0 002 2h12a2 2 0 002-2V8m0 0V7a3 3 0 00-3-3H6a3 3 0 00-3 3v1z"
                  />
                </svg>
              </a>
            )}
            {project.websiteUrl && (
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${theme.link} hover:scale-110 transition-transform`}
                title="Website"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* View Details Button */}
        <Link
          to={`/project/${project.id}`}
          className={`w-full text-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${theme.accent} hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-current`}
        >
          Ver detalles
        </Link>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-300`}>
      <Header />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="px-4 py-6 sm:px-0">
          <h1 className={`text-3xl font-bold ${theme.highlight}`}>Feed Personalizado</h1>
          <p className={`mt-1 text-sm ${theme.muted}`}>Descubre las últimas actualizaciones de los usuarios que sigues</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <span className={theme.highlight}>Cargando proyectos...</span>
          </div>
        ) : feedProjects.length === 0 ? (
          <div className={`text-center py-12 ${theme.card} rounded-lg shadow border ${theme.border}`}>
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className={`mt-2 text-sm font-medium ${theme.highlight}`}>No hay actualizaciones de tus seguidos</h3>
            <p className={`mt-1 text-sm ${theme.muted}`}>Sigue a otros usuarios para ver sus proyectos aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
