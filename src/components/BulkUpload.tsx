import { useState } from 'react';
import {
  Modal,
  Button,
  SpaceBetween,
  Box,
  TextContent,
  Alert,
  FileUpload,
  FormField
} from '@cloudscape-design/components';
import { createItem } from '../graphql/operations';

interface BulkUploadProps {
  visible: boolean;
  onDismiss: () => void;
  onUploadComplete: () => void;
}

interface CSVRow {
  QuestionId: string;
  Question: string;
  responseA: string;
  responseB: string;
  responseC: string;
  responseD: string;
  responseE?: string;
  responseF?: string;
  rationaleA: string;
  rationaleB: string;
  rationaleC: string;
  rationaleD: string;
  rationaleE?: string;
  rationaleF?: string;
  Key?: string;
  Rationale?: string;
  Topic?: string;
  KnowledgeSkills?: string;
  Tags?: string;
  Type?: string;
  Status?: string;
  CreatedDate: string;
}

export function BulkUpload({ visible, onDismiss, onUploadComplete }: BulkUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  function validateCSV(rows: CSVRow[]): string | null {
    if (rows.length === 0) {
      return 'CSV file is empty';
    }

    const requiredFields = ['QuestionId', 'CreatedDate', 'Question', 
      'responseA', 'responseB', 'responseC', 'responseD', 
      'rationaleA', 'rationaleB', 'rationaleC', 'rationaleD'];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // Check for missing required fields
      for (const field of requiredFields) {
        if (!row[field as keyof CSVRow]) {
          return `Row ${i + 1}: Missing required field "${field}"`;
        }
      }
      
      // Validate QuestionId is a valid integer
      if (isNaN(parseInt(row.QuestionId, 10))) {
        return `Row ${i + 1}: QuestionId must be a valid integer`;
      }
      
      // Validate CreatedDate format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(row.CreatedDate)) {
        return `Row ${i + 1}: CreatedDate must be in YYYY-MM-DD format`;
      }

      // Validate Key if provided (should be a single character A-F)
      if (row.Key && row.Key.trim()) {
        const keyChar = row.Key.trim().charAt(0).toUpperCase();
        if (!['A', 'B', 'C', 'D', 'E', 'F'].includes(keyChar)) {
          return `Row ${i + 1}: Key must be a single character (A-F) representing the correct answer`;
        }
      }
      
      // For backward compatibility, also check Rationale field
      if (!row.Key && row.Rationale && row.Rationale.trim()) {
        const firstChar = row.Rationale.trim().charAt(0).toUpperCase();
        if (!['A', 'B', 'C', 'D', 'E', 'F'].includes(firstChar)) {
          return `Row ${i + 1}: Rationale must be a single character (A-F) representing the correct answer if Key is not provided`;
        }
      }
    }

    return null;
  }

  function parseCSV(text: string): CSVRow[] {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',').map(v => v.trim());
      const row = {} as CSVRow;

      headers.forEach((header, index) => {
        row[header as keyof CSVRow] = values[index] || '';
      });

      rows.push(row);
    }

    return rows;
  }

  async function handleUpload() {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);
      setSuccess(false);

      console.log('Starting bulk upload process...');
      
      let text;
      try {
        // Handle both real File objects and test mocks
        text = typeof selectedFile.text === 'function' 
          ? await selectedFile.text() 
          : selectedFile.toString();
        console.log('File content loaded successfully');
      } catch (err) {
        console.error('Error reading file:', err);
        setError(`Error processing file: ${err instanceof Error ? err.message : String(err)}`);
        return;
      }
      
      const rows = parseCSV(text);
      console.log(`Parsed ${rows.length} rows from CSV`);

      const validationError = validateCSV(rows);
      if (validationError) {
        console.error('CSV validation error:', validationError);
        setError(validationError);
        return;
      }
      console.log('CSV validation passed');

      let successCount = 0;
      for (const row of rows) {
        try {
          console.log(`Processing row ${successCount + 1}:`, row);
          
          // Determine the correct answer key
          let correctAnswerKey = row.Key || '';
          
          // For backward compatibility, use Rationale if Key is not provided
          if (!correctAnswerKey && row.Rationale) {
            const firstChar = row.Rationale.trim().charAt(0).toUpperCase();
            if (['A', 'B', 'C', 'D', 'E', 'F'].includes(firstChar)) {
              correctAnswerKey = firstChar;
            }
          }
          
          console.log(`Correct answer key determined: ${correctAnswerKey}`);
          
          const itemToCreate = {
            QuestionId: parseInt(row.QuestionId, 10),
            CreatedDate: row.CreatedDate,
            Question: row.Question,
            responseA: row.responseA,
            responseB: row.responseB,
            responseC: row.responseC,
            responseD: row.responseD,
            responseE: row.responseE,
            responseF: row.responseF,
            rationaleA: row.rationaleA,
            rationaleB: row.rationaleB,
            rationaleC: row.rationaleC,
            rationaleD: row.rationaleD,
            rationaleE: row.rationaleE,
            rationaleF: row.rationaleF,
            Key: correctAnswerKey,
            Rationale: row.Rationale || '',
            Topic: row.Topic || '',
            KnowledgeSkills: row.KnowledgeSkills || '',
            Tags: row.Tags || '',
            Type: row.Type || 'MCQ',
            Status: row.Status || 'Draft'
          };
          
          console.log('Attempting to create item:', itemToCreate);
          
          // Use the updated createItem function
          const result = await createItem(itemToCreate);
          console.log('Item created successfully:', result);
          
          successCount++;
          console.log(`Successfully created ${successCount} items so far`);
        } catch (err) {
          console.error(`Error creating item:`, err);
          setError(`Error uploading row ${successCount + 1}: ${err instanceof Error ? err.message : String(err)}`);
          return;
        }
      }

      console.log(`Bulk upload completed. ${successCount} items created successfully.`);
      setSuccess(true);
      setUploadedCount(successCount);
      setSelectedFile(null);
      onUploadComplete();
    } catch (err) {
      console.error('Unexpected error during bulk upload:', err);
      setError(`Error processing file: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(file: File | null) {
    setSelectedFile(file);
    setError(null);
    setSuccess(false);
  }

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header="Upload Items"
      footer={
        <SpaceBetween direction="horizontal" size="xs">
          <Button onClick={onDismiss} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            loading={uploading}
            disabled={!selectedFile || uploading}
          >
            Upload
          </Button>
        </SpaceBetween>
      }
    >
      <SpaceBetween size="m">
        {error && (
          <div role="alert">
            <Alert type="error">
              {error}
            </Alert>
          </div>
        )}
        {success && (
          <div role="alert">
            <Alert type="success">
              Successfully uploaded {uploadedCount} items
            </Alert>
          </div>
        )}
        <Box>
          <FormField label="Select CSV file">
            <FileUpload
              accept=".csv"
              onChange={({ detail }) => {
                if (detail.value.length > 0) {
                  handleFileSelect(detail.value[0] as unknown as File);
                } else {
                  handleFileSelect(null);
                }
              }}
              value={selectedFile ? [selectedFile] : []}
              i18nStrings={{
                uploadButtonText: () => "Choose file",
                removeFileAriaLabel: (index) => `Remove file ${index + 1}`,
                dropzoneText: () => "Drop CSV file here or"
              }}
              showFileLastModified
              showFileSize
              tokenLimit={1}
              data-testid="csv-file-input"
            />
          </FormField>
        </Box>
        <TextContent>
          <h4>File format requirements:</h4>
          <ul>
            <li>CSV file with headers</li>
            <li>Required fields: QuestionId, CreatedDate, Question, responseA-D, rationaleA-D</li>
            <li>Optional fields: responseE, responseF, rationaleE, rationaleF, Key, Type, Status, Topic, KnowledgeSkills, Tags</li>
            <li>Dates must be in YYYY-MM-DD format</li>
            <li>Key should be a single character (A-F) representing the correct answer</li>
          </ul>
        </TextContent>
      </SpaceBetween>
    </Modal>
  );
} 