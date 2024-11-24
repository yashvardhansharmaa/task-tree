// src/components/ItemComponent.js
import React, { useState } from 'react';
import { ActionIcon, Group, Text, TextInput, Menu, Checkbox, Stack } from '@mantine/core';
import { IconPlus, IconDotsVertical, IconX, IconEdit, IconChevronDown } from '@tabler/icons-react';
import { useList } from '../contexts/ListContext';
import { motion } from 'framer-motion';
import { Draggable, Droppable } from 'react-beautiful-dnd';

const ItemComponent = ({ item, index, depth = 0, parentChain = [] }) => {
  const [isAddingSubTask, setIsAddingSubTask] = useState(false);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(item.title);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { addSubItem, deleteItem, toggleItemComplete, updateItem } = useList();
  
  const hasSubtasks = item.subItems?.length > 0;
  const completedSubtasks = item.subItems?.filter(si => si.completed).length || 0;
  const totalSubtasks = item.subItems?.length || 0;

  const handleAddSubTask = () => {
    if (newSubTaskTitle.trim()) {
      addSubItem(item.id, { title: newSubTaskTitle });
      setNewSubTaskTitle('');
      setIsAddingSubTask(false);
      setIsCollapsed(false);
    }
  };

  const handleUpdateTitle = () => {
    if (editedTitle.trim() && editedTitle !== item.title) {
      updateItem(item.id, { title: editedTitle.trim() });
    }
    setIsEditing(false);
  };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          style={{
            ...provided.draggableProps.style,
            position: 'relative'
          }}
        >
          {/* Vertical lines */}
          {depth > 0 && (
            <div
              style={{
                position: 'absolute',
                left: depth * 20,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: depth === 1 ? '#228be6' : '#7950f2',
                opacity: 0.2
              }}
            />
          )}

          <Stack spacing={1}>
            <Group spacing="sm" pl={depth * 40} py={1}>
              <Checkbox
                checked={item.completed}
                onChange={() => toggleItemComplete(item.id)}
                size="sm"
                styles={{
                  root: { cursor: 'pointer' },
                  input: {
                    transition: 'all 0.1s ease',
                    backgroundColor: item.completed ? '#228BE6' : 'white'
                  }
                }}
              />

              {isEditing ? (
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
                <Text 
                  size="sm"
                  style={{
                    flex: 1,
                    textDecoration: item.completed ? 'line-through' : 'none',
                    color: item.completed ? '#909296' : '#1A1B1E',
                  }}
                >
                  {item.title}
                  {hasSubtasks && (
                    <Text span size="xs" color="dimmed" ml={8}>
                      {completedSubtasks}/{totalSubtasks}
                    </Text>
                  )}
                </Text>
              )}

              <Group spacing={4}>
                {hasSubtasks && (
                  <ActionIcon 
                    size="sm"
                    variant="subtle"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                  >
                    <IconChevronDown 
                      size={16} 
                      style={{ 
                        transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}
                    />
                  </ActionIcon>
                )}
                
                <Menu position="bottom-end" transition="pop">
                  <Menu.Target>
                    <ActionIcon size="sm" variant="subtle">
                      <IconDotsVertical size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item icon={<IconEdit size={16} />} onClick={() => setIsEditing(true)}>
                      Edit
                    </Menu.Item>
                    {depth < 8 && (
                      <Menu.Item icon={<IconPlus size={16} />} onClick={() => setIsAddingSubTask(true)}>
                        Add subtask
                      </Menu.Item>
                    )}
                    <Menu.Item color="red" icon={<IconX size={16} />} onClick={() => deleteItem(item.id)}>
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>

            {isAddingSubTask && (
              <div style={{ paddingLeft: (depth + 1) * 40 }}>
                <TextInput
                  value={newSubTaskTitle}
                  onChange={(e) => setNewSubTaskTitle(e.target.value)}
                  placeholder="New subtask..."
                  size="sm"
                  autoFocus
                  rightSection={
                    <ActionIcon size="sm" variant="subtle" onClick={handleAddSubTask}>
                      <IconPlus size={16} />
                    </ActionIcon>
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newSubTaskTitle.trim()) {
                      handleAddSubTask();
                    }
                  }}
                />
              </div>
            )}

            {hasSubtasks && !isCollapsed && (
              <Droppable droppableId={`${item.id}/subtasks`}>
                {(provided) => (
                  <Stack
                    spacing={1}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {item.subItems.map((subItem, idx) => (
                      <ItemComponent
                        key={subItem.id}
                        item={subItem}
                        index={idx}
                        depth={depth + 1}
                        parentChain={[...parentChain, item]}
                      />
                    ))}
                    {provided.placeholder}
                  </Stack>
                )}
              </Droppable>
            )}
          </Stack>
        </div>
      )}
    </Draggable>
  );
};

export default ItemComponent;
