/**
 * Agarwal Best Packers and Movers - Multi-Step Quote Calculator / Form
 * Supports 3-step navigation, client-side validation, POST to /api/send-enquiry,
 * and prefilled WhatsApp / mailto fallbacks.
 */

document.addEventListener('DOMContentLoaded', () => {
  const quoteForm = document.getElementById('multistep-quote-form');
  if (!quoteForm) return;

  const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const steps = quoteForm.querySelectorAll('.wizard-step-panel');
  const stepIndicators = document.querySelectorAll('.wizard-step-item');
  const statusBox = quoteForm.querySelector('.form-status');
  const submitBtn = quoteForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit Quote Request';

  let currentStep = 1;
  const totalSteps = steps.length;

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

  const updateWizardUI = () => {
    steps.forEach((step, index) => {
      const stepNum = index + 1;
      if (stepNum === currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    stepIndicators.forEach((ind, index) => {
      const stepNum = index + 1;
      ind.classList.remove('active', 'completed');
      if (stepNum === currentStep) {
        ind.classList.add('active');
      } else if (stepNum < currentStep) {
        ind.classList.add('completed');
      }
    });
  };

  const validateStep = (stepNumber) => {
    clearStatus();
    if (stepNumber === 1) {
      const moveType = quoteForm.querySelector('[name="moveType"]');
      const fromCity = quoteForm.querySelector('[name="fromCity"]');
      const toCity = quoteForm.querySelector('[name="toCity"]');

      if (!moveType || !moveType.value) {
        showStatus('error', 'Please select your move type.');
        return false;
      }
      if (!fromCity || fromCity.value.trim().length < 2) {
        showStatus('error', 'Please specify the pickup location or city.');
        fromCity && fromCity.focus();
        return false;
      }
      if (!toCity || toCity.value.trim().length < 2) {
        showStatus('error', 'Please specify the destination city.');
        toCity && toCity.focus();
        return false;
      }
      return true;
    }

    if (stepNumber === 2) {
      const moveDate = quoteForm.querySelector('[name="moveDate"]');
      const propertySize = quoteForm.querySelector('[name="propertySize"]');

      if (!moveDate || !moveDate.value) {
        showStatus('error', 'Please select an approximate moving date.');
        moveDate && moveDate.focus();
        return false;
      }
      if (!propertySize || !propertySize.value) {
        showStatus('error', 'Please select your property size / volume.');
        propertySize && propertySize.focus();
        return false;
      }
      return true;
    }

    if (stepNumber === 3) {
      const name = quoteForm.querySelector('[name="name"]');
      const phone = quoteForm.querySelector('[name="phone"]');
      const email = quoteForm.querySelector('[name="email"]');

      if (!name || name.value.trim().length < 2) {
        showStatus('error', 'Please enter your full name.');
        name && name.focus();
        return false;
      }

      const cleanPhone = phone ? phone.value.trim().replace(/[\s-]/g, '') : '';
      if (!phoneRegex.test(cleanPhone)) {
        showStatus('error', 'Please enter a valid 10-digit Indian mobile number.');
        phone && phone.focus();
        return false;
      }

      if (email && email.value.trim() && !emailRegex.test(email.value.trim())) {
        showStatus('error', 'Please enter a valid email address.');
        email && email.focus();
        return false;
      }
      return true;
    }

    return true;
  };

  // Next Step Buttons
  quoteForm.querySelectorAll('[data-next-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
          currentStep++;
          updateWizardUI();
          quoteForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Previous Step Buttons
  quoteForm.querySelectorAll('[data-prev-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        clearStatus();
        updateWizardUI();
      }
    });
  });

  // Format form data payload
  const buildPayload = () => {
    const moveType = quoteForm.querySelector('[name="moveType"]')?.value || 'House Shifting';
    const fromCity = quoteForm.querySelector('[name="fromCity"]')?.value || '';
    const toCity = quoteForm.querySelector('[name="toCity"]')?.value || '';
    const moveDate = quoteForm.querySelector('[name="moveDate"]')?.value || '';
    const propertySize = quoteForm.querySelector('[name="propertySize"]')?.value || '';

    // Collect extra services checkboxes
    const extras = [];
    quoteForm.querySelectorAll('[name="extraServices"]:checked').forEach(cb => extras.push(cb.value));

    const name = quoteForm.querySelector('[name="name"]')?.value.trim() || '';
    const phone = quoteForm.querySelector('[name="phone"]')?.value.trim().replace(/[\s-]/g, '') || '';
    const email = quoteForm.querySelector('[name="email"]')?.value.trim() || '';
    const notes = quoteForm.querySelector('[name="notes"]')?.value.trim() || '';
    const website = quoteForm.querySelector('[name="website"]')?.value.trim() || '';

    const detailsMessage = [
      `Pickup: ${fromCity}`,
      `Destination: ${toCity}`,
      `Target Date: ${moveDate}`,
      `Size: ${propertySize}`,
      `Additional Services: ${extras.length > 0 ? extras.join(', ') : 'None'}`,
      notes ? `Customer Notes: ${notes}` : ''
    ].filter(Boolean).join('\n');

    return {
      name,
      phone,
      email,
      service: `${moveType} (${fromCity} to ${toCity})`,
      message: detailsMessage,
      website
    };
  };

  const getWhatsAppLink = (p) => {
    const waNumber = window.SITE_CONFIG ? window.SITE_CONFIG.whatsappNumber : '917404539417';
    const text = `Hello Agarwal Best Packers,%0A%0AI would like a quotation for moving:%0A` +
      `*Name:* ${encodeURIComponent(p.name)}%0A` +
      `*Phone:* ${encodeURIComponent(p.phone)}%0A` +
      `*Service:* ${encodeURIComponent(p.service)}%0A` +
      `*Details:*%0A${encodeURIComponent(p.message)}`;
    return `https://wa.me/${waNumber}?text=${text}`;
  };

  const getMailtoLink = (p) => {
    const toEmail = window.SITE_CONFIG ? window.SITE_CONFIG.email : 'info@agarwalbestpackersmovers.in';
    const subject = encodeURIComponent(`Moving Quote Request: ${p.service} - ${p.name}`);
    const body = encodeURIComponent(
      `Customer Name: ${p.name}\nPhone: ${p.phone}\nEmail: ${p.email}\nService: ${p.service}\n\nDetails:\n${p.message}`
    );
    return `mailto:${toEmail}?subject=${subject}&body=${body}`;
  };

  // Submit Handler
  quoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    const payload = buildPayload();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite; display: inline-block; vertical-align: middle;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10"></path>
        </svg> Calculating & Submitting...
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
        showStatus(
          'success',
          `<strong>Quote Request Submitted Successfully!</strong><br>` +
          `Thank you, ${payload.name}. Our relocation supervisor will review your route from <strong>${quoteForm.querySelector('[name="fromCity"]').value}</strong> to <strong>${quoteForm.querySelector('[name="toCity"]').value}</strong> and call you with an itemized, transparent quote.`
        );
        quoteForm.reset();
        currentStep = 1;
        updateWizardUI();
      } else {
        const err = result.error || 'Server was unable to process quote request.';
        const wa = getWhatsAppLink(payload);
        const mail = getMailtoLink(payload);

        showStatus(
          'error',
          `<strong>Notice:</strong> ${err}`,
          `<div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
            <a href="${wa}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-whatsapp">Send Quote to WhatsApp</a>
            <a href="${mail}" class="btn btn-sm btn-secondary">Send Quote via Email</a>
          </div>`
        );
      }
    } catch (err) {
      const wa = getWhatsAppLink(payload);
      const mail = getMailtoLink(payload);
      showStatus(
        'error',
        '<strong>Network error:</strong> Connection could not be established.',
        `<div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="${wa}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-whatsapp">Send Quote to WhatsApp</a>
          <a href="${mail}" class="btn btn-sm btn-secondary">Send Quote via Email</a>
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
