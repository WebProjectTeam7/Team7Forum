import React from 'react';
import AddItemButton from './AddItemButton';
import './CSS/CustomFileInput.css';

export default function CustomFileInput({ onChange }) {
    const fileInputRef = React.createRef();

    const handleClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="custom-file-input">
            <input
                type="file"
                accept="image/*"
                onChange={onChange}
                ref={fileInputRef}
                multiple
                className="hidden-file-input"
            />
            <AddItemButton text="Add Image" onClick={handleClick} />
        </div>
    );
}

