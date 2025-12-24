import { useState, useEffect } from 'react';
import { getOntProfiles, getLineprofiles, getSrvprofiles } from '../services/ontProfileService';

/**
 * Hook para obtener perfiles ONT (lineprofiles y srvprofiles) por OLT
 * @param {number|null} oltId - ID de la OLT. Si es null, no carga perfiles
 * @param {boolean} loadBoth - Si es true, carga ambos perfiles en una sola petición usando /ont_profiles
 */
export function useOntProfiles(oltId = null, loadBoth = true) {
    const [lineprofiles, setLineprofiles] = useState([]);
    const [srvprofiles, setSrvprofiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!oltId) {
            setLineprofiles([]);
            setSrvprofiles([]);
            setError(null);
            return;
        }

        const cargarPerfiles = async () => {
            setLoading(true);
            setError(null);

            try {
                if (loadBoth) {
                    // Cargar ambos perfiles en una sola petición
                    const result = await getOntProfiles(oltId);
                    if (result.success) {
                        setLineprofiles(result.lineprofiles);
                        setSrvprofiles(result.srvprofiles);
                    } else {
                        setError(result.error);
                        setLineprofiles([]);
                        setSrvprofiles([]);
                    }
                } else {
                    // Cargar perfiles por separado
                    const [lineResult, srvResult] = await Promise.all([
                        getLineprofiles(oltId),
                        getSrvprofiles(oltId)
                    ]);

                    if (lineResult.success) {
                        setLineprofiles(lineResult.data);
                    } else {
                        setError(lineResult.error);
                    }

                    if (srvResult.success) {
                        setSrvprofiles(srvResult.data);
                    } else {
                        setError(prev => prev || srvResult.error);
                    }
                }
            } catch (err) {
                console.error('Error al cargar perfiles ONT:', err);
                setError(err.message || 'Error al cargar perfiles');
            } finally {
                setLoading(false);
            }
        };

        cargarPerfiles();
    }, [oltId, loadBoth]);

    return {
        lineprofiles,
        srvprofiles,
        loading,
        error
    };
}

