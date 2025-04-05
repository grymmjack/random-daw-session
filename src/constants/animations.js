export const animationTimings = {
  /**
   * Animation timings for cell fade in/out animations.
   * @property {number} duration - Duration for fade in/out
   * @property {string} ease - Easing function
   * @property {number} delay - Initial delay before animation starts
   */
  cellFade: {
    duration: 0.3, // Duration for fade in/out
    ease: 'easeInOut', // Easing function
    delay: 0 // Initial delay before animation starts
  },
  
  /**
   * Animation timings for staggered animations.
   * @property {number} duration - Duration of individual animations
   * @property {string} ease - Easing function
   * @property {number} delay - Initial delay before animation starts
   * @property {Object} stagger - Staggered animation options
   * @property {number} stagger.each - Delay between each animation
   * @property {string} stagger.from - Start from this index
   * @property {number} stagger.amount - Total duration of stagger effect
   */
  stagger: {
    duration: 0.3,
    ease: 'easeInOut',
    delay: 0,
    stagger: {
      each: 0.1, // 0.1 second delay between each cell
      from: 'first', // Start from first cell
      amount: 0.5 // Total duration of stagger effect
    }
  }
};
