import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { notifications } from '@mantine/notifications';
import { TextInput, PasswordInput, Button, Paper, Title, Text, Container, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    login: ''
  });
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Authentication failed',
        color: 'red'
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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