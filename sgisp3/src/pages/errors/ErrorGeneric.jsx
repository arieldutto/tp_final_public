import React from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import './error.css';

export default function ErrorGeneric() {
    const navigate = useNavigate();
    const error = useRouteError();

    const getErrorInfo = () => {
        if (error?.status === 404) {
            return {
                code: '404',
                title: 'Página no encontrada',
                description: 'La página que buscas no existe.',
                icon: 'bi-exclamation-triangle-fill',
                iconClass: 'error-icon-404'
            };
        }
        
        if (error?.status === 500 || error?.status >= 500) {
            return {
                code: '500',
                title: 'Error del servidor',
                description: 'Ha ocurrido un error en el servidor. Por favor, intenta más tarde.',
                icon: 'bi-server',
                iconClass: 'error-icon-500'
            };
        }

        if (error?.status === 403) {
            return {
                code: '403',
                title: 'Acceso denegado',
                description: 'No tienes permisos para acceder a este recurso.',
                icon: 'bi-shield-lock-fill',
                iconClass: 'error-icon-403'
            };
        }

        if (error?.status === 401) {
            return {
                code: '401',
                title: 'No autorizado',
                description: 'Debes iniciar sesión para acceder a este recurso.',
                icon: 'bi-key-fill',
                iconClass: 'error-icon-401'
            };
        }

        // Error genérico
        return {
            code: 'Error',
            title: 'Algo salió mal',
            description: error?.message || 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.',
            icon: 'bi-exclamation-circle-fill',
            iconClass: 'error-icon-generic'
        };
    };

    const errorInfo = getErrorInfo();

    return (
        <div className="error-page-container">
            <div className="error-glass-card">
                <div className={`error-icon-wrapper ${errorInfo.iconClass}`}>
                    <i className={`bi ${errorInfo.icon}`}></i>
                </div>
                
                <div className="error-content">
                    <h1 className="error-code">{errorInfo.code}</h1>
                    <h2 className="error-title">{errorInfo.title}</h2>
                    <p className="error-description">
                        {errorInfo.description}
                    </p>
                    
                    {error?.statusText && (
                        <div className="error-details">
                            <small>{error.statusText}</small>
                        </div>
                    )}
                    
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

