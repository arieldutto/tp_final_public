import React, { useState, useEffect } from 'react';
import { API_SGISP } from '../../../config';
import './oltlist.css';

function OltListPage() {
    const [olts, setOlts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarOLTs = async () => {
            try {
                setLoading(true);
                setError(null);

                try {
                    const response = await fetch(`${API_SGISP}/olts`);

                    // Si el endpoint no existe (404) o hay error del servidor, simplemente no hay OLTs
                    if (!response.ok) {
                        if (response.status === 404) {
                            // Endpoint no existe aún, no es un error
                            console.info('Endpoint /olts no disponible aún. El sistema funcionará sin selección de OLT.');
                            setOlts([]);
                        } else {
                            // Otro error del servidor
                            const errorData = await response.json().catch(() => ({}));
                            console.warn('Error al cargar OLTs:', errorData.error || `HTTP ${response.status}`);
                            setOlts([]);
                        }
                    } else {
                        const data = await response.json();
                        if (data.success || data.data) {
                            setOlts(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
                        } else {
                            setOlts([]);
                        }
                    }
                } catch (networkError) {
                    // Error de red (CORS, conexión, etc.)
                    // Si es un error de CORS, el endpoint probablemente no está configurado aún en el backend
                    if (networkError.message.includes('CORS') || networkError.message.includes('fetch')) {
                        console.info('Endpoint /olts no disponible o bloqueado por CORS. El sistema funcionará sin selección de OLT (modo compatibilidad).');
                    } else {
                        console.warn('No se pudo conectar al endpoint /olts:', networkError.message);
                    }
                    setOlts([]);
                }
            } catch (err) {
                console.error('Error inesperado al cargar OLTs:', err);
                setOlts([]);
            } finally {
                setLoading(false);
            }
        };

        cargarOLTs();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="text-light">Cargando lista de OLTs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="olt-list-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-light">
                    <i className="bi bi-router me-2"></i>
                    Gestión de OLTs
                </h2>
            </div>

            {olts.length === 0 ? (
                <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    No hay OLTs configuradas en el sistema.
                    <br />
                    <small className="text-muted">
                        Si el endpoint /olts no está disponible aún, el sistema funcionará sin selección de OLT (modo de compatibilidad).
                    </small>
                </div>
            ) : (
                <div className="row">
                    {olts.map((olt) => (
                        <div key={olt.id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card glass-card">
                                <div className="card-body">
                                    <h5 className="card-title">
                                        <i className="bi bi-router me-2"></i>
                                        {olt.nombre || `OLT ${olt.id}`}
                                    </h5>
                                    <p className="card-text">
                                        <small className="text-muted">ID: {olt.id}</small>
                                    </p>
                                    {olt.descripcion && (
                                        <p className="card-text">{olt.descripcion}</p>
                                    )}
                                    <div className="mt-3">
                                        <a
                                            href={`/olt/${olt.id}/perfiles`}
                                            className="btn btn-primary btn-sm me-2"
                                        >
                                            <i className="bi bi-gear me-1"></i>
                                            Ver Perfiles
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default OltListPage;

