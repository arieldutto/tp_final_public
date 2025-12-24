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
                        console.log('📊 Respuesta completa de /olts:', data);

                        // Intentar diferentes formas de obtener los datos
                        let oltsArray = [];
                        if (data.success && data.data && Array.isArray(data.data)) {
                            oltsArray = data.data;
                        } else if (Array.isArray(data.data)) {
                            oltsArray = data.data;
                        } else if (Array.isArray(data)) {
                            oltsArray = data;
                        }

                        console.log('📋 OLTs parseadas:', oltsArray);
                        console.log('📋 Total de OLTs:', oltsArray.length);

                        if (oltsArray.length > 0) {
                            console.log('📋 Primera OLT:', oltsArray[0]);
                        }

                        setOlts(oltsArray);
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
                <>
                    {/* Debug temporal - mostrar datos crudos */}
                    {process.env.NODE_ENV === 'development' && olts.length > 0 && (
                        <div className="alert alert-warning mb-3">
                            <details>
                                <summary>🔍 Debug: Datos recibidos (click para expandir)</summary>
                                <pre className="mt-2 mb-0" style={{ fontSize: '0.8rem', maxHeight: '200px', overflow: 'auto' }}>
                                    {JSON.stringify(olts, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}
                </>
            )}

            {olts.length > 0 && (
                <div className="row">
                    {olts.map((olt) => (
                        <div key={olt.id} className="col-md-6 col-lg-4 mb-4">
                            <div className={`card glass-card ${olt.is_active ? 'border-success' : 'border-secondary'}`}>
                                <div className="card-body">
                                    {/* Debug temporal para esta OLT */}
                                    {process.env.NODE_ENV === 'development' && (
                                        <small className="text-muted d-block mb-2">
                                            ID: {olt.id} | Keys: {Object.keys(olt).join(', ')}
                                        </small>
                                    )}

                                    {/* Header con nombre y badges */}
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h5 className="card-title mb-0">
                                            <i className="bi bi-router me-2"></i>
                                            {olt.olt_name || olt.nombre || `OLT ${olt.id}`}
                                        </h5>
                                        <div className="d-flex flex-column gap-1">
                                            {olt.is_default && (
                                                <span className="badge bg-warning text-dark">
                                                    <i className="bi bi-star-fill me-1"></i>
                                                    Por Defecto
                                                </span>
                                            )}
                                            {olt.is_active ? (
                                                <span className="badge bg-success">
                                                    <i className="bi bi-check-circle me-1"></i>
                                                    Activa
                                                </span>
                                            ) : (
                                                <span className="badge bg-secondary">
                                                    <i className="bi bi-x-circle me-1"></i>
                                                    Inactiva
                                                </span>
                                            )}
                                            {olt.is_configured && (
                                                <span className="badge bg-info">
                                                    <i className="bi bi-gear-fill me-1"></i>
                                                    Configurada
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Descripción */}
                                    {(olt.description || olt.descripcion) && (
                                        <p className="card-text mb-3 text-muted small">
                                            <i className="bi bi-info-circle me-1"></i>
                                            {olt.description || olt.descripcion}
                                        </p>
                                    )}

                                    <div className="olt-info-details">
                                        {/* Información de conexión */}
                                        {(olt.olt_host || olt.ip || olt.olt_user || olt.usuario || olt.vendor || olt.model || olt.modelo) && (
                                            <div className="mb-3">
                                                <h6 className="text-light border-bottom border-secondary pb-1 mb-2">
                                                    <i className="bi bi-wifi me-2"></i>
                                                    Conexión
                                                </h6>
                                                {(olt.olt_host || olt.ip) && (
                                                    <p className="card-text mb-2">
                                                        <i className="bi bi-globe me-1 text-primary"></i>
                                                        <strong>IP/Host:</strong> <code className="text-light">{olt.olt_host || olt.ip}</code>
                                                    </p>
                                                )}
                                                {(olt.olt_user || olt.usuario) && (
                                                    <p className="card-text mb-2">
                                                        <i className="bi bi-person me-1 text-info"></i>
                                                        <strong>Usuario:</strong> <span className="text-light">{olt.olt_user || olt.usuario}</span>
                                                    </p>
                                                )}
                                                {olt.vendor && (
                                                    <p className="card-text mb-2">
                                                        <i className="bi bi-tag me-1 text-success"></i>
                                                        <strong>Fabricante:</strong>
                                                        <span className="badge bg-primary ms-2">{olt.vendor}</span>
                                                    </p>
                                                )}
                                                {(olt.model || olt.modelo) && (
                                                    <p className="card-text mb-2">
                                                        <i className="bi bi-cpu me-1 text-warning"></i>
                                                        <strong>Modelo:</strong>
                                                        <span className="badge bg-info ms-2">{olt.model || olt.modelo}</span>
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Configuración de Red */}
                                        <div className="mb-3">
                                            <h6 className="text-light border-bottom border-secondary pb-1 mb-2">
                                                <i className="bi bi-diagram-3 me-2"></i>
                                                Red
                                            </h6>
                                            {olt.vlan_management !== undefined && (
                                                <p className="card-text mb-2">
                                                    <i className="bi bi-hdd-network me-1 text-primary"></i>
                                                    <strong>VLAN Management:</strong>
                                                    <span className="badge bg-secondary ms-2">{olt.vlan_management}</span>
                                                </p>
                                            )}
                                            {olt.vlan_internet_list && olt.vlan_internet_list.length > 0 && (
                                                <p className="card-text mb-2">
                                                    <i className="bi bi-router me-1 text-success"></i>
                                                    <strong>VLANs Internet:</strong>
                                                    <span className="text-light ms-2">
                                                        {olt.vlan_internet_list.join(', ')}
                                                        {olt.vlan_internet_count && (
                                                            <span className="badge bg-info ms-2">{olt.vlan_internet_count}</span>
                                                        )}
                                                    </span>
                                                </p>
                                            )}
                                            {(olt.gemport_management !== undefined || olt.gemport_internet !== undefined) && (
                                                <div className="ms-4 mt-2">
                                                    {olt.gemport_management !== undefined && (
                                                        <small className="text-muted d-block">
                                                            <i className="bi bi-circle me-1"></i>
                                                            Gemport Management: <code>{olt.gemport_management}</code>
                                                        </small>
                                                    )}
                                                    {olt.gemport_internet !== undefined && (
                                                        <small className="text-muted d-block">
                                                            <i className="bi bi-circle me-1"></i>
                                                            Gemport Internet: <code>{olt.gemport_internet}</code>
                                                        </small>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Perfiles ONT */}
                                        {olt.profiles && (
                                            <div className="mb-3">
                                                <h6 className="text-light border-bottom border-secondary pb-1 mb-2">
                                                    <i className="bi bi-list-ul me-2"></i>
                                                    Perfiles ONT
                                                </h6>
                                                {olt.profiles.lineprofiles && (
                                                    <p className="card-text mb-2">
                                                        <i className="bi bi-list-check me-1 text-primary"></i>
                                                        <strong>Lineprofiles:</strong>
                                                        <span className="text-light ms-2">
                                                            {olt.profiles.lineprofiles.total} total
                                                            {olt.profiles.lineprofiles.global > 0 && (
                                                                <span className="badge bg-success ms-2">{olt.profiles.lineprofiles.global} global</span>
                                                            )}
                                                            {olt.profiles.lineprofiles.specific > 0 && (
                                                                <span className="badge bg-info ms-2">{olt.profiles.lineprofiles.specific} específicos</span>
                                                            )}
                                                        </span>
                                                    </p>
                                                )}
                                                {olt.profiles.srvprofiles && (
                                                    <p className="card-text mb-2">
                                                        <i className="bi bi-list-check me-1 text-success"></i>
                                                        <strong>Srvprofiles:</strong>
                                                        <span className="text-light ms-2">
                                                            {olt.profiles.srvprofiles.total} total
                                                            {olt.profiles.srvprofiles.global > 0 && (
                                                                <span className="badge bg-success ms-2">{olt.profiles.srvprofiles.global} global</span>
                                                            )}
                                                            {olt.profiles.srvprofiles.specific > 0 && (
                                                                <span className="badge bg-info ms-2">{olt.profiles.srvprofiles.specific} específicos</span>
                                                            )}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Perfiles de Tráfico */}
                                        {olt.traffic_profiles && (
                                            <div className="mb-3">
                                                <h6 className="text-light border-bottom border-secondary pb-1 mb-2">
                                                    <i className="bi bi-speedometer2 me-2"></i>
                                                    Perfiles de Tráfico
                                                </h6>
                                                {olt.traffic_profiles.tables && (
                                                    <p className="card-text mb-2">
                                                        <i className="bi bi-table me-1 text-warning"></i>
                                                        <strong>Tablas:</strong>
                                                        <span className="text-light ms-2">
                                                            {olt.traffic_profiles.tables.total} total
                                                            {olt.traffic_profiles.tables.global > 0 && (
                                                                <span className="badge bg-success ms-2">{olt.traffic_profiles.tables.global} global</span>
                                                            )}
                                                            {olt.traffic_profiles.tables.specific > 0 && (
                                                                <span className="badge bg-info ms-2">{olt.traffic_profiles.tables.specific} específicas</span>
                                                            )}
                                                        </span>
                                                    </p>
                                                )}
                                                {olt.traffic_profiles.mappings && (
                                                    <p className="card-text mb-2">
                                                        <i className="bi bi-arrow-left-right me-1 text-info"></i>
                                                        <strong>Mapeos:</strong>
                                                        <span className="text-light ms-2">
                                                            {olt.traffic_profiles.mappings.total} total
                                                            {olt.traffic_profiles.mappings.global > 0 && (
                                                                <span className="badge bg-success ms-2">{olt.traffic_profiles.mappings.global} global</span>
                                                            )}
                                                            {olt.traffic_profiles.mappings.specific > 0 && (
                                                                <span className="badge bg-info ms-2">{olt.traffic_profiles.mappings.specific} específicos</span>
                                                            )}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Acciones */}
                                    <div className="mt-3 pt-3 border-top border-secondary">
                                        <a
                                            href={`/olt/${olt.id}/perfiles`}
                                            className="btn btn-primary btn-sm me-2"
                                        >
                                            <i className="bi bi-gear me-1"></i>
                                            Ver Perfiles
                                        </a>
                                        {olt.created_on && (
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-calendar me-1"></i>
                                                Creada: {new Date(olt.created_on).toLocaleDateString('es-AR')}
                                                {olt.modified_on && (
                                                    <span className="ms-3">
                                                        <i className="bi bi-pencil me-1"></i>
                                                        Modificada: {new Date(olt.modified_on).toLocaleDateString('es-AR')}
                                                    </span>
                                                )}
                                            </small>
                                        )}
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

