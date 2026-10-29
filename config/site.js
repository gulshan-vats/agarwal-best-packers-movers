/**
 * Single Source of Truth for Agarwal Best Packers and Movers
 * Used by client-side scripts (main.js, quote-form.js, contact-form.js)
 * and server-side utilities.
 */
const SITE_CONFIG = {
  brandName: "Agarwal Best Packers and Movers",
  shortName: "Agarwal Best Packers",
  domain: "https://agarwalbestpackersmovers.in",
  phoneDisplay: "+91 74045 39417",
  phoneTel: "+917404539417",
  whatsappNumber: "917404539417",
  whatsappUrl: "https://wa.me/917404539417",
  email: "info@agarwalbestpackersmovers.in",
  address: {
    street: "Near 33/2, Manikonda Rd, Shirdi Sai Nagar, Manikonda",
    locality: "Hyderabad",
    region: "Telangana",
    postalCode: "500089",
    country: "IN",
    full: "Near 33/2, Manikonda Rd, Shirdi Sai Nagar, Manikonda, Hyderabad, Telangana 500089"
  },
  geo: {
    latitude: "17.4042",
    longitude: "78.3892"
  },
  workingHours: "Monday to Sunday: 24/7 Support & Moving Operations",
  social: {
    facebook: "https://www.facebook.com/agarwalbestpackersmovers",
    instagram: "https://www.instagram.com/agarwalbestpackersmovers",
    youtube: "https://www.youtube.com/@agarwalbestpackersmovers",
    twitter: "https://twitter.com/agarwalbestpm"
  },
  routes: {
    home: "/",
    about: "/about/",
    services: "/services/",
    houseShifting: "/services/house-shifting/",
    officeShifting: "/services/office-shifting/",
    carTransport: "/services/car-transport/",
    bikeTransport: "/services/bike-transport/",
    warehouse: "/services/warehouse/",
    insurance: "/services/insurance/",
    network: "/network/",
    contact: "/contact/",
    getQuote: "/get-quote/",
    blog: "/blog/",
    faq: "/faq/",
    privacyPolicy: "/privacy-policy/",
    termsAndConditions: "/terms-and-conditions/",
    refundAndCancellation: "/refund-and-cancellation/"
  }
};

// Browser exposure
if (typeof window !== "undefined") {
  window.SITE_CONFIG = SITE_CONFIG;
}

// Node.js CommonJS exposure
if (typeof module !== "undefined" && module.exports) {
  module.exports = SITE_CONFIG;
}
