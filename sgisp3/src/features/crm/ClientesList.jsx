import React from "react";
import { useAbonados } from "../../hooks/useAbonados";
import DataList from "../../components/DataList";

export default function ClientesList() {
    const { data, loading, error } = useAbonados();

    if (loading) return <p>Cargando abonados...</p>;
    if (error) return <p>Error cargando abonados...</p>;

    // Verifica que sea un array
    if (!Array.isArray(data)) {
        console.error("El backend no devolvió un array:", data);
        return <p>Formato inesperado recibido del servidor.</p>;
    }

    return (
        <div className="container mt-3">
            <DataList
                data={data}
                itemsPerPage={10}
                titulo="Listado de Abonados"
            />
        </div>
    );
}