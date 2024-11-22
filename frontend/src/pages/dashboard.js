import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { Container, Title, Group, Paper, Button, Text, Box, Transition } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import Logo from '../components/Logo';
import { motion } from 'framer-motion';
import ListComponent from '../components/ListComponent';
import { useList } from '../contexts/ListContext';

const Dashboard = () => {
  const { lists, moveItem, addList } = useList();

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    moveItem(result.source, result.destination);
  };

  return (
    <Container fluid p="xl">
      <Box mb="xl">
        <Group position="apart" align="center">
          <Group spacing="xs">
            <Logo />
            <Text size="sm" color="dimmed">Organize your tasks hierarchically</Text>
          </Group>
          <Button
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan' }}
            leftIcon={<IconPlus size={16} />}
            onClick={() => addList('New List')}
          >
            New List
          </Button>
        </Group>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Group align="flex-start" spacing="md" style={{ overflowX: 'auto', minHeight: 'calc(100vh - 160px)' }}>
            {lists.map((list, index) => (
              <Transition mounted={true} transition="pop" duration={400} timingFunction="ease">
                {(styles) => (
                  <Paper
                    key={list.id}
                    shadow="sm"
                    p={0}
                    style={{ 
                      ...styles,
                      minWidth: 300,
                      maxWidth: list.items.some(item => item.subItems?.length > 3) ? 400 : 300,
                      backgroundColor: 'white',
                      border: '1px solid #e9ecef',
                      transition: 'max-width 0.3s ease'
                    }}
                  >
                    <ListComponent list={list} />
                  </Paper>
                )}
              </Transition>
            ))}
          </Group>
        </motion.div>
      </DragDropContext>
    </Container>
  );
};

export default Dashboard;