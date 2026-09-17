import { getStoredDriveToken, uploadMediaDirectlyToDrive, requestGoogleDriveAuth } from './googleDriveService';
import { uploadToFirebaseStorage } from '../firebase/firebase';

// Helper to convert any Google Drive shareable link into an embeddable preview or direct image URL

export interface GoogleDriveMediaInfo {
  isDriveLink: boolean;
  fileId: string | null;
  embedUrl: string | null;
  directImageUrl: string | null;
  thumbnailUrl: string | null;
}

export function isGoogleDriveConnected(): boolean {
  return !!getStoredDriveToken();
}

export function connectGoogleDrive(
  onSuccess: (token: string) => void,
  onError?: (err: any) => void
): void {
  requestGoogleDriveAuth(onSuccess, onError);
}

export interface UploadResult {
  url: string;
  mediaType: 'video' | 'image';
  fileName: string;
  embedUrl?: string;
  directImageUrl?: string;
  source: 'google_drive' | 'cloud' | 'local';
}

/**
 * Universal Direct Media Uploader:
 * 1. If Google Drive token exists -> Uploads directly to Google Drive via Drive API.
 * 2. If no Drive token -> Uploads to Firebase Storage / Cloud, or local compressed data URL.
 * Requires ZERO manual link pasting. Single-click instant upload!
 */
export async function uploadDirectMedia(
  file: File,
  folder: 'forum' | 'chats' | 'general' = 'forum'
): Promise<UploadResult> {
  const isVideo = file.type.startsWith('video/');
  const mediaType: 'video' | 'image' = isVideo ? 'video' : 'image';
  const fileName = file.name;

  // 1. Try Google Drive API direct upload if authorized
  const driveToken = getStoredDriveToken();
  if (driveToken) {
    try {
      const driveRes = await uploadMediaDirectlyToDrive(file, fileName, driveToken);
      return {
        url: driveRes.url,
        embedUrl: driveRes.embedUrl,
        directImageUrl: driveRes.directImageUrl,
        mediaType,
        fileName,
        source: 'google_drive',
      };
    } catch (driveErr) {
      console.warn('Google Drive direct upload fallback:', driveErr);
    }
  }

  // 2. Try Firebase Storage
  try {
    const cloudUrl = await uploadToFirebaseStorage(
      file,
      isVideo ? 'forum_videos' : 'forum_images'
    );
    return {
      url: cloudUrl,
      directImageUrl: isVideo ? undefined : cloudUrl,
      mediaType,
      fileName,
      source: 'cloud',
    };
  } catch (cloudErr) {
    console.warn('Cloud storage fallback:', cloudErr);
  }

  // 3. Smart local compression fallback for images
  if (!isVideo) {
    try {
      const compressed = await compressImageToDataUrl(file, 1080, 1080, 0.75);
      return {
        url: compressed,
        directImageUrl: compressed,
        mediaType: 'image',
        fileName,
        source: 'local',
      };
    } catch (compressErr) {
      console.warn('Image compression fallback error:', compressErr);
    }
  }

  // Final fallback: File data URL
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return {
    url: dataUrl,
    mediaType,
    fileName,
    source: 'local',
  };
}

/**
 * Parses Google Drive links like:
 * - https://drive.google.com/file/d/1A2B3C.../view?usp=sharing
 * - https://drive.google.com/open?id=1A2B3C...
 * - https://drive.google.com/uc?id=1A2B3C...
 * - 1A2B3C... (raw file ID)
 */
export function parseGoogleDriveLink(urlOrId: string): GoogleDriveMediaInfo {
  if (!urlOrId || typeof urlOrId !== 'string') {
    return { isDriveLink: false, fileId: null, embedUrl: null, directImageUrl: null, thumbnailUrl: null };
  }

  const trimmed = urlOrId.trim();

  // Check if standard Google Drive pattern
  const driveFileRegex = /\/file\/d\/([a-zA-Z0-9_-]{25,})/;
  const driveIdParamRegex = /[?&]id=([a-zA-Z0-9_-]{25,})/;
  const directIdRegex = /^[a-zA-Z0-9_-]{25,50}$/;

  let fileId: string | null = null;

  const fileMatch = trimmed.match(driveFileRegex);
  if (fileMatch && fileMatch[1]) {
    fileId = fileMatch[1];
  } else {
    const paramMatch = trimmed.match(driveIdParamRegex);
    if (paramMatch && paramMatch[1]) {
      fileId = paramMatch[1];
    } else if (directIdRegex.test(trimmed)) {
      fileId = trimmed;
    }
  }

  if (fileId) {
    return {
      isDriveLink: true,
      fileId,
      // For video streaming / docs player
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      // For direct image rendering in <img> tags
      directImageUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
      thumbnailUrl: `https://lh3.googleusercontent.com/d/${fileId}=s400`,
    };
  }

  return { isDriveLink: false, fileId: null, embedUrl: null, directImageUrl: null, thumbnailUrl: null };
}

/**
 * Compresses an image file in the browser to lightweight webp/jpeg base64
 * Fits easily into Firestore documents (< 150KB) with zero billing requirements
 */
export function compressImageToDataUrl(
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use JPEG for optimal compression ratio
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

