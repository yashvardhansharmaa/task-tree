import React, { useEffect, useState, useContext, useCallback } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import List from "./lists/list";
import { useApi } from "../contexts/ApiProvider";
import AddList from "./lists/AddList";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useTheme } from '../contexts/ThemeContext';
import { Typography, CircularProgress } from '@mui/material';

const Container = styled("div")(({ theme, isDark }) => ({
  display: "flex",
  overflowX: "auto",
  alignItems: "flex-start",
  width: "100%",
  backgroundColor: isDark ? theme.palette.background.default : theme.palette.background.paper,
  minHeight: "calc(100vh - 64px)",
  padding: theme.spacing(2),
  transition: "background-color 0.3s ease",
}));

const DraggableBoard = () => {
  const api_provider = useApi();
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);
  const { isDarkMode } = useTheme();
  const [data, setData] = useState({
    tasks: {},
    columns: {},
    columnOrder: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api_provider.get('/lists');
      
      if (response.ok) {
        const lists = response.body.lists || [];
        setData({
          tasks: {},
          columns: lists.reduce((acc, list) => {
            acc[list.id] = {
              id: list.id,
              name: list.name,
              tasks: list.tasks || []
            };
            return acc;
          }, {}),
          columnOrder: lists.map(list => list.id)
        });
      } else {
        throw new Error(response.body?.message || 'Failed to fetch lists');
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [api_provider]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchLists();
    } else {
      navigate('/login');
    }
  }, [isLoggedIn, navigate, fetchLists]);

  const onDragEnd = async (result) => {
    // Implement drag and drop logic here
    console.log(result);
  };

  if (loading) {
    return (
      <Container isDark={isDarkMode} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <>
      <AddList onUpdateLists={fetchLists} />
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="all-columns"
          direction="horizontal"
          type="column"
        >
          {(provided) => (
            <Container 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              isDark={isDarkMode}
            >
              {data.columnOrder && data.columnOrder.length > 0 ? (
                data.columnOrder.map((columnId, index) => {
                  const column = data.columns[columnId];
                  if (!column) {
                    console.error(`Column not found for id: ${columnId}`);
                    return null;
                  }
                  return (
                    <List
                      key={columnId}
                      id={columnId}
                      name={column.name}
                      tasks={column.tasks || []}
                      index={index}
                      onUpdateLists={fetchLists}
                    />
                  );
                })
              ) : (
                <Typography variant="h6" style={{ margin: '20px' }}>
                  No lists found. Create one to get started!
                </Typography>
              )}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

export default DraggableBoard;