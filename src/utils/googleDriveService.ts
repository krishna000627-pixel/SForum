import {
  Profile,
  CustomField,
  AccessPass,
  GoogleDriveBackendConfig,
  ForumPost,
  ForumComment,
  StudentAccount,
  AgentAccount,
  ChatMessage,
  ChatConversation,
  SchoolPortalAboutConfig,
} from '../types';

export const GOOGLE_OAUTH_CLIENT_ID = '199795400801-ouccv9od950cj0v975535vn8bo6k4ah7.apps.googleusercontent.com';
export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
export const DRIVE_DEFAULT_FILENAME = 'sunrays_school_database_backup.json';

const TOKEN_STORAGE_KEY = 'nexusdb_drive_token_v1';
const CLIENT_ID_STORAGE_KEY = 'nexusdb_custom_google_client_id';

export interface TokenRecord {
  accessToken: string;
  expiresAt: number;
}

export interface DriveDatabasePayload {
  version: string;
  updatedAt: string;
  app: string;
  profiles: Profile[];
  customFields: CustomField[];
  accessPasses: AccessPass[];
  forumPosts?: ForumPost[];
  forumComments?: ForumComment[];
  studentAccounts?: StudentAccount[];
  agentAccounts?: AgentAccount[];
  chats?: {
    conversations: ChatConversation[];
    messages: Record<string, ChatMessage[]>;
  };
  aboutConfig?: SchoolPortalAboutConfig;
}

export function downloadBackupJsonFile(payload: DriveDatabasePayload, fileName = 'sunrays_school_full_backup.json') {
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getCustomClientId(): string {
  try {
    return localStorage.getItem(CLIENT_ID_STORAGE_KEY) || GOOGLE_OAUTH_CLIENT_ID;
  } catch {
    return GOOGLE_OAUTH_CLIENT_ID;
  }
}

export function setCustomClientId(clientId: string): void {
  try {
    if (clientId.trim()) {
      localStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId.trim());
    } else {
      localStorage.removeItem(CLIENT_ID_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

/**
 * Retrieves the stored valid token or null if expired or missing.
 */
export function getStoredDriveToken(): string | null {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const data: TokenRecord = JSON.parse(raw);
    if (Date.now() > data.expiresAt - 60000) {
      // Expired or expiring within 1 minute
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
    return data.accessToken;
  } catch {
    return null;
  }
}

export function saveDriveToken(accessToken: string, expiresInSeconds: number = 3500) {
  const data: TokenRecord = {
    accessToken,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  };
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(data));
}

export function clearDriveToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Initializes Google Identity Services token client and requests access.
 */
export function requestGoogleDriveAuth(
  onSuccess: (token: string) => void,
  onError?: (err: any) => void,
  customClientId?: string
): void {
  if (typeof window === 'undefined') return;

  const google = (window as any).google;
  if (!google?.accounts?.oauth2) {
    if (onError) {
      onError(new Error('Google Identity Services script is loading or blocked by browser extensions. Try reloading.'));
    }
    return;
  }

  const clientIdToUse = (customClientId && customClientId.trim()) || getCustomClientId();

  try {
    let resolved = false;

    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientIdToUse,
      scope: DRIVE_SCOPE,
      callback: (tokenResponse: any) => {
        resolved = true;
        if (tokenResponse.error) {
          if (onError) {
            onError(new Error(tokenResponse.error_description || tokenResponse.error || 'Google OAuth error'));
          }
          return;
        }
        if (tokenResponse.access_token) {
          saveDriveToken(tokenResponse.access_token, tokenResponse.expires_in || 3599);
          onSuccess(tokenResponse.access_token);
        } else {
          if (onError) onError(new Error('No access token returned from Google.'));
        }
      },
      error_callback: (err: any) => {
        resolved = true;
        if (onError) onError(err);
      },
    });

    // Use prompt: 'consent' to force the Google Account selection dialog instead of failing silently on an empty prompt
    client.requestAccessToken({ prompt: 'consent' });

    // Safety timeout in case popup was blocked or closed silently
    setTimeout(() => {
      if (!resolved) {
        // Did not resolve in 60s
      }
    }, 60000);
  } catch (e: any) {
    if (onError) onError(e);
  }
}

/**
 * Searches for an existing database JSON file in Google Drive.
 */
export async function findDatabaseFile(
  accessToken: string,
  fileName: string = DRIVE_DEFAULT_FILENAME
): Promise<{ id: string; name: string; modifiedTime?: string } | null> {
  const query = encodeURIComponent(`name = '${fileName}' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)&spaces=drive`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to query Google Drive (HTTP ${res.status}): ${errorText}`);
  }

  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0];
  }
  return null;
}

/**
 * Saves (creates or updates) the database file in Google Drive.
 */
export async function saveDatabaseToGoogleDrive(
  accessToken: string,
  payload: DriveDatabasePayload,
  fileName: string = DRIVE_DEFAULT_FILENAME
): Promise<{ fileId: string; modifiedTime: string }> {
  const existing = await findDatabaseFile(accessToken, fileName);
  const fileContent = JSON.stringify(payload, null, 2);

  if (existing) {
    // Update existing file
    const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=media`;
    const res = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: fileContent,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to update Drive file: ${err}`);
    }

    const updated = await res.json();
    return {
      fileId: updated.id,
      modifiedTime: new Date().toISOString(),
    };
  } else {
    // Create new multipart file
    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      description: 'Sunrays School Campus & Forum Database Backup',
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      closeDelimiter;

    const createUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    const res = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to create file in Drive: ${err}`);
    }

    const created = await res.json();
    return {
      fileId: created.id,
      modifiedTime: new Date().toISOString(),
    };
  }
}

