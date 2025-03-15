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
import AppLayout from "@cloudscape-design/components/app-layout";
import TextArea from "@cloudscape-design/components/textarea";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Toggle from "@cloudscape-design/components/toggle";
import Alert from "@cloudscape-design/components/alert";
import { client } from "../main";

interface FormErrors {
  stem?: string;
  responses?: string[];
  correctResponse?: string;
}

export default function CreateEditItem() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [questionId] = useState<string>(
    id || Math.floor(Math.random() * 1000000).toString()
  );
  const [stem, setStem] = useState("");
  const [generalRationale, setGeneralRationale] = useState("");
  const [responses, setResponses] = useState([
    { text: "", rationale: "" },
    { text: "", rationale: "" },
    { text: "", rationale: "" },
    { text: "", rationale: "" }
  ]);
  const [correctResponse, setCorrectResponse] = useState("0");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load existing item data if in edit mode
  useEffect(() => {
    const loadItem = async () => {
      if (id) {
        try {
          setIsLoading(true);
          const response = await client.models.Item.get({
            QuestionId: id,
            CreatedDate: new Date().toISOString()
          });
          const item = response.data;
          if (item) {
            setStem(item.stem);
            setResponses([
              { text: item.responseA, rationale: item.rationaleA },
              { text: item.responseB, rationale: item.rationaleB },
              { text: item.responseC, rationale: item.rationaleC },
              { text: item.responseD, rationale: item.rationaleD }
            ]);
            setCorrectResponse(item.correctResponse);
            setGeneralRationale(item.responsesJson);
          }
        } catch (error) {
          console.error('Error loading item:', error);
          setErrorMessage('Failed to load item. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadItem();
  }, [id]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate stem
    if (!stem.trim()) {
      newErrors.stem = "Stem is required";
    }

    // Validate responses
    const responseErrors: string[] = [];
    responses.forEach((response, index) => {
      if (!response.text.trim()) {
        responseErrors[index] = `Response ${index + 1} text is required`;
      }
      if (!response.rationale.trim()) {
        responseErrors[index] = `Response ${index + 1} rationale is required`;
      }
    });

    if (responseErrors.length > 0) {
      newErrors.responses = responseErrors;
    }

    // Validate at least one correct response is selected
    if (!correctResponse) {
      newErrors.correctResponse = "At least one response must be marked as correct";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResponseChange = (index: number, field: 'text' | 'rationale', value: string) => {
    const newResponses = [...responses];
    newResponses[index] = { ...newResponses[index], [field]: value };
    setResponses(newResponses);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const itemData = {
        QuestionId: questionId,
        CreatedDate: new Date().toISOString(),
        stem,
        responseA: responses[0].text,
        rationaleA: responses[0].rationale,
        responseB: responses[1].text,
        rationaleB: responses[1].rationale,
        responseC: responses[2].text,
        rationaleC: responses[2].rationale,
        responseD: responses[3].text,
        rationaleD: responses[3].rationale,
        correctResponse,
        responsesJson: generalRationale
      };

      if (id) {
        await client.models.Item.update({
          ...itemData,
          QuestionId: id
        });
      } else {
        await client.models.Item.create(itemData);
      }

      navigate('/');
    } catch (error) {
      console.error('Error saving item:', error);
      setErrorMessage('Failed to save item. Please try again.');
    } finally {
      setIsLoading(false);
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
              
              {errorMessage && (
                <Alert type="error" header="Error">
                  {errorMessage}
                </Alert>
              )}

              <Form
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button onClick={() => navigate('/')} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={handleSave}
                      loading={isLoading}
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
                        value={questionId}
                        disabled
                      />
                    </FormField>
                  </Container>

                  <Container>
                    <FormField
                      label="Stem"
                      description="The question or scenario presented to the candidate"
                      errorText={errors.stem}
                      stretch
                    >
                      <TextArea
                        value={stem}
                        onChange={({ detail }) => setStem(detail.value)}
                        rows={3}
                      />
                    </FormField>
                  </Container>

                  {responses.map((response, index) => (
                    <Container
                      key={index}
                      header={
                        <Header 
                          variant="h2"
                          actions={
                            <SpaceBetween direction="horizontal" size="xs">
                              <FormField label="Correct">
                                <Toggle
                                  checked={correctResponse === index.toString()}
                                  onChange={({ detail }) => {
                                    if (detail.checked) {
                                      setCorrectResponse(index.toString());
                                    }
                                  }}
                                />
                              </FormField>
                            </SpaceBetween>
                          }
                        >
                          Response {index + 1}
                        </Header>
                      }
                    >
                      <ColumnLayout columns={2} variant="text-grid">
                        <FormField 
                          label="Text"
                          errorText={errors.responses?.[index]}
                          stretch
                        >
                          <TextArea
                            value={response.text}
                            onChange={({ detail }) => handleResponseChange(index, 'text', detail.value)}
                            rows={4}
                          />
                        </FormField>

                        <FormField 
                          label="Rationale"
                          errorText={errors.responses?.[index]}
                          stretch
                        >
                          <TextArea
                            value={response.rationale}
                            onChange={({ detail }) => handleResponseChange(index, 'rationale', detail.value)}
                            rows={4}
                          />
                        </FormField>
                      </ColumnLayout>
                    </Container>
                  ))}

                  <Container>
                    <FormField
                      label="General Item Rationale"
                      description="Provide a general rationale for the entire item"
                      stretch
                    >
                      <TextArea
                        value={generalRationale}
                        onChange={({ detail }) => setGeneralRationale(detail.value)}
                        rows={4}
                      />
                    </FormField>
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