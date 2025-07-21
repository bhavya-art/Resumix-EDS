export default function decorate(block) {
  const sections = block.querySelectorAll(':scope > div');
  const wrapper = block.closest('.resume-wrapper');

  // Create the display panel
  const panel = document.createElement('div');
  panel.classList.add('resume-panel');
  wrapper.append(panel);

  // Function to show content
  const showContent = (section) => {
    const content = section.querySelector(':scope > div:nth-child(2)');
    if (!content) return;

    // Remove active from others
    sections.forEach((s) => s.classList.remove('active'));
    section.classList.add('active');

    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      panel.innerHTML = '';
      return;
    }

    // Update panel content for desktop
    panel.innerHTML = '';
    [...content.children].forEach((el) => {
      panel.append(el.cloneNode(true));
    });
  };

  // Click binding
  sections.forEach((section) => {
    const header = section.querySelector(':scope > div:nth-child(1)');
    if (!header) return;

    header.addEventListener('click', () => showContent(section));
  });

  // ✅ Preselect and show div:nth-child(2)
  const defaultSection = block.querySelector(':scope > div:nth-child(2)');
  if (defaultSection) showContent(defaultSection);
}
