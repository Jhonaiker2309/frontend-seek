import React, { useState, useEffect } from 'react'; // Import useEffect
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { Link as RouterLink } from 'react-router-dom';

// Import the Zustand auth store hook
import { useAuthStore } from '../store/authStore';

// Validation Schema
const validationSchema = Yup.object({
  // name: Yup.string() // Assuming a name field is needed for registration
  //   .required('El nombre es requerido'), // Keep commented if name is not sent to backend
  email: Yup.string()
    .email('Email inválido')
    .required('El email es requerido'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
});

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get location object
  // Get state and actions from the Zustand store
  const { register, loading, error: authError, isAuthenticated } = useAuthStore(); // Get isAuthenticated
  const [apiError, setApiError] = useState<string | null>(null); // Local state for submit errors

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/tasks'; // Redirect to intended page or /tasks
      navigate(from, { replace: true });
    }
    // Add dependencies: effect should re-run if any of these change
  }, [isAuthenticated, navigate, location]);

  const formik = useFormik({
    initialValues: {
      // name: '', // Keep commented if name is not sent
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setApiError(null); // Clear previous local error
      try {
        // Pass necessary data to the register action
        // Include name if your backend expects it: { name: values.name, email: values.email, password: values.password }
        const success = await register({email: values.email, password: values.password});
        if (success) {
          // Navigate to login page after successful registration
          // Optionally show a success message before navigating
          const from = location.state?.from?.pathname || '/tasks';
          navigate(from, { replace: true }); // Navigate on success
        } else {
          // Use error from store or set a generic one
           setApiError(authError || 'Error en el registro. El email podría estar en uso.');
        }
      } catch (err: any) {
        console.error("Register submit error:", err);
        setApiError(err.message || 'Ocurrió un error inesperado durante el registro.');
      }
    },
  });

  return (
    <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PersonAddOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Registrarse
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
              autoFocus // Add autoFocus here if name is commented out
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmar Contraseña"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrarse'}
            </Button>
            <Box sx={{ textAlign: 'right' }}>
              <MuiLink component={RouterLink} to="/login" variant="body2">
                {"¿Ya tienes cuenta? Inicia sesión"}
              </MuiLink>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterPage;