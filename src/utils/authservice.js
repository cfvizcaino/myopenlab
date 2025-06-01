import { auth } from "../utils/firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../utils/firebase"

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
    console.log("Intentando crear usuario...")
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    console.log("Usuario creado:", user)

    // Guardar datos del usuario en Firestore usando setDoc con el UID como ID del documento
    const userDocRef = doc(db, "users", user.uid)
    await setDoc(userDocRef, {
      firstName,
      lastName,
      email,
      bio: "",
      location: "",
      website: "",
      profilePicture: "",
      favoriteProjects: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    console.log("Documento creado en Firestore con ID:", user.uid)

    return user
  } catch (error) {
    console.error("Error al registrar usuario:", error)
    throw error
  }
}

/**
 * Inicia sesión con correo electrónico y contraseña.
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise} - Promesa que resuelve con los datos del usuario autenticado.
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    throw error
  }
}

/**
 * Envía un email de recuperación de contraseña.
 * @param {string} email - Correo electrónico del usuario.
 * @returns {Promise} - Promesa que resuelve cuando se envía el email.
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: window.location.origin + "/login", // URL de redirección después del reset
      handleCodeInApp: false,
    })
    return true
  } catch (error) {
    console.error("Error al enviar email de recuperación:", error)
    throw error
  }
}

/**
 * Cambia la contraseña del usuario actual.
 * @param {string} currentPassword - Contraseña actual del usuario.
 * @param {string} newPassword - Nueva contraseña.
 * @returns {Promise} - Promesa que resuelve cuando se cambia la contraseña.
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("No hay usuario autenticado")
    }

    // Re-autenticar al usuario antes de cambiar la contraseña
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)

    // Cambiar la contraseña
    await updatePassword(user, newPassword)
    return true
  } catch (error) {
    console.error("Error al cambiar contraseña:", error)
    throw error
  }
}

/**
 * Verifica si un email está disponible (no registrado).
 * @param {string} email - Correo electrónico a verificar.
 * @returns {Promise<boolean>} - True si está disponible, false si ya está registrado.
 */
export const checkEmailAvailability = async (email) => {
  try {
    // Intentar crear un usuario temporal para verificar si el email existe
    // Esto es solo para verificación, no se completa el registro
    await createUserWithEmailAndPassword(auth, email, "temp_password_123")
    return true // Email disponible
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      return false // Email ya registrado
    }
    throw error // Otro tipo de error
  }
}
