"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore"
import { db } from "../utils/firebase"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Link } from "react-router-dom"

const ProjectInteractions = ({ project, onProjectUpdate }) => {
  const { user, userData } = useAuth()
  const { darkMode } = useTheme()
  const [likes, setLikes] = useState(project.likes || [])
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [submittingComment, setSubmittingComment] = useState(false)

  // Theme classes
  const theme = {
    card: darkMode ? "bg-gray-800" : "bg-white",
    border: darkMode ? "border-gray-700" : "border-gray-200",
    text: {
      primary: darkMode ? "text-white" : "text-gray-900",
      secondary: darkMode ? "text-gray-300" : "text-gray-600",
      muted: darkMode ? "text-gray-400" : "text-gray-500",
    },
    input: darkMode
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
    button: {
      primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
      secondary: darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700",
      like: isLiked
        ? "text-red-500 hover:text-red-600"
        : darkMode
          ? "text-gray-400 hover:text-red-400"
          : "text-gray-500 hover:text-red-500",
      favorite: isFavorited
        ? "text-yellow-500 hover:text-yellow-600"
        : darkMode
          ? "text-gray-400 hover:text-yellow-400"
          : "text-gray-500 hover:text-yellow-500",
    },
  }

  // Check if user has liked or favorited the project
  useEffect(() => {
    if (user) {
      setIsLiked(likes.includes(user.uid))
      checkIfFavorited()
    }
  }, [user, likes])

  // Load comments
  useEffect(() => {
    loadComments()
  }, [project.id])

  const checkIfFavorited = async () => {
    if (!user) return

    try {
      const userDocRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        const favorites = userData.favoriteProjects || []
        setIsFavorited(favorites.includes(project.id))
      }
    } catch (error) {
      console.error("Error checking favorites:", error)
    }
  }

  const loadComments = async () => {
    setCommentsLoading(true)
    try {
      console.log("Loading comments for project:", project.id)

      // First try without orderBy to see if we can get comments at all
      const commentsQuery = query(collection(db, "comments"), where("projectId", "==", project.id))

      const querySnapshot = await getDocs(commentsQuery)
      console.log("Found comments:", querySnapshot.size)

      const commentsData = []

      for (const commentDoc of querySnapshot.docs) {
        const commentData = { id: commentDoc.id, ...commentDoc.data() }
        console.log("Processing comment:", commentData)

        // Fetch author data
        try {
          const authorDoc = await getDoc(doc(db, "users", commentData.userId))
          if (authorDoc.exists()) {
            commentData.author = authorDoc.data()
            console.log("Found author:", commentData.author)
          } else {
            console.log("Author not found for userId:", commentData.userId)
            commentData.author = { firstName: "Usuario", lastName: "Desconocido" }
          }
        } catch (error) {
          console.error("Error fetching comment author:", error)
          commentData.author = { firstName: "Usuario", lastName: "Desconocido" }
        }

        commentsData.push(commentData)
      }

      // Sort comments by date (newest first) in JavaScript since Firestore orderBy might fail
      commentsData.sort((a, b) => {
        const getTime = (timestamp) => {
          if (!timestamp) return 0
          if (timestamp.toDate) return timestamp.toDate().getTime()
          if (timestamp.seconds) return timestamp.seconds * 1000
          return new Date(timestamp).getTime()
        }
        return getTime(b.createdAt) - getTime(a.createdAt)
      })

      console.log("Final comments data:", commentsData)
      setComments(commentsData)
    } catch (error) {
      console.error("Error loading comments:", error)
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) return

    setLoading(true)
    try {
      const projectRef = doc(db, "projects", project.id)

      if (isLiked) {
        // Remove like
        await updateDoc(projectRef, {
          likes: arrayRemove(user.uid),
        })
        setLikes((prev) => prev.filter((uid) => uid !== user.uid))
        setIsLiked(false)
      } else {
        // Add like
        await updateDoc(projectRef, {
          likes: arrayUnion(user.uid),
        })
        setLikes((prev) => [...prev, user.uid])
        setIsLiked(true)
      }

      if (onProjectUpdate) {
        onProjectUpdate()
      }
    } catch (error) {
      console.error("Error updating like:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = async () => {
    if (!user) return

    setLoading(true)
    try {
      const userRef = doc(db, "users", user.uid)

      if (isFavorited) {
        // Remove from favorites
        await updateDoc(userRef, {
          favoriteProjects: arrayRemove(project.id),
        })
        setIsFavorited(false)
      } else {
        // Add to favorites
        await updateDoc(userRef, {
          favoriteProjects: arrayUnion(project.id),
        })
        setIsFavorited(true)
      }
    } catch (error) {
      console.error("Error updating favorite:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!user || !newComment.trim()) {
      console.log("Cannot add comment - missing user or content")
      return
    }

    setSubmittingComment(true)
    try {
      console.log("Adding comment:", {
        projectId: project.id,
        userId: user.uid,
        content: newComment.trim(),
      })

      const commentData = {
        projectId: project.id,
        userId: user.uid,
        content: newComment.trim(),
        createdAt: new Date(), // Use regular Date instead of Timestamp
      }

      const docRef = await addDoc(collection(db, "comments"), commentData)
      console.log("Comment added with ID:", docRef.id)

      setNewComment("")

      // Immediately add the comment to local state for instant feedback
      const newCommentWithAuthor = {
        id: docRef.id,
        ...commentData,
        author: {
          firstName: userData?.firstName || user.email?.split("@")[0] || "Usuario",
          lastName: userData?.lastName || "",
          profilePicture: userData?.profilePicture || "",
        },
      }

      setComments((prev) => [newCommentWithAuthor, ...prev])

      // Also reload from database to ensure consistency
      setTimeout(() => {
        loadComments()
      }, 1000)
    } catch (error) {
      console.error("Error adding comment:", error)
      alert(`Error al enviar el comentario: ${error.message}`)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!user) return

    try {
      console.log("Deleting comment:", commentId)
      await deleteDoc(doc(db, "comments", commentId))
      console.log("Comment deleted successfully")
      loadComments() // Reload comments
    } catch (error) {
      console.error("Error deleting comment:", error)
      alert(`Error al eliminar el comentario: ${error.message}`)
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className={`flex items-center justify-between p-4 ${theme.card} rounded-lg border ${theme.border}`}>
        <div className="flex items-center space-x-6">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={!user || loading}
            className={`flex items-center space-x-2 ${theme.button.like} transition-colors ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{likes.length}</span>
            <span className="hidden sm:inline">{likes.length === 1 ? "Me gusta" : "Me gusta"}</span>
          </button>

          {/* Favorite Button */}
          {user && (
            <button
              onClick={handleFavorite}
              disabled={loading}
              className={`flex items-center space-x-2 ${theme.button.favorite} transition-colors`}
            >
              <svg
                className="w-5 h-5"
                fill={isFavorited ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <span className="hidden sm:inline">{isFavorited ? "Favorito" : "Agregar a favoritos"}</span>
            </button>
          )}
        </div>

        {!user && (
          <div className="text-center text-sm mt-4">
            <Link to="/login" className="text-indigo-500 hover:underline">
              Inicia sesión
            </Link>
            {" para dar me gusta y comentar"}
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className={`${theme.card} rounded-lg border ${theme.border}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg font-medium ${theme.text.primary}`}>Comentarios ({comments.length})</h3>
        </div>

        {/* Add Comment Form */}
        {user && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <form onSubmit={handleAddComment} className="space-y-3">
              <div className="flex items-start space-x-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center overflow-hidden ${darkMode ? "bg-indigo-600" : "bg-indigo-100"}`}
                >
                  {userData?.profilePicture ? (
                    <img
                      src={userData.profilePicture || "/placeholder.svg"}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className={`font-medium text-sm ${darkMode ? "text-white" : "text-indigo-700"}`}>
                      {userData?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    rows="3"
                    className={`w-full rounded-md shadow-sm px-3 py-2 border ${theme.input} resize-none`}
                    disabled={submittingComment}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submittingComment}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${theme.button.primary} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {submittingComment ? "Enviando..." : "Comentar"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Comments List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {commentsLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
              <p className={`mt-2 text-sm ${theme.text.muted}`}>Cargando comentarios...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <h3 className={`mt-2 text-sm font-medium ${theme.text.primary}`}>No hay comentarios</h3>
              <p className={`mt-1 text-sm ${theme.text.muted}`}>
                {user ? "Sé el primero en comentar este proyecto." : "Inicia sesión para comentar."}
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="p-4">
                <div className="flex items-start space-x-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center overflow-hidden ${darkMode ? "bg-indigo-600" : "bg-indigo-100"}`}
                  >
                    {comment.author?.profilePicture ? (
                      <img
                        src={comment.author.profilePicture || "/placeholder.svg"}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className={`font-medium text-sm ${darkMode ? "text-white" : "text-indigo-700"}`}>
                        {comment.author?.firstName?.charAt(0) || comment.author?.email?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`text-sm font-medium ${theme.text.primary}`}>
                          {comment.author?.firstName} {comment.author?.lastName}
                        </h4>
                        <p className={`text-xs ${theme.text.muted}`}>{formatDate(comment.createdAt)}</p>
                      </div>
                      {user && user.uid === comment.userId && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className={`text-xs ${theme.text.muted} hover:text-red-500`}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                    <p className={`mt-2 text-sm ${theme.text.primary} whitespace-pre-wrap`}>{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectInteractions
