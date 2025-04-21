/**
 * Combines class names with conditional logic
 */
 export function cn(...classes) {
    return classes.filter(Boolean).join(" ");
  }