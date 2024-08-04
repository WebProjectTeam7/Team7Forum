import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/category.service';
import { AppContext } from '../state/app.context';
import { getThreadsByCategoryId } from '../services/thread.service';
import UserRoleEnum from '../common/role.enum';


const THREADS_LIMIT_BY_CATEGORY = 3;

export default function Forum() {
    const { userData } = useContext(AppContext);
    const isAdmin = userData && userData.role === UserRoleEnum.ADMIN;

    const [categories, setCategories] = useState([]);
    const [newCategoryTitle, setNewCategoryTitle] = useState('');
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [editCategoryTitle, setEditCategoryTitle] = useState('');


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
    }, []);

    const handleCreateCategory = () => {
        if (newCategoryTitle.trim()) {
            createCategory(newCategoryTitle)
                .then((newCategoryId) => {
                    setCategories([...categories, { id: newCategoryId, title: newCategoryTitle, threads: [] }]);
                    setNewCategoryTitle('');
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
        <div>
            <h1>Forum</h1>
            {isAdmin && (
                <div>
                    <input
                        type="text"
                        value={newCategoryTitle}
                        onChange={(e) => setNewCategoryTitle(e.target.value)}
                        placeholder="New category title"
                    />
                    <button onClick={handleCreateCategory}>Create Category</button>
                </div>
            )}
            {categories.map((category) => (
                <div key={category.id}>
                    <h2>
                        <Link to={`/forum/category/${category.id}`}>{category.title}</Link>
                    </h2>
                    {editCategoryId === category.id ? (
                        <div>
                            <input
                                type="text"
                                value={editCategoryTitle}
                                onChange={(e) => setEditCategoryTitle(e.target.value)}
                                placeholder="Edit category title"

                            />
                            <button onClick={() => handleEditCategory(category.id)}>Save</button>
                            <button onClick={() => setEditCategoryId(null)}>Cancel</button>
                        </div>
                    ) : (
                        <div>

                            {isAdmin && (
                                <>
                                    <button onClick={() => {
                                        setEditCategoryId(category.id);
                                        setEditCategoryTitle(category.name);
                                    }}>Edit</button>
                                    <button onClick={() => handleDeleteCategory(category.id)}>Delete</button>
                                </>
                            )}


                        </div>
                    )}
                    <div>
                        <ul>
                            {category.threads.map((thread) => (
                                <li key={thread.id}>
                                    <Link to={`/forum/thread/${thread.id}`}>{thread.title}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}
