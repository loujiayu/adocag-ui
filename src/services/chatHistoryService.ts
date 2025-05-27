import { useChatHistoryStore } from '../store/chatHistoryStore';
import { SourceConfig } from '../store/searchStore';

export interface ChatMessage {
  role: 'assistant' | 'user' | 'system';
  content: string;
  saved?: boolean;
  isComplete?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
  lastUpdated: number;
  assistantRole?: string;
  sources?: SourceConfig[];
}

const CHAT_HISTORY_KEY = 'chat_history';
const MAX_SESSIONS = 10;

class ChatHistoryService {
  private getSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(CHAT_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading chat history from localStorage:', error);
      return [];
    }
  }

  private saveSessions(sessions: ChatSession[]): void {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(sessions));
      // Update Zustand store instead of dispatching custom event
      const { setSessions } = useChatHistoryStore.getState();
      setSessions(sessions);
    } catch (error) {
      console.error('Error saving chat history to localStorage:', error);
    }
  }

  private generateTitle(messages: ChatMessage[]): string {
    // Count user messages
    const userMessages = messages.filter(msg => msg.role === 'user');
    
    if (userMessages.length > 2) {
      // Get the latest user message if there are more than 2 user messages
      const latestUserMessage = userMessages[userMessages.length - 1];
      const title = latestUserMessage.content
        .replace(/\n/g, ' ')
        .substring(0, 100);
      return title.length < latestUserMessage.content.length ? `${title}...` : title;
    } else {
      // Get the latest assistant message
      const assistantMessages = messages.filter(msg => msg.role === 'assistant');
      if (assistantMessages.length > 0) {
        const latestAssistantMessage = assistantMessages[assistantMessages.length - 1];
        const title = latestAssistantMessage.content
          .replace(/\n/g, ' ')
          .substring(0, 100);
        return title.length < latestAssistantMessage.content.length ? `${title}...` : title;
      }
    }
    
    return `Chat ${new Date().toLocaleDateString()}`;
  }

  getAllSessions(): ChatSession[] {
    return this.getSessions().sort((a, b) => b.lastUpdated - a.lastUpdated);
  }

  // Initialize Zustand store with localStorage data
  initializeStore(): void {
    const sessions = this.getAllSessions();
    const { setSessions } = useChatHistoryStore.getState();
    setSessions(sessions);
  }

  private areSessionsEqual(session1: ChatSession, messages: ChatMessage[], assistantRole?: string, sources?: SourceConfig[]): boolean {
    // Compare messages
    if (session1.messages.length !== messages.length) {
      return false;
    }
    
    for (let i = 0; i < session1.messages.length; i++) {
      const msg1 = session1.messages[i];
      const msg2 = messages[i];
      if (msg1.role !== msg2.role || 
          msg1.content !== msg2.content || 
          msg1.saved !== msg2.saved || 
          msg1.isComplete !== msg2.isComplete) {
        return false;
      }
    }
    
    // Compare assistant role
    const currentAssistantRole = assistantRole || session1.assistantRole;
    if (session1.assistantRole !== currentAssistantRole) {
      return false;
    }
    
    // Compare sources
    const currentSources = sources || session1.sources || [];
    const existingSources = session1.sources || [];
    
    if (currentSources.length !== existingSources.length) {
      return false;
    }
    
    for (let i = 0; i < currentSources.length; i++) {
      const source1 = existingSources[i];
      const source2 = currentSources[i];
      
      // Compare repositories
      if (source1.repositories.length !== source2.repositories.length ||
          !source1.repositories.every((repo, idx) => repo === source2.repositories[idx])) {
        return false;
      }
      
      // Compare query and scopeLearning
      if (source1.query !== source2.query || source1.scopeLearning !== source2.scopeLearning) {
        return false;
      }
    }
    
    // Compare title (generated from messages)
    const newTitle = this.generateTitle(messages);
    if (session1.title !== newTitle) {
      return false;
    }
    
    return true;
  }

  saveSession(messages: ChatMessage[], sessionId?: string, assistantRole?: string, updateTimestamp: boolean = true, sources?: SourceConfig[]): string {
    const sessions = this.getSessions();
    const now = Date.now();
    
    if (sessionId) {
      // Update existing session
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      if (sessionIndex !== -1) {
        const existingSession = sessions[sessionIndex];
        
        // Check if the session data has actually changed
        if (this.areSessionsEqual(existingSession, messages, assistantRole, sources)) {
          // No changes detected, return existing session ID without saving
          return sessionId;
        }
        
        sessions[sessionIndex] = {
          ...sessions[sessionIndex],
          messages: [...messages],
          lastUpdated: updateTimestamp ? now : sessions[sessionIndex].lastUpdated,
          title: this.generateTitle(messages),
          assistantRole: assistantRole || sessions[sessionIndex].assistantRole,
          sources: sources || sessions[sessionIndex].sources
        };
        this.saveSessions(sessions);
        return sessionId;
      }
    }

    // Create new session
    const newSession: ChatSession = {
      id: `session_${now}_${Math.random().toString(36).substr(2, 9)}`,
      title: this.generateTitle(messages),
      messages: [...messages],
      timestamp: now,
      lastUpdated: now,
      assistantRole,
      sources
    };

    sessions.unshift(newSession);

    // Keep only the latest MAX_SESSIONS
    if (sessions.length > MAX_SESSIONS) {
      sessions.splice(MAX_SESSIONS);
    }

    this.saveSessions(sessions);
    return newSession.id;
  }

  getSession(sessionId: string): ChatSession | null {
    const sessions = this.getSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  loadSession(sessionId: string): ChatSession | null {
    // Load a session without updating the lastUpdated timestamp
    return this.getSession(sessionId);
  }

  deleteSession(sessionId: string): void {
    const sessions = this.getSessions();
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    this.saveSessions(updatedSessions);
  }

  clearAllSessions(): void {
    localStorage.removeItem(CHAT_HISTORY_KEY);
    // Update Zustand store
    const { clearSessions } = useChatHistoryStore.getState();
    clearSessions();
  }

  updateSessionTitle(sessionId: string, title: string): void {
    const sessions = this.getSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].title = title;
      sessions[sessionIndex].lastUpdated = Date.now();
      this.saveSessions(sessions);
    }
  }
}

export const chatHistoryService = new ChatHistoryService();
