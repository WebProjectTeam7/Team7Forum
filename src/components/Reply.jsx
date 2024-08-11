import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../state/app.context';
import PropTypes from 'prop-types';
import { updateReply, deleteReply, reportReply } from '../services/reply.service';
import { removeReplyIdFromThread } from '../services/thread.service';
import { getUserByUsername } from '../services/users.service';
import UserRoleEnum from '../common/role.enum';
import UserInfo from './UserInfo';
import EditButton from './EditButton';
import DeleteButton from './DeleteButton';
import VoteButtons from './VoteButtons';
import './CSS/Replies.css';

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
                await removeReplyIdFromThread(threadId, replyId);
                fetchReplies();
            } catch (error) {
                console.error('Error deleting reply:', error);
            }
        }
    };

    const handleReportReply = async () => {
        const reason = prompt('Please enter the reason for reporting this reply:');
        if (reason) {
            try {
                await reportReply(reply.id, userData.username, reply.content, reason);
                alert('Reply reported successfully.');
            } catch (error) {
                console.error('Error reporting reply:', error);
            }
        }
    };

    let userVote = 0;
    if (userData) {
        if (reply.upvotes?.includes(userData.username)) {
            userVote = 1;
        } else if (reply.downvotes?.includes(userData.username)) {
            userVote = -1;
        }
    }

    return (
        <li className="reply-item">
            <div className="reply-body">
                <UserInfo userAuthor={userAuthor} />
                <div className="reply-content">
                    {editReplyId === reply.id ? (
                        <div className="edit-reply">
                            <input
                                type="text"
                                value={editReplyContent}
                                onChange={(e) => setEditReplyContent(e.target.value)}
                            />
                            <button onClick={() => handleEditReply(reply.id)}>Save</button>
                            <button onClick={() => setEditReplyId(null)}>Cancel</button>
                        </div>
                    ) : (
                        <div className="reply-text">
                            <p>{reply.content}</p>
                            <p className="thread-dates">
                                Created At: {new Date(reply.createdAt).toLocaleString().slice(0, -3)}
                                {reply.updatedAt && (
                                    <> | Last Edited: {new Date(reply.updatedAt).toLocaleString().slice(0, -3)}</>
                                )}
                            </p>
                        </div>
                    )}
                    <div className="reply-actions">
                        <VoteButtons
                            itemId={reply.id}
                            itemType="reply"
                            fetchItem={fetchReplies}
                            initialUserVote={userVote}
                            upvotes={reply.upvotes?.length || 0}
                            downvotes={reply.downvotes?.length || 0}
                        />
                        <div className="edit-delete-report-buttons">
                            {userData && (
                                <button className="report-button" onClick={handleReportReply}>Report</button>
                            )}
                            {(userData && (userData.role === UserRoleEnum.ADMIN || userData.username === reply.author)) && (
                                <>
                                    <EditButton onClick={() => {
                                        setEditReplyId(reply.id);
                                        setEditReplyContent(reply.content);
                                    }} />
                                    <DeleteButton onClick={() => handleDeleteReply(reply.id)} />
                                </>
                            )}
                        </div>
                    </div>
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
        createdAt: PropTypes.string.isRequired,
        updatedAt: PropTypes.string,
        upvotes: PropTypes.arrayOf(PropTypes.string),
        downvotes: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    threadId: PropTypes.string.isRequired,
    fetchReplies: PropTypes.func.isRequired,
};

export default Reply;
