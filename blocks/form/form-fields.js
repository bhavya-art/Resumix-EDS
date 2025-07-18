import { toClassName } from '../../scripts/aem.js';

function createFieldWrapper(fd) {
  const fieldWrapper = document.createElement('div');
  if (fd.Style) fieldWrapper.className = fd.Style;
  fieldWrapper.classList.add('field-wrapper', `${fd.Type}-wrapper`);

  fieldWrapper.dataset.fieldset = fd.Fieldset;

  return fieldWrapper;
}

const ids = [];
function generateFieldId(fd, suffix = '') {
  const slug = toClassName(`form-${fd.Name}${suffix}`);
  ids[slug] = ids[slug] || 0;
  const idSuffix = ids[slug] ? `-${ids[slug]}` : '';
  ids[slug] += 1;
  return `${slug}${idSuffix}`;
}

function createLabel(fd) {
  const label = document.createElement('label');
  label.id = generateFieldId(fd, '-label');
  label.textContent = fd.Label || fd.Name;
  label.setAttribute('for', fd.Id);
  if (fd.Mandatory.toLowerCase() === 'true' || fd.Mandatory.toLowerCase() === 'x') {
    label.dataset.required = true;
  }
  return label;
}

function setCommonAttributes(field, fd) {
  field.id = fd.Id;
  field.name = fd.Name;
  field.required = fd.Mandatory && (fd.Mandatory.toLowerCase() === 'true' || fd.Mandatory.toLowerCase() === 'x');
  field.placeholder = fd.Placeholder;
  field.value = fd.Value;
}

const createHeading = (fd) => {
  const fieldWrapper = createFieldWrapper(fd);

  const level = fd.Style && fd.Style.includes('sub-heading') ? 3 : 2;
  const heading = document.createElement(`h${level}`);
  heading.textContent = fd.Value || fd.Label;
  heading.id = fd.Id;

  fieldWrapper.append(heading);

  return { field: heading, fieldWrapper };
};

const createPlaintext = (fd) => {
  const fieldWrapper = createFieldWrapper(fd);

  const text = document.createElement('p');
  text.textContent = fd.Value || fd.Label;
  text.id = fd.Id;

  fieldWrapper.append(text);

  return { field: text, fieldWrapper };
};

const createSelect = async (fd) => {
  const select = document.createElement('select');
  setCommonAttributes(select, fd);
  const addOption = ({ text, value }) => {
    const option = document.createElement('option');
    option.text = text.trim();
    option.value = value.trim();
    if (option.value === fd.Value) {
      option.setAttribute('selected', '');
    }
    select.add(option);
    return option;
  };

  if (fd.Placeholder) {
    const ph = addOption({ text: fd.Placeholder, value: '' });
    ph.setAttribute('disabled', '');
  }

  if (fd.Options) {
    let options = [];
    if (fd.Options.startsWith('https://')) {
      const optionsUrl = new URL(fd.Options);
      const resp = await fetch(`${optionsUrl.pathname}${optionsUrl.search}`);
      const json = await resp.json();
      json.data.forEach((opt) => {
        options.push({
          text: opt.Option,
          value: opt.Value || opt.Option,
        });
      });
    } else {
      options = fd.Options.split(',').map((opt) => ({
        text: opt.trim(),
        value: opt.trim(),
      }));
    }

    options.forEach((opt) => addOption(opt));
  }

  const fieldWrapper = createFieldWrapper(fd);
  fieldWrapper.append(select);
  fieldWrapper.prepend(createLabel(fd));

  return { field: select, fieldWrapper };
};

const createConfirmation = (fd, form) => {
  form.dataset.confirmation = new URL(fd.Value).pathname;

  return {};
};

const createSubmit = (fd) => {
  const button = document.createElement('button');
  button.textContent = fd.Label || fd.Name;
  button.classList.add('button');
  button.type = 'submit';

  const fieldWrapper = createFieldWrapper(fd);
  fieldWrapper.append(button);
  return { field: button, fieldWrapper };
};

const createTextArea = (fd) => {
  const field = document.createElement('textarea');
  setCommonAttributes(field, fd);

  const fieldWrapper = createFieldWrapper(fd);
  const label = createLabel(fd);
  field.setAttribute('aria-labelledby', label.id);
  fieldWrapper.append(field);
  fieldWrapper.prepend(label);

  return { field, fieldWrapper };
};

const createInput = (fd) => {
  const field = document.createElement('input');
  field.type = fd.Type;
  setCommonAttributes(field, fd);

  const fieldWrapper = createFieldWrapper(fd);
  const label = createLabel(fd);
  field.setAttribute('aria-labelledby', label.id);
  fieldWrapper.append(field);
  if (fd.Type === 'radio' || fd.Type === 'checkbox') {
    fieldWrapper.append(label);
  } else {
    fieldWrapper.prepend(label);
  }

  return { field, fieldWrapper };
};

