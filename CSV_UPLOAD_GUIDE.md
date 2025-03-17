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
- **Key**: The correct answer(s) using 1-3 characters from A-H (e.g., A, BC, ABD)
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

3. **Key Format**: The Key value should be 1-3 characters long and only contain letters A-H:
   - For single-answer questions: use a single character (e.g., "A")
   - For multiple-answer questions: use 2-3 characters (e.g., "AB", "ABD")
   - Order matters: "ABC" indicates A, B, and C are all correct answers

4. **Required Fields**: While some columns are optional, the system requires values for all the required fields.

## Example CSV Files

We've provided two example files you can use as templates:

1. **sample_template.csv**: A minimal example with only the required columns
2. **sample_items.csv**: A comprehensive example with all possible columns and diverse question types

## Common Errors

- **Missing Required Headers**: Make sure your CSV includes all required columns
- **Invalid QuestionId**: QuestionId must be a valid integer
- **Invalid Key Format**: Key must only contain characters A-H and be 1-3 characters long

## Tips for Successful Uploads

- Use Excel or Google Sheets to prepare your CSV file
- Save as CSV (Comma delimited)
- Verify all required columns are present
- Ensure the file uses UTF-8 encoding if it contains special characters

### Field Requirements

The CSV file must contain the following fields:

- **QuestionId** - A unique identifier for the question (numeric)
- **CreatedDate** - The date the question was created (can be any string format)
- **Question** - The question text
- **Type** - Either 'MCQ' (Multiple Choice Question, single answer) or 'MRQ' (Multiple Response Question, multiple answers)
- **Status** - Either 'Active' or 'Inactive'
- **responseA, responseB, responseC, responseD** (required) - The answer options
- **responseE, responseF, responseG, responseH** (optional) - Additional answer options
- **rationaleA, rationaleB, rationaleC, rationaleD, rationaleE, rationaleF, rationaleG, rationaleH** (optional) - Rationales for each answer option
- **Key** - The correct answer(s). For MCQ, this is a single character (A-H). For MRQ, this can be 1-3 characters (e.g., 'AB', 'ABC').
- **Rationale** (optional) - Overall rationale for the question
- **Topic** (optional) - Topic category
- **KnowledgeSkills** (optional) - Knowledge skills being tested
- **Tags** (optional) - Tags for the question

### Handling Special Characters in Fields

If your question text, responses, or rationales contain commas, you must enclose these fields in double quotes to ensure they're parsed correctly:

```csv
QuestionId,CreatedDate,Question,Type,Status,responseA,responseB,responseC,responseD,Key
1001,2024-06-01,"What is the capital of France, and why is it important?",MCQ,Active,Paris,London,Berlin,Madrid,A
1002,06/02/2024,Which planets are gas giants?,MRQ,Active,"Jupiter, the largest planet",Saturn,Earth,Mars,AB
```

Guidelines for quoted fields:
- Enclose any field containing commas in double quotes
- If a field needs to contain double quotes, use two double quotes together (`""`) inside the quoted field
- Example: `"This field contains ""quoted text"" and a comma, in the same field"`

### Key Format

The **Key** field indicates the correct answer(s):

- For MCQ (single answer questions): Must be a single character (A-H)
  - Example: `A` indicates responseA is the correct answer
  
- For MRQ (multiple answer questions): Can be 1-3 characters (A-H) representing multiple correct answers
  - Example: `AB` indicates both responseA and responseB are correct answers
  - Example: `ABC` indicates responseA, responseB, and responseC are all correct answers

The Key is case-insensitive, so 'a', 'A', 'ab', and 'AB' are all valid.

### Common Errors

- **Missing Required Fields**: Ensure all required fields are present in your CSV
- **Invalid Key Format**: Key must only contain characters A-H and be 1-3 characters long
- **Key/Response Mismatch**: If Key references a response (e.g., 'C'), that response must have content
- **MCQ with Multiple Answers**: MCQ type should have exactly 1 character in the Key field
- **MRQ with Single Answer**: MRQ type should have at least 2 characters in the Key field
- **Missing Response Options**: All responses referenced in the Key must have content 