import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  const openModal = (variant, title, message, onConfirm) => {
    setModalConfig({ variant, title, message, onConfirm });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalConfig({});
  };

  return (
    <ModalContext.Provider value={{ isModalOpen, modalConfig, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModalContext = () => useContext(ModalContext);

ModalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ModalContext;
