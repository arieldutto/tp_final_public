import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { sendMultipleOntAlerts } from '../services/telegramService';
import { updateCriticalTimeTracker } from '../utils/ontCriticalTimeTracker';

const TelegramAlertContext = createContext();

/**
 * Contexto global para manejar el envío automático de alertas de Telegram
 * Permite que el envío automático funcione incluso cuando el usuario cambia de página
 */
export function TelegramAlertProvider({ children }) {
    const [isAutoSendEnabled, setIsAutoSendEnabled] = useState(() => {
        // Cargar preferencia desde localStorage
        const saved = localStorage.getItem('telegram_auto_send_enabled');
        return saved === 'true';
    });
    const [lastAutoSend, setLastAutoSend] = useState(() => {
        const saved = localStorage.getItem('telegram_last_auto_send');
        return saved ? new Date(saved) : null;
    });
    const [ontsList, setOntsList] = useState([]);
    const intervalRef = useRef(null);
    const lastSentHashRef = useRef(null);
    const fetchIntervalRef = useRef(null);

    /**
     * Filtra las ONTs con señal baja (RX_Estado === 'danger')
     */
    const getOntsWithLowSignal = useCallback(() => {
        if (!ontsList || ontsList.length === 0) return [];
        return ontsList.filter(ont => ont.RX_Estado === 'danger');
    }, [ontsList]);

    /**
     * Filtra las ONTs que no se reportan hace más de 12 horas
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
     */
    const getOntsWithStateChange = useCallback(() => {
        if (!ontsList || ontsList.length === 0) return { changedOnts: [], previousStates: {} };

        const previousStateKey = 'telegram_onts_previous_state';
        const previousStateJson = localStorage.getItem(previousStateKey);
        const previousState = previousStateJson ? JSON.parse(previousStateJson) : {};

        const changedOnts = ontsList.filter(ont => {
            const previous = previousState[ont.id];
            if (!previous) return false;

            const currentEstado = ont.RX_Estado || 'unknown';
            const previousEstado = previous.RX_Estado || 'unknown';

            return currentEstado !== previousEstado;
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
     * Genera un hash simple de las ONTs con señal baja para detectar cambios
     */
    const generateOntsHash = useCallback((onts) => {
        if (!onts || onts.length === 0) return '';
        return onts
            .map(ont => `${ont.id}-${ont.RX_Power}-${ont.serialnumber}`)
            .sort()
            .join('|');
    }, []);

    /**
     * Función para actualizar la lista de ONTs desde cualquier componente
     */
    const updateOntsList = useCallback((newOntsList) => {
        const updatedList = newOntsList || [];
        setOntsList(updatedList);

        // Actualizar tracker de tiempo crítico cuando se actualiza la lista
        if (updatedList.length > 0) {
            updateCriticalTimeTracker(updatedList);
        }
    }, []);

    /**
     * Envía alertas automáticamente
     */
    const sendAutoAlerts = useCallback(async () => {
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

        const allAlerts = {
            lowSignal: ontsWithLowSignal,
            withoutReport: ontsWithoutReport,
            stateChange: ontsWithStateChange,
            previousStates: previousStates
        };

        const totalAlerts = ontsWithLowSignal.length + ontsWithoutReport.length + ontsWithStateChange.length;

        if (totalAlerts === 0) {
            return;
        }

        // Generar hash para detectar si hay cambios
        const currentHash = generateOntsHash([
            ...ontsWithLowSignal,
            ...ontsWithoutReport,
            ...ontsWithStateChange
        ]);

        // Si no hay cambios, no enviar
        if (lastSentHashRef.current === currentHash) {
            console.log('No hay cambios en las ONTs, omitiendo envío automático');
            return;
        }

        try {
            const result = await sendMultipleOntAlerts(allAlerts);

            // Actualizar hash solo si el envío fue exitoso
            if (result.ok && result.sent > 0) {
                lastSentHashRef.current = currentHash;
                const now = new Date();
                setLastAutoSend(now);
                localStorage.setItem('telegram_last_auto_send', now.toISOString());
                console.log(`✅ Enviadas ${result.sent} alertas automáticas a Telegram`);
            }
        } catch (error) {
            console.error('Error en envío automático de alertas:', error);
        }
    }, [getOntsWithLowSignal, getOntsWithoutReport, getOntsWithStateChange, generateOntsHash]);

    /**
     * Activa o desactiva el envío automático
     */
    const toggleAutoSend = useCallback(() => {
        setIsAutoSendEnabled(prev => {
            const newValue = !prev;
            localStorage.setItem('telegram_auto_send_enabled', String(newValue));
            return newValue;
        });
    }, []);

    /**
     * Función para obtener datos de ONTs desde la API
     */
    const fetchOntsData = useCallback(async () => {
        try {
            const API_SGISP = import.meta.env.VITE_API_SGISP;
            if (!API_SGISP) {
                console.warn('VITE_API_SGISP no está configurado');
                return;
            }

            const response = await fetch(`${API_SGISP}/ont_acs_api`);
            const json = await response.json();

            if (json.data && Array.isArray(json.data)) {
                const newOntsList = json.data || [];
                setOntsList(newOntsList);

                // Actualizar tracker de tiempo crítico cuando se cargan las ONTs
                if (newOntsList.length > 0) {
                    updateCriticalTimeTracker(newOntsList);
                }
            }
        } catch (error) {
            console.error('Error obteniendo datos de ONTs:', error);
        }
    }, []);

    // Efecto para manejar el envío automático
    useEffect(() => {
        if (!isAutoSendEnabled) {
            // Limpiar intervalos si está deshabilitado
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (fetchIntervalRef.current) {
                clearInterval(fetchIntervalRef.current);
                fetchIntervalRef.current = null;
            }
            return;
        }

        // Obtener datos iniciales
        fetchOntsData();

        // Enviar inmediatamente al activar
        const initialTimeout = setTimeout(() => {
            sendAutoAlerts();
        }, 5000); // Esperar 5 segundos para que se carguen los datos

        // Configurar intervalo para obtener datos cada 1 hora
        // Esto asegura que siempre tengamos datos actualizados sin sobrecargar el ACS
        fetchIntervalRef.current = setInterval(() => {
            fetchOntsData();
        }, 60 * 60 * 1000); // 1 hora

        // Configurar intervalo para envío automático cada 6 horas (4 envíos por día)
        const intervalMs = 6 * 60 * 60 * 1000; // 6 horas
        intervalRef.current = setInterval(() => {
            sendAutoAlerts();
        }, intervalMs);

        // Limpiar intervalos al desmontar o cambiar dependencias
        return () => {
            clearTimeout(initialTimeout);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (fetchIntervalRef.current) {
                clearInterval(fetchIntervalRef.current);
                fetchIntervalRef.current = null;
            }
        };
    }, [isAutoSendEnabled, sendAutoAlerts, fetchOntsData]);

    // Efecto para enviar alertas cuando cambian los datos de ONTs
    useEffect(() => {
        if (isAutoSendEnabled && ontsList.length > 0) {
            // Pequeño delay para evitar envíos múltiples al cargar
            const timeout = setTimeout(() => {
                sendAutoAlerts();
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [ontsList, isAutoSendEnabled, sendAutoAlerts]);

    const value = {
        isAutoSendEnabled,
        toggleAutoSend,
        lastAutoSend,
        updateOntsList,
        ontsWithLowSignal: getOntsWithLowSignal()
    };

    return (
        <TelegramAlertContext.Provider value={value}>
            {children}
        </TelegramAlertContext.Provider>
    );
}

/**
 * Hook para usar el contexto de alertas de Telegram
 */
export function useTelegramAlertContext() {
    const context = useContext(TelegramAlertContext);
    if (!context) {
        throw new Error('useTelegramAlertContext debe usarse dentro de TelegramAlertProvider');
    }
    return context;
}

