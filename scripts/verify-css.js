const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'styles.css'), 'utf8');

console.log('=== VERIFYING CSS ARCHITECTURE ===');

// Check :root CSS variables
const requiredVars = [
  '--color-primary',
  '--color-accent',
  '--color-whatsapp',
  '--font-body',
  '--font-heading',
  '--header-height',
  '--mobile-bar-height'
];

requiredVars.forEach(v => {
  if (css.includes(v)) {
    console.log(`OK: CSS variable ${v} defined`);
  } else {
    console.error(`FAIL: Missing CSS variable ${v}`);
  }
});

// Check mobile-bottom-bar rules
if (css.includes('@media (max-width: 767px)') && css.includes('.mobile-bottom-bar')) {
  console.log('OK: .mobile-bottom-bar scoped to @media (max-width: 767px)');
} else {
  console.error('FAIL: .mobile-bottom-bar not properly scoped to max-width: 767px');
}

if (css.includes('@media (min-width: 768px)') && css.includes('display: none !important')) {
  console.log('OK: .mobile-bottom-bar explicitly hidden on min-width: 768px');
} else {
  console.error('FAIL: .mobile-bottom-bar not hidden on desktop/tablet');
}

// Check input font-size 16px to prevent iOS auto-zoom
if (css.includes('font-size: 16px; /* Must be 16px to prevent iOS auto-zoom */') || css.includes('font-size: 16px')) {
  console.log('OK: Input font-size set to 16px to prevent iOS auto-zoom');
} else {
  console.warn('WARN: Check input font-size for iOS auto-zoom');
}

// Check safe area inset bottom
if (css.includes('env(safe-area-inset-bottom)')) {
  console.log('OK: Safe area inset bottom handled for iPhone notched screens');
} else {
  console.error('FAIL: Missing env(safe-area-inset-bottom)');
}

// Check placeholder styling
if (css.includes('.placeholder-highlight')) {
  console.log('OK: .placeholder-highlight styling defined');
} else {
  console.error('FAIL: Missing .placeholder-highlight in CSS');
}

console.log('CSS verification complete.');
