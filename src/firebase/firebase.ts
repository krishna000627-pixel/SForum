import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { ForumPost, ForumComment, ChatMessage, ChatConversation, Profile, CustomField, AccessPass, StudentAccount, AgentAccount } from '../types';
import { deleteDoc } from 'firebase/firestore';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// ignoreUndefinedProperties: true — without this, setDoc()/saveDoc() throws
// (and gets silently swallowed by our try/catch) any time a post/comment/
// message has an optional field left as `undefined` (e.g. an anonymous post
// with no authorLabel, or a post with no attached photo/video). That was
// the actual cause of forum posts never reaching Firestore.
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
export const storage = getStorage(app);

// Connectivity state
let isFirestoreAvailable = false;

export async function checkFirebaseHealth(): Promise<{ ok: boolean; message: string }> {
  try {
    const testRef = doc(db, '_system_health', 'ping');
    await setDoc(testRef, {
      lastPing: new Date().toISOString(),
      timestamp: serverTimestamp(),
      app: 'Sunrays School Forum'
    }, { merge: true });
    isFirestoreAvailable = true;
    return { ok: true, message: 'Connected to Sunrays Firebase Cloud (Firestore & Storage Active)' };
  } catch (err: any) {
    console.warn('Firebase health check warning:', err?.message || err);
    return { ok: false, message: err?.message || 'Firebase initialization offline' };
  }
}

/**
 * Upload an Image or File directly to Firebase Storage bucket (5GB free)
 * Returns public download URL
 */
