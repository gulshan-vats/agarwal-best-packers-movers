# Agarwal Best Packers and Movers

A complete, production-ready, responsive multi-page static website for **Agarwal Best Packers and Movers**, based in Manikonda, Hyderabad, Telangana, India. Built with plain HTML5, CSS3, vanilla JavaScript, and a serverless Vercel function for enquiry email delivery via the Resend API.

---

## Business Information

- **Brand Name:** Agarwal Best Packers and Movers
- **Domain:** https://agarwalbestpackersmovers.in
- **Phone (display):** +91 74045 39417
- **Phone (tel link):** `tel:+917404539417`
- **WhatsApp Link:** https://wa.me/917404539417
- **Email:** info@agarwalbestpackersmovers.in
- **Address:** Near 33/2, Manikonda Rd, Shirdi Sai Nagar, Manikonda, Hyderabad, Telangana 500089
- **Postal Code:** 500089 | **Locality:** Hyderabad | **Region:** Telangana | **Country:** IN

---

## Folder Structure

```
.
├── index.html                           # Home page (Hero, quick enquiry, trust stats, services, why choose us, steps, testimonials, FAQ teaser)
├── about/
│   └── index.html                       # About us (story, mission, values, team, Hyderabad coverage, advantages)
├── services/
│   ├── index.html                       # Services overview directory
│   ├── house-shifting/index.html        # House shifting service details & FAQs
│   ├── office-shifting/index.html       # Office shifting service details & FAQs
│   ├── car-transport/index.html         # Car carrier transport details & FAQs
│   ├── bike-transport/index.html        # Two-wheeler bike transport & FAQs
│   ├── warehouse/index.html             # Warehouse storage solutions & FAQs
│   └── insurance/index.html             # Transit insurance details, claim process & FAQs
├── network/
│   └── index.html                       # Nationwide network, city coverage & serving routes table
├── contact/
│   └── index.html                       # Contact form, phone, email, WhatsApp, address & Google Map
├── get-quote/
│   └── index.html                       # 3-step interactive quote calculator & booking form
├── blog/
│   └── index.html                       # Relocation guides & sample moving tips article
├── faq/
│   └── index.html                       # Comprehensive FAQ accordion with FAQPage Schema
├── privacy-policy/
│   └── index.html                       # Privacy policy
├── terms-and-conditions/
│   └── index.html                       # Terms and conditions
├── refund-and-cancellation/
│   └── index.html                       # Refund and cancellation policy
├── 404.html                             # Branded 404 page
├── assets/
│   ├── css/
│   │   └── styles.css                   # Custom responsive CSS (Bricolage Grotesque & Inter, 8px spacing, mobile bottom bar)
│   ├── js/
│   │   ├── main.js                      # Sticky header, drawer menu, focus trapping, accordions, dynamic config injection
│   │   ├── contact-form.js              # Client validation, POST to /api/send-enquiry, inline alerts, WhatsApp fallback
│   │   └── quote-form.js                # Multi-step wizard validation, calculation, POST & WhatsApp fallback
│   └── images/
│       ├── logo.svg                     # Swappable SVG brand wordmark & truck icon
│       ├── favicon.svg                  # High-DPI browser favicon
│       ├── hero-illustration.svg        # Hero section vector illustration
│       ├── og-image.svg                 # Social share card (1200x630)
│       └── services/                    # Service vector icons (house, office, car, bike, warehouse, insurance)
├── api/
│   └── send-enquiry.js                  # Vercel serverless function (Node.js + Resend API)
├── config/
│   └── site.js                          # Single source of truth for business contact details
├── vercel.json                          # Clean URLs, security headers & routing configuration
├── sitemap.xml                          # XML Sitemap with all canonical URLs
├── robots.txt                           # Search engine crawling rules
├── package.json                         # Scripts & metadata
├── .env.example                         # Environment variable template
└── README.md                            # Documentation & setup guide
```

---

## Single Source of Truth (`config/site.js`)

All telephone numbers, email addresses, WhatsApp numbers, street addresses, and social links are managed in `/config/site.js`.

- On page load, `assets/js/main.js` reads `window.SITE_CONFIG` and dynamically populates elements marked with `data-site-phone`, `data-site-email`, `data-site-whatsapp`, and `data-site-address`.
- Static HTML files also mirror these values directly so the website remains fully functional even if JavaScript is disabled.

To update the business contact details, simply edit `/config/site.js`.

---

## Local Development

You can run and test the complete site (including the serverless `/api/send-enquiry` endpoint) locally with a single command:

### Option 1: Run with Vercel CLI (Recommended for API & Functions)
```bash
# Start local development server (serves static files and /api routes)
npx vercel dev --local
```
Open `http://localhost:3000` in your web browser.

> **Note on `package.json`:** Since this is a vanilla static site with Vercel serverless functions (no build step / framework), `package.json` does not need a `"dev": "vercel dev"` script. Leaving Development Command as empty prevents Vercel from recursively calling itself.

### Option 2: Run with any static HTTP server (Frontend only)
```bash
npm start
# or
npx serve .
# or
python3 -m http.server 8000
```
Open `http://localhost:8000`.

---

