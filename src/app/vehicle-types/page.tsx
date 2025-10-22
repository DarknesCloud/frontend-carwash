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

interface VehicleTypeFormData {
  name: string;
  description: string;
}

export default function VehicleTypesPage() {
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const { control, handleSubmit, reset } = useForm<VehicleTypeFormData>({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await api.getVehicleTypes();
      setVehicleTypes(response.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (vehicleType?: any) => {
    if (vehicleType) {
      setEditingId(vehicleType._id);
      reset({
        name: vehicleType.name,
        description: vehicleType.description,
      });
    } else {
      setEditingId(null);
      reset({
        name: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const onSubmit = async (data: VehicleTypeFormData) => {
    try {
      if (editingId) {
        await api.updateVehicleType(editingId, data);
        setSnackbar({
          open: true,
          message: 'Tipo de vehículo actualizado exitosamente',
          severity: 'success',
        });
      } else {
        await api.createVehicleType(data);
        setSnackbar({
          open: true,
          message: 'Tipo de vehículo creado exitosamente',
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
    if (confirm('¿Está seguro de eliminar este tipo de vehículo?')) {
      try {
        await api.deleteVehicleType(id);
        setSnackbar({
          open: true,
          message: 'Tipo de vehículo eliminado exitosamente',
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
    { field: 'description', headerName: 'Descripción', flex: 2, minWidth: 300 },
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
                Tipos de Vehículos
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Gestión de categorías de vehículos
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Nuevo Tipo
            </Button>
          </Box>

          <Box sx={{ height: 600, bgcolor: 'white', borderRadius: 2 }}>
            <DataGrid
              rows={vehicleTypes}
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
              {editingId ? 'Editar Tipo de Vehículo' : 'Nuevo Tipo de Vehículo'}
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
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Descripción"
                      fullWidth
                      margin="normal"
                      multiline
                      rows={3}
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
