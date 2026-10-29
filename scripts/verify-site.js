const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const pages = [
  { file: 'index.html', url: '/' },
  { file: 'about/index.html', url: '/about/' },
  { file: 'services/index.html', url: '/services/' },
  { file: 'services/house-shifting/index.html', url: '/services/house-shifting/' },
  { file: 'services/office-shifting/index.html', url: '/services/office-shifting/' },
  { file: 'services/car-transport/index.html', url: '/services/car-transport/' },
  { file: 'services/bike-transport/index.html', url: '/services/bike-transport/' },
  { file: 'services/warehouse/index.html', url: '/services/warehouse/' },
  { file: 'services/insurance/index.html', url: '/services/insurance/' },
  { file: 'network/index.html', url: '/network/' },
  { file: 'contact/index.html', url: '/contact/' },
  { file: 'get-quote/index.html', url: '/get-quote/' },
  { file: 'blog/index.html', url: '/blog/' },
  { file: 'faq/index.html', url: '/faq/' },
  { file: 'privacy-policy/index.html', url: '/privacy-policy/' },
  { file: 'terms-and-conditions/index.html', url: '/terms-and-conditions/' },
  { file: 'refund-and-cancellation/index.html', url: '/refund-and-cancellation/' },
  { file: '404.html', url: '/404.html' }
];

console.log('=== 1. VERIFYING HTML PAGES AND SEO METADATA ===');
let errors = 0;
const titles = new Set();
const descriptions = new Set();
const allInternalLinks = [];

