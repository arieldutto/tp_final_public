import { useState, useEffect, useRef, useCallback } from 'react';
import { sendMultipleOntAlerts } from '../../../services/telegramService';
import { updateCriticalTimeTracker } from '../../../utils/ontCriticalTimeTracker';

/**
 * Hook para manejar el envío de alertas de ONTs a Telegram
 * @param {Array} ontsList - Lista completa de ONTs
 * @param {boolean} autoSendEnabled - Si está habilitado el envío automático
 * @param {number} intervalMinutes - Intervalo en minutos para envío automático (default: 60)
 * @returns {Object} { sendAlerts, loading, error, result, autoSendEnabled, toggleAutoSend, lastAutoSend }
 */
export function useTelegramAlert(ontsList, autoSendEnabled = false, intervalMinutes = 60) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [isAutoSendEnabled, setIsAutoSendEnabled] = useState(autoSendEnabled);
    const [lastAutoSend, setLastAutoSend] = useState(null);
    const intervalRef = useRef(null);
    const lastSentHashRef = useRef(null);

    /**
     * Filtra las ONTs con señal baja (RX_Estado === 'danger')
     * @returns {Array} Array de ONTs con señal baja
     */
    const getOntsWithLowSignal = useCallback(() => {
        if (!ontsList || ontsList.length === 0) return [];

        return ontsList.filter(ont => ont.RX_Estado === 'danger');
    }, [ontsList]);

    /**
     * Filtra las ONTs que no se reportan hace más de 12 horas
     * @returns {Array} Array de ONTs sin reporte
     */
    const getOntsWithoutReport = useCallback(() => {
        if (!ontsList || ontsList.length === 0) return [];

        const twelveHoursAgo = new Date();
        twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

        return ontsList.filter(ont => {
            if (!ont.ont_lastinform_local) return true; // Si no tiene fecha, considerarla sin reporte

            try {
                const lastReport = new Date(ont.ont_lastinform_local);
                return lastReport < twelveHoursAgo;
            } catch (e) {
                return true; // Si hay error parseando la fecha, considerarla sin reporte
            }
        });
    }, [ontsList]);

    /**
     * Detecta cambios de estado comparando con el estado anterior
     * @returns {Object} { changedOnts: Array, previousStates: Object }
     */
    const getOntsWithStateChange = useCallback(() => {
        if (!ontsList || ontsList.length === 0) return { changedOnts: [], previousStates: {} };

        // Obtener estado anterior del localStorage
        const previousStateKey = 'telegram_onts_previous_state';
        const previousStateJson = localStorage.getItem(previousStateKey);
        const previousState = previousStateJson ? JSON.parse(previousStateJson) : {};

        // Detectar cambios
        const changedOnts = [];
        ontsList.forEach(ont => {
            const previous = previousState[ont.id];
            if (!previous) {
                // Primera vez que vemos esta ONT, no es un cambio
                return;
            }

            // Comparar estado
            const currentEstado = ont.RX_Estado || 'unknown';
            const previousEstado = previous.RX_Estado || 'unknown';

            if (currentEstado !== previousEstado) {
                changedOnts.push(ont);
            }
        });

        // Guardar estado actual para la próxima comparación
        const currentState = {};
        ontsList.forEach(ont => {
            currentState[ont.id] = {
                RX_Estado: ont.RX_Estado || 'unknown',
                RX_Power: ont.RX_Power,
                ont_lastinform_local: ont.ont_lastinform_local
            };
        });
        localStorage.setItem(previousStateKey, JSON.stringify(currentState));

        return { changedOnts, previousStates: previousState };
    }, [ontsList]);

    /**
     * Genera un hash simple de las ONTs con señal baja para detectar cambios
     * @param {Array} onts - Array de ONTs
     * @returns {string} Hash de las ONTs
     */
    const generateOntsHash = (onts) => {
        if (!onts || onts.length === 0) return '';
        // Crear un hash basado en los IDs y estados de las ONTs
        return onts
            .map(ont => `${ont.id}-${ont.RX_Power}-${ont.serialnumber}`)
            .sort()
            .join('|');
    };

    /**
     * Envía alertas a Telegram para todas las ONTs con problemas
     * @param {boolean} isAutoSend - Si es un envío automático (para evitar mostrar loading)
     * @returns {Promise<void>}
     */
    const sendAlerts = async (isAutoSend = false) => {
        if (!isAutoSend) {
            setLoading(true);
        }
        setError(null);
        if (!isAutoSend) {
            setResult(null);
        }

        try {
            const ontsWithLowSignal = getOntsWithLowSignal();
            const ontsWithoutReport = getOntsWithoutReport();
            const stateChangeData = getOntsWithStateChange();
            const ontsWithStateChange = stateChangeData.changedOnts || [];
            const previousStates = stateChangeData.previousStates || {};

            // Actualizar tracker de tiempo crítico con todas las ONTs
            const allOnts = [
                ...ontsWithLowSignal,
                ...ontsWithoutReport,
                ...ontsWithStateChange
            ];
            if (allOnts.length > 0) {
                updateCriticalTimeTracker(allOnts);
            }

            // Combinar todas las alertas
            const allAlerts = {
                lowSignal: ontsWithLowSignal,
                withoutReport: ontsWithoutReport,
                stateChange: ontsWithStateChange,
                previousStates: previousStates
            };

            const totalAlerts = ontsWithLowSignal.length + ontsWithoutReport.length + ontsWithStateChange.length;

            if (totalAlerts === 0) {
                if (!isAutoSend) {
                    setResult({
                        ok: true,
                        sent: 0,
                        message: 'No hay ONTs con problemas para enviar alertas'
                    });
                }
                if (!isAutoSend) {
                    setLoading(false);
                }
                return;
            }

            // Generar hash para detectar si hay cambios (incluyendo todos los tipos)
            const currentHash = generateOntsHash([
                ...ontsWithLowSignal,
                ...ontsWithoutReport,
                ...ontsWithStateChange
            ]);

            // Si es envío automático y no hay cambios, no enviar
            if (isAutoSend && lastSentHashRef.current === currentHash) {
                console.log('No hay cambios en las ONTs, omitiendo envío automático');
                return;
            }

            const result = await sendMultipleOntAlerts(allAlerts);

            // Actualizar hash solo si el envío fue exitoso
            if (result.ok && result.sent > 0) {
                lastSentHashRef.current = currentHash;
                setLastAutoSend(new Date());
            }

            if (!isAutoSend) {
                setResult(result);
            }

            if (!result.ok && result.errors.length > 0) {
                setError(`Error al enviar algunas alertas: ${result.errors.length} fallos`);
            }
        } catch (err) {
            setError(err.message || 'Error inesperado al enviar alertas');
            if (!isAutoSend) {
                setResult({
                    ok: false,
                    sent: 0,
                    errors: [err.message]
                });
            }
        } finally {
            if (!isAutoSend) {
                setLoading(false);
            }
        }
    };

    /**
     * Activa o desactiva el envío automático
     */
    const toggleAutoSend = useCallback(() => {
        setIsAutoSendEnabled(prev => !prev);
    }, []);

    // Efecto para manejar el envío automático
    useEffect(() => {
        if (!isAutoSendEnabled) {
            // Limpiar intervalo si está deshabilitado
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Enviar inmediatamente al activar
        sendAlerts(true);

        // Configurar intervalo para envío automático cada X minutos
        const intervalMs = intervalMinutes * 60 * 1000; // Convertir minutos a milisegundos
        intervalRef.current = setInterval(() => {
            sendAlerts(true);
        }, intervalMs);

        // Limpiar intervalo al desmontar o cambiar dependencias
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isAutoSendEnabled, intervalMinutes, ontsList]);

    return {
        sendAlerts,
        loading,
        error,
        result,
        ontsWithLowSignal: getOntsWithLowSignal(),
        ontsWithoutReport: getOntsWithoutReport(),
        ontsWithStateChange: getOntsWithStateChange().changedOnts || [],
        isAutoSendEnabled,
        toggleAutoSend,
        lastAutoSend
    };
}

