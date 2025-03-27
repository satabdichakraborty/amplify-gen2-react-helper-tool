import { useState, useEffect, useRef } from 'react';
import '../styles/QuestionFormatter.css';

export const QuestionFormatter: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [promptText, setPromptText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copyStatus, setCopyStatus] = useState('Copy');
  const outputTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset copy button text when output changes
    setCopyStatus('Copy');
  }, [outputText]);

  const formatText = () => {
    const text = inputText.trim();
    const promptValue = promptText.trim();
    
    if (!text) {
      setOutputText('Please enter some text.');
      return;
    }
    
    // Find the position of the first question mark
    const questionMarkIndex = text.indexOf('?');
    
    if (questionMarkIndex === -1) {
      setOutputText('No question mark (?) found. Please make sure your text contains a question.');
      return;
    }
    
    // Extract the question (everything before the first ?) and answers (everything after)
    const question = text.substring(0, questionMarkIndex + 1).trim();
    const answersPart = text.substring(questionMarkIndex + 1).trim();
    
    if (!answersPart) {
      setOutputText('No answer options found after the question mark.');
      return;
    }
    
    // Split the answers by various separators including spaces
    let answerOptions;
    
    // Check if there are commas, semicolons, or line breaks first
    if (/[,;\n\r]/.test(answersPart)) {
      answerOptions = answersPart
        .split(/[\n\r,;]+/)
        .map(option => option.trim())
        .filter(option => option.length > 0);
    } else {
      // If no commas or other separators, split by spaces
      answerOptions = answersPart
        .split(/\s+/)
        .filter(option => option.length > 0);
    }
    
    if (answerOptions.length === 0) {
      setOutputText('No valid answer options found after the question mark.');
      return;
    }
    
    // Format the output with the question and lettered answer options
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
    
    // Format without XML-like tags
    let formattedOutput = '';
    
    // Add prompt if it exists
    if (promptValue) {
      formattedOutput += `${promptValue}\n\n`;
    }
    
    // Add question
    formattedOutput += `${question}\n\n`;
    
    // Add answers
    answerOptions.forEach((option, index) => {
      if (index < letters.length) {
        const letter = letters[index];
        formattedOutput += `${letter}) ${option}\n`;
      }
    });
    
    setOutputText(formattedOutput.trim());
  };

  const clearText = () => {
    setInputText('');
    setPromptText('');
    setOutputText('');
    setCopyStatus('Copy');
  };

  const copyToClipboard = () => {
    if (!outputText || outputText.trim() === '') {
      return;
    }
    
    // Use the Clipboard API
    navigator.clipboard.writeText(outputText)
      .then(() => {
        // Provide visual feedback that the text was copied
        setCopyStatus('Copied!');
        
        // Reset the button text after 2 seconds
        setTimeout(() => {
          setCopyStatus('Copy');
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text to clipboard');
      });
  };

  const handleCtrlEnter = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      formatText();
    }
  };

  return (
    <div className="question-formatter-container">
      <h1>Question Formatter</h1>
      
      <div className="app-description">
        <p><strong>Info:</strong> Enter text with a question and answer options. The question should be before the '?' and answer options after it.</p>
      </div>
      
      <div className="content-layout">
        <div className="input-container">
          <div className="prompts-section">
            <div className="form-field">
              <label htmlFor="prompt-text">Prompts</label>
              <textarea 
                id="prompt-text" 
                placeholder="Enter additional prompts here..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
              />
              <p className="form-hint">These will not be included in the formatting</p>
            </div>
          </div>

          <div className="input-section">
            <div className="form-field">
              <label htmlFor="input-text">Input Text</label>
              <textarea 
                id="input-text" 
                placeholder="Enter your text here. Format: Question? Answer option 1 Answer option 2 ..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleCtrlEnter}
              />
              <p className="form-hint">Separate answer options with spaces, commas, or line breaks</p>
            </div>
            <div className="button-container">
              <button 
                id="format-button" 
                className="awsui-button-primary"
                onClick={formatText}
              >
                <span className="button-text">Format</span>
              </button>
              <button 
                id="clear-button" 
                className="awsui-button-secondary"
                onClick={clearText}
              >
                <span className="button-text">Clear</span>
              </button>
              <span className="shortcut-hint">or press Ctrl+Enter</span>
            </div>
          </div>
        </div>
        
        <div className="output-section">
          <div className="output-header">
            <h2>Formatted Output</h2>
            <button 
              id="copy-button" 
              className="awsui-button-secondary output-action-button"
              onClick={copyToClipboard}
            >
              <span className="button-text">{copyStatus}</span>
            </button>
          </div>
          <div 
            id="output-text" 
            className="output-container"
            ref={outputTextRef}
          >
            {outputText}
          </div>
        </div>
      </div>
    </div>
  );
}; 