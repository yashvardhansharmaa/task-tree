import React, { createContext, useState, useContext, useEffect } from 'react';
import { showNotification } from '@mantine/notifications';
import axiosInstance from '../utils/axios';
import { API_ENDPOINTS } from '../config/api';

const ListContext = createContext(null);

export const ListProvider = ({ children }) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's lists when component mounts
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLists([]);
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get(API_ENDPOINTS.lists.getAll);
        if (response.data.lists) {
          // Transform backend data to match frontend structure
          const transformedLists = response.data.lists.map(list => ({
            id: list.id,
            title: list.name,
            items: list.items || []
          }));
          setLists(transformedLists);
        }
      } catch (error) {
        console.error('Failed to fetch lists:', error);
        showNotification({
          title: 'Error',
          message: 'Failed to load your lists',
          color: 'red'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, []);

  const updateItemsRecursively = (items, targetId, updateFn) => {
    return items.map(item => {
      if (item.id === targetId) {
        return updateFn(item);
      }
      if (item.subItems?.length > 0) {
        return {
          ...item,
          subItems: updateItemsRecursively(item.subItems, targetId, updateFn)
        };
      }
      return item;
    });
  };

  const addList = async (title) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.lists.create, {
        name: title || 'New List',
        subject: title || 'New List',
        description: ''
      });

      if (response.data.ok) {
        const newList = {
          id: response.data.list.id,
          title: response.data.list.name,
          items: []
        };

        setLists(prev => [...prev, newList]);
        
        showNotification({
          title: 'Success',
          message: 'New list has been added',
          color: 'green'
        });
      }
    } catch (error) {
      console.error('Failed to create list:', error);
      showNotification({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to create list',
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

  const addItem = async (listId, newItem) => {
    if (!newItem?.title?.trim()) {
      showNotification({
        title: 'Error',
        message: 'Task title cannot be empty',
        color: 'red'
      });
      return null;
    }

    try {
      const response = await axiosInstance.post(API_ENDPOINTS.items.create(listId), {
        title: newItem.title.trim(),
        description: newItem.description || '',
        labels: newItem.labels || []
      });

      if (response.data.ok) {
        setLists(prev => 
          prev.map(list => {
            if (list.id === listId) {
              return {
                ...list,
                items: [...list.items, response.data.item]
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

        return response.data.item.id;
      }
    } catch (error) {
      console.error('Failed to add item:', error);
      showNotification({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to add task',
        color: 'red'
      });
      return null;
    }
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

  const addSubItem = async (parentId, newItem) => {
    if (!newItem?.title?.trim()) {
      showNotification({
        title: 'Error',
        message: 'Sub-task title cannot be empty',
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
      loading,
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