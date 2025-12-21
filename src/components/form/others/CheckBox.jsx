// src/components/form/others/CheckBox.jsx
import React from 'react';

const CheckBox = ({ id, name, type, handleClick, isChecked, disabled }) => {
  return (
    <>
      <input
        id={id}
        name={name}
        type={type}
        onChange={handleClick}
        checked={isChecked}
        disabled={disabled}
        className={disabled ? 'opacity-50 cursor-not-allowed' : ''}
      />
    </>
  );
};

export default CheckBox;