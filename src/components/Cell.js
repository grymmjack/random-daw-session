import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animationTimings } from '../constants/animations';
import Modal from './Modal';

/**
 * Helper function to generate image URL given a value and hideImage flag.
 * @param {String} value The value to generate an image URL for.
 * @param {Boolean} hideImage Whether to hide the image for this cell.
 * @returns {String | null} The generated image URL or null if no image should be shown.
 */
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

/**
 * Cell component
 * 
 * @param {String} title The title of the cell
 * @param {String} name The name of the cell
 * @param {Array} options The list of options for the select
 * @param {String} value The currently selected value
 * @param {Boolean} locked Whether the cell is locked
 * @param {Function} onLock The function to call when the lock button is clicked
 * @param {Function} onChange The function to call when the select value changes
 * @param {String} placeholder The placeholder text for the select
 * @param {Boolean} hideImage Whether to hide the image for this cell
 * @param {Boolean} isAnimating Whether to animate the cell
 * @param {String} hint The hint text to display
 * @param {Number} index The index of the cell in the grid
 * @returns {ReactElement} The cell component
 */
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
  hint = null,
  index // Add index prop to determine animation order
}) => {
  const imageUrl = getImageUrl(value, hideImage);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRandomizeClick = () => {
    if (!locked && Array.isArray(options) && options.length > 0) {
      const randomOption = options[Math.floor(Math.random() * options.length)];
      onChange(randomOption); // Pass the entire option object
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
    <motion.div
      className={cellClassName}
      layout
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        transition: {
          ...animationTimings.stagger,
          delay: animationTimings.stagger.stagger.each * index
        }
      }}
      exit={{ opacity: 0 }}
    >
      <span className="lock" onClick={handleLockClick}></span>
      <h1 onClick={handleRandomizeClick}>
        {title}
      </h1>
      <div onClick={(e) => {
        // Only trigger randomization if clicking outside the select
        if (!e.target.closest('select')) {
          handleRandomizeClick();
        }
      }}>
        <select
          name={name}
          value={value}
          onChange={(e) => {
            // Find the selected option object
            const selectedOption = options.find(opt => opt.name === e.target.value);
            if (selectedOption) {
              // Call onChange with the entire option object
              onChange(selectedOption);
            }
          }}
          disabled={locked}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.name} value={option.name}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
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
      <AnimatePresence>
        {isModalOpen && (
          <Modal 
            isOpen={isModalOpen} 
            onClose={handleModalClose} 
            imageUrl={imageUrl} 
            hint={hint}
            selectedOption={value} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Cell;
