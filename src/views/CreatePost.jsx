import { useContext, useState } from "react";
import { createPost } from "../services/post.service";
import { AppContext } from "../state/app.context";

const MIN_TITLE_LENGTH = 3; //16;
const MAX_TITLE_LENGTH = 64;
const MIN_CONTENT_LENGTH = 3; //32;
const MAX_CONTENT_LENGTH = 8192;

export default function CreatePost() {
  const [post, setPost] = useState({
    title: "",
    content: "",
  });
  const { userData } = useContext(AppContext);

  const updatePost = (key, value) => {
    setPost({
      ...post,
      [key]: value,
    });
  };

  const handleCreatePost = async () => {
    if (!userData || !userData.username) {
      return alert("User data not available. Please log in.");
    }

    if (
      post.title.length < MIN_TITLE_LENGTH ||
      post.title.length > MAX_TITLE_LENGTH
    ) {
      return alert(
        `Title length must be between ${MIN_TITLE_LENGTH} and ${MAX_TITLE_LENGTH} characters.`
      );
    }
    if (
      post.content.length < MIN_CONTENT_LENGTH ||
      post.content.length > MAX_CONTENT_LENGTH
    ) {
      return alert(
        `Content length must be between ${MIN_CONTENT_LENGTH} and ${MAX_CONTENT_LENGTH} characters.`
      );
    }

    try {
      await createPost(userData.username, post.title, post.content);
      setPost({ title: "", content: "" });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h1>Create Post</h1>
      <label htmlFor="title">Title: </label>
      <input
        value={post.title}
        onChange={(e) => updatePost("title", e.target.value)}
        type="text"
        name="title"
        id="title"
      />
      <br />
      <label htmlFor="content">Content: </label>
      <textarea
        value={post.content}
        onChange={(e) => updatePost("content", e.target.value)}
        name="content"
        id="content"
      />
      <br />
      <br />
      <button onClick={handleCreatePost}>Create</button>
    </div>
  );
}
