
import React from 'react'

function AcercaDe() {
    return (
        <div className="card my-4 mx-auto w-75 rounded-4">
            <div className="card-header">
                Acerca de ...
            </div>
            <div className="card-body text-start">
                <h5 className="card-title">Sistema de Gestión de ISP</h5>

                <p className="lead">
                    SGISP (Sistema de Gestión Integral para Servicios de Proveedores de Internet) es una plataforma diseñada para el control, monitoreo y administración de equipos OLT y ONT dentro de una red GPON.
                </p>

                <p>
                    Permite a los técnicos y administradores gestionar de forma centralizada los abonados, las conexiones y el estado de la red, optimizando el tiempo de respuesta y reduciendo errores operativos. Su interfaz intuitiva y modular facilita la integración con sistemas existentes y el crecimiento escalable del ISP.
                </p>

                <hr />

                <h6 className="mt-3">Principales características</h6>

                <ul className="list-group list-group-flush mb-3">
                    <li className="list-group-item"><i className="bi bi-wifi me-2" aria-hidden></i>Gestión de OLT y ONT en tiempo real</li>
                    <li className="list-group-item"><i className="bi bi-people me-2" aria-hidden></i>Administración de abonados y perfiles de servicio</li>
                    <li className="list-group-item"><i className="bi bi-gear me-2" aria-hidden></i>Automatización de tareas de configuración y diagnóstico</li>
                    <li className="list-group-item"><i className="bi bi-speedometer2 me-2" aria-hidden></i>Dashboard con métricas y monitoreo en vivo</li>
                    <li className="list-group-item"><i className="bi bi-puzzle me-2" aria-hidden></i>Arquitectura modular, adaptable a distintos entornos</li>
                    <li className="list-group-item"><i className="bi bi-shield-lock me-2" aria-hidden></i>Control de accesos y registro de auditoría</li>
                    <li className="list-group-item"><i className="bi bi-globe me-2" aria-hidden></i>Interfaz web responsiva</li>
                </ul>

                <a href="/home" className="btn btn-primary">Ir a Home</a>
            </div>

            <div className="card-footer text-muted text-center">
                <a href='http://aadingenieria.com.ar'>Creado por AAD Ingeniería SRL</a>
            </div>
        </div>
    )
}

export default AcercaDe