import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { 
  Text, 
  Button, 
  Group, 
  Stack,
  TextInput,
  ActionIcon,
  Menu,
  Modal,
  Paper,
  Badge,
  Box
} from '@mantine/core';
import { IconDotsVertical, IconPlus, IconX, IconListDetails } from '@tabler/icons-react';
import { useList } from '../contexts/ListContext';
import ItemComponent from './ItemComponent';
import { useDisclosure } from '@mantine/hooks';
import { motion } from 'framer-motion';

const ListComponent = ({ list }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  
  const { addItem, updateList, deleteList } = useList();

  const handleAddItem = () => {
    if (newItemTitle.trim()) {
      addItem(list.id, { 
        title: newItemTitle,
        description: '',
        labels: [],
        completed: false,
        collapsed: false,
        subItems: []
      });
      setNewItemTitle('');
      setIsAdding(false);
    }
  };

  const handleUpdateTitle = () => {
    if (listTitle.trim()) {
      updateList(list.id, { title: listTitle });
      setIsEditingTitle(false);
    }
  };

  const handleDeleteList = () => {
    deleteList(list.id);
    closeDeleteModal();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        shadow="sm"
        p={0}
        style={{ 
          minWidth: 300,
          width: list.items.some(item => 
            countTotalSubItems(item) > 3
          ) ? '600px' : '300px',
          maxWidth: '800px',
          backgroundColor: 'white',
          border: '1px solid #e9ecef',
          transition: 'width 0.3s ease',
          overflow: 'visible'
        }}
      >
        <Group position="apart" p="md" style={{ 
          borderBottom: '1px solid #e9ecef',
          background: 'linear-gradient(45deg, #f1f3f5, #f8f9fa)'
        }}>
          {isEditingTitle ? (
            <TextInput
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              onBlur={handleUpdateTitle}
              onKeyPress={(e) => e.key === 'Enter' && handleUpdateTitle()}
              autoFocus
              size="sm"
              style={{ width: '200px' }}
            />
          ) : (
            <Group spacing="xs">
              <IconListDetails size={20} color="#228BE6" />
              <div>
                <Text fw={600} size="lg" style={{ cursor: 'pointer' }} onClick={() => setIsEditingTitle(true)}>
                  {list.title}
                </Text>
                <Group spacing={8}>
                  <Badge size="sm" variant="light">
                    {list.items.length} tasks
                  </Badge>
                  <Badge size="sm" variant="light" color="green">
                    {list.items.filter(item => item.completed).length} completed
                  </Badge>
                </Group>
              </div>
            </Group>
          )}
          <Menu position="bottom-end" transition="pop">
            <Menu.Target>
              <ActionIcon>
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => setIsEditingTitle(true)}>
                Rename list
              </Menu.Item>
              <Menu.Item color="red" onClick={openDeleteModal}>
                Delete list
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Droppable droppableId={list.id}>
          {(provided) => (
            <Stack
              spacing="xs"
              p="md"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {list.items.length === 0 ? (
                <Text color="dimmed" size="sm" align="center" py="xl">
                  No tasks yet. Click below to add your first task!
                </Text>
              ) : (
                list.items.map((item, index) => (
                  <ItemComponent key={item.id} item={item} index={index} />
                ))
              )}
              {provided.placeholder}
              
              {isAdding ? (
                <TextInput
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="Enter item title..."
                  rightSection={
                    <Group spacing={4}>
                      <ActionIcon color="blue" onClick={handleAddItem} size="sm">
                        <IconPlus size={16} />
                      </ActionIcon>
                      <ActionIcon color="gray" onClick={() => setIsAdding(false)} size="sm">
                        <IconX size={16} />
                      </ActionIcon>
                    </Group>
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddItem();
                    }
                  }}
                  autoFocus
                />
              ) : (
                <Button
                  variant="subtle"
                  leftIcon={<IconPlus size={16} />}
                  onClick={() => setIsAdding(true)}
                  fullWidth
                >
                  Add card
                </Button>
              )}
            </Stack>
          )}
        </Droppable>

        {/* Delete confirmation modal */}
        <Modal
          opened={deleteModalOpened}
          onClose={closeDeleteModal}
          title="Delete List"
          centered
        >
          <Stack>
            <Text size="sm">
              Are you sure you want to delete "{list.title}"? This action cannot be undone.
            </Text>
            <Group position="right">
              <Button variant="default" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button color="red" onClick={handleDeleteList}>
                Delete List
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Paper>
    </motion.div>
  );
};

// Helper function to count total sub-items recursively
const countTotalSubItems = (item) => {
  let count = 0;
  if (item.subItems?.length) {
    count += item.subItems.length;
    item.subItems.forEach(subItem => {
      count += countTotalSubItems(subItem);
    });
  }
  return count;
};

export default ListComponent;