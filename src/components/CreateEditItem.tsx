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
import Select, { SelectProps } from "@cloudscape-design/components/select";

// Mock data for demonstration - move this to a separate file later
const mockItems = [
  { 
    id: 123456, 
    content: "What is the capital of France?", 
    createdAt: new Date().toISOString(), 
    status: "Active",
    responses: [
      { text: "Paris", rationale: "Paris is the capital of France", correct: true },
      { text: "London", rationale: "London is the capital of UK", correct: false },
      { text: "Berlin", rationale: "Berlin is the capital of Germany", correct: false },
      { text: "Madrid", rationale: "Madrid is the capital of Spain", correct: false }
    ],
    generalRationale: "This question tests basic geography knowledge."
  },
  // ... other mock items
];

export default function CreateEditItem() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [questionId, setQuestionId] = useState<number>(
    id ? parseInt(id) : Math.floor(Math.random() * 1000000)
  );
  const [stem, setStem] = useState("");
  const [selectedAction, setSelectedAction] = useState<SelectProps.Option | null>(null);
  const [generalRationale, setGeneralRationale] = useState("");
  const [responses, setResponses] = useState([
    { text: "", rationale: "" },
    { text: "", rationale: "" },
    { text: "", rationale: "" },
    { text: "", rationale: "" }
  ]);
  const [correctResponse, setCorrectResponse] = useState("0");

  // Load existing item data if in edit mode
  useEffect(() => {
    if (id) {
      const itemId = parseInt(id);
      const item = mockItems.find(item => item.id === itemId);
      if (item) {
        setQuestionId(item.id);
        setStem(item.content);
        if (item.responses) {
          setResponses(item.responses.map(r => ({ text: r.text, rationale: r.rationale })));
          const correctIndex = item.responses.findIndex(r => r.correct);
          if (correctIndex !== -1) {
            setCorrectResponse(correctIndex.toString());
          }
        }
        if (item.generalRationale) {
          setGeneralRationale(item.generalRationale);
        }
      }
    }
  }, [id]);

  const handleResponseChange = (index: number, field: 'text' | 'rationale', value: string) => {
    const newResponses = [...responses];
    newResponses[index] = { ...newResponses[index], [field]: value };
    setResponses(newResponses);
  };

  const handleActionSelect = ({ detail }: { detail: { selectedOption: SelectProps.Option | null } }) => {
    setSelectedAction(detail.selectedOption);
    
    if (!detail.selectedOption?.value) return;

    switch (detail.selectedOption.value) {
      case 'revise':
        // TODO: Implement revise functionality
        console.log('Revising stem and responses...');
        break;
      case 'generate':
        // TODO: Implement generate rationales functionality
        console.log('Generating rationales...');
        break;
      case 'rules':
        // TODO: Implement run item rules functionality
        console.log('Running item rules...');
        break;
    }
  };

  const handleSave = () => {
    const finalResponses = responses.map((response, index) => ({
      ...response,
      correct: index.toString() === correctResponse
    }));
    
    const itemData = {
      id: questionId,
      content: stem,
      responses: finalResponses,
      generalRationale,
      status: "Active",
      createdAt: new Date().toISOString()
    };

    console.log('Saving item:', itemData);
    navigate('/');
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
              
              <Form
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button onClick={() => navigate('/')}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>
                      {id ? 'Save changes' : 'Create item'}
                    </Button>
                  </SpaceBetween>
                }
              >
                <SpaceBetween size="l">
                  <Container>
                    <ColumnLayout columns={2} variant="text-grid">
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
                        label="Actions"
                        description="Select an action to perform"
                      >
                        <Select
                          selectedOption={selectedAction}
                          onChange={handleActionSelect}
                          options={[
                            { label: "Generate rationales", value: "generate" },
                            { label: "Revise stem and responses", value: "revise" },
                            { label: "Run item rules", value: "rules" }
                          ]}
                          placeholder="Select an action"
                        />
                      </FormField>
                    </ColumnLayout>
                  </Container>

                  <Container>
                    <ColumnLayout columns={1} variant="text-grid">
                      <FormField
                        label="Stem"
                        description="The question or scenario presented to the candidate"
                        stretch
                      >
                        <TextArea
                          value={stem}
                          onChange={({ detail }) => setStem(detail.value)}
                          rows={3}
                        />
                      </FormField>
                    </ColumnLayout>
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
                    <ColumnLayout columns={1} variant="text-grid">
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
                    </ColumnLayout>
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