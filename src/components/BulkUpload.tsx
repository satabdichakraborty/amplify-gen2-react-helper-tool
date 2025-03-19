import { useState, useEffect } from 'react';
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
  CreatedBy?: string;
  Notes?: string;
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
  'status': 'Status',
  'createdby': 'CreatedBy',
  'notes': 'Notes',
  // Adding mappings for common real-world data formats with spaces
  'response a': 'responseA',
  'response b': 'responseB',
  'response c': 'responseC',
  'response d': 'responseD',
  'response e': 'responseE',
  'response f': 'responseF',
  'response g': 'responseG',
  'response h': 'responseH',
  'rationale a': 'rationaleA',
  'rationale b': 'rationaleB',
  'rationale c': 'rationaleC',
  'rationale d': 'rationaleD',
  'rationale e': 'rationaleE',
  'rationale f': 'rationaleF',
  'rationale g': 'rationaleG',
  'rationale h': 'rationaleH',
  'created date': 'CreatedDate',
  'created by': 'CreatedBy',
  'knowledge skills': 'KnowledgeSkills',
  'question id': 'QuestionId',
  // Add common variations with different capitalization
  'ResponseA': 'responseA',
  'ResponseB': 'responseB',
  'ResponseC': 'responseC',
  'ResponseD': 'responseD',
  'ResponseE': 'responseE',
  'ResponseF': 'responseF',
  'ResponseG': 'responseG',
  'ResponseH': 'responseH',
  'RationaleA': 'rationaleA',
  'RationaleB': 'rationaleB',
  'RationaleC': 'rationaleC',
  'RationaleD': 'rationaleD',
  'RationaleE': 'rationaleE',
  'RationaleF': 'rationaleF',
  'RationaleG': 'rationaleG',
  'RationaleH': 'rationaleH',
  'QuestionID': 'QuestionId',
  'CreatedBy': 'CreatedBy'
};

