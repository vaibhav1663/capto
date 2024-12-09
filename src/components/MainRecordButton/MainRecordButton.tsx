import cx from 'classnames';

import RecordButton from 'components/RecordButton';
import { useCountdown } from 'contexts/countdown';
import { useLayout } from 'contexts/layout';
import { usePictureInPicture } from 'contexts/pictureInPicture';
import { useRecording } from 'contexts/recording';
import { useScreenshare } from 'contexts/screenshare';
import { useStreams } from 'contexts/streams';

import styles from './MainRecordButton.module.css';

const MainRecordButton = () => {
  const { countingDown, setCountingDown } = useCountdown();
  const { screenshareStream } = useStreams();
  const { layout } = useLayout();
  const { isRecording, stopRecording, startRecording } = useRecording();
  const { pipWindow, requestPipWindow } = usePictureInPicture();
  const { startScreenshare } = useScreenshare();

  return (
    <RecordButton
      className={cx(styles.root, { [styles.recording]: isRecording })}
      classes={{ icon: styles.icon }}
      onClick={async () => {
        if (countingDown) {
          return;
        }
        if (
          screenshareStream?.getVideoTracks()[0].getSettings()
            .displaySurface === 'monitor'
        ) {
          if (isRecording) {
            stopRecording();
          } else {
            startRecording('screenOnly', 'screenOnly', 'L', 'mp4');
          }
        } else if (!pipWindow && screenshareStream) {
          await requestPipWindow();
        } else if (isRecording) {
          pipWindow?.close();
        } else if (pipWindow) {
          setCountingDown(true);
        } else if (layout === 'cameraOnly') {
          await requestPipWindow();
        } else {
          await startScreenshare();
        }
      }}
    />
  );
};

export default MainRecordButton;
