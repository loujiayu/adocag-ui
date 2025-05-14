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
  'AdsAppsDB',
  'AdsAppUISharedComponents'
] as const;

export const AVAILABLE_API_PROVIDERS = [
  'Azure OpenAI',
  'Google Vertex AI',
  'Built In',
] as const;

export const ASSISTANT_ROLES = [
  'Custom',
  'Tech Designer',
  'Knowledge Generator',
  'Prompt Generator'
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
export type AssistantRole = typeof ASSISTANT_ROLES[number];

// Get the default system prompts
const getDefaultSystemPrompts = (): Record<AssistantRole, string> => ({
  'Custom': 'You are a helpful AI assistant. Provide clear, concise, and accurate information.',
  
  'Tech Designer': `You are a technical solution designer AI assistant. Your role is to:
1. Analyze technical requirements and constraints
2. Propose architecture and design solutions
3. Consider scalability, security, performance, and maintainability
4. Provide detailed technical specifications
5. Suggest implementation approaches with pros and cons
Focus on practical, industry-standard solutions while being innovative when appropriate.`,
  
  'Knowledge Generator': `You are a knowledge generation AI assistant. Your role is to:
1. Synthesize information from multiple sources
2. Generate comprehensive knowledge on complex topics
3. Structure information in a clear, logical manner
4. Identify connections between concepts and ideas
5. Present different perspectives and approaches
Emphasize depth, accuracy, and pedagogical clarity in your responses.`,
  
  'Prompt Generator': `You are a prompt engineering AI assistant. Your role is to:
1. Create effective prompts for AI code agents
2. Break down complex tasks into clear instructions
3. Include necessary context and constraints
4. Balance specificity with room for the AI to apply its capabilities
5. Design prompts that reduce the need for follow-up clarification
Focus on creating prompts that produce high-quality, relevant outputs from AI coding assistants.`
});

// Initialize system prompts from localStorage or use defaults
export const SYSTEM_PROMPTS: Record<AssistantRole, string> = getStorageItem<Record<AssistantRole, string>>('systemPrompts', getDefaultSystemPrompts());

export interface SourceConfig {
  repositories: Repository[];
  query?: string;
}

interface SearchStore {
  searchQuery: string;
  results: SearchResult | undefined;
  isLoading: boolean;
  error: string | null;
  processingMessage: string;
  sources: SourceConfig[];
  selectedRepositories: Repository[];
  gcpProjectName: string;
  gcpRegion: string;
  gcpModel: string;
  apiProvider: ApiProvider;
  azureOpenAIApiKey: string;
  azureOpenAIEndpoint: string;
  azureOpenAIModel: string;
  temperature: number;
  assistantRole: AssistantRole;
  setAssistantRole: (role: AssistantRole) => void;
  updateSystemPrompt: (role: AssistantRole, prompt: string) => void;
  resetSystemPrompt: (role: AssistantRole) => void;
  resetAllSystemPrompts: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedRepositories: (repositories: Repository[]) => void;
  setGcpProjectName: (projectName: string) => void;
  setGcpRegion: (region: string) => void;
  setGcpModel: (model: string) => void;
  setApiProvider: (provider: ApiProvider) => void;
  setAzureOpenAIApiKey: (apiKey: string) => void;
  setAzureOpenAIEndpoint: (endpoint: string) => void;
  setAzureOpenAIModel: (model: string) => void;
  setTemperature: (temp: number) => void;
  addSource: (source: SourceConfig) => void;
  updateSource: (index: number, source: Partial<SourceConfig>) => void;
  removeSource: (index: number) => void;
  search: () => Promise<void>;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  searchQuery: '',
  results: undefined,
  isLoading: false,
  error: null,
  processingMessage: 'Searching...',
  sources: getStorageItem<SourceConfig[]>('searchStore.sources', [{
    repositories: ['AdsAppsCampaignUI'],
    query: ''
  }]),
  selectedRepositories: getStorageItem<Repository[]>('searchStore.selectedRepositories', ['AdsAppsCampaignUI']),
  gcpProjectName: getStorageItem<string>('searchStore.gcpProjectName', ''),
  gcpRegion: getStorageItem<string>('searchStore.gcpRegion', ''),
  gcpModel: getStorageItem<string>('searchStore.gcpModel', ''),
  apiProvider: getStorageItem<ApiProvider>('searchStore.apiProvider', 'Built In'),
  azureOpenAIApiKey: getStorageItem<string>('searchStore.azureOpenAIApiKey', ''),
  azureOpenAIEndpoint: getStorageItem<string>('searchStore.azureOpenAIEndpoint', ''),
  azureOpenAIModel: getStorageItem<string>('searchStore.azureOpenAIModel', ''),
  temperature: getStorageItem<number>('searchStore.temperature', 0.7),
  assistantRole: getStorageItem<AssistantRole>('searchStore.assistantRole', 'Custom'),
  setAssistantRole: (role) => {
    setStorageItem('searchStore.assistantRole', role);
    set({ assistantRole: role });
  },
  updateSystemPrompt: (role, prompt) => {
    const updatedPrompts = { ...SYSTEM_PROMPTS, [role]: prompt };
    setStorageItem('systemPrompts', updatedPrompts);
    // Update the global SYSTEM_PROMPTS object directly
    Object.assign(SYSTEM_PROMPTS, updatedPrompts);
    // No need to update state as we're modifying a mutable object
  },
  resetSystemPrompt: (role) => {
    const defaultPrompts = getDefaultSystemPrompts();
    const updatedPrompts = { ...SYSTEM_PROMPTS, [role]: defaultPrompts[role] };
    setStorageItem('systemPrompts', updatedPrompts);
    Object.assign(SYSTEM_PROMPTS, updatedPrompts);
  },
  resetAllSystemPrompts: () => {
    const defaultPrompts = getDefaultSystemPrompts();
    setStorageItem('systemPrompts', defaultPrompts);
    Object.assign(SYSTEM_PROMPTS, defaultPrompts);
  },
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
  setTemperature: (temp) => {
    setStorageItem('searchStore.temperature', temp);
    set({ temperature: temp });
  },
  addSource: (source) => {
    const newSources = [...get().sources, source];
    setStorageItem('searchStore.sources', newSources);
    set({ sources: newSources });
  },
  updateSource: (index, source) => {
    const newSources = get().sources.map((s, i) => 
      i === index ? { ...s, ...source } : s
    );
    setStorageItem('searchStore.sources', newSources);
    set({ sources: newSources });
  },
  removeSource: (index) => {
    const newSources = get().sources.filter((_, i) => i !== index);
    setStorageItem('searchStore.sources', newSources);
    set({ sources: newSources });
  },
  search: async () => {
    const { 
      sources,
      gcpProjectName, 
      gcpRegion,
      gcpModel,
      apiProvider, 
      azureOpenAIApiKey,
      azureOpenAIEndpoint,
      azureOpenAIModel
    } = get();
    
    set({ isLoading: true, error: null });
    try {
      const url = new URL(getApiUrl('search'));
      
      // Add provider-specific parameters
      url.searchParams.append('api_provider', apiProvider);
      if (apiProvider === 'Azure OpenAI') {
        if (azureOpenAIApiKey) url.searchParams.append('azure_api_key', azureOpenAIApiKey);
        if (azureOpenAIEndpoint) url.searchParams.append('azure_endpoint', azureOpenAIEndpoint);
        if (azureOpenAIModel) url.searchParams.append('azure_model', azureOpenAIModel);
      } else if (apiProvider === 'Google Vertex AI') {
        if (gcpProjectName) url.searchParams.append('gcp_project_name', gcpProjectName);
        if (gcpRegion) url.searchParams.append('gcp_region', gcpRegion);
        if (gcpModel) url.searchParams.append('gcp_model', gcpModel);
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          sources: sources
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';
      let prompt = '';
      let incompleteLine = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim()) continue;
          
          const parsedLine = incompleteLine + line;
          try {
            const { event, data } = JSON.parse(parsedLine);
            incompleteLine = '';

            if (event === 'message' && data) {
              streamedContent += data.content;
              set({ results: { response: streamedContent, prompt: prompt } });
              
              if (data.done) {
                // Search completed
                set(({ processingMessage: '' }));
                break;
              }
            } else if (event === 'prompt') {
              prompt = data.content;
              set({ processingMessage: data.message });
            } else if (event === 'processing' && data) {
              // Update the processing message when status is 'processing'
              set({ processingMessage: data.message });
            } else if (event === 'error' && data) {
              set({ 
                error: data.message || 'An error occurred during the search',
                isLoading: false 
              });
              return;
            }
          } catch (e) {
            incompleteLine += line;
            console.warn('inmcomplete line');
          }
        }
      }

      set({ isLoading: false });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'An error occurred while searching',
        isLoading: false 
      });
    }
  }
}));