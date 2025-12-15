import React, { useState, useEffect } from 'react';
import { detectarONT, agregarONT } from '../services/ontService';
import { useConfiguracionesOLT } from '../hooks/useConfiguracionesOLT';
import './buscaront.css';

export default function BuscarOntPage() {
    const [detectando, setDetectando] = useState(false);
    const [agregando, setAgregando] = useState(false);
    const [ontDetectada, setOntDetectada] = useState(null);
    const [yaRegistrada, setYaRegistrada] = useState(false);
    const [error, setError] = useState(null);
    const [exito, setExito] = useState(null);
    const [registroExistente, setRegistroExistente] = useState(null);

    // Cargar configuraciones de OLT
    const { lineprofiles, srvprofiles, trafficMappings, loading: loadingConfigs, error: errorConfigs } = useConfiguracionesOLT();

    // Estado del formulario
    const [formData, setFormData] = useState({
        Desc: '',
        ont_lineprofile_id: '',
        ont_srvprofile_id: '',
        ont_downprofile_id: '',
        ont_modo: 'Router',
        ont_vlan: '300',
        mng_vlan: '200'
    });

    // Establecer valores por defecto cuando se cargan las configuraciones
    useEffect(() => {
        if (lineprofiles.length > 0 && !formData.ont_lineprofile_id) {
            setFormData(prev => ({ ...prev, ont_lineprofile_id: lineprofiles[0].profile_id }));
        }
        if (srvprofiles.length > 0 && !formData.ont_srvprofile_id) {
            setFormData(prev => ({ ...prev, ont_srvprofile_id: srvprofiles[0].profile_id }));
        }
        if (trafficMappings.length > 0 && !formData.ont_downprofile_id) {
            setFormData(prev => ({ ...prev, ont_downprofile_id: String(trafficMappings[0].id) }));
        }
    }, [lineprofiles, srvprofiles, trafficMappings]);

    // Manejar detección de ONT
    const handleDetectar = async () => {
        setDetectando(true);
        setError(null);
        setExito(null);
        setOntDetectada(null);
        setYaRegistrada(false);
        setRegistroExistente(null);

        try {
            const resultado = await detectarONT();

            if (resultado.ok) {
                if (resultado.detectada) {
                    if (resultado.ya_registrada) {
                        setYaRegistrada(true);
                        setOntDetectada(resultado.ont);
                        setRegistroExistente(resultado.registro_existente);
                        setError('Esta ONT ya está registrada en el sistema');
                    } else {
                        setOntDetectada(resultado.ont);
                        // Pre-llenar datos de la ONT detectada
                        setFormData(prev => ({
                            ...prev,
                            // Mantener los valores del formulario
                        }));
                    }
                } else {
                    setError('No se detectaron ONT nuevas. Asegúrese de que haya una ONT conectada físicamente a la OLT.');
                }
            } else {
                setError(resultado.error || 'Error al detectar ONT');
            }
        } catch (err) {
            setError('Error inesperado: ' + err.message);
        } finally {
            setDetectando(false);
        }
    };

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError(null);
    };

    // Manejar agregar ONT
    const handleAgregar = async (e) => {
        e.preventDefault();

        if (!ontDetectada) {
            setError('Primero debe detectar una ONT');
            return;
        }

        // Validación
        if (!formData.Desc || !formData.Desc.trim()) {
            setError('El ID del cliente es obligatorio');
            return;
        }

        setAgregando(true);
        setError(null);
        setExito(null);

        try {
            const datosAgregar = {
                ontsn: ontDetectada.serial,
                frame: ontDetectada.frame,
                slot: ontDetectada.slot,
                port: ontDetectada.port,
                Desc: formData.Desc,
                ont_lineprofile_id: formData.ont_lineprofile_id,
                ont_srvprofile_id: formData.ont_srvprofile_id,
                ont_downprofile_id: parseInt(formData.ont_downprofile_id),
                ont_modo: formData.ont_modo,
                ont_vlan: formData.ont_vlan || '300',
                mng_vlan: formData.mng_vlan || '200'
            };

            const resultado = await agregarONT(datosAgregar);

            if (resultado.ok) {
                setExito('ONT agregada exitosamente');
                // Limpiar formulario y ONT detectada
                setOntDetectada(null);
                setFormData({
                    Desc: '',
                    ont_lineprofile_id: '1',
                    ont_srvprofile_id: '1',
                    ont_downprofile_id: '1',
                    ont_modo: 'Router',
                    ont_vlan: '300',
                    mng_vlan: '200'
                });
            } else {
                setError(resultado.error || 'Error al agregar ONT');
            }
        } catch (err) {
            setError('Error inesperado: ' + err.message);
        } finally {
            setAgregando(false);
        }
    };

    const handleNuevaBusqueda = () => {
        setOntDetectada(null);
        setYaRegistrada(false);
        setRegistroExistente(null);
        setError(null);
        setExito(null);
        setFormData({
            Desc: '',
            ont_lineprofile_id: lineprofiles.length > 0 ? lineprofiles[0].profile_id : '',
            ont_srvprofile_id: srvprofiles.length > 0 ? srvprofiles[0].profile_id : '',
            ont_downprofile_id: trafficMappings.length > 0 ? String(trafficMappings[0].id) : '',
            ont_modo: 'Router',
            ont_vlan: '300',
            mng_vlan: '200'
        });
    };

    // Obtener información del perfil de tráfico seleccionado
    const selectedTrafficMapping = formData.ont_downprofile_id 
        ? trafficMappings.find(m => String(m.id) === formData.ont_downprofile_id)
        : null;

    return (
        <div className="container py-4">
            <div className="buscar-ont-container">
                <div className="buscar-ont-card">
                    <div className="buscar-ont-header">
                        <div className="d-flex align-items-center">
                            <div className="buscar-ont-icon me-3">
                                <i className="bi bi-search"></i>
                            </div>
                            <div>
                                <h2 className="mb-0">Buscar y Agregar ONT</h2>
                                <small className="text-muted">Detecta ONT nuevas conectadas a la OLT</small>
                            </div>
                        </div>
                    </div>

                    <div className="buscar-ont-body">
                        {/* Mensaje de carga de configuraciones */}
                        {loadingConfigs && (
                            <div className="alert alert-info" role="alert">
                                <i className="bi bi-hourglass-split me-2"></i>
                                Cargando configuraciones de la OLT...
                            </div>
                        )}

                        {/* Error al cargar configuraciones */}
                        {errorConfigs && (
                            <div className="alert alert-warning" role="alert">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                <strong>Advertencia:</strong> {errorConfigs}. Algunas opciones pueden no estar disponibles.
                            </div>
                        )}

                        {/* Mensajes de éxito/error */}
                        {exito && (
                            <div className="alert alert-success alert-dismissible fade show" role="alert">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                <strong>¡Éxito!</strong> {exito}
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setExito(null)}
                                    aria-label="Close"
                                ></button>
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

                        {/* Botón de detección */}
                        {!ontDetectada && (
                            <div className="detectar-section">
                                <div className="text-center mb-4">
                                    <p className="mb-4">Haga clic en el botón para detectar ONT nuevas conectadas físicamente a la OLT.</p>
                                    <button
                                        className="btn btn-primary glass-btn-primary btn-lg"
                                        onClick={handleDetectar}
                                        disabled={detectando}
                                    >
                                        {detectando ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Detectando ONT...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-search me-2"></i>
                                                Detectar ONT
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Información de ONT detectada */}
                        {ontDetectada && (
                            <div className="ont-detectada-section">
                                <div className="ont-info-card">
                                    <div className="ont-info-header">
                                        <h4>
                                            <i className="bi bi-router me-2"></i>
                                            ONT Detectada
                                        </h4>
                                        {!yaRegistrada && (
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={handleNuevaBusqueda}
                                            >
                                                <i className="bi bi-arrow-left me-1"></i>
                                                Nueva Búsqueda
                                            </button>
                                        )}
                                    </div>
                                    <div className="ont-info-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="info-item">
                                                    <span className="info-label">
                                                        <i className="bi bi-upc-scan me-2"></i>
                                                        Serial:
                                                    </span>
                                                    <span className="info-value font-monospace">{ontDetectada.serial}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-item">
                                                    <span className="info-label">
                                                        <i className="bi bi-geo-alt me-2"></i>
                                                        Ubicación (F/S/P):
                                                    </span>
                                                    <span className="info-value font-monospace">{ontDetectada.fsnp}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="info-item">
                                                    <span className="info-label">Frame:</span>
                                                    <span className="info-value">{ontDetectada.frame}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="info-item">
                                                    <span className="info-label">Slot:</span>
                                                    <span className="info-value">{ontDetectada.slot}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="info-item">
                                                    <span className="info-label">Port:</span>
                                                    <span className="info-value">{ontDetectada.port}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Información si ya está registrada */}
                                        {yaRegistrada && registroExistente && (
                                            <div className="alert alert-warning mt-3">
                                                <i className="bi bi-info-circle me-2"></i>
                                                <strong>Esta ONT ya está registrada:</strong>
                                                <ul className="mb-0 mt-2">
                                                    <li>ID: {registroExistente.id}</li>
                                                    <li>Cliente ID: {registroExistente.descripcion}</li>
                                                </ul>
                                            </div>
                                        )}

                                        {/* Formulario para agregar ONT */}
                                        {!yaRegistrada && (
                                            <form onSubmit={handleAgregar} className="mt-4">
                                                <h5 className="mb-3">
                                                    <i className="bi bi-plus-circle me-2"></i>
                                                    Configuración de la ONT
                                                </h5>
                                                <div className="row g-3">
                                                    {/* ID Cliente */}
                                                    <div className="col-md-6">
                                                        <label htmlFor="Desc" className="form-label">
                                                            <i className="bi bi-person-badge me-2"></i>
                                                            ID Cliente <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            className="form-control glass-input"
                                                            id="Desc"
                                                            name="Desc"
                                                            value={formData.Desc}
                                                            onChange={handleChange}
                                                            required
                                                            min="1"
                                                            placeholder="ID del cliente"
                                                        />
                                                        <small className="form-help-text">ID numérico del cliente al que se asignará esta ONT</small>
                                                    </div>

                                                    {/* Modo */}
                                                    <div className="col-md-6">
                                                        <label htmlFor="ont_modo" className="form-label">
                                                            <i className="bi bi-diagram-3 me-2"></i>
                                                            Modo <span className="text-danger">*</span>
                                                        </label>
                                                        <select
                                                            className="form-control glass-input"
                                                            id="ont_modo"
                                                            name="ont_modo"
                                                            value={formData.ont_modo}
                                                            onChange={handleChange}
                                                            required
                                                        >
                                                            <option value="Router">Router</option>
                                                            <option value="Bridge">Bridge</option>
                                                        </select>
                                                        <small className="form-help-text">Modo de operación de la ONT</small>
                                                    </div>

                                                    {/* Lineprofile */}
                                                    <div className="col-md-4">
                                                        <label htmlFor="ont_lineprofile_id" className="form-label">
                                                            <i className="bi bi-list-ul me-2"></i>
                                                            Lineprofile <span className="text-danger">*</span>
                                                        </label>
                                                        <select
                                                            className="form-control glass-input"
                                                            id="ont_lineprofile_id"
                                                            name="ont_lineprofile_id"
                                                            value={formData.ont_lineprofile_id}
                                                            onChange={handleChange}
                                                            required
                                                            disabled={loadingConfigs || lineprofiles.length === 0}
                                                        >
                                                            {loadingConfigs ? (
                                                                <option>Cargando...</option>
                                                            ) : lineprofiles.length === 0 ? (
                                                                <option>No hay perfiles disponibles</option>
                                                            ) : (
                                                                <>
                                                                    <option value="">Seleccione un lineprofile</option>
                                                                    {lineprofiles.map(profile => (
                                                                        <option key={profile.id} value={profile.profile_id}>
                                                                            {profile.profile_coment || profile.profile_name} (ID: {profile.profile_id})
                                                                        </option>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </select>
                                                        <small className="form-help-text">Perfil de línea para la ONT</small>
                                                    </div>

                                                    {/* Srvprofile */}
                                                    <div className="col-md-4">
                                                        <label htmlFor="ont_srvprofile_id" className="form-label">
                                                            <i className="bi bi-list-ul me-2"></i>
                                                            Srvprofile <span className="text-danger">*</span>
                                                        </label>
                                                        <select
                                                            className="form-control glass-input"
                                                            id="ont_srvprofile_id"
                                                            name="ont_srvprofile_id"
                                                            value={formData.ont_srvprofile_id}
                                                            onChange={handleChange}
                                                            required
                                                            disabled={loadingConfigs || srvprofiles.length === 0}
                                                        >
                                                            {loadingConfigs ? (
                                                                <option>Cargando...</option>
                                                            ) : srvprofiles.length === 0 ? (
                                                                <option>No hay perfiles disponibles</option>
                                                            ) : (
                                                                <>
                                                                    <option value="">Seleccione un srvprofile</option>
                                                                    {srvprofiles.map(profile => (
                                                                        <option key={profile.id} value={profile.profile_id}>
                                                                            {profile.profile_coment || profile.profile_name} (ID: {profile.profile_id})
                                                                        </option>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </select>
                                                        <small className="form-help-text">Perfil de servicio para la ONT</small>
                                                    </div>

                                                    {/* Perfil de Tráfico */}
                                                    <div className="col-md-4">
                                                        <label htmlFor="ont_downprofile_id" className="form-label">
                                                            <i className="bi bi-speedometer2 me-2"></i>
                                                            Perfil de Tráfico <span className="text-danger">*</span>
                                                        </label>
                                                        <select
                                                            className="form-control glass-input"
                                                            id="ont_downprofile_id"
                                                            name="ont_downprofile_id"
                                                            value={formData.ont_downprofile_id}
                                                            onChange={handleChange}
                                                            required
                                                            disabled={loadingConfigs || trafficMappings.length === 0}
                                                        >
                                                            {loadingConfigs ? (
                                                                <option>Cargando...</option>
                                                            ) : trafficMappings.length === 0 ? (
                                                                <option>No hay perfiles disponibles</option>
                                                            ) : (
                                                                <>
                                                                    <option value="">Seleccione un perfil de tráfico</option>
                                                                    {trafficMappings.map(mapping => (
                                                                        <option key={mapping.id} value={mapping.id}>
                                                                            {mapping.profile_name} - 
                                                                            {mapping.upload?.traffic_name || 'N/A'} ↑ / 
                                                                            {mapping.download?.traffic_name || 'N/A'} ↓
                                                                        </option>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </select>
                                                        {selectedTrafficMapping ? (
                                                            <small className="form-help-text">
                                                                {selectedTrafficMapping.comments || `Upload: ${selectedTrafficMapping.upload?.traffic_name || 'N/A'} / Download: ${selectedTrafficMapping.download?.traffic_name || 'N/A'}`}
                                                            </small>
                                                        ) : (
                                                            <small className="form-help-text">Seleccione un perfil de tráfico para ver los detalles</small>
                                                        )}
                                                    </div>

                                                    {/* VLAN Datos */}
                                                    <div className="col-md-6">
                                                        <label htmlFor="ont_vlan" className="form-label">
                                                            <i className="bi bi-hdd-network me-2"></i>
                                                            VLAN Datos
                                                        </label>
                                                        <select
                                                            className="form-control glass-input"
                                                            id="ont_vlan"
                                                            name="ont_vlan"
                                                            value={formData.ont_vlan}
                                                            onChange={handleChange}
                                                        >
                                                            <option value="100">100</option>
                                                            <option value="200">200</option>
                                                            <option value="300">300</option>
                                                            <option value="400">400</option>
                                                        </select>
                                                        <small className="form-help-text">VLAN para tráfico de datos (por defecto: 300)</small>
                                                    </div>

                                                    {/* VLAN Management */}
                                                    <div className="col-md-6">
                                                        <label htmlFor="mng_vlan" className="form-label">
                                                            <i className="bi bi-gear me-2"></i>
                                                            VLAN Management
                                                        </label>
                                                        <select
                                                            className="form-control glass-input"
                                                            id="mng_vlan"
                                                            name="mng_vlan"
                                                            value={formData.mng_vlan}
                                                            onChange={handleChange}
                                                        >
                                                            <option value="100">100</option>
                                                            <option value="200">200</option>
                                                            <option value="300">300</option>
                                                            <option value="400">400</option>
                                                        </select>
                                                        <small className="form-help-text">VLAN para management (por defecto: 200)</small>
                                                    </div>
                                                </div>

                                                <div className="buscar-ont-actions mt-4">
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary glass-btn"
                                                        onClick={handleNuevaBusqueda}
                                                        disabled={agregando}
                                                    >
                                                        <i className="bi bi-x-circle me-2"></i>
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary glass-btn-primary"
                                                        disabled={agregando}
                                                    >
                                                        {agregando ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                Agregando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="bi bi-check-circle me-2"></i>
                                                                Agregar ONT
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

