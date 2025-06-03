import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Card, Alert, Spinner } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { submitJobDescription } from '../../services/jdService';

// Default Java Developer job description
const DEFAULT_JD = `<h3>Java Developer</h3>
<p>We are looking for a skilled Java Developer to join our team. The ideal candidate should have:</p>
<ul>
  <li>5+ years of experience with Java development</li>
  <li>Strong knowledge of Spring Boot framework</li>
  <li>Experience with microservices architecture</li>
  <li>Familiarity with RESTful APIs</li>
  <li>Understanding of SQL and NoSQL databases</li>
  <li>Experience with AWS or other cloud platforms</li>
</ul>
<p>The candidate should be a team player with excellent communication skills and problem-solving abilities.</p>`;

const JDForm = ({ onResults }) => {
  const [jdContent, setJdContent] = useState(DEFAULT_JD);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFormValid, setIsFormValid] = useState(true); // Set to true since we have default content

  useEffect(() => {
    // Validate the default content on component mount
    const textContent = DEFAULT_JD.replace(/<(.|\n)*?>/g, '').trim();
    setIsFormValid(textContent.length > 0);
  }, []);

  // Update form validity when JD content changes
  const handleJdChange = (content) => {
    setJdContent(content);
    // Check if the content has text (not just HTML tags)
    const textContent = content.replace(/<(.|\n)*?>/g, '').trim();
    setIsFormValid(textContent.length > 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) {
      setError('Please enter a job description.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('JDForm: Submitting job description to API');
      
      // Clean up HTML content for better API processing
      const plainText = jdContent.replace(/<[^>]*>/g, ' ').trim();
      console.log('JDForm: Extracted plain text from HTML content');
      
      const result = await submitJobDescription(jdContent);
      
      if (result.success) {
        console.log('JDForm: API request successful');
        onResults(result.data);
      } else {
        console.error('JDForm: API request failed:', result.message);
        
        // Handle authentication errors - redirect to login if necessary
        if (result.authError) {
          console.warn('JDForm: Authentication error detected, redirecting to login');
          // Redirect to login page
          window.location.href = '/login';
          return;
        }
        
        setError(result.message || 'Failed to process job description');
      }
    } catch (err) {
      console.error('JDForm: Unexpected error during submission:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['clean']
    ],
  };

  return (
    <Container className="mb-4">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h3 className="mb-4">Enter Job Description</h3>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <ReactQuill
                theme="snow"
                value={jdContent}
                onChange={handleJdChange}
                modules={modules}
                placeholder="Enter the job description here..."
                style={{ height: '300px', marginBottom: '50px' }}
              />
            </Form.Group>
            
            <div className="d-grid gap-2">
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading || !isFormValid}
                className="mt-3"
              >
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Processing...
                  </>
                ) : (
                  'Submit Job Description'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default JDForm; 