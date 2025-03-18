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
import { listItems } from '../graphql/operations';
import { EditableRationale } from './EditableRationale';

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
  const [isEditing] = useState<boolean>(!!id);
  const [selectedAction, setSelectedAction] = useState<SelectProps.Option | null>(null);
  const [isMultipleResponse, setIsMultipleResponse] = useState<boolean>(false);
  // Track how many response options to display based on data in database
  const [numResponsesToShow, setNumResponsesToShow] = useState<number>(4);

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
      if (id) {
        console.log('Fetching item with ID:', id);
        try {
          setLoading(true);
          
          // First, query the items list to find the correct item and its createdDate
          const items = await listItems();
          console.log('Items list response:', items);
          
          if (!Array.isArray(items) || items.length === 0) {
            console.error('No items found in the database or invalid response');
            setError('Failed to load items list');
            setLoading(false);
            return;
          }
          
          // Find the item with matching ID
          const targetItem = items.find(item => 
            item.QuestionId === parseInt(id, 10)
          );
          
          if (!targetItem) {
            console.error('Item with ID', id, 'not found in the database');
            setError(`Item with ID ${id} not found`);
            setLoading(false);
            return;
          }
          
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
            const qType = item.data.Type || 'MCQ';
            setIsMultipleResponse(qType === 'MRQ');
            
            // Determine how many responses to show based on question type and data
            let responsesToShow = 4; // Default for MCQ
            
            if (qType === 'MRQ') {
              // For MRQ, show at least 6 responses
              responsesToShow = 6;
              
              // But if we have data in G or H, show more
              if (item.data.responseH && item.data.responseH.trim()) responsesToShow = 8;
              else if (item.data.responseG && item.data.responseG.trim()) responsesToShow = 7;
            } else {
              // For MCQ, always show exactly 4 responses
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
        } catch (err) {
          console.error('Error fetching item:', err);
          setError('Failed to load item data');
        } finally {
          setLoading(false);
        }
      }
    }

    fetchItem();
  }, [id]);

  // Automatically adjust numResponsesToShow when switching between MCQ and MRQ
  useEffect(() => {
    if (isMultipleResponse) {
      // For MRQ, make sure we show at least 6 responses
      if (numResponsesToShow < 6) {
        setNumResponsesToShow(6);
      }
      
      // Update the question type
      setIsMultipleResponse(true);
    } else {
      // For MCQ, show exactly 4 responses
      setNumResponsesToShow(4);
      
      // Update the question type
      setIsMultipleResponse(false);
      
      // If switching from MRQ to MCQ, ensure only one answer is selected
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
    
    // If MCQ, ensure only one answer is selected
    if (!isMultipleResponse && correctAnswers.length > 1) {
      setError('Multiple Choice questions can only have one correct answer');
      return false;
    }
    
    // For MRQ, ensure we don't exceed 3 correct answers
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

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    console.log('Saving item with correct answers:', correctAnswers);
    
    try {
      setLoading(true);
      
      // Prepare the item data for save
      const formattedKey = correctAnswers.sort().join(',');
      
      const itemData = {
        QuestionId: questionId,
        CreatedDate: createdDate,
        CreatedBy: createdBy || 'System',
        Topic: topic || '',
        KnowledgeSkills: knowledgeSkills || '',
        Question: question,
        responseA,
        responseB,
        responseC,
        responseD,
        responseE: isMultipleResponse ? responseE : '',
        responseF: isMultipleResponse ? responseF : '',
        responseG: numResponsesToShow >= 7 ? responseG : '',
        responseH: numResponsesToShow >= 8 ? responseH : '',
        rationaleA,
        rationaleB,
        rationaleC,
        rationaleD,
        rationaleE: isMultipleResponse ? rationaleE : '',
        rationaleF: isMultipleResponse ? rationaleF : '',
        rationaleG: numResponsesToShow >= 7 ? rationaleG : '',
        rationaleH: numResponsesToShow >= 8 ? rationaleH : '',
        Key: formattedKey,
        Rationale: rationale,
        Type: isMultipleResponse ? 'MRQ' : 'MCQ',
        Status: status
      };
      
      console.log('Saving item data:', itemData);
      
      if (isEditing) {
        // Update existing item
        await client.models.Item.update(itemData);
        console.log('Item updated successfully');
      } else {
        // Create a new item
        await client.models.Item.create(itemData);
        console.log('Item created successfully');
      }
      
      // Navigate back to the items list
      navigate('/');
    } catch (err) {
      console.error('Error saving item:', err);
      setError('Failed to save item');
    } finally {
      setLoading(false);
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
      // Placeholder for Generate Rationale functionality
      alert('Generate Rationale functionality will be implemented later');
    } else if (action === 'validateItems') {
      // Placeholder for Validate Items functionality
      alert('Validate Items functionality will be implemented later');
    }
    
    // Reset the selected action (visual feedback that the action was performed)
    setTimeout(() => setSelectedAction(null), 500);
  };

  // Add/remove response options for Multiple Response
  const handleAddResponse = () => {
    if (numResponsesToShow < 8) {
      setNumResponsesToShow(numResponsesToShow + 1);
    }
  };

  const handleRemoveResponse = () => {
    if (numResponsesToShow > 4) {
      const newNum = numResponsesToShow - 1;
      setNumResponsesToShow(newNum);
      
      // If removing a response that was marked as correct, update correctAnswers
      const letterToRemove = String.fromCharCode(64 + numResponsesToShow); // E.g., 5 -> 'E'
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

  return (
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
                        
                        {/* Conditional responses E-H based on numResponsesToShow */}
                        {numResponsesToShow >= 5 && renderResponseSection('E', responseE, rationaleE, 4)}
                        {numResponsesToShow >= 6 && renderResponseSection('F', responseF, rationaleF, 5)}
                        {numResponsesToShow >= 7 && renderResponseSection('G', responseG, rationaleG, 6)}
                        {numResponsesToShow >= 8 && renderResponseSection('H', responseH, rationaleH, 7)}
                        
                        {/* Add/Remove response controls for MRQ */}
                        {isMultipleResponse && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            {numResponsesToShow > 6 && (
                              <Button onClick={handleRemoveResponse}>
                                Remove Response
                              </Button>
                            )}
                            {numResponsesToShow < 8 && (
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
  );
} 