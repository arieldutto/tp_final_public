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
                    } else {
                        // Si el endpoint no existe (404), simplemente no hay OLTs configuradas
                        setOlts([]);
                    }
                } catch (err) {
                    // Si hay error de red o el endpoint no existe, asumir que no hay OLTs
                    console.warn('No se pudo cargar OLTs (puede que el endpoint no exista aún):', err);
                    setOlts([]);
                }
            } catch (err) {
                console.error('Error al cargar OLTs:', err);
                setError(err.message);
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

