import cx from 'classnames';

import Footer from 'components/Footer';
import LayoutSwitcher from 'components/LayoutSwitcher';
import PiPWindow from 'components/PiPWindow';
import VideoStreams from 'components/VideoStreams';
import { useLayout } from 'contexts/layout';
import { useMediaDevices } from 'contexts/mediaDevices';
import { usePictureInPicture } from 'contexts/pictureInPicture';
import { useStreams } from 'contexts/streams';
import useKeyboardShorcut from 'hooks/useKeyboardShortcut';
import SideBar from 'components/SideBar';

import styles from './App.module.css';

const App = () => {
  const { layout } = useLayout();
  const { cameraStream, screenshareStream } = useStreams();
  const { pipWindow } = usePictureInPicture();
  const {
    cameraEnabled,
    microphoneEnabled,
    setCameraEnabled,
    setMicrophoneEnabled,
  } = useMediaDevices();

  useKeyboardShorcut('e', () => setCameraEnabled(!cameraEnabled));
  useKeyboardShorcut('d', () => setMicrophoneEnabled(!microphoneEnabled));

  return (
    <div className={styles.mainContainer} style={{ display: 'flex' }}>
      <SideBar />
      <div
        className={cx(styles.root, {
          [styles.placeholder]:
            layout === 'cameraOnly' ? !cameraStream : !screenshareStream,
        })}
      >
        <main
          className={styles.main}
          style={{ width: '-webkit-fill-available' }}
        >
          <VideoStreams />
          <LayoutSwitcher />
        </main>
        <Footer />
        {pipWindow && <PiPWindow pipWindow={pipWindow} />}
      </div>
    </div>
  );
};

export default App;
