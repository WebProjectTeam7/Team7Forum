import lightBeerIcon from '../image/light-beer.png';
import darkBeerIcon from '../image/dark-beer.png';
import { useState } from 'react';
import './CSS/BeerSwitch.css';

export default function BeerSwitch() {
    const [isDarkBeer, setIsDarkBeer] = useState(false);

    const handleToggle = () => {
        setIsDarkBeer(!isDarkBeer);
    };

    return (
        <div className="beer-slider">
            <img src={lightBeerIcon} alt="Light Beer Icon" className="icon light-beer-icon" />
            <label className="switch">
                <input type="checkbox" checked={isDarkBeer} onChange={handleToggle} />
                <span className="slider"></span>
            </label>
            <img src={darkBeerIcon} alt="Dark Beer Icon" className="icon dark-beer-icon" />
        </div>
    );
}