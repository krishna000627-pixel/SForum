import { Profile, CustomField, AccessPass } from '../types';

export const INITIAL_CUSTOM_FIELDS: CustomField[] = [
  {
    id: 'f_class',
    label: 'Class / Grade & Stream',
    key: 'class_grade',
    type: 'badge',
    options: [
      'Class 10-A (MP Board)',
      'Class 10-B (MP Board)',
      'Class 11-A (Science PCM)',
      'Class 11-B (Science PCB)',
      'Class 11-C (Commerce)',
      'Class 12-A (Science PCM + CS)',
      'Class 12-B (Commerce with Maths)',
      'Class 12-C (Humanities / Arts)',
      'Faculty - Science & Tech',
      'Faculty - Administration',
    ],
    required: true,
    showInTable: true,
    createdAt: '2025-01-15T08:00:00.000Z',
  },
  {
    id: 'f_coaching',
    label: 'Coaching Institute',
    key: 'coaching_institute',
    type: 'select',
    options: ['Allen Kota', 'Aakash Institute', 'PhysicsWallah (PW)', 'FIITJEE', 'Resonance', 'Self Study / Home Tutors', 'None'],
    required: false,
    showInTable: true,
    createdAt: '2025-01-15T08:00:00.000Z',
  },
  {
    id: 'f_insta',
    label: 'Primary Instagram ID',
    key: 'instagram_id',
    type: 'text',
    required: false,
    showInTable: true,
    createdAt: '2025-01-15T08:00:00.000Z',
  },
  {
    id: 'f_relationship',
    label: 'Relationship Status',
    key: 'relationship_status',
    type: 'select',
    options: ['Single', 'In a Relationship', 'Complicated', 'Prefer not to say', 'Unknown'],
    required: false,
    showInTable: false,
    createdAt: '2025-01-15T08:00:00.000Z',
  },
  {
    id: 'f_house',
    label: 'School House',
    key: 'house',
    type: 'badge',
    options: ['Ashoka (Red)', 'Shivaji (Blue)', 'Tagore (Green)', 'Raman (Yellow)'],
    required: false,
    showInTable: true,
    createdAt: '2025-01-15T08:00:00.000Z',
  },
  {
    id: 'f_avg',
    label: 'Board / Internal (%)',
    key: 'average_score',
    type: 'number',
    required: false,
    showInTable: true,
    createdAt: '2025-01-15T08:00:00.000Z',
  },
];

export const INITIAL_PROFILES: Profile[] = [];

export const INITIAL_ACCESS_PASSES: AccessPass[] = [
  {
    id: 'pass_01',
    username: 'PROCTOR-ADMIN',
    passcode: 'Krishna@1987',
    role: 'editor',
    label: 'Campus Proctor & Disciplinary Staff',
    createdAt: '2025-01-01T00:00:00.000Z',
    usageCount: 0,
    isActive: true,
  },
];
