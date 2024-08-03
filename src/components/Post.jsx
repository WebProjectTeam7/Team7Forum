import { useContext, useState } from "react";
import { AppContext } from "../state/app.context";
import PropTypes from "prop-types";
import { likePost, dislikePost } from "../services/post.service";

export default function Post({ post }) {
  const { user, userData } = useContext(AppContext);
  const [localLikedBy, setLocalLikedBy] = useState(post.likedBy);
  const [localDislikedBy, setLocalDislikedBy] = useState(post.dislikedBy);

  const isAdminOrModerator =
    userData && (userData.role === "admin" || userData.role === "moderator");
  const isOwner = user && post.author === user.uid;

  const handleLike = async () => {
    if (user) {
      const newLikedBy = { ...localLikedBy };
      const newDislikedBy = { ...localDislikedBy };

      if (newDislikedBy[user.uid]) {
        delete newDislikedBy[user.uid];
        setLocalDislikedBy(newDislikedBy);
      }

      if (!newLikedBy[user.uid]) {
        newLikedBy[user.uid] = true;
        setLocalLikedBy(newLikedBy);
        await likePost(user.uid, post.id);
      }
    } else {
      alert("Please log in to upvote the post.");
    }
  };

  const handleDislike = async () => {
    if (user) {
      const newLikedBy = { ...localLikedBy };
      const newDislikedBy = { ...localDislikedBy };

      if (newLikedBy[user.uid]) {
        delete newLikedBy[user.uid];
        setLocalLikedBy(newLikedBy);
      }

      if (!newDislikedBy[user.uid]) {
        newDislikedBy[user.uid] = true;
        setLocalDislikedBy(newDislikedBy);
        await dislikePost(user.uid, post.id);
      }
    } else {
      alert("Please log in to downvote the post.");
    }
  };

  const likeCount = Object.keys(post.likedBy ?? {}).length;
  const dislikeCount = Object.keys(post.dislikedBy ?? {}).length;

  return (
    <div>
      <h3>{post.title}</h3>
      <p>Created on: {new Date(post.createdOn).toLocaleDateString()}</p>
      <p>{post.content}</p>
      <p>Likes: {likeCount}</p>
      {(isOwner || isAdminOrModerator) && <p>Dislikes: {dislikeCount}</p>}
      <button onClick={handleLike}>Upvote</button>
      {user && <button onClick={handleDislike}>Downvote</button>}
    </div>
  );
}

Post.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    createdOn: PropTypes.string,
    content: PropTypes.string,
    likedBy: PropTypes.object,
    dislikedBy: PropTypes.object,
    author: PropTypes.string,
  }),
};
