import { get, set, ref, query, equalTo, orderByChild, update } from 'firebase/database';
import { db } from '../config/firebase-config';

export const getUserByHandle = async (username) => {
  const userRef = ref(db, `users/${username}`);
  const snapshot = await get(userRef);
  return snapshot.val();
};

export const createUserHandle = async (username, uid, email, firstName, lastName, role) => {
  const user = { username, uid, email, firstName, lastName, role, createdOn: new Date().toString() };
  const userRef = ref(db, `users/${username}`);
  await set(userRef, user);
};

export const getUserData = async (uid) => {
  const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid))
  const snapshot = await get(userRef);
  return snapshot.val();
};

export const updateUserHandle = async (uid, updatedData) => {
  const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
  const snapshot = await get(userRef);
  const userId = Object.keys(snapshot.val())[0];
  await update(ref(db, `users/${userId}`), updatedData);
};

export const getAllUsers = async (role = null) => {
  const usersRef = role ? query(ref(db, 'users'), orderByChild('role'), equalTo(role)) : ref(db, 'users');
  const snapshot = await get(usersRef);
  if (!snapshot) {
    return [];
  }
  return Object.values(snapshot.val());
};

export const switchUserRole = async (uid, newRole) => {
  const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
  const snapshot = await get(userRef);
  const userId = Object.keys(snapshot.val())[0];
  await update(ref(db, `users/${userId}`), { role: newRole });
} 
