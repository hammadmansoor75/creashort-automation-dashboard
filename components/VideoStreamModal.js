'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Download, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  AlertCircle,
  Loader,
  RefreshCw
} from 'lucide-react';

export default function VideoStreamModal({ video, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const videoRef = useRef(null);

  useEffect(() => {
    if (video && videoRef.current) {
      // Reset states when video changes
      setIsLoading(true);
      setHasError(false);
      setIsPlaying(false);
      
      // Add event listeners
      const videoElement = videoRef.current;
      
      const handleLoadStart = () => {
        console.log('Video load started:', video.url);
        setIsLoading(true);
        setHasError(false);
      };
      
      const handleLoadedData = () => {
        console.log('Video data loaded');
        setIsLoading(false);
        setDuration(videoElement.duration);
      };
      
      const handleCanPlay = () => {
        console.log('Video can start playing');
        setIsLoading(false);
      };
      
      const handleError = (e) => {
        console.error('Video error:', e, videoElement.error);
        setIsLoading(false);
        setHasError(true);
      };
      
      const handleTimeUpdate = () => {
        setCurrentTime(videoElement.currentTime);
      };
      
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      
      videoElement.addEventListener('loadstart', handleLoadStart);
      videoElement.addEventListener('loadeddata', handleLoadedData);
      videoElement.addEventListener('canplay', handleCanPlay);
      videoElement.addEventListener('error', handleError);
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      videoElement.addEventListener('play', handlePlay);
      videoElement.addEventListener('pause', handlePause);
      
      return () => {
        videoElement.removeEventListener('loadstart', handleLoadStart);
        videoElement.removeEventListener('loadeddata', handleLoadedData);
        videoElement.removeEventListener('canplay', handleCanPlay);
        videoElement.removeEventListener('error', handleError);
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);
      };
    }
  }, [video]);

  if (!video) return null;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleSeek = (e) => {
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    }
  };

  const retryLoad = () => {
    if (videoRef.current) {
      setHasError(false);
      setIsLoading(true);
      videoRef.current.load();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">{video.title}</h3>
              <p className="text-gray-300 text-sm">Generation ID: {video.generationId}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative bg-black">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
              <div className="text-center text-white">
                <Loader className="h-12 w-12 animate-spin mx-auto mb-4" />
                <p className="text-lg">Loading video...</p>
                <p className="text-sm text-gray-300 mt-2">Please wait while the video loads</p>
              </div>
            </div>
          )}

          {/* Error Overlay */}
          {hasError && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center text-white max-w-md">
                <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold mb-2">Video Load Failed</h4>
                <p className="text-gray-300 mb-4">
                  The video couldn&apos;t be loaded. This might be due to format compatibility or network issues.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={retryLoad}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </button>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Direct
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-auto max-h-[60vh] bg-black"
            poster="" // Remove default poster
            preload="metadata"
            crossOrigin="anonymous"
            playsInline
            onContextMenu={(e) => e.preventDefault()}
          >
            <source src={video.url} type="video/mp4" />
            <source src={video.url} type="video/webm" />
            <source src={video.url} type="video/mov" />
            <source src={video.url} type="video/avi" />
            <source src={video.url} />
            <p className="text-white p-8 text-center">
              Your browser doesn&apos;t support video playback. 
              <a href={video.url} className="text-blue-400 underline ml-1">Download the video</a> instead.
            </p>
          </video>

          {/* Custom Controls */}
          {!hasError && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={duration ? (currentTime / duration) * 100 : 0}
                  onChange={handleSeek}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className="hover:bg-white/20 rounded-full p-2 transition-colors"
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleMute}
                      className="hover:bg-white/20 rounded-full p-2 transition-colors"
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <button
                  onClick={handleFullscreen}
                  className="hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <Maximize className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>Video URL: <code className="bg-gray-200 px-2 py-1 rounded text-xs">{video.url}</code></p>
            </div>
            <div className="flex space-x-3">
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </a>
              <a
                href={video.url}
                download
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}