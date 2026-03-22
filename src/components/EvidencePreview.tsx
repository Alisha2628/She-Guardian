// src/components/EvidencePreview.tsx
import { useEffect, useState, useRef } from 'react';
import { X, Video, AlertTriangle, AlertCircle, Loader2, Download, CheckCircle } from 'lucide-react';
import { getLastPreviewUrl } from '../utils/evidenceRecorder';

interface Props {
  onClose: () => void;
  previewUrl?: string | null; // Optional: SOSButton can pass instant local blob URL
}

export function EvidencePreview({ onClose, previewUrl: propPreviewUrl }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const saveToDevice = async () => {
    if (!previewUrl) return;
    setDownloadStatus('saving');
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SheGuardian_Evidence_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadStatus('saved');
      setTimeout(() => setDownloadStatus('idle'), 4000);
    } catch {
      setDownloadStatus('idle');
    }
  };

  useEffect(() => {
    // Priority: use prop from SOSButton (instant local blob)
    if (propPreviewUrl) {
      setPreviewUrl(propPreviewUrl);
      setIsLoading(false);
    } else {
      // Fallback: get from recorder (older method)
      const url = getLastPreviewUrl();
      if (url) {
        setPreviewUrl(url);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setHasError(true);
      }
    }

    // Cleanup: revoke object URL when modal closes or component unmounts
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
        console.log('[EvidencePreview] Revoked preview URL on cleanup');
      }
    };
  }, [propPreviewUrl, previewUrl]);

  // Handle video playback/load errors
  const handleVideoError = () => {
    setHasError(true);
    console.error('[EvidencePreview] Video failed to load');
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="text-white text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-lg">Loading evidence preview...</p>
        </div>
      </div>
    );
  }

  if (hasError || !previewUrl) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 text-center">
          <AlertTriangle className="mx-auto mb-4 text-yellow-500" size={48} />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No recent evidence available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No video was recorded or the preview could not be loaded.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-8">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden relative shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
          aria-label="Close preview"
        >
          <X size={28} />
        </button>

        {/* Video player */}
        <div className="relative bg-black">
          <video
            ref={videoRef}
            src={previewUrl}
            controls
            autoPlay
            playsInline
            muted // muted to allow autoplay in most browsers
            className="w-full h-auto max-h-[80vh] object-contain"
            onError={handleVideoError}
          />

          {/* Error overlay if video fails */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
              <div className="text-center">
                <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                <p className="text-lg font-medium">Failed to load video preview</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Video size={18} />
              <span>Last recorded evidence clip</span>
            </div>
            <span className="text-xs opacity-80">
              Saved securely to cloud • {new Date().toLocaleTimeString()}
            </span>
          </div>
          {/* Auto-save to device / Google Photos */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={saveToDevice}
              disabled={downloadStatus === 'saving'}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                downloadStatus === 'saved'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-60'
              }`}
            >
              {downloadStatus === 'saving' && <Loader2 size={16} className="animate-spin" />}
              {downloadStatus === 'saved' && <CheckCircle size={16} />}
              {downloadStatus === 'idle' && <Download size={16} />}
              {downloadStatus === 'saving' ? 'Saving...' : downloadStatus === 'saved' ? 'Saved to device!' : 'Save to Device / Google Photos'}
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1.5">
              On Android this saves to Downloads → syncs to Google Photos automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}