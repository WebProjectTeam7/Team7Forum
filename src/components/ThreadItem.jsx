import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../views/CSS/Category.css';

const ThreadItem = ({ thread }) => {
    return (
        <li key={thread.id} className="thread-item">
            <div className="thread-info">
                <img src="\src\image\thread-image.jpg" alt="Thread" className="thread-image" />
                <div>
                    <p className="thread-author">{thread.author}</p>
                </div>
            </div>
            <div className="thread-content">
                <h3>
                    <Link to={`/forum/thread/${thread.id}`}>{thread.title}</Link>
                </h3>
                <p>{thread.content.substring(0, 100)}...</p>
                <div className="thread-stats">
                    <span>Author: {thread.authorName}</span>
                    <span>Created on: {new Date(thread.createdAt).toLocaleDateString()}</span>
                    <span>Replies: {thread.repliesCount || 0}</span>
                    <span>Upvotes: {thread.upvotes && thread.upvotes.length || 0}</span>
                    <span>Downvotes: {thread.downvotes && thread.downvotes.length || 0}</span>
                    <span>Views: {thread.views || 0}</span>
                </div>
            </div>
        </li>
    );
};

ThreadItem.propTypes = {
    thread: PropTypes.shape({
        id: PropTypes.string.isRequired,
        author: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        authorName: PropTypes.string,
        createdAt: PropTypes.string.isRequired,
        repliesCount: PropTypes.number,
        upvotes: PropTypes.arrayOf(PropTypes.string),
        downvotes: PropTypes.arrayOf(PropTypes.string),
        views: PropTypes.number,
    }).isRequired,
};

export default ThreadItem;
