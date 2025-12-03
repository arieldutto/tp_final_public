import './clientscard.css'

function ClientsCard({ cliente }) {
    return (
        <>
            <div className="card shadow-sm  my-2 h-100   rounded-4 bg-transparent card-glow">

                <h5 className="card-header d-flex align-items-center bg-primary rounded-top-4 text-light">
                    <i className="bi bi-person me-2"></i>
                    {cliente.Razonsocial}
                </h5>

                <p className="card-text p-2 text-light">
                    <i className="bi bi-geo-alt me-2"></i>
                    {cliente.Domicilio} - {cliente.Localidad}
                </p>

                <p className="card-text p-2 text-light">
                    <i className="bi bi-telephone me-2"></i>
                    {cliente.Telefono || "Sin teléfono"}
                </p>

                <div className="p-2 d-flex">
                    <span className="badge bg-primary p-2 ">
                        Cliente #{cliente.NumeroCliente}
                    </span>
                </div>

            </div>
        </>
    );
}

export default ClientsCard;