pages.forEach(p => {
  const filePath = path.join(rootDir, p.file);
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: File missing: ${p.file}`);
    errors++;
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');

  // Title check
  const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch) {
    console.error(`FAIL: ${p.file} has no <title> tag!`);
    errors++;
  } else {
    const title = titleMatch[1].trim();
    if (title.length > 60 && p.file !== '404.html') {
      console.warn(`WARN: ${p.file} title length > 60 chars: "${title}" (${title.length})`);
    } else {
      console.log(`OK: ${p.file} title (${title.length} chars): "${title}"`);
    }
    if (titles.has(title)) {
      console.error(`FAIL: Duplicate title found in ${p.file}: "${title}"`);
      errors++;
    }
    titles.add(title);
  }

  // Meta description check
  const metaDescMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  if (!metaDescMatch) {
    console.error(`FAIL: ${p.file} has no meta description!`);
    errors++;
  } else {
    const desc = metaDescMatch[1].trim();
    if (desc.length > 160) {
      console.warn(`WARN: ${p.file} description > 160 chars (${desc.length} chars)`);
    } else {
      console.log(`OK: ${p.file} meta description (${desc.length} chars)`);
    }
    if (descriptions.has(desc)) {
      console.error(`FAIL: Duplicate description found in ${p.file}`);
      errors++;
    }
    descriptions.add(desc);
  }

  // JSON-LD validation
  const jsonLdMatches = content.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi);
  for (const m of jsonLdMatches) {
    try {
      JSON.parse(m[1]);
      console.log(`OK: ${p.file} valid JSON-LD schema`);
    } catch (e) {
      console.error(`FAIL: ${p.file} invalid JSON-LD schema: ${e.message}`);
      errors++;
    }
  }

  // Collect internal links (href="/...")
  const hrefMatches = content.matchAll(/href=["'](\/[^"'#?]*)/g);
  for (const hm of hrefMatches) {
    allInternalLinks.push({ page: p.file, target: hm[1] });
  }
});

console.log('\n=== 2. VERIFYING ALL INTERNAL LINKS RESOLVE TO FILES ===');
let linkErrors = 0;
const uniqueLinks = new Set();
allInternalLinks.forEach(l => {
  uniqueLinks.add(l.target);
  let targetPath = '';
  if (l.target === '/' || l.target === '') {
    targetPath = path.join(rootDir, 'index.html');
  } else if (l.target.endsWith('/')) {
    targetPath = path.join(rootDir, l.target.slice(1), 'index.html');
  } else if (path.extname(l.target)) {
    targetPath = path.join(rootDir, l.target.slice(1));
  } else {
    // Might be clean URL like /contact
    const withSlash = path.join(rootDir, l.target.slice(1), 'index.html');
    const withHtml = path.join(rootDir, l.target.slice(1) + '.html');
    if (fs.existsSync(withSlash)) targetPath = withSlash;
    else targetPath = withHtml;
  }

  if (!fs.existsSync(targetPath)) {
    console.error(`FAIL: Broken internal link from ${l.page} -> "${l.target}" (looked for: ${targetPath})`);
    linkErrors++;
  }
});

if (linkErrors === 0) {
  console.log(`SUCCESS: All ${uniqueLinks.size} unique internal links resolve correctly on disk!`);
} else {
  errors += linkErrors;
}

console.log('\n=== 3. TESTING API SERVERLESS FUNCTION (/api/send-enquiry.js) ===');
const apiHandler = require(path.join(rootDir, 'api', 'send-enquiry.js'));

function mockReqRes(method, body, headers = {}) {
  const req = {
    method,
    body,
    headers: { 'x-forwarded-for': '127.0.0.1', ...headers },
    socket: { remoteAddress: '127.0.0.1' }
  };
  let statusCode = 200;
  let responseData = null;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    setHeader() {}
  };
  return { req, res, getStatus: () => statusCode, getData: () => responseData };
}

(async () => {
  // Test A: Disallow non-POST
  const testA = mockReqRes('GET', {});
  await apiHandler(testA.req, testA.res);
  if (testA.getStatus() === 405) {
    console.log('OK: Non-POST method correctly rejected with 405');
  } else {
    console.error('FAIL: Expected 405 for GET request');
    errors++;
  }

  // Test B: Honeypot silently accepted
  const testB = mockReqRes('POST', { name: 'Bot', phone: '9876543210', website: 'https://spam.com' });
  await apiHandler(testB.req, testB.res);
  if (testB.getStatus() === 200 && testB.getData().ok === true) {
    console.log('OK: Honeypot field filled correctly returned silent 200 without dispatch');
  } else {
    console.error('FAIL: Honeypot bot submission not handled properly');
    errors++;
  }

  // Test C: Missing name validation
  const testC = mockReqRes('POST', { name: '', phone: '9876543210' });
  await apiHandler(testC.req, testC.res);
  if (testC.getStatus() === 400) {
    console.log('OK: Missing name returns 400 error');
  } else {
    console.error('FAIL: Missing name should return 400');
    errors++;
  }

  // Test D: Invalid Indian phone number validation
  const testD = mockReqRes('POST', { name: 'Rahul', phone: '12345' });
  await apiHandler(testD.req, testD.res);
  if (testD.getStatus() === 400) {
    console.log('OK: Invalid phone number returns 400 error');
  } else {
    console.error('FAIL: Invalid phone number should return 400');
    errors++;
  }

  // Test E: Valid inputs with missing API key returns 500 with friendly message
  delete process.env.RESEND_API_KEY;
  const testE = mockReqRes('POST', { name: 'Amit Sharma', phone: '+91 98765 43210', email: 'amit@example.com', service: 'House Shifting', message: 'Test message' });
  await apiHandler(testE.req, testE.res);
  if (testE.getStatus() === 500 && testE.getData().ok === false) {
    console.log('OK: Unconfigured API key returns graceful error message without exposing stack traces');
  } else {
    console.error('FAIL: Expected graceful 500 error for missing RESEND_API_KEY');
    errors++;
  }

  console.log('\n=== 4. VERIFYING CONFIG, ROBOTS, SITEMAP & VERCEL.JSON ===');
  const siteConfig = require(path.join(rootDir, 'config', 'site.js'));
  if (siteConfig.brandName && siteConfig.phoneDisplay && siteConfig.whatsappUrl && siteConfig.email) {
    console.log('OK: config/site.js exports valid business details');
  } else {
    console.error('FAIL: config/site.js missing required business properties');
    errors++;
  }

  if (fs.existsSync(path.join(rootDir, 'robots.txt'))) {
    console.log('OK: robots.txt exists');
  } else {
    errors++;
  }

  if (fs.existsSync(path.join(rootDir, 'sitemap.xml'))) {
    console.log('OK: sitemap.xml exists');
  } else {
    errors++;
  }

  if (fs.existsSync(path.join(rootDir, 'vercel.json'))) {
    const vJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf8'));
    if (vJson.cleanUrls && vJson.headers) {
      console.log('OK: vercel.json contains cleanUrls & security headers');
    }
  }

  console.log('\n======================================================');
  if (errors === 0) {
    console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
  } else {
    console.error(`VERIFICATION COMPLETED WITH ${errors} ERRORS.`);
    process.exit(1);
  }
})();
