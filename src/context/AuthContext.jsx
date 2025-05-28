<<<<<<< Updated upstream
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase';
=======
"use client"
>>>>>>> Stashed changes

import { createContext, useContext, useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../utils/firebase"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
<<<<<<< Updated upstream
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}> {/* Exportar loading */}
      {children}
    </AuthContext.Provider>
  );
};
=======
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Function to fetch user data from Firestore
  const fetchUserData = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid)
      const userSnapshot = await getDoc(userDocRef)

      if (userSnapshot.exists()) {
        const data = userSnapshot.data()
        setUserData(data)
        return data
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
    return null
  }

  // Function to refresh user data
  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.uid)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        await fetchUserData(user.uid)
      } else {
        setUser(null)
        setUserData(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])
>>>>>>> Stashed changes

  const value = {
    user,
    userData,
    loading,
    refreshUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
