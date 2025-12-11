import React from 'react'
import { useServicio } from '../hooks/useServicio';
import './clientservices.css';

function ClientServices({ numclient }) {
    // Llamo al hooks para traer los datos del servicio
    const { servicio: DatosArray, loading, error } = useServicio({ numclient });

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando servicios...</span>
                    </div>
                    <p className="mt-2">Cargando información del servicio...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Error al cargar la información del servicio: {error}
            </div>
        );
    }

    const servicio = DatosArray && DatosArray.length > 0 ? DatosArray[0] : null;
    
    if (!servicio) {
        return (
            <div className="alert alert-info" role="alert">
                <i className="bi bi-info-circle-fill me-2"></i>
                No se encontró información de servicio para este cliente.
            </div>
        );
    }

    return (
        <div className="client-services-container">
            <div className="card client-services-card shadow-sm">
                <div className="card-header client-services-header">
                    <div className="d-flex align-items-center">
                        <div className="service-avatar me-3">
                            <i className="bi bi-router-fill"></i>
                        </div>
                        <div>
                            <h4 className="mb-0">Servicio de Red</h4>
                            <small className="text-muted">Información técnica del servicio</small>
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <div className="client-services-grid">
                        {/* Framed */}
                        {servicio.framed && (
                            <div className="service-item">
                                <div className="service-icon">
                                    <i className="bi bi-diagram-3-fill"></i>
                                </div>
                                <div className="service-content">
                                    <span className="service-label">Framed</span>
                                    <span className="service-value">{servicio.framed}</span>
                                </div>
                            </div>
                        )}

                        {/* Board */}
                        {servicio.board && (
                            <div className="service-item">
                                <div className="service-icon">
                                    <i className="bi bi-cpu-fill"></i>
                                </div>
                                <div className="service-content">
                                    <span className="service-label">Board</span>
                                    <span className="service-value">{servicio.board}</span>
                                </div>
                            </div>
                        )}

                        {/* PON */}
                        {servicio.pon && (
                            <div className="service-item">
                                <div className="service-icon">
                                    <i className="bi bi-broadcast"></i>
                                </div>
                                <div className="service-content">
                                    <span className="service-label">PON</span>
                                    <span className="service-value">{servicio.pon}</span>
                                </div>
                            </div>
                        )}

                        {/* ONT ID */}
                        {servicio.ont_id && (
                            <div className="service-item">
                                <div className="service-icon">
                                    <i className="bi bi-hash"></i>
                                </div>
                                <div className="service-content">
                                    <span className="service-label">ONT ID</span>
                                    <span className="service-value">{servicio.ont_id}</span>
                                </div>
                            </div>
                        )}

                        {/* Velocidad */}
                        {servicio.ont_mapping && (
                            <div className="service-item service-item-highlight">
                                <div className="service-icon service-icon-highlight">
                                    <i className="bi bi-speedometer2"></i>
                                </div>
                                <div className="service-content">
                                    <span className="service-label">Velocidad</span>
                                    <span className="service-value service-value-highlight">{servicio.ont_mapping}</span>
                                </div>
                            </div>
                        )}

                        {/* ONT Serial */}
                        {servicio.ont_sn && (
                            <div className="service-item service-item-full">
                                <div className="service-icon">
                                    <i className="bi bi-upc-scan"></i>
                                </div>
                                <div className="service-content">
                                    <span className="service-label">ONT Serial</span>
                                    <span className="service-value font-monospace">{servicio.ont_sn}</span>
                                </div>
                            </div>
                        )}

                        {/* VLAN Internet */}
                        {servicio.ont_vlan && (
                            <div className="service-item">
                                <div className="service-icon">
                                    <i className="bi bi-globe"></i>
                                </div>
                                <div className="service-content">
                                    <span className="service-label">VLAN Internet</span>
                                    <span className="service-value">{servicio.ont_vlan}</span>
                                </div>
                            </div>
                        )}

                        {/* VLAN Management */}
                        {servicio.mng_vlan && (
                            <div className="service-item">
                                <div className="service-icon">
                                    <i className="bi bi-gear-fill"></i>
                                </div>
                                <div className="service-content">
                                    <span className="service-label">VLAN Management</span>
                                    <span className="service-value">{servicio.mng_vlan}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ClientServices;