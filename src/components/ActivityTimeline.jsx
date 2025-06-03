"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { useAccessibility } from "../context/AccessibilityContext"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "../utils/firebase"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Link } from "react-router-dom"

const ActivityTimeline = () => {
  const { user } = useAuth()
  const { darkMode } = useTheme()
  const { getContrastTheme } = useAccessibility()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  // Theme classes - now contrast-aware
  const theme = getContrastTheme(darkMode)

  // Extend theme with timeline-specific properties
  const extendedTheme = {
    ...theme,
    timeline: darkMode ? "bg-gray-600" : "bg-gray-300",
  }

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      console.log("Fetching activities for user:", user.uid)
      setLoading(true)

      try {
        const activities = []

        // 1. Fetch user's recent projects (created activities)
        try {
          console.log("Fetching user projects...")
          const projectsQuery = query(collection(db, "projects"), where("userId", "==", user.uid))
          const projectsSnapshot = await getDocs(projectsQuery)
          console.log("Found user projects:", projectsSnapshot.size)

          const userProjects = []
          projectsSnapshot.forEach((doc) => {
            const project = doc.data()
            userProjects.push({
              id: doc.id,
              ...project,
            })

            // Add project creation activity
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

          // Sort projects by date and take only the 5 most recent
          userProjects.sort((a, b) => {
            const getTime = (timestamp) => {
              if (!timestamp) return 0
              if (timestamp.toDate) return timestamp.toDate().getTime()
              if (timestamp.seconds) return timestamp.seconds * 1000
              return new Date(timestamp).getTime()
            }
            return getTime(b.createdAt) - getTime(a.createdAt)
          })

          console.log("User projects sorted by date:", userProjects.length)
        } catch (error) {
          console.error("Error fetching projects for activity:", error)
        }

        // 2. Fetch recent comments on user's projects
        try {
          console.log("Fetching comments on user projects...")

          // First get all user's project IDs
          const userProjectsQuery = query(collection(db, "projects"), where("userId", "==", user.uid))
          const userProjectsSnapshot = await getDocs(userProjectsQuery)
          const projectIds = []
          const projectTitles = {}

          userProjectsSnapshot.forEach((doc) => {
            projectIds.push(doc.id)
            projectTitles[doc.id] = doc.data().title
          })

          console.log("User has projects:", projectIds.length)

          if (projectIds.length > 0) {
            // Get all comments and filter by project IDs (to avoid Firestore 'in' limit)
            const allCommentsQuery = query(collection(db, "comments"))
            const allCommentsSnapshot = await getDocs(allCommentsQuery)

            console.log("Total comments in database:", allCommentsSnapshot.size)

            const relevantComments = []
            allCommentsSnapshot.forEach((commentDoc) => {
              const comment = commentDoc.data()

              // Only include comments on user's projects, but not by the user themselves
              if (projectIds.includes(comment.projectId) && comment.userId !== user.uid) {
                relevantComments.push({
                  id: commentDoc.id,
                  ...comment,
                })
              }
            })

            console.log("Relevant comments found:", relevantComments.length)

            // Sort comments by date and take recent ones
            relevantComments.sort((a, b) => {
              const getTime = (timestamp) => {
                if (!timestamp) return 0
                if (timestamp.toDate) return timestamp.toDate().getTime()
                if (timestamp.seconds) return timestamp.seconds * 1000
                return new Date(timestamp).getTime()
              }
              return getTime(b.createdAt) - getTime(a.createdAt)
            })

            // Process recent comments and add to activities
            for (const comment of relevantComments.slice(0, 10)) {
              try {
                // Fetch commenter info
                let commenterName = "Usuario desconocido"
                const commenterDoc = await getDoc(doc(db, "users", comment.userId))
                if (commenterDoc.exists()) {
                  const commenterData = commenterDoc.data()
                  commenterName = `${commenterData.firstName || ""} ${commenterData.lastName || ""}`.trim()
                  if (!commenterName) commenterName = commenterData.email || "Usuario desconocido"
                }

                activities.push({
                  id: `comment-${comment.id}`,
                  type: "comment_received",
                  timestamp: comment.createdAt,
                  data: {
                    projectId: comment.projectId,
                    projectTitle: projectTitles[comment.projectId] || "Proyecto desconocido",
                    commenterName,
                    commentContent: comment.content,
                  },
                })
              } catch (error) {
                console.error("Error processing comment:", error)
              }
            }
          }
        } catch (error) {
          console.error("Error fetching comments for activity:", error)
        }

        // 3. Fetch recent likes on user's projects
        try {
          console.log("Checking for likes on user projects...")

          const userProjectsQuery = query(collection(db, "projects"), where("userId", "==", user.uid))
          const userProjectsSnapshot = await getDocs(userProjectsQuery)

          userProjectsSnapshot.forEach((doc) => {
            const project = doc.data()
            if (project.likes && Array.isArray(project.likes) && project.likes.length > 0) {
              // Add a like activity for each like (simplified - in real app you'd track when likes were added)
              activities.push({
                id: `likes-${doc.id}`,
                type: "likes_received",
                timestamp: project.updatedAt || project.createdAt,
                data: {
                  projectId: doc.id,
                  projectTitle: project.title,
                  likeCount: project.likes.length,
                },
              })
            }
          })
        } catch (error) {
          console.error("Error fetching likes for activity:", error)
        }

        console.log("Total activities before sorting:", activities.length)

        // Sort all activities by timestamp (newest first)
        activities.sort((a, b) => {
          const getTimestamp = (timestamp) => {
            if (!timestamp) return 0
            if (timestamp.toDate) return timestamp.toDate().getTime()
            if (timestamp.seconds) return timestamp.seconds * 1000
            return new Date(timestamp).getTime()
          }

          return getTimestamp(b.timestamp) - getTimestamp(a.timestamp)
        })

        // Limit to most recent 15 activities
        const finalActivities = activities.slice(0, 15)
        console.log("Final activities:", finalActivities.length)

        setActivities(finalActivities)
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

    let date
    if (timestamp.toDate) {
      date = timestamp.toDate()
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000)
    } else {
      date = new Date(timestamp)
    }

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
      case "likes_received":
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
      case "likes_received":
        return (
          <div>
            <p className={`text-sm ${theme.text.primary}`}>
              Tu proyecto{" "}
              <Link
                to={`/project/${activity.data.projectId}`}
                className={`font-medium ${theme.accent} hover:underline`}
              >
                {activity.data.projectTitle}
              </Link>{" "}
              tiene {activity.data.likeCount} me gusta
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
                        className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${extendedTheme.timeline}`}
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
