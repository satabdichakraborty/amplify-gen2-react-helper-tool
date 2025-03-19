import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LLMRationaleModal } from '../LLMRationaleModal';
import { vi } from 'vitest';
import React from 'react';

// Mock the Cloudscape components to simplify testing
vi.mock('@cloudscape-design/components/modal', () => ({
  default: ({ visible, children, footer, header }: { 
    visible: boolean; 
    children: React.ReactNode; 
    footer?: React.ReactNode; 
    header?: React.ReactNode;
  }) => visible ? (
    <div data-testid="modal">
      {header}
      {children}
      {footer}
    </div>
  ) : null
}));

vi.mock('@cloudscape-design/components/alert', () => ({
  default: ({ children, type, header }: { 
    children: React.ReactNode; 
    type: string; 
    header?: React.ReactNode;
  }) => (
    <div data-testid={`alert-${type}`}>
      {header && <div>{header}</div>}
      {children}
    </div>
  )
}));

vi.mock('@cloudscape-design/components/button', () => ({
  default: ({ children, variant, onClick, disabled }: { 
    children: React.ReactNode; 
    variant?: string; 
    onClick?: () => void; 
    disabled?: boolean;
  }) => (
    <button 
      data-testid={`button-${variant || 'normal'}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}));

// Mock other components with minimal implementations
vi.mock('@cloudscape-design/components/box', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('@cloudscape-design/components/header', () => ({
  default: ({ children, actions }: { 
    children: React.ReactNode;
    actions?: React.ReactNode;
  }) => (
    <div>
      {children}
      {actions && <div data-testid="header-actions">{actions}</div>}
    </div>
  )
}));

vi.mock('@cloudscape-design/components/space-between', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('@cloudscape-design/components/container', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('@cloudscape-design/components/expandable-section', () => ({
  default: ({ children, headerText }: { 
    children: React.ReactNode;
    headerText: string;
    defaultExpanded?: boolean;
  }) => (
    <div>
      <div>{headerText}</div>
      <div>{children}</div>
    </div>
  )
}));

vi.mock('@cloudscape-design/components/badge', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="badge">{children}</div>
}));

describe('LLMRationaleModal', () => {
  const mockRationale = {
    llmKey: 'C',
    llmRationaleA: 'Explanation for A',
    llmRationaleB: 'Explanation for B',
    llmRationaleC: 'Explanation for C',
    llmRationaleD: 'Explanation for D',
    llmGeneralRationale: 'General explanation'
  };

  const mockResponses = [
    { letter: 'A', text: 'Option A', rationale: 'Existing rationale A' },
    { letter: 'B', text: 'Option B', rationale: 'Existing rationale B' },
    { letter: 'C', text: 'Option C', rationale: 'Existing rationale C' },
    { letter: 'D', text: 'Option D', rationale: 'Existing rationale D' }
  ];

  const mockQuestion = 'Test question?';
  const mockOnAccept = vi.fn();
  const mockOnDismiss = vi.fn();

  // Helper function to render the component in non-loading, non-error state
  const renderComponent = () => {
    return render(
      <LLMRationaleModal
        visible={true}
        onDismiss={mockOnDismiss}
        onAccept={mockOnAccept}
        loading={false}
        error={null}
        generatedRationale={mockRationale}
        question={mockQuestion}
        responses={mockResponses}
      />
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    render(
      <LLMRationaleModal
        visible={true}
        onDismiss={mockOnDismiss}
        onAccept={mockOnAccept}
        loading={true}
        error={null}
        generatedRationale={null}
        question={mockQuestion}
        responses={mockResponses}
      />
    );

    // Check that the modal is visible
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    
    // Check for loading indicator
    expect(screen.getByTestId('alert-info')).toBeInTheDocument();
    expect(screen.getByText(/generating ai rationale/i)).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    const errorMessage = 'Failed to generate rationale';
    render(
      <LLMRationaleModal
        visible={true}
        onDismiss={mockOnDismiss}
        onAccept={mockOnAccept}
        loading={false}
        error={errorMessage}
        generatedRationale={null}
        question={mockQuestion}
        responses={mockResponses}
      />
    );

    // Check that the error alert is shown
    expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays the question text', () => {
    renderComponent();
    expect(screen.getByText(mockQuestion)).toBeInTheDocument();
  });

  it('displays the general explanation', () => {
    renderComponent();
    expect(screen.getByText('General Explanation')).toBeInTheDocument();
    expect(screen.getByText(mockRationale.llmGeneralRationale)).toBeInTheDocument();
  });

  it('displays response options', () => {
    renderComponent();
    // We should see the response options text in the header text
    expect(screen.getByText(/Option A:/i)).toBeInTheDocument();
    expect(screen.getByText(/Option B:/i)).toBeInTheDocument();
    expect(screen.getByText(/Option C:/i)).toBeInTheDocument();
    expect(screen.getByText(/Option D:/i)).toBeInTheDocument();
  });

  it('calls onAccept when Accept button is clicked', () => {
    renderComponent();
    // Find and click the Accept button
    const acceptButton = screen.getByText('Accept AI Rationale');
    fireEvent.click(acceptButton);
    
    // Verify the callback was called with the rationale
    expect(mockOnAccept).toHaveBeenCalledWith(mockRationale);
  });

  it('calls onDismiss when Cancel button is clicked', () => {
    renderComponent();
    // Find and click the Cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Verify the callback was called
    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('disables Accept button when loading', () => {
    render(
      <LLMRationaleModal
        visible={true}
        onDismiss={mockOnDismiss}
        onAccept={mockOnAccept}
        loading={true}
        error={null}
        generatedRationale={mockRationale}
        question={mockQuestion}
        responses={mockResponses}
      />
    );

    // Find the Accept button and check it's disabled
    const acceptButton = screen.getByText('Accept AI Rationale');
    expect(acceptButton).toBeDisabled();
  });

  it('disables Accept button when there is an error', () => {
    render(
      <LLMRationaleModal
        visible={true}
        onDismiss={mockOnDismiss}
        onAccept={mockOnAccept}
        loading={false}
        error="Some error"
        generatedRationale={mockRationale}
        question={mockQuestion}
        responses={mockResponses}
      />
    );

    // Find the Accept button and check it's disabled
    const acceptButton = screen.getByText('Accept AI Rationale');
    expect(acceptButton).toBeDisabled();
  });
}); 