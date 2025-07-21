import createChecklistField, { createProgressTracker, updateProgress } from './checklist-fields.js';

// function loadChecklistState(checklist) {
//   const savedState = localStorage.getItem('checklistState');
//   if (!savedState) return;

//   try {
//     const state = JSON.parse(savedState);
//     const checkboxes = checklist.querySelectorAll('input[type="checkbox"]');

//     checkboxes.forEach((checkbox) => {
//       if (state[checkbox.id] !== undefined) {
//         checkbox.checked = state[checkbox.id];
//       }
//     });

//     // Update progress without triggering modal on load
//     updateProgressSilent(checklist);
//   } catch (e) {
//     console.warn('Failed to load checklist state:', e);
//   }
// }

// function updateProgressSilent(checklist) {
//   // Just update progress without modal
//   updateProgress(checklist, { silent: true });
// }

async function createChecklist(checklistHref) {
  const { pathname } = new URL(checklistHref);
  const resp = await fetch(pathname);
  const json = await resp.json();

  const checklistContainer = document.createElement('div');
  checklistContainer.classList.add('checklist-container');

  // Create progress tracker
  const progressTracker = createProgressTracker();
  checklistContainer.append(progressTracker);

  // Create checklist wrapper
  const checklistWrapper = document.createElement('div');
  checklistWrapper.classList.add('checklist-wrapper');

  // Create fields
  const fields = await Promise.all(
    json.data.map((fd) => createChecklistField(fd, checklistContainer)),
  );

  fields.forEach((field) => {
    if (field) {
      checklistWrapper.append(field);
    }
  });

  checklistContainer.append(checklistWrapper);

  // Group fields into fieldsets if any
  const fieldsets = checklistContainer.querySelectorAll('fieldset');
  fieldsets.forEach((fieldset) => {
    checklistContainer.querySelectorAll(`[data-fieldset="${fieldset.name}"]`).forEach((field) => {
      fieldset.append(field);
    });
  });

  // Initialize progress
  setTimeout(() => updateProgress(checklistContainer), 0);

  return checklistContainer;
}

export default async function decorate(block) {
  const links = [...block.querySelectorAll('a')].map((a) => a.href);
  const checklistLink = links.find((link) => link.startsWith(window.location.origin) && link.endsWith('.json'));

  if (!checklistLink) {
    // console.warn('No checklist JSON link found');
    return;
  }

  try {
    const checklist = await createChecklist(checklistLink);
    block.replaceChildren(checklist);
  } catch (error) {
    // console.error('Failed to create checklist:', error);
    block.innerHTML = '<p class="error">Failed to load checklist. Please try again later.</p>';
  }
}
