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

export const getUsersByUsername = async () => {
    const usersRef = ref(db, 'users');
    try {
        const snapshot = await get(usersRef);
        if (!snapshot.exists()) {
            throw new Error('No users found');
        }
        const allUsers = snapshot.val();
        return Object.keys(allUsers).map(key => ({
            key,
            ...allUsers[key]
        }));
    } catch (error) {
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

// BAN USER

export const banUser = async (uid, days) => {
    const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        const userId = Object.keys(snapshot.val())[0];
        const userData = Object.values(snapshot.val())[0];
        if (userData.role === 'admin') {
            throw new Error('Admins cannot be banned.');
        }

        const banEndDate = new Date();
        banEndDate.setDate(banEndDate.getDate() + days);
        await update(ref(db, `users/${userId}`), { isBanned: true, banEndDate: banEndDate.toISOString() });
    }
};

export const unbanUser = async (uid) => {
    const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        const userId = Object.keys(snapshot.val())[0];
        await update(ref(db, `users/${userId}`), { isBanned: false, banEndDate: null });
    }
};

export const handleBanUser = async (uid, banDuration) => {
    if (!banDuration) {
        throw new Error('Please enter a valid number of days.');
    }
    await banUser(uid, parseInt(banDuration));
};

export const isUserBanned = async (uid) => {
    const userRef = query(ref(db, 'users'), orderByChild('uid'), equalTo(uid));
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        const userData = Object.values(snapshot.val())[0];
        if (userData.banExpiration) {
            const banEndDate = new Date(userData.banExpiration);
            const currentDate = new Date();
            if (currentDate < banEndDate) {
                return true;
            }

            const userId = Object.keys(snapshot.val())[0];
            await update(ref(db, `users/${userId}`), { banExpiration: null });
            return false;

        }
    }
    return false;
};

export const getRemainingBanTime = (banEndDate) => {
    const now = new Date();
    const end = new Date(banEndDate);
    const diff = end - now;
    if (diff <= 0) return 'Ban has expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days} days ${hours} hours`;
};