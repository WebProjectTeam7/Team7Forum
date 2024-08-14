import { useEffect, useState, useContext, useRef } from 'react';
import Swal from 'sweetalert2';
import { AppContext } from '../state/app.context';
import { getAllBeers, deleteBeer, createBeer, editBeer, rateBeer, getBeerRatingByUser } from '../services/beer.service';
import UserRoleEnum from '../common/role.enum';
import BeerRating from '../components/BeerRating';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import CreateBeerModal from '../components/CreateBeerModal';
import AddItemButton from '../components/AddItemButton';
import './CSS/Beerpedia.css';

export default function Beerpedia() {
    const { user, userData } = useContext(AppContext);
    const [beers, setBeers] = useState([]);
    const [userRatings, setUserRatings] = useState({});
    const [editMode, setEditMode] = useState(null);
    const [editedBeerData, setEditedBeerData] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef(null);


    useEffect(() => {
        fetchBeers();
    }, [userData, userRatings]);

    const fetchBeers = async () => {
        if (userData && userData.username) {
            fetchUserRatings();
        }
        try {
            const fetchedBeers = await getAllBeers();
            setBeers(fetchedBeers);
        } catch (error) {
            console.error('Error fetching beers:', error);
        }
    };

    const fetchUserRatings = async () => {
        try {
            const ratings = {};
            for (const beer of beers) {
                const rating = await getBeerRatingByUser(beer.id, userData.username);
                if (rating) {
                    ratings[beer.id] = rating;
                }
            }
            setUserRatings(ratings);
        } catch (error) {
            console.error('Error fetching user ratings:', error);
        }
    };

    const handleDelete = async (beerId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you really want to delete this beer?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            try {
                await deleteBeer(beerId);
                Swal.fire('Deleted!', 'Beer has been deleted.', 'success');
                fetchBeers();
            } catch (error) {
                console.error('Error deleting beer:', error);
            }
        }
    };

    const handleEdit = (beerId) => {
        setEditMode(beerId);
        setEditedBeerData(beers.find(beer => beer.id === beerId));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedBeerData({
            ...editedBeerData,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        setEditedBeerData({
            ...editedBeerData,
            imageFile: e.target.files[0],
        });
    };

    const handleRating = async (beerId, rating) => {
        if (!user || userData.isBanned) {
            Swal.fire('Permission Denied', 'You do not have permission to rate beers.', 'warning');
            return;
        }
        try {
            await rateBeer(beerId, userData.username, rating);
            // Swal.fire('Thank you!', 'Your rating has been submitted.', 'success');
            setUserRatings(prevRatings => ({ ...prevRatings, [beerId]: rating }));
            fetchBeers();
        } catch (error) {
            console.error('Error rating beer:', error);
        }
    };

    const handleCreate = () => {
        setIsModalOpen(true);
    };

    const handleSaveNewBeer = async (beerData) => {
        try {
            const validBeerData = {
                ...beerData,
                alc: beerData.alc || 0.0,
                type: beerData.type || 'Unknown',
                producer: beerData.producer || 'Unknown',
                origin: beerData.origin || 'Unknown',
                description: beerData.description || 'No description available.',
            };

            await createBeer(validBeerData, beerData.imageFile);
            setIsModalOpen(false);
            Swal.fire('Success', 'New beer created successfully.', 'success');
            fetchBeers();
        } catch (error) {
            console.error('Error creating beer:', error);
        }
    };

    const handleSaveEdit = async (beerId) => {
        try {
            const updatedData = {
                ...editedBeerData,
                alc: editedBeerData.alc || 0.0,
                type: editedBeerData.type || 'Unknown',
                producer: editedBeerData.producer || 'Unknown',
                origin: editedBeerData.origin || 'Unknown',
                description: editedBeerData.description || 'No description available.',
            };

            await editBeer(beerId, updatedData, editedBeerData.imageFile);
            setEditMode(null);
            Swal.fire('Success', 'Beer updated successfully.', 'success');
            fetchBeers();
        } catch (error) {
            console.error('Error saving beer:', error);
        }
    };

    const handleAddImageClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="beerpedia-container">
            <h1>Beerpedia</h1>
            {userData && (userData.role === UserRoleEnum.ADMIN || userData.role === UserRoleEnum.MODERATOR) && (
                <button className="create-button" onClick={handleCreate}>
                    Create New Beer
                </button>
            )}
            <div className="beer-grid">
                {beers.map(beer => (
                    <div className="beer-box" key={beer.id}>
                        {beer.imageUrl && (
                            <img src={beer.imageUrl} alt={beer.name} className="beer-image" />
                        )}
                        <div className="beer-details">
                            {editMode === beer.id ? (
                                <>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editedBeerData.name}
                                        onChange={handleInputChange}
                                        placeholder="Beer Name"
                                    />
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="alc"
                                        value={editedBeerData.alc}
                                        onChange={handleInputChange}
                                        placeholder="Alcohol Percentage"
                                    />
                                    <input
                                        type="text"
                                        name="type"
                                        value={editedBeerData.type}
                                        onChange={handleInputChange}
                                        placeholder="Beer Type"
                                    />
                                    <input
                                        type="text"
                                        name="producer"
                                        value={editedBeerData.producer}
                                        onChange={handleInputChange}
                                        placeholder="Producer"
                                    />
                                    <input
                                        type="text"
                                        name="origin"
                                        value={editedBeerData.origin}
                                        onChange={handleInputChange}
                                        placeholder="Origin"
                                    />
                                    <textarea
                                        name="description"
                                        value={editedBeerData.description}
                                        onChange={handleInputChange}
                                        placeholder="Description"
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                    />
                                    <AddItemButton text="Image" className="beerpedia-add-image" onClick={handleAddImageClick} />
                                </>
                            ) : (
                                <>
                                    <h2>{beer.name}</h2>
                                    <p><strong>Alc:</strong> {beer.alc}%</p>
                                    <p><strong>Type:</strong> {beer.type}</p>
                                    <p><strong>Producer:</strong> {beer.producer}</p>
                                    <p><strong>Origin:</strong> {beer.origin}</p>
                                    <p><strong>Description:</strong> {beer.description}</p>
                                    <p><strong>Rating:</strong> {beer.averageRating.toFixed(1)} 🍺</p>
                                </>
                            )}
                            {userData && !userData.isBanned && (
                                <BeerRating
                                    rating={userRatings[beer.id] || 0}
                                    onRate={(rating) => handleRating(beer.id, rating)}
                                />
                            )}
                        </div>
                        {userData && (userData.role === UserRoleEnum.ADMIN || userData.role === UserRoleEnum.MODERATOR) && (
                            <div className="beer-actions">
                                {editMode === beer.id ? (
                                    <>
                                        <button onClick={() => handleSaveEdit(beer.id)}>Save</button>
                                        <button onClick={() => setEditMode(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <EditButton onClick={() => handleEdit(beer.id)}>Edit</EditButton>
                                        <DeleteButton onClick={() => handleDelete(beer.id)}>Delete</DeleteButton>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <CreateBeerModal
                    beer={null}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveNewBeer}
                />
            )}
        </div>
    );
}
