import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../state/app.context';
import { useParams } from 'react-router-dom';
import { getThreadsByCategoryId, createThread, uploadThreadImages } from '../services/thread.service';
import { getCategoryById, addThreadIdToCategory } from '../services/category.service';
import { createOrUpdateThreadTag } from '../services/tag.service';
import { isUserBanned } from '../services/admin.service';
import { CONTENT_REGEX, TITLE_REGEX } from '../common/regex';
import { MAX_FILE_SIZE, MAX_IMAGES, THREADS_PER_PAGE } from '../common/views.constants';
import ThreadItem from '../components/ThreadItem';
import InfoButton from '../components/InfoButton';
import Pagination from '../components/Pagination';
import BeerButton from '../components/BeerButton';
import CustomFileInput from '../components/CustomFileInput';
import './CSS/Forum.css';

export default function Category() {
    const { categoryId } = useParams();
    const { user, userData } = useContext(AppContext);

    const [threads, setThreads] = useState([]);
    const [category, setCategory] = useState(null);
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [newThreadContent, setNewThreadContent] = useState('');
    const [newThreadTags, setNewThreadTags] = useState('');
    const [attachedImages, setAttachedImages] = useState([]);
    const [imageErrors, setImageErrors] = useState([]);
    const [showCreateThread, setShowCreateThread] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState('newest');

    useEffect(() => {
        fetchThreads();
    }, [currentPage, sortOrder]);

    const fetchThreads = async () => {
        try {
            const fetchedCategory = await getCategoryById(categoryId);
            setCategory(fetchedCategory);
            const fetchedThreads = await getThreadsByCategoryId(categoryId);
            sortThreads(fetchedThreads);
        } catch (error) {
            console.error('Error fetching threads:', error);
        }
    };

    const sortThreads = (threads) => {
        switch (sortOrder) {
            case 'newest':
                setThreads(threads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
                break;
            case 'oldest':
                setThreads(threads.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
                break;
            case 'mostCommented':
                setThreads(threads.sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0)));
                break;
            default:
                setThreads(threads);
        }
    };

    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = [];
        const errors = [];

        if (attachedImages.length + files.length > MAX_IMAGES) {
            errors.push(`You can only upload a maximum of ${MAX_IMAGES} images.`);
        }

        files.forEach((file) => {
            if (file.size > MAX_FILE_SIZE) {
                errors.push(`The file ${file.name} is too large.`);
            } else {
                newImages.push(file);
            }
        });

        setImageErrors(errors);
        setAttachedImages((prevImages) => [...prevImages, ...newImages].slice(0, MAX_IMAGES));
    };

    const handleRemoveImage = (index) => {
        setAttachedImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    const handleCreateThread = async () => {
        if (newThreadTitle.trim() && newThreadContent.trim()) {
            const banned = await isUserBanned(userData.uid);
            if (banned) {
                alert('You are banned from creating threads!');
                return;
            }
            const alertArr = [];
            if (!TITLE_REGEX.test(newThreadTitle)) {
                alertArr.push('Invalid title length, must be between 3 and 64 characters!');
            }
            if (!CONTENT_REGEX.test(newThreadContent)) {
                alertArr.push('Invalid content length, must be between 3 and 8192 characters!');
            }
            if (alertArr.length > 0) {
                alert(alertArr.join('\n'));
                return;
            }
            try {
                const tagsArray = [...new Set(newThreadTags.split(',')
                    .map(tag => tag.toLowerCase().trim())
                    .filter(tag => tag.length > 0)
                )];

                let imageUrls = [];

                if (attachedImages.length > 0) {
                    imageUrls = await uploadThreadImages(categoryId, attachedImages);
                }

                const newThreadId = await createThread(
                    categoryId,
                    newThreadTitle,
                    newThreadContent,
                    tagsArray,
                    user.uid,
                    userData.username,
                    imageUrls
                );

                await Promise.all(tagsArray.map(tag => createOrUpdateThreadTag(tag.toLowerCase(), newThreadId)));
                await addThreadIdToCategory(categoryId, newThreadId);

                fetchThreads();
                setNewThreadTitle('');
                setNewThreadContent('');
                setNewThreadTags('');
                setAttachedImages([]);
                setShowCreateThread(false);
            } catch (error) {
                console.error('Error creating thread:', error);
            }
        }
    };

    const startIndex = (currentPage - 1) * THREADS_PER_PAGE;
    const paginatedThreads = threads.slice(startIndex, startIndex + THREADS_PER_PAGE);
    const totalPages = Math.ceil(threads.length / THREADS_PER_PAGE);

    return (
        <div className="category-container">
            <h1>{category?.title || 'Loading...'}</h1>
            <ul className="threads">
                <div className="sort-bar">
                    <label htmlFor="sortOrder">Sort by: </label>
                    <select id="sortOrder" value={sortOrder} onChange={handleSortChange}>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="mostCommented">Most Commented</option>
                    </select>
                </div>
                {paginatedThreads.length > 0 ? (
                    paginatedThreads.map((thread) => (
                        <ThreadItem key={thread.id} thread={thread} />
                    ))
                ) : (
                    <li>No threads available</li>
                )}
                <div className="pagination-div" >
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
                {userData && (
                    <div className="admin-actions">
                        <BeerButton className="create-threads-beer-button"
                            text={showCreateThread ? 'Cancel' : 'Create Thread'}
                            onClick={() => {
                                if (!userData.isBanned) {
                                    setShowCreateThread(!showCreateThread);
                                } else {
                                    alert('You are banned from creating threads!');
                                }
                            }}
                        />
                        {showCreateThread && (
                            <div className="create-thread">
                                <InfoButton text="Title must be between 3 to 64 characters." />
                                <input
                                    type="text"
                                    value={newThreadTitle}
                                    onChange={(e) => setNewThreadTitle(e.target.value)}
                                    placeholder="New thread title"
                                />
                                <InfoButton text="Content must be between 3 to 8192 characters." />
                                <textarea
                                    value={newThreadContent}
                                    onChange={(e) => setNewThreadContent(e.target.value)}
                                    placeholder="New thread content"
                                />
                                <input
                                    type="text"
                                    value={newThreadTags}
                                    onChange={(e) => setNewThreadTags(e.target.value)}
                                    placeholder="Tags (comma-separated)"
                                />
                                <CustomFileInput text="Add Images" onChange={handleImageChange} />
                                {imageErrors.length > 0 && (
                                    <div className="image-errors">
                                        {imageErrors.map((error, index) => (
                                            <p key={index} className="error-message">{error}</p>
                                        ))}
                                    </div>
                                )}
                                <div className="image-previews">
                                    {attachedImages.map((image, index) => (
                                        <div key={index} className="image-preview">
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`Preview ${index + 1}`}
                                            />
                                            <button type="button" onClick={() => handleRemoveImage(index)}>Remove</button>
                                        </div>
                                    ))}
                                </div>
                                <BeerButton
                                    className="beer-button"
                                    onClick={handleCreateThread}
                                    text="Save">Save Thread</BeerButton>
                            </div>
                        )}
                    </div>
                )}
            </ul>
        </div>
    );
}
