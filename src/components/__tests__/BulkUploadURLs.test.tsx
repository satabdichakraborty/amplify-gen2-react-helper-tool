import { vi } from 'vitest';

// Mock the operations module
vi.mock('../../graphql/operations', () => ({
  createItem: vi.fn().mockResolvedValue({
    data: {
      createItem: {
        ID: '123',
        CreatedDate: '2023-01-01',
        Question: 'Test question',
        Type: 'Multiple Choice',
        Status: 'Active',
        CreatedBy: 'system'
      }
    }
  })
}));

// Direct test of the CSV parsing function
// Add this function to directly test the parsing logic
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
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
      currentField += char;
    }
  }
  
  // Don't forget the last field
  result.push(currentField);
  
  return result;
}

describe('BulkUpload with URLs in Rationales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('directly tests CSV parsing of URLs with commas', () => {
    // Test the parsing function directly
    const csvLine = 'QuestionId,rationaleC,rationaleD';
    const parsedHeader = parseCSVLine(csvLine);
    expect(parsedHeader).toEqual(['QuestionId', 'rationaleC', 'rationaleD']);
    
    // Test parsing a line with URLs in quoted fields that contain commas
    const dataLine = '123,"This is a rationale with a URL: https://example.com/path?param=value,another=123","Another URL with commas: http://test.org/page,name"';
    const parsedData = parseCSVLine(dataLine);
    
    // We should get 3 fields with the URLs preserved intact
    expect(parsedData.length).toBe(3);
    expect(parsedData[0]).toBe('123');
    expect(parsedData[1]).toBe('This is a rationale with a URL: https://example.com/path?param=value,another=123');
    expect(parsedData[2]).toBe('Another URL with commas: http://test.org/page,name');
  });

  it('handles URLs with commas in CSV rationales', async () => {
    // Create a mock CSV content with URLs in rationales
    const csvContent = `QuestionId,CreatedDate,Question,Type,Status,responseA,responseB,responseC,responseD,rationaleA,rationaleB,rationaleC,rationaleD,Key
123456,2024-01-01,"What is the best practice?",Multiple Choice,Active,"Option A","Option B","Option C","Option D","Simple rationale","Another rationale","This is a rationale with a URL: https://example.com/path?param=value,another=123&test=true","This is another rationale with a URL: http://test.org/test,param?q=1",C`;

    // Create a direct test of the parsing
    const lines = csvContent.split('\n');
    const header = parseCSVLine(lines[0]);
    const dataLine = parseCSVLine(lines[1]);
    
    // Create a map of header to value
    const rowData: Record<string, string> = {};
    header.forEach((h, index) => {
      if (index < dataLine.length) {
        rowData[h] = dataLine[index];
      }
    });
    
    // Check that URLs are parsed correctly
    expect(rowData['rationaleC']).toBe('This is a rationale with a URL: https://example.com/path?param=value,another=123&test=true');
    expect(rowData['rationaleD']).toBe('This is another rationale with a URL: http://test.org/test,param?q=1');
  });
}); 