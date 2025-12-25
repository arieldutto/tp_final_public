import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearAbonado } from '../services/abonadoService';
import './crearabonado.css';

export default function CrearAbonadoPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Estado del formulario
    const [formData, setFormData] = useState({
        NumeroCliente: '',
        Razonsocial: '',
        Domicilio: '',
        Localidad: '',
        Telefono: '',
        Email: '',
        DNI: '',
        FechaAlta: ''
    });

    // Manejar cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar errores al escribir
        if (error) setError(null);
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Validación básica
        if (!formData.Razonsocial.trim()) {
            setError("El nombre o razón social es obligatorio");
            setLoading(false);
            return;
        }

        if (!formData.NumeroCliente.trim()) {
            setError("El número de cliente es obligatorio");
            setLoading(false);
            return;
        }

        // Validar que NumeroCliente sea un número válido
        const numeroCliente = parseInt(formData.NumeroCliente);
        if (isNaN(numeroCliente) || numeroCliente <= 0) {
            setError("El número de cliente debe ser un número entero positivo");
            setLoading(false);
            return;
        }

        if (!formData.Domicilio.trim()) {
            setError("El domicilio es obligatorio");
            setLoading(false);
            return;
        }

        try {
            const result = await crearAbonado(formData);

            if (result.ok) {
                setSuccess(true);
                // Limpiar formulario
                setFormData({
                    NumeroCliente: '',
                    Razonsocial: '',
                    Domicilio: '',
                    Localidad: '',
                    Telefono: '',
                    Email: '',
                    DNI: '',
                    FechaAlta: ''
                });

                // Redirigir después de 2 segundos
                setTimeout(() => {
                    navigate('/clientes');
                }, 2000);
            } else {
                setError(result.error || "Error al crear el abonado");
            }
        } catch (err) {
            setError(err.message || "Error inesperado al crear el abonado");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/clientes');
    };

    return (
        <div className="container py-4">
            <div className="crear-abonado-container">
                <div className="crear-abonado-card">
                    <div className="crear-abonado-header">
                        <div className="d-flex align-items-center">
                            <div className="crear-abonado-icon me-3">
                                <i className="bi bi-person-plus-fill"></i>
                            </div>
                            <div>
                                <h2 className="mb-0">Crear Nuevo Abonado</h2>
                                <small className="text-muted">Complete los datos del cliente</small>
                            </div>
                        </div>
                    </div>

                    <div className="crear-abonado-body">
                        {success && (
                            <div className="alert alert-success alert-dismissible fade show" role="alert">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                <strong>¡Éxito!</strong> El abonado se ha creado correctamente. Redirigiendo...
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

                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                {/* Razón Social / Nombre */}
                                <div className="col-md-6">
                                    <label htmlFor="Razonsocial" className="form-label">
                                        <i className="bi bi-person-fill me-2"></i>
                                        Razón Social / Nombre <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control glass-input"
                                        id="Razonsocial"
                                        name="Razonsocial"
                                        value={formData.Razonsocial}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ingrese el nombre o razón social"
                                    />
                                </div>

                                {/* Número de Cliente */}
                                <div className="col-md-6">
                                    <label htmlFor="NumeroCliente" className="form-label">
                                        <i className="bi bi-person-badge me-2"></i>
                                        Número de Cliente <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control glass-input"
                                        id="NumeroCliente"
                                        name="NumeroCliente"
                                        value={formData.NumeroCliente}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                        placeholder="Número único de cliente"
                                    />
                                    <small className="form-help-text">Debe ser un número único en el sistema</small>
                                </div>

                                {/* Domicilio */}
                                <div className="col-md-12">
                                    <label htmlFor="Domicilio" className="form-label">
                                        <i className="bi bi-geo-alt-fill me-2"></i>
                                        Domicilio <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control glass-input"
                                        id="Domicilio"
                                        name="Domicilio"
                                        value={formData.Domicilio}
                                        onChange={handleChange}
                                        required
                                        placeholder="Calle y número"
                                    />
                                </div>

                                {/* Localidad */}
                                <div className="col-md-12">
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
                                    <small className="form-help-text">Opcional. Formato: Localidad, Provincia, País (ejemplo: Coronel Baigorria, Cordoba, Argentina). Se usará para la geolocalización en el mapa</small>
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
                                    <small className="form-help-text">Opcional. Formato válido requerido si se proporciona</small>
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
                                        placeholder="Fecha de alta (YYYY-MM-DD)"
                                    />
                                    <small className="form-help-text">Opcional. Si se deja vacío, se usará la fecha actual</small>
                                </div>
                            </div>

                            <div className="crear-abonado-actions mt-4">
                                <button
                                    type="button"
                                    className="btn btn-secondary glass-btn"
                                    onClick={handleCancel}
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
                                            Creando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle me-2"></i>
                                            Crear Abonado
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

