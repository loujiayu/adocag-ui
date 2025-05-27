import { PublicClientApplication, Configuration, PopupRequest } from "@azure/msal-browser";

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
  private msalInstance: PublicClientApplication;
  private azureDevOpsToken: string | null = null;
  
  constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig);
    this.msalInstance.initialize();
  }

  async login(): Promise<void> {
    try {
      // Use general User.Read scope for initial login
      const loginResponse = await this.msalInstance.loginPopup({
        scopes: ["User.Read"]
      });
      this.msalInstance.setActiveAccount(loginResponse.account);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('azure_devops_token');
    this.azureDevOpsToken = null;
    await this.msalInstance.logout();
  }
  
  // Azure DevOps OAuth methods using Microsoft Entra ID
  async initiateAzureDevOpsLogin(): Promise<void> {
    try {
      // Generate and store state for security
      const state = this.generateRandomState();
      localStorage.setItem('azure_devops_state', state);
      
      // Create authentication request with Azure DevOps scopes
      const request: PopupRequest = {
        scopes: azureDevOpsConfig.scopes,
        state: state
      };

      // Use MSAL for authentication
      const response = await this.msalInstance.acquireTokenPopup(request);
      
      // Store the token and update state
      this.azureDevOpsToken = response.accessToken;
      localStorage.setItem('azure_devops_token', response.accessToken);
    } catch (error) {
      console.error("Azure DevOps authentication failed:", error);
      throw error;
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
    
    // For Microsoft Entra ID, we're using MSAL to handle the entire auth flow,
    // so this method exists mainly for compatibility with the component
    return true;
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
    return !!this.getAzureDevOpsToken();
  }
  
  private generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

export const authService = new AuthService();
