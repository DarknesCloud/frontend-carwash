/**
 * Utilidades para manejo de fechas y zona horaria
 */

/**
 * Convierte una fecha UTC a la zona horaria local y la formatea
 * @param dateString - Fecha en formato ISO string
 * @param includeTime - Si se debe incluir la hora en el formato
 * @returns Fecha formateada en zona horaria local
 */
export const formatLocalDate = (dateString: string, includeTime: boolean = false): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (includeTime) {
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * Convierte una fecha local a formato ISO para enviar al backend
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns Fecha en formato ISO string
 */
export const toISODate = (dateString: string): string => {
  if (!dateString) return '';
  
  // Crear fecha en zona horaria local
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.toISOString();
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD para inputs de tipo date
 * @returns Fecha actual en formato YYYY-MM-DD
 */
export const getTodayString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Convierte una fecha UTC a formato YYYY-MM-DD en zona horaria local
 * @param dateString - Fecha en formato ISO string
 * @returns Fecha en formato YYYY-MM-DD
 */
export const toLocalDateString = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Calcula el inicio del día en zona horaria local
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns Fecha ISO del inicio del día
 */
export const getStartOfDay = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day, 0, 0, 0, 0);
  return date.toISOString();
};

/**
 * Calcula el fin del día en zona horaria local
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns Fecha ISO del fin del día
 */
export const getEndOfDay = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day, 23, 59, 59, 999);
  return date.toISOString();
};

/**
 * Formatea un monto en formato de moneda
 * @param amount - Monto a formatear
 * @returns Monto formateado con símbolo de moneda
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Calcula la diferencia en días entre dos fechas
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @returns Número de días de diferencia
 */
export const getDaysDifference = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

