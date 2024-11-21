import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  CircularProgress,
  TextField,
  InputAdornment,
  Divider,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import FolderIcon from "@mui/icons-material/Folder";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { useApi } from "../../contexts/ApiProvider";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    width: "100%",
    maxWidth: 500,
    maxHeight: "80vh",
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1, 2),
  position: "sticky",
  top: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
}));

const ListContainer = styled(List)(({ theme }) => ({
  overflow: "auto",
  padding: 0,
  "& .MuiListItem-root": {
    transition: theme.transitions.create(["background-color", "transform"], {
      duration: theme.transitions.duration.shorter,
    }),
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      transform: "translateX(4px)",
    },
  },
  "& .MuiListItem-root.selected": {
    backgroundColor: theme.palette.action.selected,
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderLeft: `3px solid transparent`,
  "&:hover": {
    borderLeft: `3px solid ${theme.palette.primary.main}`,
  },
  "&.current": {
    backgroundColor: theme.palette.action.hover,
    borderLeft: `3px solid ${theme.palette.error.main}`,
    "&::after": {
      content: "'Current List'",
      position: "absolute",
      right: theme.spacing(2),
      fontSize: "0.75rem",
      color: theme.palette.error.main,
    },
  },
}));

const MoveTask = ({ task, open, onClose, fetchLists }) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListId, setSelectedListId] = useState(null);
  const api = useApi();

  // Fetch lists when dialog opens
  useEffect(() => {
    if (open) {
      const fetchAvailableLists = async () => {
        setLoading(true);
        setError(null);
        try {
          const storedColumns = localStorage.getItem("columns");
          if (storedColumns) {
            const allLists = Object.values(JSON.parse(storedColumns));
            const filteredLists = allLists.filter(
              (list) => list.id !== task.list_id
            );
            setLists(filteredLists);
          }
        } catch (error) {
          setError("Failed to load lists. Please try again.");
          console.error("Error fetching lists:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchAvailableLists();
    }
  }, [open, task.list_id]);

  // Filter lists based on search query
  const filteredLists = lists.filter((list) =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMoveTask = async (targetListId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/tasks/${task.id}/move`, {
        list_id: targetListId,
      });
      if (response.ok) {
        fetchLists();
        onClose();
      } else {
        throw new Error(response.body?.message || "Failed to move task");
      }
    } catch (error) {
      setError(error.message || "Failed to move task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      aria-labelledby="move-task-dialog-title"
    >
      <DialogTitle id="move-task-dialog-title">
        <Typography variant="h6" component="div">
          Move Task
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          "{task.name}"
        </Typography>
      </DialogTitle>

      <SearchContainer>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search lists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </SearchContainer>

      <Divider />

      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : filteredLists.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography color="textSecondary">
              {searchQuery
                ? "No lists match your search"
                : "No other lists available"}
            </Typography>
          </Box>
        ) : (
          <ListContainer>
            {filteredLists.map((list) => (
              <StyledListItem
                button
                key={list.id}
                onClick={() => setSelectedListId(list.id)}
                className={selectedListId === list.id ? "selected" : ""}
                disabled={list.id === task.list_id}
              >
                <ListItemIcon>
                  {list.id === task.list_id ? (
                    <ArrowRightIcon color="error" />
                  ) : (
                    <FolderIcon color="action" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={list.name}
                  secondary={`${list.tasks?.length || 0} tasks`}
                />
              </StyledListItem>
            ))}
          </ListContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={() => handleMoveTask(selectedListId)}
          color="primary"
          variant="contained"
          disabled={!selectedListId || loading}
        >
          {loading ? "Moving..." : "Move Task"}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default MoveTask;