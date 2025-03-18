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
            setCreatedDate(item.data.CreatedDate);
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
            
            // Determine how many responses to show
            let responsesToShow = 4; // Default to A-D
            if (item.data.responseH && item.data.responseH.trim()) responsesToShow = 8;
            else if (item.data.responseG && item.data.responseG.trim()) responsesToShow = 7;
            else if (item.data.responseF && item.data.responseF.trim()) responsesToShow = 6;
            else if (item.data.responseE && item.data.responseE.trim()) responsesToShow = 5;
            setNumResponsesToShow(responsesToShow);
            
            // Check if this is a multiple response question
            const isMRQ = item.data.Type === 'MRQ';
            setIsMultipleResponse(isMRQ);
            
            // Handle correct answers from Key field
            if ('Key' in item.data && typeof item.data.Key === 'string') {
              if (item.data.Key.includes(',')) {
                // Multiple response with comma-separated values
                setCorrectAnswers(item.data.Key.split(','));
              } else {
                // Key might be multiple characters without commas (like "ABC")
                const keyChars = item.data.Key.split('');
                setCorrectAnswers(keyChars);
              }
            } else if ('Rationale' in item.data && typeof item.data.Rationale === 'string') {
              // Backward compatibility for old data
              const firstChar = item.data.Rationale.trim().charAt(0).toUpperCase();
              if (['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].includes(firstChar)) {
                setCorrectAnswers([firstChar]);
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
    } else {
      // For MCQ, show exactly 4 responses
      setNumResponsesToShow(4);
      
      // If switching from MRQ to MCQ, ensure only one answer is selected
      if (correctAnswers.length > 1) {
        setCorrectAnswers([correctAnswers[0]]);
      }
    }
  }, [isMultipleResponse]);

  const validateForm = () => {
    if (!question.trim()) {
      setError('Question is required');
      return false;
    }

    if (!responseA.trim() || !responseB.trim() || !responseC.trim() || !responseD.trim()) {
      setError('At least 4 response options are required');
      return false;
    }

    if (isMultipleResponse) {
      // For multiple response, require at least 1 correct answer
      if (correctAnswers.length === 0) {
        setError('At least one correct answer must be selected');
        return false;
      }
      
      // For multiple response, require at most 3 correct answers
      if (correctAnswers.length > 3) {
        setError('At most 3 correct answers can be selected');
        return false;
      }
      
      // Check additional required responses based on numResponsesToShow
      if (numResponsesToShow >= 5 && !responseE.trim()) {
        setError('Response E is required for Multiple Response questions with 5 or more options');
        return false;
      }
      
      if (numResponsesToShow >= 6 && !responseF.trim()) {
        setError('Response F is required for Multiple Response questions with 6 or more options');
        return false;
      }
      
      if (numResponsesToShow >= 7 && !responseG.trim()) {
        setError('Response G is required for Multiple Response questions with 7 or more options');
        return false;
      }
      
      if (numResponsesToShow >= 8 && !responseH.trim()) {
        setError('Response H is required for Multiple Response questions with 8 options');
        return false;
      }
    } else {
      // For multiple choice, require exactly 1 correct answer
      if (correctAnswers.length !== 1) {
        setError('Exactly one correct answer must be selected for Multiple Choice questions');
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleResponseChange = (index: number, field: 'text' | 'rationale', value: string) => {
    switch (index) {
      case 0:
        if (field === 'text') setResponseA(value);
        else setRationaleA(value);
        break;
      case 1:
        if (field === 'text') setResponseB(value);
        else setRationaleB(value);
        break;
      case 2:
        if (field === 'text') setResponseC(value);
        else setRationaleC(value);
        break;
      case 3:
        if (field === 'text') setResponseD(value);
        else setRationaleD(value);
        break;
      case 4:
        if (field === 'text') setResponseE(value);
        else setRationaleE(value);
        break;
      case 5:
        if (field === 'text') setResponseF(value);
        else setRationaleF(value);
        break;
      case 6:
        if (field === 'text') setResponseG(value);
        else setRationaleG(value);
        break;
      case 7:
        if (field === 'text') setResponseH(value);
        else setRationaleH(value);
        break;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Construct item data with all responses
      const itemData = {
        Question: question,
        Type: isMultipleResponse ? 'MRQ' : 'MCQ',
        Status: status,
        responseA,
        responseB,
        responseC,
        responseD,
        rationaleA,
        rationaleB,
        rationaleC,
        rationaleD,
        Key: correctAnswers.join(','),
        Rationale: rationale
      };

      // Add optional responses based on numResponsesToShow
      if (numResponsesToShow >= 5) {
        Object.assign(itemData, { 
          responseE, 
          rationaleE 
        });
      }
      
      if (numResponsesToShow >= 6) {
        Object.assign(itemData, { 
          responseF, 
          rationaleF 
        });
      }
      
      if (numResponsesToShow >= 7) {
        Object.assign(itemData, { 
          responseG, 
          rationaleG 
        });
      }
      
      if (numResponsesToShow >= 8) {
        Object.assign(itemData, { 
          responseH, 
          rationaleH 
        });
      }

      if (isEditing && id) {
        await client.models.Item.update({
          QuestionId: questionId,
          CreatedDate: createdDate,
          ...itemData
        });
      } else {
        await client.models.Item.create({
          QuestionId: questionId,
          CreatedDate: createdDate,
          ...itemData
        });
      }

      navigate('/');
    } catch (err) {
      console.error('Error saving item:', err);
      setError('Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const actionOptions: SelectProps.Options = [
    { label: "Generate Rational", value: "generate" },
    { label: "Validate Item", value: "validate" },
    { label: "Run Item Rules", value: "rules" }
  ];

  const handleActionChange = ({ detail }: { detail: SelectProps.ChangeDetail }) => {
    setSelectedAction(detail.selectedOption);
    
    // Implement action based on selection
    if (detail.selectedOption) {
      switch (detail.selectedOption.value) {
        case "generate":
          // TODO: Implement Generate Rational functionality
          console.log("Generate Rational selected");
          break;
        case "validate":
          // TODO: Implement Validate Item functionality
          console.log("Validate Item selected");
          break;
        case "rules":
          // TODO: Implement Run Item Rules functionality
          console.log("Run Item Rules selected");
          break;
      }
    }
    
    // Reset selection after action is performed
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
    const canSelectMore = correctAnswers.length < 3 || isCorrectAnswer;

    return (
      <Container>
          <div style={responseHeaderStyle}>
            <span style={{ fontWeight: 'bold' }}>Response {letter}</span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={correctLabelStyle(isCorrectAnswer)}>Correct</span>
              {isMultipleResponse ? (
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
                      }
                    }
                  }}
                />
              ) : (
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
                description="Explain why this response is correct or incorrect"
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
              <Header
                variant="h1"
              >
                {id ? 'Edit Item' : 'Create New Item'}
              </Header>
              
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
                        
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
                          <div style={{ width: '200px' }}>
                            <FormField
                              label="Question ID"
                              description="A unique identifier for this question"
                            >
                              <Input
                                value={questionId.toString()}
                                disabled
                              />
                            </FormField>
                          </div>
                          <div style={{ flex: 1 }}></div>
                          <div style={{ width: '250px' }}>
                            <FormField
                              label="Actions"
                            >
                              <Select
                                selectedOption={selectedAction}
                                onChange={handleActionChange}
                                options={actionOptions}
                                placeholder="Select an action"
                              />
                            </FormField>
                          </div>
                        </div>

                        <FormField
                          label="Question"
                          description="The question or scenario presented to the candidate"
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
                            {numResponsesToShow > 4 && (
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
            { text: "Home", href: "/" },
            { text: id ? "Edit Item" : "Create Item", href: "#" }
          ]}
        />
      }
      navigationHide
      toolsHide
      contentType="default"
      maxContentWidth={1200}
    />
  );
} 