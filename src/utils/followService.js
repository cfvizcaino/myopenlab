import { db } from '../utils/firebase';
import { doc, setDoc, deleteDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Seguir a un usuario
export const followUser = async (currentUserId, targetUserId) => {
  const followRef = doc(db, 'users', currentUserId, 'following', targetUserId);
  await setDoc(followRef, { followedAt: new Date() });
};

// Dejar de seguir a un usuario
export const unfollowUser = async (currentUserId, targetUserId) => {
  const followRef = doc(db, 'users', currentUserId, 'following', targetUserId);
  await deleteDoc(followRef);
};

// Verificar si un usuario sigue a otro
export const isFollowing = async (currentUserId, targetUserId) => {
  const followRef = doc(db, 'users', currentUserId, 'following', targetUserId);
  const followDoc = await getDoc(followRef);
  return followDoc.exists();
};

// Obtener lista de usuarios seguidos
export const getFollowing = async (userId) => {
  const followingRef = collection(db, 'users', userId, 'following');
  const snapshot = await getDocs(followingRef);
  return snapshot.docs.map(doc => doc.id);
};

// Obtener seguidores de un usuario
export const getFollowers = async (userId) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef);
  const usersSnapshot = await getDocs(q);
  const followers = [];
  for (const userDoc of usersSnapshot.docs) {
    const followingRef = collection(db, 'users', userDoc.id, 'following');
    const followingSnapshot = await getDocs(followingRef);
    if (followingSnapshot.docs.some(doc => doc.id === userId)) {
      followers.push(userDoc.id);
    }
  }
  return followers;
};
