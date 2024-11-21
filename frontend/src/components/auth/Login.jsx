import React, { useState, useContext, useEffect } from "react";
import {
  Button,
  TextField,
  Paper,
  Typography,
  Container,
  Grid,
} from "@mui/material";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AlertMessage from "./AlertMessage";

/**
 * Login component that allows users to log in to the application.
 * @returns {JSX.Element} Login form component.
 */
export const Login = () => {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [alert, setAlert] = useState({
    key: Date.now(),
    open: false,
    message: "",
    severity: "error",
  });

  const navigate = useNavigate(); // <-- Use the useNavigate hook
  const { login, isLoggedIn } = useContext(AuthContext); // <-- Destructure isLoggedIn from context

  /**
   * Handles changes to the form data.
   * @param {Object} e - The event object.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * Triggers an alert message.
   * @param {string} message - The message to display in the alert.
   * @param {string} severity - The severity of the alert (error, warning, info, success).
   */
  const triggerAlert = (message, severity) => {
    setAlert({ key: Date.now(), open: true, message, severity });
  };

  /**
   * Closes the alert message.
   */
  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/"); // <-- Redirect to home page if user is logged in
    }
  }, [isLoggedIn, navigate]);

  /**
   * Handles form submission.
   * @param {Object} e - The event object.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login({
      login: formData.login,
      password: formData.password
    });
    
    if (result.success) {
      navigate("/dashboard"); // or wherever you want to redirect after login
    } else {
      // Show error message to user
      triggerAlert(result.error, "error");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <form
          onSubmit={handleSubmit}
          style={{ width: "100%", marginTop: "20px" }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="login"
                label="Email or Username"
                name="login"
                value={formData.login}
                onChange={handleChange}
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            style={{ marginTop: "20px" }}
          >
            Login
          </Button>
        </form>
        {alert.open && (
          <AlertMessage
            key={alert.key}
            open={alert.open}
            message={alert.message}
            severity={alert.severity}
            onClose={handleCloseAlert}
            style={{ width: "100%", marginTop: "20px" }}
          />
        )}
      </Paper>
    </Container>
  );
};

export default Login;