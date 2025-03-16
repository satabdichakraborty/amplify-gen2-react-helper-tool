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
  CreatedBy?: string;
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
    const response = await client.models.Item.list();
    console.log('List items response:', response);
    return response.data as unknown as Item[];
  } catch (error) {
    console.error('Error in listItems:', error);
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
    
    const response = await client.models.Item.create(itemWithDefaults as any);
    return response.data as unknown as Item;
  } catch (error) {
    console.error('Error in createItem:', error);
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