export async function uploadToFirebaseStorage(
  file: File | Blob,
  folder: 'forum' | 'chats' | 'avatars' | 'general' | 'forum_videos' | 'forum_images' | string = 'forum'
): Promise<string> {
  try {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const fileName = `${folder}/${timestamp}_${randomStr}`;
    const storageRef = ref(storage, fileName);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error: any) {
    console.error('Firebase Storage upload failed:', error);
    throw new Error(`Upload to Firebase Storage failed: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Real-time Firestore sync for Forum Posts
 */
export function subscribeToCloudForumPosts(onUpdate: (posts: ForumPost[]) => void): () => void {
  try {
    const postsCol = collection(db, 'forum_posts');
    const q = query(postsCol, orderBy('createdAt', 'desc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const posts: ForumPost[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as ForumPost;
          posts.push({ ...data, id: docSnap.id });
        });
        onUpdate(posts);
      }
    }, (error) => {
      console.warn('Firestore forum posts subscription warning:', error);
    });

    return unsubscribe;
  } catch (e) {
    console.warn('Could not subscribe to cloud forum posts', e);
    return () => {};
  }
}

/**
 * Push or update a Forum Post to Firestore
 */
export async function savePostToCloud(post: ForumPost): Promise<void> {
  try {
    const postRef = doc(db, 'forum_posts', post.id);
    await setDoc(postRef, {
      ...post,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Could not save post to cloud:', err);
  }
}

/**
 * Push or update a Forum Comment to Firestore
 */
export async function saveCommentToCloud(comment: ForumComment): Promise<void> {
  try {
    const commentRef = doc(db, 'forum_comments', comment.id);
    await setDoc(commentRef, {
      ...comment,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Could not save comment to cloud:', err);
  }
}

/**
 * Real-time Firestore sync for Direct Chat Messages
 */
export function subscribeToCloudChatMessages(
  onUpdate: (allMessages: Record<string, ChatMessage[]>) => void
): () => void {
  try {
    const chatsCol = collection(db, 'chat_messages');
    const q = query(chatsCol, orderBy('timestamp', 'asc'), limit(500));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const messagesMap: Record<string, ChatMessage[]> = {};
        snapshot.forEach((docSnap) => {
          const msg = docSnap.data() as ChatMessage;
          const convId = msg.conversationId || 'default';
          if (!messagesMap[convId]) {
            messagesMap[convId] = [];
          }
          // Avoid duplicate push
          if (!messagesMap[convId].some(m => m.id === msg.id)) {
            messagesMap[convId].push({ ...msg, id: docSnap.id });
          }
        });
        onUpdate(messagesMap);
      }
    }, (error) => {
      console.warn('Firestore chat subscription warning:', error);
    });

    return unsubscribe;
  } catch (e) {
    console.warn('Could not subscribe to cloud chat messages', e);
    return () => {};
  }
}

/**
 * Push a single Chat Message to Firestore for live real-time delivery to friends
 */
export async function sendChatMessageToCloud(message: ChatMessage): Promise<void> {
  try {
    const msgRef = doc(db, 'chat_messages', message.id);
    await setDoc(msgRef, {
      ...message,
      cloudTimestamp: serverTimestamp()
    });
  } catch (err) {
    console.warn('Could not push chat message to Firestore cloud:', err);
  }
}

/**
 * Push full school database (Profiles, Fields, Access Passes) to Firestore
 */
export async function syncDatabaseToCloud(
  profiles: Profile[],
  customFields: CustomField[],
  accessPasses: AccessPass[]
): Promise<void> {
  try {
    const metaRef = doc(db, 'school_meta', 'manifest');
    await setDoc(metaRef, {
      updatedAt: new Date().toISOString(),
      profilesCount: profiles.length,
      customFields,
      accessPasses
    }, { merge: true });

    // Sync profiles in batch or individual docs
    for (const p of profiles) {
      const pRef = doc(db, 'student_profiles', p.id);
      await setDoc(pRef, p, { merge: true });
    }
  } catch (err) {
    console.warn('Could not sync school database to Firestore cloud:', err);
  }
}

/**
 * Subscribe to student profiles in Firestore
 */
export function subscribeToCloudProfiles(onUpdate: (profiles: Profile[]) => void): () => void {
  try {
    const profCol = collection(db, 'student_profiles');
    const unsubscribe = onSnapshot(profCol, (snapshot) => {
      if (!snapshot.empty) {
        const profiles: Profile[] = [];
        snapshot.forEach((docSnap) => {
          profiles.push({ ...(docSnap.data() as Profile), id: docSnap.id });
        });
        onUpdate(profiles);
      }
    }, (err) => {
      console.warn('Firestore profiles subscription warning:', err);
    });

    return unsubscribe;
  } catch (e) {
    console.warn('Could not subscribe to cloud profiles', e);
    return () => {};
  }
}

/**
 * Real-time Firestore sync for anonymous Student accounts (member codes,
 * passcodes, friend codes). This is the shared identity table every device
 * needs to see, or the same member/friend code can get generated twice and
 * a friend code created on one device won't be recognized on another.
 */
export function subscribeToCloudStudents(onUpdate: (students: StudentAccount[]) => void): () => void {
  try {
    const studentsCol = collection(db, 'forum_students');
    const unsubscribe = onSnapshot(studentsCol, (snapshot) => {
      const students: StudentAccount[] = [];
      snapshot.forEach((docSnap) => {
        students.push({ ...(docSnap.data() as StudentAccount), id: docSnap.id });
      });
      onUpdate(students);
    }, (error) => {
      console.warn('Firestore students subscription warning:', error);
    });
    return unsubscribe;
  } catch (e) {
    console.warn('Could not subscribe to cloud students', e);
    return () => {};
  }
}

export async function saveStudentToCloud(student: StudentAccount): Promise<void> {
  try {
    const ref = doc(db, 'forum_students', student.id);
    await setDoc(ref, { ...student, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Could not save student to cloud:', err);
  }
}

export async function deleteStudentFromCloud(studentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'forum_students', studentId));
  } catch (err) {
    console.warn('Could not delete student from cloud:', err);
  }
}

/**
 * Real-time Firestore sync for Agent (counselor/teacher) accounts.
 */
export function subscribeToCloudAgents(onUpdate: (agents: AgentAccount[]) => void): () => void {
  try {
    const agentsCol = collection(db, 'forum_agents');
    const unsubscribe = onSnapshot(agentsCol, (snapshot) => {
      const agents: AgentAccount[] = [];
      snapshot.forEach((docSnap) => {
        agents.push({ ...(docSnap.data() as AgentAccount), id: docSnap.id });
      });
      onUpdate(agents);
    }, (error) => {
      console.warn('Firestore agents subscription warning:', error);
    });
    return unsubscribe;
  } catch (e) {
    console.warn('Could not subscribe to cloud agents', e);
    return () => {};
  }
}

export async function saveAgentToCloud(agent: AgentAccount): Promise<void> {
  try {
    const ref = doc(db, 'forum_agents', agent.id);
    await setDoc(ref, { ...agent, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Could not save agent to cloud:', err);
  }
}

export async function deleteAgentFromCloud(agentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'forum_agents', agentId));
  } catch (err) {
    console.warn('Could not delete agent from cloud:', err);
  }
}

/**
 * Real-time Firestore sync for chat conversation records (who is talking to
 * whom). Messages already sync via subscribeToCloudChatMessages, but without
 * the conversation record itself syncing too, a friend's device never learns
 * the conversation exists.
 */
export function subscribeToCloudChatConversations(onUpdate: (conversations: ChatConversation[]) => void): () => void {
  try {
    const convCol = collection(db, 'chat_conversations');
    const unsubscribe = onSnapshot(convCol, (snapshot) => {
      const conversations: ChatConversation[] = [];
      snapshot.forEach((docSnap) => {
        conversations.push({ ...(docSnap.data() as ChatConversation), id: docSnap.id });
      });
      onUpdate(conversations);
    }, (error) => {
      console.warn('Firestore chat conversations subscription warning:', error);
    });
    return unsubscribe;
  } catch (e) {
    console.warn('Could not subscribe to cloud chat conversations', e);
    return () => {};
  }
}

export async function saveChatConversationToCloud(conversation: ChatConversation): Promise<void> {
  try {
    const ref = doc(db, 'chat_conversations', conversation.id);
    await setDoc(ref, { ...conversation, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Could not save chat conversation to cloud:', err);
  }
}
