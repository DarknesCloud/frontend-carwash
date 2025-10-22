# Car Wash Frontend

Frontend del sistema de gestión de Car Wash desarrollado con Next.js 15, TypeScript y Material-UI.

## 🚀 Inicio Rápido

### Instalación

```bash
pnpm install
# o
npm install
```

### Configuración

El archivo `.env.local` debe contener:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Para producción, cambiar a la URL del backend desplegado.

### Desarrollo

```bash
pnpm dev
# o
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

### Producción

```bash
pnpm build
pnpm start
# o
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                    # Páginas de Next.js (App Router)
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── vehicles/          # CRUD de vehículos
│   │   ├── vehicle-types/     # CRUD de tipos de vehículos
│   │   ├── service-types/     # CRUD de tipos de servicio
│   │   ├── employees/         # CRUD de empleados
│   │   ├── reports/           # Sistema de reportes
│   │   ├── login/             # Página de login
│   │   ├── layout.tsx         # Layout raíz con providers
│   │   └── page.tsx           # Página principal (redirect)
│   ├── components/            # Componentes reutilizables
│   │   ├── Layout.tsx         # Layout con sidebar y navbar
│   │   └── ProtectedRoute.tsx # HOC para rutas protegidas
│   ├── contexts/              # Contextos de React
│   │   └── AuthContext.tsx    # Contexto de autenticación
│   ├── services/              # Servicios de API
│   │   └── api.ts             # Cliente API con fetch
│   └── utils/                 # Utilidades
│       └── theme.ts           # Tema de Material-UI
├── public/
│   └── logo.png               # Logo de Multiservicios Astrid
├── .env.local                 # Variables de entorno
└── package.json
```

## 🎨 Características

### Autenticación
- Login con email y contraseña
- Protección de rutas con HOC
- Almacenamiento de token en localStorage
- Redirección automática según estado de autenticación

### Dashboard
- Estadísticas del día, semana y mes
- Total de lavados e ingresos
- Empleados activos
- Tarjetas con iconos y colores

### CRUD de Vehículos
- Listado con DataGrid de MUI
- Filtros por fecha, empleado y tipo
- Formulario con validaciones
- Auto-completado de precio según servicio
- Edición y eliminación

### Sistema de Reportes
- Reporte por empleado (lavados, ingresos, promedio)
- Reporte de vehículos con filtros avanzados
- Resumen estadístico
- Exportación a CSV

### Diseño
- Sidebar colapsable con navegación
- Navbar con avatar y menú de usuario
- Logo en sidebar y login
- Paleta de colores basada en el logo
- Diseño responsivo

## 🌐 Despliegue

### Vercel (Recomendado)

1. Push a GitHub
2. Importar proyecto en Vercel
3. Configurar Environment Variables: `NEXT_PUBLIC_API_URL`
4. Deploy

## 📄 Licencia

MIT

