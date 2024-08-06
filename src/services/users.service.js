import { get, set, ref, query, equalTo, orderByChild, update, remove } from 'firebase/database';
import { db } from '../config/firebase-config';


// CREATE

export const createUser = async (username, uid, email, firstName, lastName, role) => {
    const user = { username, uid, email, firstName, lastName, role, createdOn: new Date().toString() };
    const userRef = ref(db, `users/${username}`);
    await set(userRef, user);
    return user;
};


// RETRIEVE

export const getUserByUsername = async (username) => {
    const userRef = ref(db, `users/${username}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        return snapshot.val();
    }
    return null;
};

export const getUserData = async (uid) => {
    const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
    const snapshot = await get(userRef);
    return snapshot.val();
};

export const getAllUsers = async (role = null) => {
    const usersRef = role ? query(ref(db, 'users'), orderByChild('role'), equalTo(role)) : ref(db, 'users');
    const snapshot = await get(usersRef);
    if (!snapshot) {
        return [];
    }
    return Object.values(snapshot.val());
};


// UPDATE

export const updateUser = async (uid, updatedData) => {
    const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
    const snapshot = await get(userRef);
    const userId = Object.keys(snapshot.val())[0];
    await update(ref(db, `users/${userId}`), updatedData);
};

export const switchUserRole = async (uid, newRole) => {
    const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
    const snapshot = await get(userRef);
    const userId = Object.keys(snapshot.val())[0];
    await update(ref(db, `users/${userId}`), { role: newRole });
};


// DELETE

export const deleteUser = async (uid) => {
    try {
        const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            throw new Error('User not found');
        }

        const userId = Object.keys(snapshot.val())[0];

        await remove(ref(db, `users/${userId}`));
    } catch (error) {
        throw new Error('Failed to delete user: ' + error.message);
    }
};