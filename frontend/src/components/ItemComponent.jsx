// src/components/ItemComponent.js
import React, { useState } from 'react';
import { ActionIcon, Group, Text, TextInput, Menu, Paper, Collapse, Box, Checkbox } from '@mantine/core';
import { IconPlus, IconDotsVertical, IconX, IconChevronRight, IconChevronDown } from '@tabler/icons-react';
import { useList } from '../contexts/ListContext';
import { motion } from 'framer-motion';

const ItemComponent = ({ item, index, depth = 0 }) => {
  const [isAddingSubTask, setIsAddingSubTask] = useState(false);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { addSubItem, deleteItem, toggleItemComplete } = useList();

  const handleAddSubTask = () => {
    if (newSubTaskTitle.trim()) {
      addSubItem(item.id, { title: newSubTaskTitle });
      setNewSubTaskTitle('');
      setIsAddingSubTask(false);
    }
  };

  const hasSubTasks = item.subItems?.length > 0;
  const maxDepthReached = depth >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.1 }}
    >
      <Paper
        shadow="xs"
        p="sm"
        style={{
          marginLeft: depth * 16,
          borderLeft: depth > 0 ? '2px solid #e9ecef' : 'none',
          backgroundColor: item.completed ? '#f8f9fa' : 'white',
          opacity: item.completed ? 0.8 : 1,
        }}
      >
        <Group position="apart" spacing="xl">
          <Group spacing="xs">
            {hasSubTasks && (
              <ActionIcon 
                size="sm" 
                variant="subtle"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? <IconChevronRight size={16} /> : <IconChevronDown size={16} />}
              </ActionIcon>
            )}
            <Group spacing={4}>
              <Checkbox
                checked={item.completed}
                onChange={() => toggleItemComplete(item.id)}
                styles={{
                  input: {
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    ':checked': {
                      backgroundColor: '#228BE6',
                      borderColor: '#228BE6',
                    }
                  },
                  label: {
                    textDecoration: item.completed ? 'line-through' : 'none',
                    color: item.completed ? '#868e96' : 'inherit',
                    transition: 'all 0.2s ease'
                  }
                }}
                label={item.title}
              />
            </Group>
          </Group>
          <Menu position="bottom-end">
            <Menu.Target>
              <ActionIcon>
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => setIsAddingSubTask(true)}>
                Add subtask
              </Menu.Item>
              <Menu.Item color="red" onClick={() => deleteItem(item.id)}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Collapse in={isAddingSubTask}>
          <TextInput
            value={newSubTaskTitle}
            onChange={(e) => setNewSubTaskTitle(e.target.value)}
            placeholder="Enter subtask title..."
            mt="xs"
            rightSection={
              <Group spacing={4}>
                <ActionIcon color="blue" onClick={handleAddSubTask} size="sm">
                  <IconPlus size={16} />
                </ActionIcon>
                <ActionIcon color="gray" onClick={() => setIsAddingSubTask(false)} size="sm">
                  <IconX size={16} />
                </ActionIcon>
              </Group>
            }
            onKeyPress={(e) => e.key === 'Enter' && handleAddSubTask()}
            autoFocus
          />
        </Collapse>
      </Paper>

      <Collapse in={!isCollapsed}>
        {hasSubTasks && (
          <div>
            {item.subItems.map((subItem, subIndex) => (
              <ItemComponent 
                key={subItem.id} 
                item={subItem} 
                index={subIndex} 
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </Collapse>
    </motion.div>
  );
};

export default ItemComponent;