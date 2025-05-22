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

const AzureDevOpsAuthButton: React.FC = () => {
  const styles = useStyles();
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = React.useState<boolean>(false);
  
  React.useEffect(() => {
    // Check if user is logged in when component mounts
    const loginStatus = authService.isLoggedInToAzureDevOps();
    setIsLoggedIn(loginStatus);
    
    // Handle authentication callback if code exists in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      handleAuthCallback(code, state);
    }
  }, []);
  
  const handleAuthCallback = async (code: string, state: string) => {
    const success = await authService.handleAzureDevOpsCallback(code, state);
    if (success) {
      setIsLoggedIn(true);
      // Remove code and state from URL without refreshing the page
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };
  
  const handleLogin = async () => {
    setIsAuthenticating(true);
    try {
      await authService.initiateAzureDevOpsLogin();
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Failed to log in to Azure DevOps:", error);
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
  };
  
  return (
    <Tooltip content={isLoggedIn ? "Sign out of Azure DevOps" : "Sign in with Azure DevOps using Microsoft Entra ID"} relationship="label">
      <Button 
        className={styles.authButton}
        appearance={isLoggedIn ? "subtle" : "primary"}
        icon={isLoggedIn ? <SignOut24Regular /> : <LockClosed24Regular />}
        onClick={isLoggedIn ? handleLogout : handleLogin}
        disabled={isAuthenticating}
        aria-label={isLoggedIn ? "Sign out of Azure DevOps" : "Sign in with Azure DevOps"}
      >
        {isAuthenticating ? "Authenticating..." : (isLoggedIn ? "Sign Out" : "Azure DevOps")}
      </Button>
    </Tooltip>
  );
};

export default AzureDevOpsAuthButton;
