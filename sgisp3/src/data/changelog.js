// Changelog del sistema SGISP 3
// Formato: Semantic Versioning (MAJOR.MINOR.PATCH)

export const CHANGELOG = [
    {
        version: "3.4.0",
        date: "2025-12-15",
        type: "minor", // minor: nuevas funcionalidades
        changes: [
            {
                type: "feature",
                icon: "bi-clock-history",
                title: "Alertas de ONTs sin Reporte",
                description: "Sistema de detección y notificación automática de ONTs que no se reportan hace más de 12 horas mediante Telegram"
            },
            {
                type: "feature",
                icon: "bi-arrow-repeat",
                title: "Detección de Cambios de Estado",
                description: "Notificaciones automáticas cuando una ONT cambia de estado (en línea, señal baja, desconectada) con comparación de estado anterior y actual"
            },
            {
                type: "improvement",
                icon: "bi-telegram",
                title: "Mejora en Notificaciones de Telegram",
                description: "Mensajes de alerta mejorados con resumen por tipo (señal baja, sin reporte, cambio de estado) y mejor organización de la información"
            }
        ]
    },
    {
        version: "3.3.0",
        date: "2025-12-14",
        type: "minor", // minor: nuevas funcionalidades
        changes: [
            {
                type: "feature",
                icon: "bi-diagram-3",
                title: "Visualización de Estructura de Red OLT",
                description: "Sistema de visualización interactiva de la red jerárquica (Frame → Board → PON → ONT) con gráficos de uso de puertos, distribución por frame y estadísticas detalladas"
            }
        ]
    },
    {
        version: "3.2.0",
        date: "2025-12-14",
        type: "minor", // minor: nuevas funcionalidades
        changes: [
            {
                type: "feature",
                icon: "bi-pencil-square",
                title: "Modificar Abonado",
                description: "Funcionalidad para editar datos de abonados existentes con modal de edición y actualización parcial de campos"
            },
            {
                type: "feature",
                icon: "bi-trash",
                title: "Eliminar Abonado",
                description: "Sistema de eliminación de abonados con validación de servicios asociados y confirmación de seguridad"
            },
            {
                type: "feature",
                icon: "bi-journal-text",
                title: "Sistema de Changelog",
                description: "Implementación de changelog con versionado semántico y modal interactivo para ver el historial de cambios"
            },
            {
                type: "improvement",
                icon: "bi-arrows-angle-contract",
                title: "Vista Compacta de Información",
                description: "Optimización de la vista de detalles del cliente para mostrar toda la información sin scroll en la pestaña Info"
            },
            {
                type: "improvement",
                icon: "bi-arrows-move",
                title: "Scroll Inteligente en Pestañas",
                description: "Implementación de scroll automático en la pestaña ONT cuando el contenido excede el espacio disponible"
            }
        ]
    },
    {
        version: "3.1.0",
        date: "2025-12-14",
        type: "minor", // minor: nuevas funcionalidades
        changes: [
            {
                type: "feature",
                icon: "bi-person-plus-fill",
                title: "Crear Abonado",
                description: "Nueva funcionalidad para crear abonados desde el CRM con formulario completo y validaciones"
            },
            {
                type: "feature",
                icon: "bi-router",
                title: "Buscar y Agregar ONT",
                description: "Sistema de detección y registro de ONT nuevas conectadas a la OLT con configuración completa"
            },
            {
                type: "improvement",
                icon: "bi-geo-alt-fill",
                title: "Mejora en Formato de Localidad",
                description: "Formato estandarizado para localidad: 'Localidad, Provincia, País' para mejor geocodificación"
            }
        ]
    },
    {
        version: "3.0.0",
        date: "2025-12-01",
        type: "major", // major: cambios importantes
        changes: [
            {
                type: "feature",
                icon: "bi-bell-fill",
                title: "Alertas Automáticas por Telegram",
                description: "Sistema de alertas automáticas cada hora para ONT con señal baja"
            },
            {
                type: "feature",
                icon: "bi-map",
                title: "Mapas de Ubicación de Clientes",
                description: "Integración de mapas Leaflet para visualizar la ubicación de clientes basada en su dirección"
            },
            {
                type: "feature",
                icon: "bi-card-heading",
                title: "Rediseño de Tarjetas de Cliente",
                description: "Nuevo diseño glassmorphism con grid system para información de cliente, servicios y ONT"
            },
            {
                type: "feature",
                icon: "bi-wifi",
                title: "Visualización de Datos TR069",
                description: "Tarjetas informativas con datos significativos de ONT obtenidos vía TR069"
            },
            {
                type: "feature",
                icon: "bi-exclamation-triangle-fill",
                title: "Páginas de Error",
                description: "Páginas de error personalizadas (404, 500, genérico) con diseño consistente"
            },
            {
                type: "improvement",
                icon: "bi-calculator",
                title: "Corrección de Cálculo de Potencia Óptica",
                description: "Implementación correcta del cálculo de potencia óptica según fórmula del backend"
            },
            {
                type: "improvement",
                icon: "bi-speedometer2",
                title: "Optimización de Rendimiento",
                description: "Reducción de efectos CSS para mejorar la velocidad de carga de las tarjetas"
            }
        ]
    }
];

// Función para obtener la versión actual
export const getCurrentVersion = () => {
    return CHANGELOG[0].version;
};

// Función para obtener el changelog de una versión específica
export const getChangelogByVersion = (version) => {
    return CHANGELOG.find(entry => entry.version === version);
};

// Función para obtener todos los changelogs
export const getAllChangelogs = () => {
    return CHANGELOG;
};

