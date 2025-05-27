import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { 
  Text, 
  Button, 
  Input,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem
} from '@fluentui/react-components';
import { 
  History24Regular,
  Delete24Regular,
  MoreHorizontal24Regular,
  Add24Regular,
  Edit24Regular,
  Save24Regular,
  Dismiss24Regular
} from '@fluentui/react-icons';
import { chatHistoryService, ChatSession, ChatMessage } from '../services/chatHistoryService';

const useStyles = makeStyles({
  chatHistory: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'var(--colorNeutralBackground1)',
    borderLeft: '1px solid var(--colorNeutralStroke1)',
  },
  header: {
    ...shorthands.padding('16px', '20px'),
    borderBottom: '1px solid var(--colorNeutralStroke1)',
    backgroundColor: 'var(--colorNeutralBackground2)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sessionsList: {
    flex: 1,
    overflowY: 'auto',
    ...shorthands.padding('12px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'var(--colorNeutralStroke1)',
      borderRadius: '3px',
    },
  },
  sessionItem: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding('12px'),
    ...shorthands.borderRadius('8px'),
    backgroundColor: 'var(--colorNeutralBackground2)',
    border: '1px solid var(--colorNeutralStroke1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    '&:hover': {
      backgroundColor: 'var(--colorNeutralBackground3)',
      ...shorthands.border('1px', 'solid', 'var(--colorNeutralStroke1Hover)'),
    },
  },
  activeSession: {
    backgroundColor: 'var(--colorBrandBackground2)',
    ...shorthands.border('1px', 'solid', 'var(--colorBrandBackground)'),
    '&:hover': {
      backgroundColor: 'var(--colorBrandBackground2)',
    },
  },
  sessionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '6px',
  },
  sessionTitle: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: '1.3',
    flex: 1,
    marginRight: '8px',
  },
  sessionMeta: {
    fontSize: tokens.fontSizeBase100,
    color: 'var(--colorNeutralForeground2)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assistantRole: {
    fontSize: tokens.fontSizeBase100,
    color: 'var(--colorBrandForeground1)',
    fontWeight: tokens.fontWeightMedium,
    backgroundColor: 'var(--colorBrandBackground2)',
    ...shorthands.padding('2px', '6px'),
    ...shorthands.borderRadius('4px'),
    marginTop: '4px',
  },
  sessionPreview: {
    fontSize: tokens.fontSizeBase100,
    color: 'var(--colorNeutralForeground2)',
    marginTop: '4px',
    lineHeight: '1.2',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  menuButton: {
    minWidth: 'auto',
    width: '24px',
    height: '24px',
    ...shorthands.padding('0'),
    flexShrink: 0,
  },
  newChatButton: {
    minWidth: 'auto',
    width: '32px',
    height: '32px',
    ...shorthands.padding('0'),
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    ...shorthands.padding('20px'),
    textAlign: 'center',
    color: 'var(--colorNeutralForeground2)',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
    opacity: 0.5,
  },
  titleEditor: {
    width: '100%',
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
  },
  titleActions: {
    display: 'flex',
    gap: '4px',
    marginTop: '4px',
  },
  titleActionButton: {
    minWidth: 'auto',
    width: '20px',
    height: '20px',
    ...shorthands.padding('0'),
  },
});

