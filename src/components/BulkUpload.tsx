import React, { useState, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../amplify/data/resource';
import Papa from 'papaparse';
import { Button, Alert, CircularProgress, Box, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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

export const BulkUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

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

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrors([]);
    setSuccess(null);

    Papa.parse<CSVRow>(file, {
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
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Bulk Upload Items
      </Typography>
      
      <input
        accept=".csv"
        style={{ display: 'none' }}
        id="csv-file-upload"
        type="file"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      
      <label htmlFor="csv-file-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUploadIcon />}
          disabled={uploading}
          sx={{ mb: 2 }}
        >
          Upload CSV File
        </Button>
      </label>

      {uploading && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography>Uploading...</Typography>
        </Box>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}

      {errors.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {errors.map((error, index) => (
            <Alert key={index} severity="error" sx={{ mb: 1 }}>
              {error.row > 0 ? `Row ${error.row}:` : ''} {error.errors.join(', ')}
            </Alert>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default BulkUpload; 