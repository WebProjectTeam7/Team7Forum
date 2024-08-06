import { useState, useEffect, useContext } from 'react';
import { createReply, getRepliesByThreadId, updateReply, deleteReply, handleReplyVote } from '../services/reply.service';
import { AppContext } from '../state/app.context';
import PropTypes from 'prop-types';
import './CSS/Replies.css';
import { FaArrowAltCircleDown, FaArrowAltCircleUp } from 'react-icons/fa';
import UserRoleEnum from '../common/role.enum';

export default function Replies({ threadId }) {
    const { userData } = useContext(AppContext);

    const [replies, setReplies] = useState([]);
    const [replyContent, setReplyContent] = useState('');
    const [editReplyId, setEditReplyId] = useState(null);
    const [editReplyContent, setEditReplyContent] = useState('');
    const [fetchTrigger, setFetchTrigger] = useState(false);

    useEffect(() => {
        fetchReplies();
    }, [fetchTrigger]);

    const fetchReplies = async () => {
        try {
            const fetchedReplies = await getRepliesByThreadId(threadId);
            setReplies(fetchedReplies);
        } catch (error) {
            console.error('Error fetching replies:', error);
        }
    };

    const handleCreateReply = async () => {
        if (replyContent.trim()) {
            try {
                await createReply(threadId, userData.username, replyContent);
                setReplyContent('');
                setFetchTrigger((prev) => !prev);
            } catch (error) {
                console.error('Error creating reply:', error);
            }
        }
    };

    const handleEditReply = async (replyId) => {
        if (editReplyContent.trim()) {
            try {
                await updateReply(threadId, replyId, { content: editReplyContent });
                setEditReplyId(null);
                setEditReplyContent('');
                setFetchTrigger((prev) => !prev);
            } catch (error) {
                console.error('Error editing reply:', error);
            }
        }
    };

    const handleDeleteReply = async (replyId) => {
        if (window.confirm('Are you sure you want to delete this reply?')) {
            try {
                await deleteReply(threadId, replyId);
                setFetchTrigger((prev) => !prev);
            } catch (error) {
                console.error('Error deleting reply:', error);
            }
        }
    };

    const handleVote = async (replyId, currentVote, voteType) => {
        const newVote = currentVote === voteType ? 0 : voteType;
        try {
            await handleReplyVote(threadId, replyId, newVote, userData.username);
            setFetchTrigger((prev) => !prev);
        } catch (error) {
            console.error(`Error handling ${voteType === 1 ? 'upvote' : 'downvote'}`, error);
        }
    };

    return (
        <div className="replies-container">
            <h2>Replies</h2>
            <ul className="replies">
                {replies.map((reply) => {
                    const userVote = reply.upvotes?.includes(userData.username) ? 1 :
                        reply.downvotes?.includes(userData.username) ? -1 : 0;

                    return (
                        <li key={reply.id} className="reply-item">
                            <div className="reply-body">
                                <div className="reply-info">
                                    <img src={reply.authorAvatar} alt="Author Avatar" className="author-avatar" />
                                    <div className="reply-author-date">
                                        <p>Author: {reply.author}</p>
                                        <p>Created At: {new Date(reply.createdAt).toLocaleDateString()}</p>
                                        {reply.updatedAt && <p>Last Edited: {new Date(reply.updatedAt).toLocaleDateString()}</p>}
                                    </div>
                                </div>
                                <div className="reply-content">
                                    {editReplyId === reply.id ? (
                                        <div>
                                            <input
                                                type="text"
                                                value={editReplyContent}
                                                onChange={(e) => setEditReplyContent(e.target.value)}
                                            />
                                            <button onClick={() => handleEditReply(reply.id)}>Save</button>
                                            <button onClick={() => setEditReplyId(null)}>Cancel</button>
                                        </div>
                                    ) : (
                                        <div>
                                            <p>{reply.content}</p>
                                            <div className="reply-actions">
                                                <div className="upvote-downvote">
                                                    <div onClick={() => handleVote(reply.id, userVote, 1)} className={`upvote-button ${userVote === 1 ? 'active' : ''}`}>
                                                        <FaArrowAltCircleUp />
                                                    </div>
                                                    <span>Upvotes: {reply.upvotes ? reply.upvotes.length : 0}</span>
                                                    <div onClick={() => handleVote(reply.id, userVote, -1)} className={`downvote-button ${userVote === -1 ? 'active' : ''}`}>
                                                        <FaArrowAltCircleDown />
                                                    </div>
                                                    <span>Downvotes: {reply.downvotes ? reply.downvotes.length : 0}</span>
                                                </div>
                                                {(userData.role === UserRoleEnum.ADMIN || userData.username === reply.author) && (
                                                    <div className="edit-delete-buttons">
                                                        <button onClick={() => handleDeleteReply(reply.id)}>Delete</button>
                                                        <button onClick={() => {
                                                            setEditReplyId(reply.id);
                                                            setEditReplyContent(reply.content);
                                                        }}>Edit</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
            <div className="reply-input">
                <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Add a reply"
                />
                <button onClick={handleCreateReply}>Add Reply</button>
            </div>
        </div>
    );
}

Replies.propTypes = {
    threadId: PropTypes.string.isRequired,
};
