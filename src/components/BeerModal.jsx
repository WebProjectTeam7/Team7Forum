import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './CSS/BeerModal.css';


export default function BeerModal({ beer, onClose, onSave }) {
    const [name, setName] = useState('');
    const [alc, setAlc] = useState(0.0);
    const [type, setType] = useState('');
    const [producer, setProducer] = useState('');
    const [origin, setOrigin] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (beer) {
            setName(beer.name || '');
            setAlc(beer.alc || 0.0);
            setType(beer.type || '');
            setProducer(beer.producer || '');
            setOrigin(beer.origin || '');
            setDescription(beer.description || '');
        }
    }, [beer]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const beerData = { name, alc, type, producer, origin, description, imageFile };
        onSave(beerData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{beer ? 'Edit Beer' : 'Create New Beer'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Alc:</label>
                        <input
                            type="number"
                            step="0.1"
                            value={alc}
                            onChange={(e) => setAlc(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Type:</label>
                        <input
                            type="text"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Producer:</label>
                        <input
                            type="text"
                            value={producer}
                            onChange={(e) => setProducer(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Origin:</label>
                        <input
                            type="text"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description:</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Image:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    {imagePreview && (
                        <div className="image-preview">
                            <img src={imagePreview} alt="Beer preview" />
                        </div>
                    )}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">{beer ? 'Save Changes' : 'Create Beer'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

BeerModal.propTypes = {
    beer: PropTypes.shape({
        name: PropTypes.string,
        alc: PropTypes.number,
        type: PropTypes.string,
        producer: PropTypes.string,
        origin: PropTypes.string,
        description: PropTypes.string,
        imageUrl: PropTypes.string,
    }),
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
};

BeerModal.defaultProps = {
    beer: null,
};