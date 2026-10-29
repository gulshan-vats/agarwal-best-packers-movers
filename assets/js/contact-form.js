/**
 * Agarwal Best Packers and Movers - Contact Form Handler
 * Validates inputs client-side, submits JSON to /api/send-enquiry,
 * and handles success, error, and WhatsApp/mailto fallbacks.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form') || document.getElementById('quick-enquiry-form');
  if (!form) return;

  const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const statusBox = form.querySelector('.form-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send Enquiry';

  const showStatus = (type, message, htmlSuffix = '') => {
    if (!statusBox) return;
    statusBox.className = `form-status form-status--${type} show`;
    statusBox.innerHTML = message + htmlSuffix;
    statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const clearStatus = () => {
    if (!statusBox) return;
    statusBox.className = 'form-status';
    statusBox.innerHTML = '';
  };

  // Helper for WhatsApp fallback url
  const getWhatsAppFallback = (formData) => {
    const phone = window.SITE_CONFIG ? window.SITE_CONFIG.whatsappNumber : '917404539417';
    const text = `Hello Agarwal Best Packers and Movers,%0A%0AI would like to enquire about moving services:%0A` +
      `*Name:* ${encodeURIComponent(formData.name)}%0A` +
      `*Phone:* ${encodeURIComponent(formData.phone)}%0A` +
      `*Email:* ${encodeURIComponent(formData.email || 'N/A')}%0A` +
      `*Service:* ${encodeURIComponent(formData.service || 'Moving enquiry')}%0A` +
      `*Message:* ${encodeURIComponent(formData.message || 'Please contact me regarding my move.')}`;
    return `https://wa.me/${phone}?text=${text}`;
  };

  // Helper for Mailto fallback
  const getMailtoFallback = (formData) => {
    const toEmail = 'gulshankumar2842@gmail.com';
    const subject = encodeURIComponent(`Moving Enquiry: ${formData.service || 'Relocation'} - ${formData.name}`);
    const body = encodeURIComponent(
      `Hello Agarwal Best Packers Team,\n\nName: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nService: ${formData.service}\nDetails: ${formData.message}`
    );
    return `mailto:${toEmail}?subject=${subject}&body=${body}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearStatus();

    // Extract form values
    const nameInput = form.querySelector('[name="name"]');
    const phoneInput = form.querySelector('[name="phone"]');
    const emailInput = form.querySelector('[name="email"]');
    const serviceInput = form.querySelector('[name="service"]');
    const messageInput = form.querySelector('[name="message"]');
    const websiteHoneypot = form.querySelector('[name="website"]');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const service = serviceInput ? serviceInput.value.trim() : 'General Enquiry';
    const message = messageInput ? messageInput.value.trim() : '';
    const website = websiteHoneypot ? websiteHoneypot.value.trim() : '';

    // Client-side Validations
    let hasError = false;

    if (!name || name.length < 2) {
      if (nameInput) nameInput.classList.add('is-invalid');
      hasError = true;
    } else {
      if (nameInput) nameInput.classList.remove('is-invalid');
    }

    // Clean phone number: remove spaces and hyphens
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      if (phoneInput) phoneInput.classList.add('is-invalid');
      hasError = true;
    } else {
      if (phoneInput) phoneInput.classList.remove('is-invalid');
    }

    if (email && !emailRegex.test(email)) {
      if (emailInput) emailInput.classList.add('is-invalid');
      hasError = true;
    } else {
      if (emailInput) emailInput.classList.remove('is-invalid');
    }

    if (hasError) {
      showStatus('error', 'Please enter a valid name and a 10-digit Indian mobile number.');
      return;
    }

    const payload = {
      name,
      phone: cleanPhone,
      email: email || '',
      service,
      message,
      website // Honeypot
    };

    // UI Loading State
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite; display: inline-block; vertical-align: middle;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10"></path>
        </svg> Sending Enquiry...
      `;
    }

    try {
      const response = await fetch('/api/send-enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.ok) {
        showStatus('success', '<strong>Thank you!</strong> Your enquiry has been received. Our Hyderabad moving expert will call you shortly with your free estimate.');
        form.reset();
      } else {
        const errorMsg = result.error || 'Unable to submit enquiry at this time.';
        const waLink = getWhatsAppFallback(payload);
        const mailLink = getMailtoFallback(payload);

        showStatus(
          'error',
          `<strong>Notice:</strong> ${errorMsg}`,
          `<div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-whatsapp" style="text-decoration:none;">Send via WhatsApp</a>
            <a href="${mailLink}" class="btn btn-sm btn-secondary" style="text-decoration:none;">Send via Email</a>
          </div>`
        );
      }
    } catch (err) {
      const waLink = getWhatsAppFallback(payload);
      const mailLink = getMailtoFallback(payload);
      showStatus(
        'error',
        '<strong>Network error:</strong> We could not connect to the server right now.',
        `<div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-whatsapp" style="text-decoration:none;">Send via WhatsApp</a>
          <a href="${mailLink}" class="btn btn-sm btn-secondary" style="text-decoration:none;">Send via Email</a>
        </div>`
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });
});
