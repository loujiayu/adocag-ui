import React, { useState, useEffect, KeyboardEvent, ChangeEvent, useCallback, memo } from 'react';
import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { Button, Textarea, Text, Combobox, Option, Link, Toast, ToastTitle, ToastBody, Toaster, useToastController, useId } from '@fluentui/react-components';
import { 
  Send24Regular, 
  Bot24Regular, 
  Person24Regular, 
  BookmarkRegular,
  BrainCircuit24Regular,
  Copy24Regular,
  QuestionCircle24Regular,
  Share24Regular,
  Dismiss24Regular
} from '@fluentui/react-icons';
import { useSearchStore, AssistantRole, ASSISTANT_ROLES, SYSTEM_PROMPTS, SourceConfig } from '../store/searchStore';
import { authService } from '../services/authService';
import { chatHistoryService, ChatMessage } from '../services/chatHistoryService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getApiUrl } from '../config';
import AzureDevOpsAuthButton from './AzureDevOpsAuthButton';
import SystemPromptEditor from './SystemPromptEditor';

const useStyles = makeStyles({
  chatBox: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'var(--colorNeutralBackground1)',
    position: 'relative',
  },  chatHeader: {
    ...shorthands.padding('16px', '24px'),
    borderBottom: '1px solid var(--colorNeutralStroke1)',
    backgroundColor: 'var(--colorNeutralBackground2)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  helperLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: 'var(--colorNeutralForeground3)',
    textDecoration: 'none',
    fontSize: tokens.fontSizeBase200,
    '&:hover': {
      color: 'var(--colorBrandForeground1)',
      textDecoration: 'underline',
    },
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    ...shorthands.padding('24px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'var(--colorNeutralStroke1)',
      ...shorthands.borderRadius('4px'),
    },
  },
  messageWrapper: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    opacity: 1,
    animation: 'fadeIn 0.3s ease',
  },
  avatar: {
    width: '32px',
    height: '32px',
    ...shorthands.borderRadius('16px'),
    backgroundColor: 'var(--colorNeutralBackground4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  message: {
    maxWidth: '80%',
    ...shorthands.padding('12px', '16px'),
    ...shorthands.borderRadius('12px'),
    position: 'relative',
  },
  userMessage: {
    backgroundColor: 'var(--colorBrandBackground)',
    color: 'var(--colorNeutralForegroundOnBrand)',
    marginLeft: 'auto',
    '&::after': {
      content: '""',
      position: 'absolute',
      right: '-8px',
      bottom: '8px',
      borderLeft: '8px solid var(--colorBrandBackground)',
      borderTop: '8px solid transparent',
      borderBottom: '8px solid transparent',
    },
  },
  aiMessage: {
    backgroundColor: 'var(--colorNeutralBackground3)',
    color: 'var(--colorNeutralForeground1)',
    '&::after': {
      content: '""',
      position: 'absolute',
      left: '-8px',
      bottom: '8px',
      borderRight: '8px solid var(--colorNeutralBackground3)',
      borderTop: '8px solid transparent',
      borderBottom: '8px solid transparent',
    },
  },
  inputArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    ...shorthands.padding('24px'),
    borderTop: '1px solid var(--colorNeutralStroke1)',
    backgroundColor: 'var(--colorNeutralBackground2)',
  },
  inputRow: {
    display: 'flex',
    gap: '12px',
    width: '100%',
  },  input: {
    flex: 1,
    '& input': {
      height: '48px',
      ...shorthands.borderRadius('24px'),
      ...shorthands.padding('0', '24px'),
      fontSize: tokens.fontSizeBase300,
    },
    '& textarea': {
      minHeight: '48px',
      maxHeight: '120px',
      ...shorthands.borderRadius('24px'),
      ...shorthands.padding('12px', '24px'),
      fontSize: tokens.fontSizeBase300,
      resize: 'none',
      lineHeight: '1.5',
    },
  },
  sendButton: {
    height: '48px',
    width: '48px',
    minWidth: '48px',
    ...shorthands.padding('0'),
    ...shorthands.borderRadius('24px'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',  },
  deepResearchButton: {
    width: '200px',
    height: '32px',
    // ...shorthands.padding('4px', '12px'),
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: '1px solid var(--colorNeutralStroke1)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    '& svg': {
      fontSize: tokens.fontSizeBase400,
      color: 'var(--colorNeutralForeground1)',
    },
    '&:hover': {
      backgroundColor: 'var(--colorNeutralBackground3)',
      border: '1px solid var(--colorNeutralStroke1Hover)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
    },
    '&[data-active="true"]': {
      backgroundColor: 'var(--colorBrandBackground)',
      border: '1px solid var(--colorBrandBackgroundSelected)',
      color: 'var(--colorNeutralForegroundOnBrand)',
      '& svg': {
        color: 'var(--colorNeutralForegroundOnBrand)',
      },
      '&:hover': {
        backgroundColor: 'var(--colorBrandBackgroundHover)',
        border: '1px solid var(--colorBrandBackgroundSelected)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      },
    },
    '&:disabled': {
      opacity: 0.5,
      boxShadow: 'none',
    }
  },
  roleSelector: {
    width: '180px',
    height: '32px',
    marginLeft: '12px',
    border: '1px solid var(--colorNeutralStroke1)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  controlsContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
  },
  saveButton: {
    marginTop: '8px',
    minWidth: 'auto',
    height: '32px',
    ...shorthands.padding('4px', '12px'),
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: '1px solid var(--colorNeutralStroke1)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    '&:hover': {
      backgroundColor: 'var(--colorNeutralBackground3)',
      border: '1px solid var(--colorNeutralStroke1Hover)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
    },
  },
  messageActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  messageButton: {
    minWidth: 'auto',
    height: '32px',
    ...shorthands.padding('4px', '8px'),
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'var(--colorNeutralBackground3)',
    },
  },
  error: {
    color: 'var(--colorStatusDangerForeground1)',
    ...shorthands.padding('8px', '12px'),
    ...shorthands.borderRadius('4px'),
    backgroundColor: 'var(--colorStatusDangerBackground1)',
    fontSize: tokens.fontSizeBase200,
  },
  processingMessage: {
    ...shorthands.padding('8px', '16px'),
    backgroundColor: 'var(--colorNeutralBackground3)',
    color: 'var(--colorNeutralForeground2)',
    fontSize: tokens.fontSizeBase200,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderTop: '1px solid var(--colorNeutralStroke1)',
  },
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
      transform: 'translateY(10px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  markdown: {
    '& h1': {
      fontSize: '1.5em',
      marginBottom: '0.5em',
      fontWeight: 'bold',
    },
    '& h2': {
      fontSize: '1.3em',
      marginBottom: '0.5em',
      fontWeight: 'bold',
    },
    '& h3': {
      fontSize: '1.1em',
      marginBottom: '0.5em',
      fontWeight: 'bold',
    },
    '& p': {
      marginBottom: '0.5em',
    },
    '& ul, & ol': {
      marginBottom: '0.5em',
      paddingLeft: '1.5em',
    },
    '& li': {
      marginBottom: '0.25em',
    },
    '& code': {
      backgroundColor: 'var(--colorNeutralBackground4)',
      padding: '0.2em 0.4em',
      borderRadius: '3px',
      fontSize: '0.9em',
      fontFamily: tokens.fontFamilyMonospace,
    },    '& pre': {
      backgroundColor: 'var(--colorNeutralBackground4)',
      padding: 0, // Reduced padding because SyntaxHighlighter adds its own
      borderRadius: '6px',
      overflow: 'auto',
      marginBottom: '0.5em',
      '& code': {
        backgroundColor: 'transparent',
        padding: 0,
      },
      '& div': { // SyntaxHighlighter container
        borderRadius: '6px',
        margin: 0, // Remove default margins from SyntaxHighlighter
      }
    },
    '& blockquote': {
      borderLeft: '4px solid var(--colorNeutralStroke1)',
      paddingLeft: '1em',
      marginLeft: 0,
      marginBottom: '0.5em',
      color: 'var(--colorNeutralForeground2)',
    },
    '& table': {
      borderCollapse: 'collapse',
      marginBottom: '0.5em',
      width: '100%',
    },
    '& th, & td': {
      border: '1px solid var(--colorNeutralStroke1)',
      padding: '0.5em',
    },    '& a': {
      color: 'var(--colorBrandBackground)',
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    '& img': {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '4px',
    },
    '& hr': {
      border: 'none',
      borderTop: '1px solid var(--colorNeutralStroke1)',
      margin: '1em 0',
    },
  },
  shareButton: {
    minWidth: 'auto',
    height: '32px',
    ...shorthands.padding('4px', '12px'),
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: '1px solid var(--colorNeutralStroke1)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'var(--colorNeutralBackground3)',
      border: '1px solid var(--colorNeutralStroke1Hover)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
    },    '&:disabled': {
      opacity: 0.5,
      boxShadow: 'none',
    }
  },
  '@keyframes slideInUp': {
    from: {
      opacity: 0,
      transform: 'translate(-50%, -40%) scale(0.95)',
    },
    to: {
      opacity: 1,
      transform: 'translate(-50%, -50%) scale(1)',
    },
  },
});

interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
  saved?: boolean;
  isComplete?: boolean; // Flag to track if message is fully received
}

interface MessageComponentProps {
  message: Message;
  index: number;
  onSave: (index: number) => void;
  styles: any;
}

const MessageComponent: React.FC<MessageComponentProps> = memo(({ message, index, onSave, styles }) => {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content);
  }, [message.content]);

  return (
    <div className={styles.messageWrapper} data-testid={`message-${index}`}>
      {message.role === 'assistant' && (
        <div className={styles.avatar} data-testid={`assistant-avatar-${index}`}>
          <Bot24Regular />
        </div>
      )}      <div 
        className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.aiMessage}`}
        data-testid={`${message.role}-message-${index}`}
      >
        <div className={styles.markdown}>          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code({node, inline, className, children, ...props}: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        {message.role === 'assistant' && message.isComplete && (
          <div className={styles.messageActions}>
            <Button
              className={styles.messageButton}
              icon={<Copy24Regular />}
              appearance="transparent"
              onClick={handleCopy}
              title="Copy to clipboard"
              data-testid={`copy-message-${index}`}
            />
            <Button
              className={styles.messageButton}
              icon={<BookmarkRegular />}
              appearance={message.saved ? "primary" : "transparent"}
              onClick={() => onSave(index)}
              title={message.saved ? "Remove from notes" : "Save to notes"}
              data-testid={`save-note-${index}`}
            >
              {message.saved ? "Saved" : "Save"}
            </Button>
          </div>
        )}
      </div>
      {message.role === 'user' && (
        <div className={styles.avatar} data-testid={`user-avatar-${index}`}>
          <Person24Regular />
        </div>
      )}
    </div>
  );
});

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isDeepResearch: boolean;
  setIsDeepResearch: (isDeep: boolean) => void;
  processingMessage: string;
  assistantRole: AssistantRole;
  setAssistantRole: (role: AssistantRole) => void;
}

const InputArea: React.FC<InputAreaProps> = memo(({ 
  onSendMessage, 
  isLoading, 
  isDeepResearch, 
  setIsDeepResearch, 
  processingMessage,
  assistantRole,
  setAssistantRole
}) => {
  const styles = useStyles();
  const [inputValue, setInputValue] = useState('');
  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        onSendMessage(inputValue);
        setInputValue('');
      }
    }
  }, [inputValue, onSendMessage]);

  const handleSend = useCallback(() => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  }, [inputValue, onSendMessage]);

  const handleDeepResearch = useCallback(() => {
    setIsDeepResearch(!isDeepResearch);
  }, [isDeepResearch, setIsDeepResearch]);

  return (
    <div className={styles.inputArea} data-testid="input-area">
      {processingMessage && (
        <div className={styles.processingMessage} data-testid="processing-message">
          {processingMessage}
        </div>
      )}
      <div className={styles.controlsContainer}>
        <Button
          className={styles.deepResearchButton}
          data-testid="deep-research-button"
          data-active={isDeepResearch}
          appearance="secondary"
          icon={<BrainCircuit24Regular />}
          onClick={handleDeepResearch}
          disabled={isLoading}
        >
          Deep Research
        </Button>
        <Combobox
          className={styles.roleSelector}
          data-testid="role-selector"
          value={assistantRole}
          onOptionSelect={(_ev, data) => {
            if (data.optionValue) {
              setAssistantRole(data.optionValue as AssistantRole);
            }
          }}
          disabled={isLoading}
        >
          {ASSISTANT_ROLES.map((role) => (
            <Option key={role} text={role} value={role}>
              {role}
            </Option>
          ))}
        </Combobox>
        <SystemPromptEditor role={assistantRole} setRole={setAssistantRole} />
      </div>      <div className={styles.inputRow}>
        <Textarea
          className={styles.input}
          data-testid="message-input"
          placeholder={isDeepResearch ? "Ask a detailed question..." : "Type your message..."}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          resize="none"
        />
        <Button
          className={styles.sendButton}
          data-testid="send-button"
          appearance="primary"
          icon={<Send24Regular />}
          onClick={handleSend}
          disabled={isLoading}
        />
      </div>
    </div>
  );
});

interface ChatBoxProps {
  onLogin?: () => void;
  onLogout?: () => void;
  currentSessionId?: string;
  onSessionSaved?: (sessionId: string) => void;
  onLoadMessages?: (messages: ChatMessage[]) => void;
  onClearChat?: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ 
  onLogin, 
  onLogout, 
  currentSessionId, 
  onSessionSaved,
  onLoadMessages,
  onClearChat 
}) => {
  const styles = useStyles();
  const toasterId = useId("toaster");
  const { dispatchToast, dismissToast } = useToastController(toasterId);
  
  const { 
    results, 
    searchQuery, 
    sources,
    gcpProjectName,
    gcpRegion,
    gcpModel,
    apiProvider,
    azureOpenAIApiKey,
    azureOpenAIEndpoint,
    azureOpenAIModel,
    temperature,
    assistantRole,
    setAssistantRole,
    setSources
  } = useSearchStore();  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeepResearch, setIsDeepResearch] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string>('');
  const [isSharing, setIsSharing] = useState(false);// Save session when messages change (debounced)
  useEffect(() => {
    if (messages.length > 0) {
      const timeoutId = setTimeout(() => {
        const sessionId = chatHistoryService.saveSession(messages, currentSessionId, assistantRole, true, sources);
        if (!currentSessionId && onSessionSaved) {
          onSessionSaved(sessionId);
        }
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [messages, currentSessionId, onSessionSaved, assistantRole, sources]);

  // Handle loading messages from chat history
  useEffect(() => {
    if (onLoadMessages) {
      onLoadMessages(messages);
    }
  }, [messages, onLoadMessages]);
  // Method to load messages from history
  const loadMessages = useCallback((historyMessages: ChatMessage[]) => {
    setMessages(historyMessages);
    setError(null);
  }, []);
  // Method to load complete session with assistant role
  const loadSession = useCallback((session: { messages: ChatMessage[], assistantRole?: string, sources?: SourceConfig[] }) => {
    setMessages(session.messages);
    if (session.assistantRole) {
      setAssistantRole(session.assistantRole as AssistantRole);
    }
    if (session.sources) {
      setSources(session.sources);
    }
    setError(null);
  }, [setAssistantRole, setSources]);

  // Method to clear current chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsDeepResearch(false);
    setProcessingMessage('');
    if (onClearChat) {
      onClearChat();
    }
  }, [onClearChat]);
  // Expose methods for parent component
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).chatBoxMethods = {
        loadMessages,
        loadSession,
        clearChat
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).chatBoxMethods;
      }
    };
  }, [loadMessages, loadSession, clearChat]);
  useEffect(() => {
    if (results) {
      setMessages([
        { role: 'user', content: results.prompt },
        { role: 'assistant', content: results.response }
      ]);
    }
  }, [results]);

  const handleShareSession = useCallback(async () => {    if (!currentSessionId) {
      const warningToastId = 'warning-no-session';
      dispatchToast(
        <Toast>
          <ToastTitle action={
            <Button
              appearance="transparent"
              icon={<Dismiss24Regular />}
              size="small"
              onClick={() => dismissToast(warningToastId)}
            />
          }>
            Cannot share session
          </ToastTitle>
          <ToastBody>No active chat session to share</ToastBody>
        </Toast>,
        { intent: "warning", toastId: warningToastId }
      );
      return;
    }    setIsSharing(true);
    try {
      const azureDevOpsToken = authService.getAzureDevOpsToken();
      
      // Get the complete session data instead of just the ID
      const sessionData = chatHistoryService.getSession(currentSessionId);
      if (!sessionData) {
        throw new Error('Session not found');
      }
      
      const response = await fetch(getApiUrl('share'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(azureDevOpsToken && { 'Authorization': `Bearer ${azureDevOpsToken}` }),
        },
        body: JSON.stringify({
          chatSession: JSON.stringify(sessionData)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to share session');
      }

      const result = await response.json();        if (result.status === 'success') {
        // Create shareable URL with the key
        const shareUrl = `${window.location.origin}?sharedkey=${result.key}`;
        // Show toast with copy button instead of auto-copying
        const successToastId = 'success-share';
        dispatchToast(
          <Toast>
            <ToastTitle action={
              <Button
                appearance="transparent"
                icon={<Dismiss24Regular />}
                size="small"
                onClick={() => dismissToast(successToastId)}
              />
            }>
              Session shared successfully!
            </ToastTitle>
            <ToastBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ 
                  wordBreak: 'break-all', 
                  fontSize: '13px', 
                  backgroundColor: 'var(--colorNeutralBackground4)', 
                  padding: '8px 12px', 
                  borderRadius: '6px',
                  border: '1px solid var(--colorNeutralStroke2)',
                  fontFamily: tokens.fontFamilyMonospace
                }}>
                  {shareUrl}
                </div>
                <Button
                  appearance="primary"
                  size="small"
                  icon={<Copy24Regular />}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(shareUrl);
                      dispatchToast(
                        <Toast>
                          <ToastTitle>Copied!</ToastTitle>
                          <ToastBody>Share link copied to clipboard</ToastBody>
                        </Toast>,
                        { intent: "success", timeout: 2000 }
                      );
                    } catch (err) {
                      console.warn('Copy failed:', err);
                    }
                  }}
                >
                  Copy Link
                </Button>
              </div>
            </ToastBody>
          </Toast>,
          { intent: "success", timeout: 15000, toastId: successToastId }
        );
      } else {
        throw new Error(result.message || 'Failed to share session');
      }    } catch (err) {
      console.error('Share error:', err);
      const errorToastId = 'error-share';
      dispatchToast(
        <Toast>
          <ToastTitle action={
            <Button
              appearance="transparent"
              icon={<Dismiss24Regular />}
              size="small"
              onClick={() => dismissToast(errorToastId)}
            />
          }>
            Failed to share session
          </ToastTitle>
          <ToastBody>{err instanceof Error ? err.message : 'An error occurred while sharing'}</ToastBody>
        </Toast>,
        { intent: "error", toastId: errorToastId }
      );
    } finally {
      setIsSharing(false);
    }
  }, [currentSessionId, dispatchToast, dismissToast]);
  const handleSendMessage = useCallback(async (message: string) => {
    const userMessage = { role: 'user' as const, content: message };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);    
    
    try {
      // Build URL with query parameters
      const url = new URL(getApiUrl('chat'));
      
      const repoLists = sources.map(s => s.repositories).flat();
      if (repoLists.length > 0) {
        url.searchParams.append('repositories', repoLists.join(','));
      }
      
      url.searchParams.append('is_deep_research', isDeepResearch.toString());
      url.searchParams.append('temperature', temperature.toString());
      
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
      }      // Add system prompt based on selected role
      const systemPrompt = SYSTEM_PROMPTS[assistantRole];      // Get Azure DevOps token if user is logged in
      const azureDevOpsToken = authService.getAzureDevOpsToken();
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          ...(azureDevOpsToken && { 'Authorization': `Bearer ${azureDevOpsToken}` }),
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt + results?.systemPrompt },
            ...messages, 
            userMessage
          ],
          sources: sources.map(s => ({
            repositories: s.repositories,
            query: s.query || searchQuery || message
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      // setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';
      let isFirstMessage = true;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const { event, data } = JSON.parse(line);
            if (event === 'message' && data) {
              if (isFirstMessage) {
                setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
                isFirstMessage = false;
              }
              streamedContent += data.content;
              
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: 'assistant',
                  content: streamedContent
                };
                return newMessages;
              });              if (data.done) {
                setProcessingMessage('');
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  newMessages[newMessages.length - 1] = {
                    ...lastMessage,
                    isComplete: true
                  };
                  return newMessages;
                });
                return;
              }
            } else if (event === 'processing' && data) {
              // Update the processing message from the server
              setProcessingMessage(data.message);
            } else if (event === 'error' && data) {
              setError(data.content || 'An error occurred during the conversation');
              setMessages(prev => prev.slice(0, -1)); // Remove the empty assistant message
              return;
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
            setError('Failed to parse server response');
            setMessages(prev => prev.slice(0, -1));
            return;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Chat error:', err);
      setMessages(prev => prev.slice(0, -1));    } finally {
      setIsLoading(false);
    }
  }, [messages, searchQuery, sources, isDeepResearch, gcpProjectName, gcpRegion, gcpModel, apiProvider, azureOpenAIApiKey, azureOpenAIEndpoint, azureOpenAIModel, temperature, assistantRole]);
  const handleSaveNote = useCallback((index: number) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const message = newMessages[index];
      newMessages[index] = {
        ...message,
        saved: !message.saved,
        isComplete: true
      };      return newMessages;
    });
  }, []);
    return (    <div className={styles.chatBox} data-testid="chat-box">
      <Toaster toasterId={toasterId} />
      <div className={styles.chatHeader} data-testid="chat-header">
        <div className={styles.headerLeft}>
          <Text weight="semibold">AI Assistant</Text>
          <Link
            className={styles.helperLink}
            href="https://msasg.visualstudio.com/Bing_Ads/_wiki/wikis/eh-bingadsui-team/313328/Knowledge-Agent-ADOCAG"
            target="_blank"
            rel="noopener noreferrer"
          >
            <QuestionCircle24Regular />
            <Text>Help Doc</Text>
          </Link>
        </div>
        <div className={styles.headerRight}>
          <Button
            className={styles.shareButton}
            icon={<Share24Regular />}
            appearance="secondary"
            onClick={handleShareSession}
            disabled={!currentSessionId || isSharing}
            title={currentSessionId ? "Share this chat session" : "No session to share"}
            data-testid="share-button"
          >
            {isSharing ? "Sharing..." : "Share"}
          </Button>
          <AzureDevOpsAuthButton 
            onLogin={onLogin}
            onLogout={onLogout}
          />
        </div>
      </div>
        <div className={styles.chatMessages} data-testid="chat-messages">
        {messages.map((message, index) => 
          index !== 0 ? (
            <MessageComponent
              key={index}
              message={message}
              index={index}
              onSave={handleSaveNote}
              styles={styles}
            />
          ) : null
        )}
        {isLoading && (
          <div className={styles.messageWrapper} data-testid="loading-message">
            <div className={styles.avatar} data-testid="loading-avatar">
              <Bot24Regular />
            </div>
            <div className={`${styles.message} ${styles.aiMessage}`} data-testid="loading-content">
              <Text>...</Text>
            </div>
          </div>
        )}
        {error && (
          <div className={styles.error} data-testid="error-message">
            {error}
          </div>
        )}
      </div>
        <InputArea
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        isDeepResearch={isDeepResearch}
        setIsDeepResearch={setIsDeepResearch}
        processingMessage={processingMessage}
        assistantRole={assistantRole}
        setAssistantRole={setAssistantRole}
      />
    </div>
  );
};

export default ChatBox;