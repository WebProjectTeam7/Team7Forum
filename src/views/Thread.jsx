import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getThreadById, updateThread, deleteThread, handleThreadVote } from '../services/thread.service';
import { AppContext } from '../state/app.context';
import Replies from '../components/Replies';
import UserRoleEnum from '../common/role.enum';
import './CSS/Thread.css';
import UpvoteDownvote from '../components/UpvoteDownvote';

export default function Thread() {
    const { threadId } = useParams();
    const { userData } = useContext(AppContext);
    const navigate = useNavigate();

    const [thread, setThread] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editThreadTitle, setEditThreadTitle] = useState('');
    const [editThreadContent, setEditThreadContent] = useState('');

    useEffect(() => {
        const fetchThread = async () => {
            try {
                const fetchedThread = await getThreadById(threadId);
                setThread(fetchedThread);
                setEditThreadTitle(fetchedThread.title);
                setEditThreadContent(fetchedThread.content);
            } catch (error) {
                console.error('Error fetching thread:', error);
            }
        };

        fetchThread();
    }, [threadId]);

    const handleEditThread = async () => {
        try {
            const updatedData = { title: editThreadTitle, content: editThreadContent };
            await updateThread(threadId, updatedData);
            setThread({ ...thread, ...updatedData });
            setEditMode(false);
        } catch (error) {
            console.error('Error editing thread:', error);
        }
    };

    const handleDeleteThread = async () => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteThread(threadId);
                console.log(`Thread with ID ${threadId} deleted successfully.`);
                navigate('/forum');
            } catch (error) {
                console.error('Error deleting thread:', error);
            }
        }
    };

    if (!thread) {
        return <div>Loading...</div>;
    }

    return (
        <div className="thread-container">
            <div className="thread-header">
                <h1>{thread.title}</h1>
                {(userData.role === UserRoleEnum.ADMIN || userData.username === thread.author) && (
                    <div>
                        <button onClick={() => setEditMode(true)}>Edit Thread</button>
                        <button onClick={handleDeleteThread}>Delete Thread</button>
                    </div>
                )}
            </div>
            <div className="thread-content">
                <p>{thread.content}</p>
                <UpvoteDownvote parentComponentId={threadId} handleVote={handleThreadVote} />
            </div>

            {(userData.role === UserRoleEnum.ADMIN || userData.username === thread.author) && editMode && (
                <div className="thread-edit">
                    <input
                        type="text"
                        value={editThreadTitle}
                        onChange={(e) => setEditThreadTitle(e.target.value)}
                        placeholder="Edit thread title"
                    />
                    <textarea
                        value={editThreadContent}
                        onChange={(e) => setEditThreadContent(e.target.value)}
                        placeholder="Edit thread content"
                    />
                    <button onClick={handleEditThread}>Save Changes</button>
                    <button onClick={() => setEditMode(false)}>Cancel</button>
                </div>
            )}

            <Replies threadId={threadId} />
        </div>
    );
}
