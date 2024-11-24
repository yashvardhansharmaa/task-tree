import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Text, Button, Group, Stack, TextInput, ActionIcon, Paper, Menu, Badge } from '@mantine/core';
import { IconPlus, IconDotsVertical, IconEdit, IconX, IconList, IconCheckbox } from '@tabler/icons-react';
import { useList } from '../contexts/ListContext';
import ItemComponent from './ItemComponent';
import { motion, AnimatePresence } from 'framer-motion';

const ListComponent = ({ list }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list.title);
  const { addItem, deleteList, updateList, toggleItemComplete } = useList();

  // Calculate list statistics
  const stats = list.items.reduce((acc, item) => {
    const countSubItems = (items) => {
      return items.reduce((sum, i) => {
        const subItemCount = i.subItems ? countSubItems(i.subItems) : 0;
        return sum + 1 + subItemCount;
      }, 0);
    };

    const countCompleted = (items) => {
      return items.reduce((sum, i) => {
        const subItemCompleted = i.subItems ? countCompleted(i.subItems) : 0;
        return sum + (i.completed ? 1 : 0) + subItemCompleted;
      }, 0);
    };

    const totalItems = countSubItems(list.items);
    const completedItems = countCompleted(list.items);

    return {
      total: totalItems,
      completed: completedItems,
      percentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
    };
  }, { total: 0, completed: 0, percentage: 0 });

  const handleAddItem = () => {
    if (newItemTitle.trim()) {
      addItem(list.id, { title: newItemTitle });
      setNewItemTitle('');
      setIsAdding(false);
    }
  };

  const handleUpdateTitle = () => {
    if (editedTitle.trim() && editedTitle !== list.title) {
      updateList(list.id, { title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  return (
    <Paper
      shadow="sm"
      radius="md"
      p={0}
      style={{
        width: '100%',
        maxWidth: '400px',
        height: 'fit-content',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: stats.percentage === 100 ? '#40C057' : '#E9ECEF',
        transition: 'all 0.3s ease'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Stack spacing={0}>
          <Group 
            p="md" 
            style={{ 
              borderBottom: '1px solid #E9ECEF',
              background: stats.percentage === 100 ? '#F8FFE6' : 'transparent',
              transition: 'background-color 0.3s ease'
            }}
          >
            <Group position="apart" style={{ width: '100%' }}>
              <Group spacing="xs">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <IconList size={20} color="#228be6" />
                </motion.div>
                {isEditingTitle ? (
                  <TextInput
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={handleUpdateTitle}
                    onKeyPress={(e) => e.key === 'Enter' && handleUpdateTitle()}
                    size="sm"
                    style={{ flex: 1 }}
                    autoFocus
                  />
                ) : (
                  <Text weight={500} size="md">
                    {list.title}
                  </Text>
                )}
              </Group>

              <Group spacing="xs">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Badge 
                    variant="light"
                    color={stats.percentage === 100 ? 'green' : 'blue'}
                    leftSection={
                      <IconCheckbox size={12} style={{ marginRight: 4 }} />
                    }
                  >
                    {stats.completed}/{stats.total}
                  </Badge>
                </motion.div>

                <Menu position="bottom-end" transition="pop">
                  <Menu.Target>
                    <ActionIcon 
                      variant="subtle"
                      color="gray"
                      style={{ opacity: 0.6 }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                    >
                      <IconDotsVertical size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item 
                      icon={<IconEdit size={16} />} 
                      onClick={() => setIsEditingTitle(true)}
                    >
                      Rename list
                    </Menu.Item>
                    <Menu.Item 
                      icon={<IconPlus size={16} />}
                      onClick={() => setIsAdding(true)}
                    >
                      Add task
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item 
                      color="red" 
                      icon={<IconX size={16} />}
                      onClick={() => deleteList(list.id)}
                    >
                      Delete list
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>

            {/* Progress bar */}
            <motion.div 
              style={{
                width: '100%',
                height: 2,
                backgroundColor: '#E9ECEF',
                borderRadius: 2,
                marginTop: 8,
                overflow: 'hidden'
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.percentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  backgroundColor: stats.percentage === 100 ? '#40C057' : '#228be6',
                }}
              />
            </motion.div>
          </Group>

          <Droppable droppableId={list.id}>
            {(provided, snapshot) => (
              <Stack 
                spacing="xs" 
                p="md" 
                ref={provided.innerRef} 
                {...provided.droppableProps}
                style={{
                  minHeight: 100,
                  backgroundColor: snapshot.isDraggingOver ? '#F8F9FA' : 'transparent',
                  transition: 'background-color 0.2s ease',
                  overflowY: 'auto',
                  overflowX: 'hidden'
                }}
              >
                <AnimatePresence>
                  {list.items.length === 0 && !isAdding && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      exit={{ opacity: 0 }}
                      style={{ textAlign: 'center', padding: '20px 0' }}
                    >
                      <Text color="dimmed" size="sm">
                        No tasks yet. Click below to add your first task!
                      </Text>
                    </motion.div>
                  )}

                  {list.items.map((item, index) => (
                    <ItemComponent key={item.id} item={item} index={index} />
                  ))}
                </AnimatePresence>

                {provided.placeholder}

                <AnimatePresence>
                  {isAdding ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <TextInput
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        placeholder="Enter task title..."
                        size="sm"
                        autoFocus
                        rightSection={
                          <ActionIcon 
                            size="sm" 
                            color="blue" 
                            variant="light"
                            onClick={handleAddItem}
                          >
                            <IconPlus size={16} />
                          </ActionIcon>
                        }
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newItemTitle.trim()) {
                            handleAddItem();
                          }
                        }}
                        onBlur={() => {
                          if (!newItemTitle.trim()) {
                            setIsAdding(false);
                          }
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Button
                        variant="light"
                        color="blue"
                        fullWidth
                        leftIcon={<IconPlus size={16} />}
                        onClick={() => setIsAdding(true)}
                        styles={{
                          root: {
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-1px)'
                            },
                            '&:active': {
                              transform: 'translateY(1px)'
                            }
                          }
                        }}
                      >
                        Add task
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Stack>
            )}
          </Droppable>
        </Stack>
      </motion.div>
    </Paper>
  );
};

export default ListComponent;
