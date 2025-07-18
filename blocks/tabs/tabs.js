export default function decorate() {
  document.querySelectorAll('.tabs-wrapper h4').forEach((q) => {
    q.addEventListener('click', () => {
      q.classList.toggle('active');

      // Collapse others if needed (optional)
      document.querySelectorAll('.tabs-wrapper h4').forEach((other) => {
        if (other !== q) {
          other.classList.remove('active');
          if (other.nextElementSibling?.tagName === 'H5') {
            other.nextElementSibling.style.maxHeight = null;
            other.nextElementSibling.style.opacity = 0;
          }
        }
      });

      const ans = q.nextElementSibling;
      if (ans.tagName === 'H5') {
        if (q.classList.contains('active')) {
          ans.style.maxHeight = `${ans.scrollHeight}px`;
          ans.style.opacity = 1;
        } else {
          ans.style.maxHeight = null;
          ans.style.opacity = 0;
        }
      }
    });
  });
}
