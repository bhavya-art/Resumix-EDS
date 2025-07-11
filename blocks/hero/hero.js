function waitForFormLoad(selector, callback) {
  const observer = new MutationObserver(() => {
    const formBlock = document.querySelector(selector);
    if (
      formBlock
      && formBlock.getAttribute('data-block-status') === 'loaded'
      && formBlock.querySelector('form')
    ) {
      observer.disconnect();
      callback(formBlock);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function initResumeModal() {
  waitForFormLoad('.form.block', (formBlock) => {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'resume-modal-overlay';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'resume-modal-content';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.className = 'modal-close';

    closeBtn.addEventListener('click', () => {
      modalOverlay.style.display = 'none';
      formBlock.style.display = 'none';
      document.body.style.overflow = '';
    });

    // Append elements
    formBlock.style.display = 'none';
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(formBlock);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Trigger modal on "Get Started for Free" button
    const triggerBtn = document.querySelector('a.button[title="Get Started for Free"]');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modalOverlay.style.display = 'flex';
        formBlock.style.display = 'block';
        document.body.style.overflow = 'hidden';
      });
    }

    // Close modal on clicking outside
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.style.display = 'none';
        formBlock.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  });
}

initResumeModal();
