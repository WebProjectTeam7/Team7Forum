import { ref, push, set, query, get, orderByChild, equalTo, update, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase-config';


// CREATE

export const createReply = async (threadId, username, replyContent, imagesUrls) => {
    try {
        const newReply = {
            author: username,
            threadId,
            content: replyContent,
            imagesUrls,
            createdAt: new Date().toISOString(),
        };

        const repliesRef = ref(db, 'replies');
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
        const repliesRef = query(ref(db, 'replies'), orderByChild('threadId'), equalTo(threadId));
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

export const getReplyById = async (replyId) => {
    try {
        const replyRef = query(ref(db, 'replies'), orderByChild('id'), equalTo(replyId));
        const snapshot = await get(replyRef);
        if (!snapshot.exists()) {
            return null;
        }
        const data = snapshot.val();
        return data ? Object.values(data)[0] : null;
    } catch (error) {
        console.error('Error fetching reply:', error);
        throw new Error('Failed to retrieve reply');
    }
};

export const getThreadsIdsByUsername = async (username) => {
    try {
        const replyRef = query(ref(db, 'replies'), orderByChild('author'), equalTo(username));
        const snapshot = await get(replyRef);
        if (!snapshot.exists()) {
            return [];
        }
        const data = snapshot.val();
        const threadIds = Object.values(data).map(reply => reply.threadId);
        return threadIds;
    } catch (error) {
        console.error('Error fetching thread IDs by username:', error);
        throw new Error('Failed to fetch thread IDs');
    }
};

// UPDATE

export const updateReply = async (replyId, updatedData) => {
    try {
        const replyRef = ref(db, `replies/${replyId}`);
        updatedData.updatedAt = new Date().toISOString();

        await update(replyRef, updatedData);
    } catch (error) {
        console.error('Error editing reply:', error);
        throw new Error('Failed to edit reply');
    }
};

export const handleReplyVote = async (replyId, vote, username) => {
    try {
        const replyRef = ref(db, `replies/${replyId}`);
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

export const uploadReplyImages = async (replyId, imageFiles) => {
    try {
        const imageUrls = [];
        for (const imageFile of imageFiles) {
            const imageReference = storageRef(storage, `replies/${replyId}/${imageFile.name}`);
            const snapshot = await uploadBytes(imageReference, imageFile);
            const downloadURL = await getDownloadURL(snapshot.ref);
            imageUrls.push(downloadURL);
        }
        return imageUrls;
    } catch (error) {
        console.error('Error uploading images:', error);
        throw new Error('Failed to upload images');
    }
};

// DELETE

export const deleteReply = async (replyId) => {
    try {
        const replyRef = ref(db, `replies/${replyId}`);
        await remove(replyRef);
    } catch (error) {
        console.error('Error deleting reply:', error);
        throw new Error('Failed to delete reply');
    }
};

// REPORT

export const reportReply = async (replyId, reporter, content, reason) => {
    try {
        const reportRef = push(ref(db, 'reports'));
        const report = {
            id: reportRef.key,
            type: 'reply',
            targetId: replyId,
            reporter,
            content,
            reason,
            reportedAt: new Date().toISOString(),
        };
        await set(reportRef, report);
    } catch (error) {
        console.error('Error reporting reply:', error);
        throw error;
    }
};