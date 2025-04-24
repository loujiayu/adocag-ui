import { create } from 'zustand';
import { getApiUrl } from '../config';

// Helper functions for localStorage
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
  }
};

interface SearchResult {
  response: string;
  prompt: string;
}

export const AVAILABLE_REPOSITORIES = [
  'AdsAppsCampaignUI',
  'AdsAppsMT',
  'AdsAppsDB'
] as const;

export const AVAILABLE_API_PROVIDERS = [
  'Azure OpenAI',
  'Google Vertex AI',
  'Built In',
] as const;

export const AZURE_OPENAI_MODELS = [
  'gpt-4.1',
] as const;

export const GOOGLE_VERTEX_AI_MODELS = [
  'gemini-2.5-pro-exp-03-25',
  'gemini-2.0-flash-001',
] as const;

export type Repository = typeof AVAILABLE_REPOSITORIES[number];
export type ApiProvider = typeof AVAILABLE_API_PROVIDERS[number];
export type AzureOpenAIModel = typeof AZURE_OPENAI_MODELS[number];
export type GoogleVertexAIModel = typeof GOOGLE_VERTEX_AI_MODELS[number];

interface SearchStore {
  searchQuery: string;
  results: SearchResult | undefined;
  isLoading: boolean;
  error: string | null;
  selectedRepositories: Repository[];
  gcpProjectName: string;
  gcpRegion: string;
  gcpModel: string;
  apiProvider: ApiProvider;
  azureOpenAIApiKey: string;
  azureOpenAIEndpoint: string;
  azureOpenAIModel: string;
  setSearchQuery: (query: string) => void;
  setSelectedRepositories: (repositories: Repository[]) => void;
  setGcpProjectName: (projectName: string) => void;
  setGcpRegion: (region: string) => void;
  setGcpModel: (model: string) => void;
  setApiProvider: (provider: ApiProvider) => void;
  setAzureOpenAIApiKey: (apiKey: string) => void;
  setAzureOpenAIEndpoint: (endpoint: string) => void;
  setAzureOpenAIModel: (model: string) => void;
  search: () => Promise<void>;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  searchQuery: '',
  results: undefined,
  isLoading: false,
  error: null,
  selectedRepositories: getStorageItem<Repository[]>('searchStore.selectedRepositories', ['AdsAppsDB']),
  gcpProjectName: getStorageItem<string>('searchStore.gcpProjectName', ''),
  gcpRegion: getStorageItem<string>('searchStore.gcpRegion', ''),
  gcpModel: getStorageItem<string>('searchStore.gcpModel', ''),
  apiProvider: getStorageItem<ApiProvider>('searchStore.apiProvider', 'Built In'),
  azureOpenAIApiKey: getStorageItem<string>('searchStore.azureOpenAIApiKey', ''),
  azureOpenAIEndpoint: getStorageItem<string>('searchStore.azureOpenAIEndpoint', ''),
  azureOpenAIModel: getStorageItem<string>('searchStore.azureOpenAIModel', ''),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedRepositories: (repositories) => {
    setStorageItem('searchStore.selectedRepositories', repositories);
    set({ selectedRepositories: repositories });
  },
  setGcpProjectName: (projectName) => {
    setStorageItem('searchStore.gcpProjectName', projectName);
    set({ gcpProjectName: projectName });
  },
  setGcpRegion: (region) => {
    setStorageItem('searchStore.gcpRegion', region);
    set({ gcpRegion: region });
  },
  setGcpModel: (model) => {
    setStorageItem('searchStore.gcpModel', model);
    set({ gcpModel: model });
  },
  setApiProvider: (provider) => {
    setStorageItem('searchStore.apiProvider', provider);
    set({ apiProvider: provider });
  },
  setAzureOpenAIApiKey: (apiKey) => {
    setStorageItem('searchStore.azureOpenAIApiKey', apiKey);
    set({ azureOpenAIApiKey: apiKey });
  },
  setAzureOpenAIEndpoint: (endpoint) => {
    setStorageItem('searchStore.azureOpenAIEndpoint', endpoint);
    set({ azureOpenAIEndpoint: endpoint });
  },
  setAzureOpenAIModel: (model) => {
    setStorageItem('searchStore.azureOpenAIModel', model);
    set({ azureOpenAIModel: model });
  },
  search: async () => {
    const { 
      searchQuery, 
      selectedRepositories, 
      gcpProjectName, 
      gcpRegion,
      gcpModel,
      apiProvider, 
      azureOpenAIApiKey,
      azureOpenAIEndpoint,
      azureOpenAIModel
    } = get();
    
    if (!searchQuery.trim()) return;

    set({ isLoading: true, error: null });
    try {
      const url = new URL(getApiUrl('search'));
      
      // Add common parameters
      url.searchParams.append('query', searchQuery);
      if (selectedRepositories.length > 0) {
        url.searchParams.append('repositories', selectedRepositories.join(','));
      }
      url.searchParams.append('api_provider', apiProvider);
      
      // Add provider-specific parameters
      if (apiProvider === 'Azure OpenAI') {
        if (azureOpenAIApiKey) url.searchParams.append('azure_api_key', azureOpenAIApiKey);
        if (azureOpenAIEndpoint) url.searchParams.append('azure_endpoint', azureOpenAIEndpoint);
        if (azureOpenAIModel) url.searchParams.append('azure_model', azureOpenAIModel);
      } else if (apiProvider === 'Google Vertex AI') {
        if (gcpProjectName) url.searchParams.append('gcp_project_name', gcpProjectName);
        if (gcpRegion) url.searchParams.append('gcp_region', gcpRegion);
        if (gcpModel) url.searchParams.append('gcp_model', gcpModel);
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      set({ results: data, isLoading: false });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'An error occurred while searching',
        isLoading: false 
      });
    }
  }
}));