import { ref, get, set, remove } from 'firebase/database';
import { db } from '../config/firebase-config';


// CREATE

export const createThreadTag = async (tag, threadId) => {
    try {
        const threadsIds = await getThreadsIdsByTag(tag);
        if (threadsIds.includes(threadId)) {
            return;
        }
        const newTagRef = ref(db, `tags/${tag}`);
        await set(newTagRef, { threadsIds: [...threadsIds, threadId] });
    } catch (error) {
        console.error('Error creating thread tag:', error);
        throw new Error('Failed to create thread tag');
    }
};

// RETRIEVE

export const getThreadsIdsByTag = async (tag) => {
    try {
        const tagRef = ref(db, `tags/${tag}/threadsIds`);
        const snapshot = await get(tagRef);
        if (!snapshot.exists()) {
            return [];
        }
        return Object.values(snapshot.val());
    } catch (error) {
        console.error('Error fetching threadIds', error);
        throw new Error('Failed to retrieve threadIds by tag');
    }
};

// UPDATE

export const removeThreadIdFromTag = async (tag, threadId) => {
    try {
        const tagRef = ref(db, `tags/${tag}/threadsIds`);
        const snapshot = await get(tagRef);

        if (!snapshot.exists()) {
            throw new Error('Tag does not exist.');
        }

        const threadsIds = snapshot.val();

        if (!threadsIds.includes(threadId)) {
            throw new Error('Thread ID not found in tag.');
        }

        const newThreadsIds = threadsIds.filter(id => id !== threadId);

        if (newThreadsIds.length === 0) {
            await remove(ref(db, `tags/${tag}`));
        } else {
            await set(tagRef, newThreadsIds);
        }
    } catch (error) {
        console.error('Error deleting thread ID from tag:', error);
        throw new Error('Failed to delete thread ID from tag');
    }
};

// DELETE
