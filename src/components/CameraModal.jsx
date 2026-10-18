'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  RotateCcw,
  Sparkles,
  Send,
  Download,
  FlipHorizontal,
  Sliders,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

export const CAMERA_FILTERS = [
  {
    id: 'normal',
    name: 'Normal',
    emoji: '✨',
    cssFilter: 'none',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    emoji: '🌅',
    cssFilter: 'sepia(0.35) saturate(1.5) contrast(1.1) brightness(1.05)',
  },
  {
    id: 'noir',
    name: 'Noir B&W',
    emoji: '🎬',
    cssFilter: 'grayscale(1) contrast(1.3) brightness(0.95)',
  },
  {
    id: 'vintage',
    name: 'Vintage 90s',
    emoji: '📼',
    cssFilter: 'sepia(0.55) contrast(1.2) brightness(1.06) hue-rotate(-15deg)',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    emoji: '🌆',
    cssFilter: 'contrast(1.4) saturate(2) hue-rotate(185deg) brightness(1.1)',
  },
  {
    id: 'cool',
    name: 'Cool Breeze',
    emoji: '❄️',
    cssFilter: 'hue-rotate(155deg) saturate(1.25) brightness(1.05) contrast(1.05)',
  },
  {
    id: 'beauty',
    name: 'Soft Glow',
    emoji: '💖',
    cssFilter: 'brightness(1.12) contrast(0.95) saturate(1.35)',
  },
  {
    id: 'sunset',
    name: 'Sunset Rose',
    emoji: '🌺',
    cssFilter: 'sepia(0.3) saturate(1.8) hue-rotate(320deg) brightness(1.1)',
  },
  {
    id: 'matrix',
    name: 'Emerald Matrix',
    emoji: '🟢',
    cssFilter: 'hue-rotate(85deg) saturate(1.8) contrast(1.25)',
  },
  {
    id: 'vibrant',
    name: 'Vibrant Pop',
    emoji: '⚡',
    cssFilter: 'saturate(2.2) contrast(1.2) brightness(1.05)',
  },
  {
    id: 'cinema',
    name: 'Cinema Teal',
    emoji: '🍿',
    cssFilter: 'contrast(1.35) brightness(0.94) saturate(1.2) hue-rotate(15deg)',
  },
];

