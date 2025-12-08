import { useEffect, useState } from "react";
import { API_SGISP } from "../../../config";

export function useClienteCompleto(id) {
    const [infocliente, setInfocliente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    console.log("numero de Id cliente recibido:", id);

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        setError(null);

        fetch(`${API_SGISP}/cliente_completo/${id}`)
            .then(res => res.json())
            .then(json => {
                if (json.error) {
                    setError(json.error);
                } else {
                    setInfocliente(json);
                }
            })
            .catch(err => {
                console.error("Error cargando cliente:", err);
                setError("Error de red o servidor");
            })
            .finally(() => setLoading(false));
    }, [id]);
    console.log("Hook useClienteCompleto loading:", loading, "Datos:", infocliente);
    return { infocliente, loading, error };
}