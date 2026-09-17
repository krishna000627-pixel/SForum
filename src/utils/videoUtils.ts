// Video utility helper for handling video duration verification (up to 5 minutes)
export const MAX_VIDEO_DURATION_SECONDS = 300; // 5 minutes

export function formatVideoDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const formatDuration = formatVideoDuration;

export function validateVideoDuration(file: File): Promise<{
  valid: boolean;
  isValid: boolean;
  duration: number;
  durationSeconds: number;
  formattedDuration: string;
  error?: string;
  errorMessage?: string;
}> {
  return new Promise((resolve) => {
    // Basic type check
    if (!file.type.startsWith('video/')) {
      const err = 'The selected file is not a valid video format.';
      resolve({
        valid: false,
        isValid: false,
        duration: 0,
        durationSeconds: 0,
        formattedDuration: '0:00',
        error: err,
        errorMessage: err,
      });
      return;
    }

    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);

    videoElement.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      const duration = videoElement.duration;
      const formatted = formatVideoDuration(duration);

      if (duration > MAX_VIDEO_DURATION_SECONDS) {
        const err = `Video exceeds the 5-minute limit (Length: ${formatted}). Please trim or select a video under 5 minutes.`;
        resolve({
          valid: false,
          isValid: false,
          duration,
          durationSeconds: duration,
          formattedDuration: formatted,
          error: err,
          errorMessage: err,
        });
      } else {
        resolve({
          valid: true,
          isValid: true,
          duration,
          durationSeconds: duration,
          formattedDuration: formatted,
        });
      }
    };

    videoElement.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback: If metadata cannot be read immediately, allow under 50MB file
      if (file.size > 50 * 1024 * 1024) {
        const err = 'Video file is too large (exceeds 50MB). Please select a shorter video clip.';
        resolve({
          valid: false,
          isValid: false,
          duration: 0,
          durationSeconds: 0,
          formattedDuration: 'Unknown',
          error: err,
          errorMessage: err,
        });
      } else {
        resolve({
          valid: true,
          isValid: true,
          duration: 0,
          durationSeconds: 0,
          formattedDuration: '< 5m',
        });
      }
    };

    videoElement.src = objectUrl;
  });
}
