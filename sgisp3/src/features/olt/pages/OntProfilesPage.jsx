import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOntProfiles } from '../hooks/useOntProfiles';
import './ontprofiles.css';

function OntProfilesPage() {
    const { oltId } = useParams();
    const { lineprofiles, srvprofiles, loading, error } = useOntProfiles(oltId ? parseInt(oltId) : null);
    const [activeTab, setActiveTab] = useState('lineprofiles');

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="text-light">Cargando perfiles ONT...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
            </div>
        );
    }

    return (
        <div className="ont-profiles-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-light">
                    <i className="bi bi-gear me-2"></i>
                    Perfiles ONT - OLT {oltId}
                </h2>
                <a href="/olt" className="btn btn-secondary">
                    <i className="bi bi-arrow-left me-1"></i>
                    Volver a OLTs
                </a>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'lineprofiles' ? 'active' : ''}`}
                        onClick={() => setActiveTab('lineprofiles')}
                    >
                        <i className="bi bi-list-ul me-1"></i>
                        Lineprofiles ({lineprofiles.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'srvprofiles' ? 'active' : ''}`}
                        onClick={() => setActiveTab('srvprofiles')}
                    >
                        <i className="bi bi-list-ul me-1"></i>
                        Srvprofiles ({srvprofiles.length})
                    </button>
                </li>
            </ul>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'lineprofiles' && (
                    <div className="profiles-table-container">
                        <h5 className="text-light mb-3">Lineprofiles</h5>
                        {lineprofiles.length === 0 ? (
                            <div className="alert alert-info">
                                No hay lineprofiles configurados para esta OLT.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-dark table-hover">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Profile ID</th>
                                            <th>Nombre</th>
                                            <th>Comentario</th>
                                            <th>Tipo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lineprofiles.map((profile) => (
                                            <tr key={profile.id}>
                                                <td>{profile.id}</td>
                                                <td><code>{profile.profile_id}</code></td>
                                                <td>{profile.profile_name}</td>
                                                <td>{profile.profile_coment || '-'}</td>
                                                <td>
                                                    {profile.is_global ? (
                                                        <span className="badge bg-success">Global</span>
                                                    ) : (
                                                        <span className="badge bg-info">Específico</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'srvprofiles' && (
                    <div className="profiles-table-container">
                        <h5 className="text-light mb-3">Srvprofiles</h5>
                        {srvprofiles.length === 0 ? (
                            <div className="alert alert-info">
                                No hay srvprofiles configurados para esta OLT.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-dark table-hover">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Profile ID</th>
                                            <th>Nombre</th>
                                            <th>Comentario</th>
                                            <th>Tipo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {srvprofiles.map((profile) => (
                                            <tr key={profile.id}>
                                                <td>{profile.id}</td>
                                                <td><code>{profile.profile_id}</code></td>
                                                <td>{profile.profile_name}</td>
                                                <td>{profile.profile_coment || '-'}</td>
                                                <td>
                                                    {profile.is_global ? (
                                                        <span className="badge bg-success">Global</span>
                                                    ) : (
                                                        <span className="badge bg-info">Específico</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OntProfilesPage;

