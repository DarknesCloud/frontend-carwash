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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  IconButton,
  Collapse,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as RevenueIcon,
  TrendingDown as ExpenseIcon,
  AccountBalance as BalanceIcon,
  Add as AddIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import PaymentAdjustmentDialog from '@/components/PaymentAdjustmentDialog';
import api from '@/services/api';
import { formatLocalDate, getTodayString } from '@/utils/dateUtils';

export default function PaymentsPage() {
  const [dailySummary, setDailySummary] = useState<any>(null);
  const [customSummary, setCustomSummary] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [openAdjustmentDialog, setOpenAdjustmentDialog] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<
    string | undefined
  >();
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    adjustmentId: string | null;
  }>({
    open: false,
    adjustmentId: null,
  });

  useEffect(() => {
    loadEmployees();
    loadDailySummary();
  }, [selectedDate]);

  const loadEmployees = async () => {
    try {
      const response = await api.getEmployees();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadDailySummary = async () => {
    setLoading(true);
    try {
      const response = await api.getDailyPaymentSummary(selectedDate);
      setDailySummary(response.data);
    } catch (error) {
      console.error('Error loading daily summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomSummary = async () => {
    if (!startDate || !endDate) {
      alert('Debe seleccionar ambas fechas');
      return;
    }

    setLoading(true);
    try {
      const response = await api.getPaymentSummary({ startDate, endDate });
      setCustomSummary(response.data);
    } catch (error) {
      console.error('Error loading custom summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdjustmentDialog = (employeeId?: string) => {
    setSelectedEmployeeId(employeeId);
    setOpenAdjustmentDialog(true);
  };

  const handleCloseAdjustmentDialog = () => {
    setOpenAdjustmentDialog(false);
    setSelectedEmployeeId(undefined);
  };

  const handleAdjustmentSuccess = () => {
    setSnackbar({
      open: true,
      message: 'Ajuste creado exitosamente',
      severity: 'success',
    });
    loadDailySummary();
    if (customSummary) {
      loadCustomSummary();
    }
  };

  const handleDeleteAdjustment = async (adjustmentId: string) => {
    try {
      await api.deleteAdjustment(adjustmentId);
      setSnackbar({
        open: true,
        message: 'Ajuste eliminado exitosamente',
        severity: 'success',
      });
      setDeleteConfirm({ open: false, adjustmentId: null });
      loadDailySummary();
      if (customSummary) {
        loadCustomSummary();
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Error al eliminar',
        severity: 'error',
      });
    }
  };

  const toggleRow = (employeeId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [employeeId]: !prev[employeeId],
    }));
  };

  const formatDate = (dateString: string) => {
    return formatLocalDate(dateString, true);
  };

  const getAdjustmentTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      advance: 'Adelanto',
      bonus: 'Bonificación',
      deduction: 'Deducción',
      correction: 'Corrección',
      other: 'Otro',
    };
    return types[type] || type;
  };

  const getAdjustmentTypeColor = (type: string) => {
    const colors: { [key: string]: any } = {
      advance: 'warning',
      bonus: 'success',
      deduction: 'error',
      correction: 'info',
      other: 'default',
    };
    return colors[type] || 'default';
  };

  const SummaryCard = ({ title, value, icon, color }: any) => (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} color={color}>
              ${value?.toFixed(2) || '0.00'}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: `${color}.100`,
              color: `${color}.main`,
              p: 2,
              borderRadius: 2,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const EmployeePaymentRow = ({ emp, showVehicles = false }: any) => {
    const isExpanded = expandedRows[emp.employee.id];
    const hasAdjustments = emp.adjustments && emp.adjustments.length > 0;

    return (
      <>
        <TableRow>
          <TableCell>
            {hasAdjustments && (
              <IconButton
                size="small"
                onClick={() => toggleRow(emp.employee.id)}
              >
                {isExpanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
              </IconButton>
            )}
          </TableCell>
          <TableCell>
            <Box>
              <Typography fontWeight={600}>{emp.employee.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {emp.employee.email}
              </Typography>
            </Box>
          </TableCell>
          <TableCell align="right">{emp.totalWashes}</TableCell>
          <TableCell align="right">
            ${emp.totalRevenue?.toFixed(2) || '0.00'}
          </TableCell>
          <TableCell align="right">
            <Chip
              label={`$${emp.employee.paymentPerService}`}
              size="small"
              color="primary"
            />
          </TableCell>
          <TableCell align="right">
            ${emp.totalEarnings?.toFixed(2) || '0.00'}
          </TableCell>
          <TableCell align="right">
            <Typography
              fontWeight={600}
              color={
                emp.totalAdjustments > 0
                  ? 'success.main'
                  : emp.totalAdjustments < 0
                  ? 'error.main'
                  : 'text.primary'
              }
            >
              ${emp.totalAdjustments?.toFixed(2) || '0.00'}
            </Typography>
          </TableCell>
          <TableCell align="right">
            <Typography fontWeight={700} color="primary.main">
              ${emp.finalTotal?.toFixed(2) || '0.00'}
            </Typography>
          </TableCell>
          <TableCell align="right">
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenAdjustmentDialog(emp.employee.id)}
            >
              Ajuste
            </Button>
          </TableCell>
        </TableRow>
        {hasAdjustments && (
          <TableRow>
            <TableCell colSpan={9} sx={{ py: 0, bgcolor: 'grey.50' }}>
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ py: 2, px: 4 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Ajustes Aplicados
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell align="right">Monto</TableCell>
                        <TableCell align="right">Fecha</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {emp.adjustments.map((adj: any) => (
                        <TableRow key={adj.id}>
                          <TableCell>
                            <Chip
                              label={getAdjustmentTypeLabel(adj.type)}
                              size="small"
                              color={getAdjustmentTypeColor(adj.type)}
                            />
                          </TableCell>
                          <TableCell>{adj.description}</TableCell>
                          <TableCell align="right">
                            <Typography
                              fontWeight={600}
                              color={
                                adj.amount > 0 ? 'success.main' : 'error.main'
                              }
                            >
                              ${adj.amount.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption">
                              {formatDate(adj.date)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                setDeleteConfirm({
                                  open: true,
                                  adjustmentId: adj.id,
                                })
                              }
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Collapse>
            </TableCell>
          </TableRow>
        )}
      </>
    );
  };

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
                Control de Pagos
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Gestión de pagos a empleados y control de efectivo
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenAdjustmentDialog()}
            >
              Nuevo Ajuste
            </Button>
          </Box>

          {/* Resumen Diario */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Resumen del Día
                </Typography>
                <TextField
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  size="small"
                />
              </Box>

              {dailySummary && (
                <>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                    <Grid item xs={12} sm={6} md={2.4}>
                      <SummaryCard
                        title="Ingresos Totales"
                        value={dailySummary.summary.totalRevenue}
                        icon={<RevenueIcon />}
                        color="success"
                      />
                    </Grid>
                    {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                    <Grid item xs={12} sm={6} md={2.4}>
                      <SummaryCard
                        title="Pagos Base"
                        value={dailySummary.summary.totalEmployeePayments}
                        icon={<MoneyIcon />}
                        color="info"
                      />
                    </Grid>
                    {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                    <Grid item xs={12} sm={6} md={2.4}>
                      <SummaryCard
                        title="Ajustes"
                        value={dailySummary.summary.totalAdjustments}
                        icon={<ExpenseIcon />}
                        color={
                          dailySummary.summary.totalAdjustments >= 0
                            ? 'success'
                            : 'error'
                        }
                      />
                    </Grid>
                    {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                    <Grid item xs={12} sm={6} md={2.4}>
                      <SummaryCard
                        title="Total a Pagar"
                        value={dailySummary.summary.finalTotal}
                        icon={<MoneyIcon />}
                        color="warning"
                      />
                    </Grid>
                    {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                    <Grid item xs={12} sm={6} md={2.4}>
                      <SummaryCard
                        title="Efectivo Restante"
                        value={dailySummary.summary.remainingCash}
                        icon={<BalanceIcon />}
                        color="primary"
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Pagos por Empleado
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell width={50}></TableCell>
                          <TableCell>Empleado</TableCell>
                          <TableCell align="right">Lavados</TableCell>
                          <TableCell align="right">
                            Ingresos Generados
                          </TableCell>
                          <TableCell align="right">Pago por Servicio</TableCell>
                          <TableCell align="right">Pago Base</TableCell>
                          <TableCell align="right">Ajustes</TableCell>
                          <TableCell align="right">Total a Pagar</TableCell>
                          <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dailySummary.employeePayments.map((emp: any) => (
                          <EmployeePaymentRow key={emp.employee.id} emp={emp} />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </CardContent>
          </Card>

          {/* Resumen Personalizado */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Resumen por Período
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Fecha Inicio"
                    type="date"
                    fullWidth
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Fecha Fin"
                    type="date"
                    fullWidth
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                <Grid item xs={12} sm={4}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ height: '100%' }}
                    onClick={loadCustomSummary}
                  >
                    Generar Resumen
                  </Button>
                </Grid>
              </Grid>

              {customSummary && (
                <>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                    <Grid item xs={12} sm={6} md={2.4}>
                      <SummaryCard
                        title="Ingresos Totales"
                        value={customSummary.summary.totalRevenue}
                        icon={<RevenueIcon />}
                        color="success"
                      />
                    </Grid>
                    {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                    <Grid item xs={12} sm={6} md={2.4}>
                      <SummaryCard
                        title="Pagos Base"
                        value={customSummary.summary.totalEmployeePayments}
                        icon={<MoneyIcon />}
                        color="info"
                      />
                    </Grid>
                    {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                    <Grid item xs={12} sm={6} md={2.4}>
                      <SummaryCard
                        title="Ajustes"
                        value={customSummary.summary.totalAdjustments}
                        icon={<ExpenseIcon />}
                        color={
                          customSummary.summary.totalAdjustments >= 0
                            ? 'success'
                            : 'error'
                        }
                      />
                    </Grid>
                    {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                    <Grid item xs={12} sm={6} md={2.4}>
                      <SummaryCard
                        title="Total a Pagar"
                        value={customSummary.summary.finalTotal}
                        icon={<MoneyIcon />}
                        color="warning"
                      />
                    </Grid>
                    {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                    <Grid item xs={12} sm={6} md={2.4}>
                      <SummaryCard
                        title="Efectivo Restante"
                        value={customSummary.summary.remainingCash}
                        icon={<BalanceIcon />}
                        color="primary"
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Detalle por Empleado
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell width={50}></TableCell>
                          <TableCell>Empleado</TableCell>
                          <TableCell align="right">Lavados</TableCell>
                          <TableCell align="right">
                            Ingresos Generados
                          </TableCell>
                          <TableCell align="right">Pago por Servicio</TableCell>
                          <TableCell align="right">Pago Base</TableCell>
                          <TableCell align="right">Ajustes</TableCell>
                          <TableCell align="right">Total a Pagar</TableCell>
                          <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {customSummary.employeePayments.map((emp: any) => (
                          <EmployeePaymentRow
                            key={emp.employee.id}
                            emp={emp}
                            showVehicles
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </CardContent>
          </Card>
        </Box>

        <PaymentAdjustmentDialog
          open={openAdjustmentDialog}
          onClose={handleCloseAdjustmentDialog}
          onSuccess={handleAdjustmentSuccess}
          employees={employees}
          preselectedEmployeeId={selectedEmployeeId}
        />

        <Dialog
          open={deleteConfirm.open}
          onClose={() => setDeleteConfirm({ open: false, adjustmentId: null })}
        >
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Está seguro de eliminar este ajuste? Esta acción no se puede
              deshacer.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setDeleteConfirm({ open: false, adjustmentId: null })
              }
            >
              Cancelar
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={() =>
                deleteConfirm.adjustmentId &&
                handleDeleteAdjustment(deleteConfirm.adjustmentId)
              }
            >
              Eliminar
            </Button>
          </DialogActions>
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
      </Layout>
    </ProtectedRoute>
  );
}
