import { useState, useEffect, KeyboardEvent, ChangeEvent, useCallback, memo } from 'react';
import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { Button, Input, Text } from '@fluentui/react-components';
import { 
  Send24Regular, 
  Bot24Regular, 
  Person24Regular, 
  BookmarkRegular,
  BrainCircuit24Regular
} from '@fluentui/react-icons';
import { useSearchStore } from '../store/searchStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const useStyles = makeStyles({
  chatBox: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'var(--colorNeutralBackground1)',
    position: 'relative',
  },
  chatHeader: {
    ...shorthands.padding('16px', '24px'),
    borderBottom: '1px solid var(--colorNeutralStroke1)',
    backgroundColor: 'var(--colorNeutralBackground2)',
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
  },
  input: {
    flex: 1,
    '& input': {
      height: '48px',
      ...shorthands.borderRadius('24px'),
      ...shorthands.padding('0', '24px'),
      fontSize: tokens.fontSizeBase300,
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
    justifyContent: 'center',
  },
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
  error: {
    color: 'var(--colorStatusDangerForeground1)',
    ...shorthands.padding('8px', '12px'),
    ...shorthands.borderRadius('4px'),
    backgroundColor: 'var(--colorStatusDangerBackground1)',
    fontSize: tokens.fontSizeBase200,
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
    },
    '& pre': {
      backgroundColor: 'var(--colorNeutralBackground4)',
      padding: '1em',
      borderRadius: '6px',
      overflow: 'auto',
      marginBottom: '0.5em',
      '& code': {
        backgroundColor: 'transparent',
        padding: 0,
      },
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
    },
    '& a': {
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
});

interface Message {
  role: 'assistant' | 'user';
  content: string;
  saved?: boolean;
}

const MessageComponent = memo(({ message, index, onSave, styles }: {
  message: Message;
  index: number;
  onSave: (index: number) => void;
  styles: any;
}) => (
  <div className={styles.messageWrapper} data-testid={`message-${index}`}>
    {message.role === 'assistant' && (
      <div className={styles.avatar} data-testid={`assistant-avatar-${index}`}>
        <Bot24Regular />
      </div>
    )}
    <div 
      className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.aiMessage}`}
      data-testid={`${message.role}-message-${index}`}
    >
      <div className={styles.markdown}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>
      {message.role === 'assistant' && (
        <Button
          className={styles.saveButton}
          icon={<BookmarkRegular />}
          appearance={message.saved ? "primary" : "secondary"}
          onClick={() => onSave(index)}
          title={message.saved ? "Remove from notes" : "Save to notes"}
          data-testid={`save-note-${index}`}
        >
          {message.saved ? "Saved" : "Save to note"}
        </Button>
      )}
    </div>
    {message.role === 'user' && (
      <div className={styles.avatar} data-testid={`user-avatar-${index}`}>
        <Person24Regular />
      </div>
    )}
  </div>
));

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isDeepResearch: boolean;
  setIsDeepResearch: (isDeep: boolean) => void;
}

const InputArea = memo(({ onSendMessage, isLoading, isDeepResearch, setIsDeepResearch }: InputAreaProps) => {
  const styles = useStyles();
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
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
      <div className={styles.inputRow}>
        <Input
          className={styles.input}
          data-testid="message-input"
          placeholder={isDeepResearch ? "Ask a detailed question..." : "Type your message..."}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
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
    </div>
  );
});

const ChatBox = () => {
  const styles = useStyles();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeepResearch, setIsDeepResearch] = useState(false);
  const { 
    results, 
    searchQuery, 
    selectedRepositories,
    gcpProjectName,
    gcpRegion,
    gcpModel,
    apiProvider,
    azureOpenAIApiKey,
    azureOpenAIEndpoint,
    azureOpenAIModel
  } = useSearchStore();

  useEffect(() => {
    if (results) {
      setMessages([
        { role: 'user', content: results.prompt },
        { role: 'assistant', content: results.response }
      ]);
    }
  }, [results]);

  const handleSendMessage = useCallback(async (message: string) => {
    const userMessage = { role: 'user' as const, content: message };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Build URL with query parameters
      const url = new URL('http://localhost:5000/api/chat');
      
      // Add query parameters
      if (searchQuery || message) {
        url.searchParams.append('query', searchQuery || message);
      }
      
      if (selectedRepositories && selectedRepositories.length > 0) {
        selectedRepositories.forEach(repo => {
          url.searchParams.append('repositories', repo);
        });
      }
      
      url.searchParams.append('is_deep_research', isDeepResearch.toString());
      
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
          messages: [...messages, userMessage]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';

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
              streamedContent += data.content;
              
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: 'assistant',
                  content: streamedContent
                };
                return newMessages;
              });

              if (data.done) {
                return;
              }
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
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [messages, searchQuery, selectedRepositories, isDeepResearch, gcpProjectName, gcpRegion, gcpModel, apiProvider, azureOpenAIApiKey, azureOpenAIEndpoint, azureOpenAIModel]);

  const handleSaveNote = useCallback((index: number) => {
    setMessages(prev => {
      const newMessages = [...prev];
      newMessages[index] = { ...newMessages[index], saved: !newMessages[index].saved };
      return newMessages;
    });
  }, []);

  return (
    <div className={styles.chatBox} data-testid="chat-box">
      <div className={styles.chatHeader} data-testid="chat-header">
        <Text weight="semibold">AI Assistant</Text>
      </div>
      
      <div className={styles.chatMessages} data-testid="chat-messages">
        {messages.map((message, index) => (
          index != 0 && <MessageComponent
            key={index}
            message={message}
            index={index}
            onSave={handleSaveNote}
            styles={styles}
          />
        ))}
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
      />
    </div>
  );
};

export default ChatBox;