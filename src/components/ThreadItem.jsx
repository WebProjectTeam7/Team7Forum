import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './CSS/ThreadItem.css';
import { getThreadImageUrl } from '../services/users.service';
import { useEffect, useState } from 'react';

const ThreadItem = ({ thread }) => {
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        const fetchImageUrl = async () => {
            const url = await getThreadImageUrl();
            if (url) {
                setImageUrl(url);
            }
        };

        fetchImageUrl();
    }, []);

    return (
        <li key={thread.id} className="thread-item">
            <div className="thread-info">
                <div className="thread-image-container">
                    {imageUrl ? (
                        <img src={imageUrl} alt="Thread" className="thread-image" />
                    ) : (
                        <div className="thread-image-placeholder">Loading...</div>
                    )}
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
                    <span>Replies: {thread.replyCount || 0}</span>
                    <span>Upvotes: {thread.upvotes?.length || 0}</span>
                    <span>Downvotes: {thread.downvotes?.length || 0}</span>
                    <span>Views: {thread.views || 0}</span>
                </div>
            </div>
        </li>
    );
};

ThreadItem.propTypes = {
    thread: PropTypes.shape({
        id: PropTypes.string.isRequired,
        author: PropTypes.string,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        authorName: PropTypes.string,
        createdAt: PropTypes.string.isRequired,
        replyCount: PropTypes.number,
        upvotes: PropTypes.arrayOf(PropTypes.string),
        downvotes: PropTypes.arrayOf(PropTypes.string),
        views: PropTypes.number,
    }).isRequired,
};

export default ThreadItem;