const createFieldset = (fd) => {
  const field = document.createElement('fieldset');
  setCommonAttributes(field, fd);

  if (fd.Label) {
    const legend = document.createElement('legend');
    legend.textContent = fd.Label;
    field.append(legend);
  }

  const fieldWrapper = createFieldWrapper(fd);
  fieldWrapper.append(field);

  return { field, fieldWrapper };
};

const createToggle = (fd) => {
  const { field, fieldWrapper } = createInput(fd);
  field.type = 'checkbox';
  if (!field.value) field.value = 'on';
  field.classList.add('toggle');
  fieldWrapper.classList.add('selection-wrapper');

  const toggleSwitch = document.createElement('div');
  toggleSwitch.classList.add('switch');
  toggleSwitch.append(field);
  fieldWrapper.append(toggleSwitch);

  const slider = document.createElement('span');
  slider.classList.add('slider');
  toggleSwitch.append(slider);
  slider.addEventListener('click', () => {
    field.checked = !field.checked;
  });

  return { field, fieldWrapper };
};

// const createCheckbox = (fd, form) => {
//   const { field, fieldWrapper } = createInput(fd);
//   if (!field.value) field.value = 'checked';
//   fieldWrapper.classList.add('selection-wrapper');

//   setTimeout(() => handleCheckboxCompletionModal(form), 0);

//   return { field, fieldWrapper };
// };

const createRadio = (fd) => {
  const { field, fieldWrapper } = createInput(fd);
  if (!field.value) field.value = fd.Label || 'on';
  fieldWrapper.classList.add('selection-wrapper');

  return { field, fieldWrapper };
};

const FIELD_CREATOR_FUNCTIONS = {
  select: createSelect,
  heading: createHeading,
  plaintext: createPlaintext,
  'text-area': createTextArea,
  toggle: createToggle,
  submit: createSubmit,
  confirmation: createConfirmation,
  fieldset: createFieldset,
  // checkbox: createCheckbox,
  radio: createRadio,
};

export default async function createField(fd, form) {
  fd.Id = fd.Id || generateFieldId(fd);
  const type = fd.Type.toLowerCase();
  const createFieldFunc = FIELD_CREATOR_FUNCTIONS[type] || createInput;
  const fieldElements = await createFieldFunc(fd, form);

  return fieldElements.fieldWrapper;
}

// function handleCheckboxCompletionMessage(form) {
//   const checkboxes = form.querySelectorAll('input[type="checkbox"]');
//   if (!checkboxes.length) return;

//   let message = form.querySelector('.checkbox-complete-message');
//   if (!message) {
//     message = document.createElement('p');
//     message.className = 'checkbox-complete-message';
//     message.style.color = 'green';
//     message.style.fontWeight = 'bold';
//     message.style.marginTop = '1em';
//     message.style.display = 'none';
//     message.textContent = '✅ You are now ready to submit your resume!';
//     form.append(message);
//   }

//   function updateMessage() {
//     const allChecked = [...checkboxes].every((cb) => cb.checked);
//     message.style.display = allChecked ? 'block' : 'none';
//   }

//   checkboxes.forEach((cb) => cb.addEventListener('change', updateMessage));
// }

// function handleCheckboxCompletionModal(form) {
//   const checkboxes = form.querySelectorAll('input[type="checkbox"]');
//   if (!checkboxes.length) return;

//   // Create modal only once
//   let modal = document.querySelector('#checkbox-modal');
//   if (!modal) {
//     modal = document.createElement('div');
//     modal.id = 'checkbox-modal';
//     modal.innerHTML = `
//       <div class="modal-backdrop"></div>
//       <div class="modal-content">
//         <p>✅ You are now ready to submit your resume!</p>
//         <button id="close-modal">Close</button>
//       </div>
//     `;
//     document.body.appendChild(modal);

//     // Close functionality
//     modal.querySelector('#close-modal').addEventListener('click', () => {
//       modal.style.display = 'none';
//     });
//     modal.querySelector('.modal-backdrop').addEventListener('click', () => {
//       modal.style.display = 'none';
//     });
//   }

//   function updateModal() {
//     const allChecked = [...checkboxes].every((cb) => cb.checked);
//     if (allChecked) {
//       modal.style.display = 'flex';
//     }
//   }

//   checkboxes.forEach((cb) => cb.addEventListener('change', updateModal));
// }
// function setupCheckboxModal(form) {
//   const checkboxes = form.querySelectorAll('input[type="checkbox"]');
//   const modal = document.getElementById('checkbox-modal');
//   const closeBtn = modal.querySelector('#close-modal');
//   const overlay = modal.querySelector('.modal-overlay');

//   function checkAllChecked() {
//     const allChecked = [...checkboxes].every((cb) => cb.checked);
//     if (allChecked) {
//       modal.classList.add('show');
//     }
//   }

//   function closeModalAndReset() {
//     modal.classList.remove('show');
//     checkboxes.forEach((cb) => (cb.checked = false));
//   }

//   checkboxes.forEach((cb) => cb.addEventListener('change', checkAllChecked));
//   closeBtn.addEventListener('click', closeModalAndReset);
//   overlay.addEventListener('click', closeModalAndReset);
// }
