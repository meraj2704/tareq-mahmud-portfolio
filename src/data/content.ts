// All copy for the site lives here. To add Bangla, create a `bn` object
// that satisfies `SiteContent`, add "bn" to `Locale`, and register it below.
// In section titles, wrap one word in *asterisks* to set it in italic.

export type Locale = "en";

export type SectionId =
  | "about"
  | "experience"
  | "education"
  | "skills"
  | "certifications"
  | "research"
  | "contact";

export type IconName = "mail" | "phone" | "whatsapp" | "location";

export interface ImageAsset {
  src: string;
  alt: string;
}

export interface KeyFigure {
  label: string;
  value: string;
  detail?: string;
}

export interface SectionHeading {
  eyebrow: string;
  title: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  current?: boolean;
  responsibilities: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  status: string;
  ongoing?: boolean;
}

export interface SkillGroup {
  title: string;
  items: string[];
}

export interface Certification {
  title: string;
  issuer: string;
  year: string;
}

export interface ResearchItem {
  type: string;
  status: string;
  title: string;
  summary: string;
}

export interface ContactChannel {
  icon: IconName;
  label: string;
  value: string;
  href?: string;
}

export interface SiteContent {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    items: { id: SectionId; label: string }[];
    cta: string;
    openMenu: string;
    closeMenu: string;
  };
  hero: {
    name: string;
    role: string;
    location: string;
    summary: string;
    photo: ImageAsset;
    primaryCta: { label: string; href: string; download: string };
    secondaryCta: { label: string; href: string };
    figures: KeyFigure[];
  };
  about: SectionHeading & {
    paragraphs: string[];
    highlights: string[];
  };
  experience: SectionHeading & {
    currentLabel: string;
    items: ExperienceItem[];
    photo?: ImageAsset;
  };
  education: SectionHeading & { items: EducationItem[] };
  skills: SectionHeading & { groups: SkillGroup[] };
  certifications: SectionHeading & { items: Certification[] };
  research: SectionHeading & { items: ResearchItem[] };
  contact: SectionHeading & {
    intro: string;
    channels: ContactChannel[];
    form: {
      title: string;
      name: { label: string; placeholder: string };
      email: { label: string; placeholder: string };
      message: { label: string; placeholder: string };
      submit: string;
      note: string;
      subjectPrefix: string;
    };
  };
  footer: {
    name: string;
    tagline: string;
    rights: string;
    credit: {
      prefix: string;
      label: string;
      href: string;
    };
  };
}

const EMAIL = "tareqmahmud5097@gmail.com";
const PHONE_DISPLAY = "01754031830";
const PHONE_INTL = "8801754031830";