/**
 * Loads and parses the database from Google Drive.
 */
export async function loadDatabaseFromGoogleDrive(
  accessToken: string,
  fileName: string = DRIVE_DEFAULT_FILENAME
): Promise<DriveDatabasePayload | null> {
  const existing = await findDatabaseFile(accessToken, fileName);
  if (!existing) return null;

  const url = `https://www.googleapis.com/drive/v3/files/${existing.id}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to download file from Google Drive: ${err}`);
  }

  const payload: DriveDatabasePayload = await res.json();
  return payload;
}

/**
 * Tests connection to Google Drive by getting user profile and storage quota.
 */
export async function testGoogleDriveConnection(accessToken: string): Promise<{
  success: boolean;
  email?: string;
  displayName?: string;
  storageQuota?: { usage: string; limit: string };
  error?: string;
}> {
  try {
    const url = 'https://www.googleapis.com/drive/v3/about?fields=user,storageQuota';
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      if (res.status === 401) {
        clearDriveToken();
      }
      return { success: false, error: `Google API returned status ${res.status}` };
    }

    const data = await res.json();
    const usageGB = data.storageQuota?.usage
      ? `${(parseInt(data.storageQuota.usage, 10) / (1024 * 1024 * 1024)).toFixed(2)} GB`
      : 'Unknown';

    return {
      success: true,
      email: data.user?.emailAddress,
      displayName: data.user?.displayName,
      storageQuota: {
        usage: usageGB,
        limit: data.storageQuota?.limit || 'Unlimited',
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Uploads any media (images, videos, PDFs) directly to Google Drive via Google Drive API v3
 * and sets public reader permission so everyone on the forum/chat can view it in real-time.
 */
export async function uploadMediaDirectlyToDrive(
  file: File | Blob,
  fileName: string = 'media_upload',
  customAccessToken?: string
): Promise<{
  url: string;
  fileId: string;
  directImageUrl: string;
  embedUrl: string;
  fileName: string;
}> {
  const token = customAccessToken || getStoredDriveToken();
  if (!token) {
    throw new Error('Google Drive token missing. Please sign in to Google Drive.');
  }

  const actualFileName = (file instanceof File) ? file.name : fileName;
  const mimeType = file.type || 'application/octet-stream';

  const metadata = {
    name: actualFileName,
    mimeType: mimeType,
    description: 'Uploaded directly via Sunrays Campus Media API',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  // Read file as base64 string
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.byteLength; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  const base64Data = btoa(binary);

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n` +
    'Content-Transfer-Encoding: base64\r\n\r\n' +
    base64Data +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 401) {
      clearDriveToken();
    }
    throw new Error(`Google Drive upload failed (${res.status}): ${errText}`);
  }

  const result = await res.json();
  const fileId = result.id;

  // Make public read-only so media can be viewed by classmates without 403 error
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });
  } catch (permErr) {
    console.warn('Set Google Drive permission note:', permErr);
  }

  return {
    fileId,
    fileName: actualFileName,
    url: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
    embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    directImageUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
  };
}
