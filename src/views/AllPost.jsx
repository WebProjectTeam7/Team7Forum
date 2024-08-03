import { useEffect, useState } from "react";
import { getAllPosts } from "../services/post.service";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AllPosts() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";

  useEffect(() => {
    getAllPosts(search)
      .then((posts) => setPosts(posts))
      .catch((error) => alert(error.message));
  }, [search]);

  const setSearch = (value) => {
    setSearchParams({
      search: value,
    });
  };

  return (
    <div>
      <h1>Posts:</h1>
      <label htmlFor="search">Search Posts:</label>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        type="text"
        name="search"
        id="search"
      />
      <br />
      <br />
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
