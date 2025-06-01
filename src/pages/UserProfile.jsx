"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { useAccessibility } from "../context/AccessibilityContext"
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "../utils/firebase"
import Header from "../components/Header"
import EditProfileModal from "../components/EditProfileModal"
import ProjectCard from "../components/ProjectCard"

const UserProfile = () => {
  const { user, userData, refreshUserData } = useAuth()
  const { darkMode } = useTheme()
  const { getContrastTheme } = useAccessibility()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [favoriteProjects, setFavoriteProjects] = useState([])
  const [loadingFavorites, setLoadingFavorites] = useState(true)
  const [activeTab, setActiveTab] = useState("about") // about, favorites
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    website: "",
    profilePicture: "",
    joinDate: null,
    favoriteProjects: [],
  })
  const [userStats, setUserStats] = useState({
    totalProjects: 0,
    publicProjects: 0,
    privateProjects: 0,
    totalLikes: 0,
    totalComments: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  // Theme classes - now contrast-aware
  const theme = getContrastTheme(darkMode)

  // Extend theme with profile-specific properties
  const extendedTheme = {
    ...theme,
    tab: {
      active: darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900",
      inactive: darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700",
    },
  }

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return

      try {
        const userDocRef = doc(db, "users", user.uid)
        const userSnapshot = await getDoc(userDocRef)

        if (userSnapshot.exists()) {
          const data = userSnapshot.data()
          setProfileData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            bio: data.bio || "",
            location: data.location || "",
            website: data.website || "",
            profilePicture: data.profilePicture || "",
            joinDate: data.createdAt || null,
            favoriteProjects: data.favoriteProjects || [],
          })
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
      }
    }

    fetchProfileData()
  }, [user, userData])

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return

      setLoadingStats(true)
      try {
        // Fetch user's projects
        const projectsQuery = query(collection(db, "projects"), where("userId", "==", user.uid))
        const projectsSnapshot = await getDocs(projectsQuery)

        let totalProjects = 0
        let publicProjects = 0
        let privateProjects = 0
        let totalLikes = 0
        const projectIds = []

        projectsSnapshot.forEach((doc) => {
          const project = doc.data()
          totalProjects++
          projectIds.push(doc.id)

          if (project.visibility === "public") {
            publicProjects++
          } else {
            privateProjects++
          }

          // Count likes
          if (project.likes && Array.isArray(project.likes)) {
            totalLikes += project.likes.length
          }
        })

        // Fetch comments on user's projects
        let totalComments = 0
        if (projectIds.length > 0) {
          // Split into chunks of 10 for Firestore 'in' query limit
          const chunks = []
          for (let i = 0; i < projectIds.length; i += 10) {
            chunks.push(projectIds.slice(i, i + 10))
          }

          for (const chunk of chunks) {
            const commentsQuery = query(collection(db, "comments"), where("projectId", "in", chunk))
            const commentsSnapshot = await getDocs(commentsQuery)
            totalComments += commentsSnapshot.size
          }
        }

        setUserStats({
          totalProjects,
          publicProjects,
          privateProjects,
          totalLikes,
          totalComments,
        })
      } catch (error) {
        console.error("Error fetching user stats:", error)
      } finally {
        setLoadingStats(false)
      }
    }

    fetchUserStats()
  }, [user])

  // Fetch favorite projects
  useEffect(() => {
    const fetchFavoriteProjects = async () => {
      if (!profileData.favoriteProjects.length) {
        setFavoriteProjects([])
        setLoadingFavorites(false)
        return
      }

      setLoadingFavorites(true)
      try {
        const projects = []

        // Fetch each favorite project
        for (const projectId of profileData.favoriteProjects) {
          try {
            const projectDoc = await getDoc(doc(db, "projects", projectId))
            if (projectDoc.exists()) {
              const projectData = { id: projectDoc.id, ...projectDoc.data() }

              // Fetch author data
              if (projectData.userId) {
                const authorDoc = await getDoc(doc(db, "users", projectData.userId))
                if (authorDoc.exists()) {
                  projectData.authorName = `${authorDoc.data().firstName} ${authorDoc.data().lastName}`
                }
              }

              projects.push(projectData)
            }
          } catch (error) {
            console.error(`Error fetching project ${projectId}:`, error)
          }
        }

        setFavoriteProjects(projects)
      } catch (error) {
        console.error("Error fetching favorite projects:", error)
      } finally {
        setLoadingFavorites(false)
      }
    }

    fetchFavoriteProjects()
  }, [profileData.favoriteProjects])

  // Handle profile picture upload
  const handleProfilePictureUpload = async (file) => {
    if (!file || !user) return

    console.log("Starting profile picture upload:", file.name, file.size)
    setLoading(true)

    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("El archivo es demasiado grande. Máximo 5MB.")
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Por favor selecciona un archivo de imagen válido.")
      }

      console.log("File validation passed")

      // Create unique filename with timestamp
      const timestamp = Date.now()
      const fileExtension = file.name.split(".").pop()
      const fileName = `profile_${user.uid}_${timestamp}.${fileExtension}`

      console.log("Uploading to:", `profile-pictures/${fileName}`)

      // Upload new profile picture
      const imageRef = ref(storage, `profile-pictures/${fileName}`)
      const uploadResult = await uploadBytes(imageRef, file)
      console.log("Upload successful:", uploadResult)

      const downloadURL = await getDownloadURL(imageRef)
      console.log("Download URL:", downloadURL)

      // Delete old profile picture if exists
      if (profileData.profilePicture) {
        try {
          // Extract filename from old URL to delete it
          const oldImageRef = ref(storage, profileData.profilePicture)
          await deleteObject(oldImageRef)
          console.log("Old image deleted")
        } catch (error) {
          console.log("Could not delete old image (might not exist):", error)
        }
      }

      // Update user document
      const userDocRef = doc(db, "users", user.uid)
      await updateDoc(userDocRef, {
        profilePicture: downloadURL,
      })
      console.log("User document updated")

      setProfileData((prev) => ({
        ...prev,
        profilePicture: downloadURL,
      }))

      // Refresh user data in context
      if (refreshUserData) {
        refreshUserData()
      }

      console.log("Profile picture upload completed successfully")
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      alert(`Error al subir la imagen: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle profile update
  const handleProfileUpdate = async (updatedData) => {
    if (!user) return

    try {
      const userDocRef = doc(db, "users", user.uid)
      await updateDoc(userDocRef, updatedData)

      setProfileData((prev) => ({
        ...prev,
        ...updatedData,
      }))

      // Refresh user data in context
      if (refreshUserData) {
        refreshUserData()
      }

      setIsEditModalOpen(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error al actualizar el perfil. Por favor, intenta nuevamente.")
    }
  }

  // Format join date
  const formatJoinDate = (timestamp) => {
    if (!timestamp) return "Fecha no disponible"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
    })
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg}`}>
      <Header theme={theme} />

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className={`${theme.card} shadow rounded-lg overflow-hidden`}>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {profileData.profilePicture ? (
                    <img
                      src={profileData.profilePicture || "/placeholder.svg"}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        console.error("Error loading profile image:", e)
                        e.target.style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Upload button */}
                <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 cursor-pointer shadow-lg">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        console.log("File selected:", file)
                        handleProfilePictureUpload(file)
                      }
                    }}
                    className="hidden"
                    disabled={loading}
                  />
                </label>

                {loading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className={`text-2xl font-bold ${theme.highlight}`}>
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <p className={`text-sm ${theme.muted}`}>{user?.email}</p>
                {profileData.location && (
                  <p className={`text-sm ${theme.muted} mt-1`}>
                    <svg className="inline h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {profileData.location}
                  </p>
                )}
                <p className={`text-sm ${theme.muted} mt-2`}>Miembro desde {formatJoinDate(profileData.joinDate)}</p>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Editar Perfil
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className={`border-b ${theme.border}`}>
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("about")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "about"
                    ? `border-indigo-500 ${theme.accent}`
                    : `border-transparent ${extendedTheme.tab.inactive}`
                }`}
              >
                Acerca de
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "favorites"
                    ? `border-indigo-500 ${theme.accent}`
                    : `border-transparent ${extendedTheme.tab.inactive}`
                }`}
              >
                Favoritos ({profileData.favoriteProjects.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "about" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* About Section */}
              <div className={`lg:col-span-2 ${theme.card} shadow rounded-lg`}>
                <div className="px-4 py-5 sm:p-6">
                  <h3 className={`text-lg font-medium ${theme.highlight} mb-4`}>Acerca de</h3>
                  {profileData.bio ? (
                    <p className={`text-sm ${theme.highlight} leading-relaxed`}>{profileData.bio}</p>
                  ) : (
                    <p className={`text-sm ${theme.muted} italic`}>
                      No has añadido una biografía aún. Haz clic en "Editar Perfil" para añadir información sobre ti.
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className={`${theme.card} shadow rounded-lg`}>
                <div className="px-4 py-5 sm:p-6">
                  <h3 className={`text-lg font-medium ${theme.highlight} mb-4`}>Información de Contacto</h3>
                  <div className="space-y-3">
                    <div>
                      <dt className={`text-sm font-medium ${theme.muted}`}>Email</dt>
                      <dd className={`text-sm ${theme.highlight}`}>{user?.email}</dd>
                    </div>
                    {profileData.website && (
                      <div>
                        <dt className={`text-sm font-medium ${theme.muted}`}>Sitio Web</dt>
                        <dd>
                          <a
                            href={profileData.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm ${theme.accent} hover:underline`}
                          >
                            {profileData.website}
                          </a>
                        </dd>
                      </div>
                    )}
                    {profileData.location && (
                      <div>
                        <dt className={`text-sm font-medium ${theme.muted}`}>Ubicación</dt>
                        <dd className={`text-sm ${theme.highlight}`}>{profileData.location}</dd>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "favorites" && (
            <div className={`${theme.card} shadow rounded-lg`}>
              <div className="px-4 py-5 sm:p-6">
                <h3 className={`text-lg font-medium ${theme.highlight} mb-4`}>Proyectos Favoritos</h3>

                {loadingFavorites ? (
                  <div className="flex justify-center py-8">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className={theme.highlight}>Cargando favoritos...</span>
                  </div>
                ) : favoriteProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                    <h3 className={`mt-2 text-sm font-medium ${theme.highlight}`}>No tienes proyectos favoritos</h3>
                    <p className={`mt-1 text-sm ${theme.muted}`}>
                      Explora el catálogo y marca proyectos como favoritos para verlos aquí.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {favoriteProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} showActions={false} showAuthor={true} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className={`${theme.card} shadow rounded-lg px-4 py-5 sm:p-6`}>
            <dt className={`text-sm font-medium ${theme.muted} truncate`}>Proyectos Creados</dt>
            <dd className={`mt-1 text-3xl font-semibold ${theme.highlight}`}>
              {loadingStats ? (
                <div className="animate-pulse bg-gray-300 h-8 w-12 rounded"></div>
              ) : (
                userStats.totalProjects
              )}
            </dd>
            {!loadingStats && (
              <div className={`text-xs ${theme.muted} mt-1`}>
                {userStats.publicProjects} públicos, {userStats.privateProjects} privados
              </div>
            )}
          </div>
          <div className={`${theme.card} shadow rounded-lg px-4 py-5 sm:p-6`}>
            <dt className={`text-sm font-medium ${theme.muted} truncate`}>Proyectos Favoritos</dt>
            <dd className={`mt-1 text-3xl font-semibold ${theme.highlight}`}>{profileData.favoriteProjects.length}</dd>
          </div>
          <div className={`${theme.card} shadow rounded-lg px-4 py-5 sm:p-6`}>
            <dt className={`text-sm font-medium ${theme.muted} truncate`}>Me Gusta Recibidos</dt>
            <dd className={`mt-1 text-3xl font-semibold ${theme.highlight}`}>
              {loadingStats ? <div className="animate-pulse bg-gray-300 h-8 w-12 rounded"></div> : userStats.totalLikes}
            </dd>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleProfileUpdate}
          currentData={profileData}
        />
      )}
    </div>
  )
}

export default UserProfile
