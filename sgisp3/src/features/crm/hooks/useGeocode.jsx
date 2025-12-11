import { useState, useEffect } from 'react';

/**
 * Hook para geocodificar una dirección (convertir dirección a coordenadas)
 * @param {string} address - Dirección a geocodificar
 * @param {number} lat - Latitud (si ya está disponible)
 * @param {number} lng - Longitud (si ya está disponible)
 * @returns {Object} { coordinates, loading, error }
 */
export function useGeocode(address, lat = null, lng = null) {
    const [coordinates, setCoordinates] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isLocationFallback, setIsLocationFallback] = useState(false);

    useEffect(() => {
        // Si ya tenemos coordenadas, usarlas directamente
        if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
            setCoordinates({ lat, lng });
            setLoading(false);
            return;
        }

        // Si no hay dirección, no hacer nada
        if (!address || address.trim() === '') {
            setCoordinates(null);
            setError('No se proporcionó una dirección');
            return;
        }

        // Geocodificar la dirección
        setLoading(true);
        setError(null);

        // Función para extraer localidad y provincia de la dirección
        const extractLocation = (address) => {
            // Intentar extraer localidad y provincia
            // Formato típico: "Calle, Localidad, Provincia, País"
            const parts = address.split(',').map(p => p.trim());

            if (parts.length >= 2) {
                const locationParts = [];

                // Si hay 2 partes: [Calle, Localidad] -> usar solo Localidad, Argentina
                if (parts.length === 2) {
                    locationParts.push(parts[1]); // Localidad
                    locationParts.push('Argentina');
                }
                // Si hay 3 partes: [Calle, Localidad, Provincia] -> usar Localidad, Provincia, Argentina
                else if (parts.length === 3) {
                    locationParts.push(parts[1]); // Localidad
                    locationParts.push(parts[2]); // Provincia
                    locationParts.push('Argentina');
                }
                // Si hay 4 o más partes: [Calle, Localidad, Provincia, País] -> usar Localidad, Provincia, País
                else if (parts.length >= 4) {
                    locationParts.push(parts[parts.length - 3]); // Localidad
                    locationParts.push(parts[parts.length - 2]); // Provincia
                    locationParts.push(parts[parts.length - 1]); // País
                }

                const locationAddress = locationParts.join(', ');

                // Solo retornar si es diferente a la dirección original
                if (locationAddress && locationAddress !== address) {
                    return locationAddress;
                }
            }

            return null;
        };

        // Usar Nominatim (OpenStreetMap) - Gratis, sin API key
        const geocodeAddress = async (addressToGeocode, isFallback = false) => {
            try {
                const encodedAddress = encodeURIComponent(addressToGeocode);
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=ar`;

                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'SGISP3-ClientMap/1.0' // Requerido por Nominatim
                    }
                });

                if (!response.ok) {
                    throw new Error('Error en la geocodificación');
                }

                const data = await response.json();

                if (data && data.length > 0) {
                    const result = data[0];
                    setCoordinates({
                        lat: parseFloat(result.lat),
                        lng: parseFloat(result.lon)
                    });
                    return true; // Éxito
                }

                return false; // No se encontró
            } catch (err) {
                console.error('Error geocodificando dirección:', err);
                return false;
            }
        };

        // Función principal de geocodificación con fallback
        const geocodeWithFallback = async () => {
            try {
                setIsLocationFallback(false);

                // Primero intentar con la dirección completa
                const success = await geocodeAddress(address, false);

                if (success) {
                    setLoading(false);
                    return;
                }

                // Si falla, intentar solo con localidad y provincia
                const locationAddress = extractLocation(address);
                if (locationAddress && locationAddress !== address) {
                    console.log('Dirección completa no encontrada, intentando con localidad:', locationAddress);

                    // Esperar un poco para evitar rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    const locationSuccess = await geocodeAddress(locationAddress, true);

                    if (locationSuccess) {
                        setIsLocationFallback(true); // Marcar que se usó fallback
                        setLoading(false);
                        return;
                    }
                }

                // Si ambos fallan, mostrar error
                setError('No se encontró la ubicación');
            } catch (err) {
                console.error('Error en geocodificación con fallback:', err);
                setError('Error al obtener la ubicación');
            } finally {
                setLoading(false);
            }
        };

        // Delay para evitar rate limiting de Nominatim (1 req/seg)
        const timeout = setTimeout(() => {
            geocodeWithFallback();
        }, 1000);

        return () => clearTimeout(timeout);
    }, [address, lat, lng]);

    return { coordinates, loading, error, isLocationFallback };
}

