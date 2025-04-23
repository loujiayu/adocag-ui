import { makeStyles } from '@fluentui/react-components';
import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components';
import ContentArea from './components/ContentArea';
import ChatBox from './components/ChatBox';

const useStyles = makeStyles({
  app: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    overflow: 'hidden',
    backgroundColor: 'var(--colorNeutralBackground1)',
  },
  sidebar: {
    width: '320px',
    height: '100%',
    borderRight: '1px solid var(--colorNeutralStroke1)',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }
});

function App() {
  const styles = useStyles();
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <FluentProvider theme={isDarkMode ? webDarkTheme : webLightTheme}>
      <div className={styles.app}>
        <div className={styles.sidebar}>
          <ContentArea />
        </div>
        <main className={styles.main}>
          <ChatBox />
        </main>
      </div>
    </FluentProvider>
  );
}

export default App;