const en: SiteContent = {
  meta: {
    title: "Tareq Mahmud — Accountant",
    description:
      "Tareq Mahmud is an accountant based in Dhaka, focused on accurate bookkeeping, financial reporting and well-organized records.",
  },
  nav: {
    items: [
      { id: "about", label: "About" },
      { id: "experience", label: "Experience" },
      { id: "education", label: "Education" },
      { id: "skills", label: "Skills" },
      { id: "certifications", label: "Certifications" },
      { id: "research", label: "Research" },
    ],
    cta: "Contact",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  hero: {
    name: "Tareq Mahmud",
    role: "Accountant",
    location: "Dhaka, Bangladesh",
    summary:
      "Detail-oriented accountant focused on accurate bookkeeping, clear financial reporting and well-organized records.",
    photo: {
      src: "/tareq-mahmud-portrait.png",
      alt: "Portrait of Tareq Mahmud in a navy suit and tie",
    },
    primaryCta: {
      label: "Download CV",
      href: "/cv.pdf",
      download: "Tareq-Mahmud-CV.pdf",
    },
    secondaryCta: { label: "Contact", href: "#contact" },
    figures: [
      {
        label: "Experience",
        value: "Since 2025",
        detail: "Accountant, ITALBANGLA HRD LTD",
      },
      { label: "Education", value: "MBA", detail: "Accounting, in progress" },
      { label: "Location", value: "Dhaka", detail: "Bangladesh" },
      { label: "Languages", value: "Bangla, English" },
    ],
  },
  about: {
    eyebrow: "About",
    title: "Accurate numbers, organized *records*.",
    paragraphs: [
      "I am an accountant with hands-on experience in bookkeeping, financial reporting and day-to-day record keeping. I maintain ledgers and cash books, prepare bank reconciliations and keep financial documentation complete and easy to audit.",
      "I work comfortably across MS Office, especially Excel, and take pride in being precise, organized and dependable — making sure every figure is correct and every record can be found when it is needed.",
    ],
    highlights: [
      "Bookkeeping",
      "Financial reporting",
      "Ledgers & cash books",
      "Bank reconciliation",
      "MS Office",
    ],
  },
  experience: {
    eyebrow: "Experience",
    title: "Professional *experience*",
    currentLabel: "Current",
    items: [
      {
        role: "Accountant",
        company: "ITALBANGLA HRD LTD",
        period: "Oct 2025 — Present",
        current: true,
        responsibilities: [
          "Handle day-to-day accounting entries and maintain accurate financial records.",
          "Prepare and organize supporting documentation for transactions and client files.",
          "Maintain structured Excel records and prepare daily reports for management.",
          "Coordinate with international clients and partner agencies on European recruitment processes.",
        ],
      },
    ],
    photo: {
      src: "/office-team.jpg",
      alt: "Tareq Mahmud standing with four colleagues at a desk in the office",
    },
  },
  education: {
    eyebrow: "Education",
    title: "Academic *background*",
    items: [
      {
        degree: "MBA in Accounting",
        institution: "Govt. Bangla College",
        period: "2024 — 25",
        status: "Ongoing",
        ongoing: true,
      },
      {
        degree: "BBA in Accounting",
        institution: "Govt. Bangla College",
        period: "2025",
        status: "Passed",
      },
    ],
  },
  skills: {
    eyebrow: "Skills",
    title: "What I bring to the *table*",
    groups: [
      {
        title: "Accounting & Records",
        items: [
          "Bookkeeping",
          "Ledgers & cash books",
          "Bank reconciliation",
          "Financial reporting",
        ],
      },
      {
        title: "MS Office",
        items: ["Excel", "Word", "PowerPoint"],
      },
      {
        title: "Data Management",
        items: ["Excel record keeping", "Data entry & accuracy", "Daily reporting"],
      },
      {
        title: "Documentation",
        items: ["Financial documentation", "Filing & organization", "Client files"],
      },
      {
        title: "Communication",
        items: ["Client coordination", "Agency liaison", "Spoken English"],
      },
      {
        title: "Research",
        items: ["Academic research", "Literature review", "Data analysis"],
      },
    ],
  },
  certifications: {
    eyebrow: "Certifications",
    title: "Training & *certificates*",
    items: [
      { title: "Computer Basic", issuer: "Touhid Foundation", year: "2025" },
      { title: "Spoken English", issuer: "Mentors", year: "2025" },
    ],
  },
  research: {
    eyebrow: "Research",
    title: "Current *research*",
    items: [
      {
        type: "MBA Thesis",
        status: "In progress",
        title:
          "Nature of Online Shopping Scams and Its Impact on Customer Trust & Purchasing Behavior",
        summary:
          "Examines the common forms online shopping scams take and how they shape customer trust and purchasing decisions.",
      },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Let's work *together*",
    intro:
      "Open to accounting roles and professional opportunities. Reach out by email, phone or WhatsApp — or send a message using the form.",
    channels: [
      { icon: "mail", label: "Email", value: EMAIL, href: `mailto:${EMAIL}` },
      {
        icon: "phone",
        label: "Phone",
        value: PHONE_DISPLAY,
        href: `tel:+${PHONE_INTL}`,
      },
      {
        icon: "whatsapp",
        label: "WhatsApp",
        value: PHONE_DISPLAY,
        href: `https://wa.me/${PHONE_INTL}`,
      },
      { icon: "location", label: "Location", value: "Dhaka, Bangladesh" },
    ],
    form: {
      title: "Send a message",
      name: { label: "Name", placeholder: "Your name" },
      email: { label: "Email", placeholder: "you@example.com" },
      message: { label: "Message", placeholder: "How can I help?" },
      submit: "Send message",
      note: "This opens your email app with the message ready to send.",
      subjectPrefix: "Portfolio enquiry from",
    },
  },
  footer: {
    name: "Tareq Mahmud",
    tagline: "Accountant · Dhaka",
    rights: "All rights reserved.",
    credit: {
      prefix: "Designed & developed by",
      label: "SoftOnli Tech",
      href: "https://softonlitech.com?utm_source=tareqmahmud&utm_medium=footer&utm_campaign=client_credit",
    },
  },
};

const content: Record<Locale, SiteContent> = { en };

export const defaultLocale: Locale = "en";

export function getContent(locale: Locale = defaultLocale): SiteContent {
  return content[locale];
}

export const contactEmail = EMAIL;
