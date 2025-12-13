import React from 'react';
import { useNavigate } from 'react-router-dom';
import './error.css';

export default function Error404() {
    const navigate = useNavigate();

    return (
        <div className="error-page-container">
            <div className="error-glass-card">
                <div className="error-icon-wrapper error-icon-404">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                </div>
                
                <div className="error-content">
                    <h1 className="error-code">404</h1>
                    <h2 className="error-title">Página no encontrada</h2>
                    <p className="error-description">
                        Lo sentimos, la página que estás buscando no existe o ha sido movida.
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

