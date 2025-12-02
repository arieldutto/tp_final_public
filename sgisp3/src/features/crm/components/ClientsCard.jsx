function ClientsCard({ cliente }) {
    return (
        <div className="card shadow-sm p-3 my-2 h-100">

            <h5 className="card-title d-flex align-items-center">
                <i className="bi bi-person me-2"></i>
                {cliente.Razonsocial}
            </h5>

            <p className="card-text">
                <i className="bi bi-geo-alt me-2"></i>
                {cliente.Domicilio} - {cliente.Localidad}
            </p>

            <p className="card-text">
                <i className="bi bi-telephone me-2"></i>
                {cliente.Telefono || "Sin teléfono"}
            </p>

            <span className="badge bg-primary">
                Cliente #{cliente.NumeroCliente}
            </span>

        </div>
    );
}

export default ClientsCard;