import React from 'react'

function clientInfo({ datos, idCliente }) {
    if (!datos) return <p>No hay datos de cliente para mostrar.</p>;
    return (
        <div>
            <h4 className="mb-3">{datos?.Razonsocial}</h4>
            <p><strong>ID:</strong> {idCliente}</p>
            <p><strong>Número de Cliente:</strong> {datos?.NumeroCliente}</p>
            <p><strong>Domicilio:</strong> {datos?.Domicilio}</p>
            <p><strong>Localidad:</strong> {datos?.Localidad}</p>
            <p><strong>Teléfono:</strong> {datos?.Telefono}</p>
            {/* Aquí podrías agregar lógica o estados para la edición de esta info */}
        </div>
    )
}

export default clientInfo