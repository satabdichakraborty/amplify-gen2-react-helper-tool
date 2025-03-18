import FormField from '@cloudscape-design/components/form-field';
import TextArea from '@cloudscape-design/components/textarea';

/**
 * EditableRationale component provides an interface for editing
 * rationale text.
 */
export function EditableRationale({ 
  value, 
  onChange, 
  label = "Explanation",
  rows = 6
}: { 
  value: string; 
  onChange: (newValue: string) => void; 
  label?: string;
  rows?: number;
}) {
  return (
    <FormField
      label={label}
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
  );
} 