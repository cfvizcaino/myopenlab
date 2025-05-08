import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, resetPassword } from '../utils/authservice';
import { FirebaseError } from 'firebase/app';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();

    // Detectar preferencia de modo oscuro del sistema
    useEffect(() => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setDarkMode(true);
        }

        // Escuchar cambios en la preferencia del sistema
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => setDarkMode(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Manejar cambio manual de tema
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const user = await loginUser(email, password);
            console.log('Usuario autenticado:', user);
            navigate('/dashboard');
        } catch (err) {
            if (err instanceof FirebaseError) {
                switch (err.code) {
                    case 'auth/user-not-found':
                        setError('No existe una cuenta con este correo electrónico');
                        break;
                    case 'auth/wrong-password':
                        setError('Contraseña incorrecta');
                        break;
                    case 'auth/invalid-email':
                        setError('Correo electrónico inválido');
                        break;
                    default:
                        setError('Error al iniciar sesión. Por favor, intente nuevamente');
                }
            } else {
                setError('Error al iniciar sesión. Por favor, intente nuevamente');
            }
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            await resetPassword(email);
            setResetSent(true);
        } catch (err) {
            if (err instanceof FirebaseError) {
                switch (err.code) {
                    case 'auth/user-not-found':
                        setError('No existe una cuenta con este correo electrónico');
                        break;
                    case 'auth/invalid-email':
                        setError('Correo electrónico inválido');
                        break;
                    default:
                        setError('Error al enviar el email de recuperación');
                }
            } else {
                setError('Error al enviar el email de recuperación');
            }
        }
    };

    return (
        <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
            {/* Toggle para cambiar entre modo claro y oscuro */}
            <div className="absolute top-4 right-4">
                <button
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-indigo-100 text-gray-700'}`}
                    aria-label="Cambiar tema"
                >
                    {darkMode ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>
            </div>
            
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className={`mt-6 text-center text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Bienvenido
                </h2>
                <p className={`mt-2 text-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Ingresa a tu cuenta
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className={`py-8 px-4 shadow sm:rounded-lg sm:px-10 transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                Correo electrónico
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
                                        darkMode 
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-offset-gray-800' 
                                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                                    }`}
                                    placeholder="ejemplo@correo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                Contraseña
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
                                        darkMode 
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-offset-gray-800' 
                                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                                    }`}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="text-center justify-end">
                            <div className="text-sm">
                                {resetSent ? (
                                    <a href="#" className={`font-medium hover:underline ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}>
                                        Se ha enviado un correo de recuperación a tu email
                                    </a>
                                ) : (
                                    <a href="#" className={`text-center font-medium hover:underline ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`} onClick={handleResetPassword}>
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                )}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
                                    darkMode ? 'focus:ring-offset-gray-800' : ''
                                }`}
                            >
                                Iniciar Sesión
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 rounded bg-red-100 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <div className="mt-6">
                        <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            ¿No tienes una cuenta?{' '}
                            <Link to="/register" className={`font-medium hover:underline ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}>
                                Regístrate aquí
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;