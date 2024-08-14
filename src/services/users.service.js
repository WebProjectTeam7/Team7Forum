import { get, set, ref, query, equalTo, orderByChild, update, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase-config';


// CREATE

export const createUser = async (username, uid, email, firstName, lastName, role) => {
    const user = { username, uid, email, firstName, lastName, role, createdOn: new Date().toString() };
    const userRef = ref(db, `users/${username}`);
    try {
        await set(userRef, user);
        return user;
    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('Failed to create user: ' + error.message);
    }
};

// RETRIEVE

export const getUserByUsername = async (username) => {
    const userRef = ref(db, `users/${username}`);
    try {
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
            return null;
        }
        return snapshot.val();
    } catch (error) {
        console.error('Error retrieving user by username:', error);
        throw new Error('Failed to retrieve user: ' + error.message);
    }
};

export const getUsersByUsernameMatch = async (keyWord) => {
    const usersRef = ref(db, 'users');
    try {
        const snapshot = await get(usersRef);
        if (!snapshot.exists()) {
            return [];
        }

        const users = [];
        snapshot.forEach(childSnapshot => {
            const userData = childSnapshot.val();
            if (userData.username && userData.username.toLowerCase().includes(keyWord.toLowerCase())) {
                users.push({ id: childSnapshot.key, ...userData });
            }
        });

        return users;
    } catch (error) {
        console.error('Error fetching users by username match:', error);
        throw new Error('Failed to retrieve users: ' + error.message);
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
        console.error('Error retrieving user data:', error);
        throw new Error('Failed to retrieve user data: ' + error.message);
    }
};

export const getAllUsers = async (role = null) => {
    try {
        const usersRef = role ? query(ref(db, 'users'), orderByChild('role'), equalTo(role)) : ref(db, 'users');
        const snapshot = await get(usersRef);
        if (!snapshot.exists()) {
            return [];
        }
        return Object.values(snapshot.val());
    } catch (error) {
        console.error('Error fetching all users:', error);
        throw new Error('Failed to retrieve users: ' + error.message);
    }
};

export const getUsersCount = async () => {
    try {
        const usersRef = query(ref(db, 'users'));
        const snapshot = await get(usersRef);
        if (!snapshot.exists()) {
            return 0;
        }
        return Object.keys(snapshot.val()).length;
    } catch (error) {
        console.error('Error retrieving users count:', error);
        throw new Error('Failed to retrieve users count: ' + error.message);
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
        console.error('Error updating user:', error);
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
        console.error('Error switching user role:', error);
        throw new Error('Failed to switch user role: ' + error.message);
    }
};

export const uploadUserAvatar = async (uid, imageFile) => {
    try {
        const avatarRef = storageRef(storage, `avatars/${uid}`);
        const snapshot = await uploadBytes(avatarRef, imageFile);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image');
    }
};

// DELETE USER
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
        console.error('Error deleting user:', error);
        throw new Error('Failed to delete user: ' + error.message);
    }
};
