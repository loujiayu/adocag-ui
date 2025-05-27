import React from 'react';
import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { SearchBox, Spinner, Combobox, Option, Input, Button } from '@fluentui/react-components';
import { Add24Regular, Delete24Regular } from '@fluentui/react-icons';
import { getApiUrl } from '../config';
import { 
  useSearchStore, 
  Repository, 
  AVAILABLE_API_PROVIDERS, 
  ApiProvider,
  AZURE_OPENAI_MODELS,
  GOOGLE_VERTEX_AI_MODELS,
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
    border: '1px solid transparent',
    transition: 'all 0.2s ease',
  },
  sourceItemError: {
    border: '1px solid var(--colorStatusDangerBackground2)',
  },
  repositoryLoadingSpinner: {
    marginRight: '8px',
  },
  repositoryError: {
    color: 'var(--colorStatusDangerForeground1)',
    fontSize: tokens.fontSizeBase200,
    marginTop: '4px',
  },
  retryButton: {
    marginTop: '8px',
    alignSelf: 'flex-start',
  },
  inputError: {
    ...shorthands.border('1px', 'solid', 'var(--colorStatusDangerBorder2)'),
    backgroundColor: 'var(--colorStatusDangerBackground1)',
    '&:hover': {
      ...shorthands.border('1px', 'solid', 'var(--colorStatusDangerBorder2)'),
    },
    '&:focus-within': {
      ...shorthands.border('1px', 'solid', 'var(--colorStatusDangerBorder2)'),
    },
  },
  validationMessage: {
    color: 'var(--colorStatusDangerForeground1)',
    fontSize: tokens.fontSizeBase200,
    marginTop: '8px',
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
    '& option': {
      position: 'relative',
      '&:hover::after': {
        content: 'attr(title)',
        position: 'absolute',
        top: '100%',
        left: '0',
        backgroundColor: 'var(--colorNeutralBackground2)',
        padding: '8px',
        borderRadius: '4px',
        boxShadow: tokens.shadow4,
        zIndex: 1000,
        whiteSpace: 'pre-line',
        fontSize: tokens.fontSizeBase200,
      }
    }
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
  settingsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '12px',
  },
  temperatureInput: {
    width: '200px',
  },
  loadingState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    color: 'var(--colorNeutralForeground2)',
  },
  error: {
    color: 'var(--colorStatusDangerForeground1)',
    padding: '12px 16px',
    backgroundColor: 'var(--colorStatusDangerBackground1)',
    borderRadius: '4px',
    margin: '0 16px',
  },
  scopeButton: {
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '300px',
    maxWidth: '100%',
    ...shorthands.margin('8px', '0'),
    ...shorthands.padding('0', '16px'),
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
    '&[data-selected="true"]': {
      backgroundColor: 'var(--colorBrandBackground)',
      color: 'var(--colorNeutralForegroundOnBrand)',
    },
  },
});


export interface RepositoryConfig {
  name: string;
  organization: string;
  project: string;
  searchPrefix: string;
  excludedPaths: string[];
  includedPaths: string[];
}

interface ContentAreaProps {}

interface SourceItemProps {
  source: {
    repositories: Repository[];
    query?: string;
  };
  index: number;
  onUpdate: (index: number, updates: Partial<{ repositories: Repository[]; query?: string }>) => void;
  onDelete: (index: number) => void;
  styles: ReturnType<typeof useStyles>;
}

