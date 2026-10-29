const fs = require('fs');
const path = require('path');

const files = [
  '404.html',
  'about/index.html',
  'blog/index.html',
  'contact/index.html',
  'faq/index.html',
  'get-quote/index.html',
  'network/index.html',
  'privacy-policy/index.html',
  'refund-and-cancellation/index.html',
  'services/bike-transport/index.html',
  'services/car-transport/index.html',
  'services/house-shifting/index.html',
  'services/index.html',
  'services/insurance/index.html',
  'services/office-shifting/index.html',
  'services/warehouse/index.html',
  'terms-and-conditions/index.html'
];

const newBottomBar = `  <!-- Mobile Bottom Action Bar (Fixed, below 768px only) -->
  <div class="mobile-bottom-bar" role="navigation" aria-label="Mobile Quick Actions">
    <a href="mailto:info@agarwalbestpackersmovers.in" class="bottom-bar-btn" aria-label="Email Us" data-site-email-href>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
      <span>Email</span>
    </a>
    <a href="https://wa.me/917404539417" class="bottom-bar-btn" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" data-site-whatsapp>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
      <span>Whatsapp</span>
    </a>
    <a href="/get-quote/" class="bottom-bar-btn" aria-label="Get Free Enquiry Quote">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
      <span>Enquiry</span>
    </a>
    <a href="tel:+917404539417" class="bottom-bar-btn" aria-label="Call Now" data-site-phone-href>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.053 15.053 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1A11.36 11.36 0 0 1 8.57 3.99c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.61c0-.55-.45-1-.99-1z"/></svg>
      <span>Call Now</span>
    </a>
    <a href="sms:+917404539417" class="bottom-bar-btn" aria-label="Send SMS" data-site-sms>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
      <span>SMS</span>
    </a>
  </div>`;

files.forEach(relPath => {
  const filePath = path.join(__dirname, '..', relPath);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove standalone Insurance from top-level header nav
  content = content.replace(/[ \t]*<li><a href="\/services\/insurance\/" class="nav-link[^"]*">Insurance<\/a><\/li>\r?\n?/g, '');

  // 2. Remove standalone Insurance from mobile drawer nav
  content = content.replace(/[ \t]*<li><a href="\/services\/insurance\/" class="drawer-nav-link[^"]*">Insurance<\/a><\/li>\r?\n?/g, '');

  // 3. Remove Govt. Registration & GST line from footer
  content = content.replace(/[ \t]*<p[^>]*>\s*Govt\.\s*Registration\s*&amp;\s*GST:\s*<mark class="placeholder-highlight">\[Licence \/ GST number\]<\/mark>\s*<\/p>\r?\n?/g, '');

  // 4. Change "About Our Company" to "About Us"
  content = content.replace(/<li><a href="\/about\/">About Our Company<\/a><\/li>/g, '<li><a href="/about/">About Us</a></li>');

  // 5. Update mobile bottom bar
  content = content.replace(/[ \t]*<!-- Mobile Bottom Action Bar[\s\S]*?<div class="mobile-bottom-bar"[\s\S]*?<\/div>/g, newBottomBar);

  // 6. Special updates for about/index.html
  if (relPath === 'about/index.html') {
    content = content.replace(/<mark class="placeholder-highlight">\[Years of experience\]<\/mark>/g, '15 Years');
    content = content.replace(/<mark class="placeholder-highlight">\[Trucks in fleet\]<\/mark>/g, '1500 Trucks');
    content = content.replace(/<mark class="placeholder-highlight">\[Team size\]<\/mark>/g, '258 Handlers');
    content = content.replace(/[ \t]*<li style="display:flex; gap:10px;">\s*<strong style="color:var\(--color-accent\);">&#10003;<\/strong>\s*<span><strong>Licence &amp; GST:<\/strong> <mark class="placeholder-highlight">\[Licence \/ GST number\]<\/mark><\/span>\s*<\/li>\r?\n?/g, '');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${relPath}`);
});
