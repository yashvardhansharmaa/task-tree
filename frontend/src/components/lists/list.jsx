import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Draggable } from 'react-beautiful-dnd';
import { styled } from '@mui/material/styles';
import { Paper, Typography } from '@mui/material';
import ListActions from './ListActions';
import AddTaskForm from '../tasks/AddTask';
import TaskItem from '../tasks/TaskItem';
import CompletedTasksCount from './CompletedTasksCount';

const ListContainer = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: '#f4f7fa',
  width: '300px',
  minHeight: '100px',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '80vh',
}));

const ListHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
}));

const TasksContainer = styled('div')({
  flexGrow: 1,
  overflowY: 'auto',
  minHeight: '100px',
  maxHeight: 'calc(80vh - 180px)', // Adjust based on your header and footer heights
  padding: '8px',
});

const FooterContainer = styled('div')(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1),
}));

const List = memo(({ 
  id, 
  name, 
  tasks = [], 
  index,
  onUpdateLists
}) => {
  return (
    <Draggable draggableId={String(id)} index={index}>
      {(provided, snapshot) => (
        <ListContainer
          ref={provided.innerRef}
          {...provided.draggableProps}
          elevation={snapshot.isDragging ? 3 : 1}
        >
          <ListHeader {...provided.dragHandleProps}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CompletedTasksCount tasks={tasks} />
              <Typography variant="h6" component="h3">
                {name}
              </Typography>
            </div>
            <ListActions 
              listId={id}
              listName={name}
              onUpdateLists={onUpdateLists}
            />
          </ListHeader>

          <TasksContainer>
            {tasks.map((task, taskIndex) => (
              <TaskItem
                key={task.id}
                task={task}
                index={taskIndex}
                listId={id}
                onUpdateLists={onUpdateLists}
              />
            ))}
          </TasksContainer>

          <FooterContainer>
            <AddTaskForm 
              listId={id}
              onUpdateLists={onUpdateLists}
            />
          </FooterContainer>
        </ListContainer>
      )}
    </Draggable>
  );
});

List.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  tasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    is_completed: PropTypes.bool,
  })),
  index: PropTypes.number.isRequired,
  onUpdateLists: PropTypes.func.isRequired,
};

List.defaultProps = {
  tasks: [],
};

List.displayName = 'List';

export default List;