const SourceItem: React.FC<SourceItemProps> = ({ source, index, onUpdate, onDelete, styles }) => {
  const { setScopeLearning } = useSearchStore();
  const [searchQuery, setSearchQuery] = React.useState(source.query || '');
  const [repositories, setRepositories] = React.useState<RepositoryConfig[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const hasValidation = source.repositories.length === 0 || !searchQuery.trim();

  const fetchRepositories = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(getApiUrl('repositories'));
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const repos: RepositoryConfig[] = await response.json();
      setRepositories(repos);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load repositories');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  // Helper function to update and disable scope learning
  const handleUpdate = (updates: Partial<{ repositories: Repository[]; query?: string }>) => {
    setScopeLearning(false);
    onUpdate(index, updates);
  };

  return (
    <div className={`${styles.sourceItem} ${hasValidation ? styles.sourceItemError : ''}`}>
      <div className={styles.sourceHeader}>
        <Combobox
          className={`${styles.combobox} ${source.repositories.length === 0 ? styles.inputError : ''}`}
          multiselect
          placeholder={loading ? "Loading repositories..." : "Select repositories (required)..."}
          selectedOptions={source.repositories}
          value={source.repositories.join(', ')}
          onOptionSelect={(_ev, data) => {
            handleUpdate({ repositories: data.selectedOptions as Repository[] });
          }}
          disabled={loading || !!error}
        >
          {repositories.map((repo) => (
            <Option 
              key={repo.name}
              text={repo.name} 
              value={repo.name}
              title={`Organization: ${repo.organization}\nProject: ${repo.project}\nPrefix: ${repo.searchPrefix}`}
            >
              {repo.name}
            </Option>
          ))}
        </Combobox>
        <div className={styles.sourceActions}>
          <Button
            icon={<Delete24Regular />}
            appearance="subtle"
            className={styles.deleteButton}
            onClick={() => onDelete(index)}
          />
        </div>
      </div>

      {loading && (
        <div className={styles.repositoryLoadingSpinner}>
          <Spinner size="tiny" label="Loading repositories..." />
        </div>
      )}

      {error && (
        <>
          <div className={styles.repositoryError}>
            Failed to load repositories: {error}
          </div>
          <Button
            className={styles.retryButton}
            onClick={fetchRepositories}
          >
            Retry
          </Button>
        </>
      )}

      <div className={styles.header}>
        <SearchBox
          className={`${styles.searchBox} ${!searchQuery.trim() ? styles.inputError : ''}`}
          placeholder="Search a keyword (required)..."
          value={searchQuery}
          onChange={(_, data) => {
            setSearchQuery(data.value);
            handleUpdate({ query: data.value });
          }}
        />
      </div>
      {hasValidation && (
        <div className={styles.validationMessage}>
          {source.repositories.length === 0 && "Please select at least one repository"}
          {source.repositories.length > 0 && !searchQuery.trim() && "Please enter a search query"}
        </div>
      )}
    </div>
  );
};

const ContentArea: React.FC<ContentAreaProps> = () => {
  const styles = useStyles();
  const { 
    isLoading = false, 
    error,
    sources = [],
    processingMessage = '',
    apiProvider,
    gcpProjectName = '',
    gcpRegion = '',
    gcpModel = '',
    azureOpenAIApiKey = '',
    azureOpenAIEndpoint = '',
    azureOpenAIModel = '',
    temperature = 0.7,
    scopeLearning,
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
    setTemperature,
    setScopeLearning,
    setError,
    search 
  } = useSearchStore();

  const handleSubmit = () => {
    // Skip validation if Scope Learning is enabled
    if (!scopeLearning) {
      // Validate that each source has at least one repository and a query
      const invalidSources = sources.filter(source => 
        !source.repositories.length || !source.query?.trim()
      );

      if (invalidSources.length > 0) {
        setError('Each source must have at least one repository selected and a search query');
        return;
      }
    }

    // Clear any previous error
    setError(null);
    search();
  };

  const handleAddSource = () => {
    setScopeLearning(false);
    addSource({
      repositories: [],
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

      {/* Temperature Input */}
      <div className={styles.projectSection}>
        <div>Model Temperature</div>
        <Input
          className={styles.projectInput}
          placeholder="Set temperature (0 to 2)"
          type="number"
          min={0}
          max={2}
          step={0.1}
          value={temperature.toString()}
          onChange={(_e, data) => {
            const temp = parseFloat(data.value);
            if (!isNaN(temp) && temp >= 0 && temp <= 2) {
              setTemperature(temp);
            }
          }}
        />
      </div>

      {/* Scope Learning Button */}
      <div className={styles.projectSection}>
        <Button
          className={styles.scopeButton}
          data-selected={scopeLearning}
          onClick={() => setScopeLearning(!scopeLearning)}
        >
          Scope Learning
        </Button>
      </div>
      
      {/* Sources List */}
      <div className={styles.sourceList}>
        {sources.map((source, index) => (
          <SourceItem
            key={index}
            index={index}
            source={source}
            onUpdate={updateSource}
            onDelete={removeSource}
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

        <Button
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          Submit
        </Button>
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
