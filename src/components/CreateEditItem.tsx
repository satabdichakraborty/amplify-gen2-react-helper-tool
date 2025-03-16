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
  key?: string;
}

export default function CreateEditItem() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [existingCreatedDate, setExistingCreatedDate] = useState<string | null>(null);

  // Form state
  const [stem, setStem] = useState('');
  const [responses, setResponses] = useState([
    { text: '', rationale: '' },
    { text: '', rationale: '' },
    { text: '', rationale: '' },
    { text: '', rationale: '' }
  ]);
  const [key, setKey] = useState('A');
  const [generalRationale, setGeneralRationale] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const questionId = id || Math.floor(Math.random() * 1000000).toString();

  // Load existing item data if in edit mode
  useEffect(() => {
    const loadItem = async () => {
      if (id) {
        try {
          setIsLoading(true);
          const itemsResponse = await client.models.Item.list();
          if (!itemsResponse?.data) {
            throw new Error('Failed to fetch items');
          }

          const targetItem = itemsResponse.data.find((item: any) => item.QuestionId === id);
          if (!targetItem) {
            throw new Error('Item not found');
          }

          setExistingCreatedDate(targetItem.CreatedDate);

          const response = await client.models.Item.get({
            QuestionId: id,
            CreatedDate: targetItem.CreatedDate
          });
          
          if (!response?.data) {
            throw new Error('Failed to fetch item details');
          }

          const item = response.data;
          setStem(item.Question);
          setResponses([
            { text: item.responseA || '', rationale: item.rationaleA || '' },
            { text: item.responseB || '', rationale: item.rationaleB || '' },
            { text: item.responseC || '', rationale: item.rationaleC || '' },
            { text: item.responseD || '', rationale: item.rationaleD || '' }
          ]);
          setKey(item.Key || 'A');
          setGeneralRationale(item.Rationale || '');
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

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!stem.trim()) {
      newErrors.stem = 'Stem is required';
    }

    const responseErrors: string[] = [];
    responses.forEach((response, index) => {
      if (!response.text.trim()) {
        responseErrors[index] = `Response ${index + 1} is required`;
      }
    });

    if (responseErrors.length > 0) {
      newErrors.responses = responseErrors;
    }

    if (!key || !['A', 'B', 'C', 'D'].includes(key)) {
      newErrors.key = 'Valid key (A-D) is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const currentDate = new Date().toISOString();
      const itemData = {
        QuestionId: questionId,
        Type: 'MCQ',
        Status: 'Active',
        Question: stem,
        Key: key,
        Notes: '',
        Rationale: generalRationale,
        CreatedDate: id ? existingCreatedDate! : currentDate,
        CreatedBy: 'system',
        responseA: responses[0].text,
        responseB: responses[1].text,
        responseC: responses[2].text,
        responseD: responses[3].text,
        responseE: '',
        responseF: '',
        rationaleA: responses[0].rationale,
        rationaleB: responses[1].rationale,
        rationaleC: responses[2].rationale,
        rationaleD: responses[3].rationale,
        rationaleE: '',
        rationaleF: '',
        Topic: 'General',
        KnowledgeSkills: 'General',
        Tags: '',
        responsesJson: JSON.stringify({
          responses: {
            A: responses[0].text,
            B: responses[1].text,
            C: responses[2].text,
            D: responses[3].text
          },
          rationales: {
            A: responses[0].rationale,
            B: responses[1].rationale,
            C: responses[2].rationale,
            D: responses[3].rationale
          }
        })
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
                <Alert type="error" header="Error" data-testid="error-alert">
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
                  <FormField
                    label="Stem"
                    errorText={errors.stem}
                  >
                    <TextArea
                      value={stem}
                      onChange={({ detail }) => setStem(detail.value)}
                    />
                  </FormField>

                  <ColumnLayout columns={2}>
                    {responses.map((response, index) => (
                      <div key={index}>
                        <SpaceBetween size="s">
                          <FormField
                            label="Text"
                            errorText={errors.responses?.[index]}
                          >
                            <Input
                              value={response.text}
                              onChange={({ detail }) => {
                                const newResponses = [...responses];
                                newResponses[index] = {
                                  ...response,
                                  text: detail.value
                                };
                                setResponses(newResponses);
                              }}
                            />
                          </FormField>
                          <FormField
                            label="Rationale"
                          >
                            <Input
                              value={response.rationale}
                              onChange={({ detail }) => {
                                const newResponses = [...responses];
                                newResponses[index] = {
                                  ...response,
                                  rationale: detail.value
                                };
                                setResponses(newResponses);
                              }}
                            />
                          </FormField>
                          <FormField
                            label="Is Correct Answer"
                          >
                            <Toggle
                              checked={key === String.fromCharCode(65 + index)}
                              onChange={({ detail }) => {
                                if (detail.checked) {
                                  setKey(String.fromCharCode(65 + index));
                                }
                              }}
                            />
                          </FormField>
                        </SpaceBetween>
                      </div>
                    ))}
                  </ColumnLayout>

                  <FormField
                    label="General Rationale"
                  >
                    <TextArea
                      value={generalRationale}
                      onChange={({ detail }) => setGeneralRationale(detail.value)}
                    />
                  </FormField>
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