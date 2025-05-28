"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore"
import { db } from "../utils/firebase"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Link } from "react-router-dom"

const ActivityTimeline = () => {
  const { user } = useAuth()
  const { darkMode } = useTheme()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  // Theme classes
  const theme = {
    card: darkMode ? "bg-gray-800" : "bg-white",
    border: darkMode ? "border-gray-700" : "border-gray-200",
    text: {
      primary: darkMode ? "text-white" : "text-gray-900",
      secondary: darkMode ? "text-gray-300" : "text-gray-600",
      muted: darkMode ? "text-gray-400" : "text-gray-500",
    },
    accent: darkMode ? "text-indigo-400" : "text-indigo-600",
    timeline: darkMode ? "bg-gray-600" : "bg-gray-300",
  }

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return

      setLoading(true)
      try {
        const activities = []

        // Fetch user's recent projects (created activities)
        const projectsQuery = query(
          collection(db, "projects"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5),
        )
        const projectsSnapshot = await getDocs(projectsQuery)

        projectsSnapshot.forEach((doc) => {
          const project = doc.data()
          activities.push({
            id: `project-${doc.id}`,
            type: "project_created",
            timestamp: project.createdAt,
            data: {
              projectId: doc.id,
              projectTitle: project.title,
              visibility: project.visibility,
            },
          })
        })

        // Fetch recent comments on user's projects
        if (projectsSnapshot.size > 0) {
          const projectIds = []
          projectsSnapshot.forEach((doc) => projectIds.push(doc.id))

          const commentsQuery = query(
            collection(db, "comments"),
            where("projectId", "in", projectIds.slice(0, 10)), // Firestore limit
            orderBy("createdAt", "desc"),
            limit(10),
          )
          const commentsSnapshot = await getDocs(commentsQuery)

          for (const commentDoc of commentsSnapshot.docs) {
            const comment = commentDoc.data()

            // Skip comments by the user themselves
            if (comment.userId === user.uid) continue

            // Fetch commenter info
            let commenterName = "Usuario desconocido"
            try {
              const commenterDoc = await getDoc(doc(db, "users", comment.userId))
              if (commenterDoc.exists()) {
                const commenterData = commenterDoc.data()
                commenterName = `${commenterData.firstName} ${commenterData.lastName}`
              }
            } catch (error) {
              console.error("Error fetching commenter:", error)
            }

            // Fetch project info
            let projectTitle = "Proyecto desconocido"
            try {
              const projectDoc = await getDoc(doc(db, "projects", comment.projectId))
              if (projectDoc.exists()) {
                projectTitle = projectDoc.data().title
              }
            } catch (error) {
              console.error("Error fetching project:", error)
            }

            activities.push({
              id: `comment-${commentDoc.id}`,
              type: "comment_received",
              timestamp: comment.createdAt,
              data: {
                projectId: comment.projectId,
                projectTitle,
                commenterName,
                commentContent: comment.content,
              },
            })
          }
        }

        // Fetch recent likes on user's projects
        if (projectsSnapshot.size > 0) {
          const projectsWithLikes = []
          projectsSnapshot.forEach((doc) => {
            const project = doc.data()
            if (project.likes && project.likes.length > 0) {
              // For each like, create an activity (simplified - we don't have like timestamps)
              project.likes.forEach((likerId) => {
                if (likerId !== user.uid) {
                  // Skip self-likes
                  projectsWithLikes.push({
                    id: `like-${doc.id}-${likerId}`,
                    type: "like_received",
                    timestamp: project.updatedAt || project.createdAt, // Approximate timestamp
                    data: {
                      projectId: doc.id,
                      projectTitle: project.title,
                      likerId,
                    },
                  })
                }
              })
            }
          })

          // Add recent likes (limit to avoid too many)
          activities.push(...projectsWithLikes.slice(0, 5))
        }

        // Sort all activities by timestamp (newest first)
        activities.sort((a, b) => {
          const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp)
          const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp)
          return dateB - dateA
        })

        // Limit to most recent 10 activities
        setActivities(activities.slice(0, 10))
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [user])

  const formatDate = (timestamp) => {
    if (!timestamp) return "Fecha desconocida"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: es,
    })
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "project_created":
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full">
            <svg
              className="w-4 h-4 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        )
      case "comment_received":
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full">
            <svg
              className="w-4 h-4 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
        )
      case "like_received":
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full">
            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full">
            <svg
              className="w-4 h-4 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )
    }
  }

  const getActivityText = (activity) => {
    switch (activity.type) {
      case "project_created":
        return (
          <div>
            <p className={`text-sm ${theme.text.primary}`}>
              Creaste el proyecto{" "}
              <Link
                to={`/project/${activity.data.projectId}`}
                className={`font-medium ${theme.accent} hover:underline`}
              >
                {activity.data.projectTitle}
              </Link>
            </p>
            <p className={`text-xs ${theme.text.muted} mt-1`}>
              {activity.data.visibility === "public" ? "Proyecto público" : "Proyecto privado"}
            </p>
          </div>
        )
      case "comment_received":
        return (
          <div>
            <p className={`text-sm ${theme.text.primary}`}>
              <span className="font-medium">{activity.data.commenterName}</span> comentó en{" "}
              <Link
                to={`/project/${activity.data.projectId}`}
                className={`font-medium ${theme.accent} hover:underline`}
              >
                {activity.data.projectTitle}
              </Link>
            </p>
            <p className={`text-xs ${theme.text.secondary} mt-1 line-clamp-2`}>"{activity.data.commentContent}"</p>
          </div>
        )
      case "like_received":
        return (
          <div>
            <p className={`text-sm ${theme.text.primary}`}>
              Alguien le dio me gusta a{" "}
              <Link
                to={`/project/${activity.data.projectId}`}
                className={`font-medium ${theme.accent} hover:underline`}
              >
                {activity.data.projectTitle}
              </Link>
            </p>
          </div>
        )
      default:
        return <p className={`text-sm ${theme.text.primary}`}>Actividad desconocida</p>
    }
  }

  if (loading) {
    return (
      <div className={`${theme.card} rounded-lg shadow p-6`}>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`${theme.card} rounded-lg shadow`}>
      <div className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className={`mt-2 text-sm font-medium ${theme.text.primary}`}>No hay actividad reciente</h3>
            <p className={`mt-1 text-sm ${theme.text.muted}`}>
              Crea proyectos y interactúa con la comunidad para ver tu actividad aquí.
            </p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {activities.map((activity, index) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index !== activities.length - 1 && (
                      <span
                        className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${theme.timeline}`}
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">{getActivityIcon(activity.type)}</div>
                      <div className="min-w-0 flex-1">
                        {getActivityText(activity)}
                        <div className={`mt-2 text-xs ${theme.text.muted}`}>{formatDate(activity.timestamp)}</div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityTimeline
