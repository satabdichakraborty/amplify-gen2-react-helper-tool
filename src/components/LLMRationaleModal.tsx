import React from 'react';
import Modal from "@cloudscape-design/components/modal";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import ExpandableSection from "@cloudscape-design/components/expandable-section";
import Header from "@cloudscape-design/components/header";
import Alert from "@cloudscape-design/components/alert";
import Container from "@cloudscape-design/components/container";
import Badge from "@cloudscape-design/components/badge";
import { GeneratedRationale } from '../graphql/operations';

interface LLMRationaleModalProps {
  visible: boolean;
  onDismiss: () => void;
  onAccept: (rationale: GeneratedRationale) => void;
  loading: boolean;
  error: string | null;
  generatedRationale: GeneratedRationale | null;
  question: string;
  responses: {
    letter: string;
    text: string;
    rationale?: string;
  }[];
}

export const LLMRationaleModal: React.FC<LLMRationaleModalProps> = ({
  visible,
  onDismiss,
  onAccept,
  loading,
  error,
  generatedRationale,
  question,
  responses
}) => {
  // Helper to get the appropriate rationale for a response letter
  const getRationaleForLetter = (letter: string) => {
    if (!generatedRationale) return '';
    
    switch (letter) {
      case 'A': return generatedRationale.llmRationaleA || '';
      case 'B': return generatedRationale.llmRationaleB || '';
      case 'C': return generatedRationale.llmRationaleC || '';
      case 'D': return generatedRationale.llmRationaleD || '';
      case 'E': return generatedRationale.llmRationaleE || '';
      case 'F': return generatedRationale.llmRationaleF || '';
      default: return '';
    }
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header={<Header>AI-Generated Rationale</Header>}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => generatedRationale && onAccept(generatedRationale)}
              disabled={loading || !generatedRationale || !!error}
            >
              Accept AI Rationale
            </Button>
          </SpaceBetween>
        </Box>
      }
      size="large"
    >
      <SpaceBetween size="l">
        {loading && (
          <Alert type="info">
            Generating AI rationale. This may take a few moments...
          </Alert>
        )}
        
        {error && (
          <Alert type="error" header="Error generating rationale">
            {error}
          </Alert>
        )}
        
        {!loading && !error && generatedRationale && (
          <>
            <Container>
              <Header variant="h3">Question</Header>
              <p>{question}</p>
            </Container>
            
            <Container>
              <Header 
                variant="h3" 
                actions={
                  <Badge color="blue">
                    AI-Selected Answer: {generatedRationale.llmKey}
                  </Badge>
                }
              >
                AI Analysis
              </Header>
              <ExpandableSection headerText="General Explanation" defaultExpanded>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {generatedRationale.llmGeneralRationale}
                </div>
              </ExpandableSection>
            </Container>
            
            <Container>
              <Header variant="h3">Response Analysis</Header>
              <SpaceBetween size="l">
                {responses.map(response => (
                  <ExpandableSection 
                    key={response.letter}
                    headerText={`Option ${response.letter}: ${response.text.substring(0, 60)}${response.text.length > 60 ? '...' : ''}`}
                    defaultExpanded={response.letter === generatedRationale.llmKey}
                  >
                    <Box>
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {getRationaleForLetter(response.letter)}
                      </div>
                    </Box>
                  </ExpandableSection>
                ))}
              </SpaceBetween>
            </Container>
          </>
        )}
      </SpaceBetween>
    </Modal>
  );
}; 