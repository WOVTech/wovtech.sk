/**
 * Contact Form Handler
 * Spracovanie kontaktného formulára
 */

(function() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'form-message';
  messageDiv.style.display = 'none';

  // Insert message div after form
  form.parentNode.insertBefore(messageDiv, form.nextSibling);

  // Validation
  function validateForm(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
      errors.push('Meno je vyžadované (min. 2 znaky)');
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Zadajte platnú e-mailovú adresu');
    }

    if (!data.company || data.company.trim().length < 2) {
      errors.push('Názov firmy je vyžadovaný');
    }

    if (!data.message || data.message.trim().length < 10) {
      errors.push('Popis situácie musí obsahovať aspoň 10 znakov');
    }

    return errors;
  }

  // Show message
  function showMessage(text, type = 'success') {
    messageDiv.textContent = text;
    messageDiv.className = `form-message ${type}`;
    messageDiv.style.display = 'block';
    setTimeout(() => {
      messageDiv.style.opacity = '1';
    }, 10);
  }

  // Hide message
  function hideMessage() {
    messageDiv.style.display = 'none';
  }

  // Handle submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    hideMessage();

    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      company: formData.get('company'),
      service: formData.get('service'),
      message: formData.get('message'),
      privacy: formData.get('privacy')
    };

    // Validate
    const errors = validateForm(data);
    if (errors.length > 0) {
      showMessage(errors[0], 'error');
      return;
    }

    if (!data.privacy) {
      showMessage('Musíte súhlasiť s ochranou osobných údajov', 'error');
      return;
    }

    // Disable button
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Odosielam...';

    try {
      // Send via Formspree
      const response = await fetch('https://formspree.io/f/xaqlqnab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          service: data.service,
          message: data.message,
          _subject: `Nový dopyt z WOV Tech - ${data.name}`
        })
      });

      if (response.ok) {
        showMessage('✓ Ďakujeme! Vaša správa bola úspešne odoslaná. Odpovieme vám čo najskôr.', 'success');
        form.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showMessage('Chyba pri odosielaní. Prosím, skúste neskôr alebo napíšte priamo na kontakt@wovtech.sk', 'error');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  // Clear message on input
  form.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('focus', hideMessage);
  });
})();
