import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import '../styles/PromptManagement.css';

const client = generateClient<Schema>();

export const PromptManagement: React.FC = () => {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPrompt, setCurrentPrompt] = useState<any>(null);
  const [promptContent, setPromptContent] = useState('');
  const [promptName, setPromptName] = useState('');
  const [promptDescription, setPromptDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const { data } = await client.models.Prompt.list();
      setPrompts(data);
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError('Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  const selectPrompt = (prompt: any) => {
    setCurrentPrompt(prompt);
    setPromptName(prompt.name);
    setPromptContent(prompt.content);
    setPromptDescription(prompt.description || '');
    setIsEditing(true);
  };

  const createNewPrompt = () => {
    setCurrentPrompt(null);
    setPromptName('');
    setPromptContent('');
    setPromptDescription('');
    setIsEditing(true);
  };

  const savePrompt = async () => {
    if (!promptName || !promptContent) {
      setError('Name and content are required');
      return;
    }

    try {
      setLoading(true);
      if (currentPrompt) {
        // Update existing prompt
        await client.models.Prompt.update({
          name: promptName,
          content: promptContent,
          description: promptDescription,
          version: (currentPrompt.version || 0) + 1
        });
      } else {
        // Create new prompt
        await client.models.Prompt.create({
          name: promptName,
          content: promptContent,
          description: promptDescription,
          version: 1
        });
      }
      
      setIsEditing(false);
      await fetchPrompts();
    } catch (err) {
      console.error('Error saving prompt:', err);
      setError('Failed to save prompt');
    } finally {
      setLoading(false);
    }
  };

  const deletePrompt = async (name: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) {
      return;
    }

    try {
      setLoading(true);
      await client.models.Prompt.delete({ name });
      if (currentPrompt && currentPrompt.name === name) {
        setCurrentPrompt(null);
        setIsEditing(false);
      }
      await fetchPrompts();
    } catch (err) {
      console.error('Error deleting prompt:', err);
      setError('Failed to delete prompt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prompt-management-container">
      <h1>Prompt Management</h1>
      
      <div className="prompt-management-layout">
        <div className="prompts-list-section">
          <div className="section-header">
            <h2>Available Prompts</h2>
            <button 
              className="awsui-button-primary"
              onClick={createNewPrompt}
            >
              Create New
            </button>
          </div>
          
          {loading && <p>Loading prompts...</p>}
          {error && <p className="error-message">{error}</p>}
          
          <ul className="prompts-list">
            {prompts.map(prompt => (
              <li key={prompt.name} className={currentPrompt?.name === prompt.name ? 'selected' : ''}>
                <div className="prompt-item" onClick={() => selectPrompt(prompt)}>
                  <div className="prompt-item-header">
                    <span className="prompt-name">{prompt.name}</span>
                    <span className="prompt-version">v{prompt.version || 1}</span>
                  </div>
                  <p className="prompt-description">{prompt.description || 'No description'}</p>
                </div>
                <button 
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePrompt(prompt.name);
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
            
            {!loading && prompts.length === 0 && (
              <li className="empty-state">No prompts found. Create one to get started.</li>
            )}
          </ul>
        </div>
        
        {isEditing ? (
          <div className="prompt-editor-section">
            <h2>{currentPrompt ? 'Edit Prompt' : 'Create New Prompt'}</h2>
            
            <div className="form-field">
              <label htmlFor="prompt-name">Prompt Name</label>
              <input 
                id="prompt-name"
                type="text"
                value={promptName}
                onChange={(e) => setPromptName(e.target.value)}
                disabled={currentPrompt !== null}
                placeholder="e.g., rationale-system-prompt"
              />
            </div>
            
            <div className="form-field">
              <label htmlFor="prompt-description">Description</label>
              <input 
                id="prompt-description"
                type="text"
                value={promptDescription}
                onChange={(e) => setPromptDescription(e.target.value)}
                placeholder="What is this prompt used for?"
              />
            </div>
            
            <div className="form-field">
              <label htmlFor="prompt-content">Content</label>
              <textarea 
                id="prompt-content"
                value={promptContent}
                onChange={(e) => setPromptContent(e.target.value)}
                placeholder="Enter the prompt content here..."
                rows={15}
              />
            </div>
            
            <div className="button-row">
              <button 
                className="awsui-button-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button 
                className="awsui-button-primary"
                onClick={savePrompt}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Prompt'}
              </button>
            </div>
          </div>
        ) : (
          <div className="prompt-details-section">
            <div className="empty-state-message">
              <p>Select a prompt from the list to view or edit, or create a new one.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 