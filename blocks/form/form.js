import createField from './form-fields.js';

async function createForm(formHref, submitHref) {
  const { pathname } = new URL(formHref);
  const resp = await fetch(pathname);
  const json = await resp.json();

  const form = document.createElement('form');
  form.dataset.action = submitHref;

  const errorMessage = document.createElement('p');
  errorMessage.className = 'form-error-message';
  errorMessage.style.display = 'none';
  errorMessage.style.color = 'red';
  errorMessage.style.marginBottom = '1em';
  form.append(errorMessage);

  const fields = await Promise.all(json.data.map((fd) => createField(fd, form)));
  fields.forEach((field) => {
    if (field) form.append(field);
  });

  const fieldsets = form.querySelectorAll('fieldset');
  fieldsets.forEach((fieldset) => {
    form.querySelectorAll(`[data-fieldset="${fieldset.name}"]`).forEach((field) => {
      fieldset.append(field);
    });
  });

  // ✅ Disable submit button immediately after form is built
  setTimeout(() => {
    const submit = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submit) {
      submit.disabled = true;
      submit.classList.add('disabled');
      submit.style.pointerEvents = 'none';
      submit.style.opacity = '0.6';
    }
  }, 0);

  return form;
}

function generatePayload(form) {
  const payload = {};
  [...form.elements].forEach((field) => {
    if (field.name && field.type !== 'submit' && !field.disabled) {
      if (field.type === 'radio') {
        if (field.checked) payload[field.name] = field.value;
      } else if (field.type === 'checkbox') {
        if (field.checked) {
          payload[field.name] = payload[field.name] ? `${payload[field.name]},${field.value}` : field.value;
        }
      } else {
        payload[field.name] = field.value;
      }
    }
  });
  return payload;
}

function validateFormFields(form, validateAll = false) {
  let isValid = true;
  const errorMessage = form.querySelector('.form-error-message');

  [...form.elements].forEach((field) => {
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) existingError.remove();
    field.classList.remove('error');

    let message = '';
    const fieldValue = field.value.trim();
    const hasBeenTouched = field.dataset.touched === 'true';

    if ((field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') && field.required && !fieldValue) {
      if (validateAll || hasBeenTouched) message = 'This field is required.';
    } else if (field.name.toLowerCase() === 'email' && fieldValue && (validateAll || hasBeenTouched)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(fieldValue)) message = 'Please enter a valid email address.';
    } else if (field.name.toLowerCase() === 'password' && fieldValue && (validateAll || hasBeenTouched)) {
      if (fieldValue.length < 8) message = 'Password must be at least 8 characters.';
    }

    if (message) {
      isValid = false;
      field.classList.add('error');
      const msg = document.createElement('div');
      msg.className = 'field-error';
      msg.style.color = 'red';
      msg.style.fontSize = '0.8rem';
      msg.style.marginTop = '0.25rem';
      msg.textContent = message;
      field.parentElement.appendChild(msg);
    }
  });

  errorMessage.style.display = (!isValid && validateAll) ? 'block' : 'none';
  return isValid;
}

function checkAllRequiredFields(form) {
  let allValid = true;
  const processedRadioGroups = new Set();

  [...form.elements].forEach((field) => {
    if (field.type === 'submit' || field.disabled) return;

    if ((field.tagName === 'INPUT' && ['text', 'email', 'password'].includes(field.type))
        || field.tagName === 'TEXTAREA' || field.tagName === 'SELECT') {
      if (field.required) {
        const fieldValue = field.value.trim();

        if (!fieldValue) {
          allValid = false;
          return;
        }

        if (field.type === 'email' || field.name.toLowerCase() === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(fieldValue)) {
            allValid = false;
            return;
          }
        }

        if (field.type === 'password' || field.name.toLowerCase() === 'password') {
          if (fieldValue.length < 8) {
            allValid = false;
            return;
          }
        }
      }
    }

    if (field.type === 'radio' && field.required && !processedRadioGroups.has(field.name)) {
      processedRadioGroups.add(field.name);
      const radioGroup = form.querySelectorAll(`input[name="${field.name}"]`);
      const isAnyChecked = [...radioGroup].some((radio) => radio.checked);
      if (!isAnyChecked) {
        allValid = false;
        return;
      }
    }

    if (field.type === 'checkbox' && field.required && !field.checked) {
      allValid = false;
    }
  });

  return allValid;
}

function isFormValid(form) {
  return validateFormFields(form, true);
}

function updateSubmitState(form) {
  const submit = form.querySelector('button[type="submit"], input[type="submit"]');
  if (!submit) return;

  const allFieldsValid = checkAllRequiredFields(form);

  submit.disabled = !allFieldsValid;
  submit.classList.toggle('disabled', !allFieldsValid);
  submit.style.pointerEvents = allFieldsValid ? '' : 'none';
  submit.style.opacity = allFieldsValid ? '' : '0.6';
}

async function handleSubmit(form) {
  if (!checkAllRequiredFields(form)) return false;
  if (!validateFormFields(form, true)) return false;

  const submit = form.querySelector('button[type="submit"], input[type="submit"]');
  try {
    form.setAttribute('data-submitting', 'true');
    submit.disabled = true;

    const payload = generatePayload(form);
    localStorage.setItem('formData', JSON.stringify(payload));
    window.location.href = '/nextpage';
  } catch (e) {
    // console.error('Form submission error:', e);
    return false;
  } finally {
    form.setAttribute('data-submitting', 'false');
    updateSubmitState(form);
  }

  return true;
}

export default async function decorate(block) {
  const links = [...block.querySelectorAll('a')].map((a) => a.href);
  const formLink = links.find((link) => link.startsWith(window.location.origin) && link.endsWith('.json'));
  const submitLink = links.find((link) => link !== formLink);
  if (!formLink || !submitLink) return;

  const form = await createForm(formLink, submitLink);
  block.replaceChildren(form);

  [...form.elements].forEach((field) => {
    if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
      field.addEventListener('blur', () => {
        field.dataset.touched = 'true';
        validateFormFields(form, false);
        updateSubmitState(form);
      });

      field.addEventListener('input', () => {
        field.dataset.touched = 'true';
        validateFormFields(form, false);
        updateSubmitState(form);
      });
    }

    if (field.type === 'radio' || field.type === 'checkbox') {
      field.addEventListener('change', () => {
        field.dataset.touched = 'true';
        validateFormFields(form, false);
        updateSubmitState(form);
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const requiredFieldsValid = checkAllRequiredFields(form);
    const allFieldsValid = isFormValid(form);

    if (!requiredFieldsValid || !allFieldsValid) {
      updateSubmitState(form);
      return false;
    }

    return handleSubmit(form);
  });

  [...form.elements].forEach((field) => {
    if (field.tagName === 'INPUT' && field.type !== 'submit') {
      field.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const requiredFieldsValid = checkAllRequiredFields(form);
          const allFieldsValid = isFormValid(form);

          if (requiredFieldsValid && allFieldsValid) {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          }
        }
      });
    }
  });

  // ✅ Ensure the button is checked at the very end after DOM is ready
  setTimeout(() => updateSubmitState(form), 100);
}
