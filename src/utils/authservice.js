import { auth } from '../utils/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

/**
 * Registra un nuevo usuario con correo electrónico y contraseña.
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} password - Contraseña del usuario.
 * @param {string} firstName - Nombre del usuario.
 * @param {string} lastName - Apellido del usuario.
 * @returns {Promise} - Promesa que resuelve con los datos del usuario registrado.
 */
export const registerUser = async (email, password, firstName, lastName) => {
    try {
        console.log('Intentando crear usuario...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('Usuario creado:', user);

        // Guardar datos del usuario en Firestore usando addDoc
        const usersCollectionRef = collection(db, 'users');
        const docRef = await addDoc(usersCollectionRef, {
            uid: user.uid, // Guardamos el UID manualmente
            firstName,
            lastName,
            email,
            createdAt: new Date().toISOString(),
        });
        console.log('Documento creado en Firestore con ID:', docRef.id);

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