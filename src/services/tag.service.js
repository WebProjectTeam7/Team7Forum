import { ref, get, set, remove } from 'firebase/database';
import { db } from '../config/firebase-config';


// CREATE

export const createOrUpdateThreadTag = async (tag, threadId) => {
    try {
        const tagRef = ref(db, `tags/${tag}/threadsIds`);
        const snapshot = await get(tagRef);

        let threadsIds = snapshot.exists() ? snapshot.val() : [];
        if (threadsIds.includes(threadId)) {
            return;
        }
        threadsIds.push(threadId);
        await set(tagRef, threadsIds);
    } catch (error) {
        console.error('Error creating/updating thread tag:', error);
        throw new Error('Failed to create/update thread tag');
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
        return snapshot.val();
    } catch (error) {
        console.error('Error fetching threadIds by tag:', error);
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

        let threadsIds = snapshot.val();

        threadsIds = threadsIds.filter(id => id !== threadId);

        if (threadsIds.length === 0) {
            await remove(ref(db, `tags/${tag}`));
        } else {
            await set(tagRef, threadsIds);
        }
    } catch (error) {
        console.error('Error removing thread ID from tag:', error);
        throw new Error('Failed to remove thread ID from tag');
    }
};

// DELETE

// CLEANUP

export const cleanupUnusedTags = async () => {
    try {
        const tagsRef = ref(db, 'tags');
        const snapshot = await get(tagsRef);

        if (snapshot.exists()) {
            const tagsData = snapshot.val();

            for (const tag in tagsData) {
                const threadsIds = tagsData[tag].threadsIds;

                if (!threadsIds || threadsIds.length === 0) {
                    await remove(ref(db, `tags/${tag}`));
                }
            }
        }
    } catch (error) {
        console.error('Error cleaning up unused tags:', error);
        throw new Error('Failed to clean up unused tags');
    }
};