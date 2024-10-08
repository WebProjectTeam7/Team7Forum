import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/category.service';
import { getThreadsByCategoryId } from '../services/thread.service';
import { AppContext } from '../state/app.context';
import UserRoleEnum from '../common/role.enum';
import ThreadItem from '../components/ThreadItem';
import { isUserBanned } from '../services/admin.service';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
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
    const [fetchTrigger, setFetchTrigger] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, [fetchTrigger]);

    const fetchCategories = async () => {
        try {
            const fetchedCategories = await getCategories();
            const categoriesWithThreads = await Promise.all(
                fetchedCategories.map(async (category) => {
                    const threads = await getThreadsByCategoryId(category.id, THREADS_LIMIT_BY_CATEGORY);
                    return { ...category, threads };
                })
            );
            setCategories(categoriesWithThreads);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleCreateCategory = async () => {
        const banned = await isUserBanned(userData.uid);

        if (banned) {
            Swal.fire('Permission Denied', 'You are banned from creating categories!', 'warning');
            return;
        }

        if (newCategoryTitle.trim()) {
            try {
                const newCategoryId = await createCategory(newCategoryTitle);
                setCategories([...categories, { id: newCategoryId, title: newCategoryTitle, threads: [] }]);
                setNewCategoryTitle('');
                setShowCreateCategory(false);
                setFetchTrigger(!fetchTrigger);
            } catch (error) {
                console.error('Error creating category:', error);
            }
        }
    };

    const handleEditCategory = async (categoryId) => {
        if (editCategoryTitle.trim()) {
            try {
                await updateCategory(categoryId, editCategoryTitle);
                setEditCategoryId(null);
                setFetchTrigger(!fetchTrigger);
            } catch (error) {
                console.error('Error updating category:', error);
            }
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the category.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await deleteCategory(categoryId);
                setCategories(categories.filter(category => category.id !== categoryId));
                setFetchTrigger(!fetchTrigger);
                Swal.fire('Deleted!', 'The category has been deleted.', 'success');
            } catch (error) {
                console.error('Error deleting category:', error);
            }
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
                            <span>Number of Threads: {category.threadCount}</span>
                            {isAdmin && (
                                <div className="category-buttons">
                                    <EditButton onClick={() => {
                                        setEditCategoryId(category.id);
                                        setEditCategoryTitle(category.title);
                                    }} />
                                    <DeleteButton onClick={() => handleDeleteCategory(category.id)} />
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
                                {category.threads.length > 0 ? (
                                    category.threads.map((thread) => (
                                        <ThreadItem key={thread.id} thread={thread} />
                                    ))
                                ) : (
                                    <li>No threads available</li>
                                )}

                            </ul>
                        </div>
                    )}
                </div>
            ))}
            {isAdmin && (
                <div className="admin-actions">
                    <button onClick={() => setShowCreateCategory(!showCreateCategory)} disabled={userData.isBanned}>
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
