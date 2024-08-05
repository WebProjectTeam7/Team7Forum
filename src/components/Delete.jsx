/* eslint-disable indent */
// import React from 'react';
import PropTypes from 'prop-types';

const DeleteConfirmation = ({ onConfirm, onCancel }) => {
  return (
    <div className="delete-confirmation">
      <p>Are you sure you want to delete this item?</p>
      <button onClick={onConfirm}>Yes</button>
      <button onClick={onCancel}>No</button>
    </div>
  );
};

DeleteConfirmation.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default DeleteConfirmation;