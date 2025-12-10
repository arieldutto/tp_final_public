# SGISP3 - Sistema de Gestión de Infraestructura y Servicios

## 📋 Descripción del Proyecto

Este proyecto consiste en la adaptación de un sistema de gestión de infraestructura y servicios (SGISP) que estaba en producción a React. El sistema permite gestionar clientes, ONTs (Optical Network Terminals), monitoreo de servidores y autenticación de usuarios.

### Funcionalidades Principales

- **Autenticación de usuarios** mediante Firebase Authentication
- **Gestión de clientes (CRM)** con visualización de detalles, servicios y equipos ONT
- **Monitoreo de ONTs** con estadísticas en tiempo real y alertas visuales
- **Dashboard de servidor** con métricas de CPU y memoria
- **Interfaz responsiva** adaptada a diferentes dispositivos

## 🛠️ Tecnologías y Librerías Utilizadas

### Core

- **React** (v19.2.0) - Biblioteca principal para la interfaz de usuario
- **React Router DOM** (v7.9.5) - Enrutamiento y navegación
- **Vite** (v7.2.2) - Herramienta de construcción y desarrollo

### Autenticación y Backend

- **Firebase** (v12.6.0) - Autenticación de usuarios
- **React Firebase Hooks** (v5.1.1) - Hooks para integración con Firebase

### UI y Estilos

- **Bootstrap** - Framework CSS (incluido vía CDN)
- **Bootstrap Icons** (v1.13.1) - Iconografía
- **CSS personalizado** - Estilos customizados con efectos glassmorphism

### Visualización de Datos

- **Recharts** (v3.4.1) - Gráficos y visualizaciones

### Desarrollo

- **ESLint** - Linter para calidad de código
- **TypeScript types** - Tipos para mejor desarrollo

## 🚀 Instalación y Ejecución

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn

### Pasos de Instalación

1. Clonar el repositorio:

```bash
git clone <url-del-repositorio>
cd sgisp3
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:
   Crear un archivo `.env` en la raíz del proyecto con:

```env
VITE_API_SGISP=tu_url_de_api
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
# ... otras variables de Firebase según sea necesario
```

4. Ejecutar en modo desarrollo:

```bash
npm run dev
```

5. Construir para producción:

```bash
npm run build
```

6. Preview de producción:

```bash
npm run preview
```

## 🔐 Credenciales de Prueba

Para acceder al sistema, puedes usar las siguientes credenciales:

- **Email:** test@test.com.ar
- **Password:** test1234

## 📁 Estructura del Proyecto

```
sgisp3/
├── src/
│   ├── assets/              # Recursos estáticos
│   ├── components/          # Componentes reutilizables
│   │   ├── CardBase.jsx
│   │   ├── DataList.jsx
│   │   └── layout/
│   ├── config.js            # Configuración de la API
│   ├── context/             # Contextos de React
│   │   └── AuthContext.jsx
│   ├── features/            # Funcionalidades por módulo
│   │   ├── auth/           # Autenticación
│   │   ├── crm/            # Gestión de clientes
│   │   ├── onts/           # Gestión de ONTs
│   │   └── server/         # Monitoreo de servidor
│   ├── hooks/              # Hooks personalizados
│   ├── layouts/            # Layouts de la aplicación
│   ├── pages/              # Páginas principales
│   ├── router.jsx          # Configuración de rutas
│   ├── services/           # Servicios (Firebase, API)
│   └── styles/             # Estilos globales
├── public/                 # Archivos públicos
└── package.json
```

## 🎯 Características Técnicas

### Rutas Implementadas

- **Rutas Públicas:**

  - `/` - Página de inicio con login

- **Rutas Privadas:**
  - `/home` - Dashboard principal
  - `/about` - Acerca de
  - `/ont_list` - Lista de ONTs con estadísticas
  - `/clientes` - Lista de clientes
  - `/clientescard` - Vista de tarjetas de clientes
  - `/clientes/detalles/:id` - Detalle de cliente (usa parámetros de ruta)
  - `/dashboard` - Dashboard de servidor

### Componentes Principales

- **AuthContext** - Manejo global del estado de autenticación
- **RequireAuth** - Componente de protección de rutas
- **DataList** - Componente reutilizable para listas con búsqueda y paginación
- **OntsCard** - Tarjeta para mostrar estadísticas de ONTs
- **ClientsCard** - Tarjeta de información de cliente

### Hooks Personalizados

- `useAuth()` - Hook para acceder al contexto de autenticación
- `useCliente()` - Hook para obtener datos de un cliente
- `useAbonados()` - Hook para obtener lista de abonados
- `useOntAcsApi()` - Hook para obtener datos de ONTs desde la API
- `useServerCpu()` - Hook para métricas de CPU del servidor
- `useServerMem()` - Hook para métricas de memoria del servidor

## 🎨 Diseño y Accesibilidad

- **Responsive Design:** La aplicación está diseñada para funcionar desde 320px hasta 2000px de ancho
- **Tema Oscuro:** Interfaz con fondo oscuro y texto claro para mejor accesibilidad
- **Efectos Visuales:** Uso de glassmorphism y animaciones sutiles
- **Alertas Visuales:** ONTs con señal baja tienen animación de parpadeo para llamar la atención

## 🐛 Dificultades Encontradas y Soluciones

### 1. Integración con API Externa

**Problema:** La API existente tenía una estructura diferente a la esperada en React.
**Solución:** Se crearon hooks personalizados (`useOntAcsApi`, `useCliente`, etc.) que encapsulan la lógica de fetch y transformación de datos.

### 2. Manejo de Estado de Autenticación

**Problema:** Necesidad de compartir el estado de autenticación entre múltiples componentes.
**Solución:** Implementación de `AuthContext` con React Context API para manejo global del estado.

### 3. Protección de Rutas

**Problema:** Prevenir acceso a rutas privadas sin autenticación.
**Solución:** Creación del componente `RequireAuth` que verifica el estado de autenticación antes de renderizar rutas protegidas.

### 4. Responsividad en Tablas

**Problema:** Las tablas con muchos datos no se adaptaban bien a pantallas pequeñas.
**Solución:** Implementación de componente `DataList` con paginación, búsqueda y diseño responsive usando Bootstrap grid.

### 5. Visualización de Datos en Tiempo Real

**Problema:** Actualizar datos de servidor y ONTs en tiempo real sin recargar la página.
**Solución:** Uso de `useEffect` con intervalos para polling de datos y hooks personalizados que manejan el estado de carga.

### 6. Efectos Visuales y Animaciones

**Problema:** Implementar animaciones de parpadeo para alertas sin afectar el rendimiento.
**Solución:** Uso de CSS animations con `@keyframes` y optimización de selectores para mejor rendimiento.

## 📝 Principios de Programación Aplicados

- **DRY (Don't Repeat Yourself):** Uso de hooks personalizados y componentes reutilizables
- **KISS (Keep It Simple, Stupid):** Código simple y directo, evitando complejidad innecesaria
- **YAGNI (You Aren't Gonna Need It):** Implementación solo de funcionalidades necesarias

## 🚀 Despliegue

El proyecto está preparado para desplegarse en Vercel u otros servicios de hosting estático.

### Despliegue en Vercel

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## 📄 Licencia

Este proyecto es parte de un trabajo final de estudios.

## 👤 Autor

Desarrollado como trabajo final de Frontend.

---

**Nota:** Este proyecto es una adaptación de un sistema existente a React, manteniendo la funcionalidad original mientras se mejora la experiencia de usuario y la mantenibilidad del código.
