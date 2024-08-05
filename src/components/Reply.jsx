import { useState } from 'react';
import { createReply, editReply, deleteReply } from '../services/reply.service';
import '../views/CSS/Thread.css';

export default function Reply({ threadId, replies, setReplies, userId, username }) {
    const [replyContent, setReplyContent] = useState('');
    const [editReplyId, setEditReplyId] = useState(null);
    const [editReplyContent, setEditReplyContent] = useState('');

    const handleCreateReply = async () => {
        try {
            const newReplyId = await createReply(threadId, userId, replyContent);
            setReplies([...replies, { id: newReplyId, content: replyContent, author: username }]);
            setReplyContent('');
        } catch (error) {
            console.error('Error creating reply:', error);
        }
    };

    const handleEditReply = async (replyId) => {
        try {
            await editReply(threadId, replyId, { content: editReplyContent });
            setReplies(replies.map(reply => reply.id === replyId ? { ...reply, content: editReplyContent } : reply));
            setEditReplyId(null);
            setEditReplyContent('');
        } catch (error) {
            console.error('Error editing reply:', error);
        }
    };

    const handleDeleteReply = async (replyId) => {
        try {
            await deleteReply(threadId, replyId);
            setReplies(replies.filter(reply => reply.id !== replyId));
        } catch (error) {
            console.error('Error deleting reply:', error);
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
                                    <p><strong>Author:</strong> {reply.author}</p>
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
