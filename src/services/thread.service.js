import { ref, get, query, orderByChild, limitToLast, limitToFirst, equalTo, push, update, remove, set } from 'firebase/database';
import { db } from '../config/firebase-config';


// CREATE

export const createThread = async (categoryId, title, content, tags, authorId, authorName) => {
    try {
        const newThread = {
            categoryId,
            title,
            content,
            tags,
            authorId,
            authorName,
            createdAt: new Date().toISOString(),
        };

        const threadsRef = ref(db, 'threads');
        const newThreadRef = await push(threadsRef);
        await set(newThreadRef, { ...newThread, id: newThreadRef.key });
        return newThreadRef.key;
    } catch (error) {
        console.error('Error creating thread:', error);
        throw error;
    }
};


// RETRIEVE

export const getThreadsByFilterInOrder = async (orderBy = 'createdAt', order = 'desc', limit = null, categoryId = null) => {
    try {
        let threadsRef = ref(db, 'threads');

        if (categoryId) {
            threadsRef = query(threadsRef, orderByChild('categoryId'), equalTo(categoryId));
        }

        threadsRef = query(threadsRef, orderByChild(orderBy));

        if (limit) {
            threadsRef = order === 'asc' ?
                query(threadsRef, limitToFirst(limit)) :
                query(threadsRef, limitToLast(limit));
        }

        const snapshot = await get(threadsRef);
        if (!snapshot.exists()) {
            return [];
        }

        const threads = [];
        snapshot.forEach(childSnapshot => {
            threads.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });

        return threads;
    } catch (error) {
        console.error('Error fetching threads:', error);
        throw new Error('Failed to fetch threads');
    }
};

export const getThreadsByCategoryId = async (categoryId, limit = 100, order = 'desc') => {
    try {
        const threadsRef = query(
            ref(db, 'threads'),
            orderByChild('categoryId'),
            equalTo(categoryId),
            order === 'desc' ? limitToLast(limit) : limitToFirst(limit),
        );
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

export const getThreadById = async (threadId) => {
    try {
        const threadRef = query(ref(db, 'threads'), orderByChild('id'), equalTo(threadId));
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

export const getThreadsCount = async () => {
    try {
        const threadsRef = query(ref(db, 'threads'));
        const snapshot = await get(threadsRef);
        if (!snapshot.exists()) {
            return 0;
        }
        return Object.keys(snapshot.val()).length;
    } catch (error) {
        throw new Error('Failed to retrieve threads count: ' + error.message);
    }
};

// UPDATE

export const updateThread = async (threadId, updatedData) => {
    try {
        const threadRef = ref(db, `threads/${threadId}`);
        const snapshot = await get(threadRef);
        if (!snapshot.exists()) {
            throw new Error('Thread not found');
        }
        await update(threadRef, { ...updatedData, updatedAt: new Date().toISOString(), });
    } catch (error) {
        console.error('Error updating thread:', error);
        throw error;
    }
};

export const handleThreadVote = async (threadId, vote, username) => {
    try {
        const threadRef = ref(db, `threads/${threadId}`);
        const snapshot = await get(threadRef);
        if (!snapshot.exists()) {
            throw new Error('Thread not found');
        }
        const threadData = snapshot.val();
        let upvotes = threadData.upvotes || [];
        let downvotes = threadData.downvotes || [];
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
        await update(threadRef, { upvotes, downvotes });
    } catch (error) {
        console.error('Error handling vote:', error);
        throw new Error('Failed to handle vote');
    }
};

export const incrementThreadViews = async (threadId) => {
    try {
        const threadRef = ref(db, `threads/${threadId}`);
        const snapshot = await get(threadRef);
        if (!snapshot.exists()) {
            throw new Error('Thread not found');
        }
        const threadData = snapshot.val();
        const newViewsCount = (threadData.views || 0) + 1;
        await update(threadRef, { views: newViewsCount });
        return newViewsCount;
    } catch (error) {
        console.error('Error incrementing thread views:', error);
        throw new Error('Failed to increment thread views');
    }
};

export const addReplyIdToThread = async (threadId, replyId) => {
    try {
        const threadRef = ref(db, `threads/${threadId}`);
        const snapshot = await get(threadRef);
        if (!snapshot.exists()) {
            throw new Error('Thread not found');
        }
        const threadData = snapshot.val();
        const replies = threadData.replies || [];
        if (!replies.includes(replyId)) {
            replies.push(replyId);
            const updatedThread = {
                ...threadData,
                replies,
                replyCount: replies.length,
            };
            await update(threadRef, updatedThread);
        }
    } catch (error) {
        console.error('Error updating thread replies:', error);
        throw new Error('Failed to update replies count');
    }
};

export const removeReplyIdFromThread = async (threadId, replyId) => {
    try {
        const threadRef = ref(db, `threads/${threadId}`);
        const snapshot = await get(threadRef);
        if (!snapshot.exists()) {
            throw new Error('Thread not found');
        }
        const threadData = snapshot.val();
        const replies = threadData.replies || [];
        const replyIndex = replies.indexOf(replyId);
        if (replyIndex >= 0) {
            replies.splice(replyIndex, 1);
            const updatedThread = {
                ...threadData,
                replies,
                replyCount: replies.length,
            };
            await update(threadRef, updatedThread);
        }
    } catch (error) {
        console.error('Error updating thread replies:', error);
        throw new Error('Failed to update replies count');
    }
};


// DELETE

export const deleteThread = async (threadId) => {
    try {
        const threadRef = ref(db, `threads/${threadId}`);
        await remove(threadRef);
    } catch (error) {
        console.error('Error deleting thread:', error);
        throw error;
    }
};

// REPORT

export const reportThread = async (threadId, reporter, content, reason) => {
    try {
        const reportRef = push(ref(db, 'reports'));
        const report = {
            id: reportRef.key,
            type: 'thread',
            targetId: threadId,
            reporter,
            content,
            reason,
            reportedAt: new Date().toISOString(),
        };
        await set(reportRef, report);
    } catch (error) {
        console.error('Error reporting thread:', error);
        throw error;
    }
};