import { ForumChannel, ForumPost, ForumComment, AgentAccount, StudentAccount, ChatConversation, ChatMessage } from '../types';

export const INITIAL_CHANNELS: ForumChannel[] = [
  {
    id: 'teachers-complaint',
    name: 'Teachers & Faculty Grievances',
    slug: 'teachers-complaint',
    description: 'Anonymous whistleblower reporting on unfair internal marks, syllabus rush, harsh reprimands, and coaching vs school clashes.',
    iconName: 'ShieldAlert',
    color: '#ef4444',
    postCount: 0,
  },
  {
    id: 'school-problems',
    name: 'School Problems & Infrastructure',
    slug: 'school-problems',
    description: 'Report broken ACs/fans, washroom sanitation, school bus delays, canteen food hygiene, and unreasonable fines.',
    iconName: 'AlertTriangle',
    color: '#f97316',
    postCount: 0,
  },
  {
    id: 'mp-boards',
    name: 'MP Board & Entrance Prep',
    slug: 'mp-boards',
    description: 'Class 10th & 12th MP Board (MPBSE) exam doubts, model question papers, Hindi & English medium derivations & formulas.',
    iconName: 'GraduationCap',
    color: '#10b981',
    postCount: 0,
  },
  {
    id: 'jee-neet',
    name: 'JEE Mains / NEET & Coaching',
    slug: 'jee-neet',
    description: 'Allen, Aakash, PhysicsWallah (PW), DPP doubts, mock test percentiles, formula sheets & PYQs.',
    iconName: 'Trophy',
    color: '#f59e0b',
    postCount: 0,
  },
  {
    id: 'campus-buzz',
    name: 'Campus Chatter & Canteen',
    slug: 'campus-buzz',
    description: 'Inter-House competitions, Sports Day, morning assembly rants, canteen samosa & Maggie reviews.',
    iconName: 'Megaphone',
    color: '#3b82f6',
    postCount: 0,
  },
  {
    id: 'anonymous-confessions',
    name: 'Anonymous Confessions',
    slug: 'anonymous-confessions',
    description: '100% confidential vents, crush confessions, stress, and honest thoughts with zero identity leaks.',
    iconName: 'EyeOff',
    color: '#ec4899',
    postCount: 0,
  },
  {
    id: 'counselor-agents',
    name: 'Student Support Helpline',
    slug: 'counselor-agents',
    description: 'Support channel offering academic guidance, doubt assistance, and safe peer mediation.',
    iconName: 'ShieldCheck',
    color: '#8b5cf6',
    postCount: 0,
  },
  {
    id: 'lost-found',
    name: 'Lost & Found',
    slug: 'lost-found',
    description: 'School ties, ID cards, MPBSE/NCERT textbooks, geometry boxes, and water bottles found on campus.',
    iconName: 'Compass',
    color: '#06b6d4',
    postCount: 0,
  },
];

export const INITIAL_AGENTS: AgentAccount[] = [];

export const INITIAL_STUDENTS: StudentAccount[] = [];

export const INITIAL_POSTS: ForumPost[] = [];

export const INITIAL_COMMENTS: ForumComment[] = [];

export const INITIAL_CHATS: {
  conversations: ChatConversation[];
  messages: Record<string, ChatMessage[]>;
} = {
  conversations: [],
  messages: {},
};
