import { useEffect, useState } from 'react';
import { getThreadsByFilterInOrder } from '../services/thread.service';
import { HOME_PAGE_CHART_COUNT, THREADS_PER_PAGE } from '../common/views.constants';
import ThreadItem from '../components/ThreadItem';
import Pagination from '../components/Pagination';
import './CSS/Category.css';


export default function Home() {
    const [mostCommentedThreads, setMostCommentedThreads] = useState([]);
    const [mostRecentThreads, setMostRecentThreads] = useState([]);
    const [mostCommentedCurrentPage, setMostCommentedCurrentPage] = useState(1);
    const [mostRecentCurrentPage, setMostRecentCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchThreads();
    }, []);

    const fetchThreads = async () => {
        try {
            setLoading(true);
            const fetchedMostCommentedThreads = await getThreadsByFilterInOrder('replyCount', 'desc', HOME_PAGE_CHART_COUNT);
            setMostCommentedThreads(fetchedMostCommentedThreads.reverse());

            const fetchedMostRecentThreads = await getThreadsByFilterInOrder('createdAt', 'desc', HOME_PAGE_CHART_COUNT);
            setMostRecentThreads(fetchedMostRecentThreads.reverse());
        } catch (error) {
            console.error('Error fetching threads:', error);
        } finally {
            setLoading(false);
        }
    };

    const mostCommentedStartIndex = (mostCommentedCurrentPage - 1) * THREADS_PER_PAGE;
    const paginatedMostCommentedThreads = mostCommentedThreads.slice(mostCommentedStartIndex, mostCommentedStartIndex + THREADS_PER_PAGE);
    const mostCommentedTotalPages = Math.ceil(mostCommentedThreads.length / THREADS_PER_PAGE);

    const mostRecentStartIndex = (mostRecentCurrentPage - 1) * THREADS_PER_PAGE;
    const paginatedMostRecentThreads = mostRecentThreads.slice(mostRecentStartIndex, mostRecentStartIndex + THREADS_PER_PAGE);
    const mostRecentTotalPages = Math.ceil(mostRecentThreads.length / THREADS_PER_PAGE);

    return (
        <div className="category-container">
            <h1>Top {HOME_PAGE_CHART_COUNT} Most Commented Threads</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <ul className="threads">
                        {paginatedMostCommentedThreads.length > 0 ? (
                            paginatedMostCommentedThreads.map((thread) => (
                                <ThreadItem key={thread.id} thread={thread} />
                            ))
                        ) : (
                            <li>No threads available</li>
                        )}
                    </ul>
                    <div className="pagination-div" >
                        <Pagination
                            currentPage={mostCommentedCurrentPage}
                            totalPages={mostCommentedTotalPages}
                            onPageChange={(page) => setMostCommentedCurrentPage(page)}
                        />
                    </div>
                </>
            )}

            <h1>Top {HOME_PAGE_CHART_COUNT} Most Recent Threads</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <ul className="threads">
                        {paginatedMostRecentThreads.length > 0 ? (
                            paginatedMostRecentThreads.map((thread) => (
                                <ThreadItem key={thread.id} thread={thread} />
                            ))
                        ) : (
                            <li>No threads available</li>
                        )}
                    </ul>
                    <div className="pagination-div" >
                        <Pagination
                            currentPage={mostRecentCurrentPage}
                            totalPages={mostRecentTotalPages}
                            onPageChange={(page) => setMostRecentCurrentPage(page)}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
