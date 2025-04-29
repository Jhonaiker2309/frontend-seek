import React, { useEffect, useMemo } from 'react';
import { Container, Typography, Paper, Box, CircularProgress, Alert } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { useTaskStore } from '../store/taskStore';
import { TaskStatus } from '../types/task';

const TaskChartPage: React.FC = () => {
  const { tasks, loading, error, fetchTasks } = useTaskStore();

  useEffect(() => {
      fetchTasks();
  }, []);

  const chartData = useMemo(() => {
    const counts: Record<TaskStatus, number> = {
      'to do': 0,
      'in progress': 0,
      'finished': 0,
    };
    tasks.forEach(task => {
      if (counts.hasOwnProperty(task.completed)) {
        counts[task.completed]++;
      }
    });

    return [
      { name: 'To Do', count: counts['to do'], fill: '#ffc658' },
      { name: 'In Progress', count: counts['in progress'], fill: '#8884d8' },
      { name: 'Finished', count: counts['finished'], fill: '#82ca9d' },
    ];
  }, [tasks]);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Task Status Overview
      </Typography>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}

      {error && !loading && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

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