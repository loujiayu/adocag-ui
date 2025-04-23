import React from 'react';
import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { SearchBox, Spinner, Combobox, Option, Input } from '@fluentui/react-components';
import { 
  useSearchStore, 
  AVAILABLE_REPOSITORIES, 
  Repository, 
  AVAILABLE_API_PROVIDERS, 
  ApiProvider,
  AZURE_OPENAI_MODELS,
  GOOGLE_VERTEX_AI_MODELS
} from '../store/searchStore';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'var(--colorNeutralBackground1)',
  },
  header: {
    ...shorthands.padding('12px', '16px'),
    borderBottom: `1px solid var(--colorNeutralStroke1)`,
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
  resultItem: {
    ...shorthands.padding('12px'),
    backgroundColor: 'var(--colorNeutralBackground2)',
    ...shorthands.borderRadius('6px'),
    boxShadow: tokens.shadow4,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateX(2px)',
      boxShadow: tokens.shadow8,
    },
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('6px'),
    color: 'var(--colorNeutralForeground2)',
    fontSize: tokens.fontSizeBase200,
    marginBottom: '6px',
  },
  codeContent: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    backgroundColor: 'var(--colorNeutralBackground3)',
    ...shorthands.padding('8px'),
    ...shorthands.borderRadius('4px'),
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    maxHeight: '200px',
  },
  loadingState: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...shorthands.padding('16px'),
    color: 'var(--colorNeutralForeground2)',
  },
  error: {
    color: 'var(--colorStatusDangerForeground1)',
    ...shorthands.padding('8px', '12px'),
    ...shorthands.borderRadius('4px'),
    backgroundColor: 'var(--colorStatusDangerBackground1)',
    fontSize: tokens.fontSizeBase200,
  },
  repositoryOptions: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '12px',
    ...shorthands.padding('12px', '16px'),
    backgroundColor: 'var(--colorNeutralBackground2)',
    borderBottom: `1px solid var(--colorNeutralStroke1)`,
  },
  checkbox: {
    minWidth: '150px',
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

const ContentArea: React.FC = () => {
  const styles = useStyles();
  const { 
    searchQuery, 
    isLoading, 
    error, 
    selectedRepositories,
    gcpProjectName,
    gcpRegion,
    gcpModel,
    apiProvider,
    azureOpenAIApiKey,
    azureOpenAIEndpoint,
    azureOpenAIModel,
    setSearchQuery, 
    setSelectedRepositories,
    setGcpProjectName,
    setGcpRegion,
    setGcpModel,
    setApiProvider,
    setAzureOpenAIApiKey,
    setAzureOpenAIEndpoint,
    setAzureOpenAIModel,
    search 
  } = useSearchStore();

  const suggestions = [
    "Campaign",
    "Asset",
    "Video",
    "Image",
    "Report"
  ];

  const handleRepositoryChange = (_ev: any, data: { selectedOptions: string[] }) => {
    setSelectedRepositories(data.selectedOptions as Repository[]);
  };

  const handleApiProviderChange = (_ev: any, data: { optionValue: string }) => {
    setApiProvider(data.optionValue as ApiProvider);
  };

  const handleAzureModelChange = (_ev: any, data: { optionValue: string }) => {
    setAzureOpenAIModel(data.optionValue);
  };

  const handleGcpModelChange = (_ev: any, data: { optionValue: string }) => {
    setGcpModel(data.optionValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      search();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    search();
  };

  return (
    <div className={styles.root} data-testid="content-area">
      <div className={styles.repositoryOptions} data-testid="repository-options">
        <Combobox
          className={styles.combobox}
          multiselect
          placeholder="Select repositories..."
          selectedOptions={selectedRepositories}
          value={selectedRepositories.join(', ')}
          onOptionSelect={handleRepositoryChange}
        >
          {AVAILABLE_REPOSITORIES.map((repo) => (
            <Option key={repo} text={repo} value={repo}>
              {repo}
            </Option>
          ))}
        </Combobox>
      </div>
      <div className={styles.header} data-testid="content-header">
        <SearchBox
          className={styles.searchBox}
          placeholder="Search a topic..."
          value={searchQuery}
          onChange={(_, data) => setSearchQuery(data.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className={styles.suggestions} data-testid="search-suggestions">
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
      <div className={styles.repositoryOptions} data-testid="api-provider-options">
        <Combobox
          className={styles.combobox}
          placeholder="Select API provider..."
          selectedOptions={[apiProvider]}
          value={apiProvider}
          onOptionSelect={handleApiProviderChange}
        >
          {AVAILABLE_API_PROVIDERS.map((provider) => (
            <Option key={provider} text={provider} value={provider}>
              {provider}
            </Option>
          ))}
        </Combobox>
      </div>
      
      {apiProvider === 'Azure OpenAI' && (
        <div className={styles.projectSection} data-testid="azure-openai-section">
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
            onOptionSelect={handleAzureModelChange}
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
        <div className={styles.projectSection} data-testid="project-section">
          <Input
            className={styles.projectInput}
            placeholder="Enter Google Cloud Project Id..."
            value={gcpProjectName}
            type="password"
            onChange={(_e, data) => setGcpProjectName(data.value)}
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
            onOptionSelect={handleGcpModelChange}
          >
            {GOOGLE_VERTEX_AI_MODELS.map((model) => (
              <Option key={model} text={model} value={model}>
                {model}
              </Option>
            ))}
          </Combobox>
        </div>
      )}
      <div className={styles.results} data-testid="content-main">
        {isLoading && (
          <div className={styles.loadingState}>
            <Spinner size="small" label="Searching..." />
          </div>
        )}
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentArea;