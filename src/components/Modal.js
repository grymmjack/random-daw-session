import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, imageUrl, hint, maxImageWidth = 800 }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 100);
    } else {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    // Only close if clicking the overlay itself, not the image
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: isAnimating ? 0.5 : 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
          className="modal-overlay"
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: isAnimating ? 0.9 : 1, 
              opacity: isAnimating ? 0 : 1 
            }}
            exit={{ 
              scale: 0.9, 
              opacity: 0 
            }}
            transition={{ 
              duration: 0.3,
              ease: "easeInOut"
            }}
            className="modal-content"
          >
            <img 
              src={imageUrl}
              alt={hint}
              style={{ maxWidth: `${maxImageWidth}px` }}
              onClick={(e) => e.stopPropagation()}
            />
            {hint && (
              <div className="modal-hint">
                {hint}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
