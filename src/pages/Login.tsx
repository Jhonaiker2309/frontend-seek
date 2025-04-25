import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link as MuiLink, // Renamed to avoid conflict with react-router Link
  Paper,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link as RouterLink } from 'react-router-dom'; // For navigation links

// Import the Zustand auth store hook
import { useAuthStore } from '../store/authStore';

// Validation Schema
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Email inválido')
    .required('El email es requerido'),
  password: Yup.string()
    .required('La contraseña es requerida'),
});

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get state and actions from the Zustand store
  const { login, loading, error: authError, isAuthenticated } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null); // Local state for submit errors

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/tasks'; // Redirect to intended page or /tasks
      navigate(from, { replace: true });
    }
  }, []);


  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setApiError(null); // Clear previous local error
      try {
        const success = await login({email: values.email, password: values.password}); // Call login action
        if (success) {
          const from = location.state?.from?.pathname || '/tasks';
          navigate(from, { replace: true }); // Navigate on success
        } else {
          // If login action returns false without throwing, use authError from store
          // If authError is null, set a generic message
           setApiError(authError || 'Credenciales inválidas o error en el servidor.');
        }
      } catch (err: any) {
        // Catch errors thrown by the login action (less common if returning boolean)
        console.error("Login submit error:", err);
        setApiError(err.message || 'Ocurrió un error inesperado.');
      }
    },
  });

  return (
    <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Iniciar sesión
          </Typography>

          {/* Display API or Store Error */}
          {(apiError || authError) && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {apiError || authError}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur} // Track visited fields
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={loading} // Disable field when loading
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              disabled={loading} // Disable field when loading
            />
            {/* Add Remember me checkbox if needed */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading} // Disable button when loading
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
            </Button>
            <Box sx={{ textAlign: 'right' }}>
              <MuiLink component={RouterLink} to="/register" variant="body2">
                {"¿No tienes cuenta? Regístrate"}
              </MuiLink>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;