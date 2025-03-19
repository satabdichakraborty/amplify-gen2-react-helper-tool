import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Container from "@cloudscape-design/components/container";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Header from "@cloudscape-design/components/header";
import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Button from "@cloudscape-design/components/button";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import TextArea from "@cloudscape-design/components/textarea";
import Alert from "@cloudscape-design/components/alert";
import AppLayout from "@cloudscape-design/components/app-layout";
import Toggle from "@cloudscape-design/components/toggle";
import Select, { SelectProps } from "@cloudscape-design/components/select";
import Checkbox from "@cloudscape-design/components/checkbox";
import { client } from "../main";
import { listItems, type Item, generateRationaleWithLLM, GeneratedRationale } from '../graphql/operations';
import { EditableRationale } from './EditableRationale';
import Modal from "@cloudscape-design/components/modal";
import Box from "@cloudscape-design/components/box";
import { LLMRationaleModal } from './LLMRationaleModal';

// Style for the correct answer label
const correctLabelStyle = (isCorrect: boolean) => ({
  marginRight: '12px', 
  fontWeight: isCorrect ? 'bold' : 'normal'
});

// Style for the response container
const responseHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginBottom: '16px'
};

export function CreateEditItem() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [questionId, setQuestionId] = useState<number>(id ? parseInt(id, 10) : Math.floor(Math.random() * 1000000));
  const [createdDate, setCreatedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [createdBy, setCreatedBy] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [knowledgeSkills, setKnowledgeSkills] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [responseA, setResponseA] = useState<string>('');
  const [responseB, setResponseB] = useState<string>('');
  const [responseC, setResponseC] = useState<string>('');
  const [responseD, setResponseD] = useState<string>('');
  const [responseE, setResponseE] = useState<string>('');
  const [responseF, setResponseF] = useState<string>('');
  const [responseG, setResponseG] = useState<string>('');
  const [responseH, setResponseH] = useState<string>('');
  const [rationaleA, setRationaleA] = useState<string>('');
  const [rationaleB, setRationaleB] = useState<string>('');
  const [rationaleC, setRationaleC] = useState<string>('');
  const [rationaleD, setRationaleD] = useState<string>('');
  const [rationaleE, setRationaleE] = useState<string>('');
  const [rationaleF, setRationaleF] = useState<string>('');
  const [rationaleG, setRationaleG] = useState<string>('');
  const [rationaleH, setRationaleH] = useState<string>('');
  const [rationale, setRationale] = useState<string>('');
  const [correctAnswers, setCorrectAnswers] = useState<string[]>(['A']);
  const [status, setStatus] = useState<string>('Draft');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<SelectProps.Option | null>(null);
  const [isMultipleResponse, setIsMultipleResponse] = useState<boolean>(false);
  // Track how many response options to display based on data in database
  const [numResponsesToShow, setNumResponsesToShow] = useState<number>(4);

  // New state variables for navigation
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(-1);
  const [isFirstItem, setIsFirstItem] = useState<boolean>(false);
  const [isLastItem, setIsLastItem] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [showNavigationModal, setShowNavigationModal] = useState<boolean>(false);
  const [pendingNavigation, setPendingNavigation] = useState<'next' | 'previous' | null>(null);

  // New state variables for LLM rationale
  const [showLLMRationaleModal, setShowLLMRationaleModal] = useState<boolean>(false);
  const [llmRationaleLoading, setLLMRationaleLoading] = useState<boolean>(false);
  const [llmRationaleError, setLLMRationaleError] = useState<string | null>(null);
  const [generatedRationale, setGeneratedRationale] = useState<GeneratedRationale | null>(null);

  // Track changes to form fields
  useEffect(() => {
    // Only track changes after initial loading
    if (!loading && id) {
      setHasUnsavedChanges(true);
    }
  }, [
    question, responseA, responseB, responseC, responseD,
    responseE, responseF, responseG, responseH,
    rationaleA, rationaleB, rationaleC, rationaleD,
    rationaleE, rationaleF, rationaleG, rationaleH,
    rationale, topic, knowledgeSkills, status, correctAnswers
  ]);

  // Reset unsaved changes on successful save
  const resetUnsavedChanges = () => {
    setHasUnsavedChanges(false);
  };

  // Parse Key field into array of correct answers
  const parseKeyField = (key: string): string[] => {
    if (!key || key.trim() === '') return ['A'];
    
    // Split by comma if present
    if (key.includes(',')) {
      return key.split(',').map(k => k.trim().toUpperCase());
    }
    
    // Otherwise, treat each character as an answer
    return key.split('').map(k => k.trim().toUpperCase())
      .filter(k => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].includes(k));
  };

  useEffect(() => {
    async function fetchItem() {
      try {
        setLoading(true);
        
        // Fetch all items for navigation
        const items = await listItems();
        
        if (!Array.isArray(items) || items.length === 0) {
          console.error('No items found in the database or invalid response');
          setError('Failed to load items list');
          setLoading(false);
          return;
        }
        
        // Sort items by QuestionId for consistent navigation
        const sortedItems = [...items].sort((a, b) => a.QuestionId - b.QuestionId);
        setAllItems(sortedItems);
        
        if (id) {
          // Find the item with matching ID
          const targetIndex = sortedItems.findIndex(item => 
            item.QuestionId === parseInt(id, 10)
          );
          
          if (targetIndex === -1) {
            console.error('Item with ID', id, 'not found in the database');
            setError(`Item with ID ${id} not found`);
            setLoading(false);
            return;
          }
          
          setCurrentItemIndex(targetIndex);
          
          // Set first/last item flags
          setIsFirstItem(targetIndex === 0);
          setIsLastItem(targetIndex === sortedItems.length - 1);
          
          const targetItem = sortedItems[targetIndex];
          console.log('Found matching item:', targetItem);
          
          // Now get the full item details using the correct ID and createdDate
          const item = await client.models.Item.get({
            QuestionId: parseInt(id, 10),
            CreatedDate: targetItem.CreatedDate
          });
          
          console.log('Item fetch response:', item);
          
          if (item?.data) {
            console.log('Item data found, populating form fields with:', item.data);
            setQuestionId(item.data.QuestionId);
            setCreatedDate(item.data.CreatedDate || new Date().toISOString().split('T')[0]);
            setCreatedBy(item.data.CreatedBy || 'System');
            setTopic(item.data.Topic || '');
            setKnowledgeSkills(item.data.KnowledgeSkills || '');
            setQuestion(item.data.Question);
            
            // Required responses (A-D)
            setResponseA(item.data.responseA || '');
            setResponseB(item.data.responseB || '');
            setResponseC(item.data.responseC || '');
            setResponseD(item.data.responseD || '');
            setRationaleA(item.data.rationaleA || '');
            setRationaleB(item.data.rationaleB || '');
            setRationaleC(item.data.rationaleC || '');
            setRationaleD(item.data.rationaleD || '');
            
            // Optional responses (E-H)
            setResponseE(item.data.responseE || '');
            setResponseF(item.data.responseF || '');
            setResponseG(item.data.responseG || '');
            setResponseH(item.data.responseH || '');
            setRationaleE(item.data.rationaleE || '');
            setRationaleF(item.data.rationaleF || '');
            setRationaleG(item.data.rationaleG || '');
            setRationaleH(item.data.rationaleH || '');
            
            // Determine the question type
            const qType = item.data.Type || 'Multiple Choice';
            setIsMultipleResponse(qType === 'Multiple Response');
            
            // Determine how many responses to show based on question type and data
            let responsesToShow = 4; // Default for Multiple Choice
            
            if (qType === 'Multiple Response') {
              // For Multiple Response, show 5 responses minimum, 6 maximum
              const hasValidE = item.data.responseE && item.data.responseE.trim() !== '';
              const hasValidF = item.data.responseF && item.data.responseF.trim() !== '';
              
              if (hasValidE && hasValidF) {
                responsesToShow = 6;
              } else if (hasValidE) {
                responsesToShow = 5;
              } else {
                responsesToShow = 5; // Default minimum for Multiple Response
              }
            } else {
              // For Multiple Choice, always show exactly 4 responses
              responsesToShow = 4;
            }
            
            setNumResponsesToShow(responsesToShow);
            
            // Handle correct answers from Key field
            if ('Key' in item.data && item.data.Key) {
              const answers = parseKeyField(item.data.Key);
              setCorrectAnswers(answers);
            } else if ('Rationale' in item.data && item.data.Rationale) {
              // Backward compatibility for old data
              const firstChar = item.data.Rationale.trim().charAt(0).toUpperCase();
              if (['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].includes(firstChar)) {
                setCorrectAnswers([firstChar]);
              } else {
                setCorrectAnswers(['A']); // Default to A if no valid answer found
              }
            }
            
            setRationale(item.data.Rationale || '');
            setStatus(item.data.Status || 'Draft');
          } else {
            console.error('No data found in the item response');
            setError('Failed to load item data: Item not found');
          }
        }
      } catch (err) {
        console.error('Error fetching item:', err);
        setError('Failed to load item data');
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [id]);

  // Modify the useEffect for question type switching to enforce new limits
  useEffect(() => {
    if (isMultipleResponse) {
      // For Multiple Response, show exactly 5 responses by default, max 6
      if (numResponsesToShow < 5) {
        setNumResponsesToShow(5);
      } else if (numResponsesToShow > 6) {
        setNumResponsesToShow(6);
      }
      
      // Update the question type
      setIsMultipleResponse(true);
    } else {
      // For Multiple Choice, show exactly 4 responses
      setNumResponsesToShow(4);
      
      // Update the question type
      setIsMultipleResponse(false);
      
      // If switching from Multiple Response to Multiple Choice, ensure only one answer is selected
      if (correctAnswers.length > 1) {
        setCorrectAnswers([correctAnswers[0]]);
      }
    }
  }, [isMultipleResponse]);

  const validateForm = () => {
    // Basic validation
    if (!question.trim()) {
      setError('Question is required');
      return false;
    }
    
    // Validate responses
    if (!responseA.trim() || !responseB.trim()) {
      setError('At least two responses (A and B) are required');
      return false;
    }
    
    // Ensure we have at least one correct answer
    if (correctAnswers.length === 0) {
      setError('At least one response must be marked as correct');
      return false;
    }
    
    // If Multiple Choice, ensure only one answer is selected
    if (!isMultipleResponse && correctAnswers.length > 1) {
      setError('Multiple Choice questions can only have one correct answer');
      return false;
    }
    
    // For Multiple Response, ensure we don't exceed 3 correct answers
    if (isMultipleResponse && correctAnswers.length > 3) {
      setError('Multiple Response questions cannot have more than 3 correct answers');
      return false;
    }
    
    // Clear any previous errors
    setError(null);
    return true;
  };

  const handleResponseChange = (index: number, field: 'text' | 'rationale', value: string) => {
    switch (index) {
      case 0: // A
        field === 'text' ? setResponseA(value) : setRationaleA(value);
        break;
      case 1: // B
        field === 'text' ? setResponseB(value) : setRationaleB(value);
        break;
      case 2: // C
        field === 'text' ? setResponseC(value) : setRationaleC(value);
        break;
      case 3: // D
        field === 'text' ? setResponseD(value) : setRationaleD(value);
        break;
      case 4: // E
        field === 'text' ? setResponseE(value) : setRationaleE(value);
        break;
      case 5: // F
        field === 'text' ? setResponseF(value) : setRationaleF(value);
        break;
      case 6: // G
        field === 'text' ? setResponseG(value) : setRationaleG(value);
        break;
      case 7: // H
        field === 'text' ? setResponseH(value) : setRationaleH(value);
        break;
    }
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    try {
      if (!validateForm()) {
        console.log('Form validation failed');
        return;
      }

      if (id) {
        // Update existing item
        const existingItem = await client.models.Item.get({ 
          QuestionId: parseInt(id, 10),
          CreatedDate: createdDate
        });
        if (existingItem) {
          const updatedItem = {
            QuestionId: parseInt(id, 10),
            CreatedDate: createdDate,
            Question: question,
            Type: isMultipleResponse ? 'Multiple Response' : 'Multiple Choice',
            Status: status,
            Key: correctAnswers.join(''),
            responseA: responseA,
            responseB: responseB,
            responseC: responseC,
            responseD: responseD,
            responseE: responseE,
            responseF: responseF,
            responseG: responseG,
            responseH: responseH,
            rationaleA: rationaleA,
            rationaleB: rationaleB,
            rationaleC: rationaleC,
            rationaleD: rationaleD,
            rationaleE: rationaleE,
            rationaleF: rationaleF,
            rationaleG: rationaleG,
            rationaleH: rationaleH,
            Topic: topic,
            Rationale: rationale,
            KnowledgeSkills: knowledgeSkills,
            CreatedBy: createdBy || 'system',
            // Include LLM fields if available
            LLMKey: generatedRationale?.llmKey || existingItem.data?.LLMKey || '',
            LLMRationaleA: generatedRationale?.llmRationaleA || existingItem.data?.LLMRationaleA || '',
            LLMRationaleB: generatedRationale?.llmRationaleB || existingItem.data?.LLMRationaleB || '',
            LLMRationaleC: generatedRationale?.llmRationaleC || existingItem.data?.LLMRationaleC || '',
            LLMRationaleD: generatedRationale?.llmRationaleD || existingItem.data?.LLMRationaleD || '',
            LLMRationaleE: generatedRationale?.llmRationaleE || existingItem.data?.LLMRationaleE || '',
            LLMRationaleF: generatedRationale?.llmRationaleF || existingItem.data?.LLMRationaleF || '',
            LLMGeneralRationale: generatedRationale?.llmGeneralRationale || existingItem.data?.LLMGeneralRationale || '',
          };
          await client.models.Item.update(updatedItem);
          setSuccess('Item updated successfully!');
          resetUnsavedChanges();
          
          // Execute pending navigation if there was one
          if (pendingNavigation) {
            executeNavigation();
          }
        }
      } else {
        // Create new item
        const newItem = {
          QuestionId: questionId,
          CreatedDate: createdDate,
          Question: question,
          Type: isMultipleResponse ? 'Multiple Response' : 'Multiple Choice',
          Status: status,
          Key: correctAnswers.join(''),
          responseA: responseA,
          responseB: responseB,
          responseC: responseC,
          responseD: responseD,
          responseE: responseE,
          responseF: responseF,
          responseG: responseG,
          responseH: responseH,
          rationaleA: rationaleA,
          rationaleB: rationaleB,
          rationaleC: rationaleC,
          rationaleD: rationaleD,
          rationaleE: rationaleE,
          rationaleF: rationaleF,
          rationaleG: rationaleG,
          rationaleH: rationaleH,
          Topic: topic,
          Rationale: rationale,
          KnowledgeSkills: knowledgeSkills,
          CreatedBy: createdBy || 'system',
          // Include LLM fields if available
          LLMKey: generatedRationale?.llmKey || '',
          LLMRationaleA: generatedRationale?.llmRationaleA || '',
          LLMRationaleB: generatedRationale?.llmRationaleB || '',
          LLMRationaleC: generatedRationale?.llmRationaleC || '',
          LLMRationaleD: generatedRationale?.llmRationaleD || '',
          LLMRationaleE: generatedRationale?.llmRationaleE || '',
          LLMRationaleF: generatedRationale?.llmRationaleF || '',
          LLMGeneralRationale: generatedRationale?.llmGeneralRationale || '',
        };
        await client.models.Item.create(newItem);
        setSuccess('Item created successfully!');
        resetUnsavedChanges();
      }
    } catch (err) {
      console.error('Error saving item:', err);
      setError(`Failed to save item: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Action options dropdown
  const actionOptions = [
    { label: 'Run Item Rules', value: 'runRules' },
    { label: 'Generate Rationale', value: 'generateRationale' },
    { label: 'Validate Items', value: 'validateItems' }
  ];

  const handleActionChange = ({ detail }: { detail: SelectProps.ChangeDetail }) => {
    if (!detail.selectedOption) return;
    
    const action = detail.selectedOption.value as string;
    
    if (action === 'runRules') {
      // Placeholder for Run Item Rules functionality
      alert('Run Item Rules functionality will be implemented later');
    } else if (action === 'generateRationale') {
      // Call the Generate Rationale functionality
      handleGenerateRationale();
    } else if (action === 'validateItems') {
      // Placeholder for Validate Items functionality
      alert('Validate Items functionality will be implemented later');
    }
    
    // Reset the selected action (visual feedback that the action was performed)
    setTimeout(() => setSelectedAction(null), 500);
  };

  // Function to handle Generate Rationale
  const handleGenerateRationale = async () => {
    try {
      // Validate that we have enough data to generate a rationale
      if (!question.trim()) {
        setError('Question is required to generate a rationale');
        return;
      }
      
      if (!responseA.trim() || !responseB.trim() || !responseC.trim() || !responseD.trim()) {
        setError('All four basic responses (A-D) are required to generate a rationale');
        return;
      }
      
      // Show the modal and set loading state
      setLLMRationaleError(null);
      setShowLLMRationaleModal(true);
      setLLMRationaleLoading(true);
      
      // Create a request object with the current item data
      const itemData: Partial<Item> = {
        Question: question,
        responseA,
        responseB,
        responseC,
        responseD,
        responseE,
        responseF,
        Type: isMultipleResponse ? 'Multiple Response' : 'Multiple Choice'
      };
      
      // Call the Lambda function via the client
      const result = await generateRationaleWithLLM(itemData);
      
      // Set the generated rationale in the state
      setGeneratedRationale(result);
    } catch (err) {
      console.error('Error generating rationale:', err);
      setLLMRationaleError(`Failed to generate rationale: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLLMRationaleLoading(false);
    }
  };

  // Function to handle accepting the AI-generated rationale
  const handleAcceptRationale = (rationaleData: GeneratedRationale) => {
    // Map the LLM rationale to our state
    if (rationaleData.llmKey) {
      setCorrectAnswers(rationaleData.llmKey.split(',').map(k => k.trim()));
    }
    
    // Update the rationale fields
    setRationaleA(prevRationale => 
      rationaleData.llmRationaleA ? rationaleData.llmRationaleA : prevRationale);
    setRationaleB(prevRationale => 
      rationaleData.llmRationaleB ? rationaleData.llmRationaleB : prevRationale);
    setRationaleC(prevRationale => 
      rationaleData.llmRationaleC ? rationaleData.llmRationaleC : prevRationale);
    setRationaleD(prevRationale => 
      rationaleData.llmRationaleD ? rationaleData.llmRationaleD : prevRationale);
    
    if (rationaleData.llmRationaleE) {
      setRationaleE(rationaleData.llmRationaleE);
    }
    
    if (rationaleData.llmRationaleF) {
      setRationaleF(rationaleData.llmRationaleF);
    }
    
    if (rationaleData.llmGeneralRationale) {
      setRationale(rationaleData.llmGeneralRationale);
    }
    
    // Close the modal
    setShowLLMRationaleModal(false);
    
    // Show success message
    setSuccess('AI-generated rationale applied successfully');
    
    // Mark that we have unsaved changes
    setHasUnsavedChanges(true);
  };

  // Update the handleAddResponse and handleRemoveResponse functions
  const handleAddResponse = () => {
    if (isMultipleResponse && numResponsesToShow < 6) {
      setNumResponsesToShow(numResponsesToShow + 1);
    }
  };

  const handleRemoveResponse = () => {
    if (isMultipleResponse && numResponsesToShow > 5) {
      const newNum = numResponsesToShow - 1;
      setNumResponsesToShow(newNum);
      
      // If removing a response that was marked as correct, update correctAnswers
      const letterToRemove = String.fromCharCode(64 + numResponsesToShow); // E.g., 6 -> 'F'
      if (correctAnswers.includes(letterToRemove)) {
        setCorrectAnswers(correctAnswers.filter(l => l !== letterToRemove));
      }
    }
  };

  // Function to render a response section with consistent styling
  const renderResponseSection = (
    letter: string, 
    responseValue: string, 
    rationaleValue: string, 
    index: number
  ) => {
    // Don't render if response is empty (for all responses)
    if (!responseValue || responseValue.trim() === '') {
      return null;
    }
    
    const isCorrectAnswer = correctAnswers.includes(letter);
    const canSelectMore = isMultipleResponse && (correctAnswers.length < 3 || isCorrectAnswer);

    return (
      <Container>
          <div style={responseHeaderStyle}>
            <span style={{ fontWeight: 'bold' }}>Response {letter}</span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={correctLabelStyle(isCorrectAnswer)}>Correct</span>
              {isMultipleResponse ? (
                // For Multiple Response, use checkboxes (max 3 selections)
                <Checkbox
                  checked={isCorrectAnswer}
                  disabled={!canSelectMore && !isCorrectAnswer}
                  onChange={({ detail }) => {
                    if (detail.checked) {
                      if (correctAnswers.length < 3) {
                        setCorrectAnswers([...correctAnswers, letter]);
                      }
                    } else {
                      if (correctAnswers.length > 1) {
                        setCorrectAnswers(correctAnswers.filter(a => a !== letter));
                      } else {
                        // Don't allow unchecking the last correct answer
                        return;
                      }
                    }
                  }}
                />
              ) : (
                // For Multiple Choice, use toggle switch instead of radio button
                <Toggle
                  checked={isCorrectAnswer}
                  onChange={({ detail }) => {
                    if (detail.checked) {
                      setCorrectAnswers([letter]);
                    }
                  }}
                />
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }} data-testid="response-container">
            <div style={{ flex: 1 }} data-testid="text-container">
              <FormField
                label="Response"
                errorText={error}
                stretch
              >
                <TextArea
                  value={responseValue}
                  onChange={({ detail }) => handleResponseChange(index, 'text', detail.value)}
                  rows={4}
                />
              </FormField>
            </div>
            <div style={{ flex: 1 }} data-testid="rationale-container">
              <EditableRationale
                value={rationaleValue}
                onChange={(value) => handleResponseChange(index, 'rationale', value)}
                label="Rationale"
                rows={4}
              />
            </div>
          </div>
      </Container>
    );
  };

  // Add navigation functions
  const navigateToPreviousItem = () => {
    if (currentItemIndex > 0) {
      if (hasUnsavedChanges) {
        setPendingNavigation('previous');
        setShowNavigationModal(true);
      } else {
        executeNavigation('previous');
      }
    }
  };

  const navigateToNextItem = () => {
    if (currentItemIndex < allItems.length - 1) {
      if (hasUnsavedChanges) {
        setPendingNavigation('next');
        setShowNavigationModal(true);
      } else {
        executeNavigation('next');
      }
    }
  };

  const executeNavigation = (direction?: 'next' | 'previous') => {
    // Use the provided direction or fall back to pendingNavigation state
    const navigationDirection = direction || pendingNavigation;
    
    if (navigationDirection === 'previous' && currentItemIndex > 0) {
      const prevItem = allItems[currentItemIndex - 1];
      navigate(`/items/${prevItem.QuestionId}/edit`);
    } else if (navigationDirection === 'next' && currentItemIndex < allItems.length - 1) {
      const nextItem = allItems[currentItemIndex + 1];
      navigate(`/items/${nextItem.QuestionId}/edit`);
    }
    setShowNavigationModal(false);
    setPendingNavigation(null);
  };

  const handleNavigationConfirm = async () => {
    try {
      // Create a synthetic event to pass to handleSave
      const syntheticEvent = { preventDefault: () => {} };
      
      // Save current changes
      await handleSave(syntheticEvent);
      
      // Then navigate if save was successful
      if (pendingNavigation) {
        executeNavigation();
      }
    } catch (err) {
      console.error('Error saving before navigation:', err);
      setError('Failed to save changes before navigation');
      setShowNavigationModal(false);
    }
  };

  const handleNavigationCancel = () => {
    setShowNavigationModal(false);
    setPendingNavigation(null);
  };

  const handleNavigationDiscard = () => {
    if (pendingNavigation) {
      executeNavigation(pendingNavigation);
    }
  };

  return (
    <>
      <AppLayout
        content={
          <SpaceBetween size="l">
            <Container>
              <SpaceBetween size="l">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Header
                    variant="h1"
                  >
                    {id ? 'Edit Item' : 'Create New Item'}
                  </Header>
                  <div style={{ width: '250px' }}>
                    <Select
                      selectedOption={selectedAction}
                      onChange={handleActionChange}
                      options={actionOptions}
                      placeholder="Select an action"
                    />
                  </div>
                </div>
                
                {error && (
                  <div role="alert">
                    <Alert type="error" header="Error">
                      {error}
                    </Alert>
                  </div>
                )}
                {success && (
                  <div role="alert">
                    <Alert type="success" header="Success">
                      {success}
                    </Alert>
                  </div>
                )}

                <Form
                  actions={
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button onClick={() => navigate('/')} disabled={loading}>
                        Cancel
                      </Button>
                      <Button 
                        variant="primary" 
                        onClick={handleSave}
                        loading={loading}
                      >
                        {id ? 'Save changes' : 'Create item'}
                      </Button>
                    </SpaceBetween>
                  }
                >
                  <SpaceBetween size="l">
                    {/* Basic Information Section */}
                    <Container>
                      <div>
                        <SpaceBetween size="l">
                          <Header variant="h2">Basic Information</Header>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div>
                              <FormField
                                label="Question ID"
                              >
                                <Input
                                  value={questionId.toString()}
                                  disabled
                                />
                              </FormField>
                            </div>
                            <div>
                              <FormField
                                label="Created By"
                              >
                                <Input
                                  value={createdBy}
                                  disabled
                                />
                              </FormField>
                            </div>
                            <div>
                              <FormField
                                label="Created Date"
                              >
                                <Input
                                  value={createdDate}
                                  disabled
                                />
                              </FormField>
                            </div>
                            <div>
                              <FormField
                                label="Topic"
                              >
                                <Input
                                  value={topic}
                                  disabled
                                />
                              </FormField>
                            </div>
                            <div>
                              <FormField
                                label="Knowledge/Skills"
                              >
                                <Input
                                  value={knowledgeSkills}
                                  disabled
                                />
                              </FormField>
                            </div>
                          </div>

                          <FormField
                            label="Question"
                            errorText={error}
                            stretch
                          >
                            <div>
                              <TextArea
                                value={question}
                                onChange={({ detail }) => setQuestion(detail.value)}
                                rows={3}
                              />
                            </div>
                          </FormField>
                        </SpaceBetween>
                      </div>
                    </Container>

                    {/* Responses Section */}
                    <Container>
                      <div>
                        <SpaceBetween size="l">
                          <Header variant="h2">Responses</Header>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 'bold' }}>Response Type</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>Multiple Choice</span>
                              <Toggle
                                checked={isMultipleResponse}
                                onChange={({ detail }) => {
                                  setIsMultipleResponse(detail.checked);
                                }}
                              />
                              <span>Multiple Response</span>
                            </div>
                          </div>
                          
                          {/* Always render responses A through D */}
                          {renderResponseSection('A', responseA, rationaleA, 0)}
                          {renderResponseSection('B', responseB, rationaleB, 1)}
                          {renderResponseSection('C', responseC, rationaleC, 2)}
                          {renderResponseSection('D', responseD, rationaleD, 3)}
                          
                          {/* Conditional responses E-F based on numResponsesToShow and content */}
                          {numResponsesToShow >= 5 && renderResponseSection('E', responseE, rationaleE, 4)}
                          {numResponsesToShow >= 6 && renderResponseSection('F', responseF, rationaleF, 5)}
                          
                          {/* Add/Remove response controls for Multiple Response */}
                          {isMultipleResponse && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                              {numResponsesToShow > 5 && (
                                <Button onClick={handleRemoveResponse}>
                                  Remove Response
                                </Button>
                              )}
                              {numResponsesToShow < 6 && (
                                <Button onClick={handleAddResponse}>
                                  Add Response
                                </Button>
                              )}
                            </div>
                          )}
                        </SpaceBetween>
                      </div>
                    </Container>

                    {/* General Rationale Section */}
                    <Container>
                      <div>
                        <SpaceBetween size="l">
                          <Header variant="h2">General Rationale</Header>
                          
                          <EditableRationale
                            value={rationale}
                            onChange={setRationale}
                          />
                        </SpaceBetween>
                      </div>
                    </Container>

                    {/* Navigation Buttons - Only show for edit mode */}
                    {id && (
                      <Container>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                          <Button 
                            onClick={navigateToPreviousItem} 
                            disabled={isFirstItem || loading}
                            iconName="angle-left"
                          >
                            Previous
                          </Button>
                          
                          <Button 
                            onClick={navigateToNextItem} 
                            disabled={isLastItem || loading}
                            iconName="angle-right"
                            iconAlign="right"
                          >
                            Next
                          </Button>
                        </div>
                      </Container>
                    )}
                  </SpaceBetween>
                </Form>
              </SpaceBetween>
            </Container>
          </SpaceBetween>
        }
        breadcrumbs={
          <BreadcrumbGroup
            items={[
              { text: 'Home', href: '/' },
              { text: id ? 'Edit Item' : 'Create Item', href: '#' }
            ]}
            ariaLabel="Breadcrumbs"
          />
        }
        navigationHide
        toolsHide
      />
      
      {/* Navigation Confirmation Modal moved outside AppLayout */}
      <Modal
        visible={showNavigationModal}
        onDismiss={handleNavigationCancel}
        header="Unsaved Changes"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={handleNavigationCancel}>Cancel</Button>
              <Button variant="normal" onClick={handleNavigationDiscard}>Discard Changes</Button>
              <Button variant="primary" onClick={handleNavigationConfirm}>Save & Continue</Button>
            </SpaceBetween>
          </Box>
        }
        size="small"
      >
        <p>You have unsaved changes. What would you like to do?</p>
      </Modal>

      {/* Add the LLM Rationale Modal */}
      <LLMRationaleModal
        visible={showLLMRationaleModal}
        onDismiss={() => setShowLLMRationaleModal(false)}
        onAccept={handleAcceptRationale}
        loading={llmRationaleLoading}
        error={llmRationaleError}
        generatedRationale={generatedRationale}
        question={question}
        responses={[
          ...(responseA && responseA.trim() !== '' ? [{ letter: 'A', text: responseA, rationale: rationaleA }] : []),
          ...(responseB && responseB.trim() !== '' ? [{ letter: 'B', text: responseB, rationale: rationaleB }] : []),
          ...(responseC && responseC.trim() !== '' ? [{ letter: 'C', text: responseC, rationale: rationaleC }] : []),
          ...(responseD && responseD.trim() !== '' ? [{ letter: 'D', text: responseD, rationale: rationaleD }] : []),
          ...(responseE && responseE.trim() !== '' ? [{ letter: 'E', text: responseE, rationale: rationaleE }] : []),
          ...(responseF && responseF.trim() !== '' ? [{ letter: 'F', text: responseF, rationale: rationaleF }] : [])
        ]}
      />
    </>
  );
} 