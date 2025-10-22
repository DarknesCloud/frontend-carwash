const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // 🔐 Agregar token JWT si existe en localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      // Detectar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      // Manejo de errores HTTP
      if (!response.ok) {
        let errorMessage = `Error ${response.status}`;
        if (isJson) {
          const errorData = await response.json().catch(() => ({}));
          errorMessage = errorData.message || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Retornar respuesta JSON solo si aplica
      if (isJson) {
        return (await response.json()) as T;
      }

      return {} as T;
    } catch (error) {
      console.error('API Request Error:', error);
      if (error instanceof Error) {
        throw new Error(error.message || 'Error en la solicitud');
      }
      throw new Error('Error inesperado en la solicitud');
    }
  }

  // ===============================
  // 🔐 AUTH
  // ===============================
  async login(email: string, password: string) {
    const response = await this.request<{
      success: boolean;
      user: any;
      token?: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // 💾 Guardar usuario y token si existen
    if (typeof window !== 'undefined' && response?.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignorar error de logout
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }

  async getMe() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return { success: true, data: user };
      }
    }
    return { success: false, data: null };
  }

  // ===============================
  // 🚗 VEHICLES
  // ===============================
  async getVehicles(params?: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    vehicleTypeId?: string;
    paymentStatus?: string;
  }) {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return this.request<{ success: boolean; count: number; data: any[] }>(
      `/vehicles${queryString}`
    );
  }

  async getVehicle(id: string) {
    return this.request<{ success: boolean; data: any }>(`/vehicles/${id}`);
  }

  async createVehicle(data: any) {
    return this.request<{ success: boolean; data: any }>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVehicle(id: string, data: any) {
    return this.request<{ success: boolean; data: any }>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async markVehicleAsPaid(id: string) {
    return this.request<{ success: boolean; data: any }>(
      `/vehicles/${id}/pay`,
      {
        method: 'PATCH',
      }
    );
  }

  async deleteVehicle(id: string) {
    return this.request<{ success: boolean; message: string }>(
      `/vehicles/${id}`,
      { method: 'DELETE' }
    );
  }

  // ===============================
  // 🚘 VEHICLE TYPES
  // ===============================
  async getVehicleTypes() {
    return this.request<{ success: boolean; count: number; data: any[] }>(
      '/vehicle-types'
    );
  }

  async createVehicleType(data: any) {
    return this.request<{ success: boolean; data: any }>('/vehicle-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVehicleType(id: string, data: any) {
    return this.request<{ success: boolean; data: any }>(
      `/vehicle-types/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async deleteVehicleType(id: string) {
    return this.request<{ success: boolean; message: string }>(
      `/vehicle-types/${id}`,
      { method: 'DELETE' }
    );
  }

  // ===============================
  // 🧼 SERVICE TYPES
  // ===============================
  async getServiceTypes() {
    return this.request<{ success: boolean; count: number; data: any[] }>(
      '/service-types'
    );
  }

  async createServiceType(data: any) {
    return this.request<{ success: boolean; data: any }>('/service-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateServiceType(id: string, data: any) {
    return this.request<{ success: boolean; data: any }>(
      `/service-types/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async deleteServiceType(id: string) {
    return this.request<{ success: boolean; message: string }>(
      `/service-types/${id}`,
      { method: 'DELETE' }
    );
  }

  // ===============================
  // 👷 EMPLOYEES
  // ===============================
  async getEmployees() {
    return this.request<{ success: boolean; count: number; data: any[] }>(
      '/employees'
    );
  }

  async createEmployee(data: any) {
    return this.request<{ success: boolean; data: any }>('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmployee(id: string, data: any) {
    return this.request<{ success: boolean; data: any }>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmployee(id: string) {
    return this.request<{ success: boolean; message: string }>(
      `/employees/${id}`,
      { method: 'DELETE' }
    );
  }

  // ===============================
  // 💳 PAYMENTS
  // ===============================
  async getPaymentSummary(params?: { startDate?: string; endDate?: string }) {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return this.request<{ success: boolean; data: any }>(
      `/payments/summary${queryString}`
    );
  }

  async getDailyPaymentSummary(date?: string) {
    const queryString = date ? `?date=${date}` : '';
    return this.request<{ success: boolean; data: any }>(
      `/payments/daily${queryString}`
    );
  }

  async createPayment(data: any) {
    return this.request<{ success: boolean; data: any }>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPayments(params?: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return this.request<{ success: boolean; count: number; data: any[] }>(
      `/payments${queryString}`
    );
  }

  async deletePayment(id: string) {
    return this.request<{ success: boolean; message: string }>(
      `/payments/${id}`,
      { method: 'DELETE' }
    );
  }

  // ===============================
  // 🔧 PAYMENT ADJUSTMENTS
  // ===============================
  async getAdjustments(params?: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return this.request<{ success: boolean; count: number; data: any[] }>(
      `/adjustments${queryString}`
    );
  }

  async getAdjustment(id: string) {
    return this.request<{ success: boolean; data: any }>(`/adjustments/${id}`);
  }

  async createAdjustment(data: any) {
    return this.request<{ success: boolean; data: any }>('/adjustments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdjustment(id: string, data: any) {
    return this.request<{ success: boolean; data: any }>(`/adjustments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdjustment(id: string) {
    return this.request<{ success: boolean; message: string }>(
      `/adjustments/${id}`,
      { method: 'DELETE' }
    );
  }

  // ===============================
  // 📊 REPORTS
  // ===============================
  async getEmployeeReport(params?: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
  }) {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return this.request<{ success: boolean; count: number; data: any[] }>(
      `/reports/employee${queryString}`
    );
  }

  async getVehicleReport(params?: {
    startDate?: string;
    endDate?: string;
    vehicleTypeId?: string;
    serviceTypeId?: string;
    employeeId?: string;
  }) {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return this.request<{
      success: boolean;
      summary: any;
      data: any[];
    }>(`/reports/vehicles${queryString}`);
  }

  async getDashboardStats() {
    return this.request<{ success: boolean; data: any }>('/reports/dashboard');
  }
}

const api = new ApiClient(API_URL);
export default api;
