import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animationTimings } from '../constants/animations';

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
    if (isOpen) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key={isOpen ? 'modal-open' : 'modal-closed'}
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? (isAnimating ? 0.5 : 1) : 0 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: animationTimings.cellFade.duration,
          ease: animationTimings.cellFade.ease,
          delay: animationTimings.cellFade.delay
        }}
        className="modal-overlay"
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={handleOverlayClick}
      >
        {isOpen && (
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
              duration: animationTimings.cellFade.duration, 
              ease: animationTimings.cellFade.ease 
            }}
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{hint}</h2>
            </div>
            <div className="modal-image-container">
              <img 
                src={imageUrl}
                alt={hint}
                style={{
                  maxWidth: maxImageWidth,
                  maxHeight: '80vh',
                  objectFit: 'contain'
                }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Modal;
