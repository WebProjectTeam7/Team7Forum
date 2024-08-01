import { get, set, ref, query, equalTo, orderByChild, update } from 'firebase/database';
import { db } from '../config/firebase-config';

export const getUserByHandle = async (username) => {
  const snapshot = await get(ref(db, `users/${username}`));
  return snapshot.val();
};

export const createUserHandle = async (username, uid, email, firstName, lastName, role) => {
  const user = { username, uid, email, firstName, lastName, role, createdOn: new Date().toString() };
  await set(ref(db, `users/${username}`), user);
};

export const getUserData = async (uid) => {
  const snapshot = await get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
  return snapshot.val();
};

export const updateUserHandle = async (uid, updatedData) => {
  const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
  const snapshot = await get(userRef);
  const userId = Object.keys(snapshot.val())[0];
  await update(ref(db, `users/${userId}`), updatedData);
};
