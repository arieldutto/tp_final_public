import React, { useState } from 'react'
import ClientMap from './ClientMap'
import EditarAbonadoModal from './EditarAbonadoModal'
import { eliminarAbonado } from '../services/abonadoService'
import { useNavigate } from 'react-router-dom'
import './clientinfo.css'

function clientInfo({ datos, idCliente, onUpdate }) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const navigate = useNavigate();

    if (!datos) return <p>No hay datos de cliente para mostrar.</p>;

    const handleEdit = () => {
        setShowEditModal(true);
    };

    const handleEditSuccess = (updatedData) => {
        if (onUpdate) {
            onUpdate(updatedData);
        }
        setShowEditModal(false);
    };

    const handleDelete = async () => {
        if (!window.confirm('¿Está seguro de que desea eliminar este abonado? Esta acción no se puede deshacer.')) {
            return;
        }

        setDeleting(true);
        setDeleteError(null);

        try {
            const result = await eliminarAbonado(idCliente);

            if (result.ok) {
                alert('Abonado eliminado exitosamente');
                // Redirigir al listado de clientes
                navigate('/clientes');
            } else {
                setDeleteError(result.error || 'Error al eliminar el abonado');
                if (result.error && result.error.includes('servicios asociados')) {
                    alert('⚠️ No se puede eliminar: El abonado tiene servicios asociados. Elimine primero los servicios.');
                } else {
                    alert('Error: ' + result.error);
                }
            }
        } catch (err) {
            setDeleteError(err.message || 'Error inesperado al eliminar el abonado');
            alert('Error: ' + err.message);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="client-info-container">
            <div className="row g-3" style={{ height: '100%' }}>
                {/* Tarjeta de Información del Cliente */}
                <div className="col-lg-5" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="card client-info-card shadow-sm" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="card-header client-info-header">
                            <div className="d-flex align-items-center justify-content-between w-100">
                                <div className="d-flex align-items-center">
                                    <div className="client-avatar me-3">
                                        <i className="bi bi-person-circle"></i>
                                    </div>
                                    <div>
                                        <h4 className="mb-0">{datos?.Razonsocial || 'Sin nombre'}</h4>
                                        <small className="text-muted">Cliente #{idCliente}</small>
                                    </div>
                                </div>
                                <div className="client-actions">
                                    <button
                                        className="btn btn-sm btn-primary glass-btn-action me-2"
                                        onClick={handleEdit}
                                        title="Editar abonado"
                                    >
                                        <i className="bi bi-pencil-square"></i>
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger glass-btn-action-danger"
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        title="Eliminar abonado"
                                    >
                                        {deleting ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            <i className="bi bi-trash"></i>
                                        )}
                                    </button>
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
                <div className="col-lg-7" style={{ display: 'flex', flexDirection: 'column' }}>
                    <ClientMap cliente={datos} />
                </div>
            </div>

            {/* Modal de Edición */}
            <EditarAbonadoModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                abonado={{ ...datos, id: idCliente }}
                onSuccess={handleEditSuccess}
            />
        </div>
    )
}

export default clientInfo