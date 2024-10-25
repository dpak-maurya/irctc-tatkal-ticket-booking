import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import PropTypes from 'prop-types';

// Custom Styled Switch
const SwitchContainer = styled(Box)(({ checked }) => ({
  width: '80px',
  height: '34px',
  borderRadius: '34px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: checked ? 'flex-end' : 'flex-start',
  backgroundColor: checked ? '#415f91' : '#D3D3D3', // Blue when ON, gray when OFF
  padding: '3px',
  position: 'relative',
  cursor: 'pointer',
  transition: 'background-color 0.5s ease, justify-content 0.5s ease',
}));

const SwitchButton = styled(Box)({
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  transition: 'transform 1s ease',
});

const SwitchText = styled(Typography)(({ checked }) => ({
  position: 'absolute',
  fontWeight: 'bold',
  left: checked ? '15px' : 'auto',
  right: checked ? 'auto' : '15px',
  color: checked ? '#ffffff' : '#555555',
  zIndex: 1,
  transition: 'left 0.5s ease, right 0.5s ease, color 0.5s ease',
}));

const HiddenCheckbox = styled('input')({
  position: 'absolute',
  opacity: 0,
  width: 0,
  height: 0,
});

const CustomSwitch = ({ checked, onChange, name }) => {
  return (
    <SwitchContainer checked={checked} onClick={() => onChange(!checked)}>
      {/* Hidden checkbox to make it work like a real form element */}
      <HiddenCheckbox
        type="checkbox"
        checked={checked}
        onChange={() => onChange(!checked)}
        name={name}
      />
      <SwitchText checked={checked}>{checked ? 'ON' : 'OFF'}</SwitchText>
      <SwitchButton checked={checked} />
    </SwitchContainer>
  );
};

// Add prop types validation
CustomSwitch.propTypes = {
  checked: PropTypes.bool.isRequired, // Validate 'checked' prop
  onChange: PropTypes.func.isRequired, // Validate the change handler
  name: PropTypes.string, // Name for form usage
};

export default CustomSwitch;
