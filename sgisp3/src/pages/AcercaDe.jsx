import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AcercaDe.css';

function AcercaDe() {
    const navigate = useNavigate();

    const features = [
        { icon: 'bi-wifi', label: 'Gestión de OLT y ONT en tiempo real' },
        { icon: 'bi-people', label: 'Administración de abonados y perfiles de servicio' },
        { icon: 'bi-gear', label: 'Automatización de tareas de configuración y diagnóstico' },
        { icon: 'bi-speedometer2', label: 'Dashboard con métricas y monitoreo en vivo' },
        { icon: 'bi-puzzle', label: 'Arquitectura modular, adaptable a distintos entornos' },
        { icon: 'bi-shield-lock', label: 'Control de accesos y registro de auditoría' },
        { icon: 'bi-globe', label: 'Interfaz web responsiva' }
    ];

    const socialLinks = [
        { icon: 'bi-instagram', name: 'Instagram', url: 'https://instagram.com/aadingenieria', color: '#E4405F' },
        { icon: 'bi-facebook', name: 'Facebook', url: 'https://facebook.com/aadingenieria', color: '#1877F2' },
        { icon: 'bi-discord', name: 'Discord', url: 'https://discord.gg/aadingenieria', color: '#5865F2' },
        { icon: 'bi-youtube', name: 'YouTube', url: 'https://youtube.com/@aadingenieria', color: '#FF0000' },
        { icon: 'bi-whatsapp', name: 'WhatsApp', url: 'https://wa.me/1234567890', color: '#25D366' },
        { icon: 'bi-twitter-x', name: 'X (Twitter)', url: 'https://twitter.com/aadingenieria', color: '#000000' }
    ];

    return (
        <div className="acerca-de-container">
            <div className="acerca-de-card">
                {/* Header con gradiente */}
                <div className="acerca-de-header">
                    <div className="acerca-de-header-content">
                        <div className="acerca-de-avatar">
                            <i className="bi bi-info-circle-fill"></i>
                        </div>
                        <div>
                            <h1 className="acerca-de-title">Sistema de Gestión de ISP</h1>
                            <p className="acerca-de-subtitle">SGISP 3</p>
                        </div>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="acerca-de-body">
                    <div className="acerca-de-description">
                        <p className="lead-text">
                            SGISP (Sistema de Gestión Integral para Servicios de Proveedores de Internet) es una plataforma diseñada para el control, monitoreo y administración de equipos OLT y ONT dentro de una red GPON.
                        </p>
                        <p className="regular-text">
                            Permite a los técnicos y administradores gestionar de forma centralizada los abonados, las conexiones y el estado de la red, optimizando el tiempo de respuesta y reduciendo errores operativos. Su interfaz intuitiva y modular facilita la integración con sistemas existentes y el crecimiento escalable del ISP.
                        </p>
                    </div>

                    <div className="acerca-de-divider"></div>

                    <div className="acerca-de-features">
                        <h3 className="features-title">Principales características</h3>
                        <div className="features-grid">
                            {features.map((feature, index) => (
                                <div key={index} className="feature-item">
                                    <div className="feature-icon">
                                        <i className={`bi ${feature.icon}`}></i>
                                    </div>
                                    <span className="feature-label">{feature.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="acerca-de-footer">
                    <div className="acerca-de-footer-content">
                        <p className="footer-text">
                            Creado por{' '}
                            <a
                                href="http://aadingenieria.com.ar"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="footer-link"
                            >
                                AAD Ingeniería SRL
                            </a>
                        </p>
                        <div className="social-links">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link"
                                    aria-label={social.name}
                                    style={{ '--social-color': social.color }}
                                >
                                    <i className={`bi ${social.icon}`}></i>
                                </a>
                            ))}
                        </div>
                    </div>
                    <button
                        className="acerca-de-btn"
                        onClick={() => navigate('/home')}
                    >
                        <i className="bi bi-house-door me-2"></i>
                        Ir a Home
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AcercaDe;
