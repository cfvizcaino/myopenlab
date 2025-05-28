import { auth } from '../utils/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

/**
 * Registra un nuevo usuario con correo electrónico y contraseña.
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise} - Promesa que resuelve con los datos del usuario registrado.
 */

// Update your authservice.js registerUser function
export const registerUser = async (email, password, firstName, lastName) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('Usuario creado:', user);

        // Expanded user document structure
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
            firstName,
            lastName,
            email,
            bio: "",
            location: "",
            website: "",
            profilePicture: "",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log('Documento creado en Firestore con ID:', user.uid);

        return user;
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        throw error;
    }
};

/**
 * Inicia sesión con correo electrónico y contraseña.
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise} - Promesa que resuelve con los datos del usuario autenticado.
 */
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        throw error;
    }
};

export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return true;
    } catch (error) {
        console.error('Error al enviar email de recuperación:', error);
        throw error;
    }
};