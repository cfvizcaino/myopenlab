"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Projects from "./pages/Projects"
import Catalog from "./pages/Catalog";
import ProjectDetail from './pages/ProjectDetail';

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
  const { user, loading } = useAuth() // Obtener user y loading del contexto

  if (loading) {
    return <div>Cargando...</div> // O un spinner de carga
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/projects" element={user ? <Projects /> : <Navigate to="/login" />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/project/:id" element={<ProjectDetail />} /> {/* Nueva ruta */}
      <Route path="*" element={<Navigate to="/login" />} /> {/* Ruta por defecto */}
    </Routes>
  )
}

export default App


