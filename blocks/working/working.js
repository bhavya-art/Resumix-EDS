// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.2,
  rootMargin: '0px 0px -100px 0px',
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Add animation class
      entry.target.classList.add('animate-in');
    } else {
      // Remove animation class when out of view (allows re-triggering)
      entry.target.classList.remove('animate-in');
    }
  });
}, observerOptions);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Observe the working section
  const workingSection = document.querySelector('.working');
  if (workingSection) {
    // Add the animate-ready class to enable animations
    workingSection.classList.add('animate-ready');
    observer.observe(workingSection);
  }
});

// Optional: Add smooth reveal on page load
window.addEventListener('load', () => {
  const workingSection = document.querySelector('.working');
  if (workingSection) {
    // Check if section is already in viewport
    const rect = workingSection.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

    if (isInViewport) {
      workingSection.classList.add('animate-in');
    }
  }
});
