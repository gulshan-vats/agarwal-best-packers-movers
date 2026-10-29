const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

const allHtmlFiles = [
  'index.html',
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

allHtmlFiles.forEach(relPath => {
  const filePath = path.join(rootDir, relPath);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove header phone number link from header-actions (keep only Get a Free Quote button)
  content = content.replace(
    /[ \t]*<a href="tel:[^"]*" class="header-phone"[^>]*>[\s\S]*?<\/a>\r?\n?/g,
    ''
  );

  // 2. Remove all remaining GST/Licence lines (any variant still present)
  content = content.replace(
    /[ \t]*<p[^>]*>\s*Govt\.?\s*Registration\s*&amp;\s*GST:[\s\S]*?<\/p>\r?\n?/g,
    ''
  );
  content = content.replace(
    /[ \t]*<li[^>]*>[\s\S]*?Licence\s*&amp;\s*GST:[\s\S]*?<\/li>\r?\n?/g,
    ''
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${relPath}`);
});

console.log('\nAll done!');
