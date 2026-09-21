/**
 * Vinayak Dental Care — Single Source of Truth Configuration
 * Design System: "Warm Clinic Journal"
 * 
 * Instructions for Clinic Owner:
 * - Replace fields marked with TODO: OWNER with your authentic clinic details.
 * - If a field is left empty (""), the website will automatically hide that element or show an elegant fallback.
 */

const CLINIC_CONFIG = {
  // 1. Clinic Identity
  clinicName: "Vinayak Dental Care",
  tagline: "A calmer way to care for your smile",
  doctors: "Dr. Vishal & Dr. Devanshi",
  
  // 2. Contact Numbers (TODO: OWNER - Supply real phone & WhatsApp numbers)
  clinicPhone: "", // TODO: OWNER - e.g. "+91 98765 43210" (Leave empty until provided)
  clinicPhoneRaw: "", // TODO: OWNER - e.g. "+919876543210"
  whatsappNumber: "", // TODO: OWNER - e.g. "919876543210" (digits only with country code)
  clinicEmail: "", // TODO: OWNER - e.g. "info@vinayakdentalcare.com"

  // 3. Location & Directions
  addressShort: "B-10 Laxmipooja Complex, Kapadvanj, Gujarat",
  addressFull: "B-10 Laxmipooja Complex, Near Bandhan Hotel, Kapadvanj, Gujarat 387620",
  mapUrl: "https://maps.google.com/?q=Vinayak+Dental+Care+Kapadvanj", // TODO: OWNER - Direct Google Maps listing link
  mapEmbedUrl: "", // TODO: OWNER - Google Maps iframe embed URL (if empty, a clean address card is shown)
  reviewUrl: "", // TODO: OWNER - Direct Google Business review link (e.g. https://g.page/r/.../review)
  instagramUrl: "", // TODO: OWNER - e.g. "https://www.instagram.com/vinayak_dental_clinic__implant/"

  // 4. Operating Hours (Used to calculate live open/closed chip in header)
  openingHours: {
    days: "Monday – Saturday",
    timing: "9:00 AM – 8:00 PM",
    sunday: "Closed",
    // 24h schedule used by JavaScript status chip
    schedule: {
      0: null, // Sunday: closed
      1: { open: 9, close: 20 }, // Mon: 09:00 - 20:00
      2: { open: 9, close: 20 }, // Tue: 09:00 - 20:00
      3: { open: 9, close: 20 }, // Wed: 09:00 - 20:00
      4: { open: 9, close: 20 }, // Thu: 09:00 - 20:00
      5: { open: 9, close: 20 }, // Fri: 09:00 - 20:00
      6: { open: 9, close: 20 }  // Sat: 09:00 - 20:00
    }
  },

  // 5. Hero Image (TODO: OWNER - Supply path to authentic high-res clinic or doctor photo)
  heroImage: "", // e.g. "/images/clinic-hero.webp" (If empty, hero renders with clean typographic focus)

  // 6. Navigation Symptoms (Links to book.html?service=<serviceId>)
  symptoms: [
    { id: "toothache", label: "Toothache", icon: "fa-solid fa-bolt", serviceId: "general-consultation" },
    { id: "sensitivity", label: "Tooth Sensitivity", icon: "fa-solid fa-snowflake", serviceId: "general-consultation" },
    { id: "missing-tooth", label: "Missing Tooth", icon: "fa-solid fa-tooth", serviceId: "dental-implants" },
    { id: "crooked-teeth", label: "Crooked Teeth / Alignment", icon: "fa-solid fa-gem", serviceId: "orthodontics" },
    { id: "kids-checkup", label: "Kids' Dental Check-up", icon: "fa-solid fa-child", serviceId: "pediatric-dentistry" },
    { id: "stained-teeth", label: "Stained Teeth", icon: "fa-solid fa-wand-magic-sparkles", serviceId: "teeth-whitening" },
    { id: "routine-checkup", label: "Routine Dental Exam", icon: "fa-solid fa-stethoscope", serviceId: "general-consultation" }
  ],

  // 7. Clinical Services Catalog (Single Source of Truth)
  services: [
    {
      id: "general-consultation",
      name: "General Dental Checkup",
      icon: "fa-solid fa-stethoscope",
      category: "Preventative",
      shortDesc: "Comprehensive oral examinations, diagnostic screening, and personalized dental care plans.",
      fullDesc: "Regular dental exams help detect oral concerns early. We provide gentle visual examinations, gum evaluations, and preventative guidance tailored to your oral health.",
      guName: "સામાન્ય દાંતની તપાસ",
      guDesc: "સંપૂર્ણ મૌખિક તપાસ અને વ્યક્તિગત દાંતની સંભાળ યોજના.",
      hiName: "सामान्य दंत परीक्षण",
      hiDesc: "संपूर्ण मौखिक जांच और व्यक्तिगत दंत देखभाल योजना।"
    },
    {
      id: "teeth-cleaning",
      name: "Teeth Cleaning & Scaling",
      icon: "fa-solid fa-sparkles",
      category: "Preventative",
      shortDesc: "Gentle ultrasonic scaling and polishing to remove plaque, tartar buildup, and surface stains.",
      fullDesc: "Professional scaling removes hardened tartar that regular daily brushing cannot clear. Helps keep your gums healthy and your breath fresh.",
      guName: "દાંતની સફાઈ અને સ્કેલિંગ",
      guDesc: "પેઢાને સ્વસ્થ રાખવા માટે અલ્ટ્રાસોનિક સફાઈ અને પોલિશિંગ.",
      hiName: "दांतों की सफाई और स्केलिंग",
      hiDesc: "मसूड़ों को स्वस्थ रखने के लिए अल्ट्रासोनिक सफाई और पॉलिशिंग।"
    },
    {
      id: "root-canal",
      name: "Root Canal Treatment (RCT)",
      icon: "fa-solid fa-tooth",
      category: "Restorative",
      shortDesc: "Modern rotary endodontic therapy designed to relieve tooth pain and preserve your natural tooth.",
      fullDesc: "Root canal therapy carefully cleans out infected inner tooth tissue, removing discomfort while saving your natural tooth structure.",
      guName: "રૂટ કેનાલ ટ્રીટમેન્ટ (RCT)",
      guDesc: "કુદરતી દાંતને બચાવવા માટે આધુનિક રૂટ કેનાલ ઉપચાર.",
      hiName: "रूट कैनाल ट्रीटमेंट (RCT)",
      hiDesc: "प्राकृतिक दांत को बचाने के लिए आधुनिक रूट कैनाल उपचार।"
    },
    {
      id: "dental-implants",
      name: "Dental Implants",
      icon: "fa-solid fa-screwdriver",
      category: "Restorative",
      shortDesc: "Durable titanium implants and custom ceramic crowns to replace missing teeth naturally.",
      fullDesc: "Dental implants offer a secure, permanent way to replace one or more missing teeth, restoring normal chewing comfort and smile appearance.",
      guName: "ડેન્ટલ ઇમ્પ્લાન્ટ્સ",
      guDesc: "ગુમાવેલા દાંતની જગ્યાએ કુદરતી જેવા મજબૂત ઇમ્પ્લાન્ટ્સ.",
      hiName: "डेंटल इम्प्लांट्स",
      hiDesc: "खोए हुए दांतों की जगह प्राकृतिक जैसे मजबूत इम्प्लांट्स।"
    },
    {
      id: "teeth-whitening",
      name: "Teeth Whitening",
      icon: "fa-solid fa-wand-magic-sparkles",
      category: "Cosmetic",
      shortDesc: "In-clinic professional teeth whitening to gently lift deep stains and brighten your smile.",
      fullDesc: "Supervised clinical teeth whitening effectively lightens tea, coffee, and tobacco stains safely without weakening tooth enamel.",
      guName: "દાંત સફેદ કરવા (વ્હાઇટનિંગ)",
      guDesc: "દાંતના ડાઘ દૂર કરી કુદરતી ચમક પાછી મેળવવા માટે ક્લિનિકલ વ્હાઇટનિંગ.",
      hiName: "दांत चमकाना (व्हाइटनिंग)",
      hiDesc: "दांतों के दाग हटाकर प्राकृतिक चमक वापस पाने के लिए क्लिनिकल व्हाइटनिंग।"
    },
    {
      id: "orthodontics",
      name: "Braces & Clear Aligners",
      icon: "fa-solid fa-gem",
      category: "Orthodontics",
      shortDesc: "Aesthetic ceramic braces and transparent aligners for gentle teeth straightening.",
      fullDesc: "Orthodontic options for teens and adults to correct crowded or misaligned teeth using discreet brackets or custom removable aligners.",
      guName: "દાંતના તાર અને ક્લિયર એલાઈનર્સ",
      guDesc: "વાંકા-ચૂંકા દાંતને સરખા કરવા માટે કૌંસ અને પારદર્શક એલાઈનર્સ.",
      hiName: "दांतों के तार और क्लियर एलाइनर्स",
      hiDesc: "टेढ़े-मेढ़े दांतों को सीधा करने के लिए ब्रेसेस और पारदर्शी एलाइनर्स।"
    },
    {
      id: "pediatric-dentistry",
      name: "Pediatric (Kids) Dentistry",
      icon: "fa-solid fa-child",
      category: "Pediatric",
      shortDesc: "Gentle and patient dental care in a welcoming atmosphere for children of all ages.",
      fullDesc: "We take special care to make dental visits comfortable for children, offering preventative checkups, sealants, and cavity fillings.",
      guName: "બાળકો માટે ડેન્ટલ કેર",
      guDesc: "બાળકો માટે પ્રેમભર્યું અને હળવું વાતાવરણ.",
      hiName: "बच्चों के लिए डेंटल केयर",
      hiDesc: "बच्चों के लिए स्नेहपूर्ण और आरामदायक वातावरण।"
    },
    {
      id: "crowns-bridges",
      name: "Crowns & Dental Bridges",
      icon: "fa-solid fa-shield-halved",
      category: "Restorative",
      shortDesc: "Custom-fitted zirconia and ceramic caps to strengthen weakened teeth and close dental gaps.",
      fullDesc: "Precision dental crowns protect damaged or root-canal treated teeth, matched carefully to the shade and shape of your existing teeth.",
      guName: "કેપ અને બ્રિજ (Crowns & Bridges)",
      guDesc: "નબળા દાંતના રક્ષણ માટે કસ્ટમ ઝિર્કોનિયા અને સિરામિક કેપ.",
      hiName: "कैप और ब्रिज (Crowns & Bridges)",
      hiDesc: "कमजोर दांतों की सुरक्षा के लिए कस्टम जिरकोनिया और सिरेमिक कैप।"
    }
  ],

  // 8. "Your First Visit" 4 Steps
  firstVisit: [
    {
      step: "01",
      title: "Warm Welcome & Consultation",
      desc: "We listen carefully to your dental concerns, past medical history, and what you hope to achieve."
    },
    {
      step: "02",
      title: "Gentle Clinical Examination",
      desc: "A thorough, gentle checkup of your teeth, gums, and bite, explaining every finding in plain language."
    },
    {
      step: "03",
      title: "Clear, Transparent Plan",
      desc: "You receive a clear treatment plan with options and realistic timelines so you can decide comfortably."
    },
    {
      step: "04",
      title: "Comfortable Care",
      desc: "Treatment at your own pace in a clean, hygienic environment with step-by-step guidance from our doctors."
    }
  ],

  // 9. Doctor Profiles (TODO: OWNER - Supply authentic photo paths if available)
  doctorsList: [
    {
      id: "dr-vishal",
      name: "Dr. Vishal",
      role: "Dental Surgeon & Implantologist",
      initials: "DV",
      image: "", // TODO: OWNER - Path to authentic photo (e.g. "/images/dr-vishal.webp")
      bio: "Dedicated to providing modern, gentle dental care and restorative dentistry for families in Kapadvanj."
    },
    {
      id: "dr-devanshi",
      name: "Dr. Devanshi",
      role: "Dental Surgeon & Endodontist",
      initials: "DD",
      image: "", // TODO: OWNER - Path to authentic photo (e.g. "/images/dr-devanshi.webp")
      bio: "Focuses on comfortable root canal treatments, cosmetic enhancements, and preventative oral health care."
    }
  ],

  // 10. Patient Reviews (reviewsAreVerified: false until authentic reviews are verified by owner)
  reviewsAreVerified: false, // Set to true only when real reviews are loaded
  reviews: [], // Empty array until owner supplies real Google Reviews

  // 11. Optional Feature Flags
  enableTreatmentGuide: false // 3-question symptom guide (D5)
};

// Expose globally for vanilla browser scripts
window.CLINIC_CONFIG = CLINIC_CONFIG;
