import { useState, useEffect, useContext } from 'react';
import { createReply, getRepliesByThreadId, updateReply, deleteReply, handleReplyVote } from '../services/reply.service';
import { AppContext } from '../state/app.context';
import './CSS/Replies.css';
import UpvoteDownvote from './UpvoteDownvote';

export default function Replies({ threadId }) {
    const { userData } = useContext(AppContext);

    const [replies, setReplies] = useState([]);
    const [replyContent, setReplyContent] = useState('');
    const [editReplyId, setEditReplyId] = useState(null);
    const [editReplyContent, setEditReplyContent] = useState('');

    useEffect(() => {
        const fetchReplies = async () => {
            try {
                const fetchedReplies = await getRepliesByThreadId(threadId);
                setReplies(fetchedReplies);
            } catch (error) {
                console.error('Error fetching replies:', error);
            }
        };

        fetchReplies();
    }, [threadId]);

    const handleCreateReply = async () => {
        try {
            const userId = userData.uid;
            const newReplyId = await createReply(threadId, userId, replyContent);
            setReplies([...replies, { id: newReplyId, content: replyContent, userId, createdAt: new Date().toISOString() }]);
            setReplyContent('');
        } catch (error) {
            console.error('Error creating reply:', error);
        }
    };

    const handleEditReply = async (replyId) => {
        try {
            await updateReply(replyId, { content: editReplyContent });
            setReplies(replies.map(reply => reply.id === replyId ? { ...reply, content: editReplyContent } : reply));
            setEditReplyId(null);
            setEditReplyContent('');
        } catch (error) {
            console.error('Error editing reply:', error);
        }
    };

    const handleDeleteReply = async (replyId) => {
        if (window.confirm('Are you sure you want to delete this reply?')) {
            try {
                await deleteReply(threadId, replyId);
                setReplies(replies.filter(reply => reply.id !== replyId));
            } catch (error) {
                console.error('Error deleting reply:', error);
            }
        }
    };

    return (
        <div>
            <h2>Replies</h2>
            <ul className="replies">
                {replies.map((reply) => (
                    <li key={reply.id}>
                        <div>
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
                                    <UpvoteDownvote parentComponentId={reply.id} handleVote={handleReplyVote} />
                                    <button onClick={() => {
                                        setEditReplyId(reply.id);
                                        setEditReplyContent(reply.content);
                                    }}>Edit</button>
                                    <button onClick={() => handleDeleteReply(reply.id)}>Delete</button>
                                </div>
                            )}
                        </div>
                    </li>
                ))}
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
