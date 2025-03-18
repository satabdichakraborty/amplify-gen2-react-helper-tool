import { useState } from 'react';
import Tabs from '@cloudscape-design/components/tabs';
import FormField from '@cloudscape-design/components/form-field';
import TextArea from '@cloudscape-design/components/textarea';
import { RationaleDisplay } from './RationaleDisplay';

/**
 * EditableRationale component provides a tabbed interface for editing and previewing 
 * rationale text with support for clickable links in the preview.
 */
export function EditableRationale({ 
  value, 
  onChange, 
  label = "Explanation",
  description = "Provide a general explanation for the correct answer and overall context",
  rows = 6
}: { 
  value: string; 
  onChange: (newValue: string) => void; 
  label?: string;
  description?: string;
  rows?: number;
}) {
  const [activeTab, setActiveTab] = useState<string>("editor");
  
  return (
    <Tabs
      onChange={({ detail }) => setActiveTab(detail.activeTabId)}
      activeTabId={activeTab}
      tabs={[
        {
          id: "editor",
          label: "Editor",
          content: (
            <FormField
              label={label}
              description={description}
              stretch
            >
              <div style={{ width: '100%' }}>
                <TextArea
                  value={value}
                  onChange={({ detail }) => onChange(detail.value)}
                  rows={rows}
                />
              </div>
            </FormField>
          )
        },
        {
          id: "preview",
          label: "Preview with Links",
          content: (
            <div>
              <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>{label}</div>
              <div style={{ 
                padding: '8px',
                border: '1px solid #eaeded',
                borderRadius: '4px',
                backgroundColor: '#f2f3f3',
                minHeight: `${rows * 24}px` 
              }}>
                {value ? (
                  <RationaleDisplay text={value} />
                ) : (
                  <div style={{ color: '#5f6b7a', fontStyle: 'italic' }}>No content to preview</div>
                )}
              </div>
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#5f6b7a' }}>
                {description}
              </div>
            </div>
          )
        }
      ]}
    />
  );
} 