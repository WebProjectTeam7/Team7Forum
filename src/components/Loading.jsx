/* eslint-disable indent */
// eslint-disable-next-line no-unused-vars
import React from 'react';
import loadingGif from '../image/loading.gif';
import './CSS/Loading.css';

const LoadingComponent = () => {
  return (
    <div className="loading">
      <img src={loadingGif} alt="Loading..." />
      <p>Loading...</p>
    </div>
  );
};

export default LoadingComponent;
