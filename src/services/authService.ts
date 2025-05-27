import { PublicClientApplication, Configuration, RedirectRequest } from "@azure/msal-browser";

// Microsoft Entra ID (formerly Azure AD) configuration for MSAL
const msalConfig: Configuration = {
  auth: {
    clientId: "29d31a2b-819a-4b71-99d5-4d0e0c99a5c7", // Client ID from your Entra ID app registration
    // clientId: "0ee61678-6f2e-48f8-b9fe-4cd9bb73153d",
    authority: "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47", // Tenant ID
    // authority: "https://login.microsoftonline.com/bdb40323-87e9-4c67-a697-3ebe03490bae", // Tenant ID
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

// Azure DevOps scopes for Microsoft Entra ID OAuth authentication
const azureDevOpsConfig = {
  // Same client ID as your Entra ID app registration
  clientId: "29d31a2b-819a-4b71-99d5-4d0e0c99a5c7", 
  // clientId: "0e8822b5-a8d0-4db4-9527-a68a99e277ef",
  // Required scopes for Azure DevOps access
  scopes: [
    // Azure DevOps API access scopes
    // "499b84ac-1321-427f-aa17-267ca6975798/.default", // Azure DevOps API general scope
    "User.Read"  // Basic user profile info
  ]
};

class AuthService {
  private msalInstance!: PublicClientApplication; // Using definite assignment assertion
  private azureDevOpsToken: string | null = null;
  // Flag to track MSAL initialization status
  private msalInitialized = false;
  private isInteractionInProgress = false;
  
  constructor() {
    try {
      this.msalInstance = new PublicClientApplication(msalConfig);
      
      // Initialize MSAL and then set up redirect handling
      this.msalInstance.initialize()
        .then(() => {
          console.log("MSAL initialization complete");
          this.msalInitialized = true;
          // Only handle redirects after initialization is complete
          return this.handleRedirectResponse();
        })
        .catch(error => {
          console.error("Failed to initialize MSAL:", error);
        });
      
      // Set a safety timeout to mark as initialized after 3 seconds
      // even if the initialization process hasn't resolved yet
      setTimeout(() => {
        if (!this.msalInitialized) {
          console.warn("MSAL initialization timed out, considering it initialized anyway");
          this.msalInitialized = true;
        }
      }, 3000);
    } catch (error) {
      console.error("Error during MSAL construction:", error);
    }
  }
  
  private async handleRedirectResponse(): Promise<void> {
    try {
      // Handle redirect response
      const response = await this.msalInstance.handleRedirectPromise();
      
      // If we have a response, process it
      if (response) {
        // Store the token for Azure DevOps
        this.azureDevOpsToken = response.accessToken;
        localStorage.setItem('azure_devops_token', response.accessToken);
        
        // Set the active account
        this.msalInstance.setActiveAccount(response.account);
        
        // Refresh the page to ensure the application reloads with new auth state
        // window.location.reload();
      }
    } catch (error) {
      console.error("Error handling redirect response:", error);
    }
  }

  async login(): Promise<void> {
    try {
      // Ensure MSAL is initialized before proceeding
      await this.waitForMsalInitialization();
      
      // Use general User.Read scope for initial login
      await this.msalInstance.loginRedirect({
        scopes: ["User.Read"]
      });
      // The response will be handled after redirect
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      localStorage.removeItem('azure_devops_token');
      this.azureDevOpsToken = null;
      
      // Ensure MSAL is initialized before proceeding
      await this.waitForMsalInitialization();
      
      await this.msalInstance.logoutRedirect();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  }
  
  // Azure DevOps OAuth methods using Microsoft Entra ID
  // Wait for MSAL initialization to complete
  private async waitForMsalInitialization(timeoutMs: number = 5000): Promise<void> {
    // If we've already confirmed MSAL is initialized, return immediately
    if (this.msalInitialized) {
      return Promise.resolve();
    }
    
    return new Promise<void>((resolve, reject) => {
      const startTime = Date.now();
      const checkInitialization = () => {
        try {
          // Try to access MSAL instance properties to see if it's initialized
          if (this.msalInstance && typeof this.msalInstance.getAllAccounts === 'function') {
            this.msalInitialized = true;
            resolve();
            return;
          }
          
          // If we've been checking for more than 2 seconds, consider it ready
          if (Date.now() - startTime > 2000) {
            this.msalInitialized = true;
            resolve();
            return;
          }
          
          // Try again in 100ms
          setTimeout(checkInitialization, 100);
        } catch (e) {
          // If an error occurs during the check, try again after a delay
          setTimeout(checkInitialization, 100);
        }
      };
      
      // Start checking
      checkInitialization();
      
      // Set a timeout to avoid hanging
      setTimeout(() => {
        this.msalInitialized = true; // Consider it initialized after timeout to avoid future waits
        reject(new Error('Timeout waiting for MSAL initialization'));
      }, timeoutMs);
    });
  }

  async initiateAzureDevOpsLogin(): Promise<void> {
    if (this.isInteractionInProgress) {
      console.warn("Azure DevOps login already in progress, skipping new request");
      return;
    }
    this.isInteractionInProgress = true;
    try {
      // Ensure MSAL is initialized before proceeding
      await this.waitForMsalInitialization();
      
      // Generate and store state for security
      const state = this.generateRandomState();
      localStorage.setItem('azure_devops_state', state);
      
      // Create authentication request with Azure DevOps scopes
      const request: RedirectRequest = {
        scopes: azureDevOpsConfig.scopes,
        state: state
      };

      // Use MSAL for authentication with redirect flow
      await this.msalInstance.acquireTokenRedirect(request);

      // Note: The response will be handled in a separate handler after redirect
      // See handleRedirectPromise method which should be called on app initialization
    } catch (error) {
      console.error("Azure DevOps authentication failed:", error);
      throw error;
    } finally
    {
      this.isInteractionInProgress = false;
    }
  }
  
  // This method is called when returning from the auth flow with code and state
  async handleAzureDevOpsCallback(state: string): Promise<boolean> {
    const savedState = localStorage.getItem('azure_devops_state');
    
    // Validate state to prevent CSRF attacks
    if (state !== savedState) {
      console.error('State validation failed');
      return false;
    }
    
    try {
      // Ensure MSAL is initialized before proceeding
      await this.waitForMsalInitialization();
      
      // For redirect flow, we rely on handleRedirectPromise which is called on initialization
      // This method now mainly validates the state and provides backward compatibility
      
      // Try to get the active account
      const activeAccount = this.msalInstance.getActiveAccount();
      if (activeAccount) {
        // If we have an active account but no token, try to silently acquire it
        if (!this.azureDevOpsToken) {
          const response = await this.msalInstance.acquireTokenSilent({
            scopes: azureDevOpsConfig.scopes,
            account: activeAccount
          });
          
          this.azureDevOpsToken = response.accessToken;
          localStorage.setItem('azure_devops_token', response.accessToken);
        }
        return true;
      }
      
      return !!this.getAzureDevOpsToken();
    } catch (error) {
      console.error('Error in handleAzureDevOpsCallback:', error);
      return false;
    }
  }
  
  getAzureDevOpsToken(): string | null {
    if (this.azureDevOpsToken) return this.azureDevOpsToken;
    
    const storedToken = localStorage.getItem('azure_devops_token');
    if (storedToken) {
      this.azureDevOpsToken = storedToken;
      return storedToken;
    }
    
    return null;
  }
  
  isLoggedInToAzureDevOps(): boolean {
    // Get the token
    const token = this.getAzureDevOpsToken();
    
    // First check: token exists
    if (!token) {
      return false;
    }
    
    try {
      // Second check: verify token format (JWT should have 3 parts)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.warn('Azure DevOps token has invalid format');
        return false;
      }
      
      // Third check: check if we have an active account in MSAL
      if (this.msalInitialized && this.msalInstance) {
        const activeAccount = this.msalInstance.getActiveAccount();
        if (!activeAccount) {
          console.warn('No active account in MSAL, but token exists');
          // We could clear the token here, but let's just return false
          return false;
        }
      }
      
      // Additional check: try to decode the token and check expiration
      // This is a basic check for JWT expiration
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        
        if (expirationTime < currentTime) {
          console.warn('Azure DevOps token has expired');
          // Clear the expired token
          localStorage.removeItem('azure_devops_token');
          this.azureDevOpsToken = null;
          return false;
        }
      } catch (e) {
        console.warn('Could not decode token for expiration check:', e);
        // Continue with the valid token if decode fails
      }
      
      return true;
    } catch (e) {
      console.error('Error verifying Azure DevOps authentication:', e);
      return false;
    }
  }
  
  private generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

export const authService = new AuthService();
