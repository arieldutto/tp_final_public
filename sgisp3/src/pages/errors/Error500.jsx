import React from 'react';
import { useNavigate } from 'react-router-dom';
import './error.css';

export default function Error500() {
    const navigate = useNavigate();

    return (
        <div className="error-page-container">
            <div className="error-glass-card">
                <div className="error-icon-wrapper error-icon-500">
                    <i className="bi bi-server"></i>
                </div>
                
                <div className="error-content">
                    <h1 className="error-code">500</h1>
                    <h2 className="error-title">Error del servidor</h2>
                    <p className="error-description">
                        Ha ocurrido un error interno en el servidor. Nuestro equipo ha sido notificado y está trabajando para solucionarlo.
                    </p>
                    
                    <div className="error-actions">
                        <button 
                            className="error-btn error-btn-primary"
                            onClick={() => navigate('/home')}
                        >
                            <i className="bi bi-house-door me-2"></i>
                            Ir al inicio
                        </button>
                        <button 
                            className="error-btn error-btn-secondary"
                            onClick={() => window.location.reload()}
                        >
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            Recargar página
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

