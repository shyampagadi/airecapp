import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import JDForm from './JDForm';
import ResultsDisplay from './ResultsDisplay';
import { getCurrentUser } from '../../services/authService';

const Dashboard = () => {
  const [results, setResults] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('Dashboard: Checking authentication...');
        const result = await getCurrentUser();
        
        if (!result.success) {
          console.log('Dashboard: User not authenticated, redirecting to login');
          navigate('/login');
        } else {
          console.log('Dashboard: User authenticated');
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Dashboard: Error checking authentication:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const handleResults = (data) => {
    console.log('Dashboard: Received results from API');
    setResults(data);
  };

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading dashboard...</p>
        </div>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login via useEffect
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Job Description Search</h2>
          <p className="text-muted">
            Enter a job description to find matching resumes in our database.
          </p>
        </Col>
      </Row>
      
      <JDForm onResults={handleResults} />
      
      {results && <ResultsDisplay results={results} />}
    </Container>
  );
};

export default Dashboard; 