## Vercel Deployment Steps

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Go to the [Vercel Dashboard](https://vercel.com/new) and click **"Add New Project"**.
3. Import your repository.
4. Under **Settings &rarr; Environment Variables**, add:
   - Key: `RESEND_API_KEY`
   - Value: `your_resend_api_key_here` (configured for Production, Preview, and Development environments).
5. Click **Deploy**. Vercel will automatically build the static pages and deploy the serverless `/api/send-enquiry` function.
6. Connect your custom domain `agarwalbestpackersmovers.in` under **Settings &rarr; Domains**.

---

## Email Delivery Setup (Resend & DNS Authentication)

Static HTML cannot send emails on its own. The `/api/send-enquiry.js` serverless function dispatches form submissions to `info@agarwalbestpackersmovers.in` using Resend.

To ensure emails land reliably in the inbox (and not in spam), follow these required steps:

1. **Sign up at Resend:**
   - Create an account at [resend.com](https://resend.com).
   - Navigate to **Domains** &rarr; **Add Domain** &rarr; enter `agarwalbestpackersmovers.in`.
   - Copy the DNS records provided by Resend.

2. **Add DNS Records to Domain Registrar:**
   - In your domain DNS management console (Cloudflare, GoDaddy, Hostinger, Namecheap, etc.), add the SPF (TXT), DKIM (TXT or CNAME), and DMARC records exactly as Resend specifies.
   - Add a TXT record for DMARC at host `_dmarc` with the value:
     ```
     v=DMARC1; p=none; rua=mailto:info@agarwalbestpackersmovers.in
     ```

3. **Verify Domain in Resend:**
   - Wait for DNS propagation (typically 5 to 30 minutes).
   - In Resend, click **Verify DNS Records** until status displays **Verified**.

4. **Configure Environment Variable in Vercel:**
   - Generate an API key under **Resend &rarr; API Keys**.
   - In your Vercel project dashboard, go to **Settings &rarr; Environment Variables**.
   - Add `RESEND_API_KEY` with your generated key.
   - Trigger a redeploy if the project was deployed before setting this variable.

5. **Ensure Destination Mailbox Exists:**
   - Confirm `info@agarwalbestpackersmovers.in` is an active, receiving mailbox (via Google Workspace, Zoho Mail, Microsoft 365, etc.). Because all form enquiries are dispatched to this address, the mailbox must exist to receive messages.

6. **Send a Test Enquiry:**
   - Open your live site, fill in the enquiry form on `/contact/` or `/get-quote/`, and submit.
   - Check `info@agarwalbestpackersmovers.in` (including spam folders).
   - Inspect the email headers to ensure SPF, DKIM, and DMARC show `PASS`.

7. **Optional Forwarding / Distribution:**
   - Set up an email forwarding rule or create a Google Group / Zoho Group so incoming relocation leads are simultaneously distributed to operations managers and field coordinators.

---

## Checklist of Placeholders to Replace

All placeholder data that should be replaced with real business figures once confirmed are highlighted with the `.placeholder-highlight` CSS class (`<mark class="placeholder-highlight">[...]</mark>`):

- [ ] **Experience:** `[Years of experience]` on Home and About pages.
- [ ] **Fleet Size:** `[Trucks in fleet]` on Home and About pages.
- [ ] **Customers Relocated:** `[Customers moved]` on Home page.
- [ ] **Team Size:** `[Team size]` on Home and About pages.
- [ ] **Licence & GST Registration:** `[Licence / GST number]` in global footer and About page.
- [ ] **Team Leadership Bios:** `[Founder / Managing Director]`, `[Operations Supervisor]`, `[Customer Support Manager]` bios on About page.
- [ ] **Client Testimonials:** `[Customer name: Rahul S.]`, `[Manikonda to Gachibowli Move]`, etc., on Home page.
- [ ] **Destination Partner Hubs:** `[Bengaluru Hub: ...]`, `[Pune Hub: ...]`, etc., in the Serving Routes table on `/network/`.
- [ ] **Business Hours:** `[Monday to Sunday: 24/7 Operations / Office Visits: 8:00 AM – 9:00 PM]` on Contact page.
- [ ] **Blog Authors & Dates:** `[Author & Date Placeholder]` on `/blog/`.

---

## Features & Compliance Highlights

- **Zero Frameworks:** Pure HTML5, CSS3, and ES6+ vanilla JavaScript without React, Tailwind, Next.js, or jQuery.
- **Mobile Bottom Action Bar:** Displays exclusively below 768px with quick Call, WhatsApp, and Email buttons. Automatically hidden on `/contact/` and `/get-quote/` to prioritize form submission.
- **Accessible Sticky Header:** Compact shrink on scroll, keyboard-navigable services dropdown (Enter, Space, Escape, Arrow keys), and focus-trapped mobile drawer with body scroll locking.
- **Form Anti-Spam & Fallbacks:** Invisible honeypot field prevents automated bot submissions. If the server is offline or fails, an inline fallback provides one-click pre-filled WhatsApp and mailto links.
- **SEO & Structured Data:** Every page includes an individualized title (< 60 chars), meta description (< 160 chars), canonical tag, Open Graph / Twitter cards, and Schema.org JSON-LD (`MovingCompany`, `BreadcrumbList`, and `FAQPage`).
