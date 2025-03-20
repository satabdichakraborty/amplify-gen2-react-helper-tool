import * as React from 'react';
import {
  Container,
  Header,
  SpaceBetween,
  Modal,
  ColumnLayout,
  Box,
  Button
} from '@cloudscape-design/components';
import { Item } from '../graphql/operations';
import { RationaleDisplay } from './RationaleDisplay';

interface ItemDetailsProps {
  item: Item | null;
  visible: boolean;
  onDismiss: () => void;
}

export const ItemDetails: React.FC<ItemDetailsProps> = ({ item, visible, onDismiss }) => {
  if (!item) return null;

  // Determine question type
  const isMultipleResponse = item.Type === 'Multiple Response';
  const isMultipleChoice = item.Type === 'Multiple Choice';

  // Create response fields with proper filtering for empty responses
  const responseFields = [];
  
  // Always include A-D for Multiple Choice (if they have content)
  if (isMultipleChoice) {
    const requiredFields = [
      { label: 'A', response: item.responseA, rationale: item.rationaleA },
      { label: 'B', response: item.responseB, rationale: item.rationaleB },
      { label: 'C', response: item.responseC, rationale: item.rationaleC },
      { label: 'D', response: item.responseD, rationale: item.rationaleD },
    ];
    
    // Only add responses that actually have content
    responseFields.push(...requiredFields.filter(field => field.response && field.response.trim() !== ''));
  } 
  // For Multiple Response, should have minimum 5 and maximum 6 responses
  else if (isMultipleResponse) {
    const allFields = [
      { label: 'A', response: item.responseA, rationale: item.rationaleA },
      { label: 'B', response: item.responseB, rationale: item.rationaleB },
      { label: 'C', response: item.responseC, rationale: item.rationaleC },
      { label: 'D', response: item.responseD, rationale: item.rationaleD },
      { label: 'E', response: item.responseE, rationale: item.rationaleE },
      { label: 'F', response: item.responseF, rationale: item.rationaleF },
    ];
    
    // Only add responses that actually have content
    responseFields.push(...allFields.filter(field => field.response && field.response.trim() !== ''));
  }
  // Default case for other question types or when type is not specified
  else {
    const baseFields = [
      { label: 'A', response: item.responseA, rationale: item.rationaleA },
      { label: 'B', response: item.responseB, rationale: item.rationaleB },
      { label: 'C', response: item.responseC, rationale: item.rationaleC },
      { label: 'D', response: item.responseD, rationale: item.rationaleD },
    ];
    
    // Only add base responses that have content
    responseFields.push(...baseFields.filter(field => field.response && field.response.trim() !== ''));
    
    // Add optional responses only if they have content
    if (item.responseE && item.responseE.trim() !== '') {
      responseFields.push({ label: 'E', response: item.responseE, rationale: item.rationaleE || '' });
    }
    if (item.responseF && item.responseF.trim() !== '') {
      responseFields.push({ label: 'F', response: item.responseF, rationale: item.rationaleF || '' });
    }
    if (item.responseG && item.responseG.trim() !== '') {
      responseFields.push({ label: 'G', response: item.responseG, rationale: item.rationaleG || '' });
    }
    if (item.responseH && item.responseH.trim() !== '') {
      responseFields.push({ label: 'H', response: item.responseH, rationale: item.rationaleH || '' });
    }
  }

  // Determine which responses are correct
  const key = item.Key || '';
  const correctResponses = key.split('').map(char => char.toUpperCase());

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      size="large"
      header={<Header variant="h2">Item Details</Header>}
      footer={
        <Box float="right">
          <Button variant="primary" onClick={onDismiss}>Close</Button>
        </Box>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h3">Question</Header>}>
          <SpaceBetween size="l">
            <ColumnLayout columns={2} variant="text-grid">
              <div>
                <Box variant="awsui-key-label">ID</Box>
                <div>{item.QuestionId}</div>
              </div>
              <div>
                <Box variant="awsui-key-label">Created Date</Box>
                <div>{new Date(item.CreatedDate).toLocaleString()}</div>
              </div>
              <div>
                <Box variant="awsui-key-label">Type</Box>
                <div>{item.Type}</div>
              </div>
              <div>
                <Box variant="awsui-key-label">Status</Box>
                <div>{item.Status}</div>
              </div>
            </ColumnLayout>
            
            <div>
              <Box variant="awsui-key-label">Question</Box>
              <div>{item.Question}</div>
            </div>
          </SpaceBetween>
        </Container>

        <Container header={<Header variant="h3">Responses</Header>}>
          <SpaceBetween size="l">
            {responseFields.map((field) => (
              <div key={field.label}>
                <Box variant="awsui-key-label">
                  Response {field.label} 
                  {correctResponses.includes(field.label) && (
                    <span style={{ marginLeft: '8px', color: '#0073bb', fontWeight: 'bold' }}>
                      (Correct)
                    </span>
                  )}
                </Box>
                <div>{field.response}</div>
                
                {field.rationale && field.rationale.trim() !== '' && (
                  <div style={{ marginTop: '8px' }}>
                    <Box variant="awsui-key-label">Rationale {field.label}</Box>
                    <RationaleDisplay text={field.rationale} maxHeight="200px" />
                  </div>
                )}
              </div>
            ))}
          </SpaceBetween>
        </Container>

        {item.Rationale && item.Rationale.trim() !== '' && (
          <Container header={<Header variant="h3">General Rationale</Header>}>
            <RationaleDisplay text={item.Rationale} maxHeight="300px" />
          </Container>
        )}
      </SpaceBetween>
    </Modal>
  );
} 