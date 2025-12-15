import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGeocode } from '../hooks/useGeocode';
import './clientmap.css';

// Fix para los iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/**
 * Componente para ajustar el zoom del mapa cuando cambian las coordenadas
 */
function MapUpdater({ coordinates }) {
    const map = useMap();

    useEffect(() => {
        if (coordinates) {
            map.setView([coordinates.lat, coordinates.lng], 15);
        }
    }, [coordinates, map]);

    return null;
}

/**
 * Componente de mapa para mostrar la ubicación del cliente
 * @param {Object} cliente - Datos del cliente
 */
function ClientMap({ cliente }) {
    // Construir dirección completa
    const buildAddress = () => {
        if (!cliente) return '';

        const parts = [];
        if (cliente.Domicilio) parts.push(cliente.Domicilio);
        if (cliente.Localidad) parts.push(cliente.Localidad);
        if (cliente.Provincia) parts.push(cliente.Provincia);
        if (cliente.CodigoPostal) parts.push(cliente.CodigoPostal);

        return parts.join(', ');
    };

    const address = buildAddress();

    // Intentar obtener coordenadas directas o geocodificar
    const lat = cliente?.Latitud || cliente?.lat || null;
    const lng = cliente?.Longitud || cliente?.lng || cliente?.lon || null;

    const { coordinates, loading, error, isLocationFallback } = useGeocode(address, lat, lng);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando mapa...</span>
                    </div>
                    <p className="mt-2">Obteniendo ubicación...</p>
                </div>
            </div>
        );
    }

    if (error || !coordinates) {
        return (
            <div className="alert alert-warning" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>No se pudo obtener la ubicación:</strong> {error || 'Dirección no encontrada'}
                {address && (
                    <div className="mt-2">
                        <small>Dirección buscada: {address}</small>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="h-100">
            <div className="card client-map-card h-100 shadow-sm">
                <div className="card-header client-map-header">
                    <h5 className="mb-0">
                        <i className="bi bi-geo-alt-fill me-2"></i>
                        Ubicación del Cliente
                    </h5>
                </div>
                <div className="card-body p-0" style={{ height: 'calc(100% - 100px)', flex: 1, overflow: 'hidden' }}>
                    <div style={{ height: '100%', minHeight: '300px', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                        <MapContainer
                            center={[coordinates.lat, coordinates.lng]}
                            zoom={15}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={[coordinates.lat, coordinates.lng]}>
                                <Popup>
                                    <strong>{cliente?.Razonsocial || 'Cliente'}</strong>
                                    <br />
                                    {address}
                                </Popup>
                            </Marker>
                            <MapUpdater coordinates={coordinates} />
                        </MapContainer>
                    </div>
                </div>
                {address && (
                    <div className="card-footer bg-transparent border-top">
                        <small className="text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            <strong>Dirección:</strong> {address}
                            {isLocationFallback && (
                                <span className="ms-2 text-warning">
                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                    (Ubicación aproximada - mostrando localidad)
                                </span>
                            )}
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClientMap;

