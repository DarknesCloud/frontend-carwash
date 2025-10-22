'use client';

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
  MenuItem,
  IconButton,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as PaidIcon,
  RemoveCircle as RemoveIcon,
} from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import api from '@/services/api';
import { formatLocalDate } from '@/utils/dateUtils';

interface Service {
  serviceType: string;
  price: number;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [currentService, setCurrentService] = useState({ serviceType: '', price: 0 });

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      plate: '',
      brand: '',
      model: '',
      color: '',
      vehicleType: '',
      employee: '',
      paymentStatus: 'pending',
      entryTime: new Date().toISOString().slice(0, 16),
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, vehicleTypesRes, serviceTypesRes, employeesRes] = await Promise.all([
        api.getVehicles(),
        api.getVehicleTypes(),
        api.getServiceTypes(),
        api.getEmployees(),
      ]);
      setVehicles(vehiclesRes.data);
      setVehicleTypes(vehicleTypesRes.data);
      setServiceTypes(serviceTypesRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    if (currentService.serviceType && currentService.price > 0) {
      setSelectedServices([...selectedServices, currentService]);
      setCurrentService({ serviceType: '', price: 0 });
    }
  };

  const handleRemoveService = (index: number) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  const handleServiceTypeChange = (serviceTypeId: string) => {
    const serviceType = serviceTypes.find((st: any) => st._id === serviceTypeId);
    if (serviceType) {
      setCurrentService({
        serviceType: serviceTypeId,
        price: serviceType.price,
      });
    }
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((sum, service) => sum + service.price, 0);
  };

  const onSubmit = async (data: any) => {
    try {
      if (selectedServices.length === 0) {
        alert('Debe agregar al menos un servicio');
        return;
      }

      const vehicleData = {
        ...data,
        services: selectedServices,
        totalPrice: getTotalPrice(),
      };

      if (editingVehicle) {
        await api.updateVehicle(editingVehicle._id, vehicleData);
      } else {
        await api.createVehicle(vehicleData);
      }

      loadData();
      handleCloseDialog();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleEdit = (vehicle: any) => {
    setEditingVehicle(vehicle);
    reset({
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      vehicleType: vehicle.vehicleType._id,
      employee: vehicle.employee._id,
      paymentStatus: vehicle.paymentStatus,
      entryTime: new Date(vehicle.entryTime).toISOString().slice(0, 16),
    });
    setSelectedServices(vehicle.services || []);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este registro?')) {
      try {
        await api.deleteVehicle(id);
        loadData();
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await api.markVehicleAsPaid(id);
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVehicle(null);
    setSelectedServices([]);
    setCurrentService({ serviceType: '', price: 0 });
    reset();
  };

  const columns: GridColDef[] = [
    { field: 'plate', headerName: 'Placa', width: 120 },
    { field: 'brand', headerName: 'Marca', width: 120 },
    { field: 'model', headerName: 'Modelo', width: 120 },
    {
      field: 'vehicleType',
      headerName: 'Tipo',
      width: 130,
      valueGetter: (params: any) => params?.name || '',
    },
    {
      field: 'services',
      headerName: 'Servicios',
      width: 200,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {params.row.services?.map((service: any, index: number) => (
            <Chip
              key={index}
              label={service.serviceType?.name || 'N/A'}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      ),
    },
    {
      field: 'employee',
      headerName: 'Lavador',
      width: 150,
      valueGetter: (params: any) => params?.name || '',
    },
    {
      field: 'totalPrice',
      headerName: 'Total',
      width: 100,
      valueFormatter: (params: any) => `$${params}`,
    },
    {
      field: 'paymentStatus',
      headerName: 'Estado',
      width: 120,
      renderCell: (params: any) => (
        <Chip
          label={params.value === 'paid' ? 'Pagado' : 'Pendiente'}
          color={params.value === 'paid' ? 'success' : 'warning'}
          size="small"
        />
      ),
    },
    {
      field: 'entryTime',
      headerName: 'Fecha',
      width: 180,
      valueFormatter: (params: any) => formatLocalDate(params, true),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 150,
      renderCell: (params: any) => (
        <Box>
          {params.row.paymentStatus === 'pending' && (
            <IconButton
              size="small"
              color="success"
              onClick={() => handleMarkAsPaid(params.row._id)}
              title="Marcar como pagado"
            >
              <PaidIcon />
            </IconButton>
          )}
          <IconButton size="small" onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(params.row._id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Vehículos
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Gestión de registros de lavado
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Nuevo Registro
            </Button>
          </Box>

          <Box sx={{ height: 600, bgcolor: 'white', borderRadius: 2 }}>
            <DataGrid
              rows={vehicles}
              columns={columns}
              loading={loading}
              getRowId={(row) => row._id}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
            />
          </Box>

          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle>
              {editingVehicle ? 'Editar Registro' : 'Nuevo Registro de Lavado'}
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Controller
                    name="plate"
                    control={control}
                    rules={{ required: 'La placa es requerida' }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Placa"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        fullWidth
                      />
                    )}
                  />

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                    <Controller
                      name="brand"
                      control={control}
                      render={({ field }) => <TextField {...field} label="Marca" fullWidth />}
                    />
                    <Controller
                      name="model"
                      control={control}
                      render={({ field }) => <TextField {...field} label="Modelo" fullWidth />}
                    />
                    <Controller
                      name="color"
                      control={control}
                      render={({ field }) => <TextField {...field} label="Color" fullWidth />}
                    />
                  </Box>

                  <Controller
                    name="vehicleType"
                    control={control}
                    rules={{ required: 'El tipo de vehículo es requerido' }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        select
                        label="Tipo de Vehículo"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        fullWidth
                      >
                        {vehicleTypes.map((type: any) => (
                          <MenuItem key={type._id} value={type._id}>
                            {type.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />

                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Servicios
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField
                          select
                          label="Tipo de Servicio"
                          value={currentService.serviceType}
                          onChange={(e) => handleServiceTypeChange(e.target.value)}
                          fullWidth
                        >
                          {serviceTypes.map((service: any) => (
                            <MenuItem key={service._id} value={service._id}>
                              {service.name} - ${service.price}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          label="Precio"
                          type="number"
                          value={currentService.price}
                          onChange={(e) =>
                            setCurrentService({ ...currentService, price: Number(e.target.value) })
                          }
                          fullWidth
                        />
                        <Button
                          variant="contained"
                          onClick={handleAddService}
                          disabled={!currentService.serviceType || currentService.price <= 0}
                        >
                          Agregar
                        </Button>
                      </Box>

                      {selectedServices.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Servicios seleccionados:
                          </Typography>
                          {selectedServices.map((service, index) => {
                            const serviceType = serviceTypes.find((st: any) => st._id === service.serviceType);
                            return (
                              <Box
                                key={index}
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  p: 1,
                                  bgcolor: 'grey.100',
                                  borderRadius: 1,
                                  mb: 1,
                                }}
                              >
                                <Typography>
                                  {serviceType?.name} - ${service.price}
                                </Typography>
                                <IconButton size="small" onClick={() => handleRemoveService(index)}>
                                  <RemoveIcon />
                                </IconButton>
                              </Box>
                            );
                          })}
                          <Typography variant="h6" sx={{ mt: 2 }}>
                            Total: ${getTotalPrice()}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>

                  <Controller
                    name="employee"
                    control={control}
                    rules={{ required: 'El empleado es requerido' }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        select
                        label="Lavador"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        fullWidth
                      >
                        {employees.map((emp: any) => (
                          <MenuItem key={emp._id} value={emp._id}>
                            {emp.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />

                  <Controller
                    name="paymentStatus"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select label="Estado de Pago" fullWidth>
                        <MenuItem value="pending">Pendiente</MenuItem>
                        <MenuItem value="paid">Pagado</MenuItem>
                      </TextField>
                    )}
                  />

                  <Controller
                    name="entryTime"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Fecha y Hora" type="datetime-local" fullWidth />
                    )}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                <Button type="submit" variant="contained">
                  {editingVehicle ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </Box>
      </Layout>
    </ProtectedRoute>
  );
}

