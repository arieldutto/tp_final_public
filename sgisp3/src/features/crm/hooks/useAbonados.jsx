import { useEffect, useState } from "react";
import { API_SGISP } from "../../../config";
export function useAbonados() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Orden deseado para las columnas
    const columnOrder = [
        "id",
        "NumeroCliente",
        "Razonsocial",
        "Domicilio",
        "Localidad",
        "Telefono",
        "Email",
        "DNI",
        "FechaAlta"
    ];

    useEffect(() => {
        fetch(`${API_SGISP}/abonados`)
            .then((res) => res.json())
            .then((json) => {
                // json es un array de objetos → ordenamos cada fila
                const ordered = json.map(row => {
                    const newRow = {};
                    columnOrder.forEach(col => {
                        newRow[col] = row[col] ?? null;
                    });
                    return newRow;
                });

                setData(ordered);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error cargando abonados:", err);
                setError(err);
                setLoading(false);
            });
    }, []);

    return { data, loading, error };
}