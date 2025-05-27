import { create } from 'zustand';
import { ChatSession } from '../services/chatHistoryService';

interface ChatHistoryStore {
  sessions: ChatSession[];
  currentSessionId: string | null;
  lastUpdated: number;
  setSessions: (sessions: ChatSession[]) => void;
  setCurrentSessionId: (sessionId: string | null) => void;
  updateSessions: () => void;
  addSession: (session: ChatSession) => void;
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  removeSession: (sessionId: string) => void;
  clearSessions: () => void;
}

export const useChatHistoryStore = create<ChatHistoryStore>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  lastUpdated: 0,
  
  setSessions: (sessions) => {
    set({ 
      sessions: sessions.sort((a, b) => b.lastUpdated - a.lastUpdated),
      lastUpdated: Date.now()
    });
  },
  
  setCurrentSessionId: (sessionId) => {
    set({ currentSessionId: sessionId });
  },
  
  updateSessions: () => {
    set({ lastUpdated: Date.now() });
  },
  
  addSession: (session) => {
    const { sessions } = get();
    const newSessions = [session, ...sessions];
    set({ 
      sessions: newSessions,
      lastUpdated: Date.now()
    });
  },
  
  updateSession: (sessionId, updates) => {
    const { sessions } = get();
    const updatedSessions = sessions.map(session => 
      session.id === sessionId ? { ...session, ...updates } : session
    );
    set({ 
      sessions: updatedSessions,
      lastUpdated: Date.now()
    });
  },
  
  removeSession: (sessionId) => {
    const { sessions } = get();
    const filteredSessions = sessions.filter(session => session.id !== sessionId);
    set({ 
      sessions: filteredSessions,
      lastUpdated: Date.now()
    });
  },
  
  clearSessions: () => {
    set({ 
      sessions: [],
      currentSessionId: null,
      lastUpdated: Date.now()
    });
  }
}));
