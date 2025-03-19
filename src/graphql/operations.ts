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
  // New LLM-generated fields
  LLMKey?: string;
  LLMRationaleA?: string;
  LLMRationaleB?: string;
  LLMRationaleC?: string;
  LLMRationaleD?: string;
  LLMRationaleE?: string;
  LLMRationaleF?: string;
  LLMGeneralRationale?: string;
  Topic?: string;
  KnowledgeSkills?: string;
  Tags?: string;
  responsesJson?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Type for Lambda response
export type GeneratedRationale = {
  llmKey: string;
  llmRationaleA: string;
  llmRationaleB: string;
  llmRationaleC: string;
  llmRationaleD: string;
  llmRationaleE?: string;
  llmRationaleF?: string;
  llmGeneralRationale: string;
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
    // Keep rationale fields exactly as provided without any trimming or modification
    const itemWithDefaults = {
      ...item,
      // Add default values for required fields that might be missing
      CreatedBy: item.CreatedBy || 'system',
      Topic: item.Topic || 'General',
      KnowledgeSkills: item.KnowledgeSkills || 'General',
      // Make sure Key is set if not provided
      Key: item.Key || (item.Rationale?.charAt(0) || 'A'),
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
      // New LLM fields
      LLMKey: item.LLMKey || '',
      LLMRationaleA: item.LLMRationaleA || '',
      LLMRationaleB: item.LLMRationaleB || '',
      LLMRationaleC: item.LLMRationaleC || '',
      LLMRationaleD: item.LLMRationaleD || '',
      LLMRationaleE: item.LLMRationaleE || '',
      LLMRationaleF: item.LLMRationaleF || '',
      LLMGeneralRationale: item.LLMGeneralRationale || '',
      Tags: item.Tags || '',
      Rationale: item.Rationale || '',
      // Ensure Type and Status have values
      Type: item.Type || 'Multiple Choice',
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
    // Preserve all fields exactly as provided, including special characters in rationales
    const itemWithDefaults = {
      ...item,
      // Add default values for required fields that might be missing
      CreatedBy: item.CreatedBy || 'system',
      Topic: item.Topic || 'General',
      KnowledgeSkills: item.KnowledgeSkills || 'General',
      // Make sure Key is set if not provided
      Key: item.Key || (item.Rationale?.charAt(0) || 'A')
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

// New function to invoke the Lambda for generating rationales
export async function generateRationaleWithLLM(item: Partial<Item>): Promise<GeneratedRationale> {
  try {
    console.log('Generating rationale for item:', item.QuestionId);
    
    // Build the request payload
    const payload = {
      question: item.Question,
      responseA: item.responseA,
      responseB: item.responseB,
      responseC: item.responseC,
      responseD: item.responseD,
      responseE: item.responseE,
      responseF: item.responseF,
      type: item.Type
    };
    
    // Call the Lambda function through REST API (temporarily mocked)
    // In production, this would use the Amplify API client to call the Lambda
    // const response = await client.functions.generateRationale(payload);
    
    // TEMPORARY MOCK IMPLEMENTATION FOR TESTING
    // In a real implementation, this would call the actual Lambda
    console.log('Simulating Lambda call with payload:', payload);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    
    // Mock response for testing UI
    const mockResponse = {
      llmKey: 'C',
      llmRationaleA: 'Option A is incorrect. While reconfiguring Amazon EFS for maximum I/O might improve performance, it would be expensive and wouldn\'t address the specific issue of video content delivery at scale.',
      llmRationaleB: 'Option B is incorrect. Using instance store volumes would not only fail to solve the scaling issue but would actually reduce reliability since instance store volumes are ephemeral.',
      llmRationaleC: 'Option C is correct. Using CloudFront as a CDN with S3 as the origin is the most cost-efficient and scalable solution for delivering static content like videos. This approach offloads traffic from the EC2 servers and leverages AWS\'s global edge network for better performance.',
      llmRationaleD: 'Option D is incorrect. This appears to be an incomplete option in the question, but it seems to suggest another CloudFront configuration which is not the optimal solution.',
      llmGeneralRationale: 'The most cost-efficient and scalable solution for delivering video content is to use Amazon CloudFront as a content delivery network (CDN) with an S3 bucket as the origin. This approach has several advantages:\n\n1. CloudFront caches content at edge locations around the world, reducing latency for users\n2. Traffic is offloaded from the EC2 servers, allowing them to focus on dynamic content\n3. S3 provides highly durable, scalable storage for the video files\n4. This combination is specifically designed for high-scale static content delivery\n5. The pay-as-you-go pricing model is cost-efficient for variable traffic patterns\n\nThis solution directly addresses both the performance issues and cost efficiency requirements mentioned in the question.'
    };
    
    return mockResponse;
  } catch (error) {
    console.error('Error generating rationale:', error);
    throw new Error(`Failed to generate rationale: ${error instanceof Error ? error.message : String(error)}`);
  }
} 