interface ChatHistoryProps {
  currentSessionId?: string;
  onLoadSession: (messages: ChatMessage[]) => void;
  onNewChat: () => void;
  onSessionChanged?: (sessionId: string | undefined) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  currentSessionId,
  onLoadSession,
  onNewChat,
  onSessionChanged
}) => {
  const styles = useStyles();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const loadSessions = useCallback(() => {
    const allSessions = chatHistoryService.getAllSessions();
    setSessions(allSessions);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Refresh sessions when currentSessionId changes
  useEffect(() => {
    loadSessions();
  }, [currentSessionId, loadSessions]);

  // Listen for session updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chat_history') {
        loadSessions();
      }
    };

    // Listen for localStorage changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Also set up a custom event listener for same-tab updates
    const handleSessionUpdate = () => {
      loadSessions();
    };

    window.addEventListener('chatSessionUpdated', handleSessionUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('chatSessionUpdated', handleSessionUpdate);
    };
  }, [loadSessions]);

  const handleLoadSession = useCallback((session: ChatSession) => {
    // Use the new loadSession method if available, otherwise fallback to loadMessages
    if (typeof window !== 'undefined' && (window as any).chatBoxMethods?.loadSession) {
      (window as any).chatBoxMethods.loadSession({
        messages: session.messages,
        assistantRole: session.assistantRole
      });
    } else {
      onLoadSession(session.messages);
    }
    onSessionChanged?.(session.id);
  }, [onLoadSession, onSessionChanged]);

  const handleDeleteSession = useCallback((sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    chatHistoryService.deleteSession(sessionId);
    loadSessions();
    if (currentSessionId === sessionId) {
      onSessionChanged?.(undefined);
    }
  }, [currentSessionId, onSessionChanged, loadSessions]);

  const handleNewChat = useCallback(() => {
    onNewChat();
    onSessionChanged?.(undefined);
  }, [onNewChat, onSessionChanged]);

  const handleEditTitle = useCallback((sessionId: string, currentTitle: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  }, []);

  const handleSaveTitle = useCallback((sessionId: string) => {
    if (editingTitle.trim()) {
      chatHistoryService.updateSessionTitle(sessionId, editingTitle.trim());
      loadSessions();
    }
    setEditingSessionId(null);
    setEditingTitle('');
  }, [editingTitle, loadSessions]);

  const handleCancelEdit = useCallback(() => {
    setEditingSessionId(null);
    setEditingTitle('');
  }, []);

  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }, []);

  const getSessionPreview = useCallback((messages: ChatMessage[]) => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    if (lastUserMessage) {
      return lastUserMessage.content.replace(/\n/g, ' ').substring(0, 80);
    }
    return 'No messages';
  }, []);

  if (sessions.length === 0) {
    return (
      <div className={styles.chatHistory}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <History24Regular />
            <Text weight="semibold">Chat Sessions</Text>
          </div>
          <Button
            className={styles.newChatButton}
            icon={<Add24Regular />}
            appearance="transparent"
            onClick={handleNewChat}
            title="New Chat"
          />
        </div>
        <div className={styles.emptyState}>
          <History24Regular className={styles.emptyIcon} />
          <Text>No chat sessions yet</Text>
          <Text>Start a conversation to see your chat sessions here</Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatHistory}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <History24Regular />
          <Text weight="semibold">Chat Sessions</Text>
        </div>
        <Button
          className={styles.newChatButton}
          icon={<Add24Regular />}
          appearance="transparent"
          onClick={handleNewChat}
          title="New Chat"
        />
      </div>
      <div className={styles.sessionsList}>
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`${styles.sessionItem} ${
              currentSessionId === session.id ? styles.activeSession : ''
            }`}
            onClick={() => handleLoadSession(session)}
          >
            <div className={styles.sessionHeader}>
              {editingSessionId === session.id ? (
                <div style={{ flex: 1 }}>
                  <Input
                    className={styles.titleEditor}
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveTitle(session.id);
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                  <div className={styles.titleActions}>
                    <Button
                      className={styles.titleActionButton}
                      icon={<Save24Regular />}
                      appearance="transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveTitle(session.id);
                      }}
                      title="Save"
                    />
                    <Button
                      className={styles.titleActionButton}
                      icon={<Dismiss24Regular />}
                      appearance="transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelEdit();
                      }}
                      title="Cancel"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <Text className={styles.sessionTitle}>{session.title}</Text>
                  <Menu>
                    <MenuTrigger>
                      <Button
                        className={styles.menuButton}
                        icon={<MoreHorizontal24Regular />}
                        appearance="transparent"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </MenuTrigger>
                    <MenuPopover>
                      <MenuList>
                        <MenuItem
                          icon={<Edit24Regular />}
                          onClick={(e) => handleEditTitle(session.id, session.title, e)}
                        >
                          Rename
                        </MenuItem>
                        <MenuItem
                          icon={<Delete24Regular />}
                          onClick={(e) => handleDeleteSession(session.id, e)}
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </MenuPopover>
                  </Menu>
                </>
              )}
            </div>
            {editingSessionId !== session.id && (
              <>
                <div className={styles.sessionMeta}>
                  <Text>{formatDate(session.lastUpdated)}</Text>
                  <Text>{session.messages.length} messages</Text>
                </div>
                {session.assistantRole && (
                  <Text className={styles.assistantRole}>
                    {session.assistantRole}
                  </Text>
                )}
                <Text className={styles.sessionPreview}>
                  {getSessionPreview(session.messages)}
                </Text>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory;
