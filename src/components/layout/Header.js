import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { signOut, getCurrentUser } from '../../services/authService';

const Header = () => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('Header: Checking for authenticated user...');
        const result = await getCurrentUser();
        if (result.success) {
          console.log('Header: User authenticated:', result.user);
          setUser(result.user);
        } else {
          console.log('Header: No authenticated user');
        }
      } catch (error) {
        console.error('Header: Error checking user:', error);
      } finally {
        setAuthChecked(true);
      }
    };

    checkUser();
  }, []);

  const handleSignOut = async () => {
    try {
      console.log('Header: Signing out...');
      const result = await signOut();
      if (result.success) {
        console.log('Header: Sign out successful');
        setUser(null);
        navigate('/login');
      } else {
        console.error('Header: Sign out failed:', result.message);
      }
    } catch (error) {
      console.error('Header: Error signing out:', error);
    }
  };

  // Add a fallback for development in case auth is not configured
  const useFallbackUser = !authChecked && process.env.NODE_ENV === 'development';

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand href="/">JD Search Application</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {(user || useFallbackUser) && (
              <Nav.Link href="/dashboard">Dashboard</Nav.Link>
            )}
          </Nav>
          <Nav>
            {user || useFallbackUser ? (
              <>
                <Navbar.Text className="me-3 text-light">
                  Welcome, {user ? (user.username || 'User') : 'Developer'}
                </Navbar.Text>
                <Button variant="outline-light" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Nav.Link href="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 