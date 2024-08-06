import { ref, push, set, query, get, orderByChild, equalTo, update, remove } from 'firebase/database';
import { db } from '../config/firebase-config';

// CREATE

export const createReply = async (threadId, username, content) => {
    try {
        const newReply = {
            author: username,
            threadId,
            content,
            createdAt: new Date().toISOString(),
        };

        const repliesRef = ref(db, `replies/${threadId}`);
        const newReplyRef = push(repliesRef);
        await set(newReplyRef, { ...newReply, id: newReplyRef.key });
        return newReplyRef.key;
    } catch (error) {
        console.error('Error creating reply:', error);
        throw new Error('Failed to create reply');
    }
};

// RETRIEVE

export const getRepliesByThreadId = async (threadId) => {
    try {
        const repliesRef = ref(db, `replies/${threadId}`);
        const snapshot = await get(repliesRef);
        if (!snapshot.exists()) {
            return [];
        }
        return Object.values(snapshot.val()).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } catch (error) {
        console.error('Error retrieving replies by thread ID:', error);
        throw new Error('Failed to retrieve replies');
    }
};

export const getRepliesCountByThreadId = async (threadId) => {
    try {
        const repliesRef = ref(db, `replies/${threadId}`);
        const snapshot = await get(repliesRef);
        if (!snapshot.exists()) {
            return 0;
        }
        return Object.values(snapshot.val()).length;
    } catch (error) {
        console.error('Error retrieving replies count by thread ID:', error);
        throw new Error('Failed to retrieve replies count');
    }
};

// UPDATE

export const updateReply = async (threadId, replyId, updatedData) => {
    try {
        const replyRef = ref(db, `replies/${threadId}/${replyId}`);
        await update(replyRef, updatedData);
    } catch (error) {
        console.error('Error editing reply:', error);
        throw new Error('Failed to edit reply');
    }
};

export const handleReplyVote = async (threadId, replyId, vote, username) => {
    try {
        const replyRef = ref(db, `replies/${threadId}/${replyId}`);
        const snapshot = await get(replyRef);
        if (!snapshot.exists()) {
            throw new Error('Reply not found');
        }
        const replyData = snapshot.val();
        let upvotes = replyData.upvotes || [];
        let downvotes = replyData.downvotes || [];

        if (vote === 1) {
            if (!upvotes.includes(username)) {
                upvotes.push(username);
                downvotes = downvotes.filter(user => user !== username);
            }
        } else if (vote === -1) {
            if (!downvotes.includes(username)) {
                downvotes.push(username);
                upvotes = upvotes.filter(user => user !== username);
            }
        } else {
            upvotes = upvotes.filter(user => user !== username);
            downvotes = downvotes.filter(user => user !== username);
        }
        await update(replyRef, { upvotes, downvotes });
    } catch (error) {
        console.error('Error handling vote:', error);
        throw new Error('Failed to handle vote');
    }
};

// DELETE

export const deleteReply = async (threadId, replyId) => {
    try {
        const replyRef = ref(db, `replies/${threadId}/${replyId}`);
        await remove(replyRef);
    } catch (error) {
        console.error('Error deleting reply:', error);
        throw new Error('Failed to delete reply');
    }
};
