export type CustomFieldType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'badge' 
  | 'url' 
  | 'email' 
  | 'boolean';

export interface CustomField {
  id: string;
  label: string;
  key: string;
  type: CustomFieldType;
  options?: string[]; // for select or badge types
  placeholder?: string;
  description?: string;
  required?: boolean;
  showInTable?: boolean;
  createdAt: string;
}

export interface ProfileMediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title?: string;
  isCover?: boolean;
}

export interface Profile {
  id: string;
  fullName: string;
  roleTitle: string;
  category: string; // e.g. "Student", "Teacher", "Staff", "Counselor", "Prefect"
  classGrade?: string; // e.g. "Class 10-A", "Class 11-A (PCM)", "Class 12-B (Commerce)"
  rollNo?: string; // e.g. "18"
  admissionNo?: string; // e.g. "DPS-2024-892"
  board?: 'MP Board' | 'State Board' | 'CBSE' | 'Other';
  gender?: 'Male' | 'Female' | 'Other';
  instagramId?: string; // Primary Instagram handle e.g. "@aarav_sharma07"
  secondaryInstagramId?: string; // Secondary/Spam/Art Instagram handle e.g. "@aarav.dump"
  instaStatus?: 'Active' | 'Private' | 'Inactive' | 'Unknown';
  relationshipStatus?: 'Single' | 'In a Relationship' | 'Complicated' | 'Prefer not to say' | 'Unknown';
  coachingInstitute?: string; // e.g. "Allen Kota", "Aakash Institute", "PhysicsWallah (PW)", "FIITJEE", "Local Tuition", "None"
  fathersName?: string;
  fathersOccupation?: string;
  mothersName?: string;
  mothersOccupation?: string;
  whatsappNumber?: string; // e.g. "+91 98765 43210"
  emergencyContact?: string;
  house?: 'Ashoka' | 'Shivaji' | 'Tagore' | 'Raman';
  teacherAdvisor?: string; // Assigned Teacher or Class Teacher
  averageScore?: number; // Academic Percentage e.g. 94.5%
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  avatarUrl: string;
  bio?: string;
  photos: string[]; // Image URLs
  videos: string[]; // Video URLs
  customValues: Record<string, any>;
  status: 'active' | 'archived' | 'pending' | 'banned';
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'student' | 'agent' | 'admin';

export interface StudentAccount {
  id: string;
  memberCode: string; // e.g. "member#01"
  passcode: string; // e.g. "STU-2026"
  friendCode: string; // e.g. "FRND-7X9K"
  alias?: string;
  isBanned?: boolean;
  banReason?: string;
  warningStrikes?: number;
  referralCount?: number;
  referredBy?: string;
  createdAt: string;
  lastActive?: string;
  avatarSeed?: string;
}

export interface AgentAccount {
  id: string;
  agentCode: string; // e.g. "Agent#01"
  name: string; // e.g. "Counselor Lisa", "HOD Sharma"
  department: string; // e.g. "Mental Health & Student Counseling", "PCM Academic Help"
  passcode: string; // e.g. "AGNT-8821"
  isActive: boolean;
  canBanUsers?: boolean;
  canVerifyAnswers?: boolean;
  canPinPosts?: boolean;
  hasDatabaseAccess?: boolean; // Controls access to Campus Database tab
  createdAt: string;
  avatarSeed?: string;
  bio?: string;
}

export interface ForumChannel {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  color: string;
  postCount?: number;
}

export interface ForumPost {
  id: string;
  channelId: string;
  title: string;
  content: string;
  authorRole: UserRole;
  authorCode: string; // "member#01", "Agent#01", "Admin"
  authorLabel?: string;
  isAnonymous: boolean;
  createdAt: string;
  likes: number;
  likedBy: string[];
  commentsCount: number;
  isPinned?: boolean;
  isLocked?: boolean;
  tags: string[];
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  mediaDuration?: number; // up to 300 seconds (5 minutes)
  mediaFileName?: string;
}

export interface SchoolPortalAboutConfig {
  title: string;
  tagline: string;
  schoolName?: string; // e.g. "Sunrays School"
  boardName?: string; // e.g. "MP Board (MPBSE)"
  founderName: string;
  founderBatch: string;
  founderRole: string;
  founderBio: string;
  credentials?: string[];
  roleplayPersonaSummary?: string;
  missionStory: string;
  whistleblowerPolicy: string;
  disclaimer?: string;
  rules?: string[]; // Custom added community rules
  guidelines: string[];
  emergencyEscapeUrl?: string; // Quick escape / disguise URL
  panicDisguiseTitle?: string; // Disguise window title
  instagramHandle?: string;
  contactEmail?: string;
  updatedAt: string;
}

export interface ForumComment {
  id: string;
  postId: string;
  parentId?: string | null; // For threaded replies on comments!
  replyToCode?: string; // e.g. "member#02" or "Agent#01"
  authorRole: UserRole;
  authorCode: string;
  authorLabel?: string;
  content: string;
  createdAt: string;
  likes: number;
  isVerifiedSolution?: boolean; // Verified by Agent/Teacher
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderCode: string;
  senderRole: UserRole;
  senderReferralCount?: number;
  reactions?: Record<string, number>;
  text: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file';
}

export interface ChatConversation {
  id: string;
  participantCode: string; // fallback or legacy
  participantACode?: string;
  participantBCode?: string;
  participantName: string;
  participantRole: UserRole;
  isAgent?: boolean;
  isAdmin?: boolean;
  referralCount?: number;
  badgeTitle?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface AccessPass {
  id: string;
  username: string; // auto-generated e.g. "AGENT-9281"
  passcode: string; // auto-generated e.g. "7K9M-4N2P"
  role: 'viewer' | 'editor';
  label: string; // e.g. "Client Access - Tokyo Branch"
  createdAt: string;
  lastUsedAt?: string;
  usageCount: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  isAdmin: boolean;
  isAgent: boolean;
  isStudent: boolean;
  studentAccount?: StudentAccount;
  agentAccount?: AgentAccount;
  currentPass?: AccessPass;
}

export interface ApiConfig {
  enabled: boolean;
  baseUrl: string;
  username: string;
  apiKey: string;
  authType: 'bearer' | 'basic' | 'customHeader';
  customHeaderName?: string;
  webhookUrl?: string;
  autoSyncOnSubmit: boolean;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed';
  lastTestMessage?: string;
}

export interface GoogleDriveBackendConfig {
  enabled: boolean;
  fileId?: string;
  fileName: string;
  folderId?: string;
  lastSyncAt?: string;
  lastSyncStatus?: 'success' | 'error' | 'syncing';
  lastSyncMessage?: string;
  autoSyncOnChanges: boolean;
  userEmail?: string;
}

export interface GoogleDriveAuthState {
  isConnected: boolean;
  accessToken: string | null;
  tokenExpiresAt: number | null;
  userEmail?: string;
}

export type ViewMode = 'table' | 'grid';
