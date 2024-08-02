import { useState, useRef, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { FaInfoCircle } from 'react-icons/fa';
import './CSS/InfoButtonUtil.css';

const InfoButton = ({ text }) => {
    const ref = useRef(null);
    const [toggle, setToggle] = useState(true);
    const [style, animate] = useSpring(() => ({ height: "0px" }));

    useEffect(() => {
        animate({
            height: `${ref.current.offsetHeight}px`,
        });
    }, [animate, ref]);

    return (
        <div className="infoButtonContainer">
            <div type="button" className="infoButton" onClick={() => setToggle(!toggle)}>
                <FaInfoCircle className="infoIcon" />
            </div>
            {toggle && (
                <animated.div className="infoBox" style={style}>
                    <p className="infoText" ref={ref}>{text}</p>
                </animated.div>
            )}
        </div>
    );
};

export default InfoButton;