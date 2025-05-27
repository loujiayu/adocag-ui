import { makeStyles } from '@fluentui/react-components';
import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components';
import ContentArea from './components/ContentArea';
import ChatBox from './components/ChatBox';
import ChatHistory from './components/ChatHistory';
import AzureDevOpsAuthButton from './components/AzureDevOpsAuthButton';
import { useEffect, useState } from 'react';
import { authService } from './services/authService';
import { ChatMessage } from './services/chatHistoryService';

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
    flexShrink: 0,
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0, // Allow shrinking
  },
  chatHistory: {
    width: '320px',
    height: '100%',
    flexShrink: 0,
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
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Check login status when component mounts
    const loginStatus = authService.isLoggedInToAzureDevOps();
    setIsLoggedIn(loginStatus);
  }, []);

  const handleLoadSession = (messages: ChatMessage[]) => {
    // Load messages into ChatBox
    if ((window as any).chatBoxMethods) {
      (window as any).chatBoxMethods.loadMessages(messages);
    }
  };

  const handleNewChat = () => {
    // Clear current chat
    if ((window as any).chatBoxMethods) {
      (window as any).chatBoxMethods.clearChat();
    }
    setCurrentSessionId(undefined);
  };

  const handleSessionSaved = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    // Force refresh of sessions list
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chatSessionUpdated'));
    }
  };

  const handleSessionChanged = (sessionId: string | undefined) => {
    setCurrentSessionId(sessionId);
  };

  return (
    <FluentProvider theme={isDarkMode ? webDarkTheme : webLightTheme}>
      <div className={styles.app}>
        {isLoggedIn ? (
          <>
            <div className={styles.sidebar}>
              <ContentArea />
            </div>
            <main className={styles.main}>
              <ChatBox 
                onLogin={() => setIsLoggedIn(true)}
                onLogout={() => setIsLoggedIn(false)}
                currentSessionId={currentSessionId}
                onSessionSaved={handleSessionSaved}
              />
            </main>
            <div className={styles.chatHistory}>
              <ChatHistory
                currentSessionId={currentSessionId}
                onLoadSession={handleLoadSession}
                onNewChat={handleNewChat}
                onSessionChanged={handleSessionChanged}
              />
            </div>
          </>
        ) : (
          <div className={styles.loginContainer}>
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
