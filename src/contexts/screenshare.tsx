import { createContext, useContext, useRef } from 'react';

import { useLayout } from './layout';
import { usePictureInPicture } from './pictureInPicture';
import { useRecording } from './recording';
import { useStreams } from './streams';

type ScreenshareContextType = {
  startScreenshare: () => Promise<void>;
};

const ScreenshareContext = createContext<ScreenshareContextType | undefined>(
  undefined,
);

type ScreenshareProviderProps = {
  children: React.ReactNode;
};

export const ScreenshareProvider = ({ children }: ScreenshareProviderProps) => {
  const { screenshareStream, setScreenshareStream } = useStreams();

  const { layout } = useLayout();
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const { isRecording } = useRecording();
  const isRecordingRef = useRef(isRecording);
  isRecordingRef.current = isRecording;

  const { pipWindow, requestPipWindow } = usePictureInPicture();
  const pipWindowRef = useRef(pipWindow);
  pipWindowRef.current = pipWindow;

  const startScreenshare = async () => {
    // If screen share stream already exists, do nothing
    if (screenshareStream) return;

    try {
      // Request the user's screen for sharing
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      console.log('stream', stream);
      if (stream.getVideoTracks().length > 0) {
        // Handle track end (when the user stops sharing)
        stream.getVideoTracks()[0].onended = () => {
          // Close screenshare stream
          setScreenshareStream(null);
          console.log('stream ended');
          console.log('pipWindowRef.current', pipWindowRef.current);
          if (pipWindowRef.current) {
            pipWindowRef.current.close();
          }
        };

        // Set the screen share stream
        setScreenshareStream(stream);

        // Open PiP window only after successful screen sharing
        if (
          stream.getVideoTracks()[0].getSettings().displaySurface !== 'monitor'
        ) {
          await requestPipWindow();
        }
      }
    } catch (error) {
      // Handle user aborting screen sharing
      if (isRecordingRef.current && layoutRef.current !== 'cameraOnly') {
        // Ensure PiP window is closed if screen sharing fails
        pipWindowRef.current?.close();
      }
    }
  };

  return (
    <ScreenshareContext.Provider value={{ startScreenshare }}>
      {children}
    </ScreenshareContext.Provider>
  );
};

export const useScreenshare = (): ScreenshareContextType => {
  const context = useContext(ScreenshareContext);

  if (context === undefined) {
    throw new Error('useScreenshare must be used within a ScreenshareProvider');
  }

  return context;
};
