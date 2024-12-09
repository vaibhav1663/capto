import cx from 'classnames';
import { useState } from 'react';

import Placeholder from 'components/Placeholder';
import { useLayout } from 'contexts/layout';
import { useStreams } from 'contexts/streams';
import useVideoSource from 'hooks/useVideoSource';
import {
  CAMERA_HEIGHT,
  CAMERA_MARGIN_BOTTOM,
  CAMERA_MARGIN_RIGHT,
  CAMERA_WIDTH,
} from 'services/composer';
import { percentage } from 'services/format/number';
import { useCameraConfig } from 'contexts/configContext';

import styles from './VideoStreams.module.css';

type ScreenshareSize = {
  width: number;
  height: number;
};

const generateCameraStyle = (
  cameraPosition: string,
  cameraWindowAspect: string,
  cameraWindowBorderRadius: string,
  cameraWindowSize: string,
  screenshareWidth: number,
  screenshareHeight: number,
) => {
  let cameraStyle: React.CSSProperties = {
    top: 0,
    left: 0,
    width: percentage(CAMERA_WIDTH / screenshareWidth),
    height: percentage(CAMERA_HEIGHT / screenshareHeight),
    borderRadius: 20,
    boxShadow: '0px 0px 50px 0px rgba(0,0,0,0.6)',
  };

  const marginRight = percentage(CAMERA_MARGIN_RIGHT / screenshareWidth);
  const marginBottom = percentage(CAMERA_MARGIN_BOTTOM / screenshareHeight);

  const scale =
    cameraWindowSize === 'S'
      ? 0.7
      : cameraWindowSize === 'M'
      ? 0.9
      : cameraWindowSize === 'L'
      ? 1
      : cameraWindowSize === 'XL'
      ? 1.5
      : 1;

  let width = CAMERA_WIDTH;
  let height = CAMERA_HEIGHT;
  if (cameraWindowAspect === '1:1') {
    width = CAMERA_WIDTH;
    height = CAMERA_HEIGHT;
  } else if (cameraWindowAspect === '4:3') {
    width = CAMERA_WIDTH * (4 / 3);
    height = CAMERA_HEIGHT;
  } else if (cameraWindowAspect === '3:2') {
    width = CAMERA_WIDTH * (3 / 2);
    height = CAMERA_HEIGHT;
  } else if (cameraWindowAspect === '3:4') {
    width = CAMERA_WIDTH;
    height = CAMERA_HEIGHT * (4 / 3);
  }

  width = width * scale;
  height = height * scale;

  if (cameraPosition === 'top-left') {
    cameraStyle = {
      ...cameraStyle,
      left: marginRight,
      top: marginBottom,
    };
  } else if (cameraPosition === 'top-right') {
    cameraStyle = {
      ...cameraStyle,
      left: percentage(
        (screenshareWidth - width - CAMERA_MARGIN_RIGHT) / screenshareWidth,
      ),
      top: marginBottom,
    };
  } else if (cameraPosition === 'bottom-left') {
    cameraStyle = {
      ...cameraStyle,
      left: marginRight,
      top: percentage(
        (screenshareHeight - height - CAMERA_MARGIN_BOTTOM) / screenshareHeight,
      ),
    };
  } else if (cameraPosition === 'bottom-right') {
    cameraStyle = {
      ...cameraStyle,
      left: percentage(
        (screenshareWidth - width - CAMERA_MARGIN_RIGHT) / screenshareWidth,
      ),
      top: percentage(
        (screenshareHeight - height - CAMERA_MARGIN_BOTTOM) / screenshareHeight,
      ),
    };
  }
  cameraStyle = {
    ...cameraStyle,
    width: percentage(width / screenshareWidth),
    height: percentage(height / screenshareHeight),
  };

  if (cameraWindowBorderRadius === 'S') {
    cameraStyle = {
      ...cameraStyle,
      borderRadius: 10,
    };
  } else if (cameraWindowBorderRadius === 'M') {
    cameraStyle = {
      ...cameraStyle,
      borderRadius: 15,
    };
  } else if (cameraWindowBorderRadius === 'L') {
    cameraStyle = {
      ...cameraStyle,
      borderRadius: 24,
    };
  } else if (cameraWindowBorderRadius === 'XL') {
    cameraStyle = {
      ...cameraStyle,
      borderRadius: 40,
    };
  }

  return cameraStyle;
};

const VideoStreams = () => {
  const { layout } = useLayout();
  const { cameraStream, screenshareStream } = useStreams();
  const updateCameraSource = useVideoSource(cameraStream);
  const updateScreenshareSource = useVideoSource(screenshareStream);
  const [screenshareSize, setScreenshareSize] =
    useState<ScreenshareSize | null>(null);

  if (!screenshareStream && screenshareSize) {
    setScreenshareSize(null);
  }
  const screenshareWidth = screenshareSize?.width ?? 1920;
  const screenshareHeight = screenshareSize?.height ?? 1080;
  const {
    cameraPosition,
    cameraWindowSize,
    cameraWindowBorderRadius,
    cameraWindowAspect,
  } = useCameraConfig();

  return (
    <>
      {screenshareStream || layout === 'cameraOnly' ? (
        <video
          className={cx(styles.mainStream, {
            [styles.cameraStream]: layout === 'cameraOnly',
          })}
          ref={
            layout === 'cameraOnly'
              ? updateCameraSource
              : updateScreenshareSource
          }
          autoPlay
          playsInline
          muted
          // The 'resize' event exists on HTMLMediaElement and is exactly what we need here:
          // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#events
          //
          // Issue created: https://github.com/jsx-eslint/eslint-plugin-react/issues/3594
          //
          // eslint-disable-next-line react/no-unknown-property
          onResize={(event) => {
            if (layout !== 'cameraOnly') {
              setScreenshareSize({
                width: event.currentTarget.videoWidth,
                height: event.currentTarget.videoHeight,
              });
            }
          }}
        />
      ) : (
        <Placeholder />
      )}

      {/*
        If the screenshare stream is defined but its size hasn't been retrieved yet,
        we don't render the camera stream
      */}
      {layout === 'screenAndCamera' &&
        cameraStream &&
        (!screenshareStream || screenshareSize) && (
          <video
            className={cx(styles.pipStream, styles.cameraStream)}
            ref={updateCameraSource}
            style={generateCameraStyle(
              cameraPosition,
              cameraWindowAspect,
              cameraWindowBorderRadius,
              cameraWindowSize,
              screenshareWidth,
              screenshareHeight,
            )}
            autoPlay
            playsInline
            muted
          />
        )}
    </>
  );
};

export default VideoStreams;
