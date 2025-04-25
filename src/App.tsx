import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
} from '@mui/material';

import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import TaskListPage from './pages/TaskList';
import TaskChartPage from './pages/TaskChart';
import ProtectedRoute from './components/ProtectedRoute';
import NavBar from './components/Navbar';

import { useAuthStore } from './store/authStore';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NavBar isAuthenticated={isAuthenticated} />
        <Container maxWidth="lg" sx={{ mb: 4 }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <TaskListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chart"
              element={
                <ProtectedRoute>
                  <TaskChartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={isAuthenticated ? <Navigate to="/tasks" /> : <Navigate to="/login" />}
            />
             <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;