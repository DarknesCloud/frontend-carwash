'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  Snackbar,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import api from '@/services/api';
import { useForm, Controller } from 'react-hook-form';

interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  active: boolean;
  paymentPerService: number;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const { control, handleSubmit, reset } = useForm<EmployeeFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      active: true,
      paymentPerService: 50,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await api.getEmployees();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (employee?: any) => {
    if (employee) {
      setEditingId(employee._id);
      reset({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        active: employee.active,
        paymentPerService: employee.paymentPerService || 50,
      });
    } else {
      setEditingId(null);
      reset({
        name: '',
        email: '',
        phone: '',
        active: true,
        paymentPerService: 50,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      if (editingId) {
        await api.updateEmployee(editingId, data);
        setSnackbar({
          open: true,
          message: 'Empleado actualizado exitosamente',
          severity: 'success',
        });
      } else {
        await api.createEmployee(data);
        setSnackbar({
          open: true,
          message: 'Empleado creado exitosamente',
          severity: 'success',
        });
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Error al guardar',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este empleado?')) {
      try {
        await api.deleteEmployee(id);
        setSnackbar({
          open: true,
          message: 'Empleado eliminado exitosamente',
          severity: 'success',
        });
        loadData();
      } catch (error: any) {
        setSnackbar({
          open: true,
          message: error.message || 'Error al eliminar',
          severity: 'error',
        });
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 200 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'phone', headerName: 'Teléfono', width: 150 },
    {
      field: 'active',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Activo' : 'Inactivo'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleOpenDialog(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Eliminar"
          onClick={() => handleDelete(params.row._id)}
        />,
      ],
    },
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Empleados
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Gestión de lavadores y personal
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Nuevo Empleado
            </Button>
          </Box>

          <Box sx={{ height: 600, bgcolor: 'white', borderRadius: 2 }}>
            <DataGrid
              rows={employees}
              columns={columns}
              loading={loading}
              getRowId={(row) => row._id}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
            />
          </Box>

          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {editingId ? 'Editar Empleado' : 'Nuevo Empleado'}
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogContent>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'El nombre es requerido' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Nombre"
                      fullWidth
                      margin="normal"
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'El email es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido',
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      fullWidth
                      margin="normal"
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Teléfono"
                      fullWidth
                      margin="normal"
                    />
                  )}
                />
                <Controller
                  name="paymentPerService"
                  control={control}
                  rules={{
                    required: 'El pago por servicio es requerido',
                    min: { value: 0, message: 'Debe ser un número positivo' },
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Pago por Servicio ($)"
                      type="number"
                      fullWidth
                      margin="normal"
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  )}
                />
                <Controller
                  name="active"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Activo"
                      sx={{ mt: 2 }}
                    />
                  )}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                <Button type="submit" variant="contained">
                  {editingId ? 'Actualizar' : 'Guardar'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert
              severity={snackbar.severity}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Layout>
    </ProtectedRoute>
  );
}
