import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { Container, Title, Group, Paper, Button, Text, Box, Transition, Loader } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import Logo from '../components/Logo';
import { motion } from 'framer-motion';
import ListComponent from '../components/ListComponent';
import { useList } from '../contexts/ListContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { axiosInstance, API_ENDPOINTS } from '../config/api';
import { showNotification } from '@mantine/notifications';

const Dashboard = () => {
  const { lists, loading, moveItem, addList, updateList, deleteList } = useList();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Container fluid p="xl">
        <Group position="center" style={{ minHeight: '100vh' }}>
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    moveItem(result.source, result.destination);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <Container fluid p={0}>
      <Box
        py="md"
        px="xl"
        style={{
          borderBottom: '1px solid #E9ECEF',
          backgroundColor: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <Group position="apart" align="center">
          <Group spacing="md">
            <Logo />
            <Text size="sm" color="dimmed">
              Organize your tasks hierarchically
            </Text>
          </Group>

          <Group spacing="md">
            <Text size="sm">
              Welcome, {currentUser?.email?.split('@')[0]}!
            </Text>
            <Button
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              leftIcon={<IconPlus size={16} />}
              onClick={() => addList('New List')}
            >
              New List
            </Button>
            <Button variant="subtle" color="gray" onClick={handleLogout}>
              Logout
            </Button>
          </Group>
        </Group>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Group 
            align="flex-start" 
            spacing={40}
            style={{ 
              overflowX: 'auto',
              overflowY: 'hidden',
              minHeight: 'calc(100vh - 160px)',
              padding: '20px 40px',
              position: 'relative',
              display: 'flex',
              flexWrap: 'nowrap',
              gap: '40px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#228BE6 #f1f3f5',
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f3f5',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#228BE6',
                borderRadius: '4px',
              }
            }}
          >
            {lists.map((list, index) => (
              <Paper
                key={list.id}
                shadow="sm"
                p={0}
                style={{ 
                  minWidth: 300,
                  width: list.items.some(item => 
                    item.subItems?.length > 3 || 
                    item.subItems?.some(sub => sub.subItems?.length > 2)
                  ) ? '600px' : '300px',
                  backgroundColor: 'white',
                  border: '1px solid #e9ecef',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'visible'  // Changed from hidden
                }}
              >
                <ListComponent list={list} />
              </Paper>
            ))}
          </Group>
        </motion.div>
      </DragDropContext>
    </Container>
  );
};

export default Dashboard;