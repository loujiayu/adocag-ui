import React from 'react';
import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { SearchBox, Spinner, Combobox, Option, Input, Button } from '@fluentui/react-components';
import { Add24Regular, Delete24Regular } from '@fluentui/react-icons';
import { 
  useSearchStore, 
  AVAILABLE_REPOSITORIES, 
  Repository, 
  AVAILABLE_API_PROVIDERS, 
  ApiProvider,
  AZURE_OPENAI_MODELS,
  GOOGLE_VERTEX_AI_MODELS,
  SourceConfig
} from '../store/searchStore';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'var(--colorNeutralBackground1)',
    overflowY: 'auto',
  },
  title: {
    ...shorthands.padding('16px', '16px', '8px'),
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    color: 'var(--colorNeutralForeground1)',
  },
  header: {
    ...shorthands.padding('12px', '16px'),
    borderBottom: `1px solid var(--colorNeutralStroke1)`,
    backgroundColor: 'var(--colorNeutralBackground2)',
  },
  searchBox: {
    width: '100%',
  },
  suggestions: {
    ...shorthands.padding('8px', '16px'),
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    borderBottom: `1px solid var(--colorNeutralStroke1)`,
  },
  suggestionChip: {
    ...shorthands.padding('4px', '12px'),
    ...shorthands.borderRadius('16px'),
    backgroundColor: 'var(--colorNeutralBackground3)',
    border: '1px solid var(--colorNeutralStroke1)',
    fontSize: tokens.fontSizeBase200,
    color: 'var(--colorNeutralForeground1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'var(--colorNeutralBackground3Hover)',
      transform: 'translateY(-1px)',
    },
  },
  results: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
    ...shorthands.padding('8px'),
  },
  sourceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    ...shorthands.padding('16px'),
  },
  sourceItem: {
    backgroundColor: 'var(--colorNeutralBackground2)',
    ...shorthands.borderRadius('8px'),
    ...shorthands.padding('16px'),
    boxShadow: tokens.shadow4,
  },
  sourceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  addSourceButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    ...shorthands.padding('8px', '16px'),
    ...shorthands.borderRadius('4px'),
    backgroundColor: 'var(--colorBrandBackground)',
    color: 'var(--colorNeutralForegroundOnBrand)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'var(--colorBrandBackgroundHover)',
    },
  },
  sourceActions: {
    display: 'flex',
    gap: '8px',
  },
  deleteButton: {
    color: 'var(--colorStatusDangerForeground1)',
    '&:hover': {
      backgroundColor: 'var(--colorStatusDangerBackground1)',
    },
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    ...shorthands.padding('12px', '24px'),
    ...shorthands.margin('16px', '0'),
    ...shorthands.borderRadius('4px'),
    backgroundColor: 'var(--colorBrandBackground)',
    color: 'var(--colorNeutralForegroundOnBrand)',
    border: 'none',
    cursor: 'pointer',
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'var(--colorBrandBackgroundHover)',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    '&:disabled': {
      backgroundColor: 'var(--colorNeutralBackgroundDisabled)',
      color: 'var(--colorNeutralForegroundDisabled)',
      cursor: 'not-allowed',
      transform: 'none',
    },
  },
  combobox: {
    width: '300px',
    maxWidth: '100%',
  },
  projectSection: {
    ...shorthands.padding('12px', '16px'),
    borderBottom: `1px solid var(--colorNeutralStroke1)`,
    backgroundColor: 'var(--colorNeutralBackground2)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  projectInput: {
    width: '300px',
    maxWidth: '100%',
  },
});

interface ContentAreaProps {}

interface SourceItemProps {
  source: SourceConfig;
  onUpdate: (id: string, updates: Partial<SourceConfig>) => void;
  onDelete: (id: string) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  styles: ReturnType<typeof useStyles>;
}

const suggestions = [
  "Campaign",
  "Ad",
  "Video",
  "Image",
];

