import { useState } from "react";
import { useAbonados } from "../hooks/useAbonados";
import ClientsCard from "../components/ClientsCard";

export default function AbonadosPage() {
    const { data, loading, error } = useAbonados();
    const [search, setSearch] = useState("");

    if (loading) return <p>Cargando clientes...</p>;
    if (error) return <p>Error al cargar los clientes</p>;

    // 🔍 filtro en tiempo real
    const filtrados = data.filter(c =>
        (c.Razonsocial + c.Domicilio + c.Localidad + c.Telefono)
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="container py-4 bg-opacity-25">

            <h2 className="mb-3 text-light">Clientes (CRM)</h2>

            <input
                type="text"
                className="form-control mb-3 rounded-4  bg-transparent bg-glass "
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="row bg-opacity-25">
                {filtrados.map((cliente) => (
                    <div key={cliente.id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                        <ClientsCard cliente={cliente} />
                    </div>
                ))}
            </div>

        </div>
    );
}