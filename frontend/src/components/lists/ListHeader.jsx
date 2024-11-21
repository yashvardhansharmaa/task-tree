import React, { memo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FilterListIcon from '@mui/icons-material/FilterList';
import ListActions from './ListActions';
import CompletedTasksCount from './CompletedTasksCount';

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 1.5),
  backgroundColor: theme.palette.mode === 'dark'
    ? theme.palette.grey[800]
    : theme.palette.grey[100],
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  borderBottom: `1px solid ${theme.palette.divider}`,
  minHeight: '48px',
  position: 'relative',
  '&:hover': {
    '& .MuiIconButton-root': {
      opacity: 1,
    }
  }
}));

const ListTitle = styled(Typography)(({ theme }) => ({
  flex: 1,
  fontWeight: 500,
  marginLeft: theme.spacing(1),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  transition: theme.transitions.create('opacity'),
  '&:hover': {
    opacity: 0.8,
  }
}));

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  '& .MuiIconButton-root': {
    opacity: 0.7,
    transition: theme.transitions.create('opacity'),
    '&:hover': {
      opacity: 1,
    }
  }
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const ListHeader = memo(({
  id,
  name,
  tasks,
  isExpanded,
  showCompleted,
  onToggleExpanded,
  onToggleShowCompleted,
  onUpdateLists,
  dragHandleProps
}) => {
  const theme = useTheme();
  const completedTasksCount = tasks.filter(task => task.is_completed).length;

  return (
    <HeaderContainer {...dragHandleProps}>
      <Tooltip title={isExpanded ? "Collapse list" : "Expand list"}>
        <IconButton 
          size="small" 
          onClick={onToggleExpanded}
          sx={{ mr: 1 }}
        >
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Tooltip>

      <ListTitle variant="h6">
        {name}
      </ListTitle>

      <ActionsContainer>
        <Tooltip title={`${showCompleted ? "Hide" : "Show"} completed tasks`}>
          <IconButton 
            size="small" 
            onClick={onToggleShowCompleted}
            color={showCompleted ? "primary" : "default"}
          >
            <StyledBadge badgeContent={completedTasksCount} color="primary">
              <FilterListIcon />
            </StyledBadge>
          </IconButton>
        </Tooltip>

        <CompletedTasksCount tasks={tasks} />
        
        <ListActions 
          listId={id} 
          listName={name}
          onUpdateLists={onUpdateLists}
        />
      </ActionsContainer>
    </HeaderContainer>
  );
});

ListHeader.displayName = 'ListHeader';

export default ListHeader;