const SourceItem: React.FC<SourceItemProps> = ({ source, onUpdate, onDelete, onSearch, searchQuery, styles }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearch(searchQuery);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSearch(suggestion);
  };

  return (
    <div className={styles.sourceItem}>
      <div className={styles.sourceHeader}>
        <Combobox
          className={styles.combobox}
          multiselect
          placeholder="Select repositories..."
          selectedOptions={source.repositories}
          value={source.repositories.join(', ')}
          onOptionSelect={(_ev, data) => {
            onUpdate(source.id, { repositories: data.selectedOptions as Repository[] });
          }}
        >
          {AVAILABLE_REPOSITORIES.map((repo) => (
            <Option key={repo} text={repo} value={repo}>
              {repo}
            </Option>
          ))}
        </Combobox>
        <div className={styles.sourceActions}>
          <Button
            icon={<Delete24Regular />}
            appearance="subtle"
            className={styles.deleteButton}
            onClick={() => onDelete(source.id)}
          />
        </div>
      </div>

      <div className={styles.header}>
        <SearchBox
          className={styles.searchBox}
          placeholder="Search a topic..."
          value={searchQuery}
          onChange={(_, data) => onSearch(data.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className={styles.suggestions}>
        {suggestions.map((suggestion) => (
          <div
            key={suggestion}
            className={styles.suggestionChip}
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </div>
        ))}
      </div>
    </div>
  );
};

const ContentArea: React.FC<ContentAreaProps> = () => {
  const styles = useStyles();
  const { 
    searchQuery, 
    isLoading, 
    error,
    sources,
    processingMessage,
    apiProvider,
    gcpProjectName,
    gcpRegion,
    gcpModel,
    azureOpenAIApiKey,
    azureOpenAIEndpoint,
    azureOpenAIModel,
    setSearchQuery,
    addSource,
    updateSource,
    removeSource,
    setApiProvider,
    setGcpProjectName,
    setGcpRegion,
    setGcpModel,
    setAzureOpenAIApiKey,
    setAzureOpenAIEndpoint,
    setAzureOpenAIModel,
    search 
  } = useSearchStore();

  const handleSubmit = () => {
    if (sources.length > 0) {
      search();
    }
  };

  const handleAddSource = () => {
    addSource({
      repositories: ['AdsAppsCampaignUI'],
    });
  };

  return (
    <div className={styles.root} data-testid="content-area">
      <div className={styles.title}>Sources</div>

      {/* Global API Provider Selection */}
      <div className={styles.header}>
        <Combobox
          className={styles.combobox}
          placeholder="Select API provider..."
          selectedOptions={[apiProvider]}
          value={apiProvider}
          onOptionSelect={(_ev, data) => {
            if (data.optionValue) {
              setApiProvider(data.optionValue as ApiProvider);
            }
          }}
        >
          {AVAILABLE_API_PROVIDERS.map((provider) => (
            <Option key={provider} text={provider} value={provider}>
              {provider}
            </Option>
          ))}
        </Combobox>
      </div>

      {/* Provider-specific settings */}
      {apiProvider === 'Azure OpenAI' && (
        <div className={styles.projectSection}>
          <Input
            className={styles.projectInput}
            placeholder="Enter Azure OpenAI API Key..."
            value={azureOpenAIApiKey}
            onChange={(_e, data) => setAzureOpenAIApiKey(data.value)}
            type="password"
          />
          <Input
            className={styles.projectInput}
            placeholder="Enter Azure OpenAI Endpoint..."
            value={azureOpenAIEndpoint}
            onChange={(_e, data) => setAzureOpenAIEndpoint(data.value)}
          />
          <Combobox
            className={styles.projectInput}
            placeholder="Select Azure OpenAI Model..."
            selectedOptions={azureOpenAIModel ? [azureOpenAIModel] : []}
            value={azureOpenAIModel}
            onOptionSelect={(_ev, data) => {
              if (data.optionValue) {
                setAzureOpenAIModel(data.optionValue);
              }
            }}
          >
            {AZURE_OPENAI_MODELS.map((model) => (
              <Option key={model} text={model} value={model}>
                {model}
              </Option>
            ))}
          </Combobox>
        </div>
      )}

      {apiProvider === 'Google Vertex AI' && (
        <div className={styles.projectSection}>
          <Input
            className={styles.projectInput}
            placeholder="Enter Google Cloud Project Id..."
            value={gcpProjectName}
            onChange={(_e, data) => setGcpProjectName(data.value)}
            type="password"
          />
          <Input
            className={styles.projectInput}
            placeholder="Enter Google Cloud Region..."
            value={gcpRegion}
            onChange={(_e, data) => setGcpRegion(data.value)}
          />
          <Combobox
            className={styles.projectInput}
            placeholder="Select Google Vertex AI Model..."
            selectedOptions={gcpModel ? [gcpModel] : []}
            value={gcpModel}
            onOptionSelect={(_ev, data) => {
              if (data.optionValue) {
                setGcpModel(data.optionValue);
              }
            }}
          >
            {GOOGLE_VERTEX_AI_MODELS.map((model) => (
              <Option key={model} text={model} value={model}>
                {model}
              </Option>
            ))}
          </Combobox>
        </div>
      )}
      
      {/* Sources List */}
      <div className={styles.sourceList}>
        {sources.map((source) => (
          <SourceItem
            key={source.id}
            source={source}
            onUpdate={updateSource}
            onDelete={removeSource}
            onSearch={setSearchQuery}
            searchQuery={searchQuery}
            styles={styles}
          />
        ))}
        
        <Button
          className={styles.addSourceButton}
          icon={<Add24Regular />}
          onClick={handleAddSource}
        >
          Add Source
        </Button>

        {sources.length > 0 && (
          <Button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            Submit
          </Button>
        )}
      </div>

      {isLoading && (
        <div className={styles.loadingState}>
          <Spinner size="small" label={processingMessage || "Searching..."} />
        </div>
      )}
      
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ContentArea;
