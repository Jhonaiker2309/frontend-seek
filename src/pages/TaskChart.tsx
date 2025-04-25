import React, { useEffect, useMemo } from 'react';
import { Container, Typography, Paper, Box, CircularProgress, Alert } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Import Zustand task store hook
import { useTaskStore } from '../store/taskStore';
// Import Task type/interface
import { TaskStatus } from '../types/task'; // Assuming types are correctly defined

const TaskChartPage: React.FC = () => {
  // Get state and actions from Zustand store
  const { tasks, loading, error, fetchTasks } = useTaskStore();

  // Fetch tasks if not already loaded or if an error occurred previously
  useEffect(() => {
    // Fetch only if tasks array is empty to avoid redundant calls
    // if tasks are managed globally and fetched elsewhere (e.g., TaskList),
    // this check might be sufficient.
    if (tasks.length === 0 && !loading && !error) {
      fetchTasks();
    }

    // Clear error on component unmount
    return () => {
    };
  }, [fetchTasks, tasks.length, loading, error]); // Dependencies for fetching logic

  // Calculate data for the chart using useMemo
  const chartData = useMemo(() => {
    const counts: Record<TaskStatus, number> = {
      'to do': 0,
      'in progress': 0,
      'finished': 0,
    };
    tasks.forEach(task => {
      // Ensure task.completed is a valid status before incrementing
      if (counts.hasOwnProperty(task.completed)) {
        counts[task.completed]++;
      }
    });

    return [
      { name: 'To Do', count: counts['to do'], fill: '#ffc658' }, // Example color: Orange
      { name: 'In Progress', count: counts['in progress'], fill: '#8884d8' }, // Example color: Purple
      { name: 'Finished', count: counts['finished'], fill: '#82ca9d' }, // Example color: Green
    ];
  }, [tasks]); // Recalculate only when tasks change

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Task Status Overview
      </Typography>

      {/* Display loading indicator */}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}

      {/* Display error message */}
      {error && !loading && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Display chart or message */}
      {!loading && !error && (
        <Paper elevation={3} sx={{ p: 3, height: 400 }}>
           {tasks.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} label={{ value: 'Number of Tasks', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}/>
                  <Tooltip />
                  <Legend />
                  {/* Render bars dynamically based on chartData which includes fill */}
                  <Bar dataKey="count" />
                </BarChart>
            </ResponsiveContainer>
           ) : (
             <Typography sx={{ textAlign: 'center', mt: 4 }}>No task data available to display the chart.</Typography>
           )}
        </Paper>
      )}
    </Container>
  );
};

export default TaskChartPage;