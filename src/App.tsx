import { makeStyles } from '@fluentui/react-components';
import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components';
import ContentArea from './components/ContentArea';
import ChatBox from './components/ChatBox';
import AzureDevOpsAuthButton from './components/AzureDevOpsAuthButton';
import { useEffect, useState } from 'react';
import { authService } from './services/authService';

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
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    borderBottom: '1px solid var(--colorNeutralStroke1)',
    backgroundColor: 'var(--colorNeutralBackground2)',
  },
  loginContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    padding: '20px',
  },
  loginMessage: {
    fontSize: '16px',
    marginBottom: '20px',
    textAlign: 'center',
  }
});

function App() {
  const styles = useStyles();
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Check login status when component mounts
    const loginStatus = authService.isLoggedInToAzureDevOps();
    setIsLoggedIn(loginStatus);
  }, []);

  return (
    <FluentProvider theme={isDarkMode ? webDarkTheme : webLightTheme}>
      <div className={styles.app}>
        {isLoggedIn ? (
          <>
            <div className={styles.sidebar}>
              <ContentArea 
                onLogin={() => setIsLoggedIn(true)}
                onLogout={() => setIsLoggedIn(false)}
              />
            </div>
            <main className={styles.main}>
              <ChatBox />
            </main>
          </>
        ) : (
          <div className={styles.loginContainer}>
            <div className={styles.loginMessage}>
              Close the tab
            </div>
            <AzureDevOpsAuthButton 
              onLogin={() => setIsLoggedIn(true)}
              onLogout={() => setIsLoggedIn(false)}
            />
          </div>
        )}
      </div>
    </FluentProvider>
  );
}

export default App;
