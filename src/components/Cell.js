import React from 'react';

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
  isAnimating = false 
}) => {
  const imageUrl = getImageUrl(value, hideImage);

  const handleRandomizeClick = () => {
    if (!locked && Array.isArray(options) && options.length > 0) {
      const randomOption = options[Math.floor(Math.random() * options.length)];
      onChange(randomOption.name); // Pass the name of the random option
    }
  };

  const cellClassName = `cell ${locked ? 'locked' : ''} ${isAnimating ? 'cell-spinning' : ''}`;
  const imageClasses = 'cell-image';

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
      {/* Render image only if imageUrl is valid AND hideImage is false */}
      {!hideImage && imageUrl &&
        <div className="cell-image-container">
          <img 
            src={imageUrl} 
            alt={value} 
            className={imageClasses}
            onError={(e) => { e.target.style.display = 'none'; console.error(`Failed to load image: ${imageUrl}`); }}
          />
        </div>
      }
    </div>
  );
};

export default Cell;
