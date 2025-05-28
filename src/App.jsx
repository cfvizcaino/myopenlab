"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Projects from "./pages/Projects"
<<<<<<< Updated upstream
//import Explore from './pages/Explore';
//import ProjectDetail from './pages/ProjectDetail';
=======
import Catalog from "./pages/Catalog"
import ProjectDetail from "./pages/ProjectDetail"
import UserProfile from "./pages/UserProfile"
>>>>>>> Stashed changes

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/project/:id" element={<ProjectDetail />} />

      {/* Auth routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/projects" element={user ? <Projects /> : <Navigate to="/login" />} />
<<<<<<< Updated upstream
      {/*Route path="/explore" element={user ? <Explore /> : <Navigate to="/login" />} />*/}
      {/*<Route path="/project/:id" element={user ? <ProjectDetail /> : <Navigate to="/login" />} />*/}
      <Route path="*" element={<Navigate to="/login" />} /> {/* Ruta por defecto */}
=======
      <Route path="/profile" element={user ? <UserProfile /> : <Navigate to="/login" />} />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
>>>>>>> Stashed changes
    </Routes>
  )
}

export default App
