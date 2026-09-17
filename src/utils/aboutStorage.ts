import { SchoolPortalAboutConfig } from '../types';

const ABOUT_STORAGE_KEY = 'sforum_portal_about_config_v1';

export const DEFAULT_ABOUT_CONFIG: SchoolPortalAboutConfig = {
  title: 'About S-Forum (Sunrays Student Community)',
  tagline: 'The 100% Anonymous Whistleblower Network, Faculty Grievance Forum & Peer Doubt Haven',
  schoolName: 'Sunrays Higher Secondary School',
  boardName: 'MP Board (MPBSE)',
  founderName: 'Aman Verma (Pass-Out Alumni, 2023)',
  founderBatch: 'Class 12-A Science (PCM + Computer Science)',
  founderRole: 'Ex-Head Boy & Independent Whistleblower Founder',
  founderBio: 'I graduated two years ago from Sunrays Higher Secondary School. While preparing for MP Board Exams and competitive entrances, I experienced first-hand how students were terrified to voice complaints about syllabus rushing, biased internal grading, or broken campus facilities because staff would threaten disciplinary action or withheld practical marks. Because I have already passed out, the school administration holds zero jurisdiction over me. S-Forum is an independent, identity-shielded sanctuary where Sunrays students can speak freely, solve difficult questions, and demand better standards without fear.',
  credentials: [
    'Sunrays School Ex-Head Boy (Batch of 2023)',
    'MP Board (MPBSE) Examination: 98.2% (Science Stream)',
    'State Science Talent Search Rank 3',
    'Independent Student Advocate & Peer Mentor',
    'B.Tech Computer Science & Engineering Undergraduate'
  ],
  missionStory: 'S-Forum is engineered on three uncompromising tenets:\n\n1. Zero Identity Leaks — Every student joins with an anonymous code pair (e.g. member#01) and random friend code. No Google account, no phone number, and no school roll number is ever linked to your posts.\n\n2. Constructive Whistleblowing — Real student complaints about teacher favoritism, broken cooling in 40°C heat, or unsafe transport are given an unfiltered, collective stage.\n\n3. Shielded Counselors — Counseling agents are pseudonymous proctors with zero public real names displayed, preventing any tracing or retaliation.',
  whistleblowerPolicy: 'Your identity is protected by design. Even if school proctors request access, student discussions and confession threads are cryptographically decoupled from real identities. You can safely speak the truth without fear of retribution.',
  disclaimer: 'Sunrays Higher Secondary School Anonymous Student Community & Peer Doubt Platform.',
  rules: [
    'Rule 1: Always protect classmate anonymity. Never leak real names or roll numbers in public channels.',
    'Rule 2: Whistleblowing posts must describe genuine school/campus incidents with factual context.',
    'Rule 3: Respect academic discussions. Provide constructive explanations for MP Board & entrance problems.',
    'Rule 4: Zero tolerance for malicious personal harassment, ragging threats, or cyberbullying.'
  ],
  guidelines: [
    'Document genuine grievances (e.g. syllabus rush before MP Board pre-boards, broken water coolers, unfair lab fee fines) with clarity and respect.',
    'Help peers crack tough MP Board derivations, NCERT/MPBSE numericals, and competitive DPP problems.',
    'Strict zero-tolerance for cyberbullying or malicious personal attacks on fellow classmates.',
    'Invite 3 classmates via WhatsApp to earn your Official Blue Verified Tick.',
  ],
  emergencyEscapeUrl: 'https://en.wikipedia.org/wiki/Mathematics',
  panicDisguiseTitle: 'Mathematics - Wikipedia Reference Library',
  instagramHandle: '@sunrays.sforum',
  contactEmail: 'sanctuary@sforum-portal.internal',
  updatedAt: '2025-02-01T00:00:00.000Z',
};

export function loadAboutConfig(): SchoolPortalAboutConfig {
  try {
    const raw = localStorage.getItem(ABOUT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_ABOUT_CONFIG, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load About config:', e);
  }
  return DEFAULT_ABOUT_CONFIG;
}

export function saveAboutConfig(config: SchoolPortalAboutConfig): void {
  try {
    localStorage.setItem(ABOUT_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save About config:', e);
  }
}

export function resetAboutConfig(): SchoolPortalAboutConfig {
  saveAboutConfig(DEFAULT_ABOUT_CONFIG);
  return DEFAULT_ABOUT_CONFIG;
}
