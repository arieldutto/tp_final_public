/**
 * Utilidad para rastrear el tiempo que una ONT lleva en estado crítico
 */

const STORAGE_KEY = 'ont_critical_time_tracker';

/**
 * Determina si una ONT está en estado crítico
 * @param {Object} ont - Objeto ONT
 * @returns {boolean} true si está en estado crítico
 */
function isOntCritical(ont) {
    // Estado crítico: señal baja (RX_Estado === 'danger') o potencia <= -25
    if (ont.RX_Estado === 'danger') {
        return true;
    }

    const potencia = ont.RX_Power;
    if (potencia !== null && potencia !== undefined && potencia <= -25) {
        return true;
    }

    return false;
}

/**
 * Obtiene el tiempo que una ONT lleva en estado crítico
 * @param {string} ontId - ID de la ONT
 * @returns {Object|null} { startTime: Date, duration: string } o null si no está en estado crítico
 */
export function getCriticalTime(ontId) {
    const trackerData = localStorage.getItem(STORAGE_KEY);
    if (!trackerData) return null;

    try {
        const tracker = JSON.parse(trackerData);
        const entry = tracker[ontId];

        if (!entry || !entry.startTime) return null;

        const startTime = new Date(entry.startTime);
        const now = new Date();
        const diffMs = now - startTime;

        // Calcular duración en formato legible
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;

        let duration = '';
        if (days > 0) {
            duration = `${days}d ${remainingHours}h`;
        } else if (hours > 0) {
            duration = `${hours}h ${minutes}m`;
        } else {
            duration = `${minutes}m`;
        }

        return {
            startTime: startTime,
            duration: duration,
            hours: hours,
            minutes: minutes,
            days: days
        };
    } catch (e) {
        console.error('Error leyendo tracker de tiempo crítico:', e);
        return null;
    }
}

/**
 * Actualiza el tracker de tiempo crítico para todas las ONTs
 * @param {Array} ontsList - Lista de ONTs
 * @returns {Object} Mapa de ONT ID -> tiempo crítico
 */
export function updateCriticalTimeTracker(ontsList) {
    if (!ontsList || ontsList.length === 0) {
        return {};
    }

    const trackerData = localStorage.getItem(STORAGE_KEY);
    let tracker = trackerData ? JSON.parse(trackerData) : {};
    const now = new Date();
    const criticalTimes = {};

    // Procesar cada ONT
    ontsList.forEach(ont => {
        const isCritical = isOntCritical(ont);
        const ontId = ont.id;

        if (isCritical) {
            // Si está en estado crítico
            if (!tracker[ontId]) {
                // Primera vez que entra en estado crítico
                tracker[ontId] = {
                    startTime: now.toISOString(),
                    lastUpdate: now.toISOString()
                };
            } else {
                // Ya estaba en estado crítico, actualizar última actualización
                tracker[ontId].lastUpdate = now.toISOString();
            }

            // Calcular tiempo transcurrido
            const criticalTime = getCriticalTime(ontId);
            if (criticalTime) {
                criticalTimes[ontId] = criticalTime;
            }
        } else {
            // Si NO está en estado crítico, eliminar del tracker
            if (tracker[ontId]) {
                delete tracker[ontId];
            }
        }
    });

    // Guardar tracker actualizado
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracker));

    return criticalTimes;
}

/**
 * Obtiene el tiempo crítico para una ONT específica
 * @param {Object} ont - Objeto ONT
 * @returns {Object|null} Tiempo crítico o null
 */
export function getOntCriticalTime(ont) {
    if (!ont || !ont.id) return null;
    return getCriticalTime(ont.id);
}

/**
 * Formatea el tiempo crítico para mostrar en alertas
 * @param {Object} criticalTime - Objeto con tiempo crítico
 * @returns {string} Tiempo formateado
 */
export function formatCriticalTime(criticalTime) {
    if (!criticalTime) return '';

    const { days, hours, minutes } = criticalTime;

    if (days > 0) {
        return `${days} dia${days > 1 ? 's' : ''} ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `${hours} hora${hours > 1 ? 's' : ''} ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    } else {
        return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    }
}

