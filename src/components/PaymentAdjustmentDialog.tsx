'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import api from '@/services/api';
import { getTodayString } from '@/utils/dateUtils';

interface AdjustmentFormData {
  employeeId: string;
  amount: number;
  type: string;
  description: string;
  date: string;
}

interface PaymentAdjustmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employees: any[];
  preselectedEmployeeId?: string;
}

const adjustmentTypes = [
  { value: 'advance', label: 'Adelanto' },
  { value: 'bonus', label: 'Bonificación' },
  { value: 'deduction', label: 'Deducción' },
  { value: 'correction', label: 'Corrección' },
  { value: 'other', label: 'Otro' },
];

export default function PaymentAdjustmentDialog({
  open,
  onClose,
  onSuccess,
  employees,
  preselectedEmployeeId,
}: PaymentAdjustmentDialogProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset, watch } = useForm<AdjustmentFormData>({
    defaultValues: {
      employeeId: preselectedEmployeeId || '',
      amount: 0,
      type: 'advance',
      description: '',
      date: getTodayString(),
    },
  });

  useEffect(() => {
    if (preselectedEmployeeId) {
      reset({
        employeeId: preselectedEmployeeId,
        amount: 0,
        type: 'advance',
        description: '',
        date: getTodayString(),
      });
    }
  }, [preselectedEmployeeId, reset]);

  const selectedType = watch('type');

  const onSubmit = async (data: AdjustmentFormData) => {
    setError('');
    setLoading(true);

    try {
      // Convertir deducciones a valores negativos
      let finalAmount = parseFloat(data.amount.toString());
      if (data.type === 'deduction' && finalAmount > 0) {
        finalAmount = -finalAmount;
      }

      await api.createAdjustment({
        employeeId: data.employeeId,
        amount: finalAmount,
        type: data.type,
        description: data.description,
        date: data.date,
      });

      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear el ajuste');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar Ajuste de Pago</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Controller
            name="employeeId"
            control={control}
            rules={{ required: 'El empleado es requerido' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Empleado"
                fullWidth
                margin="normal"
                required
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {employees.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>
                    {emp.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="type"
            control={control}
            rules={{ required: 'El tipo es requerido' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Tipo de Ajuste"
                fullWidth
                margin="normal"
                required
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {adjustmentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="amount"
            control={control}
            rules={{
              required: 'El monto es requerido',
              validate: (value) => {
                const num = parseFloat(value.toString());
                if (isNaN(num)) return 'Debe ser un número válido';
                if (num === 0) return 'El monto no puede ser cero';
                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label={selectedType === 'deduction' ? 'Monto a Deducir ($)' : 'Monto ($)'}
                type="number"
                fullWidth
                margin="normal"
                required
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ||
                  (selectedType === 'deduction'
                    ? 'Ingrese el monto positivo, se restará automáticamente'
                    : '')
                }
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            rules={{ required: 'La descripción es requerida' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Descripción"
                fullWidth
                margin="normal"
                required
                multiline
                rows={3}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                placeholder="Ej: Adelanto solicitado por el empleado"
              />
            )}
          />

          <Controller
            name="date"
            control={control}
            rules={{ required: 'La fecha es requerida' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Fecha"
                type="date"
                fullWidth
                margin="normal"
                required
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />

          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Nota:</strong> Los ajustes se aplicarán automáticamente en los cálculos de
              pagos del período correspondiente.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Ajuste'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

