import lightBeerIcon from '../image/light-beer.png';
import darkBeerIcon from '../image/dark-beer.png';
import { useEffect, useState } from 'react';
import './CSS/BeerSwitch.css';

export default function BeerSwitch() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('theme');
        return savedMode ? savedMode === 'dark' : false;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const handleToggle = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <div className="beer-slider">
            <img src={lightBeerIcon} alt="Light Beer Icon" className="icon light-beer-icon" />
            <label className="switch">
                <input type="checkbox" checked={isDarkMode} onChange={handleToggle} />
                <span className="slider"></span>
            </label>
            <img src={darkBeerIcon} alt="Dark Beer Icon" className="icon dark-beer-icon" />
        </div>
    );
}