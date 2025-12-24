/**
 * Servicio para obtener perfiles ONT (lineprofiles y srvprofiles) por OLT
 */
import { API_SGISP } from '../../../config';

/**
 * Obtiene los lineprofiles disponibles para una OLT específica
 * @param {number|null} oltId - ID de la OLT. Si es null, devuelve todos los perfiles
 * @returns {Promise<{success: boolean, data: Array, error?: string}>}
 */
export async function getLineprofiles(oltId = null) {
    try {
        const url = oltId 
            ? `${API_SGISP}/lineprofiles?olt_id=${oltId}`
            : `${API_SGISP}/lineprofiles`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            // La API puede devolver 'profiles' o 'data' dependiendo de si hay olt_id
            return {
                success: true,
                data: data.profiles || data.data || [],
                total: data.total || (data.profiles || data.data || []).length,
                olt_id: data.olt_id || null
            };
        } else {
            return {
                success: false,
                data: [],
                error: data.error || 'Error al obtener lineprofiles'
            };
        }
    } catch (error) {
        console.error('Error al obtener lineprofiles:', error);
        return {
            success: false,
            data: [],
            error: error.message || 'Error de conexión'
        };
    }
}

/**
 * Obtiene los srvprofiles disponibles para una OLT específica
 * @param {number|null} oltId - ID de la OLT. Si es null, devuelve todos los perfiles
 * @returns {Promise<{success: boolean, data: Array, error?: string}>}
 */
export async function getSrvprofiles(oltId = null) {
    try {
        const url = oltId 
            ? `${API_SGISP}/srvprofiles?olt_id=${oltId}`
            : `${API_SGISP}/srvprofiles`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            return {
                success: true,
                data: data.data || [],
                total: data.total || (data.data || []).length,
                olt_id: data.olt_id || null
            };
        } else {
            return {
                success: false,
                data: [],
                error: data.error || 'Error al obtener srvprofiles'
            };
        }
    } catch (error) {
        console.error('Error al obtener srvprofiles:', error);
        return {
            success: false,
            data: [],
            error: error.message || 'Error de conexión'
        };
    }
}

/**
 * Obtiene ambos perfiles (lineprofiles y srvprofiles) para una OLT en una sola petición
 * @param {number} oltId - ID de la OLT (requerido)
 * @returns {Promise<{success: boolean, lineprofiles: Array, srvprofiles: Array, error?: string}>}
 */
export async function getOntProfiles(oltId) {
    if (!oltId) {
        return {
            success: false,
            lineprofiles: [],
            srvprofiles: [],
            error: 'Debe proporcionar olt_id como parámetro'
        };
    }

    try {
        const response = await fetch(`${API_SGISP}/ont_profiles?olt_id=${oltId}`);
        const data = await response.json();
        
        if (data.success) {
            return {
                success: true,
                lineprofiles: data.lineprofiles?.data || [],
                srvprofiles: data.srvprofiles?.data || [],
                lineprofilesTotal: data.lineprofiles?.total || 0,
                srvprofilesTotal: data.srvprofiles?.total || 0,
                olt_id: data.olt_id
            };
        } else {
            return {
                success: false,
                lineprofiles: [],
                srvprofiles: [],
                error: data.error || 'Error al obtener perfiles'
            };
        }
    } catch (error) {
        console.error('Error al obtener perfiles ONT:', error);
        return {
            success: false,
            lineprofiles: [],
            srvprofiles: [],
            error: error.message || 'Error de conexión'
        };
    }
}

