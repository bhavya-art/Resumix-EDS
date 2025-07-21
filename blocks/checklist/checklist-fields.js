import { toClassName } from '../../scripts/aem.js';

function createFieldWrapper(fd) {
  const fieldWrapper = document.createElement('div');
  if (fd.Style) fieldWrapper.className = fd.Style;
  fieldWrapper.classList.add('checklist-field-wrapper', `${fd.Type}-wrapper`);
  fieldWrapper.dataset.fieldset = fd.Fieldset;
  return fieldWrapper;
}

const ids = [];
function generateFieldId(fd, suffix = '') {
  const slug = toClassName(`checklist-${fd.Name}${suffix}`);
  ids[slug] = ids[slug] || 0;
  const idSuffix = ids[slug] ? `-${ids[slug]}` : '';
  ids[slug] += 1;
  return `${slug}${idSuffix}`;
}

function setCommonAttributes(field, fd) {
  field.id = fd.Id;
  field.name = fd.Name;
  field.value = fd.Value || 'checked';
  field.dataset.priority = fd.Priority || 'normal';
  field.dataset.description = fd.Description || '';
}

/* eslint-disable no-use-before-define */

function createCompletionModal() {
  const modal = document.createElement('div');
  modal.id = 'checklist-completion-modal';
  modal.className = 'checklist-modal';

  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <div class="modal-icon">🎉</div>
      <h3 class="modal-title">Congratulations!</h3>
      <p class="modal-message">You are now ready to submit your resume!</p>
      <button class="modal-close" type="button">Continue</button>
    </div>
  `;

  return modal;
}

function resetChecklist(checklist) {
  const checkboxes = checklist.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  updateProgress(checklist);
}

function showCompletionModal(checklist) {
  let modal = document.getElementById('checklist-completion-modal');
  if (!modal) {
    modal = createCompletionModal();
    document.body.appendChild(modal);
  }

  modal.classList.add('show');
  document.body.classList.add('modal-open');

  const closeBtn = modal.querySelector('.modal-close');
  const overlay = modal.querySelector('.modal-overlay');

  function closeModal() {
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    resetChecklist(checklist);
  }

  closeBtn.replaceWith(closeBtn.cloneNode(true));
  overlay.replaceWith(overlay.cloneNode(true));

  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

  function handleEscape(e) {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  }
  document.addEventListener('keydown', handleEscape);
}

function updateProgress(checklist) {
  const checkboxes = checklist.querySelectorAll('input[type="checkbox"]');
  const checked = checklist.querySelectorAll('input[type="checkbox"]:checked');
  const total = checkboxes.length;
  const completed = checked.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const progressCircle = checklist.querySelector('.progress-circle');
  const progressText = checklist.querySelector('.progress-text');
  const progressCount = checklist.querySelector('.progress-count');

  if (progressCircle) {
    const circumference = 2 * Math.PI * 40;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    progressCircle.style.strokeDasharray = strokeDasharray;
    progressCircle.style.strokeDashoffset = strokeDashoffset;
  }

  if (progressText) {
    progressText.textContent = `${percentage}%`;
  }

  if (progressCount) {
    progressCount.textContent = `${completed} of ${total} completed`;
  }

  checklist.classList.toggle('all-completed', completed === total && total > 0);
  checklist.classList.toggle('partially-completed', completed > 0 && completed < total);
  checklist.classList.toggle('not-started', completed === 0);

  if (completed === total && total > 0 && completed > 0) {
    showCompletionModal(checklist);
  }
}

/* eslint-enable no-use-before-define */

const createChecklistItem = (fd, checklist) => {
  const field = document.createElement('input');
  field.type = 'checkbox';
  setCommonAttributes(field, fd);

  const fieldWrapper = createFieldWrapper(fd);
  fieldWrapper.classList.add('checklist-item');

  if (fd.Priority === 'high') {
    fieldWrapper.classList.add('priority-high');
  } else if (fd.Priority === 'medium') {
    fieldWrapper.classList.add('priority-medium');
  }

  const checkboxContainer = document.createElement('div');
  checkboxContainer.classList.add('checkbox-container');
  checkboxContainer.append(field);

  const checkmark = document.createElement('span');
  checkmark.classList.add('checkmark');
  checkboxContainer.append(checkmark);

  const contentWrapper = document.createElement('div');
  contentWrapper.classList.add('checklist-content');

  const title = document.createElement('h4');
  title.textContent = fd.Label || fd.Name;
  title.classList.add('checklist-title');

  contentWrapper.append(title);

  if (fd.Description) {
    const description = document.createElement('p');
    description.textContent = fd.Description;
    description.classList.add('checklist-description');
    contentWrapper.append(description);
  }

  fieldWrapper.append(checkboxContainer);
  fieldWrapper.append(contentWrapper);

  field.addEventListener('change', () => updateProgress(checklist));

  return { field, fieldWrapper };
};

const createHeading = (fd) => {
  const fieldWrapper = createFieldWrapper(fd);
  fieldWrapper.classList.add('checklist-heading-wrapper');

  const level = fd.Style && fd.Style.includes('sub-heading') ? 3 : 2;
  const heading = document.createElement(`h${level}`);
  heading.textContent = fd.Value || fd.Label;
  heading.id = fd.Id;
  heading.classList.add('checklist-heading');

  fieldWrapper.append(heading);

  return { field: heading, fieldWrapper };
};

const createPlaintext = (fd) => {
  const fieldWrapper = createFieldWrapper(fd);
  fieldWrapper.classList.add('checklist-text-wrapper');

  const text = document.createElement('p');
  text.textContent = fd.Value || fd.Label;
  text.id = fd.Id;
  text.classList.add('checklist-text');

  fieldWrapper.append(text);

  return { field: text, fieldWrapper };
};

function createProgressTracker() {
  const progressWrapper = document.createElement('div');
  progressWrapper.classList.add('progress-tracker');

  progressWrapper.innerHTML = `
    <div class="progress-header">
      <h3 class="progress-title">Your Progress</h3>
      <span class="progress-count">0 of 0 completed</span>
    </div>
    <div class="progress-circle-container">
      <svg class="progress-svg" width="100" height="100">
        <circle cx="50" cy="50" r="40" class="progress-track"></circle>
        <circle cx="50" cy="50" r="40" class="progress-circle"></circle>
      </svg>
      <span class="progress-text">0%</span>
    </div>
  `;

  return progressWrapper;
}

const CHECKLIST_FIELD_CREATOR_FUNCTIONS = {
  'checklist-item': createChecklistItem,
  checkbox: createChecklistItem, // Alias for backward compatibility
  heading: createHeading,
  plaintext: createPlaintext,
};

export default async function createChecklistField(fd, checklist) {
  fd.Id = fd.Id || generateFieldId(fd);
  const type = fd.Type.toLowerCase();
  const createFieldFunc = CHECKLIST_FIELD_CREATOR_FUNCTIONS[type] || createChecklistItem;
  const fieldElements = await createFieldFunc(fd, checklist);

  return fieldElements.fieldWrapper;
}

export { createProgressTracker, updateProgress, resetChecklist };
