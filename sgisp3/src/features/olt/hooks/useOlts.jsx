import { useState, useEffect } from 'react';
import { API_SGISP } from '../../../config';

/**
 * Hook para obtener la lista de OLTs
 */
export function useOlts() {
    const [olts, setOlts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarOLTs = async () => {
            try {
                setLoading(true);
                setError(null);

                // Intentar obtener OLTs desde la API
                // Si el endpoint no existe, retornar array vacío (compatibilidad hacia atrás)
                try {
                    const response = await fetch(`${API_SGISP}/olts`);

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success || data.data) {
                            setOlts(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
                        } else {
                            setOlts([]);
                        }
                    } else if (response.status === 404) {
                        // Endpoint no existe aún, no es un error - modo compatibilidad
                        console.info('Endpoint /olts no disponible. Sistema funcionará sin selección de OLT.');
                        setOlts([]);
                    } else {
                        // Otro error HTTP, pero no lo tratamos como error crítico
                        const errorData = await response.json().catch(() => ({}));
                        console.warn('Error HTTP al cargar OLTs:', errorData.error || `HTTP ${response.status}`);
                        setOlts([]);
                    }
                } catch (networkError) {
                    // Error de red (CORS, conexión, etc.) - no es un error crítico
                    console.warn('No se pudo conectar al endpoint /olts (puede que no exista aún):', networkError.message);
                    setOlts([]);
                }
            } catch (err) {
                // Error inesperado, pero no lo mostramos como error crítico
                console.warn('Error inesperado al cargar OLTs:', err);
                setOlts([]);
            } finally {
                setLoading(false);
            }
        };

        cargarOLTs();
    }, []);

    return {
        olts,
        loading,
        error
    };
}

