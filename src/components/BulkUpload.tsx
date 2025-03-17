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
  responseG?: string;
  responseH?: string;
  rationaleA?: string;
  rationaleB?: string;
  rationaleC?: string;
  rationaleD?: string;
  rationaleE?: string;
  rationaleF?: string;
  rationaleG?: string;
  rationaleH?: string;
  Key?: string;
  Rationale?: string;
  Topic?: string;
  KnowledgeSkills?: string;
  Tags?: string;
  Type?: string;
  Status?: string;
  CreatedDate: string;
}

// Define a mapping of lowercase header names to their proper case versions
const headerMapping: Record<string, keyof CSVRow> = {
  'questionid': 'QuestionId',
  'createddate': 'CreatedDate',
  'question': 'Question',
  'responsea': 'responseA',
  'responseb': 'responseB',
  'responsec': 'responseC',
  'responsed': 'responseD',
  'responsee': 'responseE',
  'responsef': 'responseF',
  'responseg': 'responseG',
  'responseh': 'responseH',
  'rationalea': 'rationaleA',
  'rationaleb': 'rationaleB',
  'rationalec': 'rationaleC',
  'rationaled': 'rationaleD',
  'rationalee': 'rationaleE',
  'rationalef': 'rationaleF',
  'rationaleg': 'rationaleG',
  'rationaleh': 'rationaleH',
  'key': 'Key',
  'rationale': 'Rationale',
  'topic': 'Topic',
  'knowledgeskills': 'KnowledgeSkills',
  'tags': 'Tags',
  'type': 'Type',
  'status': 'Status'
};

// Define the expected headers
const expectedHeaders = [
  'QuestionId', 'CreatedDate', 'Question', 'Type', 'Status',
  'responseA', 'responseB', 'responseC', 'responseD', 'responseE', 'responseF', 'responseG', 'responseH',
  'rationaleA', 'rationaleB', 'rationaleC', 'rationaleD', 'rationaleE', 'rationaleF', 'rationaleG', 'rationaleH',
  'Key', 'Rationale', 'Topic', 'KnowledgeSkills', 'Tags'
];

// Define required headers
const requiredHeaders = [
  'QuestionId', 'CreatedDate', 'Question', 
  'responseA', 'responseB', 'responseC', 'responseD'
];

interface BatchResult {
  success: boolean;
  rowIndex: number;
  error?: string;
}

