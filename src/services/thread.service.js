import { ref, get, query, orderByChild, limitToLast, limitToFirst, equalTo, push, update, remove } from 'firebase/database';
import { db } from '../config/firebase-config';


// CREATE

export const createThread = async (categoryId, title, content, authorId, authorName) => {
    try {
        const newThread = {
            categoryId,
            title,
            content,
            authorId,
            authorName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const threadsRef = ref(db, 'threads');
        await push(threadsRef, newThread);

        console.log('Thread created successfully');
    } catch (error) {
        console.error('Error creating thread:', error);
        throw error;
    }
};


// RETRIEVE

export const getThreadsByCategoryId = async (categoryId, limit = 100, orderBy = 'createdAt', order = 'desc') => {
    const threadsRef = query(
        ref(db, 'threads'),
        orderByChild('categoryId'),
        equalTo(categoryId),
        // orderByChild(orderBy),
        order === 'desc' ? limitToLast(limit) : limitToFirst(limit),
    );
    try {
        const snapshot = await get(threadsRef);
        if (!snapshot.exists()) {
            return [];
        }
        return Object.values(snapshot.val());
    } catch (error) {
        console.error('Error fetching threads:', error);
        throw error;
    }
};

export const getThreadById = async (uid) => {
    const threadRef = query(ref(db, 'threads'), orderByChild('uid'), equalTo(uid));
    try {
        const snapshot = await get(threadRef);
        if (!snapshot.exists()) {
            return null;
        }
        const data = snapshot.val();
        return data ? Object.values(data)[0] : null;
    } catch (error) {
        console.error('Error fetching thread:', error);
        throw error;
    }
};


// UPDATE

export const editThread = async (threadId, updatedData) => {
    const threadRef = ref(db, `threads/${threadId}`);
    const snapshot = await get(threadRef);
    if (!snapshot.exists()) {
        throw new Error('Thread not found');
    }
    await update(threadRef, updatedData);
};


// DELETE

export const deleteThread = async (threadId) => {
    try {
        const threadRef = ref(db, `threads/${threadId}`);
        await remove(threadRef);
        console.log(`Thread with ID ${threadId} deleted successfully.`);
    } catch (error) {
        console.error('Error deleting thread:', error);
        throw new Error('Failed to delete thread');
    }
};
