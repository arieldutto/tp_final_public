import React from 'react';
import { getAllChangelogs, getCurrentVersion } from '../data/changelog';
import './ChangelogModal.css';

function ChangelogModal({ isOpen, onClose }) {
    const changelogs = getAllChangelogs();
    const currentVersion = getCurrentVersion();

    if (!isOpen) return null;

    const getTypeIcon = (type) => {
        switch (type) {
            case 'feature':
                return 'bi-plus-circle-fill';
            case 'improvement':
                return 'bi-arrow-up-circle-fill';
            case 'fix':
                return 'bi-bug-fill';
            case 'security':
                return 'bi-shield-fill-check';
            default:
                return 'bi-circle-fill';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'feature':
                return 'changelog-feature';
            case 'improvement':
                return 'changelog-improvement';
            case 'fix':
                return 'changelog-fix';
            case 'security':
                return 'changelog-security';
            default:
                return '';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'feature':
                return 'Nueva Funcionalidad';
            case 'improvement':
                return 'Mejora';
            case 'fix':
                return 'Corrección';
            case 'security':
                return 'Seguridad';
            default:
                return 'Cambio';
        }
    };

    return (
        <div className="changelog-modal-overlay" onClick={onClose}>
            <div className="changelog-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="changelog-modal-header">
                    <div className="d-flex align-items-center">
                        <div className="changelog-modal-icon me-3">
                            <i className="bi bi-journal-text"></i>
                        </div>
                        <div>
                            <h2 className="mb-0">Changelog</h2>
                            <small className="text-muted">Historial de cambios del sistema</small>
                        </div>
                    </div>
                    <button
                        className="changelog-modal-close"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="changelog-modal-body">
                    <div className="changelog-current-version mb-4">
                        <div className="d-flex align-items-center">
                            <i className="bi bi-star-fill me-2"></i>
                            <span className="fw-bold">Versión Actual: {currentVersion}</span>
                        </div>
                    </div>

                    <div className="changelog-list">
                        {changelogs.map((entry, index) => (
                            <div key={entry.version} className="changelog-entry">
                                <div className="changelog-version-header">
                                    <div className="d-flex align-items-center">
                                        <span className="changelog-version-badge">
                                            v{entry.version}
                                        </span>
                                        <span className="changelog-date ms-3">
                                            <i className="bi bi-calendar3 me-1"></i>
                                            {new Date(entry.date).toLocaleDateString('es-AR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                        {index === 0 && (
                                            <span className="changelog-latest-badge ms-2">
                                                <i className="bi bi-check-circle-fill me-1"></i>
                                                Actual
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="changelog-changes">
                                    {entry.changes.map((change, changeIndex) => (
                                        <div
                                            key={changeIndex}
                                            className={`changelog-change-item ${getTypeColor(change.type)}`}
                                        >
                                            <div className="changelog-change-icon">
                                                <i className={change.icon || getTypeIcon(change.type)}></i>
                                            </div>
                                            <div className="changelog-change-content">
                                                <div className="changelog-change-header">
                                                    <span className="changelog-change-type">
                                                        <i className={`bi ${getTypeIcon(change.type)} me-1`}></i>
                                                        {getTypeLabel(change.type)}
                                                    </span>
                                                    <h5 className="changelog-change-title">{change.title}</h5>
                                                </div>
                                                <p className="changelog-change-description">{change.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="changelog-modal-footer">
                    <button
                        className="btn btn-primary glass-btn-primary"
                        onClick={onClose}
                    >
                        <i className="bi bi-check-circle me-2"></i>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChangelogModal;

