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
      // Dispatch custom event to notify components of session updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('chatSessionUpdated'));
      }
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

  saveSession(messages: ChatMessage[], sessionId?: string, assistantRole?: string): string {
    const sessions = this.getSessions();
    const now = Date.now();
    
    if (sessionId) {
      // Update existing session
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      if (sessionIndex !== -1) {
        sessions[sessionIndex] = {
          ...sessions[sessionIndex],
          messages: [...messages],
          lastUpdated: now,
          title: this.generateTitle(messages),
          assistantRole: assistantRole || sessions[sessionIndex].assistantRole
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
      assistantRole
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

  deleteSession(sessionId: string): void {
    const sessions = this.getSessions();
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    this.saveSessions(updatedSessions);
  }

  clearAllSessions(): void {
    localStorage.removeItem(CHAT_HISTORY_KEY);
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
