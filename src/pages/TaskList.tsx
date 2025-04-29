import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Alert,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Paper,
  Divider,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTaskStore } from '../store/taskStore';
import { TaskStatus, NewTaskData } from '../types/task';

// Helper function to get border style based on status
const getStatusBorderStyle = (status: TaskStatus) => {
  switch (status) {
    case 'to do':
      return { borderLeft: '5px solid', borderColor: 'warning.main' };
    case 'in progress':
      return { borderLeft: '5px solid', borderColor: 'info.main' };
    case 'finished':
      return { borderLeft: '5px solid', borderColor: 'success.main' };
    default:
      return { borderLeft: '5px solid', borderColor: 'grey.300' };
  }
};

const TaskListPage: React.FC = () => {
  const { tasks, loading, error, fetchTasks, addTask, updateTask, deleteTask } = useTaskStore(); // Added clearError

  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDescription, setNewTaskDescription] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleOpenAddDialog = () => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    const newTaskData: NewTaskData = {
      title: newTaskTitle,
      description: newTaskDescription || undefined,
    };
    const success = await addTask(newTaskData);
    if (success) {
      showSnackbar('Task added successfully!');
      handleCloseAddDialog();
    } else {
      showSnackbar(error || 'Failed to add task.');
    }
  };

  const handleStatusChange = async (taskId: string, event: SelectChangeEvent<TaskStatus>) => {
    const newStatus = event.target.value as TaskStatus;
    const success = await updateTask(taskId, { completed: newStatus });
    if (success) {
      showSnackbar('Task status updated!');
    } else {
      showSnackbar(error || 'Failed to update task status.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const success = await deleteTask(taskId);
    if (success) {
      showSnackbar('Task deleted successfully!');
    } else {
      showSnackbar(error || 'Failed to delete task.');
    }
  };

  const handleCloseSnackbar = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          disabled={loading}
        >
          Add Task
        </Button>
      </Box>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
      {error && !loading && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!loading && !error && (
        <Paper elevation={2} sx={{ overflow: 'hidden' }}>
          <List disablePadding>
            {tasks.map((task, index) => (
              <React.Fragment key={task.id}>
                <ListItem
                  sx={{
                    ...getStatusBorderStyle(task.completed),
                    py: 1.5,
                    px: 2,
                    bgcolor: task.completed === 'finished' ? 'grey.100' : 'background.paper',
                    '&:hover': {
                      bgcolor: task.completed === 'finished' ? 'grey.200' : 'action.hover',
                    },
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <FormControl size="small" sx={{ minWidth: 120 }} disabled={loading}>
                        <InputLabel id={`status-label-${task.id}`}>Status</InputLabel>
                        <Select
                          labelId={`status-label-${task.id}`}
                          id={`status-select-${task.id}`}
                          value={task.completed}
                          label="Status"
                          onChange={(e) => handleStatusChange(task.id, e)}
                        >
                          <MenuItem value="to do">To Do</MenuItem>
                          <MenuItem value="in progress">In Progress</MenuItem>
                          <MenuItem value="finished">Finished</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={loading}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Typography variant="body1" component="span" sx={{ fontWeight: 500 }}>
                        {task.title}
                      </Typography>
                    }
                    secondary={task.description || 'No description'}
                    sx={{
                      textDecoration: task.completed === 'finished' ? 'line-through' : 'none',
                      color: task.completed === 'finished' ? 'text.disabled' : 'text.primary',
                      pr: 2,
                    }}
                  />
                </ListItem>
                {index < tasks.length - 1 && <Divider component="li" variant="inset" />}
              </React.Fragment>
            ))}
             {tasks.length === 0 && (
                <ListItem sx={{ py: 3, justifyContent: 'center' }}>
                    <ListItemText primary="No tasks yet. Add one!" sx={{ textAlign: 'center' }} />
                </ListItem>
             )}
          </List>
        </Paper>
      )}

      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <DialogContentText sx={{ mb: 2 }}>
            Enter the details for your new task.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="Task Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            required
            disabled={loading}
          />
          <TextField
            margin="dense"
            id="description"
            label="Description (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            disabled={loading}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseAddDialog} disabled={loading} color="inherit">Cancel</Button>
          <Button
            onClick={handleAddTask}
            disabled={!newTaskTitle.trim() || loading}
            variant="contained"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Task'}
          </Button>
        </DialogActions>
      </Dialog>

       <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

    </Container>
  );
};

export default TaskListPage;