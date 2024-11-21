import React, { useState, useCallback } from "react";
import { useApi } from "../../contexts/ApiProvider";
import {
  TextField,
  Button,
  Box,
  Collapse,
  IconButton,
  Paper,
  Typography,
  Tooltip,
  CircularProgress,
  Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import { debounce } from 'lodash';

const StyledPaper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  transition: theme.transitions.create(['box-shadow', 'transform']),
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const AddButton = styled(Button)(({ theme }) => ({
  minWidth: '120px',
  height: '40px',
  marginLeft: theme.spacing(1),
  transition: theme.transitions.create(['background-color', 'transform']),
  '&:active': {
    transform: 'scale(0.98)',
  },
}));

const ExpandButton = styled(Button)(({ theme }) => ({
  width: '100%',
  justifyContent: 'flex-start',
  padding: theme.spacing(1, 2),
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

/**
 * AddTaskForm component for creating new tasks
 * @param {Object} props Component props
 * @param {Function} props.onUpdateLists Callback to update the list after task creation
 * @param {string} props.listID ID of the list to add the task to
 */
function AddTaskForm({ onUpdateLists, listID }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [taskData, setTaskData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const api = useApi();

  // Validation rules
  const validateForm = () => {
    const newErrors = {};
    if (!taskData.name.trim()) {
      newErrors.name = 'Task name is required';
    } else if (taskData.name.length > 100) {
      newErrors.name = 'Task name must be less than 100 characters';
    }
    
    if (taskData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Debounced validation for real-time feedback
  const debouncedValidate = useCallback(
    debounce((value, field) => {
      if (field === 'name') {
        if (!value.trim()) {
          setErrors(prev => ({ ...prev, name: 'Task name is required' }));
        } else if (value.length > 100) {
          setErrors(prev => ({ ...prev, name: 'Task name must be less than 100 characters' }));
        } else {
          setErrors(prev => ({ ...prev, name: undefined }));
        }
      }
      if (field === 'description' && value.length > 500) {
        setErrors(prev => ({ ...prev, description: 'Description must be less than 500 characters' }));
      } else {
        setErrors(prev => ({ ...prev, description: undefined }));
      }
    }, 300),
    []
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
    debouncedValidate(value, name);
  };

  const resetForm = () => {
    setTaskData({ name: '', description: '' });
    setErrors({});
    setIsExpanded(false);
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const response = await api.post("/add_task", {
        name: taskData.name,
        description: taskData.description,
        id: listID,
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        onUpdateLists();
        resetForm();
      } else {
        throw new Error(response.body?.message || 'Failed to create task');
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to create task. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [api, taskData, listID, onUpdateLists, validateForm, resetForm]);

  return (
    <StyledPaper elevation={isExpanded ? 2 : 1}>
      {!isExpanded ? (
        <ExpandButton
          startIcon={<AddIcon />}
          onClick={() => setIsExpanded(true)}
        >
          Add new task
        </ExpandButton>
      ) : (
        <FormContainer component="form" onSubmit={handleSubmit}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">Create New Task</Typography>
            <Tooltip title="Cancel">
              <IconButton size="small" onClick={resetForm}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <TextField
            fullWidth
            name="name"
            label="Task Name"
            value={taskData.name}
            onChange={handleInputChange}
            error={!!errors.name}
            helperText={errors.name}
            disabled={isSubmitting}
            autoFocus
            margin="dense"
          />

          <TextField
            fullWidth
            name="description"
            label="Description (optional)"
            value={taskData.description}
            onChange={handleInputChange}
            error={!!errors.description}
            helperText={errors.description}
            disabled={isSubmitting}
            multiline
            rows={2}
            margin="dense"
            InputProps={{
              startAdornment: (
                <DescriptionIcon color="action" sx={{ mr: 1, mt: 1 }} />
              ),
            }}
          />

          {errors.submit && (
            <Typography color="error" variant="caption" display="block" mt={1}>
              {errors.submit}
            </Typography>
          )}

          <Box display="flex" justifyContent="flex-end" mt={2} gap={1}>
            <Button
              color="inherit"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <AddButton
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting || Object.keys(errors).length > 0}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <AddIcon />}
            >
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </AddButton>
          </Box>
        </FormContainer>
      )}

      <Collapse in={showSuccess}>
        <Fade in={showSuccess}>
          <Box 
            bgcolor="success.light" 
            color="success.contrastText"
            p={1}
            textAlign="center"
          >
            <Typography variant="body2">
              Task created successfully!
            </Typography>
          </Box>
        </Fade>
      </Collapse>
    </StyledPaper>
  );
}

export default AddTaskForm;