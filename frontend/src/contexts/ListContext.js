import React, { createContext, useState, useContext } from 'react';
import { showNotification } from '@mantine/notifications';
import axiosInstance from '../utils/axios';
import { API_ENDPOINTS } from '../config/api';

const ListContext = createContext();

export const ListProvider = ({ children }) => {
  const [lists, setLists] = useState([
    {
      id: '1',
      title: 'To Do',
      items: [
        { 
          id: '1', 
          title: 'Create login page',
          description: 'Implement user authentication flow',
          labels: ['Frontend', 'High'],
          completed: false,
          collapsed: false,
          subItems: [
            { 
              id: '1-1', 
              title: 'Design login form',
              completed: true,
              collapsed: false,
              subItems: [
                { 
                  id: '1-1-1', 
                  title: 'Create wireframes',
                  completed: true,
                  subItems: []
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: '2',
      title: 'In Progress',
      items: []
    }
  ]);

  const updateItemsRecursively = (items, targetId, updateFn) => {
    return items.map(item => {
      if (item.id === targetId) {
        const updatedItem = updateFn(item);
        return updatedItem;
      }
      if (item.subItems?.length > 0) {
        const updatedSubItems = updateItemsRecursively(item.subItems, targetId, updateFn);
        if (updatedSubItems !== item.subItems) {
          return {
            ...item,
            subItems: updatedSubItems
          };
        }
      }
      return item;
    });
  };

  const addList = async (title) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.lists.create, {
        title: title || 'New List'
      });
      setLists(prev => [...prev, response.data]);
      showNotification({
        title: 'List created',
        message: 'New list has been added',
        color: 'green'
      });
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to create list',
        color: 'red'
      });
    }
  };

  const updateList = (listId, updates) => {
    setLists(prev => 
      prev.map(list => 
        list.id === listId 
          ? { ...list, ...updates }
          : list
      )
    );
    
    showNotification({
      title: 'List updated',
      message: 'The list has been updated successfully',
      color: 'blue'
    });
  };

  const deleteList = (listId) => {
    setLists(prev => prev.filter(list => list.id !== listId));
    showNotification({
      title: 'List deleted',
      message: 'The list has been removed successfully',
      color: 'red'
    });
  };

  const addItem = (listId, newItem) => {
    if (!newItem?.title?.trim()) {
      showNotification({
        title: 'Error',
        message: 'Task title cannot be empty',
        color: 'red'
      });
      return null;
    }

    const item = {
      id: Date.now().toString(),
      title: newItem.title.trim(),
      description: newItem.description || '',
      labels: newItem.labels || [],
      completed: false,
      collapsed: false,
      subItems: []
    };

    setLists(prev => 
      prev.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            items: [...list.items, item]
          };
        }
        return list;
      })
    );

    showNotification({
      title: 'Task added',
      message: 'New task has been created',
      color: 'green'
    });

    return item.id;
  };

  const getItemDepth = (items, targetId, currentDepth = 0) => {
    for (const item of items) {
      if (item.id === targetId) {
        return currentDepth;
      }
      if (item.subItems?.length > 0) {
        const depth = getItemDepth(item.subItems, targetId, currentDepth + 1);
        if (depth !== -1) {
          return depth;
        }
      }
    }
    return -1;
  };

  const addSubItem = (parentId, newItem = { title: 'New Sub-task' }) => {
    if (!newItem?.title?.trim()) {
      showNotification({
        title: 'Error',
        message: 'Sub-task title cannot be empty',
        color: 'red'
      });
      return null;
    }

    const parentDepth = lists.some(list => 
      getItemDepth(list.items, parentId) !== -1
    );

    if (parentDepth >= 2) {
      showNotification({
        title: 'Error',
        message: 'Maximum task depth reached (3 levels)',
        color: 'red'
      });
      return null;
    }

    const newId = Date.now().toString();
    
    setLists(prev => 
      prev.map(list => ({
        ...list,
        items: updateItemsRecursively(list.items, parentId, parent => ({
          ...parent,
          collapsed: false,
          subItems: [
            ...(parent.subItems || []),
            {
              id: newId,
              title: newItem.title.trim(),
              description: newItem.description || '',
              labels: newItem.labels || [],
              completed: false,
              collapsed: false,
              subItems: []
            }
          ]
        }))
      }))
    );

    showNotification({
      title: 'Success',
      message: 'Sub-task added successfully',
      color: 'green'
    });
    
    return newId;
  };

  const updateItem = (itemId, updates) => {
    setLists(prev => 
      prev.map(list => ({
        ...list,
        items: updateItemsRecursively(list.items, itemId, item => ({
          ...item,
          ...updates
        }))
      }))
    );
  };

  const deleteItemRecursively = (items, itemId) => {
    return items.filter(item => {
      if (item.id === itemId) {
        return false;
      }
      if (item.subItems?.length > 0) {
        item.subItems = deleteItemRecursively(item.subItems, itemId);
      }
      return true;
    });
  };

  const deleteItem = (itemId) => {
    setLists(prev => 
      prev.map(list => ({
        ...list,
        items: deleteItemRecursively(list.items, itemId)
      }))
    );
    
    showNotification({
      title: 'Task deleted',
      message: 'The task has been removed',
      color: 'red'
    });
  };

  const toggleItemCollapse = (itemId) => {
    setLists(prev => 
      prev.map(list => ({
        ...list,
        items: updateItemsRecursively(list.items, itemId, item => ({
          ...item,
          collapsed: !item.collapsed
        }))
      }))
    );
  };

  const toggleItemComplete = (itemId) => {
    setLists(prev => 
      prev.map(list => ({
        ...list,
        items: updateItemsRecursively(list.items, itemId, item => {
          const newCompleted = !item.completed;
          return {
            ...item,
            completed: newCompleted,
            subItems: item.subItems?.map(subItem => ({
              ...subItem,
              completed: newCompleted,
              subItems: subItem.subItems?.map(subSubItem => ({
                ...subSubItem,
                completed: newCompleted
              }))
            }))
          };
        })
      }))
    );
  };

  const moveItem = (source, destination) => {
    if (!destination) return;

    setLists(prev => {
      const newLists = [...prev];
      const sourceList = newLists.find(list => list.id === source.droppableId);
      const destList = newLists.find(list => list.id === destination.droppableId);
      
      if (!sourceList || !destList) return prev;
      
      const [movedItem] = sourceList.items.splice(source.index, 1);
      destList.items.splice(destination.index, 0, movedItem);
      
      return newLists;
    });
  };

  const renameList = (listId, newTitle) => {
    if (!newTitle?.trim()) {
      showNotification({
        title: 'Error',
        message: 'List title cannot be empty',
        color: 'red'
      });
      return;
    }

    setLists(prev =>
      prev.map(list =>
        list.id === listId
          ? { ...list, title: newTitle.trim() }
          : list
      )
    );

    showNotification({
      title: 'Success',
      message: 'List renamed successfully',
      color: 'green'
    });
  };

  return (
    <ListContext.Provider value={{
      lists,
      addList,
      updateList,
      deleteList,
      addItem,
      addSubItem,
      updateItem,
      deleteItem,
      toggleItemCollapse,
      toggleItemComplete,
      moveItem,
      renameList
    }}>
      {children}
    </ListContext.Provider>
  );
};

export const useList = () => {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error('useList must be used within a ListProvider');
  }
  return context;
};

export default ListContext;