// Define required headers
const requiredHeaders = [
  'QuestionId', 'CreatedDate', 'Question', 
  'responseA', 'responseB'
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

  // Expose the component instance for testing
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      (window as any).bulkUploadInstance = {
        handleUpload
      };
    }
    return () => {
      if (process.env.NODE_ENV === 'test') {
        delete (window as any).bulkUploadInstance;
      }
    };
  }, []);

  function validateCSV(rows: CSVRow[], rawHeaders: string[]): string | null {
    if (rows.length === 0) {
      return 'CSV file is empty';
    }

    // Check for missing required headers
    const normalizedHeaders = rawHeaders.map(h => h.toLowerCase().trim());
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
      // Provide a more helpful error message with possible mappings
      let errorMessage = `Missing required headers: ${missingRequiredHeaders.join(', ')}\n\n`;
      
      // Suggest possible matches for each missing header
      missingRequiredHeaders.forEach(missingHeader => {
        const possible = Object.entries(headerMapping)
          .filter(([_, value]) => value === missingHeader)
          .map(([key]) => key);
        
        if (possible.length > 0) {
          errorMessage += `For "${missingHeader}", we accept: ${possible.join(', ')}\n`;
        }
      });
      
      errorMessage += `\nActual Headers: ${rawHeaders.join(', ')}\n\n`;
      errorMessage += `Required Headers: ${requiredHeaders.join(', ')}`;
      
      return errorMessage;
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
        for (const char of key) {
          if (!"ABCDEFGH".includes(char)) {
            return `Row ${i + 1}: Key can only contain characters A-H. Received: "${key}" with invalid characters: "${key.split('').filter(c => !"ABCDEFGH".includes(c)).join('')}"`;
          }
        }
        
        // For Multiple Choice (MCQ), only 1 character is allowed
        if (row.Type === 'Multiple Choice' && key.length > 1) {
          return `Row ${i + 1}: Multiple Choice questions can only have one correct answer. Received key: "${key}" (${key.length} characters)`;
        }
      }
      
      // If Key is not provided, check if the first character of the Rationale field could be a valid Key
      if ((!row.Key || row.Key.trim() === '') && row.Rationale) {
        const firstChars = row.Rationale.trim().substring(0, Math.min(3, row.Rationale.trim().length)).toUpperCase();
        
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

      // Ensure Type is either "Multiple Choice" or "Multiple Response" if provided
      if (row.Type && row.Type.trim() !== '') {
        const type = row.Type.trim();
        if (type !== 'Multiple Choice' && type !== 'Multiple Response') {
          // Convert potentially different formats to standard ones
          if (type.toLowerCase().includes('choice')) {
            row.Type = 'Multiple Choice';
          } else if (type.toLowerCase().includes('response') || type.toLowerCase().includes('select')) {
            row.Type = 'Multiple Response';
          } else {
            row.Type = 'Multiple Choice'; // Default
          }
        }
      } else {
        // Default to Multiple Choice if not specified
        row.Type = 'Multiple Choice';
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
    const rawHeaders = parseCSVLine(firstLine);
    
    // Map raw headers to proper case headers using the headerMapping
    const headers: string[] = rawHeaders.map(header => {
      const lowerHeader = header.toLowerCase().trim();
      const mappedHeader = headerMapping[lowerHeader];
      console.log(`Mapping header: "${header}" (${lowerHeader}) -> ${mappedHeader || header}`);
      return mappedHeader || header;
    });
    
    console.log('CSV Headers (normalized):', headers);
    console.log('Raw CSV Headers:', rawHeaders);
    
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV line with proper handling of quoted fields
      const values = parseCSVLine(line);
      
      // Skip if we don't have enough values for required fields
      const minRequiredValues = Math.max(
        ...requiredHeaders.map(header => {
          const headerIndex = headers.indexOf(header);
          return headerIndex !== -1 ? headerIndex + 1 : 0;
        })
      );
      
      if (values.length < minRequiredValues) {
        console.warn(`Skipping row ${i} due to insufficient values. Required: ${minRequiredValues}, Found: ${values.length}`);
        continue;
      }
      
      const row = {} as CSVRow;

      // First, handle compatibility with existing header mappings
      // This ensures test cases with exact header matches continue to work
      for (let j = 0; j < headers.length; j++) {
        if (j < values.length) {
          const header = headers[j];
          const value = values[j];
          
          // Direct assignment for exact header matches
          if (header in row || Object.values(headerMapping).includes(header as any)) {
            try {
              row[header as keyof CSVRow] = value;
            } catch (e) {
              console.warn(`Error assigning value to ${header}:`, e);
            }
          }
        }
      }
      
      // Now handle special cases and ensure required fields
      // Apply special mapping for Notes -> Rationale if needed
      if (!row['Rationale'] && (row['Notes'] || '').length > 0) {
        row['Rationale'] = row['Notes'];
      }
      
      // Ensure all required fields are present
      for (const requiredHeader of requiredHeaders) {
        if (!row[requiredHeader as keyof CSVRow]) {
          row[requiredHeader as keyof CSVRow] = '';
        }
      }

      rows.push(row);
    }

    return { rows, rawHeaders };
  }

  // Helper function to parse a CSV line correctly handling quoted fields
  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let currentField = '';
    let inQuotes = false;
    
    // Enhanced parsing to correctly handle URLs with commas in quoted fields
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        // Check for escaped quotes (two double quotes in a row)
        if (i + 1 < line.length && line[i + 1] === '"') {
          currentField += '"';
          i++; // Skip the next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field - only if not inside quotes
        result.push(currentField);
        currentField = '';
      } else {
        // Regular character - preserve exactly as is
        // This includes commas, URLs, and special chars inside quoted fields
        currentField += char;
      }
    }
    
    // Add the last field (and don't trim it to preserve whitespace)
    result.push(currentField);
    
    return result;
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
      
      // Process rows in smaller batches to avoid overwhelming the API
      const batchSize = 3; // Reduced batch size for better reliability
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        
        console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(rows.length/batchSize)}`);
        
        const batchPromises = batch.map(async (row, batchIndex) => {
          const rowIndex = i + batchIndex;
          const maxRetries = 2;
          let retryCount = 0;
          
          while (retryCount <= maxRetries) {
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
              
              // Ensure QuestionId is an integer
              let questionId: number;
              try {
                questionId = parseInt(row.QuestionId, 10);
                if (isNaN(questionId)) {
                  throw new Error(`Invalid QuestionId: ${row.QuestionId}`);
                }
              } catch (err) {
                console.error(`Error parsing QuestionId at row ${rowIndex + 1}:`, err);
                return { 
                  success: false, 
                  rowIndex, 
                  error: `Invalid QuestionId: ${row.QuestionId}. Must be a number.` 
                } as BatchResult;
              }
              
              // Handle notes field - combine with rationale if it contains useful information
              let rationale = row.Rationale || '';
              if (row.Notes && row.Notes.trim() !== '' && !row.Notes.includes('status=') && !row.Notes.toLowerCase().includes('assign to')) {
                // Extract meaningful parts from notes, ignoring administrative content
                const notes = row.Notes.trim();
                const usefulNotes = notes
                  .split(/\s+/)
                  .filter((part: string) => 
                    !part.match(/^\d+\/\d+\/\d+/) && // Ignore dates
                    !part.match(/^[AP]M$/) && // Ignore AM/PM
                    !part.includes('status=') && 
                    !part.toLowerCase().includes('assign')
                  )
                  .join(' ');
                  
                if (usefulNotes.trim() !== '') {
                  rationale = rationale ? `${rationale}\n\nAdditional notes: ${usefulNotes}` : usefulNotes;
                }
              }
              
              const itemToCreate = {
                QuestionId: questionId,
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
                Rationale: rationale,
                Topic: row.Topic || '',
                KnowledgeSkills: row.KnowledgeSkills || '',
                Tags: row.Tags || '',
                Type: row.Type || 'Multiple Choice',
                Status: row.Status || 'Draft',
                CreatedBy: row.CreatedBy || ''
              };
              
              console.log(`Attempting to create item (attempt ${retryCount + 1}/${maxRetries + 1}):`, itemToCreate);
              
              // Use the updated createItem function
              const result = await createItem(itemToCreate);
              
              // Validate the result
              if (!result) {
                throw new Error('Create operation returned an empty result');
              }
              
              console.log('Item created successfully:', result);
              
              return { success: true, rowIndex } as BatchResult;
            } catch (err) {
              console.error(`Error creating item at row ${rowIndex + 1} (attempt ${retryCount + 1}/${maxRetries + 1}):`, err);
              
              // Check if this is a retryable error
              const errorMessage = err instanceof Error ? err.message : String(err);
              const isNetworkError = 
                errorMessage.includes('Network error') || 
                errorMessage.includes('Failed to fetch') || 
                errorMessage.includes('timeout') ||
                errorMessage.includes('connection');
              
              if (isNetworkError && retryCount < maxRetries) {
                console.log(`Retrying row ${rowIndex + 1} after network error (retry ${retryCount + 1}/${maxRetries})...`);
                retryCount++;
                
                // Exponential backoff: wait longer between retries
                const delay = 1000 * Math.pow(2, retryCount);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
              }
              
              return { 
                success: false, 
                rowIndex, 
                error: errorMessage
              } as BatchResult;
            }
          }
          
          // If we reached here after all retries, it means the last retry also failed
          return { 
            success: false, 
            rowIndex, 
            error: `Failed after ${maxRetries + 1} attempts` 
          } as BatchResult;
        });
        
        // Wait for all items in the batch to be processed
        const batchResults = await Promise.all(batchPromises);
        
        // Add a small delay between batches to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Count successes and collect errors
        batchResults.forEach(result => {
          if (result.success) {
            successCount++;
          } else if (result.error) {
            errors.push(`Row ${result.rowIndex + 1}: ${result.error}`);
          }
        });
        
        console.log(`Batch processed. Total successful so far: ${successCount}, Errors: ${errors.length}`);
      }

      console.log(`Bulk upload completed. ${successCount} items created successfully.`);
      
      if (successCount > 0) {
        setSuccess(true);
        setUploadedCount(successCount);
        
        if (errors.length > 0) {
          // Some items succeeded, some failed
          setError(`Successfully uploaded ${successCount} items, but ${errors.length} items failed. First error: ${errors[0]}`);
        } else {
          // All items succeeded
          setError(null);
          // Notify the parent component
          onUploadComplete();
        }
      } else if (errors.length > 0) {
        // All items failed
        setError(`Failed to upload any items. First error: ${errors[0]}`);
      } else {
        // No items processed
        setError('No items were processed.');
      }
    } catch (err) {
      console.error('Unexpected error during bulk upload:', err);
      setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(file: File | null) {
    setSelectedFile(file);
    setError(null);
    setSuccess(false);
  }

  // Define the file upload component
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
            <Alert type="error" header="Upload error">
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{error}</pre>
            </Alert>
          </div>
        )}
        {success && (
          <Alert type="success" header="Upload successful">
            Successfully uploaded {uploadedCount} items.
          </Alert>
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
              data-testid="bulk-upload-file-input"
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