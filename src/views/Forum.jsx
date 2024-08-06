import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/category.service';
import { AppContext } from '../state/app.context';
import { getThreadsByCategoryId } from '../services/thread.service';
import UserRoleEnum from '../common/role.enum';
import './CSS/Forum.css';

const THREADS_LIMIT_BY_CATEGORY = 3;

export default function Forum() {
    const { userData } = useContext(AppContext);
    const isAdmin = userData && userData.role === UserRoleEnum.ADMIN;

    const [categories, setCategories] = useState([]);
    const [newCategoryTitle, setNewCategoryTitle] = useState('');
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [editCategoryTitle, setEditCategoryTitle] = useState('');
    const [showCreateCategory, setShowCreateCategory] = useState(false);

    useEffect(() => {
        getCategories()
            .then((c) => {
                return Promise.all(
                    c.map((category) => {
                        return getThreadsByCategoryId(category.id, THREADS_LIMIT_BY_CATEGORY)
                            .then((threads) => {
                                return { ...category, threads };
                            });
                    })
                );
            })
            .then((categoriesWithThreads) => {
                setCategories(categoriesWithThreads);
            })
            .catch((error) => {
                console.error('Error fetching categories:', error);
            });
    }, [categories]);

    const handleCreateCategory = () => {
        if (newCategoryTitle.trim()) {
            createCategory(newCategoryTitle)
                .then((newCategoryId) => {
                    setCategories([...categories, { id: newCategoryId, title: newCategoryTitle, threads: [] }]);
                    setNewCategoryTitle('');
                    setShowCreateCategory(false);
                })
                .catch((error) => console.error('Error creating category:', error));
        }
    };

    const handleEditCategory = (categoryId) => {
        if (editCategoryTitle.trim()) {
            updateCategory(categoryId, editCategoryTitle)
                .then(() => {
                    setCategories(categories.map(category =>
                        category.id === categoryId ? { ...category, title: editCategoryTitle } : category
                    ));
                    setEditCategoryId(null);
                    setEditCategoryTitle('');
                })
                .catch((error) => console.error('Error updating category:', error));
        }
    };

    const handleDeleteCategory = (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            deleteCategory(categoryId)
                .then(() => {
                    setCategories(categories.filter(category => category.id !== categoryId));
                })
                .catch((error) => console.error('Error deleting category:', error));
        }
    };

    return (
        <div className="forum-container">
            <h1>Forum</h1>
            {categories.map((category) => (
                <div key={category.id} className="category">
                    <div className="category-title-row">
                        <h2 className="category-title">
                            <Link to={`/forum/category/${category.id}`}>{category.title}</Link>
                        </h2>
                        <div className="category-meta">
                            <span>Number of Threads: {category.threads.length}</span>
                            {isAdmin && (
                                <div className="category-buttons">
                                    <button onClick={() => {
                                        setEditCategoryId(category.id);
                                        setEditCategoryTitle(category.title);
                                    }} className="small-button">Edit</button>
                                    <button className="delete-button small-button"
                                        onClick={() => handleDeleteCategory(category.id)}>Delete</button>
                                </div>
                            )}
                        </div>
                    </div>
                    {editCategoryId === category.id ? (
                        <div className="edit-category">
                            <input
                                type="text"
                                value={editCategoryTitle}
                                onChange={(e) => setEditCategoryTitle(e.target.value)}
                                placeholder="Edit category title"
                            />
                            <button onClick={() => handleEditCategory(category.id)}>Save</button>
                            <button className="cancel-button" onClick={() => setEditCategoryId(null)}>Cancel</button>
                        </div>
                    ) : (
                        <div className="category-threads">
                            <ul>
                                {category.threads.map((thread) => (
                                    <li key={thread.id} className="thread-item">
                                        <div className="thread-info">
                                            <img src="/path/to/category/image.jpg" alt="Category" className="category-image" />
                                            <div>
                                                <p className="thread-author">{thread.author}</p>
                                                <p className="thread-date">Created on: {new Date(thread.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="thread-content">
                                            <h3>
                                                <Link to={`/forum/thread/${thread.id}`}>{thread.title}</Link>
                                            </h3>
                                            <p>{thread.content.substring(0, 100)}...</p>
                                            <div className="thread-stats">
                                                <span>Replies: {thread.replies && thread.replies.length}</span>
                                                <span>Upvotes: {thread.upvotes && thread.upvotes.length}</span>
                                                <span>Downvotes: {thread.downvotes && thread.downvotes.length}</span>
                                                <span>Views: {thread.views}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
            {isAdmin && (
                <div className="admin-actions">
                    <button onClick={() => setShowCreateCategory(!showCreateCategory)}>
                        {showCreateCategory ? 'Cancel' : 'Create Category'}
                    </button>
                    {showCreateCategory && (
                        <div className="create-category">
                            <input
                                type="text"
                                value={newCategoryTitle}
                                onChange={(e) => setNewCategoryTitle(e.target.value)}
                                placeholder="New category title"
                            />
                            <button onClick={handleCreateCategory}>Save Category</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
