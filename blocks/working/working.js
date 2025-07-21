// Simple and reliable scroll animation for working section
(function () {
  let workingSection;
  let observer;

  function init() {
    workingSection = document.querySelector('.working');

    if (!workingSection) {
      console.warn('Working section not found');
      return;
    }

    console.log('Working section found:', workingSection);

    // Add animate-ready class immediately
    workingSection.classList.add('animate-ready');
    console.log('Added animate-ready class');

    // Create intersection observer
    observer = new IntersectionObserver(((entries) => {
      entries.forEach((entry) => {
        console.log('Intersection observed:', entry.isIntersecting, entry.intersectionRatio);
        if (entry.isIntersecting) {
          // Add animate-in class to trigger animations
          entry.target.classList.add('animate-in');
          console.log('Animation triggered! Classes:', entry.target.classList.toString());

          // Stop observing after animation triggers
          observer.unobserve(entry.target);
        }
      });
    }), {
      threshold: 0.1, // Trigger when 10% of element is visible
      rootMargin: '0px 0px -20px 0px',
    });

    // Start observing
    observer.observe(workingSection);
    console.log('Started observing working section');

    // Immediate check if already in view
    setTimeout(() => {
      const rect = workingSection.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;

      console.log('Fallback check - Is in view:', isInView, 'Has animate-in:', workingSection.classList.contains('animate-in'));

      if (isInView && !workingSection.classList.contains('animate-in')) {
        workingSection.classList.add('animate-in');
        console.log('Animation triggered (fallback)!');
      }
    }, 500);
  }

  // Global functions for testing
  window.triggerWorkingAnimation = function () {
    if (workingSection) {
      workingSection.classList.add('animate-ready', 'animate-in');
      console.log('Animation manually triggered! Classes:', workingSection.classList.toString());
    } else {
      console.log('Working section not found for manual trigger');
    }
  };

  window.resetWorkingAnimation = function () {
    if (workingSection) {
      workingSection.classList.remove('animate-ready', 'animate-in');
      console.log('Animation reset!');

      // Re-add animate-ready after a brief delay
      setTimeout(() => {
        workingSection.classList.add('animate-ready');
        console.log('Re-added animate-ready class');
      }, 100);
    } else {
      console.log('Working section not found for reset');
    }
  };

  // Debug function to check current state
  window.checkWorkingState = function () {
    if (workingSection) {
      const rect = workingSection.getBoundingClientRect();
      console.log('Working section state:', {
        classes: workingSection.classList.toString(),
        position: {
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
        },
        windowHeight: window.innerHeight,
        isInView: rect.top < window.innerHeight && rect.bottom > 0,
      });
    } else {
      console.log('Working section not found');
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('Scroll animation script loaded');
}());
