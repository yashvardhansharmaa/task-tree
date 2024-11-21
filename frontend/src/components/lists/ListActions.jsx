import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useApi } from '../../contexts/ApiProvider';

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    minWidth: 180,
    boxShadow: theme.shadows[3],
  }
}));

const ListActions = memo(({ listId, listName, onUpdateLists }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState(listName);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const api = useApi();

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    handleMenuClose();
    setEditedName(listName);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleEditConfirm = async () => {
    if (!editedName.trim()) {
      setError('List name cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Updating list name:', { listId, newName: editedName.trim() });
      const response = await api.patch(`/lists/${listId}/`, {
        name: editedName.trim(),
      });

      console.log('Update response:', response);

      if (response.ok) {
        await onUpdateLists();
        setEditDialogOpen(false);
        setError('');
      } else {
        throw new Error(response.body?.message || 'Failed to update list name');
      }
    } catch (error) {
      console.error('Error updating list name:', error);
      setError(error.message || 'Failed to update list name');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    try {
      console.log('Deleting list:', listId);
      const response = await api.delete(`/lists/${listId}/`);
      console.log('Delete response:', response);

      if (response.ok) {
        await onUpdateLists();
        setDeleteDialogOpen(false);
      } else {
        throw new Error(response.body?.message || 'Failed to delete list');
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      // You could add a snackbar/toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleEditConfirm();
    }
  };

  return (
    <>
      <Tooltip title="List actions">
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          onMouseDown={(e) => e.stopPropagation()} // Prevent drag interference
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>

      <StyledMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename List</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete List</ListItemText>
        </MenuItem>
      </StyledMenu>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => !isLoading && setEditDialogOpen(false)}
        onClick={(e) => e.stopPropagation()}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Rename List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="List Name"
            type="text"
            fullWidth
            value={editedName}
            onChange={(e) => {
              setEditedName(e.target.value);
              setError('');
            }}
            onKeyPress={handleKeyPress}
            error={!!error}
            helperText={error}
            disabled={isLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditConfirm} 
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => !isLoading && setDeleteDialogOpen(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Delete List</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{listName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

ListActions.propTypes = {
  listId: PropTypes.number.isRequired,
  listName: PropTypes.string.isRequired,
  onUpdateLists: PropTypes.func.isRequired,
};

ListActions.displayName = 'ListActions';

export default ListActions;