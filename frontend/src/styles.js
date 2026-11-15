import { groovyCss } from "./groovyStyles.js";
import { legacyGroovyCss } from "./legacyGroovy.css.js";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Local API while we develop on this machine. When we test on the ReachCT Lab
// Railway instance, set VITE_API_URL to that service's URL.
export const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Used by AdminPage gate (kept in sync with main).
export const ADMIN_PASSWORD = "reachct2026";

// Same client ID as GOOGLE_CLIENT_ID in backend/.env. The Google client must
// allow the JavaScript origin http://localhost:5173.
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// ─── COMPANY TYPES (grouped alphabetically for <optgroup>) ────────────────────
export const COMPANY_TYPES_GROUPED = {
  "A": ["Administration Company", "Advertising Agency", "Architecture Company", "Art Company"],
  "B": ["Biomedical Research Center", "Biotech Company", "Branding Agency", "Business Analytics", "Business Company"],
  "C": ["Childcare Company", "Clinical Laboratory", "Consulting Company", "Cosmetics Company"],
  "D": ["Data Analytics Company", "Data Science Company", "Design Company", "Diagnostic Laboratory", "Diagnostics Company", "Digital Marketing Agency"],
  "E": ["Economic Consulting Company", "Education Company","Event Company", "Electrical Company", "Engineering Company", "Environmental Company"],
  "F": ["Fashion Company", "Finance Company", "Food Manufacturing Company", "Furniture Design Company"],
  "G": ["Graphic Design Company"],
  "H": ["Hotel Company", "HR Company","Hostal","Host Family Organization"],
  "I": ["Interior Design Company", "IT Company", "IVD Company"],
  "J": ["Journalism Company"],
  "L": ["Language Academy", "Library Company", "Life Science Company", "Logistics Company"],
  "M": ["Management Company", "Market Research Agency", "Marketing Agency", "Medical Device Company", "Medical Laboratory"],
  "N": ["Non Governmental Organization"],
  "O": ["Operations Company"],
  "P": ["Pharmaceutical Company", "PR Agency"],
  "R": ["Real Estate Company", "Research Institute", "Restaurant Company", "Retail Company"],
  "S": ["Sales Company","Student Apartment","Student Residence","Software Company","Startup","Short Term Rental"],
  "T": ["Tourism Company", "Travel Agency"],
  "V": ["Veterinary Company"],
  "W": ["Web Design Company"],
  "Z": ["Zoo"]
};

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
export const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,800..900,100,1&family=Poppins:wght@400;500;600&family=Shrikhand&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Poppins', system-ui, sans-serif;
    background: #2D2B2C;
    color: #F6EBD9;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    margin: 0;
  }

  #root { min-height: 100vh; }

  a { color: inherit; text-decoration: none; }

  ${groovyCss}
  ${legacyGroovyCss}
`;
