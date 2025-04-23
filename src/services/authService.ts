import { PublicClientApplication, Configuration, AuthenticationResult } from "@azure/msal-browser";

const msalConfig: Configuration = {
  auth: {
    clientId: "29d31a2b-819a-4b71-99d5-4d0e0c99a5c7", // Replace with your Azure AD app registration client ID
    authority: "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47", // Replace with your tenant ID
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

class AuthService {
  private msalInstance: PublicClientApplication;
  
  constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig);
    this.msalInstance.initialize();
  }

  async getAccessToken(): Promise<string> {
    const request = {
      scopes: ["499b84ac-1321-427f-aa17-267ca6975798/.default"],
      // scopes: ["User.Read", "vso.code"],
      account: this.msalInstance.getAllAccounts()[0], // Get the first account
    };

    let authResult: AuthenticationResult;
    
    try {
      // Try to get token silently first
      authResult = await this.msalInstance.acquireTokenSilent(request);
    } catch (error) {
      // If silent token acquisition fails, get token interactively
      authResult = await this.msalInstance.acquireTokenPopup(request);
    }

    return authResult.accessToken;
  }

  async login(): Promise<void> {
    try {
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
    await this.msalInstance.logout();
  }
}

export const authService = new AuthService();