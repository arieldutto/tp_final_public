import { useEffect, useState } from "react";
import { API_SGISP } from "../../../config";

export function useCliente(id) {
    const [cliente, setCliente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        if (!id) return;

        setLoading(true);
        setError(null);

        fetch(`${API_SGISP}/abonado/${id}`)
            .then(r => r.json())
            .then(data => {
                setCliente(data);
            })
            .catch(err => console.error("Error cargando cliente:", err))
            .finally(() => setLoading(false));
    }, [id]);
    console.log("Hook loading:", loading, "Datos:", cliente);
    return { cliente, loading };
}