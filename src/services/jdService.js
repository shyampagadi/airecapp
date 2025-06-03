import { API, Auth } from 'aws-amplify';
import axios from 'axios';

// Hardcoded API Gateway URL for reference
const API_GATEWAY_URL = 'https://p1w63vjfu7.execute-api.us-east-1.amazonaws.com/dev/resumes';

export const submitJobDescription = async (jobDescriptionData) => {
  try {
    // Extract text content from HTML for API request
    const textContent = jobDescriptionData.replace(/<[^>]*>/g, ' ').trim();
    console.log('jdService: Extracted text content from HTML');

    // Try using Amplify API for authenticated calls first
    try {
      console.log('jdService: Using Amplify API for authenticated call');
      
      // Get the current session to verify we're authenticated
      const session = await Auth.currentSession();
      const token = session.getIdToken().getJwtToken();
      
      // Make the API call using Amplify's API module
      const response = await API.get('jdSearchApi', '', {
        queryStringParameters: {
          job_description: textContent
        },
        headers: {
          'Content-Type': 'application/json'
          // Auth header is automatically added by Amplify
        }
      });
      
      console.log('jdService: API response received via Amplify:', response);
      
      return {
        success: true,
        data: response
      };
    } catch (amplifyError) {
      // If Amplify API call fails, try direct axios call with explicit auth
      console.warn('jdService: Amplify API call failed, falling back to direct axios:', amplifyError);
      
      // Get a fresh token for the direct call
      const session = await Auth.currentSession();
      const token = session.getIdToken().getJwtToken();
      
      console.log('jdService: Making direct authenticated API call with axios');
      
      const response = await axios.get(API_GATEWAY_URL, {
        params: {
          job_description: textContent
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('jdService: API response received via axios:', response.data);
      
      // Check if response has the expected structure
      if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
        console.warn('jdService: API returned empty response');
        return {
          success: true,
          data: [],
          message: 'No matching resumes found'
        };
      }
      
      return {
        success: true,
        data: response.data
      };
    }
  } catch (error) {
    console.error('jdService: Error submitting job description:', error);
    
    // Handle specific API errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('jdService: API error response:', error.response);
      
      // Handle auth specific errors
      if (error.response.status === 401 || error.response.status === 403) {
        return {
          success: false,
          message: 'Authentication failed. Please log in again.',
          authError: true
        };
      }
      
      return {
        success: false,
        message: `API error (${error.response.status}): ${error.response.data && error.response.data.message ? error.response.data.message : 'Unknown error'}`
      };
    } else if (error.request) {
      // The request was made but no response was received
      console.error('jdService: No response from API');
      return {
        success: false,
        message: 'No response received from the server. Please check your network connection.'
      };
    } else {
      // Something happened in setting up the request
      return {
        success: false,
        message: error.message || 'Failed to submit job description'
      };
    }
  }
}; 