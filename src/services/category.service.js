import { ref, get, query, orderByChild, push, update, set, remove } from 'firebase/database';
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
    const categoriesRef = query(ref(db, 'categories'), orderByChild('createdAt'));
    try {
        const snapshot = await get(categoriesRef);
        if (!snapshot.exists()) {
            return [];
        }
        return Object.values(snapshot.val());
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};


// UPDATE

export const updateCategory = async (categoryId, newTitle) => {
    try {
        const categoryRef = ref(db, `categories/${categoryId}`);
        await update(categoryRef, { title: newTitle });
        console.log(`Category with ID ${categoryId} updated successfully.`);
    } catch (error) {
        console.error('Error updating category:', error);
        throw new Error('Failed to update category');
    }
};


// DELETE

export const deleteCategory = async (categoryId) => {
    try {
        const categoryRef = ref(db, `categories/${categoryId}`);
        await remove(categoryRef);
        console.log(`Category with ID ${categoryId} deleted successfully.`);
    } catch (error) {
        console.error('Error deleting category:', error);
        throw new Error('Failed to delete category');
    }
};
