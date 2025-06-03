import React from 'react';
import { Container, Card, Alert, Table, Badge, Row, Col } from 'react-bootstrap';

const ResultsDisplay = ({ results }) => {
  // Early return for no results
  if (!results) {
    return (
      <Container className="mb-4">
        <Card className="shadow-sm">
          <Card.Body className="p-4">
            <h3 className="mb-4">Matching Resumes</h3>
            <Alert variant="info">
              No matching resumes found for the provided job description.
            </Alert>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Extract main data from API response
  const jobInfo = results.job_info || {};
  const totalResults = results.total_results || 0;
  const candidateResults = results.results || [];
  
  // If no candidates found
  if (candidateResults.length === 0) {
    return (
      <Container className="mb-4">
        <Card className="shadow-sm">
          <Card.Body className="p-4">
            <h3 className="mb-4">Matching Resumes</h3>
            <Alert variant="info">
              No matching resumes found for the provided job description.
            </Alert>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="mb-4">
      {/* Job Information Card */}
      <Card className="shadow-sm mb-4">
        <Card.Body className="p-4">
          <h3 className="mb-3">Job Requirements</h3>
          <Row>
            <Col md={6}>
              <p><strong>Job Title:</strong> {jobInfo.title || 'Not specified'}</p>
              <p><strong>Required Experience:</strong> {jobInfo.required_experience || 0} years</p>
            </Col>
            <Col md={6}>
              <p><strong>Required Skills:</strong></p>
              <div>
                {Array.isArray(jobInfo.required_skills) ? (
                  jobInfo.required_skills.map((skill, i) => (
                    <Badge key={i} bg="primary" className="me-1 mb-1">{skill}</Badge>
                  ))
                ) : (
                  'Not specified'
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Results Card */}
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h3 className="mb-4">Matching Candidates ({totalResults})</h3>
          
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>ID</th>
                  <th>Match Score</th>
                  <th>Skills</th>
                  <th>Experience</th>
                  <th>Analysis</th>
                </tr>
              </thead>
              <tbody>
                {candidateResults.map((candidate, index) => (
                  <tr key={candidate.resume_id || index}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{candidate.resume_id || 'Unknown'}</strong>
                    </td>
                    <td>
                      <div className="text-center">
                        <span className={`badge ${getScoreColorClass(candidate.scores.overall / 100)}`}>
                          {Math.round(candidate.scores.overall)}%
                        </span>
                        <div className="small mt-1">
                          <div>Skills: {Math.round(candidate.scores.skill_match)}%</div>
                          <div>Experience: {Math.round(candidate.scores.experience_match)}%</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>Matching:</strong>
                        <div>
                          {Array.isArray(candidate.skills.matching) && candidate.skills.matching.length > 0 ? (
                            candidate.skills.matching.map((skill, i) => (
                              <Badge key={i} bg="success" className="me-1 mb-1">{skill}</Badge>
                            ))
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                        </div>
                        
                        <strong className="mt-2 d-block">Missing:</strong>
                        <div>
                          {Array.isArray(candidate.skills.missing) && candidate.skills.missing.length > 0 ? (
                            candidate.skills.missing.map((skill, i) => (
                              <Badge key={i} bg="danger" className="me-1 mb-1">{skill}</Badge>
                            ))
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {candidate.experience ? (
                        <div>
                          <strong>{candidate.experience.years} years</strong>
                          <div className="small">
                            Required: {candidate.experience.required} years
                            <Badge 
                              bg={candidate.experience.difference >= 0 ? "success" : "warning"} 
                              className="ms-2"
                            >
                              {candidate.experience.difference >= 0 ? "+" : ""}{candidate.experience.difference} years
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        'Not specified'
                      )}
                    </td>
                    <td>
                      {candidate.professional_analysis ? (
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }} className="small">
                          {candidate.professional_analysis}
                        </div>
                      ) : (
                        <span className="text-muted">No analysis available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Display raw JSON for debugging if in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4">
              <details>
                <summary className="text-muted">Raw response data (for debugging)</summary>
                <div className="bg-light p-3 rounded mt-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

// Helper function to get badge color based on match score
const getScoreColorClass = (score) => {
  if (score >= 0.8) return 'bg-success';
  if (score >= 0.6) return 'bg-primary';
  if (score >= 0.4) return 'bg-warning text-dark';
  return 'bg-danger';
};

export default ResultsDisplay; 