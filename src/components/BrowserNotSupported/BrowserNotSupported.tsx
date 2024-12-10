import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import chromeIcon from 'assets/chrome.svg';

import styles from './BrowserNotSupported.module.css';

const BrowserNotSupported = () => {
  return (
    <div className={styles.root}>
      <img src='./images/not-supported.jpg' alt='not supported' style={{ width: '100%' , maxWidth: 400 , margin: '0 auto' , borderRadius: 8 }} />
      <Typography variant="h6">This browser/device is not yet supported</Typography>
      <Typography variant="subtitle1">
        You can use the recorder with the following browser(s) preferably on a
        desktop device
      </Typography>
      <Link
        className={styles.chromeLink}
        href="https://www.google.com/chrome/"
        target="_blank"
        color="secondary"
        underline="none"
      >
        <img className={styles.chromeIcon} src={chromeIcon} />
        Google Chrome
      </Link>
    </div>
  );
};

export default BrowserNotSupported;