export function BulkUpload({ visible, onDismiss, onUploadComplete }: BulkUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  function validateCSV(rows: CSVRow[], rawHeaders: string[]): string | null {
    if (rows.length === 0) {
      return 'CSV file is empty';
    }

    // Check for missing required headers
    const normalizedHeaders = rawHeaders.map(h => h.toLowerCase());
    const missingRequiredHeaders = requiredHeaders.filter(header => {
      const lowerHeader = header.toLowerCase();
      
      // Check if the raw header exists as-is or via the mapping
      const headerExists = normalizedHeaders.some(h => {
        // Direct match with lowercase header
        if (h === lowerHeader) return true;
        
        // Check if this normalized header maps to our required header
        const mappedHeader = headerMapping[h];
        return mappedHeader === header;
      });
      
      return !headerExists;
    });

    if (missingRequiredHeaders.length > 0) {
      return `Missing required headers: ${missingRequiredHeaders.join(', ')}\n\nActual Headers: ${rawHeaders.join(', ')}\n\nExpected Headers: ${expectedHeaders.join(', ')}`;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // Check for missing required fields
      for (const field of requiredHeaders) {
        if (!row[field as keyof CSVRow]) {
          return `Row ${i + 1}: Missing required field "${field}"`;
        }
      }
      
      // Validate QuestionId is a valid integer
      if (isNaN(parseInt(row.QuestionId, 10))) {
        return `Row ${i + 1}: QuestionId must be a valid integer. Received: "${row.QuestionId}"`;
      }
      
      // Validate CreatedDate is not empty
      if (!row.CreatedDate || row.CreatedDate.trim() === '') {
        return `Row ${i + 1}: CreatedDate cannot be empty`;
      }

      // Validate Key if provided (should be 1-3 characters consisting of A-H)
      if (row.Key && row.Key.trim()) {
        const key = row.Key.trim().toUpperCase();
        if (key.length < 1 || key.length > 3) {
          return `Row ${i + 1}: Key must be 1-3 characters long. Received: "${key}" (${key.length} characters)`;
        }
        
        // Check if all characters in the key are valid (A-H)
        const invalidChars = [];
        for (const char of key) {
          if (!['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].includes(char)) {
            invalidChars.push(char);
          }
        }
        
        if (invalidChars.length > 0) {
          return `Row ${i + 1}: Key can only contain characters A-H. Received: "${key}" with invalid characters: "${invalidChars.join(', ')}"`;
        }
        
        // For MCQ, ensure exactly one character is provided
        if (row.Type === 'MCQ' && key.length !== 1) {
          return `Row ${i + 1}: MCQ questions must have exactly 1 correct answer in Key. Received: "${key}" (${key.length} characters)`;
        }
        
        // Validate that the Key refers to actual options that exist
        const responseOptions = ['responseA', 'responseB', 'responseC', 'responseD', 'responseE', 'responseF', 'responseG', 'responseH'];
        const missingOptions = [];
        
        for (const char of key) {
          const responseIndex = char.charCodeAt(0) - 65; // 'A' = 0, 'B' = 1, etc.
          if (responseIndex >= 0 && responseIndex < responseOptions.length) {
            const optionKey = responseOptions[responseIndex] as keyof CSVRow;
            if (!row[optionKey] || row[optionKey].trim() === '') {
              missingOptions.push(char);
            }
          }
        }
        
        if (missingOptions.length > 0) {
          return `Row ${i + 1}: Key "${key}" refers to missing response options: ${missingOptions.join(', ')}. Please ensure all referenced options have content.`;
        }
      }
      
      // For backward compatibility, also check Rationale field
      if (!row.Key && row.Rationale && row.Rationale.trim()) {
        const firstChars = row.Rationale.trim().substring(0, Math.min(3, row.Rationale.length)).toUpperCase();
        
        // Check if the first 1-3 characters could be a valid key
        let validKey = true;
        for (const char of firstChars) {
          if (!['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].includes(char)) {
            validKey = false;
            break;
          }
        }
        
        // If not a valid key, assume it's just a rationale and not a key
        if (validKey) {
          // Use the first 1-3 characters as the key
          row.Key = firstChars;
        }
      }
    }

    return null;
  }

  function parseCSV(text: string): { rows: CSVRow[], rawHeaders: string[] } {
    const lines = text.split('\n');
    if (lines.length === 0) return { rows: [], rawHeaders: [] };
    
    // Handle potential BOM character at the beginning of the file
    let firstLine = lines[0];
    if (firstLine.charCodeAt(0) === 0xFEFF) {
      firstLine = firstLine.slice(1);
    }
    
    // Parse headers, handling potential quotes
    const rawHeaders = firstLine.split(',').map(h => {
      const trimmed = h.trim();
      // Remove quotes if present
      return trimmed.startsWith('"') && trimmed.endsWith('"') 
        ? trimmed.slice(1, -1).trim() 
        : trimmed;
    });
    
    // Map raw headers to proper case headers using the headerMapping
    const headers: string[] = rawHeaders.map(header => {
      const lowerHeader = header.toLowerCase();
      return headerMapping[lowerHeader] || header;
    });
    
    console.log('CSV Headers (normalized):', headers);
    console.log('Raw CSV Headers:', rawHeaders);
    
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Simple CSV parsing - doesn't handle quoted commas properly
      // For a production app, consider using a CSV parsing library
      const values = line.split(',').map(v => {
        const trimmed = v.trim();
        // Remove quotes if present
        return trimmed.startsWith('"') && trimmed.endsWith('"') 
          ? trimmed.slice(1, -1).trim() 
          : trimmed;
      });
      
      // Skip if we don't have enough values
      if (values.length < headers.length / 2) {
        console.warn(`Skipping row ${i} due to insufficient values`);
        continue;
      }
      
      const row = {} as CSVRow;

      headers.forEach((header, index) => {
        if (index < values.length) {
          row[header as keyof CSVRow] = values[index];
        } else {
          // Set empty string for missing values
          row[header as keyof CSVRow] = '';
        }
      });

      rows.push(row);
    }

    return { rows, rawHeaders };
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
      
      const { rows, rawHeaders } = parseCSV(text);
      console.log(`Parsed ${rows.length} rows from CSV`);
      
      if (rows.length === 0) {
        setError('No valid rows found in the CSV file. Please check the file format.');
        return;
      }

      const validationError = validateCSV(rows, rawHeaders);
      if (validationError) {
        console.error('CSV validation error:', validationError);
        setError(validationError);
        return;
      }
      console.log('CSV validation passed');

      let successCount = 0;
      let errors: string[] = [];
      
      // Process rows in batches to avoid overwhelming the API
      const batchSize = 5;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const batchPromises = batch.map(async (row, batchIndex) => {
          const rowIndex = i + batchIndex;
          try {
            console.log(`Processing row ${rowIndex + 1}:`, row);
            
            // Determine the correct answer key
            let correctAnswerKey = row.Key || '';
            
            // For backward compatibility, use Rationale if Key is not provided
            if (!correctAnswerKey && row.Rationale) {
              const firstChar = row.Rationale.trim().charAt(0).toUpperCase();
              if (['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].includes(firstChar)) {
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
              responseE: row.responseE || '',
              responseF: row.responseF || '',
              responseG: row.responseG || '',
              responseH: row.responseH || '',
              rationaleA: row.rationaleA || '',
              rationaleB: row.rationaleB || '',
              rationaleC: row.rationaleC || '',
              rationaleD: row.rationaleD || '',
              rationaleE: row.rationaleE || '',
              rationaleF: row.rationaleF || '',
              rationaleG: row.rationaleG || '',
              rationaleH: row.rationaleH || '',
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
            
            return { success: true, rowIndex } as BatchResult;
          } catch (err) {
            console.error(`Error creating item at row ${rowIndex + 1}:`, err);
            return { 
              success: false, 
              rowIndex, 
              error: err instanceof Error ? err.message : String(err) 
            } as BatchResult;
          }
        });
        
        // Wait for all items in the batch to be processed
        const batchResults = await Promise.all(batchPromises);
        
        // Count successes and collect errors
        batchResults.forEach(result => {
          if (result.success) {
            successCount++;
          } else if (result.error) {
            errors.push(`Row ${result.rowIndex + 1}: ${result.error}`);
          }
        });
        
        console.log(`Batch processed. Total successful: ${successCount}, Errors: ${errors.length}`);
      }

      console.log(`Bulk upload completed. ${successCount} items created successfully.`);
      
      if (successCount > 0) {
        setSuccess(true);
        setUploadedCount(successCount);
        
        if (errors.length > 0) {
          // Some items succeeded, some failed
          setError(`Successfully uploaded ${successCount} items, but ${errors.length} items failed. First error: ${errors[0]}`);
        }
      } else if (errors.length > 0) {
        // All items failed
        setError(`Failed to upload any items. First error: ${errors[0]}`);
      }
      
      setSelectedFile(null);
      
      if (successCount > 0) {
        onUploadComplete();
      }
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
            <li>Required fields: QuestionId, CreatedDate, Question, responseA-D</li>
            <li>Optional fields: rationaleA-H, responseE-H, Key, Type, Status, Topic, KnowledgeSkills, Tags</li>
            <li>Dates must be in YYYY-MM-DD format</li>
            <li>Key should be 1-3 characters long and consist of A-H</li>
          </ul>
        </TextContent>
      </SpaceBetween>
    </Modal>
  );
} 