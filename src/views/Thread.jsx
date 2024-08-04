import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getThreadById, editThread, deleteThread } from '../services/thread.service';
import { createReply, getRepliesByThreadId, editReply, deleteReply } from '../services/reply.service';
import './CSS/Thread.css';

export default function Thread() {
    const { threadId } = useParams();
    const [thread, setThread] = useState(null);
    const [replies, setReplies] = useState([]);
    const [replyContent, setReplyContent] = useState('');
    const [editReplyId, setEditReplyId] = useState(null);
    const [editReplyContent, setEditReplyContent] = useState('');

    useEffect(() => {
        const fetchThreadAndReplies = async () => {
            try {
                const fetchedThread = await getThreadById(threadId);
                setThread(fetchedThread);
                const fetchedReplies = await getRepliesByThreadId(threadId);
                setReplies(fetchedReplies);
            } catch (error) {
                console.error('Error fetching thread or replies:', error);
            }
        };

        fetchThreadAndReplies();
    }, [threadId]);

    const handleCreateReply = async () => {
        try {
            const userId = 'exampleUserId'; // Replace with actual user ID
            const newReplyId = await createReply(threadId, userId, replyContent);
            setReplies([...replies, { id: newReplyId, content: replyContent }]);
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

    const handleEditThread = async () => {
        try {
            const updatedData = { title: 'New Title', content: 'Updated content' }; // Modify as needed
            await editThread(threadId, updatedData);
            setThread({ ...thread, ...updatedData });
        } catch (error) {
            console.error('Error editing thread:', error);
        }
    };

    const handleDeleteThread = async () => {
        try {
            await deleteThread(threadId);
            console.log(`Thread with ID ${threadId} deleted successfully.`);
        } catch (error) {
            console.error('Error deleting thread:', error);
        }
    };

    if (!thread) {
        return <div>Loading...</div>;
    }

    return (
        <div className="thread-container">
            <div className="thread-header">
                <h1>{thread.title}</h1>
                <div>
                    <button onClick={handleEditThread}>Edit Thread</button>
                    <button onClick={handleDeleteThread}>Delete Thread</button>
                </div>
            </div>
            <div className="thread-content">
                <p>{thread.content}</p>
            </div>

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
        </div>
    );
}
