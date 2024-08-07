import { useState, useEffect, useContext } from 'react';
import { createReply, getRepliesByThreadId } from '../services/reply.service';
import { AppContext } from '../state/app.context';
import PropTypes from 'prop-types';
import Reply from './Reply';
import './CSS/Replies.css';
import { updateRepliesCounter } from '../services/thread.service';

export default function Replies({ threadId }) {
    const { userData } = useContext(AppContext);

    const [replies, setReplies] = useState([]);
    const [replyContent, setReplyContent] = useState('');
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
                await updateRepliesCounter(threadId, 1);
                setReplyContent('');
                setFetchTrigger((prev) => !prev);
            } catch (error) {
                console.error('Error creating reply:', error);
            }
        }
    };

    return (
        <div className="replies-container">
            <h2>Replies</h2>
            <ul className="replies">
                {replies.map((reply) => (
                    <Reply key={reply.id} reply={reply} threadId={threadId} fetchReplies={fetchReplies} />
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

Replies.propTypes = {
    threadId: PropTypes.string.isRequired,
};
