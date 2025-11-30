import { useEffect, useState } from "react";

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
        "Telefono"
    ];

    useEffect(() => {
        fetch("http://10.80.6.2/sgisp_dev/api/abonados")
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