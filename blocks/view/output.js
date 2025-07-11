 const data = JSON.parse(localStorage.getItem('formData'));

    if (data) {
      const container = document.getElementById('output');
      Object.entries(data).forEach(([key, value]) => {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${key}:</strong> ${value}`;
        container.appendChild(p);
      });
    } else {
      document.getElementById('output').textContent = 'No form data found in localStorage.';
    }

document.getElementById('output').textContent = JSON.stringify(data, null, 2);
export default async function decorate(block) {
  const data = JSON.parse(localStorage.getItem('formData'));
  if (!data) {
    block.textContent = 'No form data found.';
    return;
  }

  block.innerHTML = ''; // clear placeholder

  Object.entries(data).forEach(([key, value]) => {
    const p = document.createElement('p');
    p.innerHTML = `<strong>${key}:</strong> ${value}`;
    block.appendChild(p);
  });
}
