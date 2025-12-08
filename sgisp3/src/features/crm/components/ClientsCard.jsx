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
        <>
            <div
                className="card shadow-sm my-2 h-100 rounded-4 bg-transparent card-glow"
                onDoubleClick={handleDoubleClick}
                style={{ cursor: "pointer" }}
            >
                {/* Encabezado de la tarjeta */}
                <h5 className="card-header d-flex align-items-center bg-primary rounded-top-4 text-light">
                    <i className="bi bi-person me-2"></i>
                    {cliente.Razonsocial}
                </h5>

                {/* Dirección */}
                <p className="card-text p-2 text-light">
                    <i className="bi bi-geo-alt me-2"></i>
                    {cliente.Domicilio} - {cliente.Localidad}
                </p>

                {/* Teléfono */}
                <p className="card-text p-2 text-light">
                    <i className="bi bi-telephone me-2"></i>
                    {cliente.Telefono || "Sin teléfono"}
                </p>

                {/* Número de cliente */}
                <div className="p-2 d-flex">
                    <span className="badge bg-primary p-2">
                        Cliente #{cliente.NumeroCliente}
                    </span>
                </div>

            </div>
        </>
    );
}

export default ClientsCard;