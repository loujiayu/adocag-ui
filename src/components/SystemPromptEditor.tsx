import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { 
  Dialog, 
  DialogTrigger, 
  DialogSurface, 
  DialogTitle, 
  DialogBody, 
  DialogContent, 
  DialogActions,
  Button,
  Textarea,
  Combobox,
  Option,
  Label,
  makeStyles,
} from '@fluentui/react-components';
import { Settings24Regular, DismissRegular } from '@fluentui/react-icons';
import { useSearchStore, AssistantRole, ASSISTANT_ROLES, SYSTEM_PROMPTS } from '../store/searchStore';

const useStyles = makeStyles({
  editPromptButton: {
    marginLeft: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    height: '32px',
    paddingLeft: '8px',
    paddingRight: '8px',
  },
  promptEditorContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  promptEditorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  promptRoleSelector: {
    minWidth: '200px',
  },
  promptTextarea: {
    minHeight: '200px',
  },
  closeButton: {
    position: 'absolute',
    top: '12px',
    right: '12px',
  },
});

interface SystemPromptEditorProps {
  role: AssistantRole;
  setRole: (role: AssistantRole) => void;
}

const SystemPromptEditor: React.FC<SystemPromptEditorProps> = ({ role, setRole }) => {
  const styles = useStyles();
  const { updateSystemPrompt, resetSystemPrompt, resetAllSystemPrompts } = useSearchStore();
  const [promptText, setPromptText] = useState(SYSTEM_PROMPTS[role]);
  const [isOpen, setIsOpen] = useState(false);

  // Update local state when role changes
  useEffect(() => {
    setPromptText(SYSTEM_PROMPTS[role]);
  }, [role]);

  const handleSave = useCallback(() => {
    updateSystemPrompt(role, promptText);
    setIsOpen(false);
  }, [role, promptText, updateSystemPrompt]);

  const handleReset = useCallback(() => {
    resetSystemPrompt(role);
    setPromptText(SYSTEM_PROMPTS[role]);
  }, [role, resetSystemPrompt]);

  const handleResetAll = useCallback(() => {
    resetAllSystemPrompts();
    setPromptText(SYSTEM_PROMPTS[role]);
  }, [role, resetAllSystemPrompts]);

  const handlePromptChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setPromptText(e.target.value);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(_event, data) => setIsOpen(data.open)}>
      <DialogTrigger>
        <Button 
          appearance="subtle" 
          icon={<Settings24Regular />} 
          size="small"
          title="Edit system prompt"
          data-testid="edit-prompt-button"
          className={styles.editPromptButton}
        >
          Edit Prompt
        </Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            Customize System Prompt
            <Button
              appearance="subtle"
              icon={<DismissRegular />}
              onClick={() => setIsOpen(false)}
              className={styles.closeButton}
            />
          </DialogTitle>
          <DialogContent className={styles.promptEditorContent}>
            <div className={styles.promptEditorHeader}>
              <Label htmlFor="role-selector">Select role:</Label>
              <Combobox
                id="role-selector"
                className={styles.promptRoleSelector}
                value={role}
                onOptionSelect={(_ev, data) => {
                  if (data.optionValue) {
                    setRole(data.optionValue as AssistantRole);
                  }
                }}
              >
                {ASSISTANT_ROLES.map((r) => (
                  <Option key={r} text={r} value={r}>
                    {r}
                  </Option>
                ))}
              </Combobox>
            </div>
            <Label htmlFor="system-prompt-editor">System prompt:</Label>
            <Textarea
              id="system-prompt-editor"
              className={styles.promptTextarea}
              value={promptText}
              onChange={handlePromptChange}
              resize="vertical"
              rows={10}
            />
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={handleReset}>
              Reset This Prompt
            </Button>
            <Button appearance="secondary" onClick={handleResetAll}>
              Reset All Prompts
            </Button>
            <Button appearance="primary" onClick={handleSave}>
              Save
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default SystemPromptEditor;
