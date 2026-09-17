import { ForumChannel, ForumPost, ForumComment, AgentAccount, StudentAccount, ChatConversation, ChatMessage } from '../types';
import {
  INITIAL_CHANNELS,
  INITIAL_AGENTS,
  INITIAL_STUDENTS,
  INITIAL_POSTS,
  INITIAL_COMMENTS,
  INITIAL_CHATS,
} from '../data/forumData';

const CHANNELS_KEY = 'schl_forum_channels_v2';
const POSTS_KEY = 'schl_forum_posts_v2';
const COMMENTS_KEY = 'schl_forum_comments_v2';
const AGENTS_KEY = 'schl_forum_agents_v2';
const STUDENTS_KEY = 'schl_forum_students_v2';
const CHATS_KEY = 'schl_forum_chats_v2';

// Clean legacy v1 cached keys if present
try {
  localStorage.removeItem('schl_forum_posts_v1');
  localStorage.removeItem('schl_forum_comments_v1');
  localStorage.removeItem('schl_forum_agents_v1');
  localStorage.removeItem('schl_forum_chats_v1');
} catch {}

export function loadForumChannels(): ForumChannel[] {
  try {
    const raw = localStorage.getItem(CHANNELS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load channels', e);
  }
  saveForumChannels(INITIAL_CHANNELS);
  return INITIAL_CHANNELS;
}

export function saveForumChannels(channels: ForumChannel[]): void {
  try {
    localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
  } catch (e) {
    console.error('Failed to save channels', e);
  }
}

export function loadForumPosts(): ForumPost[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load posts', e);
  }
  saveForumPosts(INITIAL_POSTS);
  return INITIAL_POSTS;
}

export function saveForumPosts(posts: ForumPost[]): void {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  } catch (e) {
    console.error('Failed to save posts', e);
  }
}

export function loadForumComments(): ForumComment[] {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load comments', e);
  }
  saveForumComments(INITIAL_COMMENTS);
  return INITIAL_COMMENTS;
}

export function saveForumComments(comments: ForumComment[]): void {
  try {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  } catch (e) {
    console.error('Failed to save comments', e);
  }
}

export function loadForumAgents(): AgentAccount[] {
  try {
    const raw = localStorage.getItem(AGENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load agents', e);
  }
  saveForumAgents(INITIAL_AGENTS);
  return INITIAL_AGENTS;
}

export function saveForumAgents(agents: AgentAccount[]): void {
  try {
    localStorage.setItem(AGENTS_KEY, JSON.stringify(agents));
  } catch (e) {
    console.error('Failed to save agents', e);
  }
}

export function loadForumStudents(): StudentAccount[] {
  try {
    const raw = localStorage.getItem(STUDENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load students', e);
  }
  saveForumStudents(INITIAL_STUDENTS);
  return INITIAL_STUDENTS;
}

export function saveForumStudents(students: StudentAccount[]): void {
  try {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students', e);
  }
}

export function loadForumChats(): { conversations: ChatConversation[]; messages: Record<string, ChatMessage[]> } {
  try {
    const raw = localStorage.getItem(CHATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load chats', e);
  }
  saveForumChats(INITIAL_CHATS);
  return INITIAL_CHATS;
}

export function saveForumChats(chats: { conversations: ChatConversation[]; messages: Record<string, ChatMessage[]> }): void {
  try {
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  } catch (e) {
    console.error('Failed to save chats', e);
  }
}

const DEVICE_IDENTITY_KEY = 'schl_forum_device_student_identity_v1';

export function getOrDesignateDeviceStudentIdentity(existingStudents: StudentAccount[]): StudentAccount {
  try {
    const raw = localStorage.getItem(DEVICE_IDENTITY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const matched = existingStudents.find((s) => s.memberCode.toLowerCase() === parsed.memberCode?.toLowerCase());
      if (matched) return matched;
    }
  } catch (e) {
    console.error('Failed to load device student identity', e);
  }

  // Auto-designate student#01 (or first available student)
  const defaultStudent = existingStudents[0] || {
    id: 'stu_01',
    memberCode: 'member#01',
    passcode: 'STU-1001',
    friendCode: 'FRND-8921',
    alias: 'Quiet Owl',
    createdAt: new Date().toISOString(),
    lastActive: 'Just now',
  };

  try {
    localStorage.setItem(DEVICE_IDENTITY_KEY, JSON.stringify(defaultStudent));
  } catch {}

  return defaultStudent;
}

export function setDeviceStudentIdentity(student: StudentAccount): void {
  try {
    localStorage.setItem(DEVICE_IDENTITY_KEY, JSON.stringify(student));
  } catch (e) {
    console.error('Failed to save device student identity', e);
  }
}

/**
 * Generates a random anonymous student code pair e.g. member#05 with pass STU-7492 and friendCode FRND-7K29
 */
export function generateStudentCodePair(existingStudents: StudentAccount[]): {
  newStudent: StudentAccount;
  allStudents: StudentAccount[];
} {
  // Use a random 4-digit number to avoid cross-device race condition collisions
  const count = Math.floor(1000 + Math.random() * 9000);
  const memberCode = `member#${count}`;
  
  // Random 4-character alpha-numeric suffix for passcode
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const passcode = `STU-${rand}`;

  // Random 4-character alpha-numeric for friendCode
  let fRand = '';
  for (let i = 0; i < 4; i++) {
    fRand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const friendCode = `FRND-${fRand}`;

  const aliases = ['Quiet Owl', 'Blue Falcon', 'Neon Fox', 'Silver Bear', 'Delta Wren', 'Echo Lynx', 'Solar Wolf'];
  const alias = aliases[Math.floor(Math.random() * aliases.length)];

  const newStudent: StudentAccount = {
    id: `stu_${Date.now()}`,
    memberCode,
    passcode,
    friendCode,
    alias,
    createdAt: new Date().toISOString(),
    lastActive: 'Just now',
  };

  const allStudents = [newStudent, ...existingStudents];
  saveForumStudents(allStudents);
  setDeviceStudentIdentity(newStudent);

  return { newStudent, allStudents };
}

/**
 * Generates next Agent code e.g. Agent#04
 */
export function getNextAgentCode(existingAgents: AgentAccount[]): string {
  const nextNum = existingAgents.length + 1;
  return `Agent#${nextNum < 10 ? `0${nextNum}` : nextNum}`;
}

export function resetForumToDefaults() {
  saveForumChannels(INITIAL_CHANNELS);
  saveForumPosts(INITIAL_POSTS);
  saveForumComments(INITIAL_COMMENTS);
  saveForumAgents(INITIAL_AGENTS);
  saveForumStudents(INITIAL_STUDENTS);
  saveForumChats(INITIAL_CHATS);
  return {
    channels: INITIAL_CHANNELS,
    posts: INITIAL_POSTS,
    comments: INITIAL_COMMENTS,
    agents: INITIAL_AGENTS,
    students: INITIAL_STUDENTS,
    chats: INITIAL_CHATS,
  };
}
