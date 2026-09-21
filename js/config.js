/**
 * Vinayak Dental Care - Central Configuration File
 * 
 * IMPORTANT: All clinic contact information, links, and content are centralized here.
 * Real-world details should be updated in this file. Look for TODO markers below.
 */

const CLINIC_CONFIG = {
  // Clinic Details
  clinicName: "Vinayak Dental Care",
  doctors: "Dr. Vishal & Dr. Devanshi",
  tagline: "Advanced Dental Care for a Healthy Smile",
  
  // Contact Information (TODO: Replace with actual clinic phone, WhatsApp, and email)
  clinicPhone: "+91 99999 00000", // TODO: Replace with real clinic phone number
  clinicPhoneRaw: "+919999900000", // TODO: Replace with raw phone for tel: links
  whatsappNumber: "919999900000", // TODO: Replace with real WhatsApp number (without '+' sign)
  clinicEmail: "info@vinayakdentalcare.com", // TODO: Replace with real clinic email address
  
  // Location & Address (TODO: Update if any suite/building detail changes)
  addressShort: "B-10 Laxmipooja Complex, Kapadvanj, Gujarat",
  addressFull: "B-10 Laxmipooja Complex, Near Bandhan Hotel, Kapadvanj, Gujarat 387620",
  
  // External Links (TODO: Replace with real Google Map and Google Review URLs)
  mapUrl: "https://maps.google.com/?q=Vinayak+Dental+Care+Kapadvanj", // TODO: Replace with real Google Maps share link
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.854!2d73.069!3d23.023!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDAxJzIyLjgiTiA3M8KwMDQnMDguNCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin", // TODO: Replace with Google Maps embed link
  reviewUrl: "https://g.page/r/vinayakdental/review", // TODO: Replace with real Google Business review URL
  instagramUrl: "https://www.instagram.com/vinayak_dental_clinic__implant/",
  
  // Operating Hours
  openingHours: {
    days: "Monday – Saturday",
    timing: "9:00 AM – 8:00 PM",
    sunday: "Closed",
    display: "Mon - Sat: 9:00 AM - 8:00 PM | Sunday: Closed"
  },

  // Allowed Dental Services (Single Source of Truth)
  services: [
    {
      id: "general-consultation",
      name: "General Dental Checkup",
      icon: "fa-stethoscope",
      shortDesc: "Comprehensive oral examinations, digital X-rays, and customized preventative dental care plans.",
      fullDesc: "Regular dental exams are essential for maintaining optimal oral health. We provide thorough visual examinations, periodontal screening, oral cancer screening, and digital dental imaging to catch problems before they become painful or expensive.",
      category: "Preventive"
    },
    {
      id: "teeth-cleaning",
      name: "Teeth Cleaning & Scaling",
      icon: "fa-teeth",
      shortDesc: "Ultrasonic scaling and polishing to remove stubborn plaque, tartar, and surface stains.",
      fullDesc: "Professional ultrasonic scaling gently removes hardened tartar (calculus) and bacterial biofilm that regular brushing cannot eliminate. Keeps gums healthy, prevents gingivitis, and freshens your breath.",
      category: "Preventive"
    },
    {
      id: "root-canal",
      name: "Root Canal Treatment (RCT)",
      icon: "fa-tooth",
      shortDesc: "Pain-free single or multi-sitting rotary endodontic therapy to save severely infected teeth.",
      fullDesc: "Advanced rotary root canal therapy clears infected pulp tissue while eliminating pain and preserving your natural tooth structure. Performed under modern local anesthesia for maximum patient comfort.",
      category: "Endodontics"
    },
    {
      id: "dental-implants",
      name: "Dental Implants",
      icon: "fa-screwdriver",
      shortDesc: "Permanent titanium implants and ceramic crowns to restore missing teeth with natural function.",
      fullDesc: "State-of-the-art dental implants offer the most durable, natural-looking replacement for missing teeth. Integrated directly into the jawbone for a rock-solid bite and youthful facial structure.",
      category: "Restorative"
    },
    {
      id: "teeth-whitening",
      name: "Teeth Whitening",
      icon: "fa-wand-magic-sparkles",
      shortDesc: "In-office laser & LED teeth bleaching for a brighter, radiant smile in just one session.",
      fullDesc: "Safe, effective clinical teeth whitening that lifts deep coffee, tea, and tobacco stains by several shades in a single 45-minute sitting without damaging enamel.",
      category: "Cosmetic"
    },
    {
      id: "orthodontics",
      name: "Braces & Clear Aligners",
      icon: "fa-gem",
      shortDesc: "Traditional ceramic braces and invisible clear aligners for perfect teeth straightening.",
      fullDesc: "Customized orthodontic solutions for teens and adults to correct misalignments, crowded teeth, and bite issues using modern aesthetic ceramic brackets or virtually invisible clear aligners.",
      category: "Orthodontics"
    },
    {
      id: "pediatric-dentistry",
      name: "Pediatric (Kids) Dentistry",
      icon: "fa-child",
      shortDesc: "Gentle, child-friendly dental care including cavity prevention, fluoride therapy, and sealants.",
      fullDesc: "A warm and friendly environment designed to make young children feel safe and relaxed. We offer preventative sealants, painless cavity restorations, and early oral development guidance.",
      category: "Pediatric"
    },
    {
      id: "crowns-bridges",
      name: "Crowns & Dental Bridges",
      icon: "fa-shield-halved",
      shortDesc: "High-grade zirconia and ceramic crowns crafted to protect damaged teeth and bridge gaps.",
      fullDesc: "Precision-milled zirconia and porcelain crowns designed to match your natural tooth color and translucency perfectly while restoring 100% chewing strength.",
      category: "Restorative"
    }
  ],

  // Patient Testimonials (TODO: Replace with verified Google Reviews from real clinic patients)
  testimonials: [
    {
      name: "Patel Ramesh", // TODO: Replace with real review name
      service: "Dental Implants",
      rating: 5,
      comment: "The treatment was completely painless and Dr. Vishal explained every step clearly. The clinic is extremely clean and equipped with modern instruments." // TODO: Real review text
    },
    {
      name: "Pooja Shah", // TODO: Replace with real review name
      service: "Root Canal Treatment",
      rating: 5,
      comment: "I was very nervous about root canal, but Dr. Devanshi made the whole procedure so comfortable. Highly recommended clinic in Kapadvanj!" // TODO: Real review text
    },
    {
      name: "Jayesh Kumar", // TODO: Replace with real review name
      service: "Teeth Whitening",
      rating: 5,
      comment: "Very professional and friendly staff. Got great results with teeth scaling and polishing. Five stars for hygiene and care." // TODO: Real review text
    }
  ],

  // Real Patient Results Gallery Placeholders (TODO: Replace with authentic clinical before/after case photos)
  caseStudies: [
    {
      id: "case-1",
      title: "Teeth Whitening & Stain Removal",
      category: "Cosmetic Dentistry",
      // TODO: Replace with authentic before/after image of clinic case
      image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800",
      description: "Noticeable shade improvement achieved in a single 45-minute clinical sitting."
    },
    {
      id: "case-2",
      title: "Zirconia Crown Placement",
      category: "Restorative Care",
      // TODO: Replace with authentic before/after image of clinic case
      image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800",
      description: "Seamless color-matched aesthetic ceramic restoration for broken front incisor."
    },
    {
      id: "case-3",
      title: "Clear Aligners Straightening",
      category: "Orthodontics",
      // TODO: Replace with authentic before/after image of clinic case
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
      description: "Crowding correction completed over 8 months with invisible aligner trays."
    }
  ]
};

