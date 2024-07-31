import { ref, push, get, set, update, query, equalTo, orderByChild, orderByKey } from 'firebase/database';
import { db } from '../config/firebase-config'

export const createTweet = async (author, title, content) => {
  const tweet = { author, title, content, createdOn: new Date().toString() };
  const result = await push(ref(db, 'tweets'), tweet);
  const id = result.key;
  await update(ref(db), {
    [`tweets/${id}/id`]: id,
  });
};

export const getAllTweets = async (search = '') => {
  const snapshot = await get(ref(db, 'tweets'));
  if (!snapshot.exists()) return [];

  const tweets = Object.values(snapshot.val());

  if (search) {
    return tweets.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
  }

  return tweets;
};

export const getTweetById = async (id) => {
  const snapshot = await get(ref(db, `tweets/${id}`));
  if (!snapshot.exists()) {
    throw new Error('Tweet not found!');
  }

  return {
    ...snapshot.val(),
    likedBy: Object.keys(snapshot.val().likedBy ?? {}),
  };
};

export const likeTweet = (handle, tweetId) => {
  const updateObject = {
    [`tweets/${tweetId}/likedBy/${handle}`]: true,
    [`users/${handle}/likedTweets/${tweetId}`]: true,
  };

  return update(ref(db), updateObject);
};

export const dislikeTweet = (handle, tweetId) => {
  const updateObject = {
    [`tweets/${tweetId}/likedBy/${handle}`]: null,
    [`users/${handle}/likedTweets/${tweetId}`]: null,
  };

  return update(ref(db), updateObject);
};

// export const createTweet = async (title, content) => {
//   const response = await fetch('http://127.0.0.1:3000/tweets', {
//     method: 'POST',
//     body: JSON.stringify({ title, content }),
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });

//   if (!response.ok) {
//     throw new Error('Something went wrong!');
//   }

//   return response.json();
// };

// export const getAllTweets = async (search = '') => {
//   const response = await fetch(`http://127.0.0.1:3000/tweets?search=${search}`);

//   if (!response.ok) {
//     throw new Error('Something went wrong!');
//   }

//   return response.json();
// };

// export const getTweetById = async (id) => {
//   const response = await fetch(`http://127.0.0.1:3000/tweets/${id}`);

//   if (!response.ok) {
//     throw new Error('Something went wrong!');
//   }

//   return response.json();
// };

// /**
//  * 
//  * @param {{
// *  id: number,
// *  title: string,
// *  content: string,
// *  createdOn: string,
// *  liked: boolean
// * }} tweet 
//  * @returns 
//  */
// export const updateTweet = async (tweet) => {
//   const response = await fetch(`http://127.0.0.1:3000/tweets/${tweet.id}`, {
//     method: 'PUT',
//     body: JSON.stringify(tweet),
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });

//   if (!response.ok) {
//     throw new Error('Something went wrong!');
//   }

//   return response.json();
// };
