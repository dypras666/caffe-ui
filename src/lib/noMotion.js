/**
 * No Motion Wrapper
 * Replaces framer-motion components with plain divs to reduce motion effects
 */

export const motion = {
  div: ({ children, initial, animate, transition, exit, whileHover, whileTap, ...props }) => {
    // Return plain div, ignore all animation props
    return <div {...props}>{children}</div>;
  },
};

// You can add other motion components if needed
motion.section = motion.div;
motion.article = motion.div;
motion.aside = motion.div;
motion.span = ({ children, initial, animate, transition, exit, whileHover, whileTap, ...props }) => {
  return <span {...props}>{children}</span>;
};
