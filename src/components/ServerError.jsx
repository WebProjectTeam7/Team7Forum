/* eslint-disable indent */
import { useEffect, useState } from 'react';
import errorGif from './error.gif';
import './CSS/ErrorMessage.css';

const ErrorComponent = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const login = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'user', password: 'password' }),
        });

        if (!response.ok) {
          throw new Error('Login failed!');
        }

        const data = await response.json();
        console.log('Login successful:', data);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    login();
  }, []);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const response = await fetch('/api/login', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ username: 'user', password: 'password' }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Login failed!');
  //     }

  //     const data = await response.json();
  //     console.log('Login successful:', data);
  //   } catch (error) {
  //     setErrorMessage(error.message);
  //   }
  // };

  return (
    <div>
      {errorMessage && (
        <div className="error-message">
          <img src={errorGif} alt="Error" />
          <p>{errorMessage}</p>
        </div>
      )}
      {loading &&
      <p>Loading...</p>}
    </div>
  );
};

export default ErrorComponent;
