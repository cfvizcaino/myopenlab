import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
//import Dashboard from './pages/Dashboard'; // Descomentado
//import Explore from './pages/Explore';
//import ProjectDetail from './pages/ProjectDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth(); // Obtener user y loading del contexto

  if (loading) {
    return <div>Cargando...</div>; // O un spinner de carga
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      {/*Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} /> {/* Ruta protegida */}
      {/*<Route path="/explore" element={user ? <Explore /> : <Navigate to="/login" />} />*/}
      {/*<Route path="/project/:id" element={user ? <ProjectDetail /> : <Navigate to="/login" />} />*/}
      <Route path="*" element={<Navigate to="/login" />} /> {/* Ruta por defecto */}
    </Routes>
  );
}

export default App;
