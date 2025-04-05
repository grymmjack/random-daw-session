import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const handleRandomizeClick = () => {
    if (!locked && Array.isArray(options) && options.length > 0) {
      const randomOption = options[Math.floor(Math.random() * options.length)];
      onChange(randomOption.name); // Pass the name of the random option
    }
  };

  const cellClassName = `cell ${locked ? 'locked' : ''}`;

  return (
    <div className={cellClassName}>
      <span className="lock" onClick={onLock}></span>
      <h1 onClick={handleRandomizeClick}>
        {title}
      </h1>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={locked}
      >
        <option value="">{placeholder}</option>
        {/* Check if options is a valid array before mapping */}
        {Array.isArray(options) && options.map((option, index) => (
          <option key={index} value={option.name}> {/* Use option.name for value and display */}
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
            transition={{ duration: 0.3 }}
            className="cell-image-container"
          >
            <img 
              src={imageUrl} 
              alt={value} 
              className="cell-image"
              onError={(e) => { e.target.style.display = 'none'; console.error(`Failed to load image: ${imageUrl}`); }}
            />
            {hint && <div className="hint-text">{hint}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cell;
