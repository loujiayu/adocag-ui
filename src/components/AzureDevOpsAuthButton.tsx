import React from 'react';
import { Button, makeStyles, Tooltip } from '@fluentui/react-components';
import { SignOut24Regular, LockClosed24Regular } from '@fluentui/react-icons';
import { authService } from '../services/authService';

const useStyles = makeStyles({
  authButton: {
    marginLeft: 'auto',
    marginRight: '16px',
  },
});

interface AzureDevOpsAuthButtonProps {
  onLogin?: () => void;
  onLogout?: () => void;
}

const AzureDevOpsAuthButton: React.FC<AzureDevOpsAuthButtonProps> = ({ onLogin, onLogout }) => {
  const styles = useStyles();
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = React.useState<boolean>(false);
  
  React.useEffect(() => {
    // Check if user is logged in when component mounts
    const loginStatus = authService.isLoggedInToAzureDevOps();
    setIsLoggedIn(loginStatus);
    
    // If user is not logged in, automatically initiate login
    if (!loginStatus) {
      const initiateAuth = async () => {
        try {
          setIsAuthenticating(true);
          await authService.initiateAzureDevOpsLogin();
          setIsLoggedIn(true);
          if (onLogin) {
            onLogin();
          }
        } catch (error) {
          console.error("Failed to automatically log in:", error);
        } finally {
          setIsAuthenticating(false);
        }
      };
      
      initiateAuth();
    }
    
    // Handle authentication callback if state exists in URL
    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get('state');
    
    if (state) {
      handleAuthCallback(state);
    }
  }, [onLogin]);
  
  const handleAuthCallback = async (state: string) => {
    const success = await authService.handleAzureDevOpsCallback(state);
    if (success) {
      setIsLoggedIn(true);
      // Remove code and state from URL without refreshing the page
      window.history.replaceState({}, document.title, window.location.pathname);
      // Call the onLogin callback if provided
      if (onLogin) {
        onLogin();
      }
    }
  };
  
  const handleLogin = async () => {
    setIsAuthenticating(true);
    try {
      await authService.initiateAzureDevOpsLogin();
      setIsLoggedIn(true);
      // Call the onLogin callback if provided
      if (onLogin) {
        onLogin();
      }
    } catch (error) {
      console.error("Failed to log in to Azure DevOps:", error);
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    // Call the onLogout callback if provided
    if (onLogout) {
      onLogout();
    }
  };
  
  return (
    <Tooltip content={isLoggedIn ? "Sign out" : "Sign in"} relationship="label">
      <Button 
        className={styles.authButton}
        appearance={isLoggedIn ? "subtle" : "primary"}
        icon={isLoggedIn ? <SignOut24Regular /> : <LockClosed24Regular />}
        onClick={isLoggedIn ? handleLogout : handleLogin}
        disabled={isAuthenticating}
        aria-label={isLoggedIn ? "Sign out" : "Sign in"}
      >
        {isAuthenticating ? "Authenticating..." : (isLoggedIn ? "Sign Out" : "Azure DevOps")}
      </Button>
    </Tooltip>
  );
};

export default AzureDevOpsAuthButton;
