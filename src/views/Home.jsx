import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { getThreadsByFilterInOrder } from '../services/thread.service';
import { HOME_PAGE_CHART_COUNT, THREADS_PER_PAGE } from '../common/views.constants';
import ThreadList from '../components/ThreadList';
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
            Swal.fire('Error', 'Error fetching threads: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const mostCommentedTotalPages = Math.ceil(mostCommentedThreads.length / THREADS_PER_PAGE);
    const mostRecentTotalPages = Math.ceil(mostRecentThreads.length / THREADS_PER_PAGE);

    return (
        <div className="category-container">
            <ThreadList
                title={`Top ${HOME_PAGE_CHART_COUNT} Most Commented Threads`}
                threads={mostCommentedThreads}
                currentPage={mostCommentedCurrentPage}
                totalPages={mostCommentedTotalPages}
                onPageChange={setMostCommentedCurrentPage}
                loading={loading}
            />
            <ThreadList
                title={`Top ${HOME_PAGE_CHART_COUNT} Most Recent Threads`}
                threads={mostRecentThreads}
                currentPage={mostRecentCurrentPage}
                totalPages={mostRecentTotalPages}
                onPageChange={setMostRecentCurrentPage}
                loading={loading}
            />
        </div>
    );
}
