import { Button } from '@mui/material';

import { useCameraConfig } from 'contexts/configContext';
import { useRecording } from 'contexts/recording';

import styles from './SideBar.module.css';

const SideBar = () => {
  const { cameraPosition, setCameraPosition } = useCameraConfig();
  const { cameraWindowSize, setCameraWindowSize } = useCameraConfig();
  const { cameraWindowBorderRadius, setCameraWindowBorderRadius } =
    useCameraConfig();
  const { cameraWindowAspect, setCameraWindowAspect } = useCameraConfig();
  const { format, setFormat } = useRecording();

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <a
          href="/"
          className={styles.sidebarSection}
          style={{ paddingBottom: 0, display: 'flex', alignItems: 'center' }}
        >
          <img
            src={'./logo.svg'}
            alt="logo"
            style={{ width: 26, height: 26, marginRight: 4 }}
          />
          <h1>Capto</h1>
        </a>
        <div className={styles.sidebarSection}>
          <h2>Camera position</h2>
          <div
            className={styles.cameraPositionList}
            style={{ justifyContent: 'space-evenly', gap: 8 }}
          >
            <Button
              style={{ flex: '1 1 45%' }}
              className={
                cameraPosition === 'top-left'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setCameraPosition('top-left')}
            >
              Top-left
            </Button>
            <Button
              style={{ flex: '1 1 45%' }}
              className={
                cameraPosition === 'top-right'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setCameraPosition('top-right')}
            >
              Top-right
            </Button>
            <Button
              style={{ flex: '1 1 45%' }}
              className={
                cameraPosition === 'bottom-left'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setCameraPosition('bottom-left')}
            >
              Bottom-left
            </Button>
            <Button
              style={{ flex: '1 1 45%' }}
              className={
                cameraPosition === 'bottom-right'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setCameraPosition('bottom-right')}
            >
              Bottom-right
            </Button>
          </div>
        </div>

        <div className={styles.sidebarSection}>
          <h2>Camera window aspect ratio</h2>
          <div className={styles.cameraPositionList}>
            <Button
              className={
                cameraWindowAspect === '1:1'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setCameraWindowAspect('1:1')}
            >
              1:1
            </Button>
            <Button
              className={
                cameraWindowAspect === '4:3'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setCameraWindowAspect('4:3')}
            >
              4:3
            </Button>
            <Button
              className={
                cameraWindowAspect === '3:2'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setCameraWindowAspect('3:2')}
            >
              3:2
            </Button>
            <Button
              className={
                cameraWindowAspect === '3:4'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setCameraWindowAspect('3:4')}
            >
              3:4
            </Button>
          </div>
        </div>

        <div className={styles.sidebarSection}>
          <h2>Camera window border radius</h2>
          <div className={styles.cameraPositionList}>
            <Button
              className={
                cameraWindowBorderRadius === 'S'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setCameraWindowBorderRadius('S')}
            >
              S
            </Button>
            <Button
              className={
                cameraWindowBorderRadius === 'M'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setCameraWindowBorderRadius('M')}
            >
              M
            </Button>
            <Button
              className={
                cameraWindowBorderRadius === 'L'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setCameraWindowBorderRadius('L')}
            >
              L
            </Button>
            <Button
              className={
                cameraWindowBorderRadius === 'XL'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setCameraWindowBorderRadius('XL')}
            >
              XL
            </Button>
          </div>
        </div>

        <div className={styles.sidebarSection}>
          <h2>Camera window size</h2>
          <div className={styles.cameraPositionList}>
            <Button
              className={
                cameraWindowSize === 'S'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setCameraWindowSize('S')}
            >
              S
            </Button>
            <Button
              className={
                cameraWindowSize === 'M'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setCameraWindowSize('M')}
            >
              M
            </Button>
            <Button
              className={
                cameraWindowSize === 'L'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setCameraWindowSize('L')}
            >
              L
            </Button>
            <Button
              className={
                cameraWindowSize === 'XL'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setCameraWindowSize('XL')}
            >
              XL
            </Button>
          </div>
        </div>

        <div className={styles.sidebarSection}>
          <h2>Video format</h2>
          <div
            className={styles.cameraPositionList}
            style={{ justifyContent: 'space-evenly', gap: 2 }}
          >
            <Button
              style={{ flex: '1' }}
              className={
                format === 'mkv'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setFormat('mkv')}
            >
              mkv
            </Button>
            <Button
              style={{ flex: '1' }}
              className={
                format === 'mp4'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setFormat('mp4')}
            >
              mp4
            </Button>
            <Button
              style={{ flex: '1' }}
              className={
                format === 'webm'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setFormat('webm')}
            >
              webm
            </Button>
            <Button
              style={{ flex: '1' }}
              className={
                format === 'mov'
                  ? styles.cameraPositionButtonActive
                  : styles.cameraPositionButton
              }
              onClick={() => setFormat('mov')}
            >
              mov
            </Button>
          </div>
        </div>
        <div className={styles.sidebarSection}>
          <p style={{ color: 'grey', fontSize: 12 }}>
            *Changes made here will be applied to next recording
          </p>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
