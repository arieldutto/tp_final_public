import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UnderConstruction.css';

export default function UnderConstruction() {
    const navigate = useNavigate();

    return (
        <div className="construction-page-container">
            <div className="construction-glass-card">
                <div className="construction-icon-wrapper">
                    <i className="bi bi-tools"></i>
                </div>

                <div className="construction-content">
                    <h1 className="construction-title">Página en Construcción</h1>
                    <p className="construction-description">
                        Estamos trabajando duro para traerte algo increíble.
                        Esta sección estará disponible pronto.
                    </p>

                    <div className="construction-features">
                        <div className="construction-feature">
                            <i className="bi bi-lightning-charge-fill"></i>
                            <span>Mejoras en progreso</span>
                        </div>
                        <div className="construction-feature">
                            <i className="bi bi-shield-check-fill"></i>
                            <span>Optimización continua</span>
                        </div>
                        <div className="construction-feature">
                            <i className="bi bi-star-fill"></i>
                            <span>Nuevas funcionalidades</span>
                        </div>
                    </div>

                    <div className="construction-actions">
                        <button
                            className="construction-btn construction-btn-primary"
                            onClick={() => navigate('/home')}
                        >
                            <i className="bi bi-house-door me-2"></i>
                            Volver al inicio
                        </button>
                        <button
                            className="construction-btn construction-btn-secondary"
                            onClick={() => navigate(-1)}
                        >
                            <i className="bi bi-arrow-left me-2"></i>
                            Volver atrás
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

