import { ref, push, get, update } from 'firebase/database';
import { db } from '../config/firebase-config';

export const createPost = async (author, title, content) => {
    const post = { author, title, content, createdOn: new Date().toString() };
    const result = await push(ref(db, 'posts'), post);
    const id = result.key;
    await update(ref(db), {
        [`posts/${id}/id`]: id,
    });
};

export const getAllPosts = async (search = '') => {
    const snapshot = await get(ref(db, 'posts'));
    if (!snapshot.exists()) return [];
    const posts = Object.values(snapshot.val());
    if (search) {
        return posts.filter((p) =>
            p.title.toLowerCase().includes(search.toLowerCase())
        );
    }

    return posts;
};

export const getPostById = async (id) => {
    const snapshot = await get(ref(db, `posts/${id}`));
    if (!snapshot.exists()) {
        throw new Error('Post not found!');
    }

    const postData = snapshot.val();
    return {
        ...postData,
        likedBy: postData.likedBy ?? {},
        dislikedBy: postData.dislikedBy ?? {},
    };
};

export const likePost = async (userId, postId) => {
    if (!userId || !postId) {
        throw new Error('Invalid parameters.');
    }

    const updateObject = {
        [`posts/${postId}/likedBy/${userId}`]: true,
        [`posts/${postId}/dislikedBy/${userId}`]: null,
        [`users/${userId}/likedPosts/${postId}`]: true,
        [`users/${userId}/dislikedPosts/${postId}`]: null,
    };

    return update(ref(db), updateObject);
};

export const dislikePost = async (userId, postId) => {
    if (!userId || !postId) {
        throw new Error('Invalid parameters.');
    }

    const updateObject = {
        [`posts/${postId}/likedBy/${userId}`]: null,
        [`posts/${postId}/dislikedBy/${userId}`]: true,
        [`users/${userId}/likedPosts/${postId}`]: null,
        [`users/${userId}/dislikedPosts/${postId}`]: true,
    };

    return update(ref(db), updateObject);
};
