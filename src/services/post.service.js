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
    return posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
  }

  return posts;
};

export const getPostById = async (id) => {
  const snapshot = await get(ref(db, `posts/${id}`));
  if (!snapshot.exists()) {
    throw new Error('Post not found!');
  }

  return {
    ...snapshot.val(),
    likedBy: Object.keys(snapshot.val().likedBy ?? {}),
  };
};

export const likePost = (handle, postId) => {
  const updateObject = {
    [`posts/${postId}/likedBy/${handle}`]: true,
    [`users/${handle}/likedPosts/${postId}`]: true,
  };

  return update(ref(db), updateObject);
};

export const dislikePost = (handle, postId) => {
  const updateObject = {
    [`posts/${postId}/likedBy/${handle}`]: null,
    [`users/${handle}/likedPosts/${postId}`]: null,
  };

  return update(ref(db), updateObject);
};