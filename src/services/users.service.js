import { get, set, ref, query, equalTo, orderByChild, update, remove } from 'firebase/database';
import { db } from '../config/firebase-config';

// CREATE

export const createUser = async (username, uid, email, firstName, lastName, role) => {
    const user = { username, uid, email, firstName, lastName, role, createdOn: new Date().toString() };
    const userRef = ref(db, `users/${username}`);
    try {
        await set(userRef, user);
        return user;
    } catch (error) {
        throw new Error('Failed to create user: ' + error.message);
    }
};

// RETRIEVE

export const getUserByUsername = async (username) => {
    const userRef = ref(db, `users/${username}`);
    try {
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
            throw new Error('User not found');
        }
        return snapshot.val();
    } catch (error) {
        throw new Error('Failed to retrieve user: ' + error.message);
    }
};

export const getUserData = async (uid) => {
    const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
    try {
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
            throw new Error('User not found');
        }
        return snapshot.val();
    } catch (error) {
        throw new Error('Failed to retrieve user data: ' + error.message);
    }
};

export const getAllUsers = async (role = null) => {
    const usersRef = role ? query(ref(db, 'users'), orderByChild('role'), equalTo(role)) : ref(db, 'users');
    try {
        const snapshot = await get(usersRef);
        if (!snapshot.exists()) {
            return [];
        }
        return Object.values(snapshot.val());
    } catch (error) {
        throw new Error('Failed to retrieve users: ' + error.message);
    }
};

// UPDATE

export const updateUser = async (uid, updatedData) => {
    const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
    try {
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
            throw new Error('User not found');
        }
        const userId = Object.keys(snapshot.val())[0];
        await update(ref(db, `users/${userId}`), updatedData);
    } catch (error) {
        throw new Error('Failed to update user: ' + error.message);
    }
};

export const switchUserRole = async (uid, newRole) => {
    const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
    try {
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
            throw new Error('User not found');
        }
        const userId = Object.keys(snapshot.val())[0];
        await update(ref(db, `users/${userId}`), { role: newRole });
    } catch (error) {
        throw new Error('Failed to switch user role: ' + error.message);
    }
};

// DELETE

export const deleteUser = async (uid) => {
    const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
    try {
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
