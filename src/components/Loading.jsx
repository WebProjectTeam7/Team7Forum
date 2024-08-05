/* eslint-disable indent */
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import loadingGif from '../image/loading.gif';
import './CSS/Loading.css';

const LoadingComponent = () => {
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line no-trailing-spaces
  useEffect(() => {
    const loading = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Error during loading:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loading();
  }, []);

  if (isLoading) {
    return (
      <div className="loading">
        <img src={loadingGif} alt="Loading..." />
        <p>Loading...</p>
      </div>
    );
  }

  return null;
};

export default LoadingComponent;
