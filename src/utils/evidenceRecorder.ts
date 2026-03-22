// src/utils/evidenceRecorder.ts

let mediaRecorder: MediaRecorder | null = null;
let mediaStream: MediaStream | null = null;
let recordedChunks: Blob[] = [];
let lastPreviewUrl: string | null = null;
let lastUploadedUrl: string | null = null;
let uploadProgressCallback: ((progress: number) => void) | null = null;

export function setUploadProgressCallback(callback: (progress: number) => void) {
  uploadProgressCallback = callback;
}

// Start recording – optimized for mobile (lower res + audio)
export async function startEvidenceRecording(): Promise<void> {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    console.log('[evidenceRecorder] Already recording – ignoring start request');
    return;
  }

  try {
    console.log('[evidenceRecorder] Requesting camera & mic access...');

    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        facingMode: 'user',
        width: { ideal: 640 },    // lower res = faster upload on mobile
        height: { ideal: 480 },
        frameRate: { ideal: 30 },
      },
    });

    mediaRecorder = new MediaRecorder(mediaStream, {
      mimeType: 'video/webm;codecs=vp8,opus',
    });

    recordedChunks = [];

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
        console.log(`[evidenceRecorder] Chunk added – size: ${event.data.size} bytes`);
      }
    };

    // Start with 1-second chunks – fast stop & better recovery
    mediaRecorder.start(1000);
    console.log('[evidenceRecorder] Recording STARTED – 1s chunks');
  } catch (err: any) {
    console.error('[evidenceRecorder] Media access failed:', err.name, err.message);
    if (err.name === 'NotAllowedError') {
      alert('Camera and/or microphone permission denied.\nPlease allow access in browser settings.');
    } else if (err.name === 'NotFoundError') {
      alert('No camera or microphone found on this device.');
    } else {
      alert('Cannot start recording: ' + (err.message || 'Unknown error'));
    }
  }
}

// Stop recording and upload to Supabase – returns path, preview & public URL
export async function stopAndUploadEvidence(
  userId: string,
  supabase: any
): Promise<{ path: string | null; previewUrl: string | null; url: string | null }> {
  if (!mediaRecorder || !mediaStream) {
    console.warn('[evidenceRecorder] No active recording to stop');
    return { path: null, previewUrl: null, url: null };
  }

  return new Promise((resolve) => {
    mediaRecorder!.onstop = async () => {
      try {
        console.log('[evidenceRecorder] Recording stopped – preparing blob...');

        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const previewUrl = URL.createObjectURL(blob);
        lastPreviewUrl = previewUrl;

        // Use your real bucket name from Supabase dashboard (case-sensitive!)
        const bucketName = 'sos-evidence'; // ← CHANGE HERE if your bucket has different name
        const filePath = `${bucketName}/${userId}/${Date.now()}.webm`;

        console.log('[evidenceRecorder] Uploading video to bucket:', bucketName, 'path:', filePath);

        setUploadProgressCallback?.(0); // reset progress

        // Upload with timeout (prevent hanging forever)
        const uploadPromise = supabase.storage
          .from(bucketName)
          .upload(filePath, blob, {
            contentType: 'video/webm',
            upsert: true,
          });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Upload timeout after 30s')), 30000)
        );

        const { error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]);

        if (uploadError) {
          console.error('[evidenceRecorder] Upload failed:', uploadError);
          throw uploadError;
        }

        // Try public URL first
        let publicUrl = '';
        const { data: publicData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        publicUrl = publicData?.publicUrl || '';

        // Fallback to signed URL if public fails (for private buckets)
        if (!publicUrl) {
          console.warn('[evidenceRecorder] Public URL empty – trying signed URL');
          const { data: signedData, error: signedError } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(filePath, 60 * 60 * 24); // 24 hours expiry

          if (signedError) throw signedError;
          publicUrl = signedData?.signedUrl || '';
        }

        if (!publicUrl) {
          throw new Error('Failed to generate any accessible URL for the uploaded video');
        }

        lastUploadedUrl = publicUrl;

        console.log('[evidenceRecorder] Video uploaded successfully:', publicUrl);

        // Cleanup media tracks
        mediaStream!.getTracks().forEach((track) => track.stop());
        mediaRecorder = null;
        mediaStream = null;
        recordedChunks = [];

        // Revoke old preview URL to free memory
        if (lastPreviewUrl && lastPreviewUrl !== previewUrl) {
          URL.revokeObjectURL(lastPreviewUrl);
        }

        setUploadProgressCallback?.(100);

        resolve({ path: filePath, previewUrl, url: publicUrl });
      } catch (err: any) {
        console.error('[evidenceRecorder] Upload process failed:', err.message || err);
        setUploadProgressCallback?.(0);

        // Cleanup even on error
        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
          mediaStream = null;
        }
        mediaRecorder = null;
        recordedChunks = [];

        resolve({ path: null, previewUrl: lastPreviewUrl, url: null });
      }
    };

    console.log('[evidenceRecorder] Stopping MediaRecorder...');
    mediaRecorder!.stop();
  });
}

// Stop recording without uploading (for manual cancel)
export function stopRecordingWithoutUpload(): void {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    console.log('[evidenceRecorder] Recording stopped without upload');
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  mediaRecorder = null;
  recordedChunks = [];
}

// Get last preview URL for immediate display
export function getLastPreviewUrl(): string | null {
  return lastPreviewUrl;
}

// Get last successfully uploaded public URL
export function getLastUploadedUrl(): string | null {
  return lastUploadedUrl;
}

// Check if recording is active
export function isRecording(): boolean {
  return !!mediaRecorder && mediaRecorder.state === 'recording';
}

// Reset everything (for logout or error recovery)
export function resetRecorder(): void {
  stopRecordingWithoutUpload();
  if (lastPreviewUrl) {
    URL.revokeObjectURL(lastPreviewUrl);
    lastPreviewUrl = null;
  }
  lastUploadedUrl = null;
  recordedChunks = [];
  console.log('[evidenceRecorder] Recorder fully reset');
}