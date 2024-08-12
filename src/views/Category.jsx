import { useEffect, useState, useContext } from 'react';
import { AppContext } from '../state/app.context';
import { useParams } from 'react-router-dom';
import { getThreadsByCategoryId, createThread, uploadThreadImages } from '../services/thread.service';
import { getCategoryById, addThreadIdToCategory } from '../services/category.service';
import { createOrUpdateThreadTag } from '../services/tag.service';
import { isUserBanned } from '../services/admin.service';
import { CONTENT_REGEX, TITLE_REGEX } from '../common/regex';
import { MAX_FILE_SIZE, MAX_IMAGES } from '../common/views.constants';
import ThreadItem from '../components/ThreadItem';
import InfoButton from '../components/InfoButton';
import './CSS/Category.css';


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

    useEffect(() => {
        fetchThreads();
    }, []);

    const fetchThreads = async () => {
        try {
            const fetchedCategory = await getCategoryById(categoryId);
            setCategory(fetchedCategory);
            const fetchedThreads = await getThreadsByCategoryId(categoryId);
            setThreads(fetchedThreads);
        } catch (error) {
            console.error('Error fetching threads:', error);
        }
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

    return (
        <div className="category-container">
            <h1>{category?.title || 'Loading...'}</h1>
            <ul className="threads">
                {threads.length > 0 ? (
                    threads.map((thread) => (
                        <ThreadItem key={thread.id} thread={thread} />
                    ))
                ) : (
                    <li>No threads available</li>
                )}
                {userData && (
                    <div className="admin-actions">
                        <button onClick={() => setShowCreateThread(!showCreateThread)}>
                            {showCreateThread ? 'Cancel' : 'Create Thread'}
                        </button>
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
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    multiple
                                />
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
                                <button onClick={handleCreateThread}>Save Thread</button>
                            </div>
                        )}
                    </div>
                )}
            </ul>
        </div>
    );
}
