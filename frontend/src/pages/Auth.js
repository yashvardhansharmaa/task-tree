import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { notifications } from '@mantine/notifications';
import { TextInput, PasswordInput, Button, Paper, Title, Text, Container, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    login: ''
  });
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!isLogin) {
      const emailError = validateEmail(formData.email);
      if (emailError) errors.email = emailError;
    }
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (isLogin) {
        const loginData = {
          login: formData.login,
          password: formData.password
        };
        await login(loginData);
        navigate('/');
      } else {
        const registerData = {
          username: formData.username,
          email: formData.email,
          password: formData.password
        };
        await register(registerData);
        notifications.show({
          title: 'Success',
          message: 'Registered successfully',
          color: 'green'
        });
        setIsLogin(true);
      }
    } catch (error) {
      let errorMessage = 'Authentication failed';
      if (error.response?.status === 429) {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red'
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    if (password.length < minLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase || !hasLowerCase) {
      return 'Password must contain both uppercase and lowercase letters';
    }
    if (!hasNumbers) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character (!@#$%^&*)';
    }
    return null;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  return (
    <Container size={420} my={40}>
      <Group justify="center" mb="lg">
        <Logo size="lg" />
      </Group>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
        <Text span c="blue" onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer' }}>
          {isLogin ? 'Register' : 'Login'}
        </Text>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          {isLogin ? (
            <TextInput
              label="Username or Email"
              name="login"
              value={formData.login}
              onChange={handleChange}
              required
            />
          ) : (
            <>
              <TextInput
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <TextInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                mt="md"
                error={formErrors.email}
              />
            </>
          )}
          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            mt="md"
            error={formErrors.password}
          />
          <Group justify="center" mt="xl">
            <Button type="submit" fullWidth>
              {isLogin ? 'Login' : 'Register'}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default Auth; 