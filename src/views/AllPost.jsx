import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../state/app.context";
import { getAllPosts } from "../services/post.service";

export default function AllPosts() {
  const [posts, setPosts] = useState([]);
  const { searchQuery } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    getAllPosts(searchQuery)
      .then((posts) => setPosts(posts))
      .catch((error) => alert(error.message));
  }, [searchQuery]);

  return (
    <div>
      <h1>Posts:</h1>
      {posts.length > 0
        ? posts.map((p) => (
            <p key={p.id}>
              {p.title}
              <button onClick={() => navigate(`/single-post/${p.id}`)}>
                See more
              </button>
            </p>
          ))
        : "No posts"}
    </div>
  );
}
