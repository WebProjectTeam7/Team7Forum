import { ref, get, query, orderByChild, push, update, set, remove, equalTo } from 'firebase/database';
import { db } from '../config/firebase-config';


// CREATE

export const createCategory = async (title) => {
    try {
        const categoriesRef = ref(db, 'categories');
        const newCategoryRef = push(categoriesRef);
        await set(newCategoryRef, {
            id: newCategoryRef.key,
            title,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creating category:', error);
        throw new Error('Failed to create category');
    }
};


// RETRIEVE

export const getCategories = async () => {
    try {
        const categoriesRef = query(ref(db, 'categories'), orderByChild('createdAt'));
        const snapshot = await get(categoriesRef);
        if (!snapshot.exists()) {
            return [];
        }
        return Object.values(snapshot.val());
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Failed to retrieve categories');
    }
};

export const getCategoryById = async (categoryId) => {
    try {
        const categoryRef = query(ref(db, 'categories'), orderByChild('id'), equalTo(categoryId));
        const snapshot = await get(categoryRef);
        if (!snapshot.exists()) {
            return null;
        }
        const data = snapshot.val();
        return data ? Object.values(data)[0] : null;
    } catch (error) {
        console.error('Error fetching category:', error);
        throw new Error('Failed to retrieve category by tag');
    }
};


// UPDATE

export const updateCategory = async (categoryId, newTitle) => {
    try {
        const categoryRef = ref(db, `categories/${categoryId}`);
        await update(categoryRef, { title: newTitle });
    } catch (error) {
        console.error('Error updating category:', error);
        throw new Error('Failed to update category');
    }
};

export const addThreadIdToCategory = async (categoryId, threadId) => {
    try {
        const categoryRef = ref(db, `categories/${categoryId}`);
        const snapshot = await get(categoryRef);
        if (!snapshot.exists()) {
            throw new Error('Category not found');
        }
        const categoryData = snapshot.val();
        const threads = categoryData.threads || [];
        if (!threads.includes(threadId)) {
            threads.push(threadId);
            const updatedCategory = {
                ...categoryData,
                threads,
                threadCount: threads.length,
            };
            await update(categoryRef, updatedCategory);
        }
    } catch (error) {
        console.error('Error updating category threads:', error);
        throw new Error('Failed to update threads count: ' + error.message);
    }
};

export const removeThreadIdFromCategory = async (categoryId, threadId) => {
    try {
        const categoryRef = ref(db, `categories/${categoryId}`);
        const snapshot = await get(categoryRef);
        if (!snapshot.exists()) {
            throw new Error('Category not found');
        }
        const categoryData = snapshot.val();
        const threads = categoryData.threads || [];
        const threadIndex = threads.indexOf(threadId);
        if (threadIndex >= 0) {
            threads.splice(threadIndex, 1);
            const updatedCategory = {
                ...categoryData,
                threads,
                threadCount: threads.length,
            };
            await update(categoryRef, updatedCategory);
        }
    } catch (error) {
        console.error('Error removing thread from category:', error);
        throw new Error('Failed to remove thread from category: ' + error.message);
    }
};


// DELETE

export const deleteCategory = async (categoryId) => {
    try {
        const categoryRef = ref(db, `categories/${categoryId}`);
        await remove(categoryRef);
    } catch (error) {
        console.error('Error deleting category:', error);
        throw new Error('Failed to delete category');
    }
};
