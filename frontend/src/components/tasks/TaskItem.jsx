import React, { useState, useEffect, useCallback, memo } from 'react';
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TaskActions from "./TaskActions";
import { styled } from "@mui/material/styles";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { useApi } from "../../contexts/ApiProvider";
import { debounce } from 'lodash';

const StyledAccordion = styled(Accordion)(({ theme, level = 0 }) => ({
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  marginLeft: `${level * 20}px`,
  width: `calc(100% - ${level * 20}px)`,
  transition: theme.transitions.create(['margin', 'width']),
  '&:not(:last-child)': {
    marginBottom: theme.spacing(0.5),
  },
  '@media (max-width: 600px)': {
    marginLeft: `${level * 10}px`,
    width: `calc(100% - ${level * 10}px)`,
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.grey[800] 
    : theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.divider}`,
  minHeight: '3.7rem',
  padding: theme.spacing(0.75, 1.5),
  '&.Mui-focused': {
    backgroundColor: theme.palette.action.focus,
  },
}));

const TaskTitleContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  cursor: 'pointer',
  fontSize: '0.9rem',
  margin: theme.spacing(0, 0.5),
  gap: theme.spacing(1),
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark'
    ? theme.palette.grey[900]
    : theme.palette.grey[100],
  padding: theme.spacing(1),
  transition: theme.transitions.create('background-color'),
}));

const TaskTitle = styled(Typography)(({ theme, completed }) => ({
  textDecoration: completed ? 'line-through' : 'none',
  color: completed ? theme.palette.text.disabled : theme.palette.text.primary,
  transition: theme.transitions.create(['color', 'text-decoration']),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '100%',
}));

const TaskItem = memo(({ task, onUpdateLists, level = 0 }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTaskName, setNewTaskName] = useState(task.name);
  const [expanded, setExpanded] = useState(false);
  const [newSubtaskAdded, setNewSubtaskAdded] = useState(false);
  const hasSubtasks = task.subtasks?.length > 0;
  const api = useApi();

  // Debounced save function to prevent too many API calls
  const debouncedSave = useCallback(
    debounce(async (taskId, updates) => {
      try {
        const response = await api.patch(`/tasks/${taskId}/update`, updates);
        if (!response.ok) {
          throw new Error('Failed to update task');
        }
        onUpdateLists();
      } catch (error) {
        console.error('Failed to update task:', error);
        // Implement proper error handling/user feedback here
      }
    }, 500),
    [api, onUpdateLists]
  );

  const handleCheckboxChange = useCallback(async (taskId, newStatus) => {
    debouncedSave(taskId, {
      name: task.name,
      is_completed: newStatus,
      list_id: task.list_id,
      parent_id: task.parent_id,
    });
  }, [debouncedSave, task]);

  const handleEditTask = useCallback(async () => {
    if (!newTaskName.trim()) {
      setNewTaskName(task.name);
      setIsEditing(false);
      return;
    }

    debouncedSave(task.id, {
      ...task,
      name: newTaskName,
    });
    setIsEditing(false);
  }, [debouncedSave, newTaskName, task]);

  useEffect(() => {
    if (newSubtaskAdded) {
      setExpanded(true);
      setNewSubtaskAdded(false);
    }
  }, [newSubtaskAdded]);

  const onSubtaskAdded = useCallback(() => {
    setNewSubtaskAdded(true);
  }, []);

  const toggleAccordion = useCallback((e) => {
    e.stopPropagation();
    if (hasSubtasks) {
      setExpanded(prev => !prev);
    }
  }, [hasSubtasks]);

  const handleDragEnd = useCallback((event) => {
    // Your code here
  }, [/* Add your dependencies here */]);

  return (
    <StyledAccordion 
      expanded={expanded && hasSubtasks} 
      level={level}
      onChange={toggleAccordion}
      TransitionProps={{ unmountOnExit: true }}
    >
      <StyledAccordionSummary
        expandIcon={hasSubtasks && <ExpandMoreIcon />}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Task: ${task.name}`}
      >
        <Checkbox
          checked={task.is_completed}
          onChange={(e) => handleCheckboxChange(task.id, e.target.checked)}
          aria-label={`Mark task ${task.name} as ${task.is_completed ? 'incomplete' : 'complete'}`}
        />
        <TaskTitleContainer onClick={() => setIsEditing(true)}>
          {isEditing ? (
            <TextField
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onBlur={handleEditTask}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleEditTask();
                }
              }}
              fullWidth
              autoFocus
              size="small"
              inputProps={{
                'aria-label': 'Edit task name',
              }}
            />
          ) : (
            <TaskTitle 
              completed={task.is_completed}
              variant="body1"
              component="div"
            >
              {task.name}
            </TaskTitle>
          )}
        </TaskTitleContainer>

        <TaskActions
          task={task}
          onUpdateLists={onUpdateLists}
          onSubtaskAdded={onSubtaskAdded}
        />
      </StyledAccordionSummary>
      {hasSubtasks && (
        <StyledAccordionDetails>
          {task.subtasks.map((subtask) => (
            <TaskItem
              key={subtask.id}
              task={subtask}
              onUpdateLists={onUpdateLists}
              level={level + 1}
            />
          ))}
        </StyledAccordionDetails>
      )}
    </StyledAccordion>
  );
});

TaskItem.displayName = 'TaskItem';

export default TaskItem;
