export const CAMERA_WIDTH = 400;
export const CAMERA_HEIGHT = 400;
export const CAMERA_BORDER_RADIUS = 60;
export const CAMERA_MARGIN_RIGHT = 40;
export const CAMERA_MARGIN_BOTTOM = 40;
export const SCALE = 1;

interface CameraStyle {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: number;
}

export const generateCameraStyle = (
  cameraPosition: string | 'bottom-right',
  cameraWindowSize: string | 'M', // 'S', 'M', 'L', 'XL'
  cameraWindowBorderRadius: string | 'L',
  cameraAspect: string, // Format: 'width:height' (e.g., '16:9')
  screenWidth: number,
  screenHeight: number,
): CameraStyle => {
  // Border radius mapping
  const borderRadiusMapping: Record<string, number> = {
    S: 10,
    M: 20,
    L: 30,
    XL: 50,
  };

  const sizeMapping: Record<string, number> = {
    S: 0.1, // 10% of screen width
    M: 0.15, // 15% of screen width
    L: 0.2, // 20% of screen width
    XL: 0.25, // 25% of screen width
  };

  const borderRadius = borderRadiusMapping[cameraWindowBorderRadius] || 30;
  const sizeRatio = sizeMapping[cameraWindowSize] || 0.15;

  // Parse aspect ratio
  const [cameraWidthRatio, cameraHeightRatio] = cameraAspect
    .split(':')
    .map(Number);
  const cameraAspectRatio = cameraWidthRatio / cameraHeightRatio;

  // Calculate camera dimensions based on size and aspect ratio
  const width = screenWidth * sizeRatio;
  const height = width / cameraAspectRatio;

  let top = 0;
  let left = 0;

  // Position the camera based on the specified location
  switch (cameraPosition) {
    case 'top-left':
      top = 10;
      left = 10;
      break;
    case 'top-right':
      top = 10;
      left = screenWidth - width - 10;
      break;
    case 'bottom-left':
      top = screenHeight - height - 10;
      left = 10;
      break;
    case 'bottom-right':
    default:
      top = screenHeight - height - 10;
      left = screenWidth - width - 10;
      break;
  }

  return {
    top,
    left,
    width,
    height,
    borderRadius,
  };
};

export const composeStreams = (
  cameraStream: MediaStream | null,
  microphoneStream: MediaStream | null,
  screenshareStream: MediaStream | null,
  cameraPosition: string | 'bottom-right',
  cameraWindowSize: string | 'M', // Camera size ('S', 'M', 'L', 'XL')
  cameraWindowBorderRadius: string | 'L', // Border radius
  cameraAspect: string | '16:9', // Camera aspect ratio
): MediaStream => {
  const cameraTrack = cameraStream?.getVideoTracks()[0];
  const microphoneTrack = microphoneStream?.getAudioTracks()[0];
  const screenshareTrack = screenshareStream?.getVideoTracks()[0];

  const screenshareProcessor =
    screenshareTrack &&
    new MediaStreamTrackProcessor({
      track: screenshareTrack,
    });

  const cameraProcessor =
    cameraTrack &&
    new MediaStreamTrackProcessor({
      track: cameraTrack,
    });

  const recordingGenerator = new MediaStreamTrackGenerator({ kind: 'video' });

  if (screenshareProcessor && cameraProcessor) {
    const screenshareReader = screenshareProcessor.readable.getReader();

    const canvas = new OffscreenCanvas(0, 0);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas API not supported');
    }

    let latestScreenshareFrame: VideoFrame | undefined;
    let readingScreenshare = false;

    const transformer = new TransformStream({
      async transform(cameraFrame: VideoFrame, controller) {
        if (recordingGenerator.readyState === 'ended') {
          cameraFrame.close();
          latestScreenshareFrame?.close();
          controller.terminate();
          return;
        }

        if (latestScreenshareFrame) {
          if (!readingScreenshare) {
            readingScreenshare = true;
            screenshareReader.read().then(({ value: screenshareFrame }) => {
              readingScreenshare = false;
              latestScreenshareFrame?.close();
              if (recordingGenerator.readyState === 'ended') {
                screenshareFrame?.close();
              } else {
                latestScreenshareFrame = screenshareFrame;
              }
            });
          }
        } else {
          const { value: screenshareFrame } = await screenshareReader.read();
          latestScreenshareFrame = screenshareFrame;
        }

        if (latestScreenshareFrame) {
          canvas.width = latestScreenshareFrame.displayWidth;
          canvas.height = latestScreenshareFrame.displayHeight;
          ctx.drawImage(
            latestScreenshareFrame,
            0,
            0,
            canvas.width,
            canvas.height,
          );
        }

        const cameraStyles = generateCameraStyle(
          cameraPosition,
          cameraWindowSize,
          cameraWindowBorderRadius,
          cameraAspect,
          latestScreenshareFrame?.displayWidth ?? 1920,
          latestScreenshareFrame?.displayHeight ?? 1080,
        );

        const { top, left, width, height, borderRadius } = cameraStyles;

        // Draw camera feed
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(left, top, width, height, borderRadius);
        ctx.clip();

        const aspectRatio =
          cameraFrame.displayWidth / cameraFrame.displayHeight;

        let destWidth, destHeight;
        if (width / height > aspectRatio) {
          destWidth = width;
          destHeight = destWidth / aspectRatio;
        } else {
          destHeight = height;
          destWidth = destHeight * aspectRatio;
        }

        const destX = left + (width - destWidth) / 2;
        const destY = top + (height - destHeight) / 2;

        ctx.drawImage(
          cameraFrame,
          0,
          0,
          cameraFrame.displayWidth,
          cameraFrame.displayHeight,
          destX,
          destY,
          destWidth,
          destHeight,
        );

        ctx.restore();

        const newFrame = new VideoFrame(canvas, {
          timestamp: cameraFrame.timestamp,
        });
        cameraFrame.close();
        controller.enqueue(newFrame);
      },
    });

    cameraProcessor.readable
      .pipeThrough(transformer)
      .pipeTo(recordingGenerator.writable);
  } else if (cameraProcessor) {
    cameraProcessor.readable.pipeTo(recordingGenerator.writable);
  } else if (screenshareProcessor) {
    screenshareProcessor.readable.pipeTo(recordingGenerator.writable);
  }

  const recordingStream = new MediaStream([recordingGenerator]);
  if (microphoneTrack) {
    recordingStream.addTrack(microphoneTrack);
  }

  return recordingStream;
};
