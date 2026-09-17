import React, { useState, useEffect } from 'react';
import { 
  UserRole,
  StudentAccount,
  AgentAccount,
  ForumChannel,
  ForumPost,
  ForumComment,
  ChatConversation,
  ChatMessage,
  AuthState,
  GoogleDriveBackendConfig,
  Profile,
  CustomField,
  AccessPass
} from './types';
import {
  loadForumChannels,
  saveForumChannels,
  loadForumPosts,
  saveForumPosts,
  loadForumComments,
  saveForumComments,
  loadForumAgents,
  saveForumAgents,
  loadForumStudents,
  saveForumStudents,
  loadForumChats,
  saveForumChats,
  generateStudentCodePair,
  resetForumToDefaults,
} from './utils/forumStorage';
import { 
  getAdminPin, 
  setAdminPin,
  loadDriveConfig,
  saveDriveConfig,
  loadProfiles,
  saveProfiles,
  loadCustomFields,
  saveCustomFields,
  loadAccessPasses,
  saveAccessPasses
} from './utils/storage';
import { 
  getStoredDriveToken, 
  saveDatabaseToGoogleDrive, 
  loadDatabaseFromGoogleDrive, 
  DriveDatabasePayload 
} from './utils/googleDriveService';
import { AccessGate } from './components/AccessGate';
import { Navbar } from './components/Navbar';
import { ForumView } from './components/ForumView';
import { AnonymousChatView } from './components/AnonymousChatView';
import { SchoolAdminPage } from './components/SchoolAdminPage';
import { SchoolDatabaseView } from './components/SchoolDatabaseView';
import { WhatsAppReferralModal } from './components/WhatsAppReferralModal';
import { ProfileFormModal } from './components/ProfileFormModal';
import { ProfileDetailModal } from './components/ProfileDetailModal';
import { AboutView } from './components/AboutView';
import { loadAboutConfig, saveAboutConfig } from './utils/aboutStorage';
import { SchoolPortalAboutConfig } from './types';
import { VerifiedBadgeTick } from './components/VerifiedBadgeTick';
import { MessageSquare, MessagesSquare, Shield, GraduationCap, Sparkles, Database, Share2, Info, Cloud } from 'lucide-react';
import {
  checkFirebaseHealth,
  subscribeToCloudForumPosts,
  savePostToCloud,
  saveCommentToCloud,
  subscribeToCloudChatMessages,
  sendChatMessageToCloud,
  syncDatabaseToCloud,
  subscribeToCloudProfiles,
  subscribeToCloudStudents,
  saveStudentToCloud,
  deleteStudentFromCloud,
  subscribeToCloudAgents,
  saveAgentToCloud,
  deleteAgentFromCloud,
  subscribeToCloudChatConversations,
  saveChatConversationToCloud
} from './firebase/firebase';

