import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Video,
  Monitor,
  Camera,
  Square,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { MediaAsset, Clip } from './types';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordFinished: (asset: MediaAsset, addToTimeline: boolean) => void;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  onClose,
  onRecordFinished,
}) => {
  const [sourceType, setSourceType] = useState<'camera' | 'screen'>('camera');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Initialize preview stream when modal opens or source changes
  useEffect(() => {
    if (!isOpen) {
      stopCurrentStream();
      return;
    }

    let isSubscribed = true;

    async function setupStream() {
      stopCurrentStream();
      setErrorMsg(null);
      try {
        let stream: MediaStream;
        if (sourceType === 'screen') {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: { displaySurface: 'monitor' },
            audio: true,
          });
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
            audio: true,
          });
        }

        if (!isSubscribed) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }

        // Handle stream ended by browser UI (e.g. user clicks "Stop Sharing")
        stream.getVideoTracks()[0].onended = () => {
          if (isRecording) {
            handleStopRecording();
          }
        };
      } catch (err: unknown) {
        if (isSubscribed) {
          setErrorMsg(
            err instanceof Error
              ? err.message
              : 'Unable to access camera or screen capture. Please check browser permissions.'
          );
        }
      }
    }

    setupStream();

    return () => {
      isSubscribed = false;
      stopCurrentStream();
    };
  }, [isOpen, sourceType]);

  const stopCurrentStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStartRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    startTimeRef.current = Date.now();

    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const duration = Math.max(1, (Date.now() - startTimeRef.current) / 1000);
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);

      const asset: MediaAsset = {
        id: `recorded-${Date.now()}`,
        name: `${sourceType === 'screen' ? 'Screen' : 'Webcam'} Record (${duration.toFixed(0)}s)`,
        type: 'video',
        url,
        duration,
      };

      onRecordFinished(asset, true);
      onClose();
    };

    recorder.start(100);
    setIsRecording(true);
    setRecordingTime(0);

    timerRef.current = window.setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleCancelAndClose = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null; // Prevent saving recording
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore stop error
      }
    }
    setIsRecording(false);
    stopCurrentStream();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-zinc-100">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
              <Video size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Record Media</h3>
              <p className="text-[11px] text-zinc-400">Capture directly to your project timeline</p>
            </div>
          </div>

          <button
            onClick={handleCancelAndClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close / Cancel (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Source Toggle (Webcam vs Screen) */}
        {!isRecording && (
          <div className="px-5 pt-4 flex items-center gap-2">
            <button
              onClick={() => setSourceType('camera')}
              className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                sourceType === 'camera'
                  ? 'bg-rose-500/15 border-rose-500 text-rose-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
              }`}
            >
              <Camera size={15} />
              <span>Webcam Camera</span>
            </button>

            <button
              onClick={() => setSourceType('screen')}
              className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                sourceType === 'screen'
                  ? 'bg-rose-500/15 border-rose-500 text-rose-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
              }`}
            >
              <Monitor size={15} />
              <span>Screen Share</span>
            </button>
          </div>
        )}

        {/* Video Preview */}
        <div className="p-5 space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-zinc-800 shadow-inner">
            <video
              ref={videoPreviewRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />

            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-3 left-3 bg-red-600/90 text-white font-mono font-bold text-xs px-3 py-1 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>
                  REC 00:{recordingTime.toString().padStart(2, '0')}
                </span>
              </div>
            )}

            {errorMsg && (
              <div className="absolute inset-4 bg-zinc-900/90 border border-red-800 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 text-red-300 text-xs">
                <AlertCircle size={24} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Record Control Buttons */}
          <div className="flex items-center justify-center gap-3">
            {isRecording ? (
              <>
                <button
                  onClick={handleStopRecording}
                  className="py-3 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer"
                >
                  <Square size={16} fill="currentColor" />
                  <span>Stop & Insert</span>
                </button>
                <button
                  onClick={handleCancelAndClose}
                  className="py-3 px-5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <X size={15} />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleStartRecording}
                disabled={!streamRef.current || !!errorMsg}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
              >
                <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                <span>Start Recording</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
