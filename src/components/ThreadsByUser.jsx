import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getThreadById, getThreadsByUsername } from '../services/thread.service';
import { getThreadsIdsByUsername } from '../services/reply.service';
import ThreadList from '../components/ThreadList';
import { THREADS_PER_PAGE } from '../common/views.constants';
import '../views/CSS/Category.css';

export default function ThreadsByUser({ username }) {
    const [threadsByUser, setThreadsByUser] = useState([]);
    const [threadsUserHasCommented, setThreadsUserHasCommented] = useState([]);
    const [threadsCurrentPage, setThreadsCurrentPage] = useState(1);
    const [commentsCurrentPage, setCommentsCurrentPage] = useState(1);
    const [threadsCount, setThreadsCount] = useState(0);
    const [repliesCount, setRepliesCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchThreads();
    }, []);

    const fetchThreads = async () => {
        try {
            setLoading(true);

            const fetchedThreads = await getThreadsByUsername(username);
            setThreadsCount(fetchedThreads.length);
            setThreadsByUser(fetchedThreads);

            const threadsIds = await getThreadsIdsByUsername(username);
            setRepliesCount(threadsIds.length);

            const fetchedCommentedThreads = await Promise.all(
                [...new Set(threadsIds)].map(async (threadId) => {
                    try {
                        return await getThreadById(threadId);
                    } catch (error) {
                        console.error(`Error fetching thread with ID ${threadId}:`, error);
                        return null;
                    }
                })
            );
            setThreadsUserHasCommented(fetchedCommentedThreads.filter(thread => thread !== null));
        } catch (error) {
            console.error('Error fetching threads:', error);
        } finally {
            setLoading(false);
        }
    };

    const threadsTotalPages = Math.ceil(threadsByUser.length / THREADS_PER_PAGE);
    const commentsTotalPages = Math.ceil(threadsUserHasCommented.length / THREADS_PER_PAGE);

    return (
        <div className="category-container">
            <div className="forum-activity">
                <h2>Forum Activity</h2>
                <p><strong>Threads Created:</strong> {threadsCount}</p>
                <p><strong>Replies:</strong> {repliesCount}</p>
            </div>
            <ThreadList
                title="Threads Created by User"
                threads={threadsByUser}
                currentPage={threadsCurrentPage}
                totalPages={threadsTotalPages}
                onPageChange={setThreadsCurrentPage}
                loading={loading}
            />
            <ThreadList
                title="Threads User Has Replied On"
                threads={threadsUserHasCommented}
                currentPage={commentsCurrentPage}
                totalPages={commentsTotalPages}
                onPageChange={setCommentsCurrentPage}
                loading={loading}
            />
        </div>
    );
}

ThreadsByUser.propTypes = {
    username: PropTypes.string.isRequired,
};
