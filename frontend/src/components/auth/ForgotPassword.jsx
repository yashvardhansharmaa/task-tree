import React, { useState } from 'react';
import {
  Button,
  TextField,
  Paper,
  Typography,
  Container,
  Box,
  Link,
  InputAdornment,
  Alert,
  LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { useApi } from '../../contexts/ApiProvider';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.grey[900] 
    : theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius * 2,
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
}));

const FormContainer = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(3),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  padding: theme.spacing(1.5),
  fontSize: '1rem',
  transition: theme.transitions.create(['transform', 'box-shadow']),
  '&:active': {
    transform: 'scale(0.98)',
  },
}));

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const api = useApi();

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.post('/forgot-password', { email });
      if (response.ok) {
        setSuccessMessage('Password reset instructions have been sent to your email.');
      } else {
        throw new Error(response.body?.message || 'Failed to process request');
      }
    } catch (error) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <StyledPaper>
        <Typography component="h1" variant="h5" gutterBottom>
          Reset Password
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
          Enter your email address and we'll send you instructions to reset your password.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <FormContainer onSubmit={handleSubmit}>
          <TextField
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            error={!!error}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          {isLoading && <LinearProgress sx={{ mt: 2 }} />}

          <StyledButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
          >
            Reset Password
          </StyledButton>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Back to Login
            </Link>
          </Box>
        </FormContainer>
      </StyledPaper>
    </Container>
  );
};

export default ForgotPassword;