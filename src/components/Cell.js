import React from 'react';

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
  isAnimating = false // Add isAnimating prop with default value
}) => {
  const selectedOption = Array.isArray(options) ? options.find(opt => opt.name === value) : null;
  const hint = selectedOption ? selectedOption.hint : null;

  // Helper to generate filename from option name
  const makeFilename = (str) => {
    if (!str) return null;
    // Convert to lowercase
    // Replace spaces with underscores
    // Keep letters, numbers, underscores, hyphens, plus signs
    // Remove any other potentially problematic characters
    // Add .png extension
    const cleaned = str.toLowerCase()
                      .replace(/ /g, '_') // Replace spaces with underscores first
                      .replace(/[^a-z0-9_\-\+]/g, ''); // Keep letters, numbers, _, -, +
    return `${cleaned}.png`;
  };

  const imageFilename = selectedOption ? makeFilename(selectedOption.name) : null;
  // Corrected path: Remove '/public'. Serve from root as /images/
  const imageUrl = imageFilename ? `/images/${imageFilename}` : null;

  const handleRandomizeClick = () => {
    if (!locked && Array.isArray(options) && options.length > 0) {
      const randomOption = options[Math.floor(Math.random() * options.length)];
      onChange(randomOption.name); // Pass the name of the random option
    }
  };

  // Add the isAnimating class conditionally
  const cellClassName = `cell ${locked ? 'locked' : ''} ${isAnimating ? 'cell-spinning' : ''}`;

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
        <div className="cell-image-container"> {/* Container for centering */}
          <img
            className="cell-image" // Add class for styling
            src={imageUrl}
            alt={value || title} // Use value or title for alt text
            title={hint || value} // Show hint or value on hover
            // onError hides image if it fails to load
            onError={(e) => { e.target.style.display = 'none'; console.error(`Failed to load image: ${imageUrl}`); }}
            // Explicitly set display style if needed, though CSS is preferred
            // style={{ display: 'block' }} // Uncomment if CSS isn't working
          />
        </div>
      }
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
};

export default Cell;
