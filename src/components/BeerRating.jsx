import { FaBeer } from "react-icons/fa";
import PropTypes from "prop-types";
import { useState } from "react";

const MAX_RATING = 10;

export default function BeerRating({ rating, onRate = () => {} }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(rating);

  const handleMouseOver = (index) => setHovered(index);
  const handleMouseOut = () => setHovered(0);
  const handleClick = (index) => {
    setSelected(index);
    if (typeof onRate === "function") {
      onRate(index);
    }
  };

  return (
    <div onMouseOut={handleMouseOut}>
      {Array.from({ length: MAX_RATING }, (item, index) => (
        <FaBeer
          key={index}
          style={{
            cursor: "pointer",
            color: index < (hovered || selected) ? "gold" : "grey",
          }}
          size={24}
          onMouseOver={() => handleMouseOver(index + 1)}
          onClick={() => handleClick(index + 1)}
        />
      ))}
    </div>
  );
}

BeerRating.propTypes = {
  rating: PropTypes.number.isRequired,
  onRate: PropTypes.func,
};
