import { useEffect, useState } from 'react';
import { getThreadsByFilterInOrder } from '../services/thread.service';
import './CSS/Category.css';
import ThreadItem from '../components/ThreadItem';

export default function Home() {
    const [mostCommentedThreads, setMostCommentedThreads] = useState([]);
    const [mostRecentThreads, setMostRecentThreads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchThreads();
    }, []);

    const fetchThreads = async () => {
        try {
            setLoading(true);
            const fetchedMostCommentedThreads = await getThreadsByFilterInOrder('replyCount', 'desc', 5);
            setMostCommentedThreads(fetchedMostCommentedThreads.reverse());

            const fetchedMostRecentThreads = await getThreadsByFilterInOrder('createdAt', 'desc', 5);
            setMostRecentThreads(fetchedMostRecentThreads.reverse());
        } catch (error) {
            console.error('Error fetching threads:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="category-container">
            <h1>Top 10 Most Commented Threads</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul className="threads">
                    {mostCommentedThreads.length > 0 ? (
                        mostCommentedThreads.map((thread) => (
                            <ThreadItem key={thread.id} thread={thread} />
                        ))
                    ) : (
                        <li>No threads available</li>
                    )}
                </ul>
            )}

            <h1>Top 10 Most Recent Threads</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul className="threads">
                    {mostRecentThreads.length > 0 ? (
                        mostRecentThreads.map((thread) => (
                            <ThreadItem key={thread.id} thread={thread} />
                        ))
                    ) : (
                        <li>No threads available</li>
                    )}
                </ul>
            )}
        </div>
    );
}
