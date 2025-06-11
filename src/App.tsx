import { makeStyles } from '@fluentui/react-components';
import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components';
import ContentArea from './components/ContentArea';
import ChatBox from './components/ChatBox';
import ChatHistory from './components/ChatHistory';
import AzureDevOpsAuthButton from './components/AzureDevOpsAuthButton';
import { useEffect, useState } from 'react';
import { authService } from './services/authService';
import { getApiUrl } from './config';
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
  const [hasSharedSession, setHasSharedSession] = useState<boolean>(false);
  const azureDevOpsToken = authService.getAzureDevOpsToken();

  useEffect(() => {
    // Check login status when component mounts
    const loginStatus = authService.isLoggedInToAzureDevOps();
    setIsLoggedIn(loginStatus);
  }, []);

  // Check for shared chat session in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedKey = urlParams.get('sharedkey');
    
    if (sharedKey) {
      // Fetch the shared session data
      const fetchSharedSession = async () => {
        try {
          const url = new URL(getApiUrl('share'));
          url.searchParams.append('key', sharedKey);
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(azureDevOpsToken && { 'Authorization': `Bearer ${azureDevOpsToken}` }),
            },
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch shared session');
          }
          
          const result = await response.json();
          
          if (result.status === 'success' && result.chatSession) {
            // Load the shared session data into the chat box
            const session = JSON.parse(result.chatSession);
            
            // Set flag to indicate we have a shared session to display
            setHasSharedSession(true);
            
            if ((window as any).chatBoxMethods?.loadSession) {
              (window as any).chatBoxMethods.loadSession({
                messages: session.messages,
                assistantRole: session.assistantRole,
                sources: session.sources
              });
              
              // Store the session in local history and update the current session ID
              const sessionId = session.id || undefined;
              if (sessionId) {
                setCurrentSessionId(sessionId);
              }
            }
          }
        } catch (error) {
          console.error('Error loading shared session:', error);
        }
      };
      
      fetchSharedSession();
    }
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
    // No need to dispatch event - Zustand store is automatically updated by chatHistoryService
  };

  const handleSessionChanged = (sessionId: string | undefined) => {
    setCurrentSessionId(sessionId);
  };

  return (
    <FluentProvider theme={isDarkMode ? webDarkTheme : webLightTheme}>
      <div className={styles.app}>
        {isLoggedIn || hasSharedSession ? (
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
            {isLoggedIn && (
              <div className={styles.chatHistory}>
                <ChatHistory
                  currentSessionId={currentSessionId}
                  onLoadSession={handleLoadSession}
                  onNewChat={handleNewChat}
                  onSessionChanged={handleSessionChanged}
                />
              </div>
            )}
          </>
        ) : (
          <div className={styles.loginContainer}>
            <div className={styles.loginMessage}>
              Sign in to use the AI Assistant or view a shared conversation
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
