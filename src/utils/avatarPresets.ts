// High reliability vector avatar presets for Indian school students, faculty & staff
// Completely independent of external Unsplash links to avoid broken images or network blocks.

export interface AvatarPreset {
  id: string;
  name: string;
  category: 'Student' | 'Faculty' | 'Counselor' | 'Leadership';
  avatarUrl: string;
}

// Generate inline SVG data URI with distinctive colors, hair, and accessories
const createSvgAvatar = (bgGradStart: string, bgGradEnd: string, skinColor: string, hairColor: string, accessory: 'glasses' | 'tie' | 'specs' | 'headset' | 'scarf' | 'badge' | 'none', label: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
    <defs>
      <linearGradient id="g_${label}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradStart}"/>
        <stop offset="100%" stop-color="${bgGradEnd}"/>
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="60" fill="url(#g_${label})"/>
    <!-- Body / Shoulders -->
    <path d="M25 110 C25 85 45 78 60 78 C75 78 95 85 95 110 Z" fill="#1e293b"/>
    <!-- School Uniform Collar / Tie -->
    <polygon points="60,82 50,78 70,78" fill="#ffffff"/>
    ${accessory === 'tie' ? '<polygon points="60,82 57,98 60,105 63,98" fill="#ef4444"/>' : ''}
    ${accessory === 'badge' ? '<circle cx="78" cy="92" r="5" fill="#eab308"/><circle cx="78" cy="92" r="3" fill="#ca8a04"/>' : ''}
    ${accessory === 'scarf' ? '<path d="M45 78 Q60 90 75 78 Q60 84 45 78" fill="#8b5cf6"/>' : ''}
    <!-- Head -->
    <circle cx="60" cy="52" r="24" fill="${skinColor}"/>
    <!-- Hair -->
    <path d="M36 48 C36 28 84 28 84 48 C84 34 36 34 36 48 Z" fill="${hairColor}"/>
    <path d="M36 46 C42 32 60 30 70 32 C80 34 84 42 84 46 C76 38 64 36 50 38 C40 40 36 46 36 46 Z" fill="${hairColor}"/>
    <!-- Eyes -->
    <circle cx="51" cy="50" r="2.8" fill="#0f172a"/>
    <circle cx="69" cy="50" r="2.8" fill="#0f172a"/>
    <circle cx="52" cy="49" r="0.8" fill="#ffffff"/>
    <circle cx="70" cy="49" r="0.8" fill="#ffffff"/>
    <!-- Smile -->
    <path d="M53 62 Q60 67 67 62" stroke="#0f172a" stroke-width="2" stroke-linecap="round" fill="none"/>
    <!-- Cheeks -->
    <circle cx="47" cy="56" r="3" fill="#f43f5e" opacity="0.3"/>
    <circle cx="73" cy="56" r="3" fill="#f43f5e" opacity="0.3"/>
    <!-- Accessories -->
    ${accessory === 'glasses' || accessory === 'specs' ? `
      <rect x="44" y="44" width="14" height="11" rx="3" fill="none" stroke="#38bdf8" stroke-width="2"/>
      <rect x="62" y="44" width="14" height="11" rx="3" fill="none" stroke="#38bdf8" stroke-width="2"/>
      <line x1="58" y1="49" x2="62" y2="49" stroke="#38bdf8" stroke-width="2"/>
    ` : ''}
    ${accessory === 'headset' ? `
      <path d="M34 50 C34 30 86 30 86 50" fill="none" stroke="#64748b" stroke-width="3"/>
      <rect x="32" y="46" width="6" height="12" rx="3" fill="#3b82f6"/>
      <rect x="82" y="46" width="6" height="12" rx="3" fill="#3b82f6"/>
    ` : ''}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const PRESET_AVATARS: AvatarPreset[] = [
  {
    id: 'avatar_head_boy',
    name: 'Aarav (Head Boy / Science)',
    category: 'Leadership',
    avatarUrl: createSvgAvatar('#1e3a8a', '#3b82f6', '#fed7aa', '#1e293b', 'tie', 'aarav'),
  },
  {
    id: 'avatar_head_girl',
    name: 'Ananya (Head Girl / Commerce)',
    category: 'Leadership',
    avatarUrl: createSvgAvatar('#831843', '#ec4899', '#fde68a', '#331e1e', 'badge', 'ananya'),
  },
  {
    id: 'avatar_science_specs',
    name: 'Rohan (PCM / JEE Aspirant)',
    category: 'Student',
    avatarUrl: createSvgAvatar('#065f46', '#10b981', '#fed7aa', '#0f172a', 'glasses', 'rohan'),
  },
  {
    id: 'avatar_sports_girl',
    name: 'Diya (Sports Captain / PCB)',
    category: 'Student',
    avatarUrl: createSvgAvatar('#7c2d12', '#ea580c', '#fde68a', '#1e293b', 'none', 'diya'),
  },
  {
    id: 'avatar_tech_boy',
    name: 'Kabir (Robotics / CS Club)',
    category: 'Student',
    avatarUrl: createSvgAvatar('#312e81', '#6366f1', '#ffedd5', '#172554', 'headset', 'kabir'),
  },
  {
    id: 'avatar_arts_girl',
    name: 'Meera (Humanities / Literature)',
    category: 'Student',
    avatarUrl: createSvgAvatar('#581c87', '#a855f7', '#fde68a', '#3b0764', 'specs', 'meera'),
  },
  {
    id: 'avatar_faculty_physics',
    name: 'Mr. Rakesh Verma (HOD Physics)',
    category: 'Faculty',
    avatarUrl: createSvgAvatar('#1e293b', '#475569', '#fed7aa', '#64748b', 'specs', 'verma'),
  },
  {
    id: 'avatar_counselor_lisa',
    name: 'Mrs. Sunita Sharma (Senior Counselor)',
    category: 'Counselor',
    avatarUrl: createSvgAvatar('#701a75', '#c026d3', '#fde68a', '#4a044e', 'scarf', 'sharma'),
  },
  {
    id: 'avatar_proctor_priya',
    name: 'Dr. Priya Nair (Campus Proctor)',
    category: 'Faculty',
    avatarUrl: createSvgAvatar('#042f2e', '#0d9488', '#fed7aa', '#134e4a', 'badge', 'nair'),
  },
  {
    id: 'avatar_alumni_aman',
    name: 'Aman Verma (Pass-out Alumni 2023)',
    category: 'Leadership',
    avatarUrl: createSvgAvatar('#0f172a', '#1e293b', '#fed7aa', '#020617', 'tie', 'aman'),
  },
];

export const DEFAULT_STUDENT_AVATAR = PRESET_AVATARS[0].avatarUrl;
export const DEFAULT_FACULTY_AVATAR = PRESET_AVATARS[6].avatarUrl;
export const DEFAULT_COUNSELOR_AVATAR = PRESET_AVATARS[7].avatarUrl;
export const DEFAULT_ALUMNI_AVATAR = PRESET_AVATARS[9].avatarUrl;
