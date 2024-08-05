/* eslint-disable indent */
import { useState } from 'react';
import errorGif from './error.gif';
import './CSS/ErrorMessage.css';

const ErrorComponent = () => {
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <button type="submit">Login</button>
      </form>

      {errorMessage && (
        <div className="error-message">
          <img src={errorGif} alt="Error" />
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ErrorComponent;
