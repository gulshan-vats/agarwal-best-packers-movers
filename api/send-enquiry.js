/**
 * Vercel Serverless Function: /api/send-enquiry
 * Handles enquiry and quote submissions via Resend API (https://resend.com)
 *
 * Requirements:
 * - process.env.RESEND_API_KEY configured in Vercel or .env.local
 * - Validates name, 10-digit Indian mobile phone, email format, message length
 * - Honeypot anti-spam check ("website" field)
 * - Escapes all user inputs for HTML email & sends plain text alternative
 * - Basic in-memory rate limiting per IP
 */

// Basic in-memory rate limiting per IP (max 5 submissions per 10 minutes)
// NOTE: Vercel serverless instances are ephemeral and can spin up across instances.
// For persistent distributed rate limiting in production, use Vercel KV or Upstash Redis.
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

// Clean up old IP rate limit entries periodically
function cleanupRateLimits() {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now - data.startTime > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  }
}

// HTML escape helper to prevent HTML injection / XSS in email clients
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = async function handler(req, res) {
  // Enforce POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  // Determine client IP for rate limiting
  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = forwarded ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress || 'unknown';

  // Apply in-memory rate limit
  const now = Date.now();
  cleanupRateLimits();

  const ipRecord = rateLimitMap.get(clientIp);
  if (ipRecord) {
    if (now - ipRecord.startTime < RATE_LIMIT_WINDOW_MS) {
      if (ipRecord.count >= MAX_REQUESTS_PER_WINDOW) {
        return res.status(429).json({
          ok: false,
          error: 'Too many requests. Please wait a few minutes or call us directly at +91 74045 39417.'
        });
      }
      ipRecord.count++;
    } else {
      rateLimitMap.set(clientIp, { count: 1, startTime: now });
    }
  } else {
    rateLimitMap.set(clientIp, { count: 1, startTime: now });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { name, phone, email, service, message, website } = body;

    // 1. Honeypot check: If the "website" field has content, bot detected. Return 200 silently.
    if (website && typeof website === 'string' && website.trim().length > 0) {
      return res.status(200).json({ ok: true, note: 'Submission accepted.' });
    }

    // 2. Server-side validation: Name
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ ok: false, error: 'Please provide a valid full name (2 to 100 characters).' });
    }

    // 3. Server-side validation: 10-digit Indian mobile number
    // Allows optional +91 or 0 prefix, followed by 6, 7, 8, or 9 and 9 digits.
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ ok: false, error: 'Phone number is required.' });
    }
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const indianPhoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
    if (!indianPhoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        ok: false,
        error: 'Please enter a valid 10-digit Indian mobile phone number (e.g. 7404539417 or +91 74045 39417).'
      });
    }

    // 4. Server-side validation: Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && (typeof email !== 'string' || !emailRegex.test(email.trim()) || email.length > 150)) {
      return res.status(400).json({ ok: false, error: 'Please provide a valid email address.' });
    }

    // 5. Server-side validation: Message length limit
    if (message && typeof message === 'string' && message.length > 5000) {
      return res.status(400).json({ ok: false, error: 'Message exceeds maximum length of 5000 characters.' });
    }

    // Read Resend API Key
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY environment variable is not set.');
      return res.status(500).json({
        ok: false,
        error: 'Email delivery service is currently being configured. Please call or WhatsApp us directly at +91 74045 39417.'
      });
    }

    const sanitizedName = escapeHtml(name.trim());
    const sanitizedPhone = escapeHtml(cleanPhone);
    const sanitizedEmail = email ? escapeHtml(email.trim()) : 'Not provided';
    const sanitizedService = escapeHtml((service || 'General Relocation Enquiry').trim());
    const sanitizedMessage = escapeHtml((message || 'No additional details provided.').trim());

    // Build plain text version
    const textContent = `
New Moving Enquiry Received - Agarwal Best Packers and Movers
=============================================================
Service Requested: ${sanitizedService}
Customer Name:     ${name.trim()}
Phone Number:      ${cleanPhone}
Email Address:     ${email ? email.trim() : 'Not provided'}

Enquiry / Move Details:
${message ? message.trim() : 'No additional details.'}

Client IP: ${clientIp}
Timestamp: ${new Date().toISOString()}
    `.trim();

    // Build rich HTML email
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Relocation Enquiry</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 39, 68, 0.08);">
    <div style="background-color: #0f2744; color: #ffffff; padding: 24px; text-align: center;">
      <h2 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #ffffff;">Agarwal Best Packers and Movers</h2>
      <p style="margin: 0; font-size: 14px; color: #dc2626; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">New Relocation Enquiry Received</p>
    </div>
    <div style="padding: 24px;">
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 15px;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 140px; font-weight: 600;">Service:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f2744; font-weight: 700;">${sanitizedService}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">Customer Name:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f2744; font-weight: 700;">${sanitizedName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">Phone Number:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f2744; font-weight: 700;">
            <a href="tel:${sanitizedPhone}" style="color: #dc2626; text-decoration: none;">${sanitizedPhone}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">Email:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f2744;">
            ${email ? `<a href="mailto:${sanitizedEmail}" style="color: #0f2744;">${sanitizedEmail}</a>` : '<span style="color:#94a3b8;">Not provided</span>'}
          </td>
        </tr>
      </table>

      <div style="background-color: #f8fafc; border-left: 4px solid #dc2626; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; color: #475569;">Move &amp; Requirement Details:</h4>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #1e293b;">${sanitizedMessage}</p>
      </div>

      <div style="text-align: center; margin-top: 16px;">
        <a href="tel:${sanitizedPhone}" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; font-weight: 700; padding: 12px 24px; border-radius: 6px; margin-right: 8px;">Call Customer Now</a>
        <a href="https://wa.me/${sanitizedPhone.replace(/[^0-9]/g, '')}" style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; font-weight: 700; padding: 12px 24px; border-radius: 6px;">WhatsApp Customer</a>
      </div>
    </div>
    <div style="background-color: #f1f5f9; padding: 12px 24px; font-size: 12px; color: #64748b; text-align: center;">
      Agarwal Best Packers and Movers | Manikonda, Hyderabad 500089 | Direct: +91 74045 39417
    </div>
  </div>
</body>
</html>
    `.trim();

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Agarwal Best Packers <enquiry@agarwalbestpackersmovers.in>',
        to: ['info@agarwalbestpackersmovers.in'],
        reply_to: email && email.trim() ? email.trim() : 'info@agarwalbestpackersmovers.in',
        subject: `New enquiry: ${service || 'General'} from ${name.trim()}`,
        html: htmlContent,
        text: textContent
      })
    });

    const resendData = await resendResponse.json().catch(() => ({}));

    if (!resendResponse.ok) {
      console.error('Resend API returned error:', resendData);
      return res.status(502).json({
        ok: false,
        error: 'Email dispatch service could not complete the request. Please call or WhatsApp us directly at +91 74045 39417.'
      });
    }

    return res.status(200).json({ ok: true, id: resendData.id });
  } catch (error) {
    // Never expose raw stack traces to the client
    console.error('Unhandled server error in /api/send-enquiry:', error?.message || error);
    return res.status(500).json({
      ok: false,
      error: 'An unexpected internal error occurred. Please contact us at +91 74045 39417.'
    });
  }
};
