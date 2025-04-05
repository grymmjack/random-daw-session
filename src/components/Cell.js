import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animationTimings } from '../constants/animations';
import Modal from './Modal';

// Helper to generate image URL
const getImageUrl = (value, hideImage) => {
  if (!value || value === 'None' || value === '# Random Preset Instruments' || hideImage) {
    return null; // No image for these cases
  }
  const imageName = value
    .toLowerCase()
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^a-z0-9_\-+]/g, ''); // Keep only specific chars
  return `/images/${imageName}.png`;
};

const Cell = ({ 
  title, 
  name, 
  options = [], 
  value, 
  locked, 
  onLock, 
  onChange, 
  placeholder = "SELECT...", 
  hideImage = false,
  isAnimating = false,
  hint = null
}) => {
  const imageUrl = getImageUrl(value, hideImage);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRandomizeClick = () => {
    if (!locked && Array.isArray(options) && options.length > 0) {
      const randomOption = options[Math.floor(Math.random() * options.length)];
      onChange(randomOption.name); // Pass the name of the random option
    }
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (imageUrl) {
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleLockClick = (e) => {
    e.stopPropagation();
    onLock();
  };

  const cellClassName = `cell ${locked ? 'locked' : ''}`;

  return (
    <>
      <div className={cellClassName} onClick={handleRandomizeClick}>
        <span className="lock" onClick={handleLockClick}></span>
        <h1>
          {title}
        </h1>
        <select
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={locked}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.name} value={option.name}>
              {option.name}
            </option>
          ))}
        </select>
        <AnimatePresence mode="wait">
          {!hideImage && imageUrl && (
            <motion.div
              key={imageUrl}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: animationTimings.cellFade.duration,
                ease: animationTimings.cellFade.ease,
                delay: animationTimings.cellFade.delay
              }}
              className="cell-image-container"
            >
              <img 
                src={imageUrl}
                alt={hint}
                onClick={handleImageClick}
                className="cell-image"
                onError={(e) => { e.target.style.display = 'none'; console.error(`Failed to load image: ${imageUrl}`); }}
              />
              {hint && <div className="hint-text">{hint}</div>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Modal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        imageUrl={imageUrl}
        hint={hint}
      />
    </>
  );
};

export default Cell;
