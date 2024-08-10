import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getThreadsByTitleExact, getThreadsByTitleMatch, getThreadsByContentMatch, getThreadById, } from '../services/thread.service';
import { getUserByUsername, getUsersByUsernameMatch } from '../services/users.service';
import { getThreadsIdsByTag } from '../services/tag.service';

export default function Search() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('thread-title-exact');
    const navigate = useNavigate();

    const handleSearch = async () => {
        if (searchQuery.trim() === '') {
            return;
        }

        try {
            let result = {
                threads: [],
                users: [],
            };

            if (filter === 'thread-title-exact' || filter === 'All') {
                const exactResults = await getThreadsByTitleExact(searchQuery);
                result.threads = result.threads.concat(exactResults);
            }

            if (filter === 'thread-title-match' || filter === 'All') {
                const matchResults = await getThreadsByTitleMatch(searchQuery);
                result.threads = result.threads.concat(matchResults);
            }

            if (filter === 'thread-content-match' || filter === 'All') {
                const contentResults = await getThreadsByContentMatch(searchQuery);
                result.threads = result.threads.concat(contentResults);
            }

            if (filter === 'thread-tags' || filter === 'All') {
                const tags = searchQuery.split(',').map(tag => tag.trim());
                const threadIdsArray = await Promise.all(tags.map(async (tag) => await getThreadsIdsByTag(tag)));
                const threadIds = threadIdsArray.flat();
                const threads = await Promise.all(threadIds.map(threadId => getThreadById(threadId)));
                result.threads = result.threads.concat(threads);
            }

            if (filter === 'user-username-exact') {
                const userResult = await getUserByUsername(searchQuery);
                result.users = result.users.concat(userResult);
            }

            if (filter === 'user-username-match' || filter === 'All') {
                const userMatchResults = await getUsersByUsernameMatch(searchQuery);
                result.users = result.users.concat(userMatchResults);
            }

            navigate('/search-results', { state: { results: result } });
        } catch (err) {
            console.error('Error searching for results:', err);
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Enter search query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="thread-title-exact">Thread Title (Exact)</option>
                <option value="thread-title-match">Thread Title (Match)</option>
                <option value="thread-content-match">Thread Content (Match)</option>
                <option value="thread-tags">Thread Tags</option>
                <option value="user-username-exact">Username (Exact)</option>
                <option value="user-username-match">Username (Match)</option>
            </select>

            <button onClick={handleSearch}> Search</button>
        </div>
    );
}
