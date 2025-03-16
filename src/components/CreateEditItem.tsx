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
import Grid from "@cloudscape-design/components/grid";
import { client } from "../main";

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
            if ('Rationale' in item.data && typeof item.data.Rationale === 'string') {
              setRationale(item.data.Rationale);
              // Parse Rationale to get correctAnswer
              try {
                const parsedJson = JSON.parse(item.data.Rationale);
                if (parsedJson.correctAnswer) {
                  setCorrectAnswer(parsedJson.correctAnswer);
                }
              } catch (e) {
                console.error('Error parsing Rationale:', e);
              }
            } else if ('responsesJson' in item.data && typeof item.data.responsesJson === 'string') {
              // Backward compatibility for old data
              setRationale(item.data.responsesJson);
              // Parse responsesJson to get correctAnswer
              try {
                const parsedJson = JSON.parse(item.data.responsesJson);
                if (parsedJson.correctAnswer) {
                  setCorrectAnswer(parsedJson.correctAnswer);
                }
              } catch (e) {
                console.error('Error parsing responsesJson:', e);
              }
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

  // Update Rationale when correctAnswer changes
  useEffect(() => {
    setRationale(JSON.stringify({ correctAnswer }));
  }, [correctAnswer]);

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
                  <Container>
                    <FormField
                      label="Question ID"
                      description="A unique identifier for this question"
                    >
                      <Input
                        value={questionId.toString()}
                        disabled
                      />
                    </FormField>
                  </Container>

                  <Container>
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
                  </Container>

                  {/* Response A and Rationale A side by side */}
                  <Container>
                    <Grid
                      gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}
                    >
                      <FormField
                        label="Response A"
                        errorText={error}
                        stretch
                      >
                        <TextArea
                          value={responseA}
                          onChange={({ detail }) => handleResponseChange(0, 'text', detail.value)}
                          rows={4}
                        />
                      </FormField>
                      <FormField
                        label="Rationale A"
                        errorText={error}
                        stretch
                      >
                        <TextArea
                          value={rationaleA}
                          onChange={({ detail }) => handleResponseChange(0, 'rationale', detail.value)}
                          rows={4}
                        />
                      </FormField>
                    </Grid>
                  </Container>

                  {/* Response B and Rationale B side by side */}
                  <Container>
                    <Grid
                      gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}
                    >
                      <FormField
                        label="Response B"
                        errorText={error}
                        stretch
                      >
                        <TextArea
                          value={responseB}
                          onChange={({ detail }) => handleResponseChange(1, 'text', detail.value)}
                          rows={4}
                        />
                      </FormField>
                      <FormField
                        label="Rationale B"
                        errorText={error}
                        stretch
                      >
                        <TextArea
                          value={rationaleB}
                          onChange={({ detail }) => handleResponseChange(1, 'rationale', detail.value)}
                          rows={4}
                        />
                      </FormField>
                    </Grid>
                  </Container>

                  {/* Response C and Rationale C side by side */}
                  <Container>
                    <Grid
                      gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}
                    >
                      <FormField
                        label="Response C"
                        errorText={error}
                        stretch
                      >
                        <TextArea
                          value={responseC}
                          onChange={({ detail }) => handleResponseChange(2, 'text', detail.value)}
                          rows={4}
                        />
                      </FormField>
                      <FormField
                        label="Rationale C"
                        errorText={error}
                        stretch
                      >
                        <TextArea
                          value={rationaleC}
                          onChange={({ detail }) => handleResponseChange(2, 'rationale', detail.value)}
                          rows={4}
                        />
                      </FormField>
                    </Grid>
                  </Container>

                  {/* Response D and Rationale D side by side */}
                  <Container>
                    <Grid
                      gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}
                    >
                      <FormField
                        label="Response D"
                        errorText={error}
                        stretch
                      >
                        <TextArea
                          value={responseD}
                          onChange={({ detail }) => handleResponseChange(3, 'text', detail.value)}
                          rows={4}
                        />
                      </FormField>
                      <FormField
                        label="Rationale D"
                        errorText={error}
                        stretch
                      >
                        <TextArea
                          value={rationaleD}
                          onChange={({ detail }) => handleResponseChange(3, 'rationale', detail.value)}
                          rows={4}
                        />
                      </FormField>
                    </Grid>
                  </Container>

                  {/* Response E and Rationale E side by side */}
                  <Container>
                    <Grid
                      gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}
                    >
                      <FormField
                        label="Response E"
                        errorText={error}
                        stretch
                      >
                        <TextArea
                          value={responseE}
                          onChange={({ detail }) => handleResponseChange(4, 'text', detail.value)}
                          rows={4}
                        />
                      </FormField>
                      <FormField
                        label="Rationale E"
                        errorText={error}
                        stretch
                      >
                        <TextArea
                          value={rationaleE}
                          onChange={({ detail }) => handleResponseChange(4, 'rationale', detail.value)}
                          rows={4}
                        />
                      </FormField>
                    </Grid>
                  </Container>

                  {/* Response F and Rationale F side by side */}
                  <Container>
                    <Grid
                      gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}
                    >
                      <FormField
                        label="Response F"
                        errorText={error}
                        stretch
                      >
                        <TextArea
                          value={responseF}
                          onChange={({ detail }) => handleResponseChange(5, 'text', detail.value)}
                          rows={4}
                        />
                      </FormField>
                      <FormField
                        label="Rationale F"
                        errorText={error}
                        stretch
                      >
                        <TextArea
                          value={rationaleF}
                          onChange={({ detail }) => handleResponseChange(5, 'rationale', detail.value)}
                          rows={4}
                        />
                      </FormField>
                    </Grid>
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
            { text: "Items", href: "/items" },
            { text: id ? "Edit item" : "Create new item", href: "#" }
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
      navigationHide
      toolsHide
      contentType="form"
    />
  );
} 