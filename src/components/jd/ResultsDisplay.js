import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Paper,
  Avatar,
  LinearProgress,
  Button,
  IconButton,
  Stack,
  Divider,
  TablePagination,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PersonOutline as PersonIcon,
  Visibility as VisibilityIcon,
  GetApp as DownloadIcon,
  Email as EmailIcon,
  ArrowForward as ArrowForwardIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { getCandidateDataById } from '../../services/postgresService';
import ResumeViewer from '../resume/ResumeViewer';

const ResultsDisplay = ({ results, isLoading }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState({});
  const [loadingCandidates, setLoadingCandidates] = useState({});

  useEffect(() => {
    // Reset state when new results come in
    setPage(0);
    setCandidateDetails({});
    setLoadingCandidates({});
  }, [results]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewResume = async (resumeId) => {
    setSelectedResumeId(resumeId);
    setViewerOpen(true);
    
    // Load candidate data if not already loaded
    if (!candidateDetails[resumeId] && !loadingCandidates[resumeId]) {
      await loadCandidateData(resumeId);
    }
  };
  
  const loadCandidateData = async (resumeId) => {
    // Set loading state for this specific resume
    setLoadingCandidates(prev => ({ ...prev, [resumeId]: true }));
    
    try {
      const response = await getCandidateDataById(resumeId);
      
      if (response.success) {
        setCandidateDetails(prev => ({ 
          ...prev, 
          [resumeId]: response.data 
        }));
      } else {
        console.error('Failed to load candidate data:', response.message);
      }
    } catch (error) {
      console.error('Error loading candidate data:', error);
    } finally {
      setLoadingCandidates(prev => ({ ...prev, [resumeId]: false }));
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Processing your search...
        </Typography>
      </Box>
    );
  }

  if (!results || !results.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No matching resumes found. Try adjusting your search criteria.
        </Alert>
      </Box>
    );
  }

  // Get current page of results
  const displayedResults = results.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {results.length} matching resumes found
      </Typography>
      
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average Match Score
              </Typography>
              <Typography variant="h4">
                {(results.reduce((sum, result) => sum + result.score, 0) / results.length).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Top Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {/* This is placeholder - in a real app, you'd aggregate skills from results */}
                <Chip label="JavaScript" size="small" />
                <Chip label="React" size="small" />
                <Chip label="AWS" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Experience Range
              </Typography>
              <Typography variant="h4">
                1-8 years
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Candidate</TableCell>
              <TableCell>Match Score</TableCell>
              <TableCell>Skills</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedResults.map((result) => {
              const candidateData = candidateDetails[result.resume_id];
              const isLoading = loadingCandidates[result.resume_id];
              
              return (
                <TableRow key={result.resume_id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>
                        {(candidateData?.name || 'A')[0].toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {candidateData?.name || 'Loading...'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {candidateData?.email || result.resume_id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={result.score} 
                          color={result.score > 80 ? "success" : result.score > 60 ? "primary" : "warning"} 
                          sx={{ height: 8, borderRadius: 5 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {result.score.toFixed(1)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {result.skills && result.skills.slice(0, 3).map((skill, index) => (
                        <Chip 
                          key={index} 
                          label={skill} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                      {result.skills && result.skills.length > 3 && (
                        <Tooltip title={result.skills.slice(3).join(', ')}>
                          <Chip 
                            label={`+${result.skills.length - 3}`} 
                            size="small" 
                            variant="outlined"
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {result.experience || 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Resume">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewResume(result.resume_id)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Resume">
                      <IconButton size="small">
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Contact Candidate">
                      <IconButton size="small">
                        <EmailIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={results.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      
      {/* Resume Viewer Dialog */}
      <ResumeViewer 
        resumeId={selectedResumeId} 
        open={viewerOpen} 
        onClose={() => setViewerOpen(false)} 
      />
    </Box>
  );
};

// Helper function to get color based on match score
const getScoreColor = (score) => {
  if (score >= 0.8) return { name: 'success', light: '#c8e6c9' };
  if (score >= 0.6) return { name: 'primary', light: '#bbdefb' };
  if (score >= 0.4) return { name: 'warning', light: '#ffecb3' };
  return { name: 'error', light: '#ffcdd2' };
};

export default ResultsDisplay; 