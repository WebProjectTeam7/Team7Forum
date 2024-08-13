import PropTypes from 'prop-types';
import ThreadItem from './ThreadItem';
import Pagination from './Pagination';
import { THREADS_PER_PAGE } from '../common/views.constants';
import '../views/CSS/Category.css';

const ThreadList = ({ title, threads, currentPage, totalPages, onPageChange, loading }) => {
    const startIndex = (currentPage - 1) * THREADS_PER_PAGE;
    const paginatedThreads = threads.slice(startIndex, startIndex + THREADS_PER_PAGE);

    return (
        <div className="thread-list-section">
            <h1>{title}</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <ul className="threads">
                        {paginatedThreads.length > 0 ? (
                            paginatedThreads.map((thread) => (
                                <ThreadItem key={thread.id} thread={thread} />
                            ))
                        ) : (
                            <li>No threads available</li>
                        )}
                    </ul>
                    <div className="pagination-div">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={onPageChange}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

ThreadList.propTypes = {
    title: PropTypes.string.isRequired,
    threads: PropTypes.array.isRequired,
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
};

export default ThreadList;