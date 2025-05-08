import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('No se pudo crear la cuenta. Verifica los datos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Crear Cuenta</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input type="email" placeholder="Email" className="mb-4 w-full p-2 rounded border" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña (mínimo 6 caracteres)" className="mb-4 w-full p-2 rounded border" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Registrarse</button>
      </form>
    </div>
  );
};

export default Register;