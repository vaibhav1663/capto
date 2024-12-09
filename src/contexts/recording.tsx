import { createContext, useContext, useRef, useState, useEffect } from 'react';

import { composeStreams } from 'services/composer';

import { useLayout } from './layout';
import { useStreams } from './streams';

type VideoFormat = 'webm' | 'mp4' | 'mkv' | 'mov';

type RecordingContextType = {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  startRecording: (
    cameraPosition: string,
    cameraWindowSize: string,
    cameraWindowBorderRadius: string,
    cameraAspect: string,
  ) => void;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  format: VideoFormat;
  setFormat: (format: VideoFormat) => void;
};

const RecordingContext = createContext<RecordingContextType | undefined>(
  undefined,
);

type RecordingProviderProps = {
  children: React.ReactNode;
};

export const RecordingProvider = ({ children }: RecordingProviderProps) => {
  const { layout } = useLayout();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const { cameraStream, microphoneStream, screenshareStream } = useStreams();
  const [format, setFormat] = useState<VideoFormat>('mp4');

  const mediaRecorder = useRef<MediaRecorder>();
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (!isPaused) {
        const elapsedTime = Math.floor(
          (Date.now() - startTimeRef.current) / 1000,
        );
        setDuration(accumulatedTimeRef.current + elapsedTime);
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const getMediaRecorderOptions = (
    format: VideoFormat,
  ): MediaRecorderOptions => {
    switch (format) {
      case 'webm':
        return {
          mimeType: 'video/webm; codecs=vp9',
          videoBitsPerSecond: 8e6,
        };
      case 'mp4':
        return {
          mimeType: 'video/mp4',
          videoBitsPerSecond: 8e6,
        };
      case 'mkv':
        return {
          mimeType: 'video/x-matroska',
          videoBitsPerSecond: 8e6,
        };
      case 'mov':
        return {
          mimeType: 'video/quicktime',
          videoBitsPerSecond: 8e6,
        };
      default:
        return {
          mimeType: 'video/mp4',
          videoBitsPerSecond: 8e6,
        };
    }
  };

  const getFileExtension = (format: VideoFormat): string => {
    return format;
  };

  const startRecording = (
    cameraPosition: string,
    cameraWindowSize: string,
    cameraWindowBorderRadius: string,
    cameraAspect: string,
  ) => {
    setIsRecording(true);
    setIsPaused(false);
    chunks.current = [];
    accumulatedTimeRef.current = 0;
    setDuration(0);

    const composedStream = composeStreams(
      layout === 'screenOnly' ? null : cameraStream,
      microphoneStream,
      layout === 'cameraOnly' ? null : screenshareStream,
      cameraPosition,
      cameraWindowSize,
      cameraWindowBorderRadius,
      cameraAspect,
    );

    const options = getMediaRecorderOptions(format);
    mediaRecorder.current = new MediaRecorder(composedStream, options);

    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.current.push(event.data);
    };

    mediaRecorder.current.onstop = () => {
      composedStream
        .getVideoTracks()
        .forEach((composedTrack) => composedTrack.stop());

      const blob = new Blob(chunks.current, { type: options.mimeType });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Include duration in filename
      const formattedDuration = formatDuration(duration);
      link.download = `recording_${formattedDuration}.${getFileExtension(
        format,
      )}`;

      link.click();

      window.URL.revokeObjectURL(url);

      // Reset state
      stopTimer();
      setIsRecording(false);
      setIsPaused(false);
      setDuration(0);
    };

    mediaRecorder.current.start();
    startTimer();
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    accumulatedTimeRef.current += Math.floor(
      (Date.now() - startTimeRef.current) / 1000,
    );
    stopTimer();
  };

  const pauseRecording = () => {
    mediaRecorder.current?.pause();
    setIsPaused(true);

    // Accumulate time when pausing
    accumulatedTimeRef.current += Math.floor(
      (Date.now() - startTimeRef.current) / 1000,
    );
  };

  const resumeRecording = () => {
    setIsPaused(false);
    mediaRecorder.current?.resume();

    // Reset start time when resuming
    startTimeRef.current = Date.now();
  };

  // Helper function to format duration
  const formatDuration = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    return `${pad(hours)}h_${pad(minutes)}m_${pad(seconds)}s`;
  };

  return (
    <RecordingContext.Provider
      value={{
        isRecording,
        isPaused,
        duration,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        format,
        setFormat,
      }}
    >
      {children}
    </RecordingContext.Provider>
  );
};

export const useRecording = (): RecordingContextType => {
  const context = useContext(RecordingContext);

  if (context === undefined) {
    throw new Error('useRecording must be used within a RecordingProvider');
  }

  return context;
};
