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
import { client } from "../main";

// Styles for the textarea wrapper
const textareaWrapperStyle = {
  width: '100%'
};

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
  const [rationaleA, setRationaleA] = useState<string>('');
  const [rationaleB, setRationaleB] = useState<string>('');
  const [rationaleC, setRationaleC] = useState<string>('');
  const [rationaleD, setRationaleD] = useState<string>('');
  const [rationaleE, setRationaleE] = useState<string>('');
  const [rationaleF, setRationaleF] = useState<string>('');
  const [rationale, setRationale] = useState<string>('');
  const [correctAnswer, setCorrectAnswer] = useState<string>('A');
  const [type, setType] = useState<string>('MCQ');
  const [status, setStatus] = useState<string>('Draft');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing] = useState<boolean>(!!id);
  const [selectedAction, setSelectedAction] = useState<SelectProps.Option | null>(null);

  useEffect(() => {
    async function fetchItem() {
      if (id) {
        try {
          setLoading(true);
          const item = await client.models.Item.get({
            QuestionId: parseInt(id, 10),
            CreatedDate: createdDate
          });
          if (item?.data) {
            setQuestionId(item.data.QuestionId);
            setCreatedDate(item.data.CreatedDate);
            setQuestion(item.data.Question);
            setResponseA(item.data.responseA || '');
            setResponseB(item.data.responseB || '');
            setResponseC(item.data.responseC || '');
            setResponseD(item.data.responseD || '');
            // Optional fields
            if ('responseE' in item.data && typeof item.data.responseE === 'string') setResponseE(item.data.responseE);
            if ('responseF' in item.data && typeof item.data.responseF === 'string') setResponseF(item.data.responseF);
            setRationaleA(item.data.rationaleA || '');
            setRationaleB(item.data.rationaleB || '');
            setRationaleC(item.data.rationaleC || '');
            setRationaleD(item.data.rationaleD || '');
            // Optional fields
            if ('rationaleE' in item.data && typeof item.data.rationaleE === 'string') setRationaleE(item.data.rationaleE);
            if ('rationaleF' in item.data && typeof item.data.rationaleF === 'string') setRationaleF(item.data.rationaleF);
            if ('Key' in item.data && typeof item.data.Key === 'string') {
              setCorrectAnswer(item.data.Key);
            } else if ('Rationale' in item.data && typeof item.data.Rationale === 'string') {
              // Backward compatibility for old data
              const firstChar = item.data.Rationale.trim().charAt(0).toUpperCase();
              if (['A', 'B', 'C', 'D', 'E', 'F'].includes(firstChar)) {
                setCorrectAnswer(firstChar);
              }
            }
            if ('Rationale' in item.data && typeof item.data.Rationale === 'string') {
              setRationale(item.data.Rationale);
            }
            if ('Type' in item.data && typeof item.data.Type === 'string') setType(item.data.Type);
            if ('Status' in item.data && typeof item.data.Status === 'string') setStatus(item.data.Status);
          }
        } catch (err) {
          setError(`Error loading item: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchItem();
  }, [id, createdDate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, any> = {};

    // Validate question
    if (!question.trim()) {
      newErrors.question = "Question is required";
    }

    // Validate responses
    const responseErrors: string[] = [];
    if (!responseA.trim()) {
      responseErrors.push("Response A text is required");
    }
    if (!rationaleA.trim()) {
      responseErrors.push("Response A rationale is required");
    }
    if (!responseB.trim()) {
      responseErrors.push("Response B text is required");
    }
    if (!rationaleB.trim()) {
      responseErrors.push("Response B rationale is required");
    }
    if (!responseC.trim()) {
      responseErrors.push("Response C text is required");
    }
    if (!rationaleC.trim()) {
      responseErrors.push("Response C rationale is required");
    }
    if (!responseD.trim()) {
      responseErrors.push("Response D text is required");
    }
    if (!rationaleD.trim()) {
      responseErrors.push("Response D rationale is required");
    }

    if (responseErrors.length > 0) {
      newErrors.responses = responseErrors;
    }

    setError(null);
    return Object.keys(newErrors).length === 0;
  };

  const handleResponseChange = (index: number, field: 'text' | 'rationale', value: string) => {
    // This function is a placeholder for future functionality
    // Currently, we're using direct state setters for each field
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
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const itemData = {
        Question: question,
        Type: type,
        Status: status,
        responseA,
        responseB,
        responseC,
        responseD,
        responseE,
        responseF,
        rationaleA,
        rationaleB,
        rationaleC,
        rationaleD,
        rationaleE,
        rationaleF,
        Key: correctAnswer,
        Rationale: rationale
      };

      if (isEditing && id) {
        await client.models.Item.update({
          QuestionId: parseInt(id, 10),
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
      setError(`Error saving item: ${err instanceof Error ? err.message : String(err)}`);
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

  // Function to render a response section with consistent styling
  const renderResponseSection = (
    letter: string, 
    responseValue: string, 
    rationaleValue: string, 
    index: number
  ) => {
    const isCorrectAnswer = correctAnswer === letter;

    return (
      <Container>
          <div style={responseHeaderStyle}>
            <span style={{ fontWeight: 'bold' }}>Response {letter}</span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={correctLabelStyle(isCorrectAnswer)}>Correct</span>
              <Toggle
                checked={isCorrectAnswer}
                onChange={() => setCorrectAnswer(letter)}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', width: '100%' }} data-testid="response-container">
            <div style={{ flex: 1 }} data-testid="text-container">
              <FormField
                label="Text"
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
              <FormField
                label="Rationale"
                errorText={error}
                stretch
              >
                <TextArea
                  value={rationaleValue}
                  onChange={({ detail }) => handleResponseChange(index, 'rationale', detail.value)}
                  rows={4}
                />
              </FormField>
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
                        
                        {renderResponseSection('A', responseA, rationaleA, 0)}
                        {renderResponseSection('B', responseB, rationaleB, 1)}
                        {renderResponseSection('C', responseC, rationaleC, 2)}
                        {renderResponseSection('D', responseD, rationaleD, 3)}
                        
                        {/* Optional responses */}
                        {(responseE || !isEditing) && renderResponseSection('E', responseE, rationaleE, 4)}
                        {(responseF || !isEditing) && renderResponseSection('F', responseF, rationaleF, 5)}
                      </SpaceBetween>
                    </div>
                  </Container>

                  {/* General Rationale Section */}
                  <Container>
                    <div>
                      <SpaceBetween size="l">
                        <Header variant="h2">General Rationale</Header>
                        
                        <FormField
                          label="Explanation"
                          description="Provide a general explanation for the correct answer and overall context"
                          stretch
                        >
                          <div style={textareaWrapperStyle}>
                            <TextArea
                              value={rationale}
                              onChange={({ detail }) => setRationale(detail.value)}
                              rows={6}
                            />
                          </div>
                        </FormField>
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