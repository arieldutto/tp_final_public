import { useState, useCallback } from 'react';
import { sendMultipleOntAlertsByEmail } from '../../../services/emailService';

/**
 * Hook para manejar el envío de alertas de ONTs por Email
 * @param {Array} ontsList - Lista completa de ONTs
 * @returns {Object} { sendAlerts, loading, error, result, ontsWithLowSignal, ontsWithoutReport, ontsWithStateChange }
 */
export function useEmailAlert(ontsList) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

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
            if (!ont.ont_lastinform_local) return true;
            
            try {
                const lastReport = new Date(ont.ont_lastinform_local);
                return lastReport < twelveHoursAgo;
            } catch (e) {
                return true;
            }
        });
    }, [ontsList]);

    /**
     * Detecta cambios de estado comparando con el estado anterior
     * @returns {Object} { changedOnts: Array, previousStates: Object }
     */
    const getOntsWithStateChange = useCallback(() => {
        if (!ontsList || ontsList.length === 0) return { changedOnts: [], previousStates: {} };

        const previousStateKey = 'email_onts_previous_state';
        const previousStateJson = localStorage.getItem(previousStateKey);
        const previousState = previousStateJson ? JSON.parse(previousStateJson) : {};

        const changedOnts = [];
        ontsList.forEach(ont => {
            const previous = previousState[ont.id];
            if (!previous) return;
            
            const currentEstado = ont.RX_Estado || 'unknown';
            const previousEstado = previous.RX_Estado || 'unknown';
            
            if (currentEstado !== previousEstado) {
                changedOnts.push(ont);
            }
        });

        // Guardar estado actual
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
     * Envía alertas a Email para todas las ONTs con problemas
     * @param {string|Array} toEmail - Email(s) destinatario(s)
     * @returns {Promise<void>}
     */
    const sendAlerts = async (toEmail) => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const ontsWithLowSignal = getOntsWithLowSignal();
            const ontsWithoutReport = getOntsWithoutReport();
            const stateChangeData = getOntsWithStateChange();
            const ontsWithStateChange = stateChangeData.changedOnts || [];
            const previousStates = stateChangeData.previousStates || {};

            // Combinar todas las alertas
            const allAlerts = {
                lowSignal: ontsWithLowSignal,
                withoutReport: ontsWithoutReport,
                stateChange: ontsWithStateChange,
                previousStates: previousStates
            };

            const totalAlerts = ontsWithLowSignal.length + ontsWithoutReport.length + ontsWithStateChange.length;

            if (totalAlerts === 0) {
                setResult({
                    ok: true,
                    sent: 0,
                    message: 'No hay ONTs con problemas para enviar alertas'
                });
                setLoading(false);
                return;
            }

            const result = await sendMultipleOntAlertsByEmail(allAlerts, toEmail);

            setResult(result);

            if (!result.ok) {
                if (result.errors && result.errors.length > 0) {
                    const errorMessage = result.errors.join('. ');
                    setError(errorMessage);
                } else {
                    setError('Error al enviar email');
                }
            }
        } catch (err) {
            setError(err.message || 'Error inesperado al enviar alertas');
            setResult({
                ok: false,
                sent: 0,
                errors: [err.message]
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        sendAlerts,
        loading,
        error,
        result,
        ontsWithLowSignal: getOntsWithLowSignal(),
        ontsWithoutReport: getOntsWithoutReport(),
        ontsWithStateChange: getOntsWithStateChange().changedOnts || []
    };
}

