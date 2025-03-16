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
import { client } from "../main";

// Consistent styles for AWS console-like appearance
const containerStyles = {
  padding: '20px',
  backgroundColor: '#ffffff',
  borderRadius: '4px',
  boxShadow: '0 1px 1px 0 rgba(0, 28, 36, 0.1)',
  marginBottom: '20px'
};

const responseContainerStyles = {
  padding: '16px',
  backgroundColor: '#f8f8f8',
  borderRadius: '4px',
  marginBottom: '16px',
  border: '1px solid #eaeded'
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
  const [topic, setTopic] = useState<string>('');
  const [knowledgeSkills, setKnowledgeSkills] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [type, setType] = useState<string>('MCQ');
  const [status, setStatus] = useState<string>('Draft');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing] = useState<boolean>(!!id);

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
            } else if ('responsesJson' in item.data && typeof item.data.responsesJson === 'string') {
              // Backward compatibility for old data
              try {
                const parsedJson = JSON.parse(item.data.responsesJson);
                if (parsedJson.correctAnswer) {
                  setCorrectAnswer(parsedJson.correctAnswer);
                }
              } catch (e) {
                console.error('Error parsing responsesJson:', e);
              }
            }
            if ('Rationale' in item.data && typeof item.data.Rationale === 'string') {
              setRationale(item.data.Rationale);
            }
            if ('Topic' in item.data && typeof item.data.Topic === 'string') setTopic(item.data.Topic);
            if ('KnowledgeSkills' in item.data && typeof item.data.KnowledgeSkills === 'string') setKnowledgeSkills(item.data.KnowledgeSkills);
            if ('Tags' in item.data && typeof item.data.Tags === 'string') setTags(item.data.Tags);
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
        Rationale: rationale,
        Topic: topic,
        KnowledgeSkills: knowledgeSkills,
        Tags: tags
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

  // Function to render a response section with consistent styling
  const renderResponseSection = (
    letter: string, 
    responseValue: string, 
    rationaleValue: string, 
    index: number
  ) => {
    return (
      <Container>
        <div style={responseContainerStyles}>
          <FormField
            label={
              <SpaceBetween direction="horizontal" size="xs" alignItems="center">
                <span style={{ fontWeight: 'bold' }}>Response {letter}</span>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '12px', fontWeight: correctAnswer === letter ? 'bold' : 'normal' }}>Correct</span>
                  <Toggle
                    checked={correctAnswer === letter}
                    onChange={({ detail }) => {
                      if (detail.checked) {
                        setCorrectAnswer(letter);
                      }
                    }}
                  />
                </div>
              </SpaceBetween>
            }
          >
            <SpaceBetween size="l">
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
            </SpaceBetween>
          </FormField>
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
                    <div style={containerStyles}>
                      <SpaceBetween size="l">
                        <Header variant="h2">Basic Information</Header>
                        
                        <FormField
                          label="Question ID"
                          description="A unique identifier for this question"
                        >
                          <Input
                            value={questionId.toString()}
                            disabled
                          />
                        </FormField>

                        <FormField
                          label="Question"
                          description="The question or scenario presented to the candidate"
                          errorText={error}
                          stretch
                        >
                          <TextArea
                            value={question}
                            onChange={({ detail }) => setQuestion(detail.value)}
                            rows={3}
                          />
                        </FormField>
                      </SpaceBetween>
                    </div>
                  </Container>

                  {/* Responses Section */}
                  <Container>
                    <div style={containerStyles}>
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
    />
  );
} 