import './clientscard.css'

// Recibo el cliente y la función onOpen (antes era onDoubleClick)
function ClientsCard({ cliente, onOpen }) {

    // Manejo del doble click: acá obtengo la posición exacta donde está la tarjeta
    const handleDoubleClick = (e) => {
        console.log(
            "%c[ClientsCard] Datos enviados al abrir detalle:",
            "color: yellow; background:black; padding:4px",
            { id: cliente.id, numclient: cliente.NumeroCliente }
        );
        // Enviamos en onOpen el cliente.id 
        onOpen(cliente.id);
    };

    return (
        <div
            className="client-card glass-card"
            onDoubleClick={handleDoubleClick}
        >
            {/* Encabezado de la tarjeta con gradiente */}
            <div className="client-card-header">
                <div className="client-card-header-content">
                    <div className="client-card-icon">
                        <i className="bi bi-person-fill"></i>
                    </div>
                    <h5 className="client-card-title">{cliente.Razonsocial}</h5>
                </div>
            </div>

            {/* Cuerpo de la tarjeta */}
            <div className="client-card-body">
                {/* Dirección */}
                <div className="client-card-item">
                    <div className="client-card-item-icon">
                        <i className="bi bi-geo-alt-fill"></i>
                    </div>
                    <div className="client-card-item-content">
                        <span className="client-card-item-label">Dirección</span>
                        <span className="client-card-item-value">
                            {cliente.Domicilio} - {cliente.Localidad}
                        </span>
                    </div>
                </div>

                {/* Teléfono */}
                <div className="client-card-item">
                    <div className="client-card-item-icon">
                        <i className="bi bi-telephone-fill"></i>
                    </div>
                    <div className="client-card-item-content">
                        <span className="client-card-item-label">Teléfono</span>
                        <span className="client-card-item-value">
                            {cliente.Telefono || "Sin teléfono"}
                        </span>
                    </div>
                </div>

                {/* Número de cliente */}
                <div className="client-card-footer">
                    <span className="client-card-badge">
                        <i className="bi bi-hash me-1"></i>
                        Cliente #{cliente.NumeroCliente}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ClientsCard;