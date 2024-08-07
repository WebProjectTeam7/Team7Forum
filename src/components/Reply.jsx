import { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaArrowAltCircleDown, FaArrowAltCircleUp } from 'react-icons/fa';
import { AppContext } from '../state/app.context';
import UserRoleEnum from '../common/role.enum';
import { handleReplyVote, updateReply, deleteReply } from '../services/reply.service';
import { updateRepliesCounter } from '../services/thread.service';
import { getUserByUsername } from '../services/users.service';
import './CSS/Replies.css';
import UserInfo from './UserInfo';

const Reply = ({ reply, threadId, fetchReplies }) => {
    const { userData } = useContext(AppContext);
    const [editReplyId, setEditReplyId] = useState(null);
    const [editReplyContent, setEditReplyContent] = useState(reply.content);
    const [userAuthor, setUserAuthor] = useState({});

    useEffect(() => {
        fetchUserAuthor(reply.author);
    }, [reply.author]);

    const fetchUserAuthor = async (username) => {
        try {
            const user = await getUserByUsername(username);
            setUserAuthor(user);
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };


    const handleEditReply = async (replyId) => {
        if (editReplyContent.trim()) {
            try {
                await updateReply(replyId, { content: editReplyContent });
                setEditReplyId(null);
                setEditReplyContent('');
                fetchReplies();
            } catch (error) {
                console.error('Error editing reply:', error);
            }
        }
    };

    const handleDeleteReply = async (replyId) => {
        if (window.confirm('Are you sure you want to delete this reply?')) {
            try {
                await deleteReply(replyId);
                await updateRepliesCounter(threadId, -1);
                fetchReplies();
            } catch (error) {
                console.error('Error deleting reply:', error);
            }
        }
    };

    const handleVote = async (replyId, currentVote, voteType) => {
        const newVote = currentVote === voteType ? 0 : voteType;
        try {
            await handleReplyVote(replyId, newVote, userData.username);
            fetchReplies();
        } catch (error) {
            console.error(`Error handling ${voteType === 1 ? 'upvote' : 'downvote'}`, error);
        }
    };

    const userVote = reply.upvotes?.includes(userData.username) ? 1 : reply.downvotes?.includes(userData.username) ? -1 : 0;

    return (
        <li className="reply-item">
            <div className="reply-body">
                <UserInfo userAuthor={userAuthor} />
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
                                    <p>Created At: {new Date(reply.createdAt).toLocaleDateString()}</p>
                                    {reply.updatedAt && <p>Last Edited: {new Date(reply.updatedAt).toLocaleDateString()}</p>}
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
};

Reply.propTypes = {
    reply: PropTypes.shape({
        id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        author: PropTypes.string.isRequired,
        authorAvatar: PropTypes.string,
        createdAt: PropTypes.string.isRequired,
        updatedAt: PropTypes.string,
        upvotes: PropTypes.arrayOf(PropTypes.string),
        downvotes: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    threadId: PropTypes.string.isRequired,
    fetchReplies: PropTypes.func.isRequired,
};

export default Reply;
