import { client } from '../main';

// Define the Item type using the Schema type and the client's return type
export type Item = {
  QuestionId: string;
  CreatedDate: string;
  stem: string;
  responseA: string;
  rationaleA: string;
  responseB: string;
  rationaleB: string;
  responseC: string;
  rationaleC: string;
  responseD: string;
  rationaleD: string;
  correctResponse: string;
  responsesJson: string;
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

export async function getItem(id: string, createdDate: string): Promise<Item | null> {
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

export async function createItem(item: Omit<Item, 'QuestionId' | 'CreatedDate'>): Promise<Item> {
  try {
    const response = await client.models.Item.create(item as any);
    return response.data as unknown as Item;
  } catch (error) {
    console.error('Error in createItem:', error);
    throw error;
  }
}

export async function updateItem(id: string, createdDate: string, item: Partial<Omit<Item, 'QuestionId' | 'CreatedDate'>>): Promise<Item> {
  try {
    const response = await client.models.Item.update({
      QuestionId: id,
      CreatedDate: createdDate,
      ...item
    } as any);
    return response.data as unknown as Item;
  } catch (error) {
    console.error('Error in updateItem:', error);
    throw error;
  }
}

export async function deleteItem(questionId: string, createdDate: string): Promise<void> {
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