'use client';
import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  DirectionsCar as CarIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import api from '@/services/api';

interface DashboardStats {
  today: {
    washes: number;
    revenue: number;
  };
  week: {
    washes: number;
    revenue: number;
  };
  month: {
    washes: number;
    revenue: number;
  };
  activeEmployees: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
  }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <ProtectedRoute>
      <Layout>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Resumen general del sistema
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : stats ? (
            <>
              <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                sx={{ mb: 2 }}
              >
                Hoy
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Lavados"
                    value={stats.today.washes}
                    icon={<CarIcon />}
                    color="primary"
                  />
                </Grid>
                {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Ingresos"
                    value={`$${stats.today.revenue.toFixed(2)}`}
                    icon={<TrendingUpIcon />}
                    color="success"
                  />
                </Grid>
              </Grid>

              <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                sx={{ mb: 2 }}
              >
                Esta Semana
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Lavados"
                    value={stats.week.washes}
                    icon={<CarIcon />}
                    color="primary"
                  />
                </Grid>
                {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Ingresos"
                    value={`$${stats.week.revenue.toFixed(2)}`}
                    icon={<TrendingUpIcon />}
                    color="success"
                  />
                </Grid>
              </Grid>

              <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                sx={{ mb: 2 }}
              >
                Este Mes
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Lavados"
                    value={stats.month.washes}
                    icon={<CarIcon />}
                    color="primary"
                  />
                </Grid>
                {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Ingresos"
                    value={`$${stats.month.revenue.toFixed(2)}`}
                    icon={<TrendingUpIcon />}
                    color="success"
                  />
                </Grid>
                {/*@ts-expect-error - TypeScript doesn't recognize custom prop */}
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Empleados Activos"
                    value={stats.activeEmployees}
                    icon={<PeopleIcon />}
                    color="info"
                  />
                </Grid>
              </Grid>
            </>
          ) : (
            <Typography>No se pudieron cargar las estadísticas</Typography>
          )}
        </Box>
      </Layout>
    </ProtectedRoute>
  );
}
