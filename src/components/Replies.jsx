import { useState, useEffect, useContext } from 'react';
import { createReply, getRepliesByThreadId } from '../services/reply.service';
import { AppContext } from '../state/app.context';
import { addReplyIdToThread } from '../services/thread.service';
import Reply from './Reply';
import Pagination from './Pagination';
import PropTypes from 'prop-types';
import './CSS/Replies.css';
import { isUserBanned } from '../services/users.service';

const REPLIES_PER_PAGE = 3;

export default function Replies({ threadId }) {
    const { userData } = useContext(AppContext);

    const [replies, setReplies] = useState([]);
    const [replyContent, setReplyContent] = useState('');
    const [fetchTrigger, setFetchTrigger] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchReplies();
    }, [fetchTrigger, currentPage]);

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
            const banned = await isUserBanned(userData.uid);

            if (banned) {
                alert('You are banned from posting replies!');
                return;
            }

            try {
                const replyId = await createReply(threadId, userData.username, replyContent);
                await addReplyIdToThread(threadId, replyId);
                setReplyContent('');
                setFetchTrigger((prev) => !prev);
            } catch (error) {
                console.error('Error creating reply:', error);
            }
        }
    };

    const startIndex = (currentPage - 1) * REPLIES_PER_PAGE;
    const paginatedReplies = replies.slice(startIndex, startIndex + REPLIES_PER_PAGE);
    const totalPages = Math.ceil(replies.length / REPLIES_PER_PAGE);

    return (
        <div className="replies-container">
            <h2>Replies</h2>
            <ul className="replies">
                {paginatedReplies.map((reply) => (
                    <Reply key={reply.id} reply={reply} threadId={threadId} fetchReplies={fetchReplies} />
                ))}
            </ul>

            {userData && (
                <div className="reply-input">
                    <input
                        type="text"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Add a reply"
                    />
                    <button onClick={handleCreateReply}>Add Reply</button>
                </div>
            )}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
            />
        </div>
    );
}

Replies.propTypes = {
    threadId: PropTypes.string.isRequired,
};
