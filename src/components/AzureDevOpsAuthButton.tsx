import React from 'react';
import { Button, Tooltip } from '@fluentui/react-components';
import { SignOut24Regular, LockClosed24Regular } from '@fluentui/react-icons';
import { authService } from '../services/authService';

interface AzureDevOpsAuthButtonProps {
  onLogin?: () => void;
  onLogout?: () => void;
}

const AzureDevOpsAuthButton: React.FC<AzureDevOpsAuthButtonProps> = ({ onLogin, onLogout }) => {
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = React.useState<boolean>(false);
  
  React.useEffect(() => {
    // Check if user is logged in when component mounts
    const loginStatus = authService.isLoggedInToAzureDevOps();
    setIsLoggedIn(loginStatus);
    
    // With redirect flow, we don't automatically initiate login here
    // as it would cause an infinite loop of redirects.
    // Instead, we let the user click the login button
    
    // The redirect response is handled by authService.handleRedirectResponse(),
    // which is called in the constructor
    
    // If there is a state parameter in the URL, we still need to process it for backward compatibility
    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get('state');
    
    if (state) {
      handleAuthCallback(state);
    }
    
    // Check login status again after a short delay
    // This helps ensure we pick up any changes from the redirect handling
    const checkLoginAfterRedirect = setTimeout(() => {
      const currentLoginStatus = authService.isLoggedInToAzureDevOps();
      if (currentLoginStatus && !loginStatus) {
        setIsLoggedIn(true);
        if (onLogin) {
          onLogin();
        }
      }
    }, 500);
    
    return () => clearTimeout(checkLoginAfterRedirect);
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
      // With redirect flow, this will navigate away from the page
      await authService.initiateAzureDevOpsLogin();
      
      // The following code will only execute if the redirect doesn't happen
      // (e.g., if there's an error or it's handled differently)
      setIsLoggedIn(true);
      if (onLogin) {
        onLogin();
      }
    } catch (error) {
      console.error("Failed to log in to Azure DevOps:", error);
      setIsAuthenticating(false);
    }
    // We don't set isAuthenticating to false here because the page will redirect
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
