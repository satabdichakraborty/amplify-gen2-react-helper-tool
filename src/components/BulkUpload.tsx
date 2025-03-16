import React, { useState, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../amplify/data/resource';
import Papa from 'papaparse';
import {
  Box,
  SpaceBetween,
  Button,
  Alert,
  Spinner,
  FormField
} from '@cloudscape-design/components';

const client = generateClient<Schema>();

interface CSVRow {
  QuestionId: string;
  Type: string;
  Status: string;
  Question: string;
  Key: string;
  Notes?: string;
  Rationale: string;
  CreatedDate: string;
  CreatedBy: string;
  'Response A': string;
  'Response B': string;
  'Response C': string;
  'Response D': string;
  'Response E'?: string;
  'Response F'?: string;
  'Rationale A': string;
  'Rationale B': string;
  'Rationale C': string;
  'Rationale D': string;
  'Rationale E'?: string;
  'Rationale F'?: string;
  Topic: string;
  'Knowledge-Skills': string;
  Tags?: string;
}

interface ValidationError {
  row: number;
  errors: string[];
}

interface BulkUploadProps {
  onUploadComplete?: () => void;
}

export const BulkUpload: React.FC<BulkUploadProps> = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const validateRow = (row: CSVRow): string[] => {
    const errors: string[] = [];
    const requiredFields = [
      'QuestionId', 'Type', 'Status', 'Question', 'Key', 'Rationale',
      'CreatedDate', 'CreatedBy', 'Response A', 'Response B', 'Response C', 'Response D',
      'Rationale A', 'Rationale B', 'Rationale C', 'Rationale D',
      'Topic', 'Knowledge-Skills'
    ];

    requiredFields.forEach(field => {
      if (!row[field as keyof CSVRow]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate Key is valid
    const validResponses = ['A', 'B', 'C', 'D', 'E', 'F'];
    if (!validResponses.includes(row.Key)) {
      errors.push('Invalid Key. Must be A, B, C, D, E, or F');
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    if (!dateRegex.test(row.CreatedDate)) {
      errors.push('Invalid date format. Use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)');
    }

    return errors;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrors([]);
      setSuccess(null);
    }
  };

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setUploading(true);
    setErrors([]);
    setSuccess(null);

    Papa.parse<CSVRow>(selectedFile, {
      header: true,
      complete: async (results) => {
        const validationErrors: ValidationError[] = [];
        const validRows: CSVRow[] = [];

        results.data.forEach((row, index) => {
          const rowErrors = validateRow(row);
          if (rowErrors.length > 0) {
            validationErrors.push({ row: index + 1, errors: rowErrors });
          } else {
            validRows.push(row);
          }
        });

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setUploading(false);
          return;
        }

        try {
          // Upload valid rows to DynamoDB
          await Promise.all(validRows.map(row => client.models.Item.create({
            QuestionId: row.QuestionId,
            Type: row.Type,
            Status: row.Status,
            Question: row.Question,
            Key: row.Key,
            Notes: row.Notes || '',
            Rationale: row.Rationale,
            CreatedDate: row.CreatedDate,
            CreatedBy: row.CreatedBy,
            responseA: row['Response A'],
            responseB: row['Response B'],
            responseC: row['Response C'],
            responseD: row['Response D'],
            responseE: row['Response E'] || '',
            responseF: row['Response F'] || '',
            rationaleA: row['Rationale A'],
            rationaleB: row['Rationale B'],
            rationaleC: row['Rationale C'],
            rationaleD: row['Rationale D'],
            rationaleE: row['Rationale E'] || '',
            rationaleF: row['Rationale F'] || '',
            Topic: row.Topic,
            KnowledgeSkills: row['Knowledge-Skills'],
            Tags: row.Tags || '',
            responsesJson: JSON.stringify({
              responses: {
                A: row['Response A'],
                B: row['Response B'],
                C: row['Response C'],
                D: row['Response D'],
                ...(row['Response E'] && { E: row['Response E'] }),
                ...(row['Response F'] && { F: row['Response F'] }),
              },
              rationales: {
                A: row['Rationale A'],
                B: row['Rationale B'],
                C: row['Rationale C'],
                D: row['Rationale D'],
                ...(row['Rationale E'] && { E: row['Rationale E'] }),
                ...(row['Rationale F'] && { F: row['Rationale F'] }),
              }
            })
          })));

          setSuccess(`Successfully uploaded ${validRows.length} items`);
          if (onUploadComplete) {
            setTimeout(onUploadComplete, 2000); // Give user time to see success message
          }
        } catch (error: any) {
          setErrors([{ row: 0, errors: [`Upload failed: ${error?.message || 'Unknown error'}`] }]);
        }

        setUploading(false);
      },
      error: (error) => {
        setErrors([{ row: 0, errors: [`CSV parsing failed: ${error.message}`] }]);
        setUploading(false);
      }
    });
  }, [selectedFile, onUploadComplete]);

  return (
    <Box padding="l">
      <SpaceBetween size="l">
        <FormField
          label="Select CSV file"
          description="Choose a CSV file containing the items to upload. The file should include all required fields."
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={uploading}
            data-testid="csv-file-input"
          />
        </FormField>

        <SpaceBetween size="xs">
          {selectedFile && (
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              loading={uploading}
              ariaLabel="Upload"
            >
              Upload
            </Button>
          )}
        </SpaceBetween>

        {uploading && (
          <Box textAlign="center">
            <Spinner size="normal" />
            <Box variant="p" color="text-status-info" padding={{ top: 'xs' }}>
              Uploading...
            </Box>
          </Box>
        )}

        {success && (
          <Alert type="success">
            {success}
          </Alert>
        )}

        {errors.length > 0 && (
          <SpaceBetween size="xs">
            {errors.map((error, index) => (
              <Alert key={index} type="error">
                {error.row > 0 ? `Row ${error.row}:` : ''} {error.errors.join(', ')}
              </Alert>
            ))}
          </SpaceBetween>
        )}
      </SpaceBetween>
    </Box>
  );
};

export default BulkUpload; 