// Auto-hydrate DOM elements with config values when document loads
document.addEventListener("DOMContentLoaded", () => {
  // Populate text elements
  document.querySelectorAll("[data-config]").forEach((el) => {
    const key = el.getAttribute("data-config");
    if (CLINIC_CONFIG[key] !== undefined) {
      el.textContent = CLINIC_CONFIG[key];
    }
  });

  // Populate href links (tel:, mailto:, whatsapp:, map, review, instagram)
  document.querySelectorAll("[data-config-href]").forEach((el) => {
    const key = el.getAttribute("data-config-href");
    if (key === "clinicPhone") {
      el.setAttribute("href", `tel:${CLINIC_CONFIG.clinicPhoneRaw}`);
    } else if (key === "clinicEmail") {
      el.setAttribute("href", `mailto:${CLINIC_CONFIG.clinicEmail}`);
    } else if (key === "whatsappLink") {
      const prefilled = encodeURIComponent("Hello Vinayak Dental Care, I would like to inquire about dental treatment.");
      el.setAttribute("href", `https://wa.me/${CLINIC_CONFIG.whatsappNumber}?text=${prefilled}`);
    } else if (key === "mapUrl") {
      el.setAttribute("href", CLINIC_CONFIG.mapUrl);
    } else if (key === "reviewUrl") {
      el.setAttribute("href", CLINIC_CONFIG.reviewUrl);
    } else if (key === "instagramUrl") {
      el.setAttribute("href", CLINIC_CONFIG.instagramUrl);
    }
  });

  // Populate map iframe src if present
  document.querySelectorAll("iframe[data-config-src='mapEmbedUrl']").forEach((iframe) => {
    iframe.setAttribute("src", CLINIC_CONFIG.mapEmbedUrl);
  });
});

// Export for node or browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = CLINIC_CONFIG;
}
