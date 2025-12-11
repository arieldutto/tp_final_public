import React from 'react'
import ClientMap from './ClientMap'
import './clientinfo.css'

function clientInfo({ datos, idCliente }) {
    if (!datos) return <p>No hay datos de cliente para mostrar.</p>;

    return (
        <div className="client-info-container">
            <div className="row g-4">
                {/* Tarjeta de Información del Cliente */}
                <div className="col-lg-5">
                    <div className="card client-info-card h-100 shadow-sm">
                        <div className="card-header client-info-header">
                            <div className="d-flex align-items-center">
                                <div className="client-avatar me-3">
                                    <i className="bi bi-person-circle"></i>
                                </div>
                                <div>
                                    <h4 className="mb-0">{datos?.Razonsocial || 'Sin nombre'}</h4>
                                    <small className="text-muted">Cliente #{idCliente}</small>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="client-info-grid">
                                {/* ID del Cliente */}
                                <div className="info-item">
                                    <div className="info-icon">
                                        <i className="bi bi-hash"></i>
                                    </div>
                                    <div className="info-content">
                                        <span className="info-label">ID Cliente</span>
                                        <span className="info-value">{idCliente || 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Número de Cliente */}
                                {datos?.NumeroCliente && (
                                    <div className="info-item">
                                        <div className="info-icon">
                                            <i className="bi bi-person-badge"></i>
                                        </div>
                                        <div className="info-content">
                                            <span className="info-label">Número de Cliente</span>
                                            <span className="info-value">{datos.NumeroCliente}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Teléfono */}
                                {datos?.Telefono && (
                                    <div className="info-item">
                                        <div className="info-icon">
                                            <i className="bi bi-telephone-fill"></i>
                                        </div>
                                        <div className="info-content">
                                            <span className="info-label">Teléfono</span>
                                            <a href={`tel:${datos.Telefono}`} className="info-value info-link">
                                                {datos.Telefono}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Domicilio */}
                                {datos?.Domicilio && (
                                    <div className="info-item info-item-full">
                                        <div className="info-icon">
                                            <i className="bi bi-geo-alt-fill"></i>
                                        </div>
                                        <div className="info-content">
                                            <span className="info-label">Domicilio</span>
                                            <span className="info-value">{datos.Domicilio}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Localidad */}
                                {datos?.Localidad && (
                                    <div className="info-item">
                                        <div className="info-icon">
                                            <i className="bi bi-building"></i>
                                        </div>
                                        <div className="info-content">
                                            <span className="info-label">Localidad</span>
                                            <span className="info-value">{datos.Localidad}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Provincia */}
                                {datos?.Provincia && (
                                    <div className="info-item">
                                        <div className="info-icon">
                                            <i className="bi bi-geo-fill"></i>
                                        </div>
                                        <div className="info-content">
                                            <span className="info-label">Provincia</span>
                                            <span className="info-value">{datos.Provincia}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Código Postal */}
                                {datos?.CodigoPostal && (
                                    <div className="info-item">
                                        <div className="info-icon">
                                            <i className="bi bi-mailbox"></i>
                                        </div>
                                        <div className="info-content">
                                            <span className="info-label">Código Postal</span>
                                            <span className="info-value">{datos.CodigoPostal}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mapa de Ubicación */}
                <div className="col-lg-7">
                    <ClientMap cliente={datos} />
                </div>
            </div>
        </div>
    )
}

export default clientInfo