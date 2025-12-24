import { useState, useEffect } from 'react';
import { API_SGISP } from '../../../config';

/**
 * Hook para obtener todas las configuraciones de OLT
 * (lineprofiles, srvprofiles, traffic_tables, traffic_mappings)
 * @param {number|null} oltId - ID de la OLT. Si se proporciona, filtra los perfiles por OLT
 */
export function useConfiguracionesOLT(oltId = null) {
    const [lineprofiles, setLineprofiles] = useState([]);
    const [srvprofiles, setSrvprofiles] = useState([]);
    const [trafficTables, setTrafficTables] = useState([]);
    const [trafficMappings, setTrafficMappings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarConfiguraciones = async () => {
            try {
                setLoading(true);
                setError(null);

                // Construir URLs con olt_id si está disponible
                const lineprofilesUrl = oltId
                    ? `${API_SGISP}/lineprofiles?olt_id=${oltId}`
                    : `${API_SGISP}/lineprofiles`;

                const srvprofilesUrl = oltId
                    ? `${API_SGISP}/srvprofiles?olt_id=${oltId}`
                    : `${API_SGISP}/srvprofiles`;

                const [lineprofilesRes, srvprofilesRes, trafficTablesRes, trafficMappingsRes] = await Promise.all([
                    fetch(lineprofilesUrl),
                    fetch(srvprofilesUrl),
                    fetch(`${API_SGISP}/traffic_tables`),
                    fetch(`${API_SGISP}/traffic_mappings`)
                ]);

                const [lineprofilesData, srvprofilesData, trafficTablesData, trafficMappingsData] = await Promise.all([
                    lineprofilesRes.json(),
                    srvprofilesRes.json(),
                    trafficTablesRes.json(),
                    trafficMappingsRes.json()
                ]);

                // Manejar lineprofiles (puede venir como 'profiles' o 'data')
                if (lineprofilesRes.ok) {
                    const lineprofilesArray = lineprofilesData.profiles || lineprofilesData.data || [];
                    setLineprofiles(lineprofilesArray);
                } else {
                    throw new Error(lineprofilesData.error || 'Error al cargar lineprofiles');
                }

                // Manejar srvprofiles
                if (srvprofilesRes.ok && srvprofilesData.data) {
                    setSrvprofiles(srvprofilesData.data);
                } else {
                    throw new Error(srvprofilesData.error || 'Error al cargar srvprofiles');
                }

                if (trafficTablesRes.ok && trafficTablesData.data) {
                    setTrafficTables(trafficTablesData.data);
                } else {
                    throw new Error(trafficTablesData.error || 'Error al cargar traffic tables');
                }

                if (trafficMappingsRes.ok && trafficMappingsData.data) {
                    setTrafficMappings(trafficMappingsData.data);
                } else {
                    throw new Error(trafficMappingsData.error || 'Error al cargar traffic mappings');
                }
            } catch (err) {
                console.error('Error al cargar configuraciones OLT:', err);
                setError(err.message || 'Error al cargar las configuraciones de la OLT');
            } finally {
                setLoading(false);
            }
        };

        cargarConfiguraciones();
    }, [oltId]);

    return {
        lineprofiles,
        srvprofiles,
        trafficTables,
        trafficMappings,
        loading,
        error
    };
}

