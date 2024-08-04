import { ref, push, set, query, get, orderByChild, equalTo, update, remove } from 'firebase/database';
import { db } from '../config/firebase-config';

// CREATE

export const createReply = async (threadId, userId, replyContent) => {
    try {
        const repliesRef = ref(db, `threads/${threadId}/replies`);
        const newReplyRef = push(repliesRef);
        await set(newReplyRef, {
            userId,
            content: replyContent,
            createdAt: new Date().toISOString(),
        });
        return newReplyRef.key;
    } catch (error) {
        console.error('Error creating reply:', error);
        throw new Error('Failed to create reply');
    }
};


// RETRIEVE

export const getRepliesByThreadId = async (threadId) => {
    try {
        const repliesRef = query(ref(db, `threads/${threadId}/replies`), orderByChild('createdAt'));
        const snapshot = await get(repliesRef);
        if (!snapshot.exists()) {
            return [];
        }
        return Object.values(snapshot.val());
    } catch (error) {
        console.error('Error retrieving replies by thread ID:', error);
        throw new Error('Failed to retrieve replies');
    }
};

export const getRepliesByUserId = async (userId) => {
    try {
        const repliesRef = query(ref(db, 'replies'), orderByChild('userId'), equalTo(userId));
        const snapshot = await get(repliesRef);
        if (!snapshot.exists()) {
            return [];
        }
        return Object.values(snapshot.val());
    } catch (error) {
        console.error('Error retrieving replies by user ID:', error);
        throw new Error('Failed to retrieve replies');
    }
};

// UPDATE

export const editReply = async (threadId, replyId, updatedData) => {
    try {
        const replyRef = ref(db, `threads/${threadId}/replies/${replyId}`);
        await update(replyRef, updatedData);
    } catch (error) {
        console.error('Error editing reply:', error);
        throw new Error('Failed to edit reply');
    }
};


// DELETE

export const deleteReply = async (threadId, replyId) => {
    try {
        const replyRef = ref(db, `threads/${threadId}/replies/${replyId}`);
        await remove(replyRef);
    } catch (error) {
        console.error('Error deleting reply:', error);
        throw new Error('Failed to delete reply');
    }
};