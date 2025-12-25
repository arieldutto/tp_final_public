import React, { useState, useEffect } from 'react';
import { modificarAbonado } from '../services/abonadoService';
import './editarabonadomodal.css';

function EditarAbonadoModal({ isOpen, onClose, abonado, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Estado del formulario
    const [formData, setFormData] = useState({
        Razonsocial: '',
        NumeroCliente: '',
        Domicilio: '',
        Localidad: '',
        Telefono: '',
        Email: '',
        DNI: '',
        FechaAlta: ''
    });

    // Cargar datos del abonado cuando se abre el modal
    useEffect(() => {
        if (isOpen && abonado) {
            setFormData({
                Razonsocial: abonado.Razonsocial || '',
                NumeroCliente: abonado.NumeroCliente || '',
                Domicilio: abonado.Domicilio || '',
                Localidad: abonado.Localidad || '',
                Telefono: abonado.Telefono || '',
                Email: abonado.Email || '',
                DNI: abonado.DNI || '',
                FechaAlta: abonado.FechaAlta || ''
            });
            setError(null);
            setSuccess(false);
        }
    }, [isOpen, abonado]);

    // Manejar cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError(null);
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const result = await modificarAbonado(abonado.id, formData);

            if (result.ok) {
                setSuccess(true);
                // Llamar callback de éxito y cerrar después de un momento
                setTimeout(() => {
                    if (onSuccess) onSuccess(result.data);
                    onClose();
                }, 1500);
            } else {
                setError(result.error || "Error al modificar el abonado");
            }
        } catch (err) {
            setError(err.message || "Error inesperado al modificar el abonado");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="editar-abonado-modal-overlay" onClick={onClose}>
            <div className="editar-abonado-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="editar-abonado-modal-header">
                    <div className="d-flex align-items-center flex-grow-1">
                        <div className="editar-abonado-modal-icon me-3 flex-shrink-0">
                            <i className="bi bi-pencil-square"></i>
                        </div>
                        <div className="flex-grow-1 min-w-0">
                            <h2 className="mb-0">Editar Abonado</h2>
                            <small className="text-muted d-block">Modifique los datos que desee actualizar</small>
                        </div>
                    </div>
                    <button
                        className="editar-abonado-modal-close flex-shrink-0"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="editar-abonado-modal-body">
                    {success && (
                        <div className="alert alert-success alert-dismissible fade show" role="alert">
                            <i className="bi bi-check-circle-fill me-2"></i>
                            <strong>¡Éxito!</strong> El abonado se ha actualizado correctamente.
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            <strong>Error:</strong> {error}
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setError(null)}
                                aria-label="Close"
                            ></button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="editar-abonado-form">
                        <div className="row g-3">
                            {/* Razón Social / Nombre */}
                            <div className="col-md-6">
                                <label htmlFor="Razonsocial" className="form-label">
                                    <i className="bi bi-person-fill me-2"></i>
                                    Razón Social / Nombre
                                </label>
                                <input
                                    type="text"
                                    className="form-control glass-input"
                                    id="Razonsocial"
                                    name="Razonsocial"
                                    value={formData.Razonsocial}
                                    onChange={handleChange}
                                    placeholder="Ingrese el nombre o razón social"
                                />
                            </div>

                            {/* Número de Cliente */}
                            <div className="col-md-6">
                                <label htmlFor="NumeroCliente" className="form-label">
                                    <i className="bi bi-person-badge me-2"></i>
                                    Número de Cliente
                                </label>
                                <input
                                    type="number"
                                    className="form-control glass-input"
                                    id="NumeroCliente"
                                    name="NumeroCliente"
                                    value={formData.NumeroCliente}
                                    onChange={handleChange}
                                    min="1"
                                    placeholder="Número único de cliente"
                                />
                                <small className="form-help-text">Debe ser un número único en el sistema</small>
                            </div>

                            {/* Domicilio */}
                            <div className="col-md-12">
                                <label htmlFor="Domicilio" className="form-label">
                                    <i className="bi bi-geo-alt-fill me-2"></i>
                                    Domicilio
                                </label>
                                <input
                                    type="text"
                                    className="form-control glass-input"
                                    id="Domicilio"
                                    name="Domicilio"
                                    value={formData.Domicilio}
                                    onChange={handleChange}
                                    placeholder="Calle y número"
                                />
                            </div>

                            {/* Localidad */}
                            <div className="col-md-6">
                                <label htmlFor="Localidad" className="form-label">
                                    <i className="bi bi-building me-2"></i>
                                    Localidad
                                </label>
                                <input
                                    type="text"
                                    className="form-control glass-input"
                                    id="Localidad"
                                    name="Localidad"
                                    value={formData.Localidad}
                                    onChange={handleChange}
                                    placeholder="Coronel Baigorria, Cordoba, Argentina"
                                />
                                <small className="form-help-text">Formato: Localidad, Provincia, País</small>
                            </div>

                            {/* DNI */}
                            <div className="col-md-6">
                                <label htmlFor="DNI" className="form-label">
                                    <i className="bi bi-card-text me-2"></i>
                                    DNI / CUIT
                                </label>
                                <input
                                    type="text"
                                    className="form-control glass-input"
                                    id="DNI"
                                    name="DNI"
                                    value={formData.DNI}
                                    onChange={handleChange}
                                    placeholder="DNI o CUIT del cliente"
                                />
                            </div>

                            {/* Teléfono */}
                            <div className="col-md-6">
                                <label htmlFor="Telefono" className="form-label">
                                    <i className="bi bi-telephone-fill me-2"></i>
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    className="form-control glass-input"
                                    id="Telefono"
                                    name="Telefono"
                                    value={formData.Telefono}
                                    onChange={handleChange}
                                    placeholder="Teléfono de contacto"
                                />
                            </div>

                            {/* Email */}
                            <div className="col-md-6">
                                <label htmlFor="Email" className="form-label">
                                    <i className="bi bi-envelope-fill me-2"></i>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="form-control glass-input"
                                    id="Email"
                                    name="Email"
                                    value={formData.Email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                />
                                <small className="form-help-text">Formato válido requerido</small>
                            </div>

                            {/* Fecha de Alta */}
                            <div className="col-md-6">
                                <label htmlFor="FechaAlta" className="form-label">
                                    <i className="bi bi-calendar-event me-2"></i>
                                    Fecha de Alta
                                </label>
                                <input
                                    type="date"
                                    className="form-control glass-input"
                                    id="FechaAlta"
                                    name="FechaAlta"
                                    value={formData.FechaAlta}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="editar-abonado-modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary glass-btn"
                                onClick={onClose}
                                disabled={loading}
                            >
                                <i className="bi bi-x-circle me-2"></i>
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary glass-btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Actualizando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle me-2"></i>
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditarAbonadoModal;

