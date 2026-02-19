// Micro-interactions utility functions and animation variants

import { Variants } from 'framer-motion';

// Enhanced hover effects for interactive elements
export const hoverEffects = {
  // Subtle lift with shadow enhancement
  lift: {
    whileHover: {
      y: -4,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    whileTap: {
      y: -2,
      scale: 0.98,
      transition: {
        duration: 0.1,
      },
    },
  },

  // Gentle scale with glow effect
  glow: {
    whileHover: {
      scale: 1.05,
      filter: 'brightness(1.1)',
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    whileTap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
      },
    },
  },

  // Bounce effect for buttons
  bounce: {
    whileHover: {
      y: -2,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    whileTap: {
      y: 0,
      scale: 0.95,
      transition: {
        duration: 0.1,
      },
    },
  },

  // Rotate effect for icons
  rotate: {
    whileHover: {
      rotate: 5,
      scale: 1.1,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    whileTap: {
      rotate: -5,
      scale: 0.9,
      transition: {
        duration: 0.1,
      },
    },
  },

  // Pulse effect for attention-grabbing elements
  pulse: {
    whileHover: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
};

// Entrance animations for sections and components
export const entranceAnimations: Record<string, Variants> = {
  fadeInUp: {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  },

  fadeInLeft: {
    hidden: {
      opacity: 0,
      x: -30,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  },

  fadeInRight: {
    hidden: {
      opacity: 0,
      x: 30,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  },

  scaleIn: {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  },

  slideInUp: {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  },
};

// Stagger container for animating multiple children
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Loading animations
export const loadingAnimations = {
  spinner: {
    animate: {
      rotate: 360,
    },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },

  pulse: {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },

  dots: {
    animate: {
      y: [0, -10, 0],
    },
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Utility function to create staggered animations
export const createStaggeredAnimation = (
  delay: number = 0.1,
  childDelay: number = 0.2
): Variants => ({
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: delay,
      delayChildren: childDelay,
    },
  },
});

// Utility function for scroll-triggered animations
export const scrollTriggerAnimation = (
  threshold: number = 0.1,
  margin: string = '-10%'
) => ({
  viewport: {
    once: true,
    amount: threshold,
    margin,
  },
  initial: 'hidden',
  whileInView: 'visible',
});

// Enhanced button press feedback
export const buttonFeedback = {
  whileTap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: 'easeInOut',
    },
  },
};

// Smooth focus indicators for accessibility
export const focusIndicator = {
  whileFocus: {
    boxShadow: '0 0 0 3px rgba(138, 43, 226, 0.5)',
    transition: {
      duration: 0.2,
    },
  },
};

// Parallax effect utilities
export const parallaxEffect = (strength: number = 0.5) => ({
  y: `${strength * 100}%`,
  transition: {
    type: 'tween',
    ease: 'linear',
  },
});

// Card hover effects
export const cardHoverEffects = {
  subtle: {
    whileHover: {
      y: -8,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  },

  pronounced: {
    whileHover: {
      y: -12,
      scale: 1.02,
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  },
};

// Text reveal animations
export const textRevealAnimations = {
  typewriter: {
    hidden: {
      width: 0,
    },
    visible: {
      width: '100%',
      transition: {
        duration: 2,
        ease: 'easeInOut',
      },
    },
  },

  fadeInWords: {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  },
};