export default function App() {
  // Forum Core States
  const [channels, setChannels] = useState<ForumChannel[]>(() => loadForumChannels());
  const [posts, setPosts] = useState<ForumPost[]>(() => loadForumPosts());
  const [comments, setComments] = useState<ForumComment[]>(() => loadForumComments());
  const [agents, setAgents] = useState<AgentAccount[]>(() => loadForumAgents());
  const [students, setStudents] = useState<StudentAccount[]>(() => loadForumStudents());
  const [chats, setChats] = useState<{ conversations: ChatConversation[]; messages: Record<string, ChatMessage[]> }>(() => loadForumChats());
  
  // Portal About Config & Roleplay Persona
  const [aboutConfig, setAboutConfig] = useState<SchoolPortalAboutConfig>(() => loadAboutConfig());
  
  // School Database Profiles (for Agent & Admin access)
  const [profiles, setProfiles] = useState<Profile[]>(() => loadProfiles());
  const [customFields, setCustomFields] = useState<CustomField[]>(() => loadCustomFields());
  const [accessPasses, setAccessPasses] = useState<AccessPass[]>(() => loadAccessPasses());

  // Admin & Drive Config
  const [adminPin, setAdminPinState] = useState<string>(() => getAdminPin());
  const [driveConfig, setDriveConfig] = useState<GoogleDriveBackendConfig>(() => loadDriveConfig());

  // Authentication State
  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      const saved = sessionStorage.getItem('schl_forum_auth_session');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { 
      isAuthenticated: false, 
      role: 'student', 
      isAdmin: false, 
      isAgent: false, 
      isStudent: false 
    };
  });

  // UI Tabs & Modals
  const [activeNavTab, setActiveNavTab] = useState<'forum' | 'chats' | 'database' | 'admin' | 'about'>('forum');
  const [showReferralModal, setShowReferralModal] = useState(false);

  // Profile modal states for directory viewing
  const [selectedProfileForDetail, setSelectedProfileForDetail] = useState<Profile | null>(null);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<Profile | null>(null);

  // Profile update handler
  const handleUpdateProfiles = (updated: Profile[]) => {
    setProfiles(updated);
    saveProfiles(updated);
  };

  // Sync helpers - these push to Firestore (the shared, cross-device source
  // of truth) in addition to local state/localStorage, so a member/friend
  // code or agent created on one device is immediately visible on every
  // other device instead of only existing in that browser's local storage.
  const handleUpdateAgents = (updated: AgentAccount[]) => {
    const nextIds = new Set(updated.map((a) => a.id));
    // Push every record so edits (not just brand-new ones) reach every device too.
    updated.forEach((a) => saveAgentToCloud(a));
    agents.forEach((a) => {
      if (!nextIds.has(a.id)) deleteAgentFromCloud(a.id);
    });
    setAgents(updated);
    saveForumAgents(updated);
  };

  const handleUpdateStudents = (updated: StudentAccount[]) => {
    const nextIds = new Set(updated.map((s) => s.id));
    updated.forEach((s) => saveStudentToCloud(s));
    students.forEach((s) => {
      if (!nextIds.has(s.id)) deleteStudentFromCloud(s.id);
    });
    setStudents(updated);
    saveForumStudents(updated);
  };

  const handleDeleteAgent = (agentId: string) => {
    const updated = agents.filter(a => a.id !== agentId);
    handleUpdateAgents(updated);
  };

  const handleDeleteStudent = (studentId: string) => {
    const updated = students.filter(s => s.id !== studentId);
    handleUpdateStudents(updated);
  };

  const handleUpdatePosts = (updated: ForumPost[]) => {
    setPosts(updated);
    saveForumPosts(updated);
  };

  const handleUpdateComments = (updated: ForumComment[]) => {
    setComments(updated);
    saveForumComments(updated);
  };

  const handleUpdateDriveConfig = (newConfig: GoogleDriveBackendConfig) => {
    setDriveConfig(newConfig);
    saveDriveConfig(newConfig);
  };

  const handleSaveAboutConfig = (newConfig: SchoolPortalAboutConfig) => {
    setAboutConfig(newConfig);
    saveAboutConfig(newConfig);
  };

  // Backend SQL Sync & Firebase Real-time Subscriptions
  useEffect(() => {
    const fetchBackendData = () => {
      // Fetch Posts
      fetch('/api/forum/posts')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.posts && data.posts.length > 0) {
            setPosts((prev) => {
              const map = new Map<string, ForumPost>();
              data.posts.forEach((p: any) => map.set(p.id, p));
              prev.forEach((p) => {
                if (!map.has(p.id)) map.set(p.id, p);
              });
              const merged = Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              saveForumPosts(merged);
              return merged;
            });
          }
        })
        .catch(() => {});

      // Fetch Profiles
      fetch('/api/profiles')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.profiles && data.profiles.length > 0) {
            setProfiles((prev) => {
              const map = new Map<string, Profile>();
              data.profiles.forEach((p: any) => map.set(p.id, p));
              prev.forEach((p) => {
                if (!map.has(p.id)) map.set(p.id, p);
              });
              const merged = Array.from(map.values());
              saveProfiles(merged);
              return merged;
            });
          }
        })
        .catch(() => {});

      // Fetch Agents
      fetch('/api/agents')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.agents) {
            setAgents((prev) => {
              const map = new Map<string, AgentAccount>();
              prev.forEach((a) => map.set(a.id, a));
              data.agents.forEach((a: any) => map.set(a.id, a));
              const merged = Array.from(map.values());
              saveForumAgents(merged);
              return merged;
            });
          }
        })
        .catch(() => {});

      // Fetch Students
      fetch('/api/students')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.students) {
            setStudents((prev) => {
              const map = new Map<string, StudentAccount>();
              prev.forEach((s) => map.set(s.id, s));
              data.students.forEach((s: any) => map.set(s.id, s));
              const merged = Array.from(map.values());
              saveForumStudents(merged);
              return merged;
            });
          }
        })
        .catch(() => {});
        
      // Fetch Chats
      fetch('/api/chats/conversations')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.conversations) {
            setChats((prev) => {
              const map = new Map<string, ChatConversation>();
              prev.conversations.forEach((c) => map.set(c.id, c));
              data.conversations.forEach((c: any) => {
                if (!map.has(c.id)) map.set(c.id, c);
              });
              return { ...prev, conversations: Array.from(map.values()) };
            });
          }
        })
        .catch(() => {});

      fetch('/api/chats/messages')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.messages && data.messages.length > 0) {
            setChats((prev) => {
              let hasChange = false;
              const updatedMsgs = { ...prev.messages };
              const updatedConvs = [...prev.conversations];
              
              data.messages.forEach((msg: any) => {
                const existing = updatedMsgs[msg.conversation_id || msg.id] || [];
                // Needs proper parsing, simpler to rely on Firebase for chats if possible, 
                // but let's just make it trigger a re-render if we can, or skip for now to avoid breaking chat structure
              });
              return prev; // chat sync needs more care to match format
            });
          }
        })
        .catch(() => {});
    };

    // Initial fetch
    fetchBackendData();

    // Poll every 5 seconds for other devices
    const pollInterval = setInterval(fetchBackendData, 5000);

    // Check connection to sunraysforum project
    checkFirebaseHealth().then((status) => {
      console.log('Firebase Cloud status:', status);
    });

    // Subscribe to cloud posts
    const unsubPosts = subscribeToCloudForumPosts((cloudPosts) => {
      if (cloudPosts && cloudPosts.length > 0) {
        setPosts((prev) => {
          const map = new Map<string, ForumPost>();
          prev.forEach((p) => map.set(p.id, p));
          cloudPosts.forEach((p) => map.set(p.id, p));
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          saveForumPosts(merged);
          return merged;
        });
      }
    });

    // Subscribe to cloud chat messages
    const unsubChats = subscribeToCloudChatMessages((cloudMessagesMap) => {
      if (cloudMessagesMap && Object.keys(cloudMessagesMap).length > 0) {
        setChats((prev) => {
          let hasChange = false;
          const updatedMsgs = { ...prev.messages };
          const updatedConvs = [...prev.conversations];

          Object.entries(cloudMessagesMap).forEach(([convId, messages]) => {
            const existing = updatedMsgs[convId] || [];
            messages.forEach((msg) => {
              if (!existing.some((m) => m.id === msg.id)) {
                existing.push(msg);
                hasChange = true;

                const convIndex = updatedConvs.findIndex((c) => c.id === convId);
                if (convIndex >= 0) {
                  updatedConvs[convIndex] = {
                    ...updatedConvs[convIndex],
                    lastMessage: msg.text || (msg.attachmentUrl ? '📷 Photo' : ''),
                    lastMessageTime: 'Just now',
                  };
                }
              }
            });
            updatedMsgs[convId] = existing;
          });

          if (hasChange) {
            const next = { conversations: updatedConvs, messages: updatedMsgs };
            saveForumChats(next);
            return next;
          }
          return prev;
        });
      }
    });

    // Subscribe to cloud student profiles
    const unsubProfiles = subscribeToCloudProfiles((cloudProfiles) => {
      if (cloudProfiles && cloudProfiles.length > 0) {
        setProfiles((prev) => {
          const map = new Map<string, Profile>();
          prev.forEach((p) => map.set(p.id, p));
          cloudProfiles.forEach((p) => map.set(p.id, p));
          const merged = Array.from(map.values());
          saveProfiles(merged);
          return merged;
        });
      }
    });

    // Subscribe to cloud students (member/passcode/friend codes) - this is
    // the fix for the same-username / unrecognized-friend-code bug: every
    // device now sees the same shared list instead of its own local copy.
    const unsubStudents = subscribeToCloudStudents((cloudStudents) => {
      setStudents((prev) => {
        const map = new Map<string, StudentAccount>();
        prev.forEach((s) => map.set(s.id, s));
        cloudStudents.forEach((s) => map.set(s.id, s));
        const merged = Array.from(map.values());
        saveForumStudents(merged);
        return merged;
      });
    });

    // Subscribe to cloud agents
    const unsubAgents = subscribeToCloudAgents((cloudAgents) => {
      setAgents((prev) => {
        const map = new Map<string, AgentAccount>();
        prev.forEach((a) => map.set(a.id, a));
        cloudAgents.forEach((a) => map.set(a.id, a));
        const merged = Array.from(map.values());
        saveForumAgents(merged);
        return merged;
      });
    });

    // Subscribe to cloud chat conversations (who's talking to whom)
    const unsubConversations = subscribeToCloudChatConversations((cloudConvs) => {
      setChats((prev) => {
        const map = new Map<string, ChatConversation>();
        prev.conversations.forEach((c) => map.set(c.id, c));
        cloudConvs.forEach((c) => {
          if (!map.has(c.id)) map.set(c.id, c);
        });
        const merged = { ...prev, conversations: Array.from(map.values()) };
        saveForumChats(merged);
        return merged;
      });
    });

    return () => {
      clearInterval(pollInterval);
      unsubPosts();
      unsubChats();
      unsubProfiles();
      unsubStudents();
      unsubAgents();
      unsubConversations();
    };
  }, []);

  // Login handler with strict role segregation
  const handleLoginSuccess = (params: {
    role: UserRole;
    studentAccount?: StudentAccount;
    agentAccount?: AgentAccount;
  }) => {
    const newAuth: AuthState = {
      isAuthenticated: true,
      role: params.role,
      isAdmin: params.role === 'admin',
      isAgent: params.role === 'agent',
      isStudent: params.role === 'student',
      studentAccount: params.studentAccount,
      agentAccount: params.agentAccount,
    };
    setAuth(newAuth);
    try {
      sessionStorage.setItem('schl_forum_auth_session', JSON.stringify(newAuth));
    } catch {}

    // Admin lands directly on Admin Center or Forum
    if (params.role === 'admin') {
      setActiveNavTab('admin');
    } else {
      setActiveNavTab('forum');
    }
  };

  // Logout handler
  const handleLogout = () => {
    try {
      sessionStorage.removeItem('schl_forum_auth_session');
    } catch {}
    setAuth({
      isAuthenticated: false,
      role: 'student',
      isAdmin: false,
      isAgent: false,
      isStudent: false,
    });
    setActiveNavTab('forum');
  };

  // Current student account & ban status lookup
  const currentStudent = auth.role === 'student' 
    ? students.find((s) => s.id === auth.studentAccount?.id || s.memberCode === auth.studentAccount?.memberCode)
    : undefined;

  const currentAgent = auth.role === 'agent'
    ? agents.find((a) => a.id === auth.agentAccount?.id || a.agentCode === auth.agentAccount?.agentCode)
    : undefined;

  const isBanned = !!currentStudent?.isBanned;
  const banReason = currentStudent?.banReason;

  // Determine current active user's identity code
  const myCode = 
    auth.role === 'student' 
      ? currentStudent?.memberCode || auth.studentAccount?.memberCode || 'member#01'
      : auth.role === 'agent'
      ? currentAgent?.agentCode || auth.agentAccount?.agentCode || 'Agent#01'
      : 'Admin';

  const myLabel =
    auth.role === 'student'
      ? `Student (${myCode})`
      : auth.role === 'agent'
      ? `${currentAgent?.name || auth.agentAccount?.name || 'Counselor'} [${myCode}]`
      : 'School Administrator';

  // 1-Click Anonymous Student Code Pair Generation
  const handleGenerateStudentCode = () => {
    const res = generateStudentCodePair(students);
    setStudents(res.allStudents);
    saveStudentToCloud(res.newStudent);
    return res;
  };

  const pushPostToSql = (post: ForumPost) => {
    fetch('/api/forum/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    }).catch(console.warn);
  };

  // Forum Like Action
  const handleLikePost = (postId: string) => {
    let updatedPost: ForumPost | null = null;
    const updated = posts.map((post) => {
      if (post.id !== postId) return post;
      const alreadyLiked = post.likedBy?.includes(myCode);
      const newLikedBy = alreadyLiked
        ? post.likedBy.filter((c) => c !== myCode)
        : [...(post.likedBy || []), myCode];
      
      updatedPost = {
        ...post,
        likes: alreadyLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
        likedBy: newLikedBy,
      };
      return updatedPost;
    });
    handleUpdatePosts(updated);
    if (updatedPost) pushPostToSql(updatedPost);
  };

  // Forum Add Comment / Threaded Reply Action
  const handleAddComment = (
    postId: string, 
    content: string, 
    parentId?: string | null, 
    replyToCode?: string
  ) => {
    if (isBanned) return;

    const newComment: ForumComment = {
      id: `comm_${Date.now()}`,
      postId,
      parentId: parentId || null,
      replyToCode: replyToCode || undefined,
      authorRole: auth.role,
      authorCode: myCode,
      authorLabel: myLabel,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      isVerifiedSolution: false,
    };

    const updatedComments = [...comments, newComment];
    handleUpdateComments(updatedComments);
    saveCommentToCloud(newComment);

    // Save to Relational SQL Backend
    fetch('/api/forum/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newComment),
    }).catch((err) => console.warn('SQL save comment error:', err.message));

    // Update comment count on post
    const updatedPosts = posts.map((p) =>
      p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
    );
    handleUpdatePosts(updatedPosts);
  };

  // Like comment
  const handleLikeComment = (commentId: string) => {
    const updated = comments.map((c) =>
      c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
    );
    handleUpdateComments(updated);
  };

  // Verify Solution toggle (Agent or Admin)
  const handleToggleVerifyComment = (commentId: string) => {
    if (!auth.isAdmin && (!currentAgent || !currentAgent.canVerifyAnswers)) return;

    const updated = comments.map((c) =>
      c.id === commentId ? { ...c, isVerifiedSolution: !c.isVerifiedSolution } : c
    );
    handleUpdateComments(updated);
  };

  // Delete comment (Admin or Agent)
  const handleDeleteComment = (commentId: string) => {
    if (!auth.isAdmin && (!currentAgent || !currentAgent.canBanUsers)) return;
    if (confirm('Delete this comment from discussion?')) {
      const updated = comments.filter((c) => c.id !== commentId && c.parentId !== commentId);
      handleUpdateComments(updated);
    }
  };

  // Forum Create Discussion Action
  const handleCreatePost = (newPostData: {
    channelId: string;
    title: string;
    content: string;
    tags: string[];
    isAnonymous: boolean;
    mediaUrl?: string;
    mediaType?: 'video' | 'image';
    mediaDuration?: number;
    mediaFileName?: string;
  }) => {
    if (isBanned) return;

    const newPost: ForumPost = {
      id: `post_${Date.now()}`,
      channelId: newPostData.channelId,
      title: newPostData.title,
      content: newPostData.content,
      authorRole: auth.role,
      authorCode: myCode,
      authorLabel: newPostData.isAnonymous ? undefined : myLabel,
      isAnonymous: newPostData.isAnonymous,
      createdAt: new Date().toISOString(),
      likes: 1,
      likedBy: [myCode],
      commentsCount: 0,
      isPinned: false,
      isLocked: false,
      tags: newPostData.tags,
      mediaUrl: newPostData.mediaUrl,
      mediaType: newPostData.mediaType,
      mediaDuration: newPostData.mediaDuration,
      mediaFileName: newPostData.mediaFileName,
    };

    const updatedPosts = [newPost, ...posts];
    handleUpdatePosts(updatedPosts);
    savePostToCloud(newPost);

    // Save to Relational SQL Backend
    fetch('/api/forum/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost),
    }).catch((err) => console.warn('SQL save post error:', err.message));
  };

  // Forum Pin Discussion (Agent with canPinPosts / Admin)
  const handlePinPost = (postId: string) => {
    if (!auth.isAdmin && (!currentAgent || !currentAgent.canPinPosts)) return;
    let targetPost: ForumPost | null = null;
    const updated = posts.map((p) => {
      if (p.id === postId) {
        targetPost = { ...p, isPinned: !p.isPinned };
        return targetPost;
      }
      return p;
    });
    handleUpdatePosts(updated);
    if (targetPost) pushPostToSql(targetPost);
  };

  // Forum Lock Discussion Thread (Agent / Admin)
  const handleToggleLockPost = (postId: string) => {
    if (!auth.isAdmin && !auth.isAgent) return;
    let targetPost: ForumPost | null = null;
    const updated = posts.map((p) => {
      if (p.id === postId) {
        targetPost = { ...p, isLocked: !p.isLocked };
        return targetPost;
      }
      return p;
    });
    handleUpdatePosts(updated);
    if (targetPost) pushPostToSql(targetPost);
  };

  // Forum Delete Discussion (Admin only)
  const handleDeletePost = (postId: string) => {
    if (!auth.isAdmin) return;
    if (confirm('Are you sure you want to delete this discussion permanently?')) {
      const updatedPosts = posts.filter((p) => p.id !== postId);
      handleUpdatePosts(updatedPosts);
      const updatedComments = comments.filter((c) => c.postId !== postId);
      handleUpdateComments(updatedComments);
      fetch(`/api/forum/posts/${postId}`, { method: 'DELETE' }).catch(console.warn);
    }
  };

  // Send Chat Message Action with Real-time Cloud Broadcast and Simulation
  const handleSendMessage = (conversationId: string, text: string, attachmentUrl?: string) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      senderCode: myCode,
      senderRole: auth.role,
      text: text || '',
      attachmentUrl,
      attachmentType: attachmentUrl ? 'image' : undefined,
      timestamp: 'Just now',
    };

    const existingMsgs = chats.messages[conversationId] || [];
    const updatedMsgs = {
      ...chats.messages,
      [conversationId]: [...existingMsgs, newMsg],
    };

    const lastPreview = text || (attachmentUrl ? '📷 Photo' : 'New message');

    const updatedConvs = chats.conversations.map((c) =>
      c.id === conversationId
        ? {
            ...c,
            lastMessage: lastPreview,
            lastMessageTime: 'Just now',
            unreadCount: 0,
          }
        : c
    );

    const updatedChats = {
      conversations: updatedConvs,
      messages: updatedMsgs,
    };

    setChats(updatedChats);
    saveForumChats(updatedChats);

    // Save to SQL Database Backend
    fetch('/api/chats/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, message: newMsg }),
    }).catch((err) => console.warn('SQL save chat message error:', err.message));

    // Push to Firestore Cloud for real-time delivery
    sendChatMessageToCloud(newMsg);
  };

  // Start New Anonymous Chat with friend or agent
  const handleStartNewChat = (participantCode: string, name?: string, isAgent: boolean = false) => {
    const existing = chats.conversations.find((c) => {
      let pCode = c.participantCode;
      if (c.participantACode && c.participantBCode) {
        pCode = c.participantACode === myCode ? c.participantBCode : c.participantACode;
      }
      return pCode?.toLowerCase() === participantCode.toLowerCase();
    });

    if (existing) {
      return existing.id;
    }

    const newId = `conv_${Date.now()}`;
    const newConv: ChatConversation = {
      id: newId,
      participantCode,
      participantName: name || `Anonymous (${participantCode})`,
      participantRole: isAgent ? 'agent' : 'student',
      isAgent,
      lastMessage: 'Conversation started',
      lastMessageTime: 'Just now',
      unreadCount: 0,
    };

    const updatedChats = {
      conversations: [newConv, ...chats.conversations],
      messages: {
        ...chats.messages,
        [newId]: [],
      },
    };

    setChats(updatedChats);
    saveForumChats(updatedChats);

    // Push to Firestore Cloud so the friend's device sees this conversation exists.
    // Both participantACode and participantBCode must be set — the chat UI
    // resolves "who's the other person" using both fields, and without
    // participantBCode it falls back to participantCode, which is wrong on
    // the *recipient's* side (it shows their own code instead of the sender's).
    saveChatConversationToCloud({
      ...newConv,
      participantACode: myCode,
      participantBCode: participantCode,
    });

    return newId;
  };

  // Google Drive Export Payload
  const handleExportDriveData = () => {
    return {
      version: '2.0',
      app: 'Sunrays School Forum',
      channels,
      posts,
      comments,
      agents,
      students,
      chats,
      profiles,
      customFields,
      accessPasses,
      updatedAt: new Date().toISOString(),
    };
  };

  // Google Drive Import
  const handleImportDriveData = (data: any) => {
    if (data.channels) {
      setChannels(data.channels);
      saveForumChannels(data.channels);
    }
    if (data.posts) {
      setPosts(data.posts);
      saveForumPosts(data.posts);
    }
    if (data.comments) {
      setComments(data.comments);
      saveForumComments(data.comments);
    }
    if (data.agents) {
      setAgents(data.agents);
      saveForumAgents(data.agents);
    }
    if (data.students) {
      setStudents(data.students);
      saveForumStudents(data.students);
    }
    if (data.chats) {
      setChats(data.chats);
      saveForumChats(data.chats);
    }
    if (data.profiles) {
      setProfiles(data.profiles);
      saveProfiles(data.profiles);
    }
  };

  // Reset Forum to Factory Defaults
  const handleResetAllData = () => {
    const res = resetForumToDefaults();
    setChannels(res.channels);
    setPosts(res.posts);
    setComments(res.comments);
    setAgents(res.agents);
    setStudents(res.students);
    setChats(res.chats);
    fetch('/api/forum/clear-all', { method: 'POST' }).catch(() => {});
  };

  // Save profile from modal
  const handleSaveProfile = (profileData: Partial<Profile>) => {
    if (profileToEdit) {
      const updated = profiles.map((p) =>
        p.id === profileToEdit.id ? ({ ...p, ...profileData } as Profile) : p
      );
      handleUpdateProfiles(updated);
    } else {
      const newProf = {
        ...profileData,
        id: `prof_${Date.now()}`,
      } as Profile;
      handleUpdateProfiles([newProf, ...profiles]);
    }
    setIsProfileFormOpen(false);
    setProfileToEdit(null);
  };

  // Delete profile
  const handleDeleteProfile = (id: string) => {
    const updated = profiles.filter((p) => p.id !== id);
    handleUpdateProfiles(updated);
    setSelectedProfileForDetail(null);
  };

  // If not authenticated, render 3-role AccessGate
  if (!auth.isAuthenticated) {
    return (
      <AccessGate
        students={students}
        agents={agents}
        adminPin={adminPin}
        onLoginSuccess={handleLoginSuccess}
        onGenerateStudentCode={handleGenerateStudentCode}
      />
    );
  }

  const unreadChatsCount = chats.conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const handleNavTabChange = (tab: 'forum' | 'database' | 'about' | 'admin' | 'chats') => {
    setActiveNavTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className={`min-h-screen bg-[#090d16] text-[#e2e8f0] flex flex-col selection:bg-blue-500/30 ${
      activeNavTab === 'chats' ? 'h-screen overflow-hidden pb-14 sm:pb-0' : 'pb-20 sm:pb-8'
    }`}>
      {/* Top Navbar */}
      <Navbar
        currentRole={auth.role}
        studentAccount={currentStudent || auth.studentAccount}
        agentAccount={currentAgent || auth.agentAccount}
        activeNavTab={activeNavTab}
        onNavTabChange={handleNavTabChange}
        unreadChatsCount={unreadChatsCount}
        driveConfig={driveConfig}
        onOpenWhatsAppReferral={() => setShowReferralModal(true)}
        onLogout={handleLogout}
      />

      {/* Main Content View */}
      <main className={`flex-1 w-full mx-auto ${activeNavTab === 'chats' ? 'h-[calc(100vh-64px)] overflow-hidden flex flex-col' : ''}`}>
        {activeNavTab === 'admin' && auth.isAdmin ? (
          <SchoolAdminPage
            agents={agents}
            students={students}
            posts={posts}
            channels={channels}
            profiles={profiles}
            customFields={customFields}
            accessPasses={accessPasses}
            driveConfig={driveConfig}
            onUpdateAgents={handleUpdateAgents}
            onUpdateStudents={handleUpdateStudents}
            onDeleteAgent={handleDeleteAgent}
            onDeleteStudent={handleDeleteStudent}
            onDeletePost={handleDeletePost}
            onPinPost={handlePinPost}
            onToggleLockPost={handleToggleLockPost}
            onUpdateDriveConfig={handleUpdateDriveConfig}
            onExportDriveData={handleExportDriveData}
            onImportDriveData={handleImportDriveData}
            onResetAllData={handleResetAllData}
            onAddNewProfile={() => {
              setProfileToEdit(null);
              setIsProfileFormOpen(true);
            }}
            onViewProfile={(p) => setSelectedProfileForDetail(p)}
            onReturnToForum={() => handleNavTabChange('forum')}
          />
        ) : activeNavTab === 'chats' ? (
          <div className="w-full h-full flex-1 max-w-7xl mx-auto flex flex-col overflow-hidden">
            <AnonymousChatView
              currentRole={auth.role}
              myCode={myCode}
              myLabel={myLabel}
              chats={chats}
              agents={agents}
              students={students}
              onSendMessage={handleSendMessage}
              onStartNewChat={handleStartNewChat}
            />
          </div>
        ) : activeNavTab === 'database' ? (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
            <SchoolDatabaseView
              currentRole={auth.role}
              profiles={profiles}
              customFields={customFields}
              onUpdateProfiles={handleUpdateProfiles}
              canEdit={auth.isAdmin || auth.isAgent}
            />
          </div>
        ) : activeNavTab === 'about' ? (
          <AboutView
            aboutConfig={aboutConfig}
            currentRole={auth.role}
            isAdmin={auth.isAdmin}
            onSaveConfig={handleSaveAboutConfig}
            onNavigateTab={(tab) => handleNavTabChange(tab)}
            onOpenReferralModal={() => setShowReferralModal(true)}
          />
        ) : (
          <ForumView
            channels={channels}
            posts={posts}
            comments={comments}
            currentRole={auth.role}
            myCode={myCode}
            myLabel={myLabel}
            isBanned={isBanned}
            banReason={banReason}
            agentAccount={currentAgent}
            students={students}
            currentStudent={currentStudent}
            onLikePost={handleLikePost}
            onLikeComment={handleLikeComment}
            onAddComment={handleAddComment}
            onCreatePost={handleCreatePost}
            onDeletePost={auth.isAdmin ? handleDeletePost : undefined}
            onPinPost={auth.isAdmin || (currentAgent && currentAgent.canPinPosts) ? handlePinPost : undefined}
            onToggleLockPost={auth.isAdmin || auth.isAgent ? handleToggleLockPost : undefined}
            onToggleVerifyComment={handleToggleVerifyComment}
            onDeleteComment={handleDeleteComment}
            onOpenWhatsAppReferral={() => setShowReferralModal(true)}
          />
        )}
      </main>

      {/* Global Application Footer with About Portal & Founder Link */}
      {activeNavTab !== 'chats' && (
        <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 mt-12 py-8 px-4 sm:px-8 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="font-bold text-white tracking-tight text-sm">S-Forum Student Community</span>
                <VerifiedBadgeTick role="admin" size="sm" />
              </div>
              <p className="text-[11px] text-slate-500 max-w-md">
                100% anonymous school network decoupled from student records. Report grievances, resolve doubts, and connect without fear of retribution.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleNavTabChange('about')}
                className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Info className="w-3.5 h-3.5" />
                <span>About Sunrays S-Forum</span>
              </button>
              <span className="text-slate-700">•</span>
              <button
                type="button"
                onClick={() => handleNavTabChange('forum')}
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Student Forum
              </button>
              <span className="text-slate-700">•</span>
              <button
                type="button"
                onClick={() => handleNavTabChange('chats')}
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Anonymous Chats
              </button>
              <span className="text-slate-700">•</span>
              <button
                type="button"
                onClick={() => setShowReferralModal(true)}
                className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                Earn Blue Tick (Invite 3)
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 text-center sm:text-left">
            <span>Zero IP logs recorded • Cryptographically decoupled member# aliases • Verified MP Board & Campus Network</span>
            <span>Sunrays Higher Secondary Student Community</span>
          </div>
        </footer>
      )}

      {/* WhatsApp Viral Referral Modal */}
      <WhatsAppReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        myCode={currentStudent?.friendCode || myCode}
      />

      {/* Profile Form Modal (for adding / editing student & faculty profiles) */}
      <ProfileFormModal
        isOpen={isProfileFormOpen}
        initialProfile={profileToEdit}
        customFields={customFields}
        categories={['Student', 'Teacher', 'Counselor', 'Alumni', 'Staff']}
        onClose={() => {
          setIsProfileFormOpen(false);
          setProfileToEdit(null);
        }}
        onSave={handleSaveProfile}
      />

      {/* Profile Detail Dossier Modal */}
      <ProfileDetailModal
        profile={selectedProfileForDetail}
        customFields={customFields}
        canEdit={auth.isAdmin || auth.isAgent}
        isAdmin={auth.isAdmin}
        onClose={() => setSelectedProfileForDetail(null)}
        onEdit={(p) => {
          setSelectedProfileForDetail(null);
          setProfileToEdit(p);
          setIsProfileFormOpen(true);
        }}
        onDelete={handleDeleteProfile}
      />

      {/* Android & Mobile Bottom Navigation Bar (Non-redundant, ergonomic bottom bar) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c101c]/95 backdrop-blur-lg border-t border-slate-800 px-3 py-1 flex items-center justify-around">
        <button
          type="button"
          onClick={() => setActiveNavTab('forum')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-xs font-medium cursor-pointer min-h-[48px] min-w-[54px] transition-colors ${
            activeNavTab === 'forum' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Forum</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveNavTab('chats')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-xs font-medium cursor-pointer min-h-[48px] min-w-[54px] transition-colors relative ${
            activeNavTab === 'chats' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessagesSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Chats</span>
          {unreadChatsCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveNavTab('about')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-xs font-medium cursor-pointer min-h-[48px] min-w-[54px] transition-colors ${
            activeNavTab === 'about' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Info className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">About</span>
        </button>

        {(auth.isAdmin || auth.isAgent) && (
          <button
            type="button"
            onClick={() => setActiveNavTab('database')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-xs font-medium cursor-pointer min-h-[48px] min-w-[50px] transition-colors ${
              activeNavTab === 'database' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">DB</span>
          </button>
        )}

        {auth.isAdmin && (
          <button
            type="button"
            onClick={() => setActiveNavTab('admin')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-xs font-medium cursor-pointer min-h-[48px] min-w-[50px] transition-colors ${
              activeNavTab === 'admin' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Admin</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowReferralModal(true)}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-xs font-medium cursor-pointer min-h-[48px] text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <Share2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Invite</span>
        </button>
      </nav>
    </div>
  );
}
