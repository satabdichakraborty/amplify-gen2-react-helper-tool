import { client } from '../main';

// Define the Item type using the Schema type and the client's return type
export type Item = {
  QuestionId: number;
  CreatedDate: string;
  Question: string;
  Type: string;
  Status: string;
  Key?: string;
  Notes?: string;
  Rationale: string;
  CreatedBy: string;
  responseA: string;
  rationaleA: string;
  responseB: string;
  rationaleB: string;
  responseC: string;
  rationaleC: string;
  responseD: string;
  rationaleD: string;
  responseE?: string;
  rationaleE?: string;
  responseF?: string;
  rationaleF?: string;
  responseG?: string;
  rationaleG?: string;
  responseH?: string;
  rationaleH?: string;
  Topic?: string;
  KnowledgeSkills?: string;
  Tags?: string;
  responsesJson?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function listItems(): Promise<Item[]> {
  try {
    console.log('Attempting to list items...');
    
    // Check if client is initialized properly
    if (!client || !client.models || !client.models.Item) {
      console.error('Client is not properly initialized:', client);
      throw new Error('API client is not properly initialized');
    }
    
    // Fetch the items with a timeout
    let response;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out after 10 seconds')), 10000);
      });
      
      response = await Promise.race([
        client.models.Item.list(),
        timeoutPromise
      ]);
    } catch (err) {
      console.error('Error in API call for listItems:', err);
      if (err instanceof Error && err.message.includes('timed out')) {
        throw new Error('Database query timed out. The server may be unresponsive or overloaded.');
      }
      throw err;
    }
    
    console.log('List items response received:', response);
    
    // Verify that the response has the expected structure
    if (!response || !response.data) {
      console.error('Invalid response from list operation:', response);
      throw new Error('Invalid response from database: empty or missing data');
    }
    
    if (!Array.isArray(response.data)) {
      console.error('Invalid data type in response:', response.data);
      throw new Error('Invalid response data type: expected an array');
    }
    
    console.log(`Successfully retrieved ${response.data.length} items from the database`);
    return response.data as unknown as Item[];
  } catch (error) {
    console.error('Error in listItems:', error);
    // Rethrow the error with a more user-friendly message
    if (error instanceof Error) {
      throw new Error(`Failed to retrieve items: ${error.message}`);
    }
    throw error;
  }
}

export async function getItem(id: number, createdDate: string): Promise<Item | null> {
  try {
    const response = await client.models.Item.get({ 
      QuestionId: id,
      CreatedDate: createdDate
    });
    return response.data as unknown as Item;
  } catch (error) {
    console.error('Error in getItem:', error);
    throw error;
  }
}

export async function createItem(item: Partial<Item>): Promise<Item> {
  try {
    console.log('createItem called with:', JSON.stringify(item, null, 2));
    
    // Ensure all required fields are present and properly formatted
    const itemWithDefaults = {
      ...item,
      // Add default values for required fields that might be missing
      CreatedBy: item.CreatedBy || 'system',
      Topic: item.Topic || 'General',
      KnowledgeSkills: item.KnowledgeSkills || 'General',
      // Make sure Key is set if not provided
      Key: item.Key || item.Rationale?.charAt(0) || 'A',
      // Ensure empty strings for optional string fields instead of undefined
      responseE: item.responseE || '',
      responseF: item.responseF || '',
      responseG: item.responseG || '',
      responseH: item.responseH || '',
      rationaleA: item.rationaleA || '',
      rationaleB: item.rationaleB || '',
      rationaleC: item.rationaleC || '',
      rationaleD: item.rationaleD || '',
      rationaleE: item.rationaleE || '',
      rationaleF: item.rationaleF || '',
      rationaleG: item.rationaleG || '',
      rationaleH: item.rationaleH || '',
      Tags: item.Tags || '',
      Rationale: item.Rationale || '',
      // Ensure Type and Status have values
      Type: item.Type || 'MCQ',
      Status: item.Status || 'Draft'
    };
    
    // Remove any undefined or null values that might cause API validation errors
    Object.keys(itemWithDefaults).forEach(key => {
      if (itemWithDefaults[key as keyof typeof itemWithDefaults] === undefined || 
          itemWithDefaults[key as keyof typeof itemWithDefaults] === null) {
        delete itemWithDefaults[key as keyof typeof itemWithDefaults];
      }
    });
    
    console.log('Calling client.models.Item.create with:', JSON.stringify(itemWithDefaults, null, 2));
    
    try {
      // Ensure the client is valid before proceeding
      if (!client || !client.models || !client.models.Item) {
        console.error('Client is not properly initialized:', client);
        throw new Error('API client is not properly initialized');
      }
      
      // Add a small delay to avoid race conditions (sometimes helps with connectivity issues)
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Try the create operation with awaiting to catch any errors
      const response = await client.models.Item.create(itemWithDefaults as any);
      
      // Verify the response data
      if (!response || !response.data) {
        console.error('Empty response from create operation:', response);
        throw new Error('Failed to create item: Empty response');
      }
      
      console.log('Create item response:', JSON.stringify(response, null, 2));
      return response.data as unknown as Item;
    } catch (innerError) {
      console.error('Error in client.models.Item.create:', innerError);
      if (innerError instanceof Error) {
        console.error('Error details:', innerError.message);
        console.error('Error stack:', innerError.stack);
        
        // Check for specific error conditions
        if (innerError.message.includes('Network error') || 
            innerError.message.includes('Failed to fetch')) {
          throw new Error('Network error: Unable to connect to the database. Check your internet connection and API configuration.');
        }
        
        if (innerError.message.includes('not authorized')) {
          throw new Error('Authorization error: The API key may be invalid or expired.');
        }
      }
      throw innerError;
    }
  } catch (error) {
    console.error('Error in createItem:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

export async function updateItem(id: number, createdDate: string, item: Partial<Omit<Item, 'QuestionId' | 'CreatedDate'>>): Promise<Item> {
  try {
    // Ensure all required fields are present
    const itemWithDefaults = {
      ...item,
      // Add default values for required fields that might be missing
      CreatedBy: item.CreatedBy || 'system',
      Topic: item.Topic || 'General',
      KnowledgeSkills: item.KnowledgeSkills || 'General',
      // Make sure Key is set if not provided
      Key: item.Key || item.Rationale?.charAt(0) || 'A'
    };
    
    const response = await client.models.Item.update({
      QuestionId: id,
      CreatedDate: createdDate,
      ...itemWithDefaults
    } as any);
    return response.data as unknown as Item;
  } catch (error) {
    console.error('Error in updateItem:', error);
    throw error;
  }
}

export async function deleteItem(questionId: number, createdDate: string): Promise<void> {
  try {
    await client.models.Item.delete({
      QuestionId: questionId,
      CreatedDate: createdDate
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
} 