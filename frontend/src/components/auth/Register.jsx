import React, { useState } from "react";
import {
  Button,
  TextField,
  Paper,
  Typography,
  Container,
  Grid,
} from "@mui/material";
import { useApi } from "../../contexts/ApiProvider";
import { useNavigate } from "react-router-dom";
import AlertMessage from "./AlertMessage";

export const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [alert, setAlert] = useState({
    key: Date.now(),
    open: false,
    message: "",
    severity: "error",
  });

  const api = useApi();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const triggerAlert = (message, severity) => {
    setAlert({
      key: Date.now(),
      open: true,
      message,
      severity
    });
  };

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
        triggerAlert("Passwords do not match!", "error");
        return;
    }

    try {
        const registrationData = {
            username: formData.username,
            email: formData.email,
            password: formData.password
        };
        
        const response = await api.post("/auth/register", registrationData);
        
        if (response.ok && response.body.token) {
            api.setToken(response.body.token);
            localStorage.setItem('username', response.body.user.username);
            localStorage.setItem('isLoggedIn', 'true');
            
            triggerAlert("Registration successful!", "success");
            setTimeout(() => {
                navigate("/dashboard");
            }, 1500);
        } else {
            throw new Error(response.body.message || "Registration failed");
        }
    } catch (error) {
        console.error('Registration error:', error);
        triggerAlert(error.message || "Registration failed", "error");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Register
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%', mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </Button>
        </form>
        {alert.open && (
          <AlertMessage
            key={alert.key}
            open={alert.open}
            message={alert.message}
            severity={alert.severity}
            onClose={handleCloseAlert}
            style={{ width: '100%', mt: 2 }}
          />
        )}
      </Paper>
    </Container>
  );
};

export default Register;