export const CameraModal = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Take Photo with Filter',
  initialMode = 'capture', // 'capture' | 'avatar'
}) => {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' | 'environment'
  const [activeFilter, setActiveFilter] = useState(CAMERA_FILTERS[0]);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [rawCapturedPhoto, setRawCapturedPhoto] = useState(null);
  const [caption, setCaption] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [flashEffect, setFlashEffect] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Start device camera
  const startCamera = useCallback(async (facing = facingMode) => {
    setIsInitializing(true);
    setCameraError('');

    // Stop existing stream if any
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported on this browser or platform');
      }

      const constraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Camera initialization error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera permissions in your browser or choose a file.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. You can upload an image to apply filters!');
      } else {
        setCameraError(err.message || 'Unable to access camera.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode]);

  // Stop camera tracks
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Handle open/close lifecycle
  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      setRawCapturedPhoto(null);
      setCaption('');
      setActiveFilter(CAMERA_FILTERS[0]);
      startCamera('user');
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Toggle front/back camera
  const handleFlipCamera = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Capture Photo
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Trigger visual flash
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;

    // Use square or proportional canvas
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw raw frame
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setRawCapturedPhoto(rawDataUrl);

    // 2. Render with active filter
    applyFilterToCanvas(rawDataUrl, activeFilter);

    // Pause video
    stopCamera();
  };

  // Re-apply filter on captured photo or raw canvas
  const applyFilterToCanvas = (rawImageSrc, filterObj) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply CSS filter directly to canvas rendering
      ctx.filter = filterObj.cssFilter || 'none';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none'; // reset

      const filteredDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedPhoto(filteredDataUrl);
    };
    img.src = rawImageSrc;
  };

  const handleSelectFilter = (filterObj) => {
    setActiveFilter(filterObj);
    if (rawCapturedPhoto) {
      applyFilterToCanvas(rawCapturedPhoto, filterObj);
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPhoto(null);
    setRawCapturedPhoto(null);
    setCaption('');
    startCamera(facingMode);
  };

  // Handle uploading local photo as fallback
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        setRawCapturedPhoto(dataUrl);
        setCameraError('');
        applyFilterToCanvas(dataUrl, activeFilter);
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
  };

  // Confirm and Send
  const handleConfirmSend = () => {
    if (!capturedPhoto) return;
    if (onCapture) {
      onCapture({
        image: capturedPhoto,
        caption: caption.trim(),
        filter: activeFilter.name,
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-[#0b0f19] border border-violet-500/30 rounded-3xl shadow-2xl shadow-violet-950/60 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-violet-600/20 text-violet-400">
              <Camera className="w-4 h-4" />
            </div>
            <span className="font-semibold text-white text-sm">
              {capturedPhoto ? 'Review & Filter Photo' : title}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {!capturedPhoto && !cameraError && (
              <button
                type="button"
                onClick={handleFlipCamera}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Flip Camera (Front / Back)"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Close Camera"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport: Live Camera or Photo Preview */}
        <div className="relative flex-1 bg-black min-h-[340px] sm:min-h-[420px] flex items-center justify-center overflow-hidden">
          {/* Shutter flash effect */}
          {flashEffect && (
            <div className="absolute inset-0 bg-white/90 z-30 transition-opacity duration-200 pointer-events-none" />
          )}

          {/* Offscreen Canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* 1. Live Video Stream */}
          {!capturedPhoto && !cameraError && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                filter: activeFilter.cssFilter,
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
              }}
              className="w-full h-full object-cover transition-all duration-200"
            />
          )}

          {/* Loading indicator */}
          {!capturedPhoto && !cameraError && isInitializing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin mb-2" />
              <p className="text-xs text-slate-300 font-medium">Starting camera...</p>
            </div>
          )}

          {/* 2. Captured Photo Preview */}
          {capturedPhoto && (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedPhoto}
                alt="Captured with filter"
                className="w-full h-full object-contain max-h-[420px]"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-white flex items-center gap-1.5 shadow-sm">
                <span>{activeFilter.emoji}</span>
                <span>{activeFilter.name}</span>
              </span>
            </div>
          )}

          {/* 3. Camera Error / Fallback Upload */}
          {cameraError && !capturedPhoto && (
            <div className="p-6 text-center max-w-sm mx-auto flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-white mb-1">Camera Unavailable</p>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">{cameraError}</p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                Upload Photo to Apply Filters
              </button>
            </div>
          )}
        </div>

        {/* Filter Carousel Selector */}
        <div className="px-3 py-2.5 bg-[#090d16] border-t border-slate-800/80">
          <div className="flex items-center justify-between pb-1 px-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3 h-3 text-violet-400" />
              Filters ({CAMERA_FILTERS.length})
            </span>
            <span className="text-[10px] text-violet-400 font-medium">
              {activeFilter.name}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {CAMERA_FILTERS.map((f) => {
              const isSelected = activeFilter.id === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleSelectFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 ring-2 ring-violet-400/50 scale-105'
                      : 'bg-[#131c31] text-slate-300 hover:text-white hover:bg-slate-800/90 border border-slate-800'
                  }`}
                >
                  <span className="text-sm">{f.emoji}</span>
                  <span className="text-[11px]">{f.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="p-3 sm:p-4 bg-[#0c1220] border-t border-slate-800/80 flex flex-col gap-2.5">
          {/* Caption Input in Review mode */}
          {capturedPhoto && (
            <div className="relative flex items-center">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl bg-[#090d16] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-violet-500 transition-all"
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            {!capturedPhoto ? (
              <>
                {/* Fallback upload button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-2xl bg-[#131c31] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all cursor-pointer"
                  title="Upload from gallery"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                {/* Shutter Capture Button */}
                <div className="flex-1 flex justify-center">
                  <button
                    type="button"
                    onClick={handleCapture}
                    disabled={isInitializing || Boolean(cameraError)}
                    className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 p-1 flex items-center justify-center shadow-xl shadow-violet-600/40 hover:scale-105 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
                    title="Take Photo"
                  >
                    <div className="w-full h-full rounded-full border-2 border-white flex items-center justify-center bg-white/20">
                      <div className="w-10 h-10 rounded-full bg-white" />
                    </div>
                  </button>
                </div>

                {/* Filter info placeholder */}
                <div className="w-11" />
              </>
            ) : (
              <>
                {/* Retake button */}
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2.5 rounded-xl bg-[#131c31] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake</span>
                </button>

                {/* Send Photo button */}
                <button
                  type="button"
                  onClick={handleConfirmSend}
                  className="flex-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Photo</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
