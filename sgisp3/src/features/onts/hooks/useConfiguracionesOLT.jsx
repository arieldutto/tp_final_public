import { useState, useEffect } from 'react';
import { API_SGISP } from '../../../config';

/**
 * Hook para obtener todas las configuraciones de OLT
 * (lineprofiles, srvprofiles, traffic_tables, traffic_mappings)
 */
export function useConfiguracionesOLT() {
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

                const [lineprofilesRes, srvprofilesRes, trafficTablesRes, trafficMappingsRes] = await Promise.all([
                    fetch(`${API_SGISP}/lineprofiles`),
                    fetch(`${API_SGISP}/srvprofiles`),
                    fetch(`${API_SGISP}/traffic_tables`),
                    fetch(`${API_SGISP}/traffic_mappings`)
                ]);

                const [lineprofilesData, srvprofilesData, trafficTablesData, trafficMappingsData] = await Promise.all([
                    lineprofilesRes.json(),
                    srvprofilesRes.json(),
                    trafficTablesRes.json(),
                    trafficMappingsRes.json()
                ]);

                if (lineprofilesRes.ok && lineprofilesData.data) {
                    setLineprofiles(lineprofilesData.data);
                } else {
                    throw new Error(lineprofilesData.error || 'Error al cargar lineprofiles');
                }

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
    }, []);

    return {
        lineprofiles,
        srvprofiles,
        trafficTables,
        trafficMappings,
        loading,
        error
    };
}

