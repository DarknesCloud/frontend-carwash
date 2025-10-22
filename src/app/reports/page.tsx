'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Download as DownloadIcon } from '@mui/icons-material';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import api from '@/services/api';
import { getTodayString, formatLocalDate } from '@/utils/dateUtils';

export default function ReportsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [employeeReport, setEmployeeReport] = useState<any[]>([]);

  const [vehicleReport, setVehicleReport] = useState<any[]>([]);

  const [vehicleSummary, setVehicleSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);

  const [serviceTypes, setServiceTypes] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: '',
    vehicleTypeId: '',
    serviceTypeId: '',
  });

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    try {
      const [employeesRes, vehicleTypesRes, serviceTypesRes] =
        await Promise.all([
          api.getEmployees(),
          api.getVehicleTypes(),
          api.getServiceTypes(),
        ]);
      setEmployees(employeesRes.data);
      setVehicleTypes(vehicleTypesRes.data);
      setServiceTypes(serviceTypesRes.data);
    } catch (error) {
      console.error('Error loading catalogs:', error);
    }
  };

  const handleLoadEmployeeReport = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.employeeId) params.employeeId = filters.employeeId;

      const response = await api.getEmployeeReport(params);
      setEmployeeReport(response.data);
    } catch (error) {
      console.error('Error loading employee report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadVehicleReport = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.employeeId) params.employeeId = filters.employeeId;
      if (filters.vehicleTypeId) params.vehicleTypeId = filters.vehicleTypeId;
      if (filters.serviceTypeId) params.serviceTypeId = filters.serviceTypeId;

      const response = await api.getVehicleReport(params);
      setVehicleReport(response.data);
      setVehicleSummary(response.summary);
    } catch (error) {
      console.error('Error loading vehicle report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (typeof value === 'object' && value !== null) {
              return JSON.stringify(value).replace(/,/g, ';');
            }
            return value;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${getTodayString()}.csv`;
    link.click();
  };

  const employeeColumns: GridColDef[] = [
    { field: 'employeeName', headerName: 'Empleado', flex: 1, minWidth: 200 },
    { field: 'employeeEmail', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'totalWashes', headerName: 'Total Lavados', width: 150 },
    {
      field: 'totalRevenue',
      headerName: 'Ingresos Totales',
      width: 150,
      valueFormatter: (params: any) => `$${params}`,
    },
    {
      field: 'averagePrice',
      headerName: 'Precio Promedio',
      width: 150,
      valueFormatter: (params: any) => `$${params}`,
    },
  ];

  const vehicleColumns: GridColDef[] = [
    { field: 'plate', headerName: 'Placa', width: 120 },
    { field: 'brand', headerName: 'Marca', width: 120 },
    { field: 'model', headerName: 'Modelo', width: 120 },
    {
      field: 'vehicleType',
      headerName: 'Tipo de Vehículo',
      width: 150,
      valueGetter: (params: any) => params?.name || '',
    },
    {
      field: 'serviceType',
      headerName: 'Tipo de Servicio',
      width: 150,
      valueGetter: (params: any) => params?.name || '',
    },
    {
      field: 'employee',
      headerName: 'Lavador',
      width: 150,
      valueGetter: (params: any) => params?.name || '',
    },
    {
      field: 'price',
      headerName: 'Precio',
      width: 100,
      valueFormatter: (params: any) => `$${params}`,
    },
    {
      field: 'entryTime',
      headerName: 'Fecha',
      width: 180,
      valueFormatter: (params: any) => formatLocalDate(params, true),
    },
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Reportes
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Análisis y estadísticas del sistema
          </Typography>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Filtros
              </Typography>
              <Grid container spacing={2}>
                {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Fecha Inicio"
                    type="date"
                    fullWidth
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Fecha Fin"
                    type="date"
                    fullWidth
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    label="Empleado"
                    fullWidth
                    value={filters.employeeId}
                    onChange={(e) =>
                      setFilters({ ...filters, employeeId: e.target.value })
                    }
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {employees.map((emp: any) => (
                      <MenuItem key={emp._id} value={emp._id}>
                        {emp.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                {tabValue === 1 && (
                  <>
                    {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        select
                        label="Tipo de Vehículo"
                        fullWidth
                        value={filters.vehicleTypeId}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            vehicleTypeId: e.target.value,
                          })
                        }
                      >
                        <MenuItem value="">Todos</MenuItem>
                        {vehicleTypes.map((type: any) => (
                          <MenuItem key={type._id} value={type._id}>
                            {type.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        select
                        label="Tipo de Servicio"
                        fullWidth
                        value={filters.serviceTypeId}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            serviceTypeId: e.target.value,
                          })
                        }
                      >
                        <MenuItem value="">Todos</MenuItem>
                        {serviceTypes.map((service: any) => (
                          <MenuItem key={service._id} value={service._id}>
                            {service.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
            >
              <Tab label="Reporte por Empleado" />
              <Tab label="Reporte de Vehículos" />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button variant="contained" onClick={handleLoadEmployeeReport}>
                  Generar Reporte
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() =>
                    exportToCSV(employeeReport, 'reporte_empleados')
                  }
                  disabled={employeeReport.length === 0}
                >
                  Exportar CSV
                </Button>
              </Box>
              <Box sx={{ height: 600, bgcolor: 'white', borderRadius: 2 }}>
                <DataGrid
                  rows={employeeReport}
                  columns={employeeColumns}
                  loading={loading}
                  getRowId={(row) => row._id}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                />
              </Box>
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button variant="contained" onClick={handleLoadVehicleReport}>
                  Generar Reporte
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() =>
                    exportToCSV(vehicleReport, 'reporte_vehiculos')
                  }
                  disabled={vehicleReport.length === 0}
                >
                  Exportar CSV
                </Button>
              </Box>

              {vehicleSummary && (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                  <Grid item xs={12} sm={4}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          Total de Registros
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                          {vehicleSummary.totalRecords}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                  <Grid item xs={12} sm={4}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          Ingresos Totales
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                          ${vehicleSummary.totalRevenue}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                  <Grid item xs={12} sm={4}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          Precio Promedio
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                          ${vehicleSummary.averagePrice}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              <Box sx={{ height: 600, bgcolor: 'white', borderRadius: 2 }}>
                <DataGrid
                  rows={vehicleReport}
                  columns={vehicleColumns}
                  loading={loading}
                  getRowId={(row) => row._id}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Layout>
    </ProtectedRoute>
  );
}
