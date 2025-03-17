# CSV Upload Guide

This guide explains the format and requirements for uploading questions via CSV.

## CSV Format Requirements

The CSV file should contain the following columns:

### Required Columns
These columns must be included in your CSV file:

- **QuestionId**: A unique integer identifier for the question
- **CreatedDate**: A string representing the creation date (any format)
- **Question**: The actual question text
- **responseA, responseB, responseC, responseD**: The text for options A through D

### Optional Columns
These columns are optional but recommended:

- **rationaleA, rationaleB, rationaleC, rationaleD**: Explanations for options A through D
- **responseE, responseF, responseG, responseH**: Additional response options
- **rationaleE, rationaleF, rationaleG, rationaleH**: Explanations for additional options
- **Key**: The correct answer (A, B, C, D, E, F, G, or H)
- **Rationale**: General explanation for the question
- **Type**: Question type (e.g., MCQ for multiple choice, MRQ for multiple response)
- **Status**: Question status (e.g., Draft, Active, Archived)
- **Topic**: Topic category for the question
- **KnowledgeSkills**: Knowledge or skills being tested
- **Tags**: Comma-separated tags for filtering/categorization

## Important Notes

1. **Case Insensitivity**: Column headers are case-insensitive. For example, "QuestionId", "questionid", and "QUESTIONID" are all recognized as the same column.

2. **Date Format**: The CreatedDate can be any string value you prefer. Common formats include:
   - ISO format: 2024-06-01
   - US format: 06/01/2024
   - Timestamp: 1717200000
   - Text: June 1, 2024

3. **Key Format**: The Key value should be a single character from A to H, representing the correct answer.

4. **Required Fields**: While some columns are optional, the system requires values for all the required fields.

## Example CSV Files

We've provided two example files you can use as templates:

1. **sample_template.csv**: A minimal example with only the required columns
2. **sample_items.csv**: A comprehensive example with all possible columns and diverse question types

## Common Errors

- **Missing Required Headers**: Make sure your CSV includes all required columns
- **Invalid QuestionId**: QuestionId must be a valid integer
- **Invalid Key Format**: Key must be a single character (A-H)

## Tips for Successful Uploads

- Use Excel or Google Sheets to prepare your CSV file
- Save as CSV (Comma delimited)
- Verify all required columns are present
- Ensure the file uses UTF-8 encoding if it contains special characters 