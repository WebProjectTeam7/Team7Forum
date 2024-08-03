import { useContext } from "react";
import { AppContext } from "../state/app.context"; // Ensure correct import

export default function Post({ post }) {
    const { userData } = useContext(AppContext);

    return (
        <div>
            <h3>{post.title}</h3>
            <p>Created on: {new Date(post.createdOn).toLocaleDateString()}</p>
            <p>{post.content}</p>
            <button>Upvote</button>
            <button>Downvote</button>
        </div>
    );
}
