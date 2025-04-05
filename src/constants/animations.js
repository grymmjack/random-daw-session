export const animationTimings = {
  // Cell animations
  cellFade: {
    duration: 0.3, // Duration for fade in/out
    ease: 'easeInOut', // Easing function
    delay: 0 // Initial delay before animation starts
  },
  
  // Staggered animation preset
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
